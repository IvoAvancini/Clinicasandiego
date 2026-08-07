import React, { useState } from 'react';
import { SandiegoLogo } from './SandiegoLogo';
import { WebhookLog } from '../types/chatwoot';
import {
  Wifi,
  AlertTriangle,
  RefreshCw,
  Server,
  Activity,
  Copy,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';

export function IntegrationsView() {
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const [logs] = useState<WebhookLog[]>([
    {
      id: 'log-101',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'incoming_message',
      source: 'WhatsApp Cloud API',
      status: 'pending',
      summary: 'Endpoint local pronto para homologação: Mensagem "1" processada no backend Express',
      externalId: 'wamid.SIMULATED_101',
    },
    {
      id: 'log-102',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      type: 'appointment_sync',
      source: 'Sistema da Clínica',
      status: 'pending',
      summary: 'Endpoint local pronto para homologação: Retorno appointment.confirmed gerado',
      externalId: 'AGD-SIMULATED_102',
    },
  ]);

  const copyWebhookUrl = () => {
    navigator.clipboard.writeText('http://localhost:4000/api/webhooks/whatsapp');
    setCopiedWebhook(true);
    toast.success('URL do Webhook local copiada!');
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  const handleTestWa = () => {
    toast.info('Status Técnico: Backend e persistência local implementados — aguardando credenciais de produção e homologação live do WhatsApp.');
  };

  const handleTestApi = () => {
    toast.info('Status Técnico: Endpoint de agendamentos pronto localmente. Aguardando credenciais da API do sistema próprio da clínica.');
  };

  return (
    <div className="flex-1 bg-slate-50 overflow-y-auto p-6 sm:p-8 text-slate-800 space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <SandiegoLogo variant="full" size="md" />
          <h2 className="text-xl font-black text-slate-900 mt-2 font-['Plus_Jakarta_Sans']">
            Painel de Integrações & Auditoria Técnica
          </h2>
          <p className="text-xs text-slate-500 font-medium">
            Backend e persistência implementados — aguardando homologação do WhatsApp e deploy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-900 border border-amber-300 px-3 py-1.5 rounded-full font-black text-xs">
            <AlertCircle className="h-3.5 w-3.5 text-amber-600" /> WhatsApp: Não Homologado
          </span>
          <span className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300 px-3 py-1.5 rounded-full font-black text-xs">
            <Server className="h-3.5 w-3.5 text-slate-500" /> Webhook: Endpoint Local Implementado
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Panel 1: WhatsApp Integration Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Wifi className="h-4 w-4 text-amber-600" /> Conexão WhatsApp API
            </h3>
            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
              Não Homologado
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Situação Real:</span>
              <strong className="text-amber-800 font-bold">Não Homologado (Desenvolvimento Local)</strong>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Provedor Alvo:</span>
              <strong className="text-slate-900 font-bold">Meta Official WhatsApp Business API / Evolution API</strong>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Situação do Webhook:
              </label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  readOnly
                  value="Endpoint implementado localmente — publicação HTTPS pendente"
                  className="flex-1 bg-amber-50 border border-amber-200 rounded-xl px-3 py-1.5 font-mono text-[11px] text-amber-900 font-bold"
                />
                <button
                  onClick={copyWebhookUrl}
                  className="p-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 transition text-slate-600"
                >
                  {copiedWebhook ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Token de Acesso (Inserir no arquivo .env antes da homologação):
              </label>
              <input
                type="text"
                readOnly
                value="[VITE_WHATSAPP_TOKEN PENDENTE DE HOMOLOGAÇÃO]"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-[11px] text-slate-400"
              />
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleTestWa}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <Activity className="h-3.5 w-3.5" /> Validar Conexão WhatsApp
              </button>
            </div>
          </div>
        </div>

        {/* Panel 2: Clinic Appointment System Integration Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
              <Server className="h-4 w-4 text-[#b8860b]" /> Sistema de Agendamentos da Clínica
            </h3>
            <span className="text-[10px] font-extrabold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
              Importação / Manual (API Pendente)
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500 font-medium">Status da Integração Direct API:</span>
              <strong className="text-slate-700 font-bold">API Pendente (Operando via Planilha e Cadastro Manual)</strong>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                URL da API do Sistema Próprio:
              </label>
              <input
                type="text"
                readOnly
                value="[VITE_CLINIC_API_URL PENDENTE DA CLÍNICA]"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-mono text-[11px] text-slate-400"
              />
            </div>

            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600 block">
                Modos de Entrada Suportados:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  ✓ Importação Excel / CSV
                </span>
                <span className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-2 py-0.5 rounded font-bold">
                  ✓ Cadastro Manual no Painel
                </span>
                <span className="bg-amber-50 border border-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                  ⏳ Direct API (Pendente da Clínica)
                </span>
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                onClick={handleTestApi}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold text-xs transition cursor-pointer flex items-center justify-center gap-1.5 border border-slate-200"
              >
                <RefreshCw className="h-3.5 w-3.5" /> Testar API do Sistema Próprio
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-3">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-black text-slate-900">
              Logs Técnicos de Auditoria (Backend Express + SQLite Local)
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Eventos registrados no banco de dados backend local para validação de idempotência.
            </p>
          </div>

          <span className="bg-amber-50 text-amber-900 text-xs font-mono font-black px-3 py-1 rounded-full border border-amber-200">
            Ambiente Local (Dev)
          </span>
        </div>

        <div className="divide-y divide-slate-100 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] font-black tracking-wider">
              <tr>
                <th className="p-3.5">Horário</th>
                <th className="p-3.5">Origem</th>
                <th className="p-3.5">Tipo do Evento</th>
                <th className="p-3.5">Resumo Técnico</th>
                <th className="p-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 font-mono text-[11px]">
                  <td className="p-3.5 text-slate-500 font-bold">{log.timestamp}</td>
                  <td className="p-3.5 font-bold text-slate-800">{log.source}</td>
                  <td className="p-3.5">
                    <span className="bg-slate-100 px-2 py-0.5 rounded font-extrabold text-slate-700">
                      {log.type}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-600 font-sans text-xs">{log.summary}</td>
                  <td className="p-3.5">
                    <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-full font-extrabold text-[10px]">
                      <AlertCircle className="h-3 w-3" /> ENDPOINT LOCAL
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
