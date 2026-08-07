import React, { useState, useRef } from 'react';
import { useChatStore } from '../store/useChatStore';
import { Message } from '../types/chatwoot';
import {
  Send,
  User,
  ArrowLeft,
  Info,
  MessageSquare,
  Pencil,
  Check,
  Play,
  Pause,
  Mic,
  Camera,
  Video,
  FileText,
  Download,
  AlertCircle,
  RefreshCw,
  Maximize2,
} from 'lucide-react';
import { toast } from 'sonner';

function WhatsAppAudioMessage({ msg, isOutgoing }: { msg: Message; isOutgoing: boolean }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const mediaSrc = msg.audioUrl || (msg.id ? `/api/whatsapp/media/${msg.id}` : undefined);

  const togglePlay = () => {
    if (audioRef.current && mediaSrc) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {
          setIsPlaying(!isPlaying);
        });
      }
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <div className="flex flex-col gap-2 select-none min-w-[220px]">
      <div className="flex items-center gap-3 py-1 px-1">
        {mediaSrc && <audio ref={audioRef} src={mediaSrc} onEnded={() => setIsPlaying(false)} className="hidden" />}
        
        <button
          type="button"
          onClick={togglePlay}
          className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition cursor-pointer active:scale-95 ${
            isOutgoing ? 'bg-emerald-700 text-white hover:bg-emerald-800' : 'bg-emerald-600 text-white hover:bg-emerald-700'
          }`}
        >
          {isPlaying ? <Pause className="h-4 w-4 fill-white" /> : <Play className="h-4 w-4 fill-white ml-0.5" />}
        </button>

        <div className="flex-1 flex flex-col justify-center gap-1">
          <div className="flex items-center gap-0.5 h-4">
            {[40, 70, 30, 90, 60, 100, 45, 80, 50, 85, 35, 75, 55, 95, 65, 40].map((h, i) => (
              <div
                key={i}
                className={`w-0.5 rounded-full transition-all duration-300 ${
                  isPlaying ? 'bg-emerald-600 animate-pulse' : 'bg-slate-400/70'
                }`}
                style={{ height: isPlaying ? `${Math.max(25, (h * Math.random()) + 15)}%` : `${h * 0.35}%` }}
              />
            ))}
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-slate-500">
            <span className="flex items-center gap-1 text-emerald-800">
              <Mic className="h-3 w-3 text-emerald-600" /> Mensagem de voz
            </span>
            <span>0:15</span>
          </div>
        </div>
      </div>

      {msg.transcription ? (
        <div className="bg-white/80 p-2 rounded-xl border border-emerald-200/80 text-[11px] text-slate-800">
          <strong className="text-emerald-900 block font-bold text-[10px] mb-0.5">Transcrição por IA:</strong>
          <span>"{msg.transcription}"</span>
        </div>
      ) : msg.transcriptionStatus === 'processing' ? (
        <div className="text-[10px] italic text-slate-500 px-1">
          Transcrevendo áudio...
        </div>
      ) : null}
    </div>
  );
}

function WhatsAppImageMessage({ msg, isOutgoing }: { msg: Message; isOutgoing: boolean }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const mediaSrc = msg.imageUrl || (msg.id ? `/api/whatsapp/media/${msg.id}` : undefined);

  return (
    <div className="flex flex-col gap-1.5 max-w-[260px]">
      {mediaSrc ? (
        <div 
          onClick={() => setIsZoomed(true)} 
          className="rounded-xl overflow-hidden border border-slate-200 shadow-xs cursor-pointer hover:opacity-95 transition relative group"
        >
          <img src={mediaSrc} alt="Foto enviada" className="w-full max-h-64 object-cover" />
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1">
            <Maximize2 className="h-4 w-4" /> Ampliar
          </div>
        </div>
      ) : (
        <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isOutgoing ? 'bg-emerald-100/70 border-emerald-300' : 'bg-slate-100 border-slate-200'}`}>
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Camera className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-slate-900 block truncate">Foto / Imagem</span>
            <span className="text-[10px] font-bold text-emerald-800 block">WhatsApp Mídia</span>
          </div>
        </div>
      )}

      {msg.text && msg.text !== '📷 Foto / Imagem' && (
        <p className="text-xs font-medium text-slate-800 px-1">{msg.text}</p>
      )}

      {isZoomed && mediaSrc && (
        <div 
          onClick={() => setIsZoomed(false)} 
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 cursor-pointer"
        >
          <div className="relative max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl">
            <img src={mediaSrc} alt="Foto ampliada" className="max-h-[85vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        </div>
      )}
    </div>
  );
}

function WhatsAppVideoMessage({ msg, isOutgoing }: { msg: Message; isOutgoing: boolean }) {
  const mediaSrc = msg.videoUrl || (msg.id ? `/api/whatsapp/media/${msg.id}` : undefined);

  return (
    <div className="flex flex-col gap-1.5 max-w-[280px]">
      {mediaSrc ? (
        <video controls src={mediaSrc} className="rounded-xl max-h-64 border border-slate-200 shadow-xs w-full" />
      ) : (
        <div className={`p-3 rounded-xl border flex items-center gap-2.5 ${isOutgoing ? 'bg-emerald-100/70 border-emerald-300' : 'bg-slate-100 border-slate-200'}`}>
          <div className="w-10 h-10 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <Video className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-black text-slate-900 block truncate">Vídeo WhatsApp</span>
          </div>
        </div>
      )}
      {msg.text && msg.text !== '🎥 Vídeo' && (
        <p className="text-xs font-medium text-slate-800 px-1">{msg.text}</p>
      )}
    </div>
  );
}

function WhatsAppDocumentMessage({ msg, isOutgoing }: { msg: Message; isOutgoing: boolean }) {
  const mediaSrc = msg.documentUrl || (msg.id ? `/api/whatsapp/media/${msg.id}` : '#');
  const fileName = msg.fileName || 'documento.pdf';

  return (
    <div className="flex flex-col gap-1.5 max-w-[260px]">
      <div className={`p-3 rounded-xl border flex items-center gap-3 ${isOutgoing ? 'bg-emerald-100/80 border-emerald-300' : 'bg-slate-100 border-slate-200'}`}>
        <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
          <FileText className="h-5 w-5" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs font-black text-slate-900 block truncate">{fileName}</span>
          <a
            href={mediaSrc}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-purple-700 hover:underline mt-1"
          >
            <Download className="h-3 w-3" /> Abrir / Baixar
          </a>
        </div>
      </div>
    </div>
  );
}

function MediaFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 space-y-1.5 max-w-[250px]">
      <div className="flex items-center gap-1.5 font-bold">
        <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
        <span>Não foi possível carregar esta mídia.</span>
      </div>
      <button
        type="button"
        onClick={onRetry}
        className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
      >
        <RefreshCw className="h-3 w-3" /> Tentar novamente
      </button>
    </div>
  );
}

export function ChatArea() {
  const {
    conversations,
    activeConversationId,
    sendMessage,
    updateStatus,
    updatePatientName,
    togglePatientDrawer,
    setIsMobileChatOpen,
  } = useChatStore();

  const [inputMessage, setInputMessage] = useState('');
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');

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

  const handleSaveName = () => {
    if (editedName.trim()) {
      updatePatientName(activeConv.id, editedName.trim());
      toast.success('Nome do contato atualizado!');
    }
    setIsEditingName(false);
  };

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

            {isEditingName ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSaveName(); }}
                  autoFocus
                  className="text-xs font-bold text-slate-900 px-2.5 py-1 border border-purple-400 rounded-lg outline-none bg-purple-50/50"
                  placeholder="Nome do contato..."
                />
                <button
                  type="button"
                  onClick={handleSaveName}
                  className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                  title="Salvar nome"
                >
                  <Check className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 truncate">
                <h2 className="text-sm font-black text-slate-900 font-['Plus_Jakarta_Sans'] truncate">
                  {activeConv.patientName}
                </h2>
                <button
                  type="button"
                  onClick={() => { setEditedName(activeConv.patientName); setIsEditingName(true); }}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-purple-600 transition cursor-pointer"
                  title="Editar nome do contato"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            )}

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
          const isAudio = msg.mediaType === 'audio' || msg.text.includes('Mensagem de voz') || msg.text.includes('🎤');
          const isImage = msg.mediaType === 'image' || msg.text.includes('Foto') || msg.text.includes('📷');
          const isVideo = msg.mediaType === 'video' || msg.text.includes('Vídeo') || msg.text.includes('🎥');
          const isDocument = msg.mediaType === 'document' || msg.text.includes('documento') || msg.text.includes('📄');
          const isError = msg.mediaStatus === 'processing_error';

          const handleRetry = async () => {
            try {
              toast.info('Tentando carregar mídia novamente...');
              const res = await fetch(`/api/whatsapp/media/${msg.id}/retry`, { method: 'POST' });
              if (res.ok) {
                toast.success('Mídia carregada!');
                window.location.reload();
              } else {
                toast.error('Ainda não foi possível obter a mídia.');
              }
            } catch {
              toast.error('Erro de conexão ao tentar carregar mídia.');
            }
          };

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
                className={`max-w-[85%] sm:max-w-[70%] px-3.5 py-2 text-xs leading-relaxed whitespace-pre-wrap shadow-2xs transition-all ${
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

                {isError ? (
                  <MediaFallback onRetry={handleRetry} />
                ) : isAudio ? (
                  <WhatsAppAudioMessage msg={msg} isOutgoing={isOutgoing} />
                ) : isImage ? (
                  <WhatsAppImageMessage msg={msg} isOutgoing={isOutgoing} />
                ) : isVideo ? (
                  <WhatsAppVideoMessage msg={msg} isOutgoing={isOutgoing} />
                ) : isDocument ? (
                  <WhatsAppDocumentMessage msg={msg} isOutgoing={isOutgoing} />
                ) : (
                  msg.text
                )}

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
