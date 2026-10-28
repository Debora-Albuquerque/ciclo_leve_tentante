import React from 'react';
import {
  Sparkles,
  Heart,
  Droplets,
  Calendar,
  Flame,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus
} from 'lucide-react';
import { UserProfile, DailyLog } from '../types/cycle';
import {
  CurrentCycleSummary,
  formatFriendlyDate,
  getDailyGentleTip,
  formatShortDate
} from '../utils/cycleCalculations';

interface TodayViewProps {
  summary: CurrentCycleSummary | null;
  profile: UserProfile;
  todayLog?: DailyLog;
  onOpenLogModal: () => void;
  onNavigateToTab: (tab: 'calendar' | 'chat' | 'notifications' | 'settings') => void;
  onQuickChatPrompt: (prompt: string) => void;
}

export const TodayView: React.FC<TodayViewProps> = ({
  summary,
  profile,
  todayLog,
  onOpenLogModal,
  onNavigateToTab,
  onQuickChatPrompt,
}) => {
  const isTrying = profile.goal === 'tentando';
  const tipText = getDailyGentleTip(summary, isTrying);

  // Status badge styling
  let badgeColor = 'bg-[#EFE8E1] text-[#6D6359] border-[#E2D8CE]';
  if (summary?.isOvulationToday) {
    badgeColor = 'bg-[#F9ECE7] text-[#C45E3B] border-[#F0D2C8]';
  } else if (summary?.isFertileNow) {
    badgeColor = 'bg-[#EBF2EB] text-[#4A724A] border-[#D4E4D4]';
  } else if (summary?.phase === 'menstrual') {
    badgeColor = 'bg-[#FBEBEB] text-[#B54A4A] border-[#F3CECE]';
  }

  // Ring progress
  const cycleDay = summary?.currentCycleDay;
  const cycleLength = profile.cycleLength || 28;
  const progressPercent = cycleDay
    ? Math.min(100, Math.round((cycleDay / cycleLength) * 100))
    : 0;

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Gentle Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif text-[#2D2A26] font-semibold tracking-tight">
            Olá{profile.name ? `, ${profile.name}` : ''}
          </h1>
          <p className="text-sm text-[#7D736A] mt-0.5">
            {isTrying
              ? 'Seu espaço acolhedor para planejar a sua gravidez com serenidade.'
              : 'Seu corpo em sintonia com os ritmos naturais do seu ciclo.'}
          </p>
        </div>

        <button
          onClick={onOpenLogModal}
          className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 rounded-full bg-[#E0A899] text-white font-medium text-sm shadow-sm shadow-[#E0A899]/30 hover:bg-[#D49585] transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>{todayLog ? 'Editar Registro de Hoje' : 'Registrar Hoje'}</span>
        </button>
      </div>

      {/* Main Cycle Status Hero Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-[#FFFFFF] to-[#FAF5F0] border border-[#EBE3DC] p-6 sm:p-8 shadow-sm">
        {/* Decorative soft glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5DFD7]/40 rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Circular Indicator */}
          <div className="relative flex flex-col items-center justify-center">
            {/* SVG Progress Ring */}
            <svg className="w-52 h-52 transform -rotate-90" viewBox="0 0 120 120">
              <circle
                cx="60"
                cy="60"
                r="50"
                className="stroke-[#EFE8E1]"
                strokeWidth="7"
                fill="none"
              />
              <circle
                cx="60"
                cy="60"
                r="50"
                className={`transition-all duration-700 ease-out ${
                  summary?.isOvulationToday
                    ? 'stroke-[#D97452]'
                    : summary?.isFertileNow
                    ? 'stroke-[#7DAF7D]'
                    : summary?.phase === 'menstrual'
                    ? 'stroke-[#D97777]'
                    : 'stroke-[#C8B8A9]'
                }`}
                strokeWidth="7"
                strokeDasharray={2 * Math.PI * 50}
                strokeDashoffset={2 * Math.PI * 50 * (1 - progressPercent / 100)}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            {/* Inner Content of Ring */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-4">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A]">
                Ciclo Menstrual
              </span>
              <span className="font-serif text-3xl sm:text-4xl font-bold text-[#2D2A26] mt-0.5">
                Dia {summary?.currentCycleDay ?? '--'}
              </span>
              <span className="text-xs text-[#7A7067] font-medium mt-1">
                {summary ? `de ${profile.cycleLength} dias` : 'Aguardando registro'}
              </span>

              {/* Status pill */}
              <div
                className={`mt-2 px-3 py-0.5 rounded-full text-[11px] font-semibold border ${badgeColor}`}
              >
                {summary?.phaseLabel || 'Sem dados do ciclo'}
              </div>
            </div>
          </div>

          {/* Right Column: Fertility status & Milestones */}
          <div className="flex-1 w-full space-y-4">
            <div className="bg-[#FAF7F5] rounded-2xl p-4 border border-[#EBE3DC]">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#8C827A]">
                  Probabilidade de Gravidez
                </span>
                {summary?.isFertileNow && (
                  <span className="flex items-center gap-1 text-xs text-[#4A724A] font-semibold">
                    <Flame className="w-3.5 h-3.5 fill-[#4A724A]" />
                    Momento ideal
                  </span>
                )}
              </div>
              <p className="text-lg font-serif font-semibold text-[#2D2A26] mt-1">
                {summary?.conceptionChanceLabel || 'Sem dados suficientes'}
              </p>
              <p className="text-xs text-[#7D736A] mt-1 leading-relaxed">
                {summary?.isOvulationToday
                  ? 'Hoje é o ápice da fertilidade! O óvulo está pronto para fecundação.'
                  : summary?.isFertileNow
                  ? 'Os espermatozoides podem sobreviver até 5 dias nas vias férteis aguardando o óvulo.'
                  : summary?.phase === 'menstrual'
                  ? 'Fase de repouso e renovação do endométrio.'
                  : 'Fase de equilíbrio hormonal. Mantenha hábitos suaves.'}
              </p>
            </div>

            {/* Key Milestones Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {/* Ovulation */}
              <div className="bg-[#FAF7F5] p-3 rounded-2xl border border-[#EBE3DC] text-center">
                <span className="text-[11px] text-[#8C827A] block">Ovulação Provável</span>
                <span className="text-sm font-semibold text-[#2D2A26] block mt-0.5">
                  {summary ? formatShortDate(summary.ovulationDateStr) : '--'}
                </span>
                <span className="text-[10px] text-[#A66C59] font-medium block mt-0.5">
                  {summary?.daysToOvulation === 0
                    ? 'Hoje!'
                    : summary && summary.daysToOvulation > 0
                    ? `em ${summary.daysToOvulation} dias`
                    : 'Passou'}
                </span>
              </div>

              {/* Fertile window */}
              <div className="bg-[#FAF7F5] p-3 rounded-2xl border border-[#EBE3DC] text-center">
                <span className="text-[11px] text-[#8C827A] block">Janela Fértil</span>
                <span className="text-sm font-semibold text-[#2D2A26] block mt-0.5">
                  {summary
                    ? `${formatShortDate(summary.fertileWindowStartStr)} - ${formatShortDate(
                        summary.fertileWindowEndStr
                      )}`
                    : '--'}
                </span>
                <span className="text-[10px] text-[#558255] font-medium block mt-0.5">
                  {summary?.isFertileNow ? 'Aberta agora' : summary ? 'Período estimado' : '--'}
                </span>
              </div>

              {/* Next Period */}
              <div className="col-span-2 sm:col-span-1 bg-[#FAF7F5] p-3 rounded-2xl border border-[#EBE3DC] text-center">
                <span className="text-[11px] text-[#8C827A] block">Próximo Ciclo</span>
                <span className="text-sm font-semibold text-[#2D2A26] block mt-0.5">
                  {summary ? formatShortDate(summary.nextPeriodDateStr) : '--'}
                </span>
                <span className="text-[10px] text-[#8C827A] font-medium block mt-0.5">
                  {summary && summary.daysToNextPeriod > 0
                    ? `em ${summary.daysToNextPeriod} dias`
                    : '--'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dica Acolhedora do Dia (Evidência Científica & Carinho) */}
      <div className="rounded-3xl bg-[#FAF5F0] border border-[#E6DCD2] p-5 sm:p-6 shadow-sm">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#E0A899]/20 flex items-center justify-center text-[#B86B56] shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-[#9E6554]">
              Próximos Passos & Dica do Dia
            </h3>
            <p className="text-sm text-[#3E3831] leading-relaxed font-normal">
              {tipText}
            </p>
          </div>
        </div>
      </div>

      {/* Today's Log Card (if already logged) or Call to Log */}
      <div className="rounded-3xl bg-white border border-[#EBE3DC] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-serif text-lg font-semibold text-[#2D2A26] flex items-center gap-2">
            <Droplets className="w-4 h-4 text-[#E0A899]" />
            Como você está se sentindo hoje?
          </h3>
          <button
            onClick={onOpenLogModal}
            className="text-xs text-[#E0A899] hover:text-[#C78775] font-semibold flex items-center gap-1"
          >
            {todayLog ? 'Editar' : 'Adicionar'}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayLog ? (
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {todayLog.mucus && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EBF2EB] text-[#3D663D] border border-[#D5E3D5]">
                  Muco: {todayLog.mucus.replace('_', ' ')}
                </span>
              )}
              {todayLog.flow && todayLog.flow !== 'nenhum' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FDEAEA] text-[#B54A4A] border border-[#F6D0D0]">
                  Fluxo: {todayLog.flow}
                </span>
              )}
              {todayLog.intercourse && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FAF0F4] text-[#9E4A6F] border border-[#F3D5E2]">
                  Intimidade registrada ❤️
                </span>
              )}
              {todayLog.ovulationTest && todayLog.ovulationTest !== 'negativo' && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#F9ECE7] text-[#C45E3B] border border-[#F0D2C8]">
                  Teste de Ovulação: {todayLog.ovulationTest}
                </span>
              )}
              {todayLog.symptoms?.map((s) => (
                <span
                  key={s}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-[#F4EFEB] text-[#635A52] border border-[#E5DDD4]"
                >
                  {s}
                </span>
              ))}
            </div>

            {todayLog.notes && (
              <p className="text-xs text-[#7A7067] italic bg-[#FAF7F5] p-2.5 rounded-xl border border-[#EDE5DE]">
                &ldquo;{todayLog.notes}&rdquo;
              </p>
            )}
          </div>
        ) : (
          <div className="text-center py-4 bg-[#FAF7F5] rounded-2xl border border-dashed border-[#DDD4CC]">
            <p className="text-xs text-[#7A7067]">
              Nenhum sintoma ou sinal corporal registrado para hoje ainda.
            </p>
            <button
              onClick={onOpenLogModal}
              className="mt-2 text-xs font-medium text-[#C4745E] hover:underline"
            >
              + Registrar muco, sensações ou intimidade
            </button>
          </div>
        )}
      </div>

      {/* Natural Quick Actions with AI Assistant */}
      <div className="rounded-3xl bg-[#FAF7F5] border border-[#E8DFD8] p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs uppercase tracking-wider font-semibold text-[#8C827A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E0A899]" />
            Conversar com o CicloLeve
          </span>
          <button
            onClick={() => onNavigateToTab('chat')}
            className="text-xs font-semibold text-[#E0A899] hover:underline"
          >
            Abrir chat completo
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <button
            onClick={() => onQuickChatPrompt('Como está a minha janela fértil e ovulação neste ciclo?')}
            className="text-left p-3 rounded-2xl bg-white border border-[#EBE3DC] hover:border-[#DECBC2] text-xs text-[#3D352E] transition-all hover:shadow-sm"
          >
            <span className="font-semibold block text-[#C45E3B]">🌸 Janela Fértil</span>
            <span className="text-[#7A7067]">Ver resumo detalhado e chances de concepção</span>
          </button>

          <button
            onClick={() => onQuickChatPrompt('Minha menstruação desceu hoje. Pode atualizar meus dados?')}
            className="text-left p-3 rounded-2xl bg-white border border-[#EBE3DC] hover:border-[#DECBC2] text-xs text-[#3D352E] transition-all hover:shadow-sm"
          >
            <span className="font-semibold block text-[#B54A4A]">🩸 Menstruação Desceu Hoje</span>
            <span className="text-[#7A7067]">Atualizar início do ciclo via conversa</span>
          </button>

          <button
            onClick={() => onQuickChatPrompt('Como identificar se meu muco cervical é o do tipo clara de ovo?')}
            className="text-left p-3 rounded-2xl bg-white border border-[#EBE3DC] hover:border-[#DECBC2] text-xs text-[#3D352E] transition-all hover:shadow-sm"
          >
            <span className="font-semibold block text-[#4A724A]">💧 Guia do Muco Fértil</span>
            <span className="text-[#7A7067]">Aprender a reconhecer os sinais do corpo</span>
          </button>

          <button
            onClick={() => onQuickChatPrompt('Quais são as melhores dicas para tentantes neste momento?')}
            className="text-left p-3 rounded-2xl bg-white border border-[#EBE3DC] hover:border-[#DECBC2] text-xs text-[#3D352E] transition-all hover:shadow-sm"
          >
            <span className="font-semibold block text-[#8B6458]">✨ Apoio para Tentantes</span>
            <span className="text-[#7A7067]">Dicas gentis para desacelerar e focar</span>
          </button>
        </div>
      </div>
    </div>
  );
};
