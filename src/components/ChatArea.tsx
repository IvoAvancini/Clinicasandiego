import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import {
  Send,
  User,
  ArrowLeft,
  Info,
  MessageSquare,
} from 'lucide-react';

const FULL_CANNED_RESPONSES = [
  { shortcut: '/saudacao', label: 'Saudação Oficial', template: 'Olá, {primeiro_nome}! A Clínica Sandiego — Clínica Médica e Vacinas está à disposição. Como podemos te ajudar hoje?' },
  { shortcut: '/agendamento', label: 'Informar Agendamento', template: 'Sua consulta de {especialidade} com {medico} está agendada para {data_amigavel} às {horario} na Clínica Sandiego.' },
  { shortcut: '/vacinas', label: 'Tabela de Vacinas', template: 'Contamos com vacinação completa: Febre Amarela, Gripe Quadrivalente, Tríplice Viral, HPV e Pneumocócica.' },
  { shortcut: '/convenios', label: 'Lista de Convênios', template: 'Convênios Aceitos: Unimed, Bradesco Saúde, SulAmérica, Amil, Porto Seguro e Atendimento Particular.' },
  { shortcut: '/endereco', label: 'Endereço e Estacionamento', template: 'Sandiego — Clínica Médica e Vacinas: Rua Tomé de Souza, nº 08, Centro.' },
  { shortcut: '/horarios', label: 'Horário de Funcionamento', template: 'Horário de Atendimento: Segunda a Sexta das 08:00 às 18:00 e Sábados das 08:00 às 12:00.' },
  { shortcut: '/documentos', label: 'Documentos Necessários', template: 'Documentos necessários: Documento oficial com foto (RG ou CNH) e a carteira física ou digital do seu convênio.' },
  { shortcut: '/preparo', label: 'Instruções de Preparo', template: 'Orientação de Preparo: Coletas de sangue exigem jejum de 8h a 12h. Exames de imagem exigem bexiga cheia.' },
  { shortcut: '/confirmacao', label: 'Confirmação Realizada', template: 'Consulta confirmada com sucesso! A Clínica Sandiego aguarda você amanhã às {horario} para sua consulta com {medico}.' },
  { shortcut: '/reagendamento', label: 'Opções de Reagendamento', template: 'Entendido, {primeiro_nome}. Registramos que você precisa remarcar sua consulta com {medico}. Quais dias ficam melhores para você?' },
  { shortcut: '/cancelamento', label: 'Política de Cancelamento', template: 'Sua solicitação de cancelamento foi recebida com sucesso.' },
  { shortcut: '/aguarde', label: 'Aguarde Atendimento', template: 'Um momento que nossa recepção já vai dar continuidade ao seu atendimento!' },
  { shortcut: '/fora-expediente', label: 'Fora do Expediente', template: 'Nosso expediente está encerrado no momento. Responderemos assim que a clínica abrir!' },
  { shortcut: '/finalizacao', label: 'Finalização de Atendimento', template: 'A Clínica Sandiego agradece seu contato! Tenha um excelente dia.' },
];

export function ChatArea() {
  const {
    conversations,
    activeConversationId,
    sendMessage,
    updateStatus,
    togglePatientDrawer,
    setIsMobileChatOpen,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  if (!activeConv) {
    return (
      <main className="flex-1 bg-[#f8fafc] flex items-center justify-center text-slate-400 p-8 text-center h-full">
        <div>
          <MessageSquare className="h-12 w-12 mx-auto opacity-30 text-slate-400 mb-3" />
          <h2 className="text-sm font-bold text-slate-600">Nenhuma conversa selecionada nesta aba</h2>
          <p className="text-xs text-slate-400 mt-1">Selecione uma conversa válida ou altere o filtro da caixa de entrada.</p>
        </div>
      </main>
    );
  }

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    sendMessage(inputMessage);
    setInputMessage('');
  };



  const isResolved = activeConv.conversationStatus === 'finalized';

  return (
    <main className="flex-1 bg-[#f8fafc] flex flex-col min-w-0 h-full overflow-hidden relative">
      {/* Compact 2-Line Patient Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 shrink-0 select-none shadow-2xs space-y-1">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <button
              onClick={() => setIsMobileChatOpen(false)}
              className="lg:hidden p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              title="Voltar para conversas"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <h2 className="text-sm font-black text-slate-900 font-['Plus_Jakarta_Sans'] truncate">
              {activeConv.patientName}
            </h2>
            <span className="text-slate-300 font-bold">·</span>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded border shrink-0 ${
                activeConv.conversationStatus === 'awaiting_clinic'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : isResolved
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : 'bg-slate-100 text-slate-600 border-slate-200'
              }`}
            >
              {activeConv.conversationStatus === 'awaiting_clinic'
                ? 'Precisa responder'
                : isResolved
                ? 'Resolvida'
                : 'Aguardando paciente'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {activeConv.appointmentStatus === 'reschedule_requested' && (
              <span className="bg-amber-100 text-amber-900 text-[10px] font-black px-2.5 py-0.5 rounded-full border border-amber-300">
                Reagendamento Solicitado
              </span>
            )}

            <button
              onClick={togglePatientDrawer}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-200 transition flex items-center gap-1.5 cursor-pointer"
            >
              <User className="h-3.5 w-3.5 text-[#b8860b]" />
              <span>Ver paciente</span>
            </button>
          </div>
        </div>

        {/* Line 2: Doctor · Specialty · Appointment Time */}
        <div className="text-[11px] font-medium text-slate-500 flex items-center gap-2 truncate">
          <strong className="text-slate-800 font-bold">{activeConv.doctorName}</strong>
          <span>·</span>
          <span>{activeConv.specialty}</span>
          <span>·</span>
          <span className="font-bold text-slate-700">Hoje às {activeConv.appointmentTime}</span>
        </div>
      </div>

      {/* WhatsApp Web style chat background */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2 bg-[#efeae2] bg-opacity-70">
        <div className="flex justify-center my-2">
          <span className="bg-white/80 backdrop-blur-xs text-slate-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-2xs border border-slate-200/60">
            Hoje
          </span>
        </div>

        {activeConv.messages.map((msg) => {
          const isBot = msg.sender === 'system_bot';
          const isPatient = msg.sender === 'patient';
          const isAgent = msg.sender === 'agent';
          const isEvent = msg.sender === 'system_event';

          if (isEvent) {
            return (
              <div key={msg.id} className="flex justify-center my-2">
                <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-3 py-1 rounded-full border border-amber-200">
                  {msg.text}
                </span>
              </div>
            );
          }

          const isOutgoing = isBot || isAgent;

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOutgoing ? 'items-end' : 'items-start'} gap-0.5`}
            >
              {/* Sender name — only for patient */}
              {isPatient && (
                <span className="text-[10px] font-bold text-slate-500 px-1">{activeConv.patientName}</span>
              )}

              {/* WhatsApp Web Style Bubble */}
              <div
                className={`max-w-[75%] sm:max-w-[65%] px-4 py-2.5 text-xs leading-relaxed whitespace-pre-wrap shadow-2xs transition-all ${
                  isOutgoing
                    ? isBot
                      ? 'bg-[#e2f7e0] text-slate-900 rounded-2xl rounded-tr-xs border border-emerald-200/80'
                      : 'bg-[#d9fdd3] text-slate-900 rounded-2xl rounded-tr-xs border border-emerald-200/80'
                    : 'bg-white text-slate-900 rounded-2xl rounded-tl-xs border border-slate-200/80'
                }`}
              >
                {isOutgoing && isBot && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-700 mb-1">
                    <span>🤖 IA</span>
                  </div>
                )}
                {isOutgoing && isAgent && (
                  <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-800 mb-1">
                    <span>👤 Recepção</span>
                  </div>
                )}

                {msg.text}

                <div className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-bold ${isOutgoing ? 'text-emerald-800/70' : 'text-slate-400'}`}>
                  <span>{msg.timestamp}</span>
                  {isOutgoing && <span className="text-emerald-600 font-extrabold">✓✓</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Discrete Re-opening Note for Resolved Conversations */}
      {isResolved && (
        <div className="px-4 py-1 flex items-center justify-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100/80 border-t border-slate-200">
          <Info className="h-3.5 w-3.5 text-amber-600 shrink-0" />
          <span>Conversa resolvida — enviar uma mensagem irá reabri-la.</span>
        </div>
      )}

      {/* Input Bar - WhatsApp style */}
      <form onSubmit={handleSend} className="bg-white border-t border-slate-200 p-3 sm:p-4 shrink-0 shadow-md">
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Digite uma mensagem... (Enter envia, Shift+Enter quebra linha)"
            className="flex-1 px-5 py-3 border border-slate-200 bg-slate-50 rounded-full text-xs text-slate-900 placeholder-slate-400 outline-none focus:border-purple-500 focus:bg-white transition font-medium"
          />

          <button
            type="submit"
            className="w-10 h-10 rounded-full bg-purple-600 hover:bg-purple-700 text-white font-black shadow-md transition flex items-center justify-center shrink-0 cursor-pointer active:scale-95"
          >
            <Send className="h-4 w-4 ml-0.5" />
          </button>
        </div>
      </form>
    </main>
  );
}
