import React from 'react';
import { MainView } from '../types/chatwoot';
import { SandiegoLogo } from './SandiegoLogo';
import sandiegoLogoSvg from '../assets/sandiego-logo.svg';
import { useChatStore } from '../store/useChatStore';
import {
  MessageSquare,
  UploadCloud,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from 'lucide-react';
import { toast } from 'sonner';

interface MainNavigationProps {
  currentView: MainView;
  onSelectView: (view: MainView) => void;
}

export function MainNavigation({ currentView, onSelectView }: MainNavigationProps) {
  const { isSidebarCollapsed, toggleSidebarCollapsed, conversations, logout, userRole, userDisplayName } = useChatStore();

  const handleLogout = () => {
    logout();
    toast.success('Sessão encerrada. Até logo!');
  };

  // Avatar initials + email based on role
  const avatarInitials = userRole === 'master' ? 'MA' : 'RS';
  const userEmail = userRole === 'master' ? 'ivoavancini@hotmail.com' : 'recepcao@clinicasandiego.com.br';

  const totalUnread = conversations.reduce((acc, c) => acc + (c.unreadCount || 0), 0);

  const mainItems: { view: MainView; label: string; icon: React.ElementType; badge?: number }[] = [
    { view: 'chat', label: 'Conversas', icon: MessageSquare, badge: totalUnread },
    { view: 'importer', label: 'Importação e Disparos', icon: UploadCloud },
  ];

  const systemItems: { view: MainView; label: string; icon: React.ElementType }[] = [
    { view: 'automations', label: 'Configurações', icon: Settings },
  ];

  return (
    <aside
      className={`${
        isSidebarCollapsed ? 'w-16' : 'w-64'
      } bg-[#0A1124] border-r border-slate-800/80 flex flex-col justify-between py-4 transition-all duration-300 shrink-0 select-none z-20 overflow-hidden`}
    >
      {/* Top Section */}
      <div className="flex flex-col gap-4">
        {/* Header with Logo & Collapse Control (Layout Limpo sem sobreposição) */}
        <div className={`px-3 flex items-center pb-2 ${isSidebarCollapsed ? 'justify-center' : 'justify-between'}`}>
          {!isSidebarCollapsed ? (
            <>
              <button
                onClick={() => onSelectView('chat')}
                className="flex items-center gap-2.5 transition hover:opacity-95 cursor-pointer min-w-0 overflow-hidden"
                title="Sandiego — Clínica Médica e Vacinas"
              >
                <SandiegoLogo variant="full" size="sm" />
              </button>

              <button
                onClick={toggleSidebarCollapsed}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/50 shadow-2xs transition cursor-pointer shrink-0"
                title="Recolher menu"
              >
                <ChevronLeft className="h-4 w-4 text-slate-300" />
              </button>
            </>
          ) : (
            <button
              onClick={toggleSidebarCollapsed}
              className="p-2 rounded-xl text-amber-400 bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 shadow-2xs transition cursor-pointer flex items-center justify-center"
              title="Expandir menu"
            >
              <ChevronRight className="h-5 w-5 text-amber-400" />
            </button>
          )}
        </div>

        {/* Category 1: PRINCIPAL */}
        <div className="px-2 space-y-1">
          {!isSidebarCollapsed && (
            <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
              PRINCIPAL
            </span>
          )}

          {mainItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onSelectView(item.view)}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs font-bold transition cursor-pointer relative ${
                  active
                    ? 'bg-[#C59B27] text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {!isSidebarCollapsed && !!item.badge && item.badge > 0 && (
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                    active ? 'bg-slate-950 text-amber-400' : 'bg-amber-400 text-slate-950'
                  }`}>
                    {item.badge}
                  </span>
                )}

                {active && (
                  <span className="absolute -left-1 top-2 bottom-2 w-1.5 bg-amber-300 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>

        {/* Category 2: SISTEMA */}
        <div className="px-2 space-y-1 pt-2">
          {!isSidebarCollapsed && (
            <span className="px-3 text-[10px] font-black uppercase tracking-widest text-slate-500 block mb-1">
              SISTEMA
            </span>
          )}

          {systemItems.map((item) => {
            const Icon = item.icon;
            const active = currentView === item.view;
            return (
              <button
                key={item.view}
                onClick={() => onSelectView(item.view)}
                className={`w-full flex items-center ${
                  isSidebarCollapsed ? 'justify-center px-0 py-2.5' : 'justify-between px-3.5 py-2.5'
                } rounded-xl text-xs font-bold transition cursor-pointer relative ${
                  active
                    ? 'bg-[#C59B27] text-slate-950 shadow-md font-black'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                }`}
                title={isSidebarCollapsed ? item.label : undefined}
              >
                <div className="flex items-center gap-3 truncate">
                  <Icon className={`h-4.5 w-4.5 shrink-0 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                  {!isSidebarCollapsed && <span className="truncate">{item.label}</span>}
                </div>

                {active && (
                  <span className="absolute -left-1 top-2 bottom-2 w-1.5 bg-amber-300 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* User Login Profile & Logout Card */}
      <div className="px-2">
        {!isSidebarCollapsed ? (
          <div className="bg-gradient-to-b from-[#101935] to-[#0b1226] border border-slate-800/80 rounded-xl p-2.5 shadow-lg space-y-2">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src={sandiegoLogoSvg}
                  alt="Sandiego"
                  className="h-8 w-8 rounded-full bg-white p-0.5 object-contain border border-[#C59B27]/40 shrink-0 shadow-xs"
                />

                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-white truncate leading-tight">
                    {userDisplayName}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate leading-tight mt-0.5 font-medium">
                    {userEmail}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition cursor-pointer shrink-0"
                title="Sair do Sistema"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="border-t border-slate-800/60 pt-1.5 flex items-center justify-between text-[9px] font-bold text-slate-500">
              <span className="uppercase tracking-widest text-[8px] text-slate-400 font-extrabold">POWERED BY</span>
              <span className="text-[#C59B27] font-black tracking-wider">Avancini OS</span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2.5 py-1">
            <img
              src={sandiegoLogoSvg}
              alt="Sandiego"
              className="h-8 w-8 rounded-full bg-white p-0.5 object-contain border border-[#C59B27]/40 shrink-0 shadow-xs"
              title={`${userDisplayName} (${userEmail})`}
            />
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition cursor-pointer"
              title="Sair do Sistema"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
