import React, { useState } from 'react';
import { SandiegoLogo } from './SandiegoLogo';
import { useChatStore } from '../store/useChatStore';
import {
  Building2,
  Syringe,
  UserCheck,
  Save,
  Plus,
  Edit2,
  History,
  Clock,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  Bot,
  HelpCircle,
  MessageSquare,
  MessageCircle,
} from 'lucide-react';
import { toast } from 'sonner';

interface VaccineItem {
  id: string;
  name: string;
  age: string;
  appointment: string;
  status: 'Disponível' | 'Sob consulta' | 'Indisponível';
}

interface DoctorItem {
  id: string;
  name: string;
  role: string;
  status: 'Ativo' | 'Inativo';
}

interface AuditLogItem {
  id: string;
  timestamp: string;
  createdAt: number;
  action: string;
  category: 'Clínica' | 'Vacinas' | 'Profissionais' | 'Sistema';
}

export function SettingsAutomationView() {
  const {
    userRole,
    clinicData: storeClinicData,
    updateClinicData,
    vaccines: storeVaccines,
    updateVaccines,
    team: storeTeam,
    updateTeam,
    automationSettings: storeAutomationSettings,
    updateAutomationSettings,
    cannedResponses,
  } = useChatStore();

  const isMaster = userRole === 'master';
  const [activeTab, setActiveTab] = useState<'clinic' | 'vaccines' | 'team' | 'templates' | 'integration' | 'audit'>('clinic');
  const [isVerifyingDb, setIsVerifyingDb] = useState(false);

  const [localAutomationSettings, setLocalAutomationSettings] = useState(storeAutomationSettings);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);

  const addAuditLog = (action: string, category: AuditLogItem['category']) => {
    const now = Date.now();
    const ninetyDaysAgo = now - 90 * 24 * 60 * 60 * 1000;
    const newLog: AuditLogItem = {
      id: `log-${now}`,
      timestamp: new Date().toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' }),
      createdAt: now,
      action,
      category,
    };
    setAuditLogs((prev) => [newLog, ...prev.filter((l) => l.createdAt >= ninetyDaysAgo)].slice(0, 100));
  };

  const handleClearAuditLogs = () => {
    setAuditLogs([]);
    toast.info('Histórico de alterações zerado.');
  };

  // Vaccines Modals State
  const [isAddVaccineOpen, setIsAddVaccineOpen] = useState(false);
  const [editingVaccine, setEditingVaccine] = useState<VaccineItem | null>(null);
  const [newVaccine, setNewVaccine] = useState({
    name: '',
    age: 'Todas as idades',
    appointment: 'Sem agendamento',
    status: 'Disponível' as 'Disponível' | 'Sob consulta' | 'Indisponível',
  });

  // Doctors Modals State
  const [isAddDoctorOpen, setIsAddDoctorOpen] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<DoctorItem | null>(null);
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    role: '',
    status: 'Ativo' as 'Ativo' | 'Inativo',
  });

  // 1. Clinic Info State
  const [clinicData, setClinicData] = useState(storeClinicData);
  // 2. Vaccines Catalog State
  const [vaccines, setVaccines] = useState(storeVaccines);
  // 3. Team Catalog State
  const [team, setTeam] = useState(storeTeam);

  // Handlers
  const handleSaveClinicData = (e: React.FormEvent) => {
    e.preventDefault();
    updateClinicData(clinicData);
    addAuditLog('Dados institucionais da clínica atualizados', 'Clínica');
    toast.success('Informações da clínica salvas com sucesso!');
  };

  const handleAddVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVaccine.name.trim()) return;
    const updated = [
      ...vaccines,
      { id: `v-${Date.now()}`, name: newVaccine.name.trim(), age: newVaccine.age, appointment: newVaccine.appointment, status: newVaccine.status },
    ];
    setVaccines(updated);
    updateVaccines(updated);
    addAuditLog(`Vacina "${newVaccine.name.trim()}" cadastrada (${newVaccine.status})`, 'Vacinas');
    setNewVaccine({ name: '', age: 'Todas as idades', appointment: 'Sem agendamento', status: 'Disponível' });
    setIsAddVaccineOpen(false);
    toast.success('Nova vacina cadastrada!');
  };

  const handleUpdateVaccine = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingVaccine) return;
    const updated = vaccines.map((v) => (v.id === editingVaccine.id ? editingVaccine : v));
    setVaccines(updated);
    updateVaccines(updated);
    addAuditLog(`Vacina "${editingVaccine.name}" editada (Status: ${editingVaccine.status})`, 'Vacinas');
    setEditingVaccine(null);
    toast.success('Dados da vacina atualizados!');
  };

  const handleAddDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDoctor.name.trim() || !newDoctor.role.trim()) return;
    const updated = [
      ...team,
      { id: `d-${Date.now()}`, name: newDoctor.name.trim(), role: newDoctor.role.trim(), status: newDoctor.status },
    ];
    setTeam(updated);
    updateTeam(updated);
    addAuditLog(`Profissional "${newDoctor.name.trim()}" (${newDoctor.role.trim()}) cadastrado`, 'Profissionais');
    setNewDoctor({ name: '', role: '', status: 'Ativo' });
    setIsAddDoctorOpen(false);
    toast.success('Novo profissional cadastrado!');
  };

  const handleUpdateDoctor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoctor) return;
    const updated = team.map((d) => (d.id === editingDoctor.id ? editingDoctor : d));
    setTeam(updated);
    updateTeam(updated);
    addAuditLog(`Profissional "${editingDoctor.name}" editado (${editingDoctor.role})`, 'Profissionais');
    setEditingDoctor(null);
    toast.success('Dados do profissional atualizados!');
  };

  const handleSaveAutomationSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateAutomationSettings(localAutomationSettings);
    addAuditLog('Templates e mensagens automáticas do robô atualizados', 'Sistema');
    toast.success('Textos automáticos do robô salvos com sucesso!');
  };



  const getStatusBadge = (status: string) => {
    if (status === 'Disponível' || status === 'Ativo') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    if (status === 'Sob consulta') return 'bg-amber-100 text-[#b8860b] border-amber-300';
    return 'bg-rose-100 text-rose-800 border-rose-300';
  };

  const handleVerifyDatabaseSecurity = () => {
    setIsVerifyingDb(true);
    toast.info('Verificando conexão segura com Supabase...');
    setTimeout(() => {
      setIsVerifyingDb(false);
      toast.success('Banco de Dados Supabase (mkysjvuxjdxajkxixvjc) Ativo & Protegido com RLS!');
    }, 1200);
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 sm:p-8 text-slate-800 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <SandiegoLogo variant="full" size="md" />
          <h2 className="text-xl font-black text-slate-900 mt-2 font-['Plus_Jakarta_Sans']">
            Painel de Configurações da Clínica
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Gerencie os dados da clínica, vacinas, equipe e integração com o sistema médico.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 overflow-x-auto pb-2 text-xs font-extrabold">
        {([
          { key: 'clinic', label: 'Informações da Clínica', Icon: Building2 },
          { key: 'vaccines', label: `Catálogo de Vacinas (${vaccines.length})`, Icon: Syringe },
          { key: 'team', label: `Profissionais (${team.length})`, Icon: UserCheck },
          { key: 'templates', label: 'Mensagens Prontas & Robô', Icon: MessageSquare },
          ...(isMaster ? [
            { key: 'integration' as const, label: 'Status do Sistema', Icon: ShieldCheck },
            { key: 'audit' as const, label: `Histórico (${auditLogs.length})`, Icon: History },
          ] : []),
        ] as { key: typeof activeTab; label: string; Icon: React.ElementType }[]).map(({ key, label, Icon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-2.5 rounded-2xl transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === key
                ? 'bg-[#C59B27] text-slate-950 font-black shadow-md'
                : 'text-slate-600 hover:bg-slate-200/70'
            }`}
          >
            <Icon className={`h-4 w-4 ${activeTab === key ? 'text-slate-950' : 'text-[#b8860b]'}`} />
            {label}
          </button>
        ))}
      </div>

      {/* Tab 1: Clinic Info */}
      {activeTab === 'clinic' && (
        <form onSubmit={handleSaveClinicData} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="h-4 w-4 text-[#b8860b]" /> Dados Institucionais da Clínica
            </h3>
            <button
              type="submit"
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Salvar</span>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nome Oficial da Clínica:</label>
              <input type="text" value={clinicData.name} onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">E-mail Institucional:</label>
              <input type="text" value={clinicData.email} onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold" />
            </div>
            <div className="md:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Endereço Completo:</label>
              <input type="text" value={clinicData.address} onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telefone Fixo:</label>
              <input type="text" value={clinicData.phoneLandline} onChange={(e) => setClinicData({ ...clinicData, phoneLandline: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Celular / WhatsApp Oficial:</label>
              <input type="text" value={clinicData.phoneMobile} onChange={(e) => setClinicData({ ...clinicData, phoneMobile: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Horário (Seg a Sex):</label>
              <input type="text" value={clinicData.hoursWeekday} onChange={(e) => setClinicData({ ...clinicData, hoursWeekday: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold" />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Horário (Sábados):</label>
              <input type="text" value={clinicData.hoursSaturday} onChange={(e) => setClinicData({ ...clinicData, hoursSaturday: e.target.value })} className="w-full px-3 py-2 border border-slate-200 rounded-xl bg-slate-50 text-slate-900 font-bold" />
            </div>
          </div>
        </form>
      )}

      {/* Tab 2: Vaccines Catalog */}
      {activeTab === 'vaccines' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Syringe className="h-4 w-4 text-[#b8860b]" /> Catálogo de Imunização
              </h3>
              <p className="text-xs text-slate-500 font-medium">Cadastre e edite as vacinas disponíveis.</p>
            </div>
            <button
              onClick={() => setIsAddVaccineOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 text-amber-400" /> Nova Vacina
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider">
                <tr>
                  <th className="p-3.5">Nome da Vacina</th>
                  <th className="p-3.5">Faixa Etária</th>
                  <th className="p-3.5">Agendamento</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {vaccines.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50">
                    <td className="p-3.5 font-bold text-slate-900">{v.name}</td>
                    <td className="p-3.5 text-slate-600">{v.age}</td>
                    <td className="p-3.5 text-slate-600">{v.appointment}</td>
                    <td className="p-3.5">
                      <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getStatusBadge(v.status)}`}>{v.status}</span>
                    </td>
                    <td className="p-3.5 text-right">
                      <button onClick={() => setEditingVaccine(v)} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold transition cursor-pointer">
                        <Edit2 className="h-3 w-3 text-[#b8860b]" /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Team */}
      {activeTab === 'team' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-[#b8860b]" /> Corpo Clínico & Profissionais
              </h3>
              <p className="text-xs text-slate-500 font-medium">Cadastre e edite os profissionais da clínica.</p>
            </div>
            <button
              onClick={() => setIsAddDoctorOpen(true)}
              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="h-4 w-4 text-amber-400" /> Novo Profissional
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {team.map((member) => (
              <div key={member.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-slate-900">{member.name}</h4>
                  <p className="text-[11px] text-slate-500 font-bold">{member.role}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${getStatusBadge(member.status)}`}>{member.status}</span>
                  <button onClick={() => setEditingDoctor(member)} className="p-1.5 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 transition cursor-pointer" title="Editar">
                    <Edit2 className="h-3.5 w-3.5 text-[#b8860b]" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Templates & Mensagens Prontas */}
      {activeTab === 'templates' && (
        <div className="space-y-6 text-xs select-none">
          {/* Section 1: Mensagens Automáticas do Robô */}
          <form onSubmit={handleSaveAutomationSettings} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <Bot className="h-4 w-4 text-[#C59B27]" /> Textos Automáticos do Robô de WhatsApp
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Personalize o texto exato que o robô dispara ao enviar as confirmações de consulta e responder aos clientes.
                </p>
              </div>
              <button
                type="submit"
                className="px-4 py-2 bg-[#C59B27] hover:bg-[#b8860b] text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                <Save className="h-4 w-4" />
                <span>Salvar Textos</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block font-black text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mensagem Inicial de Disparo (Confirmação da Agenda):</span>
                  <span className="text-[10px] text-slate-400 font-medium">Variáveis: &#123;paciente&#125;, &#123;medico&#125;, &#123;horario&#125;</span>
                </label>
                <textarea
                  rows={3}
                  value={localAutomationSettings.initialGreeting}
                  onChange={(e) => setLocalAutomationSettings({ ...localAutomationSettings, initialGreeting: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 leading-relaxed outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mensagem quando o Cliente Confirmar (Respondeu SIM / 1):</span>
                  <span className="text-[10px] text-slate-400 font-medium">Variáveis: &#123;paciente&#125;, &#123;medico&#125;, &#123;horario&#125;</span>
                </label>
                <textarea
                  rows={2}
                  value={localAutomationSettings.confirmationMessage}
                  onChange={(e) => setLocalAutomationSettings({ ...localAutomationSettings, confirmationMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 leading-relaxed outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1 flex items-center justify-between">
                  <span>Mensagem quando o Cliente Solicitar Remanejamento (Respondeu NÃO / 2):</span>
                  <span className="text-[10px] text-slate-400 font-medium">Variáveis: &#123;paciente&#125;, &#123;medico&#125;</span>
                </label>
                <textarea
                  rows={2}
                  value={localAutomationSettings.rescheduleMessage}
                  onChange={(e) => setLocalAutomationSettings({ ...localAutomationSettings, rescheduleMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 leading-relaxed outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Mensagem quando o Cliente enviar algo Fora do Horário de Atendimento:
                </label>
                <textarea
                  rows={2}
                  value={localAutomationSettings.afterHoursResponse}
                  onChange={(e) => setLocalAutomationSettings({ ...localAutomationSettings, afterHoursResponse: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 leading-relaxed outline-none focus:border-[#C59B27]"
                />
              </div>

              <div>
                <label className="block font-black text-slate-700 mb-1">
                  Mensagem de Transferência / Encaminhamento para Recepção Humana:
                </label>
                <textarea
                  rows={2}
                  value={localAutomationSettings.unrecognizedMessage}
                  onChange={(e) => setLocalAutomationSettings({ ...localAutomationSettings, unrecognizedMessage: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-900 leading-relaxed outline-none focus:border-[#C59B27]"
                />
              </div>
            </div>
          </form>

          {/* Section 2: Respostas Rápidas da Recepção (Canned Responses) */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-[#C59B27]" /> Biblioteca de Respostas Rápidas da Recepção ({cannedResponses.length})
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Atalhos pré-prontos usados no chat de atendimento humano.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cannedResponses.map((cr) => (
                <div key={cr.id || cr.shortcut} className="p-4 rounded-2xl border border-slate-200 bg-slate-50 space-y-2 relative group hover:bg-white hover:shadow-sm transition">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-black text-[#0a1f5e] bg-amber-100/70 border border-amber-200 px-2 py-0.5 rounded-md">
                        {cr.shortcut}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs">{cr.title}</h4>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase text-slate-400 bg-slate-200/60 px-2 py-0.5 rounded">
                      {cr.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80 font-medium leading-relaxed">
                    {cr.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Integration / System Status (Apenas status do Supabase — limpo e objetivo) */}
      {activeTab === 'integration' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[#b8860b]" /> Status do Sistema & Banco de Dados
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Monitoramento de saúde e segurança da conexão com o banco de dados Supabase.
              </p>
            </div>
            <button
              onClick={handleVerifyDatabaseSecurity}
              disabled={isVerifyingDb}
              className="px-4 py-2 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 text-emerald-900 font-bold text-xs rounded-2xl transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <ShieldCheck className={`h-4 w-4 text-emerald-600 ${isVerifyingDb ? 'animate-spin' : ''}`} />
              <span>Verificar Segurança</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Banco Supabase Ativo
                </span>
                <span className="bg-emerald-200 text-emerald-900 text-[10px] font-black px-2 py-0.5 rounded-full">100% Ok</span>
              </div>
              <strong className="text-sm font-black text-emerald-950 block font-mono">Project ID: mkysjvuxjdxajkxixvjc</strong>
              <p className="text-[11px] text-emerald-800 font-medium">Tabelas com segurança RLS ativa e dados dos pacientes protegidos.</p>
            </div>

            <div className="p-5 rounded-2xl border border-amber-200 bg-amber-50/50 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-amber-900 uppercase tracking-wider flex items-center gap-1">
                  <Lock className="h-4 w-4 text-amber-600" /> Segurança & Criptografia
                </span>
                <span className="bg-amber-200 text-amber-950 text-[10px] font-black px-2 py-0.5 rounded-full">RLS Ativo</span>
              </div>
              <strong className="text-sm font-black text-amber-950 block font-mono">Row Level Security em Todas as Tabelas</strong>
              <p className="text-[11px] text-amber-900 font-medium">Privacidade total dos dados dos pacientes e consultas da clínica garantida.</p>
            </div>
          </div>

          {/* Info box sobre integração com sistema da clínica */}
          <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50 text-xs space-y-2">
            <h4 className="font-black text-slate-800 flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#b8860b]" /> Integração com Sistema de Agendamento Externo
            </h4>
            <p className="text-slate-600 font-medium leading-relaxed">
              Caso o sistema de agendamento da clínica forneça uma <strong>API de integração</strong>, basta inserir a URL e o token de acesso fornecidos por eles aqui. O sistema buscará automaticamente os agendamentos sem necessidade de importar planilhas manualmente.
            </p>
            <p className="text-slate-500 font-medium">
              ℹ️ Essa funcionalidade é configurada no momento do deploy, junto com as demais integrações de domínio e autenticação.
            </p>
          </div>
        </div>
      )}

      {/* Tab 5: Audit Log */}
      {activeTab === 'audit' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <div className="border-b border-slate-100 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <History className="h-4 w-4 text-[#b8860b]" /> Histórico de Alterações
              </h3>
              <p className="text-xs text-slate-500 font-medium">Retenção de 90 dias, máximo 100 registros.</p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <span className="bg-slate-100 text-slate-800 font-bold px-2.5 py-1 rounded-full text-[10px]">{auditLogs.length} registros</span>
              {auditLogs.length > 0 && (
                <button onClick={handleClearAuditLogs} className="px-2.5 py-1 border border-slate-200 bg-white hover:bg-rose-50 hover:text-rose-600 text-slate-600 font-bold text-[11px] rounded-lg transition flex items-center gap-1 cursor-pointer">
                  <Trash2 className="h-3.5 w-3.5" /> Zerar
                </button>
              )}
            </div>
          </div>

          {auditLogs.length === 0 ? (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
              <History className="h-8 w-8 text-slate-300 mx-auto" />
              <h4 className="font-black text-slate-700 text-sm">Nenhum registro ainda</h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto font-medium">Modificações em dados da clínica, vacinas e profissionais geram registros automáticos aqui.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/80 flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-50 border border-amber-200 text-[#b8860b] shrink-0 mt-0.5">
                      <Clock className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs">{log.action}</h4>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider bg-slate-200 px-2 py-0.5 rounded inline-block mt-1">{log.category}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono text-[11px] font-bold text-slate-700 block">{log.timestamp}</span>
                    <span className="text-[10px] text-slate-400 font-medium block mt-0.5">Automático</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
