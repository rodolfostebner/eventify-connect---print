import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, Trash2, Mail, UserCheck, Clock, Search, ChevronDown } from 'lucide-react';
import { cn } from '../../../lib/utils';
import type { AppUser, UserRole, UserEmailRole, EventData } from '../../../types';
import {
  listUsers,
  updateUserRole,
  listEmailRoles,
  addEmailRole,
  removeEmailRole,
} from '../../../services/userService';

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

const EVENT_SCOPED_ROLES: UserRole[] = ['event_admin', 'avaliador'];

interface UsersPanelProps {
  events: EventData[];
}

export function UsersPanel({ events }: UsersPanelProps) {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [emailRoles, setEmailRoles] = useState<UserEmailRole[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [search, setSearch] = useState('');
  const [showParticipants, setShowParticipants] = useState(false);

  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('admin');
  const [newEventId, setNewEventId] = useState('');
  const [addingEmail, setAddingEmail] = useState(false);

  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editRole, setEditRole] = useState<UserRole>('participant');
  const [editEventId, setEditEventId] = useState('');
  const [savingUser, setSavingUser] = useState(false);

  useEffect(() => {
    Promise.all([listUsers(), listEmailRoles()])
      .then(([u, er]) => {
        setUsers(u);
        setEmailRoles(er);
      })
      .catch(console.error)
      .finally(() => setLoadingUsers(false));
  }, []);

  const handleAddEmailRole = async () => {
    if (!newEmail.trim()) return;
    setAddingEmail(true);
    try {
      await addEmailRole({
        email: newEmail.trim().toLowerCase(),
        role: newRole,
        event_id: EVENT_SCOPED_ROLES.includes(newRole) ? newEventId || null : null,
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
    setEditEventId(user.event_id ?? '');
  };

  const cancelEdit = () => {
    setEditingUserId(null);
  };

  const saveUserRole = async (userId: string) => {
    setSavingUser(true);
    try {
      await updateUserRole(
        userId,
        editRole,
        EVENT_SCOPED_ROLES.includes(editRole) ? editEventId || null : null,
      );
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                role: editRole,
                event_id: EVENT_SCOPED_ROLES.includes(editRole) ? editEventId || null : null,
              }
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
              onChange={(e) => setNewEmail(e.target.value)}
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
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
            </select>
            {EVENT_SCOPED_ROLES.includes(newRole) && (
              <select
                value={newEventId}
                onChange={(e) => setNewEventId(e.target.value)}
                className="bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
              >
                <option value="">Selecionar evento...</option>
                {events.map((ev) => (
                  <option key={ev.id} value={ev.id}>
                    {ev.name}
                  </option>
                ))}
              </select>
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
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={editRole}
                        onChange={(e) => setEditRole(e.target.value as UserRole)}
                        className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                      >
                        {(Object.keys(ROLE_LABELS) as UserRole[]).map((r) => (
                          <option key={r} value={r}>
                            {ROLE_LABELS[r]}
                          </option>
                        ))}
                      </select>
                      {EVENT_SCOPED_ROLES.includes(editRole) && (
                        <select
                          value={editEventId}
                          onChange={(e) => setEditEventId(e.target.value)}
                          className="bg-neutral-50 border border-neutral-200 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-neutral-900/10"
                        >
                          <option value="">Sem evento</option>
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.name}
                            </option>
                          ))}
                        </select>
                      )}
                      <button
                        onClick={() => saveUserRole(u.id)}
                        disabled={savingUser}
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
