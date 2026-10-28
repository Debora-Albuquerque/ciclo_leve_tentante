import {
  UserProfile,
  PeriodEntry,
  DailyLog,
  NotificationSettings,
  ChatMessage,
  SimulatedAlert
} from '../types/cycle';

const STORAGE_KEY_PROFILE = 'cicloLeve_profile_v1';
const STORAGE_KEY_PERIODS = 'cicloLeve_periods_v1';
const STORAGE_KEY_LOGS = 'cicloLeve_logs_v1';
const STORAGE_KEY_NOTIF = 'cicloLeve_notifications_v1';
const STORAGE_KEY_CHAT = 'cicloLeve_chat_v1';
const STORAGE_KEY_VERSION = 'cicloLeve_data_version';
const STORAGE_VERSION = '2';

function removeDemoData(): void {
  if (localStorage.getItem(STORAGE_KEY_VERSION) === STORAGE_VERSION) return;

  try {
    const rawProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (rawProfile) {
      const profile = JSON.parse(rawProfile);
      if (profile.name === 'Débora' && profile.goal === 'tentando') {
        localStorage.removeItem(STORAGE_KEY_PROFILE);
      }
    }

    const rawPeriods = localStorage.getItem(STORAGE_KEY_PERIODS);
    if (rawPeriods) {
      const periods = JSON.parse(rawPeriods);
      if (Array.isArray(periods) && periods.every((period: PeriodEntry) => period.id === 'p-1' || period.id === 'p-0')) {
        localStorage.removeItem(STORAGE_KEY_PERIODS);
      }
    }

    const rawLogs = localStorage.getItem(STORAGE_KEY_LOGS);
    if (rawLogs) {
      const logs = JSON.parse(rawLogs);
      const entries = Object.values(logs);
      if (entries.length === 1 && (entries[0] as DailyLog).mucus === 'clara_de_ovo') {
        localStorage.removeItem(STORAGE_KEY_LOGS);
      }
    }

    const rawNotifications = localStorage.getItem(STORAGE_KEY_NOTIF);
    if (rawNotifications) {
      const notifications = JSON.parse(rawNotifications);
      if (Array.isArray(notifications.alerts) && notifications.alerts.every((alert: SimulatedAlert) => alert.id === 'alt-1' || alert.id === 'alt-2')) {
        localStorage.removeItem(STORAGE_KEY_NOTIF);
      }
    }

    const rawChat = localStorage.getItem(STORAGE_KEY_CHAT);
    if (rawChat) {
      const chat = JSON.parse(rawChat);
      if (Array.isArray(chat) && chat.length === 1 && chat[0].id === 'msg-welcome') {
        localStorage.removeItem(STORAGE_KEY_CHAT);
      }
    }
  } catch {
    // Invalid legacy data should simply fall back to empty defaults.
  }

  localStorage.setItem(STORAGE_KEY_VERSION, STORAGE_VERSION);
}

removeDemoData();

export function getDefaultProfile(): UserProfile {
  return {
    name: '',
    goal: 'acompanhar',
    cycleLength: 28,
    periodLength: 5,
    lutealPhase: 14,
  };
}

export function getDefaultPeriods(): PeriodEntry[] {
  return [];
}

export function getDefaultNotifications(): NotificationSettings {
  return {
    enabled: false,
    nativeGranted: false,
    remindDaysBeforeFertile: 2,
    remindOvulation: true,
    remindPeriod: true,
    alerts: [],
  };
}

export function getDefaultChatMessages(): ChatMessage[] {
  return [];
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
    if (!raw) return {};
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
  localStorage.removeItem(STORAGE_KEY_VERSION);
}
