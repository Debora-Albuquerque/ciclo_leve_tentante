import React from 'react';
import { Sparkles, Calendar, MessageCircleHeart, Bell, Settings, Heart } from 'lucide-react';
import { UserProfile, NotificationSettings } from '../types/cycle';

interface HeaderProps {
  activeTab: 'today' | 'calendar' | 'chat' | 'notifications' | 'settings';
  setActiveTab: (tab: 'today' | 'calendar' | 'chat' | 'notifications' | 'settings') => void;
  profile: UserProfile;
  notifications: NotificationSettings;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  profile,
  notifications,
}) => {
  const unreadAlerts = notifications.alerts.filter((a) => !a.read).length;

  return (
    <header className="sticky top-0 z-30 bg-[#FAF7F5]/90 backdrop-blur-md border-b border-[#E8DFD8]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div
            onClick={() => setActiveTab('today')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E0A899] to-[#F3D6CE] flex items-center justify-center text-white shadow-sm shadow-[#E0A899]/30 transition-transform group-hover:scale-105">
              <Heart className="w-4 h-4 fill-white/80" />
            </div>
            <div>
              <span className="font-serif text-xl tracking-tight text-[#3A332C] font-semibold">
                CicloLeve
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs text-[#8C827A] font-light">
                {profile.goal === 'tentando' ? '• Tentante' : '• Meu Ciclo'}
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            <button
              onClick={() => setActiveTab('today')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'today'
                  ? 'bg-[#EAE0D7] text-[#3D332A]'
                  : 'text-[#7D736A] hover:text-[#3D332A] hover:bg-[#F2ECE5]'
              }`}
            >
              Hoje
            </button>
            <button
              onClick={() => setActiveTab('calendar')}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'calendar'
                  ? 'bg-[#EAE0D7] text-[#3D332A]'
                  : 'text-[#7D736A] hover:text-[#3D332A] hover:bg-[#F2ECE5]'
              }`}
            >
              Calendário
            </button>
            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'chat'
                  ? 'bg-[#E0A899] text-white shadow-sm shadow-[#E0A899]/30'
                  : 'text-[#7D736A] hover:text-[#3D332A] hover:bg-[#F2ECE5]'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Assistente IA
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`relative px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'notifications'
                  ? 'bg-[#EAE0D7] text-[#3D332A]'
                  : 'text-[#7D736A] hover:text-[#3D332A] hover:bg-[#F2ECE5]'
              }`}
              title="Notificações"
            >
              <Bell className="w-4 h-4" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E0A899]" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                activeTab === 'settings'
                  ? 'bg-[#EAE0D7] text-[#3D332A]'
                  : 'text-[#7D736A] hover:text-[#3D332A] hover:bg-[#F2ECE5]'
              }`}
              title="Ajustes do Ciclo"
            >
              <Settings className="w-4 h-4" />
            </button>
          </nav>

          {/* User Profile Pill */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('settings')}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#F3EDE6] border border-[#E5DDD4] text-xs text-[#5C534A] hover:bg-[#EAE1D7] transition-colors"
            >
              <span className="w-2 h-2 rounded-full bg-[#A8BFA8]"></span>
              <span>{profile.name || 'Débora'}</span>
            </button>

            {/* Mobile notification icon */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="md:hidden relative p-2 rounded-full text-[#7D736A] hover:bg-[#EAE1D7]"
            >
              <Bell className="w-5 h-5" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E0A899]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation Bar (Persistent & Ergonomic) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF7F5]/95 backdrop-blur-md border-t border-[#E8DFD8] py-2 px-3">
        <div className="flex items-center justify-around max-w-md mx-auto">
          <button
            onClick={() => setActiveTab('today')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'today' ? 'text-[#E0A899]' : 'text-[#8E847C]'
            }`}
          >
            <Heart className={`w-5 h-5 ${activeTab === 'today' ? 'fill-[#E0A899]' : ''}`} />
            <span className="text-[10px] font-medium">Hoje</span>
          </button>

          <button
            onClick={() => setActiveTab('calendar')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'calendar' ? 'text-[#E0A899]' : 'text-[#8E847C]'
            }`}
          >
            <Calendar className="w-5 h-5" />
            <span className="text-[10px] font-medium">Calendário</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`flex flex-col items-center gap-1 py-1 px-3 rounded-2xl transition-all ${
              activeTab === 'chat'
                ? 'bg-[#E0A899] text-white shadow-md shadow-[#E0A899]/30 -translate-y-1'
                : 'text-[#8E847C]'
            }`}
          >
            <MessageCircleHeart className="w-5 h-5" />
            <span className="text-[10px] font-semibold">Assistente</span>
          </button>

          <button
            onClick={() => setActiveTab('notifications')}
            className={`relative flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'notifications' ? 'text-[#E0A899]' : 'text-[#8E847C]'
            }`}
          >
            <Bell className="w-5 h-5" />
            {unreadAlerts > 0 && (
              <span className="absolute top-1 right-2.5 w-2 h-2 rounded-full bg-[#E0A899]" />
            )}
            <span className="text-[10px] font-medium">Lembretes</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition-all ${
              activeTab === 'settings' ? 'text-[#E0A899]' : 'text-[#8E847C]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Meu Ciclo</span>
          </button>
        </div>
      </div>
    </header>
  );
};
