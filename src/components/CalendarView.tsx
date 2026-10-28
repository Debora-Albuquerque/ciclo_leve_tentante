import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Heart,
  Droplets,
  Trash2,
  Edit3,
  Plus
} from 'lucide-react';
import { UserProfile, PeriodEntry, DailyLog } from '../types/cycle';
import {
  formatDateISO,
  parseDateISO,
  getStatusForDate,
  formatFriendlyDate
} from '../utils/cycleCalculations';

interface CalendarViewProps {
  profile: UserProfile;
  periods: PeriodEntry[];
  dailyLogs: Record<string, DailyLog>;
  onSelectDateToLog: (dateStr: string) => void;
  onSetPeriodStart: (dateStr: string) => void;
  onDeleteLogForDate: (dateStr: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  profile,
  periods,
  dailyLogs,
  onSelectDateToLog,
  onSetPeriodStart,
  onDeleteLogForDate,
}) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDateStr, setSelectedDateStr] = useState<string>(() =>
    formatDateISO(new Date())
  );

  const prevMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1)
    );
  };

  const nextMonth = () => {
    setCurrentMonthDate(
      new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1)
    );
  };

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // First day of month (0 = Sun, 1 = Mon ... adjust to Mon = 0)
  const firstDayIndex = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Selected date status
  const selectedStatus = getStatusForDate(
    selectedDateStr,
    profile,
    periods,
    dailyLogs
  );

  // Check if selected date is an existing period start
  const isPeriodStart = periods.some((p) => p.startDate === selectedDateStr);

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Calendar Header with Month Navigation */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif text-[#2D2A26] font-semibold">
            {monthNames[month]} {year}
          </h1>
          <p className="text-xs text-[#8C827A] mt-0.5">
            Toque em qualquer dia para ver a fase ou registrar sintomas.
          </p>
        </div>

        <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-[#EBE3DC] shadow-sm">
          <button
            onClick={prevMonth}
            className="p-1.5 rounded-full hover:bg-[#FAF7F5] text-[#6D6359] transition-colors"
            title="Mês anterior"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentMonthDate(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
            className="text-xs font-semibold px-2.5 py-1 text-[#6D6359] hover:bg-[#FAF7F5] rounded-full"
          >
            Hoje
          </button>
          <button
            onClick={nextMonth}
            className="p-1.5 rounded-full hover:bg-[#FAF7F5] text-[#6D6359] transition-colors"
            title="Próximo mês"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white rounded-3xl border border-[#EBE3DC] p-4 sm:p-6 shadow-sm">
        {/* Days of week header */}
        <div className="grid grid-cols-7 mb-2 text-center">
          {weekDays.map((wd) => (
            <div key={wd} className="text-[11px] font-semibold uppercase text-[#8C827A] py-1">
              {wd}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
          {/* Empty cells before month starts */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-12 sm:h-16" />
          ))}

          {/* Days of current month */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const monthStr = String(month + 1).padStart(2, '0');
            const dayStr = String(dayNum).padStart(2, '0');
            const dateStr = `${year}-${monthStr}-${dayStr}`;

            const status = getStatusForDate(dateStr, profile, periods, dailyLogs);
            const isSelected = dateStr === selectedDateStr;
            const log = dailyLogs[dateStr];

            // Cell styling depending on status
            let bgClass = 'hover:bg-[#F7F2EC] text-[#2D2A26]';
            let pillClass = '';

            if (status.isOvulation) {
              bgClass = 'bg-[#F9ECE7] text-[#B85737] font-semibold';
              pillClass = 'border border-[#F0CECE] shadow-xs';
            } else if (status.isFertile) {
              bgClass = 'bg-[#EBF2EB] text-[#3E683E]';
            } else if (status.isPeriod) {
              bgClass = 'bg-[#FBEBEB] text-[#B54A4A]';
            }

            if (isSelected) {
              pillClass += ' ring-2 ring-[#C4745E] ring-offset-2';
            }

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDateStr(dateStr)}
                className={`relative flex flex-col items-center justify-between p-1.5 sm:p-2 rounded-2xl h-14 sm:h-16 transition-all ${bgClass} ${pillClass}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className={`text-xs sm:text-sm ${status.isToday ? 'font-bold underline' : ''}`}>
                    {dayNum}
                  </span>
                  {status.isOvulation && (
                    <span className="w-2 h-2 rounded-full bg-[#D97452] animate-pulse" title="Ovulação provável" />
                  )}
                </div>

                {/* Sub-indicators: Cycle Day or Icons */}
                <div className="flex items-center gap-1 text-[9px] font-medium opacity-85">
                  {status.cycleDay ? <span>D{status.cycleDay}</span> : null}
                  {log?.intercourse && <Heart className="w-2.5 h-2.5 fill-[#9E4A6F] text-[#9E4A6F]" />}
                  {log?.mucus === 'clara_de_ovo' && <Droplets className="w-2.5 h-2.5 text-[#3D663D]" />}
                </div>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-[#EFE8E1] flex flex-wrap items-center justify-center gap-4 text-xs text-[#6D6359]">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#FBEBEB] border border-[#F3CECE]" />
            <span>Menstruação</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#EBF2EB] border border-[#D4E4D4]" />
            <span>Janela Fértil</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-[#F9ECE7] border border-[#F0D2C8] flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#D97452]" />
            </span>
            <span>Ovulação Provável</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Heart className="w-3.5 h-3.5 fill-[#9E4A6F] text-[#9E4A6F]" />
            <span>Intimidade</span>
          </div>
        </div>
      </div>

      {/* Selected Day Detail Panel */}
      <div className="bg-[#FAF7F5] rounded-3xl border border-[#E8DFD8] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#EAE0D7]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#8C827A]">
              Detalhes da Data
            </span>
            <h3 className="font-serif text-xl font-semibold text-[#2D2A26] capitalize">
              {formatFriendlyDate(selectedDateStr)}
              {selectedStatus.isToday && ' (Hoje)'}
            </h3>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => onSelectDateToLog(selectedDateStr)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#E0A899] text-white text-xs font-semibold hover:bg-[#D49585] transition-all"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>{selectedStatus.log ? 'Editar Registro' : 'Adicionar Registro'}</span>
            </button>

            {!isPeriodStart && (
              <button
                onClick={() => onSetPeriodStart(selectedDateStr)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-[#E2D8CE] text-xs font-semibold text-[#B54A4A] hover:bg-[#FBEBEB] transition-all"
                title="Marcar início da menstruação neste dia"
              >
                <Droplets className="w-3.5 h-3.5" />
                <span>Marcar Menstruação</span>
              </button>
            )}

            {selectedStatus.log && (
              <button
                onClick={() => onDeleteLogForDate(selectedDateStr)}
                className="p-1.5 rounded-full text-[#8C827A] hover:text-[#B54A4A] hover:bg-white transition-colors"
                title="Apagar dados deste dia"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Phase Info & Symptoms for this day */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8C827A]">Fase do Ciclo:</span>
              <span className="text-xs font-semibold text-[#3A332C]">
                {selectedStatus.cycleDay ? `Dia ${selectedStatus.cycleDay} • ` : ''}
                {selectedStatus.phase === 'ovulation'
                  ? 'Pico de Ovulação'
                  : selectedStatus.phase === 'fertile'
                  ? 'Janela Fértil'
                  : selectedStatus.phase === 'menstrual'
                  ? 'Fase Menstrual'
                  : selectedStatus.phase === 'luteal'
                  ? 'Fase Lútea'
                  : 'Fase Folicular'}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-[#8C827A]">Chances de Engravidar:</span>
              <span
                className={`text-xs font-semibold ${
                  selectedStatus.conceptionChance === 'pico'
                    ? 'text-[#C45E3B]'
                    : selectedStatus.conceptionChance === 'alta'
                    ? 'text-[#4A724A]'
                    : 'text-[#6D6359]'
                }`}
              >
                {selectedStatus.conceptionChance === 'pico'
                  ? 'Ápice Máximo'
                  : selectedStatus.conceptionChance === 'alta'
                  ? 'Alta'
                  : selectedStatus.conceptionChance === 'media'
                  ? 'Média'
                  : 'Baixa'}
              </span>
            </div>
          </div>

          <div>
            {selectedStatus.log ? (
              <div className="space-y-1.5">
                <span className="text-xs font-medium text-[#8C827A] block">Registros do dia:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedStatus.log.mucus && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#EBF2EB] text-[#3D663D]">
                      Muco: {selectedStatus.log.mucus.replace('_', ' ')}
                    </span>
                  )}
                  {selectedStatus.log.flow && selectedStatus.log.flow !== 'nenhum' && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FDEAEA] text-[#B54A4A]">
                      Fluxo {selectedStatus.log.flow}
                    </span>
                  )}
                  {selectedStatus.log.intercourse && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-[#FAF0F4] text-[#9E4A6F]">
                      Relação ❤️
                    </span>
                  )}
                  {selectedStatus.log.symptoms?.map((s) => (
                    <span
                      key={s}
                      className="px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-white text-[#635A52] border border-[#E5DDD4]"
                    >
                      {s}
                    </span>
                  ))}
                </div>
                {selectedStatus.log.notes && (
                  <p className="text-xs text-[#7A7067] italic mt-1">
                    &ldquo;{selectedStatus.log.notes}&rdquo;
                  </p>
                )}
              </div>
            ) : (
              <p className="text-xs text-[#8C827A] italic">
                Nenhum registro específico para esta data.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
