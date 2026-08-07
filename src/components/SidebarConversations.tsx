import React from 'react';
import { useChatStore } from '../store/useChatStore';
import { InboxFilterTab, PatientConversation } from '../types/chatwoot';
import { Search, CheckCircle2, RefreshCw, Inbox } from 'lucide-react';
import { WhatsAppConnectionCard } from './WhatsAppConnectionCard';

export function SidebarConversations() {
  const {
    conversations,
    activeConversationId,
    activeFilterTab,
    searchQuery,
    setActiveConversationId,
    setActiveFilterTab,
    setSearchQuery,
  } = useChatStore();

  const totalAll = conversations.length;
  const totalAwaitingClinic = conversations.filter((c) => c.conversationStatus === 'awaiting_clinic').length;
  const totalAwaitingPatient = conversations.filter((c) => c.conversationStatus === 'awaiting_patient').length;
  const totalReschedule = conversations.filter(
    (c) =>
      c.appointmentStatus === 'reschedule_requested' ||
      c.appointmentStatus === 'reschedule_in_progress' ||
      c.followUpStatus === 'no_return'
  ).length;

  const filteredConversations = conversations.filter((c) => {
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      c.patientName.toLowerCase().includes(query) ||
      c.patientPhone.includes(query) ||
      c.doctorName.toLowerCase().includes(query) ||
      c.specialty.toLowerCase().includes(query);

    if (!matchesQuery) return false;

    // 4 Exact Tabs Rules
    if (activeFilterTab === 'awaiting_clinic')
      return c.conversationStatus === 'awaiting_clinic';
    if (activeFilterTab === 'awaiting_patient')
      return c.conversationStatus === 'awaiting_patient';
    if (activeFilterTab === 'reschedule')
      return (
        c.appointmentStatus === 'reschedule_requested' ||
        c.appointmentStatus === 'reschedule_in_progress' ||
        c.followUpStatus === 'no_return'
      );

    return true; // 'all'
  });

  const getStatusBadges = (conv: PatientConversation) => {
    const badges = [];

    if (conv.appointmentStatus === 'confirmed') {
      badges.push(
        <span key="conf" className="inline-flex items-center gap-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-black shrink-0">
          <CheckCircle2 className="h-3 w-3" /> Confirmado
        </span>
      );
    }
    if (conv.appointmentStatus === 'reschedule_requested' || conv.appointmentStatus === 'reschedule_in_progress') {
      badges.push(
        <span key="resch" className="inline-flex items-center gap-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 text-[10px] font-black shrink-0">
          <RefreshCw className="h-3 w-3" /> Reagendamento
        </span>
      );
    }
    if (conv.conversationStatus === 'awaiting_clinic' && conv.appointmentStatus !== 'confirmed') {
      badges.push(
        <span key="clinic" className="inline-flex items-center gap-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 text-[10px] font-black shrink-0">
          Precisa responder
        </span>
      );
    }

    return badges;
  };

  const getTabBadgeCount = (tab: InboxFilterTab) => {
    if (tab === 'all') return totalAll;
    if (tab === 'awaiting_clinic') return totalAwaitingClinic;
    if (tab === 'awaiting_patient') return totalAwaitingPatient;
    if (tab === 'reschedule') return totalReschedule;
    return 0;
  };

  return (
    <aside className="w-full lg:w-[350px] bg-white border-r border-slate-200 flex flex-col shrink-0 select-none h-full">
      {/* WhatsApp Connection Card Bar */}
      <div className="p-2 border-b border-slate-200 bg-slate-50">
        <WhatsAppConnectionCard />
      </div>

      {/* Search Header */}
      <div className="p-3 border-b border-slate-200 space-y-2.5 bg-slate-50/50">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por paciente, telefone ou médico..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-amber-500 transition shadow-2xs"
          />
        </div>

        {/* 4 Exact Core Tabs Clean & Compact */}
        <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-none text-[11px]">
          {(
            [
              ['all', 'Todas'],
              ['awaiting_clinic', 'Precisa responder'],
              ['awaiting_patient', 'Aguardando paciente'],
              ['reschedule', 'Reagendamentos'],
            ] as [InboxFilterTab, string][]
          ).map(([tab, label]) => {
            const active = activeFilterTab === tab;
            const count = getTabBadgeCount(tab);
            return (
              <button
                key={tab}
                onClick={() => setActiveFilterTab(tab)}
                className={`px-2 py-1 rounded-lg font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1 ${
                  active
                    ? 'bg-slate-900 text-white font-black shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <span>{label}</span>
                <span
                  className={`text-[9px] px-1.5 py-0.2 rounded-full font-black ${
                    active ? 'bg-amber-400 text-slate-950' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Conversation List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredConversations.length === 0 ? (
          <div className="p-8 text-center text-slate-400 space-y-2">
            <Inbox className="h-8 w-8 mx-auto opacity-30 text-slate-400" />
            <p className="text-xs font-bold text-slate-600">
              Nenhuma conversa encontrada nesta aba.
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const isSelected = activeConversationId === conv.id;
            const lastMsg = conv.messages[conv.messages.length - 1];

            return (
              <div
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                className={`p-3.5 transition cursor-pointer relative ${
                  isSelected
                    ? 'bg-slate-100/90 border-l-4 border-[#b8860b] shadow-2xs'
                    : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex items-center gap-1.5">
                    {conv.unreadCount > 0 && (
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
                    )}
                    <h3 className={`text-xs text-slate-900 truncate ${conv.unreadCount > 0 ? 'font-black' : 'font-extrabold'}`}>
                      {conv.patientName}
                    </h3>
                  </div>

                  <span className="text-[10px] font-bold text-slate-400 shrink-0">
                    {conv.lastActivity}
                  </span>
                </div>

                {/* 1-Line Clean Snippet with Ellipsis */}
                {lastMsg && (
                  <p className="mt-1 text-[11px] text-slate-600 truncate font-normal">
                    {lastMsg.text}
                  </p>
                )}

                <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px] text-slate-500 font-bold">
                  <span className="truncate">
                    {conv.doctorName} · <span className="text-slate-400">{conv.specialty}</span>
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    {getStatusBadges(conv)}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
