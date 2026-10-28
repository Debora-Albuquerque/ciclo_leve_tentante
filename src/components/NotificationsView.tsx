import React, { useState } from 'react';
import {
  Bell,
  BellRing,
  Sparkles,
  CheckCircle2,
  Send,
  Trash2,
  ShieldCheck,
  Smartphone,
  Info
} from 'lucide-react';
import { NotificationSettings, SimulatedAlert, UserProfile } from '../types/cycle';
import { CurrentCycleSummary, formatFriendlyDate, formatDateISO } from '../utils/cycleCalculations';

interface NotificationsViewProps {
  settings: NotificationSettings;
  profile: UserProfile;
  summary: CurrentCycleSummary | null;
  onUpdateSettings: (newSettings: NotificationSettings) => void;
  onTriggerSimulatedNotification: (title: string, message: string, type: 'fertile' | 'ovulation' | 'period' | 'tip') => void;
  onClearAlerts: () => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({
  settings,
  profile,
  summary,
  onUpdateSettings,
  onTriggerSimulatedNotification,
  onClearAlerts,
}) => {
  const [nativeStatus, setNativeStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window
      ? Notification.permission
      : 'unsupported'
  );

  const requestNativePermission = async () => {
    if (!('Notification' in window)) {
      alert('Seu navegador atual não suporta notificações nativas.');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      setNativeStatus(permission);

      if (permission === 'granted') {
        onUpdateSettings({
          ...settings,
          nativeGranted: true,
          enabled: true,
        });

        // Trigger welcome native notification
        new Notification('🌸 CicloLeve • Lembrete Ativado', {
          body: `Olá${profile.name ? `, ${profile.name}` : ''}! Avisaremos com carinho quando sua janela fértil estiver próxima.`,
          icon: '/favicon.ico',
        });

        onTriggerSimulatedNotification(
          '🔔 Notificações Ativadas com Sucesso',
          `Olá${profile.name ? `, ${profile.name}` : ''}! Seus lembretes gentis estão prontos.`,
          'tip'
        );
      }
    } catch (err) {
      console.error('Error requesting notification permission:', err);
    }
  };

  const handleTestFertileAlert = () => {
    const days = summary?.daysToFertileWindow ?? 2;
    const msg = days > 0
      ? `Dica: Faltam ${days} dias para a sua janela fértil começar. Que tal preparar o coração?`
      : `Dica: Sua janela fértil está aberta agora! Aproveite o momento com carinho e tranquilidade.`;

    onTriggerSimulatedNotification(
      '🌸 Janela Fértil à Vista',
      msg,
      'fertile'
    );

    if (nativeStatus === 'granted') {
      new Notification('🌸 CicloLeve: Janela Fértil', {
        body: msg,
      });
    }
  };

  const handleTestOvulationAlert = () => {
    const msg = `Hoje é o seu dia provável de ovulação. O óvulo está pronto, viva este dia com leveza e afeto!`;
    onTriggerSimulatedNotification(
      '✨ Dia Provável da Ovulação',
      msg,
      'ovulation'
    );

    if (nativeStatus === 'granted') {
      new Notification('✨ CicloLeve: Dia da Ovulação', {
        body: msg,
      });
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8 max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-serif text-[#2D2A26] font-semibold">
          Lembretes & Notificações
        </h1>
        <p className="text-xs text-[#8C827A] mt-0.5">
          Receba avisos gentis no momento certo da sua janela fértil e ovulação, sem estresse.
        </p>
      </div>

      {/* Native Browser Notification Card */}
      <div className="bg-white rounded-3xl border border-[#EBE3DC] p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#F0EBE6] flex items-center justify-center text-[#5C534A] shrink-0 mt-0.5">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[#2D2A26]">
                Notificações Nativas do Dispositivo
              </h3>
              <p className="text-xs text-[#7A7067] mt-0.5 leading-relaxed">
                Permita que o navegador envie avisos na tela do seu aparelho quando a sua janela fértil estiver chegando.
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                    nativeStatus === 'granted'
                      ? 'bg-[#EBF2EB] text-[#3D663D]'
                      : 'bg-[#FAF0E6] text-[#A66C59]'
                  }`}
                >
                  Status: {nativeStatus === 'granted' ? 'Ativadas ✓' : nativeStatus === 'denied' ? 'Bloqueadas pelo navegador' : 'Aguardando permissão'}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={requestNativePermission}
            className={`px-4 py-2.5 rounded-full text-xs font-semibold shrink-0 transition-all ${
              nativeStatus === 'granted'
                ? 'bg-[#F2ECE5] text-[#5C534A] hover:bg-[#EAE0D7]'
                : 'bg-[#E0A899] text-white hover:bg-[#D49585] shadow-sm shadow-[#E0A899]/30 active:scale-95'
            }`}
          >
            {nativeStatus === 'granted' ? 'Testar Novamente' : 'Ativar Notificações'}
          </button>
        </div>
      </div>

      {/* Simulator Actions */}
      <div className="bg-[#FAF5F0] rounded-3xl border border-[#E8DFD8] p-5 sm:p-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs uppercase tracking-wider font-semibold text-[#8C827A] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#E0A899]" />
            Simulador de Lembretes Gentis
          </h3>
          <span className="text-[11px] text-[#A69B91]">Teste como você receberá os avisos</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={handleTestFertileAlert}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#EBE3DC] hover:border-[#DAC5BB] text-left transition-all hover:shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#EBF2EB] flex items-center justify-center text-[#3D663D] shrink-0">
              <BellRing className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold block text-[#2D2A26] group-hover:text-[#C45E3B]">
                Simular Alerta de Janela Fértil
              </span>
              <span className="text-[11px] text-[#7A7067]">
                &ldquo;Faltam 2 dias para a sua janela fértil...&rdquo;
              </span>
            </div>
          </button>

          <button
            onClick={handleTestOvulationAlert}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#EBE3DC] hover:border-[#DAC5BB] text-left transition-all hover:shadow-xs group"
          >
            <div className="w-8 h-8 rounded-xl bg-[#F9ECE7] flex items-center justify-center text-[#C45E3B] shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-semibold block text-[#2D2A26] group-hover:text-[#C45E3B]">
                Simular Alerta de Ovulação
              </span>
              <span className="text-[11px] text-[#7A7067]">
                &ldquo;Hoje é o dia provável de ovulação...&rdquo;
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* Feed of Simulated & Received Notifications */}
      <div className="bg-white rounded-3xl border border-[#EBE3DC] p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F0EBE6]">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-[#E0A899]" />
            <h3 className="font-serif font-semibold text-base text-[#2D2A26]">
              Histórico de Lembretes Recebidos
            </h3>
            <span className="text-xs text-[#8C827A]">({settings.alerts.length})</span>
          </div>

          {settings.alerts.length > 0 && (
            <button
              onClick={onClearAlerts}
              className="text-xs text-[#8C827A] hover:text-[#C45E3B] flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Limpar todos</span>
            </button>
          )}
        </div>

        {settings.alerts.length === 0 ? (
          <div className="text-center py-8 text-[#8C827A] text-xs">
            Nenhum lembrete no histórico no momento.
          </div>
        ) : (
          <div className="space-y-3">
            {settings.alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl border transition-all ${
                  alert.type === 'fertile'
                    ? 'bg-[#FAF5F0] border-[#EDE0D5]'
                    : alert.type === 'ovulation'
                    ? 'bg-[#FDF4F0] border-[#F5DDD2]'
                    : 'bg-[#FAF7F5] border-[#EAE2D9]'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#2D2A26]">
                      {alert.title}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#A69B91]">
                    {formatFriendlyDate(alert.date)}
                  </span>
                </div>
                <p className="text-xs text-[#4A423A] mt-1.5 leading-relaxed font-normal">
                  {alert.message}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Settings Switches */}
      <div className="bg-[#FAF7F5] rounded-3xl border border-[#E8DFD8] p-5 space-y-4">
        <h3 className="text-xs uppercase tracking-wider font-semibold text-[#8C827A]">
          Preferências de Lembretes
        </h3>

        <div className="space-y-3">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-[#2D2A26] block">
                Lembrete prévio da Janela Fértil
              </span>
              <span className="text-[11px] text-[#7A7067]">
                Avisar com 2 dias de antecedência para se organizar com tranquilidade
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.remindDaysBeforeFertile > 0}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  remindDaysBeforeFertile: e.target.checked ? 2 : 0,
                })
              }
              className="accent-[#E0A899] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-[#2D2A26] block">
                Lembrete no dia da Ovulação
              </span>
              <span className="text-[11px] text-[#7A7067]">
                Aviso acolhedor no dia provável de pico de fertilidade
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.remindOvulation}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  remindOvulation: e.target.checked,
                })
              }
              className="accent-[#E0A899] w-4 h-4 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-xs font-semibold text-[#2D2A26] block">
                Previsão da Próxima Menstruação
              </span>
              <span className="text-[11px] text-[#7A7067]">
                Lembrete discreto 1 dia antes da data prevista
              </span>
            </div>
            <input
              type="checkbox"
              checked={settings.remindPeriod}
              onChange={(e) =>
                onUpdateSettings({
                  ...settings,
                  remindPeriod: e.target.checked,
                })
              }
              className="accent-[#E0A899] w-4 h-4 cursor-pointer"
            />
          </label>
        </div>
      </div>
    </div>
  );
};
