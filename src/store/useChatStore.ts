import { create } from 'zustand';
import { PatientConversation, InboxFilterTab, Message, MessageSender, ConfirmationStatus, AppointmentStatus, ConversationStatus, AutomationSettings, CannedResponse } from '../types/chatwoot';
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
  updatePatientName: (conversationId: string, newName: string) => void;
  triggerBatchConfirmations: () => void;
  syncEvolutionChats: () => Promise<void>;
}

const INITIAL_CONVERSATIONS: PatientConversation[] = [];

export const useChatStore = create<ChatStore>((set, get) => ({
  conversations: (() => {
    const saved = localStorage.getItem('sandiego_chatwoot_conversations_v9');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.some(c => c.id === 'conv-1' || c.patientName === 'Juliana Paes')) {
          localStorage.removeItem('sandiego_chatwoot_conversations_v9');
          return [];
        }
        return parsed;
      } catch { return []; }
    }
    return [];
  })(),
  activeConversationId: null,
  activeFilterTab: 'all',
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

    const targetConv = conversations.find((c) => c.id === activeConversationId);

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

    if (targetConv) {
      const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'https://evolution-api-production-22b7.up.railway.app';
      const EVOLUTION_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '6944500e32d8c3a0b3fc5e9ef8ed7057648e00f30c05a8c4dc065c7a3387b271';
      const INSTANCE_NAME = 'Clinica Sandiego';
      const rawNumber = targetConv.patientPhone || targetConv.id;
      const cleanNumber = rawNumber.replace(/\D/g, '');
      if (cleanNumber) {
        fetch(`${EVOLUTION_URL}/message/sendText/${encodeURIComponent(INSTANCE_NAME)}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': EVOLUTION_KEY,
          },
          body: JSON.stringify({
            number: cleanNumber,
            text: text.trim(),
          }),
        }).catch((err) => console.error('[Evolution API] Erro ao enviar mensagem WhatsApp:', err));
      }
    }

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

  updatePatientName: (conversationId, newName) => {
    if (!newName.trim()) return;
    const cleanName = newName.trim();
    try {
      const savedCustom = localStorage.getItem('sandiego_custom_contact_names');
      const customNames = savedCustom ? JSON.parse(savedCustom) : {};
      customNames[conversationId] = cleanName;
      localStorage.setItem('sandiego_custom_contact_names', JSON.stringify(customNames));
    } catch { /* Storage error */ }

    const updated = get().conversations.map((c) =>
      c.id === conversationId ? { ...c, patientName: cleanName } : c
    );
    localStorage.setItem('sandiego_chatwoot_conversations_v9', JSON.stringify(updated));
    set({ conversations: updated });
  },

  syncEvolutionChats: async () => {
    try {
      const EVOLUTION_URL = import.meta.env.VITE_EVOLUTION_API_URL || 'https://evolution-api-production-22b7.up.railway.app';
      const EVOLUTION_KEY = import.meta.env.VITE_EVOLUTION_API_KEY || '6944500e32d8c3a0b3fc5e9ef8ed7057648e00f30c05a8c4dc065c7a3387b271';
      const INSTANCE_NAME = 'Clinica Sandiego';

      // Load custom contact names saved manually by user
      let customNames: Record<string, string> = {};
      try {
        const savedCustom = localStorage.getItem('sandiego_custom_contact_names');
        if (savedCustom) customNames = JSON.parse(savedCustom);
      } catch { /* Error loading custom names */ }

      // Fetch contacts map from Evolution API
      let contactsMap: Record<string, string> = {};
      try {
        const contactsRes = await fetch(`${EVOLUTION_URL}/chat/findContacts/${encodeURIComponent(INSTANCE_NAME)}`, {
          method: 'POST',
          headers: { apikey: EVOLUTION_KEY },
        });
        if (contactsRes.ok) {
          const contactsData = await contactsRes.json();
          if (Array.isArray(contactsData)) {
            contactsData.forEach((ct: any) => {
              if (ct.remoteJid) {
                const name = ct.pushName || ct.name || ct.verifiedName || ct.profileName;
                if (name && name.trim()) contactsMap[ct.remoteJid] = name.trim();
              }
            });
          }
        }
      } catch { /* Ignore contact fetch error */ }

      // Fetch messages history from Evolution API
      let recentMessagesMap: Record<string, Message[]> = {};
      try {
        const msgsRes = await fetch(`${EVOLUTION_URL}/chat/findMessages/${encodeURIComponent(INSTANCE_NAME)}`, {
          method: 'POST',
          headers: { apikey: EVOLUTION_KEY },
        });
        if (msgsRes.ok) {
          const msgsData = await msgsRes.json();
          const msgsList = Array.isArray(msgsData) ? msgsData : (msgsData?.messages?.records || msgsData?.records || []);
          if (Array.isArray(msgsList)) {
            msgsList.forEach((m: any) => {
              const remoteJid = m.key?.remoteJid || m.remoteJid;
              if (!remoteJid) return;
              if (!recentMessagesMap[remoteJid]) recentMessagesMap[remoteJid] = [];

              const fromMe = Boolean(m.key?.fromMe);
              const msgBody = m.message;
              let msgText = 'Mensagem';
              let audioUrl: string | undefined = undefined;
              let imageUrl: string | undefined = undefined;
              let mediaType: 'audio' | 'image' | 'text' = 'text';

              if (msgBody) {
                if (msgBody.audioMessage) {
                  mediaType = 'audio';
                  audioUrl = msgBody.audioMessage.url || msgBody.audioMessage.mediaUrl || msgBody.audioMessage.directPath || msgBody.base64;
                  msgText = '🎤 Mensagem de voz';
                } else if (msgBody.imageMessage) {
                  mediaType = 'image';
                  imageUrl = msgBody.imageMessage.url || msgBody.imageMessage.mediaUrl || msgBody.imageMessage.directPath || msgBody.base64;
                  msgText = msgBody.imageMessage.caption || '📷 Foto / Imagem';
                } else {
                  msgText = msgBody.conversation || msgBody.extendedTextMessage?.text || 'Mensagem';
                }
              }

              let tsStr = 'Hoje';
              if (m.messageTimestamp) {
                const tsSec = typeof m.messageTimestamp === 'number' ? m.messageTimestamp : m.messageTimestamp.low || Date.now() / 1000;
                tsStr = new Date(tsSec * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
              }

              recentMessagesMap[remoteJid].push({
                id: m.id || m.key?.id || `m-${Date.now()}`,
                sender: fromMe ? ('agent' as MessageSender) : ('patient' as MessageSender),
                senderName: fromMe ? 'Recepção' : (contactsMap[remoteJid] || 'Paciente'),
                text: msgText,
                timestamp: tsStr,
                audioUrl,
                imageUrl,
                mediaType,
              });
            });
          }
        }
      } catch { /* Ignore findMessages fetch error */ }

      const res = await fetch(`${EVOLUTION_URL}/chat/findChats/${encodeURIComponent(INSTANCE_NAME)}`, {
        method: 'POST',
        headers: { apikey: EVOLUTION_KEY },
      });

      if (!res.ok) return;
      const data = await res.json();
      if (!Array.isArray(data)) return;

      const currentConversations = get().conversations;

      const syncedConvs: (PatientConversation & { _rawTimestamp?: number })[] = data
        .filter((c: any) => c.remoteJid && !c.remoteJid.includes('@g.us') && !c.remoteJid.includes('@lid'))
        .map((c: any, index: number) => {
          const jid = c.remoteJid || c.id;
          const phoneClean = jid.replace(/\D/g, '');
          const formattedPhone = phoneClean ? `+${phoneClean}` : '';
          const pushName = customNames[jid] || contactsMap[jid] || c.pushName || c.name || (phoneClean ? `+${phoneClean}` : `Contato #${index + 1}`);

          const lastMsgObj = c.lastMessage;
          let msgText = 'Conversa iniciada';
          let fromMe = false;
          let timestampStr = 'Hoje';
          let audioUrl: string | undefined = undefined;
          let imageUrl: string | undefined = undefined;
          let mediaType: 'audio' | 'image' | 'text' = 'text';
          let rawTimestamp = 0;

          if (lastMsgObj) {
            fromMe = Boolean(lastMsgObj.key?.fromMe);
            const msgBody = lastMsgObj.message;
            if (msgBody) {
              if (msgBody.audioMessage) {
                mediaType = 'audio';
                audioUrl = msgBody.audioMessage.url || msgBody.audioMessage.mediaUrl || msgBody.audioMessage.directPath || msgBody.base64;
                msgText = '🎤 Mensagem de voz';
              } else if (msgBody.imageMessage) {
                mediaType = 'image';
                imageUrl = msgBody.imageMessage.url || msgBody.imageMessage.mediaUrl || msgBody.imageMessage.directPath || msgBody.base64;
                msgText = msgBody.imageMessage.caption || '📷 Foto / Imagem';
              } else {
                msgText = msgBody.conversation || msgBody.extendedTextMessage?.text || 'Mensagem';
              }
            }
            if (lastMsgObj.messageTimestamp) {
              const tsSec = typeof lastMsgObj.messageTimestamp === 'number' ? lastMsgObj.messageTimestamp : lastMsgObj.messageTimestamp.low || Date.now() / 1000;
              rawTimestamp = tsSec * 1000;
              timestampStr = new Date(tsSec * 1000).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }
          }

          if (!rawTimestamp && c.updatedAt) {
            rawTimestamp = new Date(c.updatedAt).getTime();
          }

          const existing = currentConversations.find(conv => conv.id === jid || conv.patientPhone?.replace(/\D/g, '') === phoneClean);
          const existingMsgs = existing?.messages || [];
          const lastMsgId = lastMsgObj?.id || `msg-${Date.now()}`;
          const hasLastMsg = existingMsgs.some(m => m.id === lastMsgId || m.text === msgText);

          const updatedMsgs: Message[] = hasLastMsg ? existingMsgs : [
            ...existingMsgs,
            {
              id: lastMsgId,
              sender: fromMe ? ('agent' as MessageSender) : ('patient' as MessageSender),
              senderName: fromMe ? 'Recepção' : pushName,
              text: msgText,
              timestamp: timestampStr,
              audioUrl,
              imageUrl,
              mediaType,
            }
          ];

          return {
            id: jid,
            patientName: pushName,
            patientPhone: formattedPhone,
            patientCpf: existing?.patientCpf || '',
            doctorName: existing?.doctorName || 'Atendimento Sandiego',
            specialty: existing?.specialty || 'Recepção',
            appointmentDate: existing?.appointmentDate || new Date().toISOString().slice(0, 10),
            appointmentTime: timestampStr,
            insurance: existing?.insurance || 'Particular',
            conversationStatus: c.unreadCount > 0 ? 'awaiting_clinic' : (existing?.conversationStatus || 'awaiting_patient'),
            appointmentStatus: existing?.appointmentStatus || 'awaiting_confirmation',
            status: existing?.status || 'awaiting_confirmation',
            unreadCount: c.unreadCount || 0,
            unread: Boolean(c.unreadCount),
            notes: existing?.notes || '',
            lastActivity: timestampStr,
            origin: 'WhatsApp',
            _rawTimestamp: rawTimestamp,
            messages: updatedMsgs.length > 0 ? updatedMsgs : [
              {
                id: `init-${Date.now()}`,
                sender: fromMe ? ('agent' as MessageSender) : ('patient' as MessageSender),
                senderName: fromMe ? 'Recepção' : pushName,
                text: msgText,
                timestamp: timestampStr,
                audioUrl,
                imageUrl,
                mediaType,
              }
            ],
          };
        });

      // Sort by newest timestamp first (chronological order)
      syncedConvs.sort((a, b) => (b._rawTimestamp || 0) - (a._rawTimestamp || 0));

      if (syncedConvs.length > 0) {
        const { activeConversationId } = get();
        set({
          conversations: syncedConvs,
          activeConversationId: activeConversationId && syncedConvs.some(c => c.id === activeConversationId) ? activeConversationId : syncedConvs[0].id
        });
      }
    } catch (err) {
      console.error('[Evolution API] Erro ao sincronizar chats:', err);
    }
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
