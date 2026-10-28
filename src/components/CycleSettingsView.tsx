import React, { useState } from 'react';
import {
  User,
  Heart,
  Calendar,
  ShieldCheck,
  Plus,
  Trash2,
  Save,
  Download,
  AlertCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { UserProfile, PeriodEntry } from '../types/cycle';
import { formatFriendlyDate, formatDateISO } from '../utils/cycleCalculations';

interface CycleSettingsViewProps {
  profile: UserProfile;
  periods: PeriodEntry[];
  onSaveProfile: (updated: UserProfile) => void;
  onAddPeriod: (startDate: string, endDate?: string, notes?: string) => void;
  onDeletePeriod: (id: string) => void;
  onResetData: () => void;
}

export const CycleSettingsView: React.FC<CycleSettingsViewProps> = ({
  profile,
  periods,
  onSaveProfile,
  onAddPeriod,
  onDeletePeriod,
  onResetData,
}) => {
  const [name, setName] = useState(profile.name);
  const [goal, setGoal] = useState(profile.goal);
  const [cycleLength, setCycleLength] = useState(profile.cycleLength);
  const [periodLength, setPeriodLength] = useState(profile.periodLength);
  const [lutealPhase, setLutealPhase] = useState(profile.lutealPhase);
  const [isSavedBanner, setIsSavedBanner] = useState(false);

  // New period form state
  const [showAddPeriod, setShowAddPeriod] = useState(false);
  const [newStartDate, setNewStartDate] = useState(formatDateISO(new Date()));
  const [newEndDate, setNewEndDate] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveProfile({
      name: name.trim() || 'Usuária',
      goal,
      cycleLength: Number(cycleLength),
      periodLength: Number(periodLength),
      lutealPhase: Number(lutealPhase),
    });
    setIsSavedBanner(true);
    setTimeout(() => setIsSavedBanner(false), 3000);
  };

  const handleCreatePeriod = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStartDate) return;
    onAddPeriod(newStartDate, newEndDate || undefined, newNotes || undefined);
    setShowAddPeriod(false);
    setNewNotes('');
  };

  const handleExportJSON = () => {
    const data = {
      profile,
      periods,
      exportedAt: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ciclo-leve-backup-${formatDateISO(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-serif text-[#2D2A26] font-semibold">
          Meu Ciclo & Ajustes Pessoais
        </h1>
        <p className="text-xs text-[#8C827A] mt-0.5">
          Personalize seu nome, objetivo e os parâmetros do seu ciclo menstrual.
        </p>
      </div>

      {isSavedBanner && (
        <div className="p-3.5 rounded-2xl bg-[#EBF2EB] border border-[#D0E2D0] text-[#345C34] text-xs font-medium flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#345C34]" />
          <span>Suas preferências foram salvas com sucesso!</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSave} className="bg-white rounded-3xl border border-[#EBE3DC] p-5 sm:p-6 shadow-sm space-y-5">
        <h3 className="font-serif text-lg font-semibold text-[#2D2A26] flex items-center gap-2">
          <User className="w-4 h-4 text-[#E0A899]" />
          Informações Básicas
        </h3>

        {/* Name input */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-[#4A423A] block">
            Como você gostaria de ser chamada?
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ex: Débora"
            className="w-full px-4 py-2.5 rounded-2xl bg-[#FAF7F5] border border-[#E0D7CE] text-sm text-[#2D2A26] focus:outline-none focus:border-[#C4745E]"
          />
        </div>

        {/* Goal selector */}
        <div className="space-y-2">
          <label className="text-xs font-semibold text-[#4A423A] block">
            Qual é o seu objetivo principal agora?
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={() => setGoal('tentando')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                goal === 'tentando'
                  ? 'bg-[#FAF2EE] border-[#DEB0A2] ring-1 ring-[#DEB0A2]'
                  : 'bg-[#FAF7F5] border-[#E5DDD4] hover:bg-[#F5EFE9]'
              }`}
            >
              <span className="font-semibold text-xs block text-[#2D2A26]">
                🌸 Tentando engravidar (Tentante)
              </span>
              <span className="text-[11px] text-[#7A7067] block mt-0.5">
                Destaque especial para a janela fértil, ovulação e dicas de concepção.
              </span>
            </button>

            <button
              type="button"
              onClick={() => setGoal('acompanhar')}
              className={`p-3.5 rounded-2xl border text-left transition-all ${
                goal === 'acompanhar'
                  ? 'bg-[#FAF2EE] border-[#DEB0A2] ring-1 ring-[#DEB0A2]'
                  : 'bg-[#FAF7F5] border-[#E5DDD4] hover:bg-[#F5EFE9]'
              }`}
            >
              <span className="font-semibold text-xs block text-[#2D2A26]">
                🌿 Acompanhar meu ciclo
              </span>
              <span className="text-[11px] text-[#7A7067] block mt-0.5">
                Conhecer suas fases, registrar sintomas e viver em harmonia com o corpo.
              </span>
            </button>
          </div>
        </div>

        {/* Sliders for Cycle Length, Period Length, Luteal Phase */}
        <div className="pt-2 border-t border-[#F0EBE6] space-y-4">
          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-[#4A423A]">
                Duração média do Ciclo Menstrual
              </span>
              <span className="font-bold text-[#C45E3B] bg-[#FAF2EE] px-2.5 py-0.5 rounded-full">
                {cycleLength} dias
              </span>
            </div>
            <input
              type="range"
              min="21"
              max="45"
              value={cycleLength}
              onChange={(e) => setCycleLength(Number(e.target.value))}
              className="w-full accent-[#E0A899] cursor-pointer"
            />
            <span className="text-[11px] text-[#8C827A] block mt-0.5">
              Tempo do 1º dia da menstruação até o dia anterior à próxima (média comum: 28 dias).
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-[#4A423A]">
                Duração média da Menstruação (Fluxo)
              </span>
              <span className="font-bold text-[#C45E3B] bg-[#FAF2EE] px-2.5 py-0.5 rounded-full">
                {periodLength} dias
              </span>
            </div>
            <input
              type="range"
              min="2"
              max="10"
              value={periodLength}
              onChange={(e) => setPeriodLength(Number(e.target.value))}
              className="w-full accent-[#E0A899] cursor-pointer"
            />
            <span className="text-[11px] text-[#8C827A] block mt-0.5">
              Dias habituais em que você observa sangramento ativo.
            </span>
          </div>

          <div>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="font-semibold text-[#4A423A]">
                Fase Lútea Estimada
              </span>
              <span className="font-bold text-[#C45E3B] bg-[#FAF2EE] px-2.5 py-0.5 rounded-full">
                {lutealPhase} dias
              </span>
            </div>
            <input
              type="range"
              min="10"
              max="16"
              value={lutealPhase}
              onChange={(e) => setLutealPhase(Number(e.target.value))}
              className="w-full accent-[#E0A899] cursor-pointer"
            />
            <span className="text-[11px] text-[#8C827A] block mt-0.5">
              Período entre a ovulação e a próxima menstruação (fisiologicamente estável em torno de 14 dias).
            </span>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-[#E0A899] hover:bg-[#D49585] text-white font-semibold text-xs shadow-sm transition-all active:scale-[0.99]"
        >
          <Save className="w-4 h-4" />
          <span>Salvar Alterações</span>
        </button>
      </form>

      {/* Menstrual History Management */}
      <div className="bg-white rounded-3xl border border-[#EBE3DC] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F0EBE6]">
          <div>
            <h3 className="font-serif text-lg font-semibold text-[#2D2A26] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#E0A899]" />
              Histórico de Menstruações
            </h3>
            <span className="text-xs text-[#8C827A]">
              Usado para calcular suas previsões de ovulação e fertilidade.
            </span>
          </div>

          <button
            onClick={() => setShowAddPeriod(!showAddPeriod)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FAF5F0] border border-[#E5DDD4] text-xs font-semibold text-[#C45E3B] hover:bg-[#F2E5DC] transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Adicionar Ciclo</span>
          </button>
        </div>

        {/* Add Period Form */}
        {showAddPeriod && (
          <form
            onSubmit={handleCreatePeriod}
            className="p-4 rounded-2xl bg-[#FAF7F5] border border-[#E2D8CE] space-y-3"
          >
            <h4 className="text-xs font-semibold text-[#2D2A26]">Novo registro de menstruação</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#7A7067] block mb-1">
                  Data de Início (1º dia de sangue)
                </label>
                <input
                  type="date"
                  required
                  value={newStartDate}
                  onChange={(e) => setNewStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD3C8] text-xs text-[#2D2A26]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#7A7067] block mb-1">
                  Data de Término (Opcional)
                </label>
                <input
                  type="date"
                  value={newEndDate}
                  onChange={(e) => setNewEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-[#DDD3C8] text-xs text-[#2D2A26]"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddPeriod(false)}
                className="px-3 py-1.5 text-xs text-[#7A7067] hover:underline"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-[#E0A899] text-white text-xs font-semibold hover:bg-[#D49585]"
              >
                Salvar Registro
              </button>
            </div>
          </form>
        )}

        {/* Periods List */}
        <div className="space-y-2">
          {periods.map((p) => (
            <div
              key={p.id}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF7F5] border border-[#EDE5DE]"
            >
              <div>
                <span className="text-xs font-semibold text-[#2D2A26] block">
                  Início: {formatFriendlyDate(p.startDate)}
                </span>
                <span className="text-[11px] text-[#8C827A]">
                  {p.endDate ? `Até ${formatFriendlyDate(p.endDate)}` : 'Duração estimada padrão'}
                  {p.notes ? ` • ${p.notes}` : ''}
                </span>
              </div>

              {periods.length > 1 && (
                <button
                  onClick={() => onDeletePeriod(p.id)}
                  className="p-2 text-[#8C827A] hover:text-[#B54A4A] rounded-full hover:bg-white transition-colors"
                  title="Apagar este ciclo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Privacy & Medical Limitation Card (Rule 6) */}
      <div className="rounded-3xl bg-[#FAF5F0] border border-[#E6DCD2] p-5 sm:p-6 space-y-3">
        <div className="flex items-center gap-2 text-[#A66C59]">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <h4 className="font-semibold text-xs uppercase tracking-wider">
            Privacidade e Limitações Médicas
          </h4>
        </div>
        <p className="text-xs text-[#524941] leading-relaxed">
          O <strong>CicloLeve</strong> respeita integralmente a sua privacidade: todos os dados,
          datas e sintomas são gravados exclusivamente no armazenamento local do seu dispositivo
          (<code>localStorage</code>).
        </p>
        <p className="text-xs text-[#524941] leading-relaxed">
          <strong>Lembrete importante:</strong> Este aplicativo é um assistente inteligente de organização
          pessoal e apoio. Suas estimativas de ciclo e fertilidade baseiam-se em cálculos fisiológicos e
          nos dados que você fornece. Ele <em>não substitui</em> consultas, exames ou o acompanhamento
          profissional de um(a) médico(a) ginecologista ou obstetra.
        </p>
      </div>

      {/* Backup and Data Reset */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
        <button
          onClick={handleExportJSON}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white border border-[#E0D7CE] text-xs font-semibold text-[#5C534A] hover:bg-[#F7F2EC] transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Fazer Backup (Exportar Dados)</span>
        </button>

        <button
          onClick={() => {
            if (
              confirm(
                'Tem certeza de que deseja restaurar o CicloLeve para as configurações iniciais?'
              )
            ) {
              onResetData();
            }
          }}
          className="text-xs text-[#8C827A] hover:text-[#B54A4A] transition-colors"
        >
          Restaurar configurações de fábrica
        </button>
      </div>
    </div>
  );
};
