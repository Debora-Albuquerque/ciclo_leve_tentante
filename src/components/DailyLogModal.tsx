import React, { useState, useEffect } from 'react';
import {
  X,
  Droplets,
  Heart,
  Sparkles,
  Thermometer,
  Trash2,
  Check,
  Calendar
} from 'lucide-react';
import {
  DailyLog,
  FlowLevel,
  MucusType,
  OvulationTestResult
} from '../types/cycle';
import { formatFriendlyDate } from '../utils/cycleCalculations';

interface DailyLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  initialLog?: DailyLog;
  onSaveLog: (dateStr: string, log: DailyLog) => void;
  onDeleteLog: (dateStr: string) => void;
}

const COMMON_SYMPTOMS = [
  'Cólica leve',
  'Sensibilidade nos seios',
  'Dor ovulatória',
  'Sensação de umidade',
  'Disposição alta',
  'Inchaço',
  'Cansaço',
  'Humor sereno',
  'Ansiedade leve',
  'Dor de cabeça',
  'Pele radiante',
  'Apetite aumentado',
];

export const DailyLogModal: React.FC<DailyLogModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  initialLog,
  onSaveLog,
  onDeleteLog,
}) => {
  const [flow, setFlow] = useState<FlowLevel>(initialLog?.flow || 'nenhum');
  const [mucus, setMucus] = useState<MucusType | undefined>(initialLog?.mucus);
  const [intercourse, setIntercourse] = useState<boolean>(
    initialLog?.intercourse || false
  );
  const [ovulationTest, setOvulationTest] = useState<
    OvulationTestResult | undefined
  >(initialLog?.ovulationTest);
  const [basalTemp, setBasalTemp] = useState<string>(
    initialLog?.basalTemp ? String(initialLog.basalTemp) : ''
  );
  const [symptoms, setSymptoms] = useState<string[]>(
    initialLog?.symptoms || []
  );
  const [notes, setNotes] = useState<string>(initialLog?.notes || '');

  useEffect(() => {
    if (initialLog) {
      setFlow(initialLog.flow || 'nenhum');
      setMucus(initialLog.mucus);
      setIntercourse(initialLog.intercourse || false);
      setOvulationTest(initialLog.ovulationTest);
      setBasalTemp(initialLog.basalTemp ? String(initialLog.basalTemp) : '');
      setSymptoms(initialLog.symptoms || []);
      setNotes(initialLog.notes || '');
    } else {
      setFlow('nenhum');
      setMucus(undefined);
      setIntercourse(false);
      setOvulationTest(undefined);
      setBasalTemp('');
      setSymptoms([]);
      setNotes('');
    }
  }, [initialLog, dateStr, isOpen]);

  if (!isOpen) return null;

  const handleToggleSymptom = (item: string) => {
    if (symptoms.includes(item)) {
      setSymptoms(symptoms.filter((s) => s !== item));
    } else {
      setSymptoms([...symptoms, item]);
    }
  };

  const handleSave = () => {
    const logData: DailyLog = {
      date: dateStr,
      flow,
      mucus,
      intercourse,
      ovulationTest,
      basalTemp: basalTemp ? parseFloat(basalTemp) : undefined,
      symptoms,
      notes: notes.trim(),
    };
    onSaveLog(dateStr, logData);
    onClose();
  };

  const handleDelete = () => {
    if (confirm('Deseja apagar os registros deste dia?')) {
      onDeleteLog(dateStr);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-xs p-0 sm:p-4">
      <div className="w-full sm:max-w-lg bg-[#FAF7F5] rounded-t-3xl sm:rounded-3xl border border-[#E8DFD8] shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#EAE0D7] bg-white">
          <div>
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C827A] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Registro Diário
            </span>
            <h3 className="font-serif text-lg font-semibold text-[#2D2A26] capitalize">
              {formatFriendlyDate(dateStr)}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-[#FAF7F5] text-[#8C827A] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* 1. Muco Cervical (Foco Tentantes & Fertilidade) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#3A332C] flex items-center justify-between">
              <span>💧 Muco Cervical (Sinal Chave de Fertilidade)</span>
              {mucus === 'clara_de_ovo' && (
                <span className="text-[10px] text-[#3D663D] font-bold bg-[#EBF2EB] px-2 py-0.5 rounded-full">
                  Ápice Fértil 🌸
                </span>
              )}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { key: 'seco', label: 'Seco', sub: 'Pouco fértil' },
                { key: 'pegajoso', label: 'Pegajoso', sub: 'Início da fase' },
                { key: 'cremoso', label: 'Cremoso', sub: 'Transição' },
                { key: 'aquoso', label: 'Aquoso', sub: 'Fértil' },
                {
                  key: 'clara_de_ovo',
                  label: 'Clara de Ovo',
                  sub: 'Super fértil ✨',
                },
              ].map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() =>
                    setMucus(mucus === opt.key ? undefined : (opt.key as MucusType))
                  }
                  className={`p-2.5 rounded-2xl border text-left transition-all ${
                    mucus === opt.key
                      ? opt.key === 'clara_de_ovo'
                        ? 'bg-[#EBF2EB] border-[#97C597] text-[#2F532F] ring-1 ring-[#97C597]'
                        : 'bg-[#FAF2EE] border-[#DEB0A2] text-[#2D2A26] ring-1 ring-[#DEB0A2]'
                      : 'bg-white border-[#E5DDD4] text-[#5C534A] hover:bg-[#F9F4EE]'
                  }`}
                >
                  <span className="text-xs font-semibold block">{opt.label}</span>
                  <span className="text-[10px] opacity-75">{opt.sub}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. Intimidade & Namoro */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#3A332C]">
              ❤️ Intimidade / Relações
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIntercourse(false)}
                className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                  !intercourse
                    ? 'bg-white border-[#C8B8A9] text-[#2D2A26]'
                    : 'bg-white/60 border-[#E8DFD8] text-[#8C827A]'
                }`}
              >
                Não houve hoje
              </button>
              <button
                type="button"
                onClick={() => setIntercourse(true)}
                className={`p-2.5 rounded-2xl border text-xs font-semibold transition-all ${
                  intercourse
                    ? 'bg-[#FAF0F4] border-[#DEADC2] text-[#8A375D] ring-1 ring-[#DEADC2]'
                    : 'bg-white border-[#E5DDD4] text-[#5C534A] hover:bg-[#FAF0F4]'
                }`}
              >
                Sim, com carinho ❤️
              </button>
            </div>
          </div>

          {/* 3. Teste de Ovulação (LH) */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#3A332C]">
              ✨ Teste de Ovulação (Tiras de LH)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {[
                { key: 'negativo', label: 'Negativo' },
                { key: 'quase', label: 'Quase lá' },
                { key: 'positivo', label: 'Positivo (+)' },
                { key: 'pico', label: 'Pico Máximo' },
              ].map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() =>
                    setOvulationTest(
                      ovulationTest === t.key
                        ? undefined
                        : (t.key as OvulationTestResult)
                    )
                  }
                  className={`py-2 px-2 rounded-xl border text-xs text-center transition-all ${
                    ovulationTest === t.key
                      ? 'bg-[#F9ECE7] border-[#C45E3B] text-[#C45E3B] font-semibold ring-1 ring-[#C45E3B]'
                      : 'bg-white border-[#E5DDD4] text-[#5C534A] hover:bg-[#FAF5F0]'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* 4. Fluxo Menstrual */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#3A332C]">
              🩸 Fluxo Menstrual
            </label>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {[
                { key: 'nenhum', label: 'Nenhum' },
                { key: 'spotting', label: 'Escapar' },
                { key: 'leve', label: 'Leve' },
                { key: 'moderado', label: 'Moderado' },
                { key: 'intenso', label: 'Intenso' },
              ].map((f) => (
                <button
                  key={f.key}
                  type="button"
                  onClick={() => setFlow(f.key as FlowLevel)}
                  className={`py-2 px-2 rounded-xl border text-xs text-center transition-all ${
                    flow === f.key
                      ? f.key === 'nenhum'
                        ? 'bg-white border-[#A89889] text-[#2D2A26] font-semibold'
                        : 'bg-[#FBEBEB] border-[#D97777] text-[#B54A4A] font-semibold ring-1 ring-[#D97777]'
                      : 'bg-white border-[#E5DDD4] text-[#5C534A] hover:bg-[#FBEBEB]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Sintomas e Sensações */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-[#3A332C]">
              Sintomas e Sensações Corporais
            </label>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_SYMPTOMS.map((s) => {
                const isSelected = symptoms.includes(s);
                return (
                  <button
                    key={s}
                    type="button"
                    onClick={() => handleToggleSymptom(s)}
                    className={`px-3 py-1.5 rounded-full text-xs transition-all ${
                      isSelected
                        ? 'bg-[#E0A899] text-white font-semibold shadow-xs'
                        : 'bg-white border border-[#E5DDD4] text-[#5C534A] hover:bg-[#F8F2EC]'
                    }`}
                  >
                    {isSelected && '✓ '}
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          {/* 6. Temperatura Basal (opcional) & Notas */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-[#3A332C] block mb-1">
                Temperatura Basal (°C)
              </label>
              <input
                type="number"
                step="0.05"
                placeholder="Ex: 36.6"
                value={basalTemp}
                onChange={(e) => setBasalTemp(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E0D7CE] text-xs text-[#2D2A26] focus:outline-none focus:border-[#C4745E]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-[#3A332C] block mb-1">
                Notas Pessoais
              </label>
              <input
                type="text"
                placeholder="Como foi o seu dia ou percepções..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white border border-[#E0D7CE] text-xs text-[#2D2A26] focus:outline-none focus:border-[#C4745E]"
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#EAE0D7] bg-white flex items-center justify-between gap-3">
          {initialLog ? (
            <button
              type="button"
              onClick={handleDelete}
              className="text-xs text-[#8C827A] hover:text-[#B54A4A] flex items-center gap-1 transition-colors px-2 py-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Apagar Registro</span>
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-full text-xs font-semibold text-[#6D6359] hover:bg-[#FAF7F5]"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-6 py-2 rounded-full bg-[#E0A899] hover:bg-[#D49585] text-white text-xs font-semibold shadow-sm transition-all"
            >
              Salvar Registro
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
