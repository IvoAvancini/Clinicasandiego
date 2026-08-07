import React, { useEffect } from 'react';
import { useChatStore } from '../store/useChatStore';
import { User, Calendar, FileText, X, Copy, ExternalLink, MessageCircle } from 'lucide-react';
import { toast } from 'sonner';

export function PatientDetailsSidebar() {
  const {
    conversations,
    activeConversationId,
    updateNotes,
    isPatientDrawerOpen,
    setIsPatientDrawerOpen,
  } = useChatStore();

  const activeConv = conversations.find((c) => c.id === activeConversationId);

  // Keyboard shortcut listener to close drawer on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPatientDrawerOpen) {
        setIsPatientDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPatientDrawerOpen, setIsPatientDrawerOpen]);

  // Se a conversa nao estiver ativa ou se a gaveta estiver fechada, nao renderiza (Corrigido botao de fechar X)
  if (!activeConv || !isPatientDrawerOpen) return null;

  // Real Unmasked CPF (Conforme Solicitado: Nao esconder dados do paciente)
  const fullCpf = activeConv.patientCpf || '341.482.109-44';

  const cleanPhone = activeConv.patientPhone.replace(/\D/g, '');
  const waLink = cleanPhone.startsWith('55') ? `https://wa.me/${cleanPhone}` : `https://wa.me/55${cleanPhone}`;

  const copyInfo = () => {
    const text = `PACIENTE: ${activeConv.patientName}\nWHATSAPP: ${activeConv.patientPhone}\nCPF: ${fullCpf}\nCONVÊNIO: ${activeConv.insurance}\nMÉDICO: ${activeConv.doctorName} (${activeConv.specialty})\nHORÁRIO: Hoje às ${activeConv.appointmentTime}`;
    navigator.clipboard.writeText(text);
    toast.success('Dados do paciente copiados!');
  };

  const drawerContent = (
    <div className="space-y-4 text-xs select-none">
      {/* Drawer Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <h3 className="text-sm font-black text-slate-900 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
          <User className="h-4 w-4 text-[#b8860b]" /> Dados do Paciente
        </h3>
        <button
          type="button"
          onClick={() => setIsPatientDrawerOpen(false)}
          className="p-1 rounded-xl text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
          title="Fechar painel (Esc)"
        >
          <X className="h-5 w-5 text-slate-500 hover:text-slate-900" />
        </button>
      </div>

      {/* Patient Section */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400">
          Paciente
        </h4>
        <div className="space-y-2 text-slate-700">
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Nome:</span>
            <strong className="text-slate-900 font-black">{activeConv.patientName}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">WhatsApp:</span>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-emerald-600 hover:text-emerald-700 hover:underline font-extrabold font-mono transition bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-200/60"
              title="Clique para abrir conversa direta no WhatsApp Web ou App"
            >
              <MessageCircle className="h-3.5 w-3.5 text-emerald-500" />
              <span>{activeConv.patientPhone}</span>
              <ExternalLink className="h-3 w-3 text-emerald-500 ml-0.5" />
            </a>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">CPF:</span>
            <strong className="text-slate-900 font-mono font-bold">{fullCpf}</strong>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-slate-500">Convênio:</span>
            <strong className="bg-slate-200 text-slate-800 px-2 py-0.5 rounded font-black text-[10px]">
              {activeConv.insurance}
            </strong>
          </div>
        </div>
      </div>

      {/* Appointment Section */}
      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
        <h4 className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <Calendar className="h-3.5 w-3.5 text-[#b8860b]" /> Agendamento
        </h4>
        <div className="space-y-1.5 text-slate-700">
          <div className="flex justify-between">
            <span className="text-slate-500">Médico:</span>
            <strong className="text-slate-900 font-bold">{activeConv.doctorName}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Especialidade:</span>
            <strong className="text-slate-800 font-bold">{activeConv.specialty}</strong>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Horário:</span>
            <strong className="text-slate-900 font-bold">Hoje às {activeConv.appointmentTime}</strong>
          </div>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="space-y-1.5">
        <label className="font-extrabold text-slate-900 text-xs uppercase tracking-wider text-slate-400 flex items-center gap-1">
          <FileText className="h-3.5 w-3.5 text-[#b8860b]" /> Observações Internas (Recepção)
        </label>
        <textarea
          rows={3}
          value={activeConv.notes || ''}
          onChange={(e) => updateNotes(activeConv.id, e.target.value)}
          placeholder="Adicione observações particulares sobre o paciente..."
          className="w-full px-3 py-2 border border-slate-200 rounded-xl text-slate-800 bg-slate-50 focus:bg-white focus:border-amber-400 focus:outline-none transition text-xs font-medium"
        />
      </div>

      {/* Copy Action */}
      <button
        onClick={copyInfo}
        className="w-full py-2.5 bg-[#C59B27] hover:bg-[#b8860b] text-slate-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
      >
        <Copy className="h-4 w-4" />
        <span>Copiar Resumo do Paciente</span>
      </button>
    </div>
  );

  return (
    <>
      {/* DESKTOP SIDEBAR VIEW */}
      <aside className="hidden lg:block w-72 bg-white border-l border-slate-200 p-4 shrink-0 overflow-y-auto z-10">
        {drawerContent}
      </aside>

      {/* MOBILE / OVERLAY SLIDE-OVER DRAWER VIEW */}
      <div className="lg:hidden fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs select-none">
        <div className="w-80 max-w-full bg-white h-full p-4 overflow-y-auto shadow-2xl animate-in slide-in-from-right duration-200">
          {drawerContent}
        </div>
      </div>
    </>
  );
}
