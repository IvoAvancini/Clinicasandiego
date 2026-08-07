import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { SandiegoLogo } from './SandiegoLogo';
import {
  CheckCircle2,
  RefreshCw,
  XCircle,
  Clock,
  AlertTriangle,
  Users,
  TrendingUp,
} from 'lucide-react';

export function DashboardView() {
  const { conversations } = useChatStore();

  const total = conversations.length;
  const confirmed = conversations.filter((c) => c.appointmentStatus === 'confirmed').length;
  const reschedule = conversations.filter((c) => c.appointmentStatus === 'reschedule_requested').length;
  const cancel = conversations.filter((c) => c.appointmentStatus === 'cancellation_requested').length;
  const pending = conversations.filter((c) => c.appointmentStatus === 'awaiting_patient' || c.appointmentStatus === 'awaiting_dispatch').length;
  const awaitingClinic = conversations.filter((c) => c.conversationStatus === 'awaiting_clinic').length;
  const errors = conversations.filter((c) => c.appointmentStatus === 'send_error').length;

  const confirmationRate = total > 0 ? Math.round((confirmed / total) * 100) : 0;

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 sm:p-8 text-slate-800 space-y-6 select-none">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <SandiegoLogo variant="full" size="md" />
          <h2 className="text-xl font-black text-slate-900 mt-2 font-['Plus_Jakarta_Sans']">
            Dashboard de Confirmações & Indicadores
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Desempenho geral da Clínica Sandiego — Clínica Médica e Vacinas.
          </p>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Taxa de Confirmação
            </span>
            <TrendingUp className="h-5 w-5 text-emerald-600" />
          </div>
          <strong className="text-3xl font-black text-emerald-600 block">
            {confirmationRate}%
          </strong>
          <p className="text-[11px] text-slate-400 font-medium">
            {confirmed} de {total} consultas confirmadas
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Confirmadas
            </span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <strong className="text-3xl font-black text-slate-900 block">{confirmed}</strong>
          <p className="text-[11px] text-slate-400 font-medium">Presenças garantidas</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reagendamentos
            </span>
            <RefreshCw className="h-5 w-5 text-amber-600" />
          </div>
          <strong className="text-3xl font-black text-amber-600 block">{reschedule}</strong>
          <p className="text-[11px] text-slate-400 font-medium">Encaminhados para a recepção</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Aguardando Paciente
            </span>
            <Clock className="h-5 w-5 text-slate-400" />
          </div>
          <strong className="text-3xl font-black text-slate-700 block">{pending}</strong>
          <p className="text-[11px] text-slate-400 font-medium">Pacientes notificados</p>
        </div>
      </div>

      {/* Secondary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Cancelamentos</span>
            <strong className="text-xl font-black text-rose-600 block mt-1">{cancel}</strong>
          </div>
          <XCircle className="h-8 w-8 text-rose-500/20" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">
              Aguardando Clínica
            </span>
            <strong className="text-xl font-black text-blue-600 block mt-1">{awaitingClinic}</strong>
          </div>
          <Users className="h-8 w-8 text-blue-500/20" />
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase">Erros de Envio</span>
            <strong className="text-xl font-black text-slate-600 block mt-1">{errors}</strong>
          </div>
          <AlertTriangle className="h-8 w-8 text-slate-400/20" />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-sm font-black text-slate-900">
            Próximas Consultas & Situação de Confirmação
          </h3>
          <span className="text-xs text-slate-500 font-medium">Hoje</span>
        </div>

        <div className="divide-y divide-slate-100">
          {conversations.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-xs">
                  {c.patientName.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xs font-black text-slate-900">{c.patientName}</h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {c.doctorName} · {c.specialty} ({c.insurance})
                  </p>
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-slate-900 block">{c.appointmentTime}</span>
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded-full inline-block mt-0.5 ${
                    c.appointmentStatus === 'confirmed'
                      ? 'bg-emerald-100 text-emerald-700'
                      : c.appointmentStatus === 'reschedule_requested'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {c.appointmentStatus === 'confirmed' && 'Confirmado'}
                  {c.appointmentStatus === 'reschedule_requested' && 'Reagendamento'}
                  {c.appointmentStatus === 'awaiting_patient' && 'Aguardando'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
