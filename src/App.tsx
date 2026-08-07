import React, { useState } from 'react';
import { useChatStore } from './store/useChatStore';
import { MainView } from './types/chatwoot';
import { MainNavigation } from './components/MainNavigation';
import { Header } from './components/Header';
import { SidebarConversations } from './components/SidebarConversations';
import { ChatArea } from './components/ChatArea';
import { PatientDetailsSidebar } from './components/PatientDetailsSidebar';
import { ImporterView } from './components/ImporterView';
import { SettingsAutomationView } from './components/SettingsAutomationView';
import { SandboxView } from './components/SandboxView';
import { LoginView } from './components/LoginView';
import { Toaster } from 'sonner';

export function App() {
  const [currentView, setCurrentView] = useState<MainView>('chat');
  const { isMobileChatOpen, isAuthenticated } = useChatStore();

  // Se não autenticado, mostra a tela de login
  if (!isAuthenticated) {
    return (
      <>
        <Toaster position="top-right" richColors />
        <LoginView />
      </>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans text-slate-900 antialiased select-none">
      <Toaster position="top-right" richColors />

      <MainNavigation currentView={currentView} onSelectView={setCurrentView} />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <Header currentView={currentView} />

        <div className="flex-1 flex min-w-0 overflow-hidden relative">
          {currentView === 'chat' && (
            <>
              <div
                className={`h-full border-r border-slate-200 shrink-0 ${
                  isMobileChatOpen ? 'hidden lg:block' : 'w-full lg:w-auto'
                }`}
              >
                <SidebarConversations />
              </div>

              <div
                className={`flex-1 flex min-w-0 h-full ${
                  !isMobileChatOpen ? 'hidden lg:flex' : 'flex'
                }`}
              >
                <ChatArea />
                <PatientDetailsSidebar />
              </div>
            </>
          )}

          {currentView === 'importer' && <ImporterView />}
          {currentView === 'automations' && <SettingsAutomationView />}
          {currentView === 'sandbox' && <SandboxView />}
        </div>
      </div>
    </div>
  );
}

export default App;
