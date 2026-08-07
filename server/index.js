const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, 'database.json');

app.use(cors());
app.use(express.json());

// Initial database seed if file doesn't exist
const INITIAL_DB = {
  patients: [
    {
      id: 'pat-1',
      name: 'Juliana Paes',
      phone: '(11) 99887-6655',
      cpf: '341.892.018-44',
      insurance: 'Unimed',
      notes: 'Paciente prefere atendimento em sala térrea por ter dificuldade de locomoção.',
      created_at: new Date().toISOString(),
    },
    {
      id: 'pat-2',
      name: 'Camila Pitanga',
      phone: '(11) 99123-4567',
      cpf: '219.004.881-90',
      insurance: 'Bradesco Saúde',
      notes: 'Solicitou remarcar para semana que vem.',
      created_at: new Date().toISOString(),
    },
  ],
  conversations: [
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
      conversationStatus: 'awaiting_patient',
      appointmentStatus: 'confirmed',
      status: 'confirmed',
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
      ],
    },
  ],
  canned_responses: [
    { shortcut: '/saudacao', title: 'Saudação Oficial', category: 'Geral', content: 'Olá, {primeiro_nome}! A Clínica Sandiego — Clínica Médica e Vacinas está à disposição. Como podemos te ajudar hoje?' },
    { shortcut: '/agendamento', title: 'Informar Agendamento', category: 'Consultas', content: 'Sua consulta de {especialidade} com {medico} está agendada para {data_amigavel} às {horario} na Clínica Sandiego.' },
    { shortcut: '/vacinas', title: 'Tabela de Vacinas', category: 'Imunização', content: 'Contamos com vacinação completa: Febre Amarela, Gripe Quadrivalente, Tríplice Viral, HPV e Pneumocócica.' },
    { shortcut: '/convenios', title: 'Lista de Convênios', category: 'Financeiro', content: 'Convênios Aceitos: Unimed, Bradesco Saúde, SulAmérica, Amil, Porto Seguro e Atendimento Particular.' },
    { shortcut: '/endereco', title: 'Endereço e Estacionamento', category: 'Localização', content: 'Sandiego — Clínica Médica e Vacinas: Rua das Clínicas, 500 — Centro. Estacionamento próprio no local.' },
    { shortcut: '/horarios', title: 'Horário de Funcionamento', category: 'Geral', content: 'Horário de Atendimento: Segunda a Sexta das 06:30 às 19:00 e Sábados das 07:00 às 13:00.' },
    { shortcut: '/documentos', title: 'Documentos Necessários', category: 'Consultas', content: 'Documentos necessários: Documento oficial com foto (RG ou CNH) e a carteira física ou digital do seu convênio.' },
    { shortcut: '/preparo', title: 'Instruções de Preparo', category: 'Exames', content: 'Orientação de Preparo: Coletas de sangue exigem jejum de 8h a 12h. Exames de imagem exigem bexiga cheia.' },
    { shortcut: '/confirmacao', title: 'Confirmação Realizada', category: 'Consultas', content: 'Consulta confirmada com sucesso! A Clínica Sandiego aguarda você amanhã às {horario} para sua consulta com {medico}.' },
    { shortcut: '/reagendamento', title: 'Opções de Reagendamento', category: 'Consultas', content: 'Entendido, {primeiro_nome}. Registramos que você precisa remarcar sua consulta com {medico}. Quais dias ficam melhores para você?' },
    { shortcut: '/cancelamento', title: 'Política de Cancelamento', category: 'Consultas', content: 'Sua solicitação de cancelamento foi recebida com sucesso.' },
    { shortcut: '/aguarde', label: 'Aguarde Atendimento', content: 'Um momento que nossa recepção já vai dar continuidade ao seu atendimento!' },
    { shortcut: '/fora-expediente', title: 'Fora do Expediente', category: 'Atendimento', content: 'Nosso expediente está encerrado no momento. Responderemos assim que a clínica abrir!' },
    { shortcut: '/finalizacao', title: 'Finalização de Atendimento', category: 'Atendimento', content: 'A Clínica Sandiego agradece seu contato! Tenha um excelente dia.' },
  ],
  webhook_logs: [
    {
      id: 'log-1',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'incoming_message',
      source: 'WhatsApp Cloud API',
      status: 'pending',
      summary: 'Evento de webhook recebido e armazenado no servidor backend Express',
      externalId: 'wamid.HBgLMTExOTk4ODc2NjU1',
    },
  ],
};

function readDb() {
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(INITIAL_DB, null, 2));
    return INITIAL_DB;
  }
  try {
    return JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
  } catch {
    return INITIAL_DB;
  }
}

function writeDb(data) {
  fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));
}

// REST Endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Clínica Sandiego Backend API', env: process.env.VITE_ENV || 'development' });
});

app.get('/api/conversations', (req, res) => {
  const db = readDb();
  res.json(db.conversations);
});

app.post('/api/conversations', (req, res) => {
  const db = readDb();
  const newConv = req.body;
  db.conversations.push(newConv);
  writeDb(db);
  res.status(201).json(newConv);
});

app.post('/api/messages', (req, res) => {
  const db = readDb();
  const { conversationId, message } = req.body;
  const conv = db.conversations.find((c) => c.id === conversationId);
  if (conv) {
    conv.messages.push(message);
    conv.lastActivity = message.timestamp;
    if (message.sender === 'agent') {
      conv.conversationStatus = 'awaiting_patient';
    } else if (message.sender === 'patient') {
      conv.conversationStatus = 'awaiting_clinic';
    }
    writeDb(db);
    return res.json({ success: true, conversation: conv });
  }
  res.status(404).json({ error: 'Conversa não encontrada' });
});

app.put('/api/conversations/:id/status', (req, res) => {
  const db = readDb();
  const { id } = req.params;
  const { status, appointmentStatus, conversationStatus } = req.body;
  const conv = db.conversations.find((c) => c.id === id);
  if (conv) {
    if (status) conv.status = status;
    if (appointmentStatus) conv.appointmentStatus = appointmentStatus;
    if (conversationStatus) conv.conversationStatus = conversationStatus;
    writeDb(db);
    return res.json({ success: true, conversation: conv });
  }
  res.status(404).json({ error: 'Conversa não encontrada' });
});

app.get('/api/canned-responses', (req, res) => {
  const db = readDb();
  res.json(db.canned_responses);
});

app.get('/api/logs', (req, res) => {
  const db = readDb();
  res.json(db.webhook_logs);
});

// Webhook Verification (Meta Cloud API Challenge)
app.get('/api/webhooks/whatsapp', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  const VERIFY_TOKEN = process.env.WHATSAPP_VERIFY_TOKEN || 'sandiego_token_2025';

  if (mode && token) {
    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      console.log('[Webhook Meta] Webhook verificado com sucesso no Railway!');
      return res.status(200).send(challenge);
    }
    return res.sendStatus(403);
  }
  res.json({ status: 'ok', message: 'Webhook endpoint do WhatsApp ativo no Railway' });
});

// Real Webhook Endpoint (Idempotent POST)
app.post('/api/webhooks/whatsapp', (req, res) => {
  const db = readDb();
  const payload = req.body;
  const externalMsgId = payload?.entry?.[0]?.changes?.[0]?.value?.messages?.[0]?.id || `ext-${Date.now()}`;

  // Check idempotency (duplicate event protection)
  const existingLog = db.webhook_logs.find((l) => l.externalId === externalMsgId);
  if (existingLog) {
    return res.status(200).json({ status: 'ignored_duplicate', externalId: externalMsgId });
  }

  const newLog = {
    id: `log-${Date.now()}`,
    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    type: 'incoming_message',
    source: 'WhatsApp Cloud API',
    status: 'success',
    summary: `Mensagem externa ${externalMsgId} processada com sucesso no backend Express`,
    externalId: externalMsgId,
  };

  db.webhook_logs.push(newLog);
  writeDb(db);

  res.status(200).json({ status: 'success', externalId: externalMsgId });
});

app.listen(PORT, () => {
  console.log(`[Sandiego Backend Server] Rodando na porta ${PORT}`);
});
