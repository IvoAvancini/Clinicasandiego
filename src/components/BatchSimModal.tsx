import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { Zap, X, CheckCircle2, Clock, Send } from 'lucide-react';
import { SandiegoLogo } from './SandiegoLogo';

export function BatchSimModal() {
  const { isBatchModalOpen, setIsBatchModalOpen, triggerBatchConfirmations, conversations } = useChatStore();

  if (!isBatchModalOpen) return null;

  const pendingCount = conversations.filter((c) => c.status === 'awaiting_patient' || c.status === 'awaiting_dispatch').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 select-none">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5">
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <SandiegoLogo variant="icon" size="sm" />
            <div>
              <h3 className="text-base font-black text-slate-900">Disparo de Confirmações em Lote</h3>
              <p className="text-xs text-slate-500">Sandiego — Clínica Médica e Vacinas</p>
            </div>
          </div>
          <button
            onClick={() => setIsBatchModalOpen(false)}
            className="text-slate-400 hover:text-slate-600 p-1"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-2 text-xs">
          <p className="text-slate-600 font-medium">
            Esta ação irá autorizar o envio de lembretes no WhatsApp para todos os pacientes aguardando confirmação.
          </p>
          <div className="pt-2 flex justify-between items-center text-slate-500 font-bold">
            <span>Pacientes na fila:</span>
            <span className="text-amber-600 font-black text-sm">{pendingCount} Paciente(s)</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setIsBatchModalOpen(false)}
            className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
          >
            Cancelar
          </button>
          <button
            onClick={triggerBatchConfirmations}
            disabled={pendingCount === 0}
            className="flex-1 py-3 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 transition flex items-center justify-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Send className="h-4 w-4" />
            <span>Disparar Agora</span>
          </button>
        </div>
      </div>
    </div>
  );
}
