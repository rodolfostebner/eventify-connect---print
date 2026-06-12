import { useState, useEffect } from "react";
import {
  Search,
  Trash2,
  Loader2,
  Download,
  Mail,
  Phone,
  Calendar,
  Filter,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";
import {
  getContactLeads,
  updateContactLeadStatus,
  deleteContactLead,
  type ContactLead,
} from "../../../services/contactLeadService";

const STATUS_LABELS = {
  new: "Novo",
  contacted: "Contatado",
  closed: "Concluído",
} as const;

const STATUS_CLASSES = {
  new: "bg-blue-100 text-blue-700 hover:bg-blue-200",
  contacted: "bg-amber-100 text-amber-700 hover:bg-amber-200",
  closed: "bg-green-100 text-green-700 hover:bg-green-200",
} as const;

export function formatPhoneNumber(phone: string) {
  const clean = phone.replace(/\D/g, "");
  if (clean.length === 11) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 7)}-${clean.slice(7)}`;
  }
  if (clean.length === 10) {
    return `(${clean.slice(0, 2)}) ${clean.slice(2, 6)}-${clean.slice(6)}`;
  }
  return phone;
}

export function ContactLeadsPanel({ onLeadsChange }: { onLeadsChange?: () => void }) {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      const data = await getContactLeads();
      setLeads(data);
    } catch (err) {
      console.error(err);
      toast.error("Erro ao carregar leads da landing page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleStatusChange = async (
    id: string,
    newStatus: "new" | "contacted" | "closed",
  ) => {
    setUpdatingId(id);
    try {
      await updateContactLeadStatus(id, newStatus);
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === id ? { ...lead, status: newStatus } : lead,
        ),
      );
      toast.success("Status do lead atualizado!");
      onLeadsChange?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao atualizar status do lead.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (
      !confirm(
        `Deseja realmente excluir o lead de "${name}"? Esta ação não pode ser desfeita.`,
      )
    ) {
      return;
    }
    try {
      await deleteContactLead(id);
      setLeads((prev) => prev.filter((lead) => lead.id !== id));
      toast.success("Lead excluído com sucesso.");
      onLeadsChange?.();
    } catch (err) {
      console.error(err);
      toast.error("Erro ao excluir lead.");
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
  };

  // Filter logic
  const filteredLeads = leads.filter((lead) => {
    // Text search (name, email, event name)
    const matchesSearch =
      lead.name.toLowerCase().includes(search.toLowerCase()) ||
      lead.email.toLowerCase().includes(search.toLowerCase()) ||
      lead.event_name.toLowerCase().includes(search.toLowerCase());

    // Status filter
    const matchesStatus =
      statusFilter === "all" || lead.status === statusFilter;

    // Date filter
    let matchesDate = true;
    if (startDate || endDate) {
      const leadDate = new Date(lead.created_at);
      leadDate.setHours(0, 0, 0, 0);

      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        if (leadDate < start) matchesDate = false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        if (leadDate > end) matchesDate = false;
      }
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLeads.length === 0) return;
    const BOM = "\uFEFF"; // For Excel compatibility with UTF-8 Portuguese characters
    const headers = [
      "Nome",
      "E-mail",
      "Telefone",
      "Evento de Interesse",
      "Status",
      "Data de Envio",
    ];
    const rows = filteredLeads.map((l) => [
      l.name,
      l.email,
      l.phone,
      l.event_name,
      STATUS_LABELS[l.status] || l.status,
      new Date(l.created_at).toLocaleString("pt-BR"),
    ]);

    const csvContent =
      BOM +
      [headers, ...rows]
        .map((row) =>
          row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(";"),
        )
        .join("\r\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `leads_landing_page_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Metrics & Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-neutral-900">
            Interessados da Landing Page do App.
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            {filteredLeads.length} de {leads.length} interessado
            {leads.length !== 1 ? "s" : ""} encontrado
            {leads.length !== 1 ? "s" : ""}
          </p>
        </div>
        {filteredLeads.length > 0 && (
          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 text-white text-xs font-bold transition-colors shadow-sm self-start sm:self-auto"
          >
            <Download className="w-4 h-4" /> Exportar Excel
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-neutral-100 rounded-3xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 pb-2 border-b border-neutral-50">
          <Filter className="w-4 h-4 text-neutral-400" />
          <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
            Filtros Avançados
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Pesquisar por nome, email, evento..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            />
          </div>

          {/* Status selector */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20 appearance-none cursor-pointer"
            >
              <option value="all">Todos os Status</option>
              <option value="new">Novo</option>
              <option value="contacted">Contatado</option>
              <option value="closed">Concluído</option>
            </select>
            <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          {/* Start Date */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-neutral-400 min-w-[24px]">
              De
            </span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            />
          </div>

          {/* End Date */}
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-neutral-400 min-w-[24px]">
              Até
            </span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900/20"
            />
          </div>
        </div>

        {(search || statusFilter !== "all" || startDate || endDate) && (
          <div className="flex justify-end pt-2">
            <button
              onClick={handleClearFilters}
              className="flex items-center gap-1 text-[11px] font-bold text-neutral-400 hover:text-neutral-900 transition-colors"
            >
              <X className="w-3.5 h-3.5" /> Limpar Filtros
            </button>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col justify-center items-center py-20 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-neutral-300" />
          <p className="text-xs text-neutral-400 font-medium">
            Carregando leads...
          </p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm">
          <FileText className="w-12 h-12 mx-auto text-neutral-300 mb-4 opacity-50" />
          <p className="text-base font-bold text-neutral-900">
            Nenhum lead encontrado
          </p>
          <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
            {leads.length === 0
              ? "Ainda não foram registrados leads pelo formulário de contato da Landing Page."
              : "Nenhum lead corresponde aos filtros aplicados. Tente ajustar os parâmetros."}
          </p>
          {(search || statusFilter !== "all" || startDate || endDate) && (
            <button
              onClick={handleClearFilters}
              className="mt-4 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all"
            >
              Limpar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="bg-white border border-neutral-100 rounded-3xl shadow-sm overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 text-[10px] uppercase text-neutral-400 font-bold tracking-wider border-b border-neutral-100">
                <tr>
                  <th className="px-6 py-4">Nome</th>
                  <th className="px-6 py-4">Contato</th>
                  <th className="px-6 py-4">Evento de Interesse</th>
                  <th className="px-6 py-4">Data de Envio</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-neutral-50/50 transition-colors"
                  >
                    {/* Name */}
                    <td className="px-6 py-4">
                      <p className="font-bold text-neutral-900 text-sm">
                        {lead.name}
                      </p>
                    </td>

                    {/* Contact details */}
                    <td className="px-6 py-4 space-y-1">
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Mail className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{lead.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-600">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span>{formatPhoneNumber(lead.phone)}</span>
                      </div>
                    </td>

                    {/* Event Name */}
                    <td className="px-6 py-4 font-semibold text-neutral-700">
                      {lead.event_name}
                    </td>

                    {/* Created date */}
                    <td className="px-6 py-4 text-neutral-500 tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                        <span>
                          {new Date(lead.created_at).toLocaleString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>

                    {/* Status dropdown */}
                    <td className="px-6 py-4">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) =>
                          handleStatusChange(
                            lead.id,
                            e.target.value as "new" | "contacted" | "closed",
                          )
                        }
                        className={cn(
                          "text-[11px] font-bold px-3 py-1.5 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-50 transition-all font-outfit uppercase tracking-wider",
                          STATUS_CLASSES[lead.status],
                        )}
                      >
                        <option value="new">Novo</option>
                        <option value="contacted">Contatado</option>
                        <option value="closed">Concluído</option>
                      </select>
                    </td>

                    {/* Action delete */}
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(lead.id, lead.name)}
                        className="p-2 rounded-xl text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-all"
                        title="Excluir Lead"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card List View */}
          <div className="block md:hidden divide-y divide-neutral-100">
            {filteredLeads.map((lead) => (
              <div
                key={lead.id}
                className="p-5 hover:bg-neutral-50/50 transition-colors space-y-3.5"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-neutral-900 text-base leading-tight">
                      {lead.name}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1 font-semibold">
                      Evento: {lead.event_name}
                    </p>
                  </div>
                  <button
                    onClick={() => handleDelete(lead.id, lead.name)}
                    className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-neutral-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{lead.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>{formatPhoneNumber(lead.phone)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>
                      {new Date(lead.created_at).toLocaleString("pt-BR", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-between items-center border-t border-neutral-50">
                  <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">
                    Status:
                  </span>
                  <select
                    value={lead.status}
                    disabled={updatingId === lead.id}
                    onChange={(e) =>
                      handleStatusChange(
                        lead.id,
                        e.target.value as "new" | "contacted" | "closed",
                      )
                    }
                    className={cn(
                      "text-[10px] font-bold px-2.5 py-1 rounded-full border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-neutral-900/10 disabled:opacity-50 transition-all font-outfit uppercase tracking-wider",
                      STATUS_CLASSES[lead.status],
                    )}
                  >
                    <option value="new">Novo</option>
                    <option value="contacted">Contatado</option>
                    <option value="closed">Concluído</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
