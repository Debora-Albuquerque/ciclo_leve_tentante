export type GoalType = 'tentando' | 'acompanhar';

export type FlowLevel = 'nenhum' | 'spotting' | 'leve' | 'moderado' | 'intenso';

export type MucusType = 'seco' | 'pegajoso' | 'cremoso' | 'aquoso' | 'clara_de_ovo';

export type OvulationTestResult = 'negativo' | 'quase' | 'positivo' | 'pico';

export interface UserProfile {
  name: string;
  goal: GoalType;
  cycleLength: number; // e.g. 28
  periodLength: number; // e.g. 5
  lutealPhase: number; // e.g. 14
}

export interface PeriodEntry {
  id: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  flow?: FlowLevel;
  notes?: string;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  flow?: FlowLevel;
  mucus?: MucusType;
  intercourse?: boolean;
  intercourseProtection?: boolean;
  ovulationTest?: OvulationTestResult;
  basalTemp?: number;
  symptoms?: string[];
  mood?: string;
  notes?: string;
}

export interface SimulatedAlert {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'fertile' | 'ovulation' | 'period' | 'tip';
}

export interface NotificationSettings {
  enabled: boolean;
  nativeGranted: boolean;
  remindDaysBeforeFertile: number;
  remindOvulation: boolean;
  remindPeriod: boolean;
  alerts: SimulatedAlert[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: string;
  suggestedNotification?: string;
  actionApplied?: string;
}

export interface CycleActionPayload {
  type: 'ADD_PERIOD_START' | 'DELETE_ENTRY' | 'UPDATE_CYCLE_LENGTH' | 'UPDATE_PERIOD_LENGTH' | 'LOG_ENTRY' | 'UPDATE_PROFILE' | 'NONE';
  date?: string;
  cycleLength?: number;
  periodLength?: number;
  userName?: string;
  mucus?: MucusType;
  flow?: FlowLevel;
  intercourse?: boolean;
  ovulationTest?: OvulationTestResult;
  notes?: string;
}
