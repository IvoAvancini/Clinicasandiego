import { AppointmentStatus, ConversationStatus, AutomationSettings } from '../types/chatwoot';

export interface ZeroTokenResult {
  detectedIntent: 'confirmation_yes' | 'confirmation_no' | 'cancellation' | 'faq' | 'unrecognized';
  targetAppointmentStatus?: AppointmentStatus;
  targetConversationStatus?: ConversationStatus;
  botReplyText: string;
  systemEventText?: string;
  addTags?: string[];
}

export const RECEPTIVE_MENU_TEXT = `Olá! Você está falando com a Clínica Sandiego — Clínica Médica e Vacinas.\n\nPara agilizar seu atendimento, escolha uma opção:\n1 — Marcar consulta\n2 — Alterar ou cancelar agendamento\n3 — Vacinas e Imunização\n4 — Especialidades e corpo clínico\n5 — Convênios aceitos\n6 — Endereço, telefone e horários\n7 — Preparo de exames e documentos\n8 — Falar com a recepção`;

export const DEFAULT_AUTOMATION_SETTINGS: AutomationSettings = {
  initialGreeting: 'Olá, {paciente}! A Clínica Sandiego está entrando em contato para confirmar sua consulta com {medico}, amanhã às {horario}.\n\nResponda:\n1 — Confirmar consulta\n2 — Solicitar reagendamento',
  confirmationMessage: 'Consulta confirmada com sucesso! A Clínica Sandiego aguarda você amanhã às {horario} para sua consulta com {medico}.',
  rescheduleMessage: 'Entendido, {paciente}. Registramos que você precisa remarcar sua consulta com {medico}. A equipe da Clínica Sandiego continuará o atendimento para encontrar um novo horário.',
  cancellationPrompt: 'Você deseja realmente cancelar esta consulta?\n\nResponda 1 para confirmar o cancelamento ou 2 para falar com a recepção.',
  cancellationFinalMessage: 'Sua consulta foi cancelada conforme solicitado. Se precisar agendar novamente no futuro, a Clínica Sandiego estará à disposição.',
  unrecognizedMessage: 'Recebemos sua mensagem. Um integrante da nossa recepção continuará seu atendimento.',
  receptiveMenuText: RECEPTIVE_MENU_TEXT,
  prepartyInstructions: 'Orientação de Preparo de Exames:\n- Exames de sangue: Jejum recomendado de 8h a 12h.\n- Ultrassonografia pélvica/via urinária: Tomar 4 a 6 copos de água 1h antes para manter a bexiga cheia.',
  requiredDocs: 'Documentos necessários: Documento oficial com foto (RG ou CNH) e a carteira física ou digital do seu convênio.',
  clinicAddress: 'Clínica Médica Sandiego: Rua Tomé de Souza, nº 08, Centro.',
  acceptedInsurances: 'Convênios Aceitos: Unimed, Bradesco Saúde, SulAmérica, Amil, Porto Seguro e Atendimento Particular.',
  businessHours: 'Horário de Atendimento: Segunda a Sexta das 08h às 18h e Sábados das 08h às 12h.',
  afterHoursResponse: 'Nosso expediente está encerrado no momento. Atendemos de Segunda a Sexta das 08h às 18h e Sábados das 08h às 12h. Responderemos assim que a clínica abrir!',
  keywordsYes: ['sim', 'confirmo', 'vou', 'vou sim', 'estarei presente', 'tudo certo', 'pode confirmar', 'confirmado', 'ok', '1'],
  keywordsNo: ['não posso', 'nao posso', 'remarcar', 'quero remarcar', 'preciso remarcar', 'outro horário', 'outra data', 'não vou conseguir', 'nao vou conseguir', 'tive um imprevisto', '2'],
  keywordsCancel: ['cancelar', 'não quero mais', 'nao quero mais', 'pode cancelar', 'não irei', 'nao irei'],
};

export function processDeterministicReply(
  userText: string,
  patientName: string,
  doctorName: string,
  specialty: string,
  time: string,
  insurance: string,
  settings: AutomationSettings = DEFAULT_AUTOMATION_SETTINGS,
  botKnowledge: { id: string; topic: string; keywords: string; replyText: string }[] = []
): ZeroTokenResult {
  const normalized = userText.trim().toLowerCase();
  const firstName = patientName.split(' ')[0];

  // 0. Custom Bot Knowledge Rules (cadastrados pelo usuário no painel)
  if (botKnowledge.length > 0) {
    for (const rule of botKnowledge) {
      const kwList = rule.keywords.split(',').map((k) => k.trim().toLowerCase()).filter(Boolean);
      if (kwList.some((kw) => kw && normalized.includes(kw))) {
        return {
          detectedIntent: 'faq',
          botReplyText: rule.replyText,
        };
      }
    }
  }

  // 1. Dúvidas de Valores e Orçamentos -> Recepção Humana (Segurança Financeira)
  const isPriceQuery = [
    'preço',
    'preco',
    'quanto custa',
    'qual o valor',
    'qual valor',
    'valores',
    'orçamento',
    'orcamento',
    'tabela de preço',
    'tabela de preco',
  ].some((term) => normalized.includes(term));

  if (isPriceQuery) {
    return {
      detectedIntent: 'faq',
      targetConversationStatus: 'awaiting_clinic',
      addTags: ['Orçamento'],
      botReplyText: `Para consultar os valores atualizados e formas de pagamento, nossa recepção vai te passar todas as informações diretamente por aqui. Só um instante que nossa equipe já vai te responder!`,
      systemEventText: `Consulta de valores/orçamento redirecionada para a recepção (Precisa responder)`,
    };
  }

  // 2. Dúvidas Médicas / Clínicas -> Encaminha para Recepção
  const isClinicalQuestion = [
    'posso tomar',
    'grávida',
    'gravida',
    'gestante',
    'reação',
    'reacao',
    'sintoma',
    'dose',
    'qual dose',
    'doente',
    'febre',
    'alergia grave',
    'contraindicação',
    'contraindicacao',
    'recompensa',
    'remédio',
    'remedio',
    'receita',
  ].some((term) => normalized.includes(term));

  if (isClinicalQuestion) {
    return {
      detectedIntent: 'faq',
      targetConversationStatus: 'awaiting_clinic',
      addTags: ['Dúvida Clínica'],
      botReplyText: `Para garantir uma orientação correta e segura, essa dúvida precisa ser avaliada pela equipe responsável da Clínica Sandiego. Encaminhamos sua mensagem para a recepção.`,
      systemEventText: `Dúvida clínica redirecionada para a recepção (Precisa responder)`,
    };
  }

  // 3. Detecção Inteligente de Preparo de Exames
  const isExamPreparation = [
    'jejum',
    'bexiga cheia',
    'preparo',
    'exame de sangue',
    'ultrassom precisa',
    'coleta de sangue',
  ].some((term) => normalized.includes(term));

  if (isExamPreparation) {
    return {
      detectedIntent: 'faq',
      botReplyText: `${settings.prepartyInstructions}\n\n${settings.requiredDocs}`,
    };
  }

  // 4. Detecção Inteligente de Especialidades Médicas
  const isSpecialtyQuery = [
    'alergista',
    'imunologista',
    'obstetra',
    'ginecologista',
    'ultrassom',
    'ultrassonografia',
    'longevidade',
    'imunoterapia',
  ].some((term) => normalized.includes(term));

  if (isSpecialtyQuery) {
    return {
      detectedIntent: 'faq',
      botReplyText: `Na Clínica Sandiego contamos com:\n- Dr. Diego Santiago Granato (Alergia e Imunologia / Imunoterapia)\n- Priscila Santiago Granato (Obstetrícia, Saúde e Imunização)\n- Ginecologia, Ultrassonografia, Longevidade e Vacinação.\n\nDeseja verificar os horários disponíveis ou agendar uma consulta?`,
    };
  }

  // A. Respostas de Confirmação (SIM / Vou)
  const isYes = settings.keywordsYes.some((k) => normalized === k.toLowerCase() || normalized.includes(k.toLowerCase()));
  if (isYes) {
    return {
      detectedIntent: 'confirmation_yes',
      targetAppointmentStatus: 'confirmed',
      targetConversationStatus: 'finalized',
      botReplyText: settings.confirmationMessage
        .replace('{paciente}', firstName)
        .replace('{especialidade}', specialty)
        .replace('{medico}', doctorName)
        .replace('{horario}', time),
      systemEventText: `Consulta confirmada pelo paciente às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };
  }

  // B. Respostas de Reagendamento (NÃO / Remarcar)
  const isNo = settings.keywordsNo.some((k) => normalized === k.toLowerCase() || normalized.includes(k.toLowerCase()));
  if (isNo) {
    return {
      detectedIntent: 'confirmation_no',
      targetAppointmentStatus: 'reschedule_requested',
      targetConversationStatus: 'awaiting_clinic',
      addTags: ['Reagendamento'],
      botReplyText: settings.rescheduleMessage
        .replace('{paciente}', firstName)
        .replace('{especialidade}', specialty)
        .replace('{medico}', doctorName),
      systemEventText: `Consulta marcada para reagendamento às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
    };
  }

  // C. Respostas de Cancelamento
  const isCancel = settings.keywordsCancel.some((k) => normalized === k.toLowerCase() || normalized.includes(k.toLowerCase()));
  if (isCancel) {
    return {
      detectedIntent: 'cancellation',
      targetAppointmentStatus: 'cancellation_requested',
      targetConversationStatus: 'awaiting_clinic',
      addTags: ['Cancelamento'],
      botReplyText: settings.cancellationPrompt,
      systemEventText: `Confirmação de cancelamento solicitada ao paciente`,
    };
  }

  // D. Menu de Triagem Receptiva (1-8 e frases naturais)
  if (normalized === '1' || normalized.includes('agendar') || normalized.includes('marcar consulta') || normalized.includes('ginecologista') || normalized.includes('ultrassonografia')) {
    return {
      detectedIntent: 'faq',
      targetConversationStatus: 'awaiting_clinic',
      addTags: ['Novo Agendamento'],
      botReplyText: `Certo, ${firstName}! A Clínica Sandiego possui atendimento em especialidades médicas e exames. Para verificarmos os profissionais e horários disponíveis, informe seu convênio e o melhor dia ou período.`,
      systemEventText: `Solicitação de agendamento receptivo registrada (Precisa responder)`,
    };
  }

  if (normalized === '3' || normalized.includes('vacina') || normalized.includes('imunização') || normalized.includes('febre amarela') || normalized.includes('gripe')) {
    return {
      detectedIntent: 'faq',
      botReplyText: `Na Clínica Sandiego oferecemos vacinação completa: BCG Infantil, Febre Amarela, Gripe Quadrivalente, Tríplice Viral, HPV, Hexavalente, Pneumocócica 13, Herpes Zóster, Meningocócica B e outras.\n\nAtendimento de Segunda a Sexta das 08h às 18h e Sábados das 08h às 12h. Qual vacina você procura?`,
    };
  }

  if (normalized === '4' || normalized.includes('especialidade') || normalized.includes('médico') || normalized.includes('medico') || normalized.includes('corpo clínico')) {
    return {
      detectedIntent: 'faq',
      botReplyText: `Corpo Clínico da Clínica Sandiego:\n- Dr. Diego Santiago Granato — Alergia e Imunologia\n- Priscila Santiago Granato — Obstetrícia, Saúde e Imunização\n\nEspecialidades: Ginecologia, Ultrassonografia, Longevidade, Imunoterapia e Vacinação.`,
    };
  }

  if (normalized === '5' || normalized.includes('convênio') || normalized.includes('convenio') || normalized.includes('particular')) {
    return {
      detectedIntent: 'faq',
      botReplyText: settings.acceptedInsurances,
    };
  }

  if (normalized === '6' || normalized.includes('endereço') || normalized.includes('endereco') || normalized.includes('telefone') || normalized.includes('horário') || normalized.includes('horario')) {
    return {
      detectedIntent: 'faq',
      botReplyText: `Clínica Médica Sandiego:\nRua Tomé de Souza, nº 08, Centro.\nTelefones: (73) 3261-9207 | (73) 99184-5988\n\nHorário de Atendimento:\nSegunda a Sexta das 08:00 às 18:00 e Sábados das 08:00 às 12:00.`,
    };
  }

  if (normalized === '7' || normalized.includes('preparo') || normalized.includes('documento')) {
    return {
      detectedIntent: 'faq',
      botReplyText: `${settings.requiredDocs}\n\n${settings.prepartyInstructions}`,
    };
  }

  if (normalized === '8' || normalized.includes('falar com a recepção') || normalized.includes('recepção') || normalized.includes('atendente')) {
    return {
      detectedIntent: 'faq',
      targetConversationStatus: 'awaiting_clinic',
      botReplyText: `Encaminhamos sua conversa para a recepção da Clínica Sandiego. Um de nossos atendentes continuará seu atendimento em breve!`,
      systemEventText: `Encaminhado para a recepção (Precisa responder)`,
    };
  }

  // E. Mensagem Não Reconhecida -> Encaminha para a Recepção
  return {
    detectedIntent: 'unrecognized',
    targetConversationStatus: 'awaiting_clinic',
    botReplyText: settings.unrecognizedMessage,
    systemEventText: `Mensagem encaminhada para a recepção (Precisa responder)`,
  };
}
