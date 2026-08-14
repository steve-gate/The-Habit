import React from 'react';
import { motion } from 'motion/react';
import { Target, CheckCircle2, Zap, Brain, Coffee, Bike, Lightbulb, Languages, Puzzle, Library } from 'lucide-react';
import { DailyMicroGoal } from '../types';

interface MicroGoalsProps {
  goals: DailyMicroGoal[];
  onComplete: (goalId: string) => void;
}

export const MicroGoals: React.FC<MicroGoalsProps> = ({ goals, onComplete }) => {
  const getIcon = (category: string) => {
    switch (category) {
      case 'health': return <Coffee size={18} className="text-blue-400" />;
      case 'mindset': return <Brain size={18} className="text-purple-400" />;
      case 'creativity': return <Lightbulb size={18} className="text-amber-400" />;
      case 'wisdom': return <Target size={18} className="text-emerald-400" />;
      case 'memory': return <Library size={18} className="text-rose-400" />;
      case 'logic': return <Puzzle size={18} className="text-cyan-400" />;
      case 'language': return <Languages size={18} className="text-indigo-400" />;
      default: return <Zap size={18} className="text-slate-400" />;
    }
  };

  return (
    <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 backdrop-blur-md">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-amber-500/10 rounded-xl">
          <Target className="text-amber-500" size={20} />
        </div>
        <div>
          <h3 className="text-lg font-black text-white uppercase tracking-wider">Hệ thống Đa Mục Tiêu</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase">Thử thách vi mô mỗi ngày</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.map((goal) => (
          <motion.div
            key={goal.id}
            whileHover={!goal.isCompleted ? { scale: 1.02 } : {}}
            className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
              goal.isCompleted 
                ? 'bg-emerald-500/5 border-emerald-500/20 opacity-60' 
                : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-slate-900/50`}>
                {getIcon(goal.category)}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-200">{goal.title}</p>
                <p className="text-[10px] text-slate-500 font-black uppercase">+{goal.xpReward} XP</p>
              </div>
            </div>

            <button
              onClick={() => !goal.isCompleted && onComplete(goal.id)}
              disabled={goal.isCompleted}
              className={`p-2 rounded-xl transition-all ${
                goal.isCompleted 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-700 text-slate-400 hover:bg-slate-600 hover:text-white'
              }`}
            >
              <CheckCircle2 size={20} />
            </button>
          </motion.div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/50 flex flex-wrap items-center justify-between gap-4">
        <div className="flex gap-2">
          <span className="text-[8px] px-2 py-0.5 bg-amber-500/10 text-amber-500 rounded-full font-bold uppercase tracking-widest border border-amber-500/20">Thói quen nguyên tử</span>
          <span className="text-[8px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full font-bold uppercase tracking-widest border border-blue-500/20">Momentum</span>
        </div>
        <p className="text-[9px] text-slate-500 italic">"Những thay đổi nhỏ tạo nên kết quả lớn. Đừng bỏ lỡ nỗ lực siêu nhỏ hằng ngày."</p>
      </div>
    </div>
  );
};
