import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from '../../context/StudioContext';
import { sendAssistantMessage } from '../../services/api';
import {
  Bot,
  X,
  Send,
  Sparkles,
  Layers,
  Lock,
  ArrowRight,
  Maximize2,
  Palette,
  LayoutGrid,
  Loader2,
  CheckCircle2,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
  actionTriggered?: string;
}

export const AiCopilotDrawer: React.FC = () => {
  const {
    isCopilotOpen,
    setIsCopilotOpen,
    activeProject,
    activePrompt,
    updateCurrentPrompt,
    setCurrentView,
    settings,
  } = useStudio();

  const isAr = settings.language === 'ar';
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'init-1',
      role: 'assistant',
      text: isAr
        ? `أهلاً بك في استوديو NAGAR DESIGN! أنا مساعدك الذكي للتصميم. أنا متصل الآن بالمشروع "${activeProject.name}".
أفهم سياق الصور المرجعية المقفلة 🔒، البرومبت v${activePrompt?.version || 1}، والطبقات. كيف أساعدك اليوم؟`
        : `Welcome to NAGAR DESIGN AI STUDIO! I am your AI Design Copilot, fully synced with project "${activeProject.name}". How can I help you today?`,
      time: 'الآن',
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      text: query,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    // Context payload
    const projectContext = {
      projectId: activeProject.id,
      projectName: activeProject.name,
      canvasDimensions: `${activeProject.printSettings?.widthCm || 30}x${activeProject.printSettings?.heightCm || 40} cm`,
      activePrompt: {
        version: activePrompt?.version,
        text: activePrompt?.text,
        negativePrompt: activePrompt?.negativePrompt,
      },
      lockedReferences: (activePrompt?.references || [])
        .filter((r) => r.isLocked)
        .map((r) => ({ name: r.name, role: r.role })),
      totalReferences: activePrompt?.references?.length || 0,
      activeLayers: (activeProject.layers || []).map((l) => ({ name: l.name, type: l.type })),
    };

    try {
      const response = await sendAssistantMessage({
        message: query,
        projectContext,
        chatHistory: messages.map((m) => ({ role: m.role, text: m.text })),
      });

      if (!response.success || !response.reply) {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg-${Date.now()}-err`,
            role: 'assistant',
            text: response.error || (isAr ? 'لم تُرجع الخدمة ردًا. لم يتم تطبيق أي تغيير.' : 'The service returned no reply. No change was applied.'),
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
        ]);
        return;
      }

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now()}-ai`,
        role: 'assistant',
        text: response.reply,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-err`,
          role: 'assistant',
          text: isAr ? 'عذرًا، حدث خطأ أثناء الاتصال. يرجى إعادة المحاولة.' : 'Error contacting AI provider.',
          time: 'الآن',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickPrompts = [
    { textAr: 'اعمللي تصميم تخرج 30×40 فيه 7 صور', textEn: 'Create 30x40 graduation design with 7 photos' },
    { textAr: 'كبرها وضاعف جودة التفاصيل', textEn: 'Upscale and enhance details' },
    { textAr: 'خلي الإطار والزخارف ذهبية فاخرة', textEn: 'Make frame and filigree golden' },
    { textAr: 'أضف الصورة الحالية كـ Style Reference', textEn: 'Add as Style Reference' },
    { textAr: 'تجهيز التصميم لقص الليزر DXF', textEn: 'Prepare for Laser Cutting' },
  ];

  if (!isCopilotOpen) return null;

  return (
    <div
      className={`fixed top-16 bottom-0 z-40 flex w-96 flex-col border-slate-800 bg-[#0c121d] shadow-2xl transition-all ${
        isAr ? 'left-0 border-r' : 'right-0 border-l'
      }`}
    >
      {/* Header */}
      <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4 bg-slate-900/60">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-600/20 text-purple-400 border border-purple-500/30">
            <Bot className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">
              {isAr ? 'مساعد التصميم الذكي (NAGAR AI)' : 'NAGAR AI Design Copilot'}
            </h3>
            <p className="text-[10px] text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              {isAr ? 'متصل بسياق المشروع' : 'Project Context Synced'}
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsCopilotOpen(false)}
          className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Active Context Chips Banner */}
      <div className="px-4 py-2 border-b border-slate-800/60 bg-purple-950/20 text-[11px] text-purple-200/80 flex items-center justify-between flex-wrap gap-1">
        <div className="flex items-center gap-1.5">
          <Lock className="w-3 h-3 text-amber-400" />
          <span>{activePrompt?.references?.filter((r) => r.isLocked).length || 1} {isAr ? 'عنصر مقفل الهوية' : 'Locked Elements'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-slate-400">
          <Layers className="w-3 h-3" />
          <span>{activeProject.layers?.length || 4} {isAr ? 'طبقات' : 'Layers'}</span>
        </div>
        <div className="font-mono text-amber-400/90 text-[10px]">
          v{activePrompt?.version || 1}
        </div>
      </div>

      {/* Messages Feed */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                m.role === 'user'
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-medium rounded-br-xs'
                  : 'bg-slate-800/80 text-slate-200 border border-slate-700/60 rounded-bl-xs'
              }`}
            >
              {m.text}
            </div>
            <span className="text-[9px] text-slate-500 mt-1 px-1">{m.time}</span>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-xs p-2 rounded-lg bg-slate-900/40 border border-slate-800">
            <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin" />
            <span>{isAr ? 'يفكر ويفحص سياق المشروع...' : 'Thinking with project context...'}</span>
          </div>
        )}
      </div>

      {/* Quick Context Action Pills */}
      <div className="p-2 border-t border-slate-800/60 bg-slate-950/40">
        <div className="text-[10px] text-slate-400 mb-1.5 px-1 font-medium">
          {isAr ? 'اقتراحات سريعة تفهم المشروع:' : 'Quick context suggestions:'}
        </div>
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {quickPrompts.slice(0, 3).map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(isAr ? qp.textAr : qp.textEn)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-amber-300 border border-slate-700/50 whitespace-nowrap transition-colors shrink-0"
            >
              {isAr ? qp.textAr : qp.textEn}
            </button>
          ))}
        </div>
      </div>

      {/* Input box */}
      <div className="p-3 border-t border-slate-800 bg-[#0d131f]">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isAr ? 'اكتب أمرًا للمساعد (مثلاً: كبرها، خليها ذهبية)...' : 'Type design instruction...'}
            className="flex-1 bg-slate-900 border border-slate-700/80 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 disabled:opacity-40 transition-colors shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
