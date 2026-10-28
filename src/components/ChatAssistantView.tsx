import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  Sparkles,
  Heart,
  Droplets,
  Calendar,
  CheckCircle,
  BellRing,
  HelpCircle,
  Trash2,
  RefreshCw
} from 'lucide-react';
import {
  UserProfile,
  PeriodEntry,
  DailyLog,
  ChatMessage,
  CycleActionPayload
} from '../types/cycle';
import { CurrentCycleSummary } from '../utils/cycleCalculations';

interface ChatAssistantViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  profile: UserProfile;
  summary: CurrentCycleSummary | null;
  onApplyNotificationSuggestion: (text: string) => void;
  onClearChatHistory: () => void;
}

export const ChatAssistantView: React.FC<ChatAssistantViewProps> = ({
  messages,
  onSendMessage,
  isLoading,
  profile,
  summary,
  onApplyNotificationSuggestion,
  onClearChatHistory,
}) => {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const msg = inputText.trim();
    setInputText('');
    onSendMessage(msg);
  };

  const handleChipClick = (prompt: string) => {
    if (isLoading) return;
    onSendMessage(prompt);
  };

  // Helper to parse the 3 sections from replyText for high-polish typography
  const renderFormattedReply = (text: string) => {
    // Check if contains bullets
    const lines = text.split('\n').filter((l) => l.trim().length > 0);
    return (
      <div className="space-y-3">
        {lines.map((line, idx) => {
          // Check section headers
          const isSummary = line.includes('Resumo do Ciclo');
          const isTip = line.includes('Próximos Passos') || line.includes('Dica do Dia');
          const isAction = line.includes('Ação');

          let cleanLine = line.replace(/^[-*•]\s*/, '').trim();

          return (
            <div
              key={idx}
              className={`p-3 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                isSummary
                  ? 'bg-[#FAF5F0] border border-[#EDE3DA] text-[#3A332C]'
                  : isTip
                  ? 'bg-[#F2F7F2] border border-[#DEECDE] text-[#2F472F]'
                  : isAction
                  ? 'bg-white border border-[#E8DFD8] text-[#423A33]'
                  : 'text-[#3A332C]'
              }`}
            >
              <div
                dangerouslySetInnerHTML={{
                  __html: cleanLine
                    .replace(
                      /\*\*(.*?)\*\*/g,
                      '<strong class="font-semibold text-[#1F1C19]">$1</strong>'
                    )
                    .replace(
                      /\*(.*?)\*/g,
                      '<em class="italic text-[#4D453E]">$1</em>'
                    ),
                }}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-130px)] max-w-3xl mx-auto">
      {/* Header bar */}
      <div className="flex items-center justify-between pb-3 border-b border-[#EBE3DC]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-[#E0A899] to-[#F3D6CE] flex items-center justify-center text-white shadow-sm">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h2 className="font-serif font-semibold text-lg text-[#2D2A26] flex items-center gap-1.5">
              CicloLeve
              <span className="w-2 h-2 rounded-full bg-[#7DAF7D]" title="Online" />
            </h2>
            <p className="text-[11px] text-[#8C827A]">
              Assistente acolhedor para {profile.name || 'você'} • Foco em fertilidade
            </p>
          </div>
        </div>

        <button
          onClick={onClearChatHistory}
          className="text-xs text-[#8C827A] hover:text-[#C45E3B] p-1.5 rounded-full hover:bg-white transition-colors"
          title="Limpar histórico de conversa"
        >
          <RefreshCw className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4 px-1 pr-2">
        {messages.map((msg) => {
          const isUser = msg.role === 'user';

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[88%] sm:max-w-[80%] rounded-3xl p-4 sm:p-5 shadow-xs ${
                  isUser
                    ? 'bg-[#E0A899] text-white rounded-br-sm'
                    : 'bg-white border border-[#EBE3DC] text-[#2D2A26] rounded-bl-sm shadow-sm'
                }`}
              >
                {isUser ? (
                  <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                ) : (
                  <div className="space-y-3">
                    {renderFormattedReply(msg.text)}

                    {/* Action notification badge if data was modified */}
                    {msg.actionApplied && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EBF2EB] border border-[#D5E5D5] text-[#3A633A] text-xs font-medium">
                        <CheckCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{msg.actionApplied}</span>
                      </div>
                    )}

                    {/* Suggested notification pill */}
                    {msg.suggestedNotification && (
                      <div className="pt-2 border-t border-[#F0E8E1] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 text-xs text-[#8C827A]">
                          <BellRing className="w-3.5 h-3.5 text-[#E0A899] shrink-0" />
                          <span className="italic line-clamp-2">
                            &ldquo;{msg.suggestedNotification}&rdquo;
                          </span>
                        </div>
                        <button
                          onClick={() =>
                            onApplyNotificationSuggestion(msg.suggestedNotification!)
                          }
                          className="self-end sm:self-auto text-[11px] font-semibold text-[#C45E3B] hover:text-[#9E4A2E] bg-[#FAF5F0] hover:bg-[#F2E5DC] px-2.5 py-1 rounded-full transition-colors whitespace-nowrap"
                        >
                          Salvar Lembrete
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <span className="text-[10px] text-[#A69B91] mt-1 px-2">{msg.timestamp}</span>
            </div>
          );
        })}

        {isLoading && (
          <div className="flex items-start gap-2">
            <div className="bg-white border border-[#EBE3DC] rounded-3xl p-4 shadow-xs flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#E0A899] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#E0A899] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#E0A899] animate-bounce [animation-delay:0.4s]" />
              <span className="text-xs text-[#8C827A] font-medium ml-1">
                CicloLeve pensando com carinho...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Action Suggestion Chips */}
      <div className="pt-2 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-none">
          <button
            onClick={() => handleChipClick('Como está minha janela fértil e ovulação?')}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white border border-[#E5DDD4] text-[#5C534A] hover:bg-[#F8F2EC] hover:border-[#DACCC0] transition-colors"
          >
            🌸 Janela fértil e ovulação
          </button>
          <button
            onClick={() => handleChipClick('Minha menstruação desceu hoje')}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white border border-[#E5DDD4] text-[#B54A4A] hover:bg-[#FBEBEB] hover:border-[#E8C2C2] transition-colors"
          >
            🩸 Menstruação desceu hoje
          </button>
          <button
            onClick={() => handleChipClick('Hoje notei muco tipo clara de ovo')}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white border border-[#E5DDD4] text-[#3D663D] hover:bg-[#EBF2EB] hover:border-[#C4DEC4] transition-colors"
          >
            💧 Muco clara de ovo hoje
          </button>
          <button
            onClick={() => handleChipClick('Qual a melhor data para namorar neste ciclo?')}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white border border-[#E5DDD4] text-[#9E4A6F] hover:bg-[#FAF0F4] hover:border-[#E8BED3] transition-colors"
          >
            ❤️ Dias ideais para engravidar
          </button>
          <button
            onClick={() => handleChipClick('Mude a duração do meu ciclo para 29 dias')}
            className="shrink-0 px-3 py-1.5 rounded-full text-xs bg-white border border-[#E5DDD4] text-[#5C534A] hover:bg-[#F8F2EC] hover:border-[#DACCC0] transition-colors"
          >
            📅 Ajustar ciclo para 29 dias
          </button>
        </div>
      </div>

      {/* Input box */}
      <form onSubmit={handleSubmit} className="relative pb-16 md:pb-0">
        <div className="relative flex items-center bg-white rounded-full border border-[#E0D6CE] shadow-sm focus-within:border-[#C4745E] focus-within:ring-2 focus-within:ring-[#C4745E]/15 transition-all">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Converse ou registre dados ("menstruei hoje", "apague ontem")...`}
            className="w-full pl-5 pr-12 py-3 bg-transparent text-sm text-[#2D2A26] placeholder-[#A39990] focus:outline-none"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className={`absolute right-1.5 p-2 rounded-full transition-all ${
              inputText.trim() && !isLoading
                ? 'bg-[#E0A899] text-white hover:bg-[#D49585] shadow-sm'
                : 'bg-[#F2ECE5] text-[#A89E95] cursor-not-allowed'
            }`}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

        {/* Reassuring privacy notice */}
        <p className="text-[11px] text-center text-[#9E948B] mt-1.5">
          Suas informações ficam salvas de forma privada no seu dispositivo.
        </p>
      </form>
    </div>
  );
};
