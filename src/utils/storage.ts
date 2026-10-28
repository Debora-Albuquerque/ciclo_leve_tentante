import {
  UserProfile,
  PeriodEntry,
  DailyLog,
  NotificationSettings,
  ChatMessage,
  SimulatedAlert
} from '../types/cycle';
import { formatDateISO, addDays } from './cycleCalculations';

const STORAGE_KEY_PROFILE = 'cicloLeve_profile_v1';
const STORAGE_KEY_PERIODS = 'cicloLeve_periods_v1';
const STORAGE_KEY_LOGS = 'cicloLeve_logs_v1';
const STORAGE_KEY_NOTIF = 'cicloLeve_notifications_v1';
const STORAGE_KEY_CHAT = 'cicloLeve_chat_v1';

export function getDefaultProfile(): UserProfile {
  return {
    name: 'Débora',
    goal: 'tentando',
    cycleLength: 28,
    periodLength: 5,
    lutealPhase: 14,
  };
}

export function getDefaultPeriods(): PeriodEntry[] {
  // Set default period starting 12 days ago so user is currently in fertile window (Day 13)
  const today = new Date();
  const twelveDaysAgo = addDays(today, -12);
  const fortyDaysAgo = addDays(today, -40);

  return [
    {
      id: 'p-1',
      startDate: formatDateISO(twelveDaysAgo),
      endDate: formatDateISO(addDays(twelveDaysAgo, 4)),
      flow: 'moderado',
      notes: 'Ciclo iniciado pontualmente',
    },
    {
      id: 'p-0',
      startDate: formatDateISO(fortyDaysAgo),
      endDate: formatDateISO(addDays(fortyDaysAgo, 4)),
      flow: 'moderado',
    },
  ];
}

export function getDefaultNotifications(): NotificationSettings {
  const todayStr = formatDateISO(new Date());
  return {
    enabled: true,
    nativeGranted: false,
    remindDaysBeforeFertile: 2,
    remindOvulation: true,
    remindPeriod: true,
    alerts: [
      {
        id: 'alt-1',
        title: '🌸 Janela Fértil se Aproximando',
        message: 'Dica: Faltam 2 dias para a sua janela fértil começar. Que tal preparar o coração e relaxar?',
        date: todayStr,
        read: false,
        type: 'fertile',
      },
      {
        id: 'alt-2',
        title: '✨ Autocuidado e Hidratação',
        message: 'Beba bastante água hoje. Uma boa hidratação ajuda na qualidade natural do muco cervical fértil.',
        date: todayStr,
        read: true,
        type: 'tip',
      },
    ],
  };
}

export function getDefaultChatMessages(): ChatMessage[] {
  return [
    {
      id: 'msg-welcome',
      role: 'model',
      text: `- **Resumo do Ciclo:** Olá, Débora! Você está no **Dia 13 do seu ciclo**, em plena **Janela Fértil** com ovulação provável amanhã.
- **Próximos Passos / Dica do Dia:** O muco cervical com aspecto de clara de ovo e a sensação de umidade indicam máxima fertilidade. Aproveite o momento com leveza e intimidade sem pressa.
- **Ação:** Estou pronta para te apoiar! Você pode me pedir coisas como *"adicione que menstruei hoje"*, *"apague o registro de ontem"* ou me contar como está se sentindo.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      suggestedNotification: 'Dica: Você está na sua janela fértil. Respire fundo e viva o momento com calma.',
    },
  ];
}

export function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return getDefaultProfile();
    return JSON.parse(raw);
  } catch {
    return getDefaultProfile();
  }
}

export function saveProfile(profile: UserProfile): void {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (e) {
    console.error('Failed to save profile:', e);
  }
}

export function loadPeriods(): PeriodEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PERIODS);
    if (!raw) return getDefaultPeriods();
    return JSON.parse(raw);
  } catch {
    return getDefaultPeriods();
  }
}

export function savePeriods(periods: PeriodEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_PERIODS, JSON.stringify(periods));
  } catch (e) {
    console.error('Failed to save periods:', e);
  }
}

export function loadLogs(): Record<string, DailyLog> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LOGS);
    if (!raw) {
      // Sample log for today
      const todayStr = formatDateISO(new Date());
      return {
        [todayStr]: {
          date: todayStr,
          mucus: 'clara_de_ovo',
          symptoms: ['Disposição alta', 'Sensação de umidade'],
          intercourse: false,
          ovulationTest: 'positivo',
          notes: 'Muco elástico e translúcido',
        },
      };
    }
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

export function saveLogs(logs: Record<string, DailyLog>): void {
  try {
    localStorage.setItem(STORAGE_KEY_LOGS, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save logs:', e);
  }
}

export function loadNotifications(): NotificationSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_NOTIF);
    if (!raw) return getDefaultNotifications();
    return JSON.parse(raw);
  } catch {
    return getDefaultNotifications();
  }
}

export function saveNotifications(settings: NotificationSettings): void {
  try {
    localStorage.setItem(STORAGE_KEY_NOTIF, JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save notifications:', e);
  }
}

export function loadChat(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CHAT);
    if (!raw) return getDefaultChatMessages();
    return JSON.parse(raw);
  } catch {
    return getDefaultChatMessages();
  }
}

export function saveChat(chat: ChatMessage[]): void {
  try {
    localStorage.setItem(STORAGE_KEY_CHAT, JSON.stringify(chat));
  } catch (e) {
    console.error('Failed to save chat:', e);
  }
}

export function resetAllData(): void {
  localStorage.removeItem(STORAGE_KEY_PROFILE);
  localStorage.removeItem(STORAGE_KEY_PERIODS);
  localStorage.removeItem(STORAGE_KEY_LOGS);
  localStorage.removeItem(STORAGE_KEY_NOTIF);
  localStorage.removeItem(STORAGE_KEY_CHAT);
}
