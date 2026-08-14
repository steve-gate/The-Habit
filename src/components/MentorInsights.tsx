import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Quote, Brain, Sparkles, BookOpen } from 'lucide-react';
import { VirtualPersona } from '../lib/personas';

interface MentorInsightsProps {
  activeBookTitle: string;
  activeBookContent?: string;
  personas: VirtualPersona[];
}

export const MentorInsights: React.FC<MentorInsightsProps> = ({ activeBookTitle, activeBookContent, personas }) => {
  const [insight, setInsight] = useState<{ persona: VirtualPersona; text: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchInsight = async () => {
    if (!activeBookTitle) return;
    
    setIsLoading(true);
    const persona = personas[Math.floor(Math.random() * personas.length)];
    
    try {
      const response = await fetch('/api/generate-persona-comment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personaName: persona.name,
          personaRole: persona.role,
          bookTitle: activeBookTitle,
          bookContent: activeBookContent,
          postContent: `Tôi đang nghiên cứu sâu cuốn sách "${activeBookTitle}" và muốn nghe góc nhìn trí tuệ từ bạn.`,
          category: 'reading'
        })
      });
      const data = await response.json();
      if (data.comment) {
        setInsight({ persona, text: data.comment });
      }
    } catch (error) {
      console.error("Failed to fetch mentor insight", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsight();
  }, [activeBookTitle]);

  if (!activeBookTitle) return null;

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-2xl p-6 relative overflow-hidden group">
      <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
        <Brain size={80} />
      </div>

      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
          <Quote size={20} />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Góc nhìn từ Mentor</h3>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center py-8 space-y-4"
          >
            <div className="w-8 h-8 border-2 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
            <p className="text-xs text-slate-500 animate-pulse font-mono uppercase tracking-tighter">Đang kết nối với tri thức...</p>
          </motion.div>
        ) : insight ? (
          <motion.div
            key="content"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <img 
                src={insight.persona.avatar} 
                alt={insight.persona.name} 
                className="w-10 h-10 rounded-full border border-slate-700 object-cover"
              />
              <div>
                <p className="text-sm font-bold text-slate-200">{insight.persona.name}</p>
                <p className="text-[10px] text-indigo-400 font-medium uppercase tracking-tight">{insight.persona.role}</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -left-2 top-0 text-indigo-500/20">
                <Quote size={40} className="rotate-180" />
              </div>
              <p className="text-slate-300 italic leading-relaxed pl-6 relative z-10">
                "{insight.insight_text || insight.text}"
              </p>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <span className="text-[8px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-bold uppercase tracking-widest">Deep Insight</span>
              <span className="text-[8px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-full font-bold uppercase tracking-widest border border-indigo-500/20">
                {activeBookTitle}
              </span>
            </div>
            
            <button 
              onClick={fetchInsight}
              className="mt-2 text-[10px] text-slate-500 hover:text-indigo-400 flex items-center gap-2 transition-colors group"
            >
              <Sparkles size={12} className="group-hover:animate-pulse" />
              <span>Nghe góc nhìn khác</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
