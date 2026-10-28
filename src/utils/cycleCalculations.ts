import { UserProfile, PeriodEntry, DailyLog } from '../types/cycle';

export function formatDateISO(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateISO(str: string): Date {
  const [year, month, day] = str.split('-').map(Number);
  return new Date(year, month - 1, day, 12, 0, 0); // Noon to avoid timezone shifts
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function diffDays(dateA: Date, dateB: Date): number {
  const diffTime = dateA.getTime() - dateB.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

export function formatFriendlyDate(dateStr: string): string {
  const d = parseDateISO(dateStr);
  const months = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];
  return `${d.getDate()} de ${months[d.getMonth()]}`;
}

export function formatShortDate(dateStr: string): string {
  const d = parseDateISO(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

export interface DayStatus {
  date: string;
  isToday: boolean;
  cycleDay: number | null;
  phase: 'menstrual' | 'follicular' | 'fertile' | 'ovulation' | 'luteal' | 'unknown';
  conceptionChance: 'baixa' | 'media' | 'alta' | 'pico' | 'menstruacao';
  isPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  log?: DailyLog;
}

export interface CurrentCycleSummary {
  currentCycleDay: number;
  phase: 'menstrual' | 'follicular' | 'fertile' | 'ovulation' | 'luteal';
  phaseLabel: string;
  conceptionChance: 'baixa' | 'media' | 'alta' | 'pico' | 'menstruacao';
  conceptionChanceLabel: string;
  isFertileNow: boolean;
  isOvulationToday: boolean;
  ovulationDateStr: string;
  fertileWindowStartStr: string;
  fertileWindowEndStr: string;
  nextPeriodDateStr: string;
  daysToFertileWindow: number; // 0 if currently in it, negative if passed
  daysToOvulation: number;
  daysToNextPeriod: number;
  lastPeriodStartDate: string;
}

export function calculateCycleSummary(
  profile: UserProfile,
  periods: PeriodEntry[],
  todayStr: string = formatDateISO(new Date())
): CurrentCycleSummary | null {
  if (periods.length === 0) return null;

  // Sort periods by startDate descending
  const sorted = [...periods].sort(
    (a, b) => parseDateISO(b.startDate).getTime() - parseDateISO(a.startDate).getTime()
  );
  const latestPeriod = sorted[0];
  const periodStart = parseDateISO(latestPeriod.startDate);
  const today = parseDateISO(todayStr);

  const daysPassed = diffDays(today, periodStart);
  const currentCycleDay = daysPassed >= 0 ? daysPassed + 1 : 1;

  // Ovulation is typically cycleLength - lutealPhase days after period start
  const ovulationOffset = profile.cycleLength - profile.lutealPhase;
  const ovulationDate = addDays(periodStart, ovulationOffset);
  const ovulationDateStr = formatDateISO(ovulationDate);

  // Fertile window: 5 days before ovulation up to ovulation day
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = ovulationDate;
  const fertileWindowStartStr = formatDateISO(fertileStart);
  const fertileWindowEndStr = formatDateISO(fertileEnd);

  // Next expected period
  const nextPeriod = addDays(periodStart, profile.cycleLength);
  const nextPeriodDateStr = formatDateISO(nextPeriod);

  const daysToOvulation = diffDays(ovulationDate, today);
  const daysToFertileWindow = diffDays(fertileStart, today);
  const daysToNextPeriod = diffDays(nextPeriod, today);

  const isPeriod = daysPassed >= 0 && daysPassed < profile.periodLength;
  const isOvulationToday = todayStr === ovulationDateStr;
  const isFertileNow =
    today.getTime() >= fertileStart.getTime() && today.getTime() <= fertileEnd.getTime();

  let phase: CurrentCycleSummary['phase'] = 'follicular';
  let phaseLabel = 'Fase Folicular';
  let conceptionChance: CurrentCycleSummary['conceptionChance'] = 'baixa';
  let conceptionChanceLabel = 'Baixa probabilidade';

  if (isPeriod) {
    phase = 'menstrual';
    phaseLabel = 'Fase Menstrual';
    conceptionChance = 'menstruacao';
    conceptionChanceLabel = 'Menstruação';
  } else if (isOvulationToday) {
    phase = 'ovulation';
    phaseLabel = 'Dia da Ovulação (Pico)';
    conceptionChance = 'pico';
    conceptionChanceLabel = 'Pico de Fertilidade';
  } else if (isFertileNow) {
    phase = 'fertile';
    phaseLabel = 'Janela Fértil';
    conceptionChance = daysToOvulation <= 2 ? 'alta' : 'media';
    conceptionChanceLabel = daysToOvulation <= 2 ? 'Alta probabilidade' : 'Média probabilidade';
  } else if (today.getTime() > ovulationDate.getTime()) {
    phase = 'luteal';
    phaseLabel = 'Fase Lútea';
    conceptionChance = 'baixa';
    conceptionChanceLabel = 'Baixa probabilidade';
  }

  return {
    currentCycleDay,
    phase,
    phaseLabel,
    conceptionChance,
    conceptionChanceLabel,
    isFertileNow,
    isOvulationToday,
    ovulationDateStr,
    fertileWindowStartStr,
    fertileWindowEndStr,
    nextPeriodDateStr,
    daysToFertileWindow,
    daysToOvulation,
    daysToNextPeriod,
    lastPeriodStartDate: latestPeriod.startDate,
  };
}

export function getStatusForDate(
  targetDateStr: string,
  profile: UserProfile,
  periods: PeriodEntry[],
  dailyLogs: Record<string, DailyLog>
): DayStatus {
  const targetDate = parseDateISO(targetDateStr);
  const todayStr = formatDateISO(new Date());
  const isToday = targetDateStr === todayStr;

  if (periods.length === 0) {
    return {
      date: targetDateStr,
      isToday,
      cycleDay: null,
      phase: 'unknown',
      conceptionChance: 'baixa',
      isPeriod: false,
      isFertile: false,
      isOvulation: false,
      log: dailyLogs[targetDateStr],
    };
  }

  // Find which cycle this date belongs to
  const sorted = [...periods].sort(
    (a, b) => parseDateISO(a.startDate).getTime() - parseDateISO(b.startDate).getTime()
  );

  let activePeriod: PeriodEntry = sorted[sorted.length - 1];
  for (let i = 0; i < sorted.length; i++) {
    const pStart = parseDateISO(sorted[i].startDate);
    const pNextStart = sorted[i + 1] ? parseDateISO(sorted[i + 1].startDate) : null;
    if (targetDate >= pStart && (!pNextStart || targetDate < pNextStart)) {
      activePeriod = sorted[i];
      break;
    }
  }

  const pStart = parseDateISO(activePeriod.startDate);
  const diffFromStart = diffDays(targetDate, pStart);
  const cycleDay = diffFromStart >= 0 ? (diffFromStart % profile.cycleLength) + 1 : null;

  const ovulationOffset = profile.cycleLength - profile.lutealPhase;
  const ovulationDate = addDays(pStart, ovulationOffset);
  const fertileStart = addDays(ovulationDate, -5);
  const fertileEnd = ovulationDate;

  const isPeriod = diffFromStart >= 0 && diffFromStart < profile.periodLength;
  const isOvulation = formatDateISO(targetDate) === formatDateISO(ovulationDate);
  const isFertile = targetDate >= fertileStart && targetDate <= fertileEnd;

  let phase: DayStatus['phase'] = 'follicular';
  let conceptionChance: DayStatus['conceptionChance'] = 'baixa';

  if (isPeriod) {
    phase = 'menstrual';
    conceptionChance = 'menstruacao';
  } else if (isOvulation) {
    phase = 'ovulation';
    conceptionChance = 'pico';
  } else if (isFertile) {
    phase = 'fertile';
    const distToOv = Math.abs(diffDays(ovulationDate, targetDate));
    conceptionChance = distToOv <= 2 ? 'alta' : 'media';
  } else if (targetDate > ovulationDate) {
    phase = 'luteal';
    conceptionChance = 'baixa';
  }

  return {
    date: targetDateStr,
    isToday,
    cycleDay,
    phase,
    conceptionChance,
    isPeriod,
    isFertile,
    isOvulation,
    log: dailyLogs[targetDateStr],
  };
}

export function getDailyGentleTip(summary: CurrentCycleSummary | null, isTryingToConceive: boolean): string {
  if (!summary) {
    return 'Cadastre a data da sua última menstruação para que o CicloLeve personalize suas orientações.';
  }

  if (summary.isOvulationToday) {
    return isTryingToConceive
      ? 'Hoje é o seu dia provável de ovulação! O óvulo tem uma janela de cerca de 12 a 24 horas. Aproveite este momento com carinho, leveza e sem pressa.'
      : 'Seu corpo está no pico da fertilidade e da energia estrogênica. Ótimo dia para projetos criativos e autocuidado.';
  }

  if (summary.isFertileNow) {
    return isTryingToConceive
      ? 'Você está na sua Janela Fértil. O muco cervical costuma ficar transparente e elástico como clara de ovo, criando o ambiente perfeito para os espermatozoides.'
      : 'Você está no período fértil. Seu corpo pode apresentar maior sensação de umidade e disposição elevada.';
  }

  if (summary.phase === 'menstrual') {
    return 'Seu corpo está se renovando. Beba chás quentinhos, priorize noites tranquilas de sono e respeite o seu ritmo.';
  }

  if (summary.phase === 'follicular') {
    return isTryingToConceive
      ? 'Os níveis de estrogênio estão subindo e preparando os folículos. Mantenha uma alimentação rica em nutrientes coloridos e hidrate-se com carinho.'
      : 'Sensação crescente de energia e foco. Aproveite para planejar novas metas da semana.';
  }

  // Luteal phase
  return isTryingToConceive
    ? 'Fase de espera após a ovulação. A progesterona domina e aquece seu corpo. Mantenha a serenidade, evite a ansiedade do teste antecipado e acolha suas emoções.'
    : 'Fase lútea: seu corpo pede aconchego e alimentos reconfortantes. Alongamentos suaves podem aliviar possíveis tensões.';
}
