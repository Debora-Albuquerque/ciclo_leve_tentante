import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { TodayView } from './components/TodayView';
import { CalendarView } from './components/CalendarView';
import { ChatAssistantView } from './components/ChatAssistantView';
import { NotificationsView } from './components/NotificationsView';
import { CycleSettingsView } from './components/CycleSettingsView';
import { DailyLogModal } from './components/DailyLogModal';

import {
  UserProfile,
  PeriodEntry,
  DailyLog,
  NotificationSettings,
  ChatMessage,
  CycleActionPayload
} from './types/cycle';

import {
  calculateCycleSummary,
  formatDateISO,
  parseDateISO,
  addDays
} from './utils/cycleCalculations';

import {
  loadProfile,
  saveProfile,
  loadPeriods,
  savePeriods,
  loadLogs,
  saveLogs,
  loadNotifications,
  saveNotifications,
  loadChat,
  saveChat,
  resetAllData,
  getDefaultProfile,
  getDefaultPeriods,
  getDefaultNotifications,
  getDefaultChatMessages
} from './utils/storage';

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'today' | 'calendar' | 'chat' | 'notifications' | 'settings'
  >('today');

  // Application persistent state
  const [profile, setProfile] = useState<UserProfile>(() => loadProfile());
  const [periods, setPeriods] = useState<PeriodEntry[]>(() => loadPeriods());
  const [dailyLogs, setDailyLogs] = useState<Record<string, DailyLog>>(() =>
    loadLogs()
  );
  const [notifications, setNotifications] = useState<NotificationSettings>(() =>
    loadNotifications()
  );
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    loadChat()
  );
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Modal state
  const [logModal, setLogModal] = useState<{
    isOpen: boolean;
    dateStr: string;
  }>({
    isOpen: false,
    dateStr: formatDateISO(new Date()),
  });

  // Gentle Floating Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 3500);
  };

  // Sync state changes with localStorage
  useEffect(() => {
    saveProfile(profile);
  }, [profile]);

  useEffect(() => {
    savePeriods(periods);
  }, [periods]);

  useEffect(() => {
    saveLogs(dailyLogs);
  }, [dailyLogs]);

  useEffect(() => {
    saveNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveChat(chatMessages);
  }, [chatMessages]);

  // Derived cycle summary
  const summary = calculateCycleSummary(profile, periods);

  // Period management handlers
  const handleSetPeriodStart = (dateStr: string) => {
    const existingIndex = periods.findIndex((p) => p.startDate === dateStr);
    let updated: PeriodEntry[];

    if (existingIndex >= 0) {
      showToast('Esta data já está registrada como início de menstruação.');
      return;
    } else {
      const newEntry: PeriodEntry = {
        id: `p-${Date.now()}`,
        startDate: dateStr,
        endDate: formatDateISO(addDays(parseDateISO(dateStr), profile.periodLength - 1)),
        flow: 'moderado',
      };
      updated = [newEntry, ...periods].sort(
        (a, b) => parseDateISO(b.startDate).getTime() - parseDateISO(a.startDate).getTime()
      );
      setPeriods(updated);
      showToast(`✓ Início de ciclo registrado em ${dateStr}.`);
    }
  };

  const handleAddPeriod = (startDate: string, endDate?: string, notes?: string) => {
    const newEntry: PeriodEntry = {
      id: `p-${Date.now()}`,
      startDate,
      endDate: endDate || formatDateISO(addDays(parseDateISO(startDate), profile.periodLength - 1)),
      notes,
    };
    const updated = [newEntry, ...periods].sort(
      (a, b) => parseDateISO(b.startDate).getTime() - parseDateISO(a.startDate).getTime()
    );
    setPeriods(updated);
    showToast('✓ Ciclo menstrual adicionado ao histórico.');
  };

  const handleDeletePeriod = (id: string) => {
    const updated = periods.filter((p) => p.id !== id);
    setPeriods(updated);
    showToast('✓ Registro de ciclo excluído.');
  };

  // Daily log handlers
  const handleSaveDailyLog = (dateStr: string, log: DailyLog) => {
    setDailyLogs((prev) => ({
      ...prev,
      [dateStr]: log,
    }));
    showToast('✓ Sintomas e sinais registrados.');
  };

  const handleDeleteDailyLog = (dateStr: string) => {
    setDailyLogs((prev) => {
      const copy = { ...prev };
      delete copy[dateStr];
      return copy;
    });
    showToast('✓ Registros apagados para esta data.');
  };

  // Notification simulation & alerts
  const handleTriggerSimulatedNotification = (
    title: string,
    message: string,
    type: 'fertile' | 'ovulation' | 'period' | 'tip'
  ) => {
    const newAlert = {
      id: `alert-${Date.now()}`,
      title,
      message,
      date: formatDateISO(new Date()),
      read: false,
      type,
    };
    setNotifications((prev) => ({
      ...prev,
      alerts: [newAlert, ...prev.alerts],
    }));
    showToast(`🔔 Lembrete: ${title}`);
  };

  const handleApplyNotificationSuggestion = (text: string) => {
    handleTriggerSimulatedNotification('🌸 Dica CicloLeve', text, 'fertile');
  };

  const handleClearAlerts = () => {
    setNotifications((prev) => ({ ...prev, alerts: [] }));
    showToast('Histórico de lembretes limpo.');
  };

  // Profile save
  const handleSaveProfile = (updated: UserProfile) => {
    setProfile(updated);
    showToast('✓ Preferências e ciclo atualizados.');
  };

  const handleResetData = () => {
    resetAllData();
    setProfile(getDefaultProfile());
    setPeriods(getDefaultPeriods());
    setDailyLogs({});
    setNotifications(getDefaultNotifications());
    setChatMessages(getDefaultChatMessages());
    showToast('Dados restaurados para o padrão.');
  };

  // AI Assistant Chat Handler with action execution
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      role: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsChatLoading(true);

    // Build context object
    const cycleContext = {
      userName: profile.name,
      goal: profile.goal,
      cycleLength: profile.cycleLength,
      periodLength: profile.periodLength,
      lastPeriodDate: summary?.lastPeriodStartDate || null,
      currentCycleDay: summary?.currentCycleDay || null,
      isFertileNow: summary?.isFertileNow || false,
      isOvulationToday: summary?.isOvulationToday || false,
      daysToFertileWindow: summary?.daysToFertileWindow ?? null,
      daysToOvulation: summary?.daysToOvulation ?? null,
      daysToNextPeriod: summary?.daysToNextPeriod ?? null,
      recentLogs: Object.values(dailyLogs).slice(-4),
    };

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: chatMessages.map((m) => ({ role: m.role, text: m.text })),
          context: cycleContext,
        }),
      });

      if (!response.ok) {
        throw new Error(`Servidor respondeu com status ${response.status}`);
      }

      const data = await response.json();
      let actionConfirmationMessage = '';

      // Execute extracted action if present
      if (data.action && data.action.type && data.action.type !== 'NONE') {
        const action: CycleActionPayload = data.action;
        const targetDate =
          !action.date || action.date === 'hoje'
            ? formatDateISO(new Date())
            : action.date;

        switch (action.type) {
          case 'ADD_PERIOD_START': {
            handleSetPeriodStart(targetDate);
            actionConfirmationMessage = `Menstruação registrada para ${targetDate}`;
            break;
          }
          case 'DELETE_ENTRY': {
            handleDeleteDailyLog(targetDate);
            actionConfirmationMessage = `Registros apagados para ${targetDate}`;
            break;
          }
          case 'UPDATE_CYCLE_LENGTH': {
            if (action.cycleLength && action.cycleLength >= 20 && action.cycleLength <= 45) {
              setProfile((p) => ({ ...p, cycleLength: action.cycleLength! }));
              actionConfirmationMessage = `Duração do ciclo alterada para ${action.cycleLength} dias`;
            }
            break;
          }
          case 'UPDATE_PERIOD_LENGTH': {
            if (action.periodLength) {
              setProfile((p) => ({ ...p, periodLength: action.periodLength! }));
              actionConfirmationMessage = `Duração da menstruação alterada para ${action.periodLength} dias`;
            }
            break;
          }
          case 'UPDATE_PROFILE': {
            if (action.userName) {
              setProfile((p) => ({ ...p, name: action.userName! }));
              actionConfirmationMessage = `Nome atualizado para ${action.userName}`;
            }
            break;
          }
          case 'LOG_ENTRY': {
            setDailyLogs((prev) => {
              const current = prev[targetDate] || { date: targetDate };
              return {
                ...prev,
                [targetDate]: {
                  ...current,
                  mucus: action.mucus || current.mucus,
                  flow: action.flow || current.flow,
                  intercourse: action.intercourse !== undefined ? action.intercourse : current.intercourse,
                  ovulationTest: action.ovulationTest || current.ovulationTest,
                  notes: action.notes || current.notes,
                },
              };
            });
            actionConfirmationMessage = `Sinais registrados para ${targetDate}`;
            break;
          }
        }
      }

      const modelMsg: ChatMessage = {
        id: `mod-${Date.now()}`,
        role: 'model',
        text: data.replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        suggestedNotification: data.suggestedNotification,
        actionApplied: actionConfirmationMessage || undefined,
      };

      setChatMessages((prev) => [...prev, modelMsg]);
    } catch (err) {
      console.error('Error contacting chat endpoint:', err);
      // Resilient gentle fallback
      const fallbackMsg: ChatMessage = {
        id: `mod-${Date.now()}`,
        role: 'model',
        text: `- **Resumo do Ciclo:** Olá, ${profile.name || 'Débora'}! Você está no Dia ${summary?.currentCycleDay || 13} do ciclo, ${summary?.isFertileNow ? 'em sua janela fértil' : 'em acompanhamento normal'}.
- **Próximos Passos / Dica do Dia:** Observe os sinais naturais do seu corpo (como o muco cervical elástico e transparente) e viva este momento com leveza e sem pressa.
- **Ação:** Seus dados locais permanecem salvos em segurança no seu aparelho. O que gostaria de registrar hoje?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const handleQuickChatPrompt = (prompt: string) => {
    setActiveTab('chat');
    handleSendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-[#FAF7F5] text-[#2D2A26] flex flex-col font-sans selection:bg-[#E0A899]/30">
      {/* App Header & Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        profile={profile}
        notifications={notifications}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 pt-5 pb-12">
        {activeTab === 'today' && (
          <TodayView
            summary={summary}
            profile={profile}
            todayLog={dailyLogs[formatDateISO(new Date())]}
            onOpenLogModal={() =>
              setLogModal({ isOpen: true, dateStr: formatDateISO(new Date()) })
            }
            onNavigateToTab={(tab) => setActiveTab(tab)}
            onQuickChatPrompt={handleQuickChatPrompt}
          />
        )}

        {activeTab === 'calendar' && (
          <CalendarView
            profile={profile}
            periods={periods}
            dailyLogs={dailyLogs}
            onSelectDateToLog={(dateStr) =>
              setLogModal({ isOpen: true, dateStr })
            }
            onSetPeriodStart={handleSetPeriodStart}
            onDeleteLogForDate={handleDeleteDailyLog}
          />
        )}

        {activeTab === 'chat' && (
          <ChatAssistantView
            messages={chatMessages}
            onSendMessage={handleSendMessage}
            isLoading={isChatLoading}
            profile={profile}
            summary={summary}
            onApplyNotificationSuggestion={handleApplyNotificationSuggestion}
            onClearChatHistory={() => setChatMessages(getDefaultChatMessages())}
          />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView
            settings={notifications}
            profile={profile}
            summary={summary}
            onUpdateSettings={setNotifications}
            onTriggerSimulatedNotification={handleTriggerSimulatedNotification}
            onClearAlerts={handleClearAlerts}
          />
        )}

        {activeTab === 'settings' && (
          <CycleSettingsView
            profile={profile}
            periods={periods}
            onSaveProfile={handleSaveProfile}
            onAddPeriod={handleAddPeriod}
            onDeletePeriod={handleDeletePeriod}
            onResetData={handleResetData}
          />
        )}
      </main>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-20 md:bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-[#2D2A26] text-white px-4 py-2.5 rounded-full text-xs font-medium shadow-xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Daily Log Modal */}
      <DailyLogModal
        isOpen={logModal.isOpen}
        onClose={() => setLogModal({ isOpen: false, dateStr: logModal.dateStr })}
        dateStr={logModal.dateStr}
        initialLog={dailyLogs[logModal.dateStr]}
        onSaveLog={handleSaveDailyLog}
        onDeleteLog={handleDeleteDailyLog}
      />
    </div>
  );
}
