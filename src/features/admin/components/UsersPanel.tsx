import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Mail, UserCheck, Clock, Search, ChevronDown, AlertCircle } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { AppUser, UserRole, UserEmailRole, EventData } from '../../../types';
import {
  listUsers,
  updateUserRole,
  deleteUser,
  listEmailRoles,
  addEmailRole,
  removeEmailRole,
} from '../../../services/userService';
import { getAllExhibitors } from '../../../services/exhibitorService';
import { useAuth } from '../../../hooks/useAuth';

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin Geral',
  event_admin: 'Admin de Evento',
  avaliador: 'Avaliador',
  expositor: 'Expositor',
  participant: 'Participante',
};

const ROLE_COLORS: Record<UserRole, string> = {
  admin: 'bg-red-100 text-red-700',
  event_admin: 'bg-blue-100 text-blue-700',
  avaliador: 'bg-purple-100 text-purple-700',
  expositor: 'bg-amber-100 text-amber-700',
  participant: 'bg-neutral-100 text-neutral-600',
};

interface UsersPanelProps {
  events: EventData[];
}

export function UsersPanel({ events }: UsersPanelProps) {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';
  const [users, setUsers] = useState<AppUser[]>([]);
  const [emailRoles, setEmailRoles] = useState<UserEmailRole[]>([]);
  const [exhibitorMap, setExhibitorMap] = useState<Map<string, string>>(new Map());
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');
  const [newEventId, setNewEventId] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);
  const [existingUser, setExistingUser] = useState<AppUser | null>(null);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('participant');
  const [editEventId, setEditEventId] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  const activeEvents = events.filter(e => e.status === 'pre' || e.status === 'live');

  // Auto-seleciona evento se houver apenas 1 ativo
  useEffect(() => {
    if (activeEvents.length === 1) {
      setNewEventId(activeEvents[0].id);
    }
  }, [events]);

  useEffect(() => {
    Promise.all([listUsers(), listEmailRoles(), getAllExhibitors()])
      .then(([u, er, exs]) => {
        setUsers(u);
        setEmailRoles(er);
        setExhibitorMap(new Map(exs.map(e => [e.id, e.name])));
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleAddEmailRole = async () => {
    const email = newEmail.trim().toLowerCase();
    if (!email) return;
    if (!newEventId) {
      toast.error('Selecione um evento antes de continuar.');
      return;
    }

    const found = users.find(u => u.email.toLowerCase() === email);
    if (found) {
      setExistingUser(found);
      setEditRole(found.role);
      setEditEventId(found.event_id ?? newEventId);
      return;
    }

    setAddingEmail(true);
    try {
      await addEmailRole({
        email,
        role: newRole,
        event_id: newEventId || null,
        exhibitor_id: null,
      });
      const updated = await listEmailRoles();
      setEmailRoles(updated);
      setNewEmail('');
      toast.success('E-mail cadastrado com sucesso!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao cadastrar e-mail.');
    } finally {
      setAddingEmail(false);
    }
  };

  const handleUpdateExistingUser = async () => {
    if (!existingUser) return;
    if (!editEventId) {
      toast.error('Selecione um evento antes de continuar.');
      return;
    }
    setSavingUser(true);
    try {
      await updateUserRole(existingUser.id, editRole, editEventId || null);
      setUsers(prev =>
        prev.map(u =>
          u.id === existingUser.id
            ? { ...u, role: editRole, event_id: editEventId || null }
            : u,
        ),
      );
      setExistingUser(null);
      setNewEmail('');
      toast.success('Perfil atualizado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setSavingUser(false);
    }
  };

  const handleRemoveEmailRole = async (email: string) => {
    try {
      await removeEmailRole(email);
      setEmailRoles((prev) => prev.filter((r) => r.email !== email));
      toast.success('Pré-cadastro removido.');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao remover pré-cadastro.');
    }
  };

  const startEditUser = (user: AppUser) => {
    setEditingUserId(user.id);
    setEditRole(user.role);
    // Mantém o evento do usuário; se não tiver e houver só 1 ativo, pré-seleciona
    setEditEventId(user.event_id ?? (activeEvents.length === 1 ? activeEvents[0].id : ''));
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const handleDeleteUser = async (u: AppUser) => {
    if (!confirm(`Excluir o usuário "${u.display_name ?? u.email}"? Esta ação não pode ser desfeita.`)) return;
    try {
      await deleteUser(u.id);
      setUsers(prev => prev.filter(x => x.id !== u.id));
      toast.success('Usuário excluído.');
    } catch {
      toast.error('Erro ao excluir usuário.');
    }
  };

  const saveUserRole = async (userId: string) => {
    if (!editEventId) {
      toast.error('Selecione um evento antes de salvar.');
      return;
    }
    setSavingUser(true);
    try {
      await updateUserRole(userId, editRole, editEventId || null);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, role: editRole, event_id: editEventId || null }
            : u,
        ),
      );
      setEditingUserId(null);
      toast.success('Perfil atualizado!');
    } catch (err) {
      console.error(err);
      toast.error('Erro ao atualizar perfil.');
    } finally {
      setSavingUser(false);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (showParticipants || u.role !== 'participant') &&
      (u.email.toLowerCase().includes(search.toLowerCase()) ||
        (u.display_name ?? '').toLowerCase().includes(search.toLowerCase())),
  );

  const eventName = (id: string | null) =>
    events.find((e) => e.id === id)?.name ?? id ?? '—';

  const eventSelector = (value: string, onChange: (v: string) => void, className: string) => (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={className}
    >
      <option value="">Selecionar evento... *</option>
      {activeEvents.map((ev) => (
        <option key={ev.id} value={ev.id}>{ev.name}</option>
      ))}
    </select>
  );

  return (
    <div className="space-y-10">
      {/* Pre-registration */}
      <section className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-50 flex items-center gap-3">
          <Mail className="w-5 h-5 text-neutral-400" />
          <div>
            <h2 className="text-sm font-bold">Pré-cadastros de Acesso</h2>
            <p className="text-[10px] text-neutral-400 mt-0.5">
              Cadastre um e-mail antes do primeiro login para atribuir um perfil automaticamente.
            </p>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Add form */}
          <div className="flex flex-wrap gap-3">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => { setNewEmail(e.target.value); setExistingUser(null); }}
              onKeyDown={(e) => e.key === 'Enter' && handleAddEmailRole()}
              placeholder="email@dominio.com"
              className="flex-1 min-w-[200px] bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            />
            <select
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserRole)}
              className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
            >
              {(Object.keys(ROLE_LABELS) as UserRole[])
                .filter((r) => r !== 'participant')
                .map((r) => (
                  <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                ))}
            </select>
            {eventSelector(
              newEventId,
              setNewEventId,
              cn(
                'bg-neutral-50 border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10',
                !newEventId ? 'border-red-200 text-red-400' : 'border-neutral-200',
              ),
            )}
            <button
              onClick={handleAddEmailRole}
              disabled={addingEmail || !newEmail.trim()}
              className="flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-bold rounded-xl hover:bg-neutral-700 disabled:opacity-50 transition-colors"
            >
              <Plus className="w-4 h-4" />
              {addingEmail ? 'Adicionando...' : 'Adicionar'}
            </button>
          </div>

          {/* Existing user found */}
          {existingUser && (
            <div className="border border-amber-200 bg-amber-50 rounded-xl p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-amber-800">Usuário já cadastrado</p>
                  <p className="text-xs text-amber-600 mt-0.5">
                    <span className="font-semibold">{existingUser.display_name ?? existingUser.email}</span>
                    {' '}já existe como{' '}
                    <span className={cn('font-bold px-1.5 py-0.5 rounded-full text-[10px]', ROLE_COLORS[existingUser.role])}>
                      {ROLE_LABELS[existingUser.role]}
                    </span>
                    . Selecione o novo perfil e evento para alterar.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                  className="bg-white border border-amber-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30"
                >
                  {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                    <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                  ))}
                </select>
                {eventSelector(
                  editEventId,
                  setEditEventId,
                  cn(
                    'bg-white border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/30',
                    !editEventId ? 'border-red-300 text-red-400' : 'border-amber-200',
                  ),
                )}
                <button
                  onClick={handleUpdateExistingUser}
                  disabled={savingUser || !editEventId}
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg disabled:opacity-50 transition-colors"
                >
                  {savingUser ? 'Salvando...' : 'Alterar perfil'}
                </button>
                <button
                  onClick={() => { setExistingUser(null); setNewEmail(''); }}
                  className="px-4 py-1.5 bg-white border border-amber-200 text-amber-700 text-sm font-bold rounded-lg hover:bg-amber-50 transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* List */}
          {emailRoles.length === 0 ? (
            <p className="text-center py-8 text-xs text-neutral-400">Nenhum pré-cadastro ainda.</p>
          ) : (
            <div className="space-y-2">
              {emailRoles.map((er) => (
                <div
                  key={er.email}
                  className="flex items-center justify-between gap-4 p-3 bg-neutral-50 rounded-xl border border-neutral-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Clock className="w-4 h-4 text-neutral-300 shrink-0" />
                    <span className="text-sm font-medium truncate">{er.email}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full', ROLE_COLORS[er.role])}>
                      {ROLE_LABELS[er.role]}
                    </span>
                    {er.event_id && (
                      <span className="text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                        {eventName(er.event_id)}
                      </span>
                    )}
                    <button
                      onClick={() => handleRemoveEmailRole(er.email)}
                      className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Registered users */}
      <section className="bg-white rounded-2xl border border-neutral-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-neutral-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <UserCheck className="w-5 h-5 text-neutral-400" />
            <div>
              <h2 className="text-sm font-bold">Usuários Cadastrados</h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">{filteredUsers.length} de {users.length} usuários</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowParticipants((v) => !v)}
              className={cn(
                'text-[10px] font-bold px-3 py-1.5 rounded-full border transition-colors',
                showParticipants
                  ? 'bg-neutral-900 text-white border-neutral-900'
                  : 'bg-neutral-50 text-neutral-500 border-neutral-200 hover:border-neutral-400',
              )}
            >
              {showParticipants ? 'Ocultar participantes' : 'Mostrar participantes'}
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-300" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome ou e-mail..."
                className="pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10 w-64"
              />
            </div>
          </div>
        </div>

        <div className="divide-y divide-neutral-50">
          {loadingUsers ? (
            <p className="text-center py-12 text-xs text-neutral-400">Carregando usuários...</p>
          ) : filteredUsers.length === 0 ? (
            <p className="text-center py-12 text-xs text-neutral-400">Nenhum usuário encontrado.</p>
          ) : (
            filteredUsers.map((u) => {
              const isEditing = editingUserId === u.id;
              return (
                <div key={u.id} className="flex items-center gap-4 px-6 py-4 hover:bg-neutral-50/60 transition-colors">
                  <img
                    src={
                      u.photo_url ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(u.display_name || u.email)}&background=random&size=80`
                    }
                    alt={u.display_name ?? u.email}
                    className="w-10 h-10 rounded-full border border-neutral-100 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{u.display_name ?? '—'}</p>
                    <p className="text-[10px] text-neutral-400 truncate">{u.email}</p>
                  </div>

                  {isEditing ? (
                    <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                      >
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                          <option key={r} value={r}>{ROLE_LABELS[r]}</option>
                        ))}
                      </select>
                      {eventSelector(
                        editEventId,
                        setEditEventId,
                        cn(
                          'bg-neutral-50 border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10',
                          !editEventId ? 'border-red-200 text-red-400' : 'border-neutral-200',
                        ),
                      )}
                      <button
                        onClick={() => saveUserRole(u.id)}
                        disabled={savingUser || !editEventId}
                        className="px-3 py-1.5 bg-neutral-900 text-white text-xs font-bold rounded-lg hover:bg-neutral-700 disabled:opacity-50 transition-colors"
                      >
                        {savingUser ? '...' : 'Salvar'}
                      </button>
                      <button
                        onClick={cancelEdit}
                        className="px-3 py-1.5 bg-neutral-100 text-neutral-600 text-xs font-bold rounded-lg hover:bg-neutral-200 transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 shrink-0">
                      {u.event_id && (
                        <span className="hidden sm:block text-[10px] text-neutral-400 bg-neutral-100 px-2 py-0.5 rounded-full">
                          {eventName(u.event_id)}
                        </span>
                      )}
                      {u.role === 'expositor' && u.exhibitor_id && (
                        <span className="hidden sm:block text-[10px] bg-amber-50 text-amber-600 px-2 py-0.5 rounded-full">
                          {exhibitorMap.get(u.exhibitor_id) ?? '—'}
                        </span>
                      )}
                      <span className={cn('text-[10px] font-bold px-2.5 py-1 rounded-full', ROLE_COLORS[u.role])}>
                        {ROLE_LABELS[u.role]}
                      </span>
                      <button
                        onClick={() => startEditUser(u)}
                        className="p-1.5 text-neutral-300 hover:text-neutral-700 transition-colors"
                        title="Editar perfil"
                      >
                        <ChevronDown className="w-4 h-4" />
                      </button>
                      {isAdmin && u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleDeleteUser(u)}
                          className="p-1.5 text-neutral-300 hover:text-red-500 transition-colors"
                          title="Excluir usuário"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
