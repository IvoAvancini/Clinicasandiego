import { create } from 'zustand';
import { PatientConversation, InboxFilterTab, Message, ConfirmationStatus, AppointmentStatus, ConversationStatus, AutomationSettings, CannedResponse } from '../types/chatwoot';
import { processDeterministicReply, DEFAULT_AUTOMATION_SETTINGS } from '../lib/zeroTokenEngine';
import { postMessageToBackend, updateConversationStatusInBackend } from '../lib/apiClient';

export interface ClinicData {
  name: string;
  address: string;
  phoneLandline: string;
  phoneMobile: string;
  email: string;
  hoursWeekday: string;
  hoursSaturday: string;
}

export interface VaccineItem {
  id: string;
  name: string;
  age: string;
  appointment: string;
  status: 'Disponível' | 'Sob consulta' | 'Indisponível';
}

export interface DoctorItem {
  id: string;
  name: string;
  role: string;
  status: 'Ativo' | 'Inativo';
}

interface ChatStore {
  conversations: PatientConversation[];
  activeConversationId: string | null;
  activeFilterTab: InboxFilterTab;
  searchQuery: string;
  isBatchModalOpen: boolean;
  isSidebarCollapsed: boolean;
  isPatientDrawerOpen: boolean;
  isMobileChatOpen: boolean;

  // Auth
  isAuthenticated: boolean;
  userRole: 'clinic' | 'master' | null;
  userDisplayName: string;

  // Clinic Data (shared with bot)
  clinicData: ClinicData;
  vaccines: VaccineItem[];
  team: DoctorItem[];
  automationSettings: AutomationSettings;
  cannedResponses: CannedResponse[];

  // Actions
  login: (role: 'clinic' | 'master') => void;
  logout: () => void;
  updateClinicData: (data: ClinicData) => void;
  updateVaccines: (vaccines: VaccineItem[]) => void;
  updateTeam: (team: DoctorItem[]) => void;
  updateAutomationSettings: (settings: Partial<AutomationSettings>) => void;
  updateCannedResponses: (responses: CannedResponse[]) => void;
  setActiveConversationId: (id: string | null) => void;
  setActiveFilterTab: (tab: InboxFilterTab) => void;
  setSearchQuery: (query: string) => void;
  setIsBatchModalOpen: (open: boolean) => void;
  toggleSidebarCollapsed: () => void;
  togglePatientDrawer: () => void;
  setIsPatientDrawerOpen: (open: boolean) => void;
  setIsMobileChatOpen: (open: boolean) => void;

  sendMessage: (text: string) => void;
  simulatePatientReply: (text: string) => void;
  updateStatus: (conversationId: string, status: ConfirmationStatus) => void;
  updateNotes: (conversationId: string, notes: string) => void;
  triggerBatchConfirmations: () => void;
}

const INITIAL_CONVERSATIONS: PatientConversation[] = [
  {
    id: 'conv-1',
    patientName: 'Juliana Paes',
    patientPhone: '(11) 99887-6655',
    patientCpf: '341.892.018-44',
    doctorName: 'Dr. Ricardo Santos',
    specialty: 'Cardiologia',
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTime: '14:30',
    insurance: 'Unimed',
    conversationStatus: 'finalized',
    appointmentStatus: 'confirmed',
    status: 'confirmed',
    unreadCount: 0,
    unread: false,
    notes: 'Paciente prefere atendimento em sala térrea por ter dificuldade de locomoção.',
    lastActivity: '14:32',
    origin: 'Importação Excel',
    messages: [
      {
        id: 'm1',
        sender: 'system_bot',
        senderName: 'Sandiego',
        text: 'Olá, Juliana! A Clínica Sandiego está entrando em contato para confirmar sua consulta com Dr. Ricardo Santos, hoje às 14h30.\n\nResponda:\n1 — Confirmar consulta\n2 — Solicitar reagendamento',
        timestamp: '14:30',
      },
      {
        id: 'm2',
        sender: 'patient',
        text: 'Olá! Sim, vou sim! Já estou a caminho.',
        timestamp: '14:31',
        meta: { intentDetected: 'confirmation_yes' },
      },
      {
        id: 'm3',
        sender: 'system_bot',
        senderName: 'Sandiego',
        text: 'Consulta confirmada com sucesso! A Clínica Sandiego aguarda você hoje às 14h30 para sua consulta com Dr. Ricardo Santos.',
        timestamp: '14:31',
        meta: { statusChangedTo: 'confirmed' },
      },
      {
        id: 'm4',
        sender: 'system_event',
        text: 'Consulta confirmada pelo paciente às 14:31',
        timestamp: '14:31',
      },
    ],
  },
  {
    id: 'conv-2',
    patientName: 'Camila Pitanga',
    patientPhone: '(11) 99123-4567',
    patientCpf: '219.004.881-90',
    doctorName: 'Dra. Ana Paula',
    specialty: 'Ginecologia',
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTime: '15:15',
    insurance: 'Bradesco Saúde',
    conversationStatus: 'awaiting_clinic',
    appointmentStatus: 'reschedule_requested',
    status: 'reschedule_requested',
    unreadCount: 1,
    unread: true,
    notes: 'Solicitou remarcar para semana que vem.',
    lastActivity: '14:28',
    origin: 'Importação Excel',
    messages: [
      {
        id: 'm1',
        sender: 'system_bot',
        senderName: 'Sandiego',
        text: 'Olá, Camila! A Clínica Sandiego está entrando em contato para confirmar sua consulta com Dra. Ana Paula, hoje às 15h15.\n\nResponda:\n1 — Confirmar consulta\n2 — Solicitar reagendamento',
        timestamp: '14:20',
      },
      {
        id: 'm2',
        sender: 'patient',
        text: 'Oi, boa tarde. Tive um imprevisto no trabalho e não vou conseguir ir hoje. Preciso remarcar.',
        timestamp: '14:28',
        meta: { intentDetected: 'confirmation_no' },
      },
      {
        id: 'm3',
        sender: 'system_bot',
        senderName: 'Sandiego',
        text: 'Entendido, Camila. Registramos que você precisa remarcar sua consulta com Dra. Ana Paula. A equipe da Clínica Sandiego continuará o atendimento para encontrar um novo horário.',
        timestamp: '14:28',
        meta: { statusChangedTo: 'reschedule_requested' },
      },
      {
        id: 'm4',
        sender: 'system_event',
        text: 'Consulta marcada para reagendamento às 14:28',
        timestamp: '14:28',
      },
    ],
  },
  {
    id: 'conv-3',
    patientName: 'Marcos Paulo',
    patientPhone: '(11) 98765-4321',
    patientCpf: '109.482.771-02',
    doctorName: 'Setor de Imunização',
    specialty: 'Vacina Febre Amarela',
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTime: '16:00',
    insurance: 'Particular',
    conversationStatus: 'awaiting_patient',
    appointmentStatus: 'awaiting_confirmation',
    status: 'awaiting_confirmation',
    unreadCount: 0,
    unread: false,
    notes: 'Verificar carteira de vacinação anterior.',
    lastActivity: '14:00',
    origin: 'Importação Excel',
    messages: [
      {
        id: 'm1',
        sender: 'system_bot',
        senderName: 'Sandiego',
        text: 'Olá, Marcos! A Clínica Sandiego está entrando em contato para confirmar sua aplicação de Vacina Febre Amarela hoje às 16h00.\n\nResponda:\n1 — Confirmar consulta\n2 — Solicitar reagendamento',
        timestamp: '14:00',
      },
    ],
  },
  {
    id: 'conv-4',
    patientName: 'Mariana Ximenes',
    patientPhone: '(11) 97654-3210',
    patientCpf: '401.882.109-11',
    doctorName: 'Dra. Patricia Lima',
    specialty: 'Dermatologia',
    appointmentDate: new Date().toISOString().slice(0, 10),
    appointmentTime: '16:30',
    insurance: 'SulAmérica',
    conversationStatus: 'finalized',
    appointmentStatus: 'confirmed',
    status: 'confirmed',
    unreadCount: 0,
    unread: false,
    lastActivity: '13:50',
    origin: 'Importação Excel',
    messages: [
      {
        id: 'm1',
        sender: 'system_bot',
        senderName: 'Sandiego',
        text: 'Olá, Mariana! A Clínica Sandiego está entrando em contato para confirmar sua consulta com Dra. Patricia Lima hoje às 16h30.',
        timestamp: '13:45',
      },
      {
        id: 'm2',
        sender: 'patient',
        text: 'Com certeza! Tudo certo.',
        timestamp: '13:50',
      },
      {
        id: 'm3',
        sender: 'system_bot',
        senderName: 'Sandiego',
        text: 'Consulta confirmada com sucesso! A Clínica Sandiego aguarda você hoje às 16h30 para sua consulta com Dra. Patricia Lima.',
        timestamp: '13:50',
      },
    ],
  },
];

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: (() => {
    const saved = localStorage.getItem('sandiego_chatwoot_conversations_v9');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_CONVERSATIONS; }
    }
    return INITIAL_CONVERSATIONS;
  })(),
  activeConversationId: 'conv-2',
  activeFilterTab: 'awaiting_clinic',
  searchQuery: '',
  isBatchModalOpen: false,
  isSidebarCollapsed: false,
  isPatientDrawerOpen: false,
  isMobileChatOpen: false,

  // Auth — persisted in localStorage across F5
  isAuthenticated: (() => {
    try { return localStorage.getItem('sandiego_auth_session') === 'true'; } catch { return false; }
  })(),
  userRole: (() => {
    try {
      const savedRole = localStorage.getItem('sandiego_user_role');
      return (savedRole === 'master' || savedRole === 'clinic') ? savedRole : null;
    } catch { return null; }
  })(),
  userDisplayName: (() => {
    try { return localStorage.getItem('sandiego_user_name') || ''; } catch { return ''; }
  })(),

  // Clinic Data
  clinicData: {
    name: 'Clínica Médica Sandiego',
    address: 'Rua Tomé de Souza, nº 08, Centro',
    phoneLandline: '(73) 3261-9207',
    phoneMobile: '(73) 99184-5988',
    email: 'clinicamedicasandiegoba@gmail.com',
    hoursWeekday: 'Segunda a Sexta: 08:00 às 18:00',
    hoursSaturday: 'Sábado: 08:00 às 12:00',
  },
  vaccines: [
    { id: 'v1', name: 'BCG Infantil', status: 'Disponível', age: 'Recém-nascidos', appointment: 'Com agendamento' },
    { id: 'v2', name: 'Febre Amarela', status: 'Disponível', age: 'Acima de 9 meses', appointment: 'Sem agendamento' },
    { id: 'v3', name: 'Gripe Quadrivalente', status: 'Disponível', age: 'Todas as idades', appointment: 'Sem agendamento' },
    { id: 'v4', name: 'Hepatite A Adulto', status: 'Disponível', age: 'Adultos', appointment: 'Sem agendamento' },
    { id: 'v5', name: 'Hepatite A Infantil', status: 'Disponível', age: 'Infantil', appointment: 'Sem agendamento' },
    { id: 'v6', name: 'Herpes Zóster', status: 'Sob consulta', age: 'Acima de 50 anos', appointment: 'Com agendamento' },
    { id: 'v7', name: 'Hexavalente', status: 'Disponível', age: 'Infantil', appointment: 'Com agendamento' },
    { id: 'v8', name: 'HPV Quadrivalente', status: 'Disponível', age: '9 a 45 anos', appointment: 'Sem agendamento' },
    { id: 'v9', name: 'Meningocócica B', status: 'Disponível', age: 'Todas as idades', appointment: 'Com agendamento' },
    { id: 'v10', name: 'Pentavalente', status: 'Disponível', age: 'Infantil', appointment: 'Com agendamento' },
    { id: 'v11', name: 'Pneumocócica 13', status: 'Disponível', age: 'Todas as idades', appointment: 'Sem agendamento' },
    { id: 'v12', name: 'Rotavírus', status: 'Disponível', age: 'Infantil', appointment: 'Com agendamento' },
    { id: 'v13', name: 'Tetra Viral', status: 'Disponível', age: 'Infantil', appointment: 'Com agendamento' },
    { id: 'v14', name: 'Tríplice Bacteriana (DTPa)', status: 'Disponível', age: 'Gestantes e Adultos', appointment: 'Sem agendamento' },
    { id: 'v15', name: 'Tríplice Viral', status: 'Disponível', age: 'Todas as idades', appointment: 'Sem agendamento' },
    { id: 'v16', name: 'Varicela', status: 'Disponível', age: 'Todas as idades', appointment: 'Sem agendamento' },
  ],
  team: [
    { id: 'd1', name: 'Dr. Diego Santiago Granato', role: 'Alergia e Imunologia', status: 'Ativo' },
    { id: 'd2', name: 'Priscila Santiago Granato', role: 'Obstetrícia, Saúde e Imunização', status: 'Ativo' },
  ],
  automationSettings: DEFAULT_AUTOMATION_SETTINGS,
  cannedResponses: [
    { id: 'cr1', shortcut: '/saudacao', title: 'Saudação Oficial', category: 'Geral', content: 'Olá, {paciente}! A Clínica Sandiego — Clínica Médica e Vacinas está à disposição. Como podemos te ajudar hoje?' },
    { id: 'cr2', shortcut: '/agendamento', title: 'Informar Agendamento', category: 'Consultas', content: 'Sua consulta de {especialidade} com {medico} está agendada para {data} às {horario} na Clínica Sandiego.' },
    { id: 'cr3', shortcut: '/vacinas', title: 'Tabela de Vacinas', category: 'Vacinas', content: 'Contamos com vacinação completa: Febre Amarela, Gripe Quadrivalente, Tríplice Viral, HPV e Pneumocócica.' },
    { id: 'cr4', shortcut: '/convenios', title: 'Lista de Convênios', category: 'Geral', content: 'Convênios Aceitos: Unimed, Bradesco Saúde, SulAmérica, Amil, Porto Seguro e Atendimento Particular.' },
    { id: 'cr5', shortcut: '/endereco', title: 'Endereço e Estacionamento', category: 'Geral', content: 'Sandiego — Clínica Médica e Vacinas: Rua Tomé de Souza, nº 08, Centro.' },
    { id: 'cr6', shortcut: '/horarios', title: 'Horário de Funcionamento', category: 'Geral', content: 'Horário de Atendimento: Segunda a Sexta das 08:00 às 18:00 e Sábados das 08:00 às 12:00.' },
    { id: 'cr7', shortcut: '/documentos', title: 'Documentos Necessários', category: 'Exames', content: 'Documentos necessários: Documento oficial com foto (RG ou CNH) e a carteira física ou digital do seu convênio.' },
    { id: 'cr8', shortcut: '/preparo', title: 'Instruções de Preparo', category: 'Exames', content: 'Orientação de Preparo: Coletas de sangue exigem jejum de 8h a 12h. Exames de imagem exigem bexiga cheia.' },
    { id: 'cr9', shortcut: '/confirmacao', title: 'Confirmação Realizada', category: 'Consultas', content: 'Consulta confirmada com sucesso! A Clínica Sandiego aguarda você amanhã às {horario} para sua consulta com {medico}.' },
    { id: 'cr10', shortcut: '/reagendamento', title: 'Opções de Reagendamento', category: 'Consultas', content: 'Entendido, {paciente}. Registramos que você precisa remarcar sua consulta com {medico}. Quais dias ficam melhores para você?' },
    { id: 'cr11', shortcut: '/cancelamento', title: 'Política de Cancelamento', category: 'Consultas', content: 'Sua solicitação de cancelamento foi recebida com sucesso.' },
    { id: 'cr12', shortcut: '/aguarde', title: 'Aguarde Atendimento', category: 'Geral', content: 'Um momento que nossa recepção já vai dar continuidade ao seu atendimento!' },
  ],
  updateClinicData: (data) => set({ clinicData: data }),
  updateVaccines: (vaccines) => set({ vaccines }),
  updateTeam: (team) => set({ team }),
  updateAutomationSettings: (newSettings) =>
    set((state) => ({ automationSettings: { ...state.automationSettings, ...newSettings } })),
  updateCannedResponses: (cannedResponses) => set({ cannedResponses }),

  login: (role) => {
    const displayName = role === 'master' ? 'Master — Avancini' : 'Recepção Sandiego';
    try {
      localStorage.setItem('sandiego_auth_session', 'true');
      localStorage.setItem('sandiego_user_role', role);
      localStorage.setItem('sandiego_user_name', displayName);
    } catch (e) {
      console.error('Erro ao salvar sessão:', e);
    }
    set({ isAuthenticated: true, userRole: role, userDisplayName: displayName });
  },

  logout: () => {
    try {
      localStorage.removeItem('sandiego_auth_session');
      localStorage.removeItem('sandiego_user_role');
      localStorage.removeItem('sandiego_user_name');
    } catch (e) {
      console.error('Erro ao encerrar sessão:', e);
    }
    set({ isAuthenticated: false, userRole: null, userDisplayName: '' });
  },

  setActiveConversationId: (id) => {
    set((state) => ({
      activeConversationId: id,
      isMobileChatOpen: !!id,
      conversations: state.conversations.map((c) => (c.id === id ? { ...c, unreadCount: 0, unread: false } : c)),
    }));
  },

  setActiveFilterTab: (tab) => {
    const { conversations, activeConversationId } = get();

    // Filter conversations for the new tab
    const filtered = conversations.filter((c) => {
      if (tab === 'awaiting_clinic') return c.conversationStatus === 'awaiting_clinic';
      if (tab === 'awaiting_patient') return c.conversationStatus === 'awaiting_patient';
      if (tab === 'reschedule')
        return (
          c.appointmentStatus === 'reschedule_requested' ||
          c.appointmentStatus === 'reschedule_in_progress' ||
          c.followUpStatus === 'no_return'
        );
      return true; // 'all'
    });

    let newActiveId = activeConversationId;
    const isCurrentStillValid = filtered.some((c) => c.id === activeConversationId);

    if (!isCurrentStillValid) {
      newActiveId = filtered.length > 0 ? filtered[0].id : null;
    }

    set({
      activeFilterTab: tab,
      activeConversationId: newActiveId,
      isMobileChatOpen: !!newActiveId,
    });
  },

  setSearchQuery: (query) => set({ searchQuery: query }),
  setIsBatchModalOpen: (open) => set({ isBatchModalOpen: open }),
  toggleSidebarCollapsed: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  togglePatientDrawer: () => set((state) => ({ isPatientDrawerOpen: !state.isPatientDrawerOpen })),
  setIsPatientDrawerOpen: (open) => set({ isPatientDrawerOpen: open }),
  setIsMobileChatOpen: (open) => set({ isMobileChatOpen: open }),

  sendMessage: (text) => {
    const { activeConversationId, conversations } = get();
    if (!activeConversationId || !text.trim()) return;

    const newMsg: Message = {
      id: 'msg-' + Date.now(),
      sender: 'agent',
      senderName: 'Recepção',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = conversations.map((c) => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          conversationStatus: 'awaiting_patient' as ConversationStatus,
          messages: [...c.messages, newMsg],
          lastActivity: newMsg.timestamp,
        };
      }
      return c;
    });

    localStorage.setItem('sandiego_chatwoot_conversations_v9', JSON.stringify(updated));
    set({ conversations: updated });

    postMessageToBackend(activeConversationId, newMsg);
    updateConversationStatusInBackend(activeConversationId, { conversationStatus: 'awaiting_patient' });
  },

  simulatePatientReply: (text) => {
    const { activeConversationId, conversations } = get();
    if (!activeConversationId || !text.trim()) return;

    const targetConv = conversations.find((c) => c.id === activeConversationId);
    if (!targetConv) return;

    const patientMsg: Message = {
      id: 'p-msg-' + Date.now(),
      sender: 'patient',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
    };

    const evalResult = processDeterministicReply(
      text,
      targetConv.patientName,
      targetConv.doctorName,
      targetConv.specialty,
      targetConv.appointmentTime,
      targetConv.insurance,
      get().automationSettings
    );

    const botMsg: Message = {
      id: 'bot-msg-' + (Date.now() + 1),
      sender: 'system_bot',
      senderName: 'Sandiego',
      text: evalResult.botReplyText,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      meta: {
        intentDetected: evalResult.detectedIntent,
        statusChangedTo: evalResult.targetAppointmentStatus || targetConv.status,
      },
    };

    const newMessages: Message[] = [patientMsg, botMsg];

    if (evalResult.systemEventText) {
      newMessages.push({
        id: 'event-msg-' + (Date.now() + 2),
        sender: 'system_event',
        text: evalResult.systemEventText,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      });
    }

    const updatedAppointmentStatus = evalResult.targetAppointmentStatus || targetConv.appointmentStatus || targetConv.status;
    const updatedConversationStatus = evalResult.targetConversationStatus || 'awaiting_clinic';
    const isUnread = activeConversationId !== targetConv.id;

    const updated = conversations.map((c) => {
      if (c.id === activeConversationId) {
        return {
          ...c,
          status: updatedAppointmentStatus,
          appointmentStatus: updatedAppointmentStatus,
          conversationStatus: updatedConversationStatus,
          unreadCount: isUnread ? c.unreadCount + 1 : 0,
          unread: isUnread,
          messages: [...c.messages, ...newMessages],
          lastActivity: botMsg.timestamp,
        };
      }
      return c;
    });

    localStorage.setItem('sandiego_chatwoot_conversations_v9', JSON.stringify(updated));
    set({ conversations: updated });

    postMessageToBackend(activeConversationId, patientMsg);
    postMessageToBackend(activeConversationId, botMsg);
    updateConversationStatusInBackend(activeConversationId, {
      status: updatedAppointmentStatus,
      appointmentStatus: updatedAppointmentStatus,
      conversationStatus: updatedConversationStatus,
    });
  },

  updateStatus: (conversationId, status) => {
    const updated = get().conversations.map((c) => {
      if (c.id === conversationId) {
        const convStatus = status === 'confirmed' ? 'finalized' : c.conversationStatus;
        return { ...c, status, appointmentStatus: status, conversationStatus: convStatus };
      }
      return c;
    });
    localStorage.setItem('sandiego_chatwoot_conversations_v9', JSON.stringify(updated));
    set({ conversations: updated });

    updateConversationStatusInBackend(conversationId, { status, appointmentStatus: status });
  },

  updateNotes: (conversationId, notes) => {
    const updated = get().conversations.map((c) =>
      c.id === conversationId ? { ...c, notes } : c
    );
    localStorage.setItem('sandiego_chatwoot_conversations_v9', JSON.stringify(updated));
    set({ conversations: updated });
  },

  triggerBatchConfirmations: () => {
    const time = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const updated = get().conversations.map((c) => {
      if (c.status === 'awaiting_dispatch' || c.status === 'awaiting_patient') {
        const batchMsg: Message = {
          id: 'batch-' + Date.now() + '-' + c.id,
          sender: 'system_bot',
          senderName: 'Sandiego',
          text: `Olá, ${c.patientName.split(' ')[0]}! A Clínica Sandiego está entrando em contato para confirmar sua consulta com ${c.doctorName}, hoje às ${c.appointmentTime}.\n\nResponda:\n1 — Confirmar consulta\n2 — Solicitar reagendamento`,
          timestamp: time,
        };
        return {
          ...c,
          status: 'awaiting_patient' as ConfirmationStatus,
          appointmentStatus: 'awaiting_patient' as AppointmentStatus,
          conversationStatus: 'awaiting_patient' as ConversationStatus,
          messages: [...c.messages, batchMsg],
          lastActivity: time,
        };
      }
      return c;
    });

    localStorage.setItem('sandiego_chatwoot_conversations_v9', JSON.stringify(updated));
    set({ conversations: updated, isBatchModalOpen: false });
  },
}));
