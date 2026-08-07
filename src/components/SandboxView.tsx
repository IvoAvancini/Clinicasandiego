import React, { useState } from 'react';
import { useChatStore } from '../store/useChatStore';
import { SandiegoLogo } from './SandiegoLogo';
import { processDeterministicReply } from '../lib/zeroTokenEngine';
import { Send, Bot, RefreshCw, CheckCircle2, FlaskConical } from 'lucide-react';

export function SandboxView() {
  const { conversations, simulatePatientReply } = useChatStore();
  const [simulatedText, setSimulatedText] = useState('1');
  const [selectedConvId, setSelectedConvId] = useState(conversations[0]?.id || '');
  const [testResult, setTestResult] = useState<any>(null);

  const activeConv = conversations.find((c) => c.id === selectedConvId) || conversations[0];

  const handleTestEngine = () => {
    if (!activeConv) return;
    const result = processDeterministicReply(
      simulatedText,
      activeConv.patientName,
      activeConv.doctorName,
      activeConv.specialty,
      activeConv.appointmentTime,
      activeConv.insurance
    );
    setTestResult(result);
  };

  const handleInjectReply = () => {
    if (!simulatedText.trim()) return;
    simulatePatientReply(simulatedText);
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 sm:p-8 text-slate-800 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <SandiegoLogo variant="full" size="md" />
          <h2 className="text-xl font-black text-slate-900 mt-2 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-amber-600" />
            Modo de Testes Técnico (Sandbox)
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Simulador técnico isolado para testar respostas de pacientes e avaliar intenções sem consumir tokens de IA.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: Controls */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Simular Resposta do Paciente
          </h3>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Selecionar Paciente:
            </label>
            <select
              value={selectedConvId}
              onChange={(e) => setSelectedConvId(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-bold text-slate-800 outline-none"
            >
              {conversations.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.patientName} — {c.doctorName} ({c.insurance})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-600 mb-1">
              Mensagem Simulada do Paciente:
            </label>
            <input
              type="text"
              value={simulatedText}
              onChange={(e) => setSimulatedText(e.target.value)}
              placeholder="Ex: 1, 2, sim, confirmo, preciso remarcar..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 font-bold text-slate-900 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={handleTestEngine}
              className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Bot className="h-4 w-4 text-amber-400" /> Testar Motor
            </button>
            <button
              onClick={handleInjectReply}
              className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shadow-2xs flex items-center justify-center gap-1.5"
            >
              <Send className="h-4 w-4" /> Injetar na Conversa Real
            </button>
          </div>
        </div>

        {/* Panel 2: Engine Result */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs">
          <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Resultado da Avaliação
          </h3>

          {testResult ? (
            <div className="space-y-3 font-mono text-[11px]">
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Intenção Detectada:</span>
                <strong className="text-amber-800 font-bold">{testResult.detectedIntent}</strong>
              </div>
              <div className="flex justify-between p-2 bg-slate-50 rounded-lg">
                <span className="text-slate-500">Novo Status do Agendamento:</span>
                <strong className="text-emerald-700 font-bold">{testResult.targetAppointmentStatus || 'Sem alteração'}</strong>
              </div>
              <div className="p-3 bg-slate-900 text-slate-100 rounded-xl space-y-1">
                <span className="text-[10px] text-amber-400 font-bold uppercase block font-sans">
                  Resposta Automática Gerada:
                </span>
                <p className="font-sans text-xs leading-relaxed">{testResult.botReplyText}</p>
              </div>
            </div>
          ) : (
            <p className="text-slate-400 font-medium text-center py-8">
              Clique em "Testar Motor" para avaliar a simulação.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
