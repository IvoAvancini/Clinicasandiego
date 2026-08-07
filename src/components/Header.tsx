import React from 'react';
import { MainView } from '../types/chatwoot';

interface HeaderProps {
  currentView: MainView;
}

const VIEW_TITLES: Record<MainView, { title: string; subtitle: string }> = {
  chat: {
    title: 'Central de Confirmações e Atendimento',
    subtitle: 'Atendimento, triagem e confirmações pelo WhatsApp',
  },
  importer: {
    title: 'Importação & Disparo em Lote',
    subtitle: 'Carregue sua planilha e autorize disparos controlados',
  },
  automations: {
    title: 'Configurações de Automações & Integrações',
    subtitle: 'Configure regras determinísticas, respostas rápidas e credenciais de API',
  },
  sandbox: {
    title: 'Modo de Testes (Sandbox)',
    subtitle: 'Ambiente isolado para testadores e desenvolvedores',
  },
};

export function Header({ currentView }: HeaderProps) {
  const viewInfo = VIEW_TITLES[currentView] || VIEW_TITLES.chat;

  return (
    <header className="h-14 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0 select-none shadow-2xs z-10">
      {/* Clean Title & Subtitle Strictly Without Duplicated Metrics */}
      <div>
        <h1 className="text-sm font-black text-slate-900 tracking-tight font-['Plus_Jakarta_Sans'] flex items-center gap-2">
          {viewInfo.title}
        </h1>
        <p className="text-[10px] text-slate-500 font-medium">{viewInfo.subtitle}</p>
      </div>

      {/* Discrete Receptionist Profile Badge */}
      <div className="flex items-center gap-2.5">
        <div className="text-right hidden sm:block">
          <span className="text-xs font-black text-slate-900 block leading-tight">
            Recepção Sandiego
          </span>
          <span className="text-[10px] text-slate-500 font-bold block leading-tight">
            Atendente Ativo
          </span>
        </div>
        <div className="h-8 w-8 rounded-full bg-slate-900 text-amber-400 font-extrabold flex items-center justify-center text-xs shadow-2xs border border-slate-800">
          RS
        </div>
      </div>
    </header>
  );
}
