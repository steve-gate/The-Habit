import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Check, ChevronDown, ChevronUp, Circle, Lightbulb, Plus, Trash2, X, Zap } from 'lucide-react';
import { Habit } from '../types';

interface HabitManagerProps {
  habits: Habit[];
  onAddHabit: (title: string, isMicro?: boolean, microTitle?: string) => void;
  onDeleteHabit: (id: string) => void;
  completedIds: string[];
  onToggleHabit: (id: string, isMicroClicked?: boolean) => void;
  completedSubGoalIds?: string[];
  onToggleSubGoal?: (habitId: string, subGoalId: string) => void;
  onAddSubGoal?: (habitId: string, title: string) => void;
  onDeleteSubGoal?: (habitId: string, subGoalId: string) => void;
}

const SUGGESTIONS = [
  { title: 'Tập thể dục', micro: 'Mặc đồ tập và vận động 2 phút.' },
  { title: 'Đọc sách', micro: 'Đọc 1 trang.' },
  { title: 'Thiền', micro: 'Ngồi yên và thở chậm 30 giây.' },
  { title: 'Viết phần mềm', micro: 'Mở dự án và sửa một việc rất nhỏ.' },
  { title: 'Học ngoại ngữ', micro: 'Ôn 3 từ.' },
];

export const HabitManager: React.FC<HabitManagerProps> = ({
  habits, onAddHabit, onDeleteHabit, completedIds, onToggleHabit,
  completedSubGoalIds = [], onToggleSubGoal, onAddSubGoal, onDeleteSubGoal,
}) => {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [useMinimum, setUseMinimum] = useState(false);
  const [minimumTitle, setMinimumTitle] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [subTitle, setSubTitle] = useState<Record<string, string>>({});
  const dailyCount = useMemo(() => habits.filter(h => h.frequency !== 'weekly').length, [habits]);
  const doneCount = habits.filter(h => completedIds.includes(h.id)).length;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = title.trim();
    if (!clean) return;
    onAddHabit(clean, useMinimum, useMinimum ? (minimumTitle.trim() || 'Làm phiên bản nhỏ nhất có thể.') : undefined);
    setTitle(''); setMinimumTitle(''); setUseMinimum(false); setAdding(false);
  };

  return <section className="rounded-[28px] border border-slate-800 bg-slate-950/45 overflow-hidden shadow-2xl">
    <div className="p-6 md:p-7 flex items-start justify-between gap-4 border-b border-slate-800/80">
      <div>
        <div className="text-[10px] uppercase tracking-[.2em] text-emerald-400 font-black">Thói quen hôm nay</div>
        <h2 className="mt-2 text-2xl font-black text-white">Việc nhỏ, làm thật</h2>
        <p className="mt-1 text-xs text-slate-400">Đã xong {doneCount}/{habits.length}. {dailyCount ? 'Không cần hoàn hảo; chỉ cần tiếp tục xuất hiện.' : 'Thêm một thói quen đầu tiên.'}</p>
      </div>
      <button onClick={() => setAdding(v => !v)} className="rounded-2xl p-3 bg-white text-slate-950 hover:bg-emerald-300 transition-colors" aria-label={adding ? 'Đóng' : 'Thêm thói quen'}>{adding ? <X size={20}/> : <Plus size={20}/>}</button>
    </div>

    <AnimatePresence initial={false}>{adding && <motion.form initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} onSubmit={submit} className="overflow-hidden border-b border-slate-800/80">
      <div className="p-6 grid gap-4 bg-slate-950/55">
        <label className="grid gap-2"><span className="text-xs font-bold text-slate-300">Bạn muốn làm đều việc gì?</span><input autoFocus value={title} onChange={e=>setTitle(e.target.value)} placeholder="Ví dụ: Đọc sách 20 phút" className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"/></label>
        <label className="flex gap-3 items-start rounded-2xl border border-slate-800 bg-slate-900/60 p-4 cursor-pointer"><input type="checkbox" checked={useMinimum} onChange={e=>setUseMinimum(e.target.checked)} className="mt-1 accent-emerald-400"/><div><div className="text-sm font-bold text-slate-200">Có bản tối thiểu cho ngày mệt</div><div className="text-xs text-slate-500 mt-1">Một bước đủ nhỏ để bạn không bỏ hẳn.</div></div></label>
        {useMinimum && <input value={minimumTitle} onChange={e=>setMinimumTitle(e.target.value)} placeholder="Ví dụ: Đọc 1 trang" className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"/>}
        <div><div className="flex items-center gap-2 text-[10px] uppercase tracking-wider text-slate-500 font-black mb-2"><Lightbulb size={12}/> Gợi ý nhanh</div><div className="flex flex-wrap gap-2">{SUGGESTIONS.map(s=><button key={s.title} type="button" onClick={()=>{setTitle(s.title);setUseMinimum(true);setMinimumTitle(s.micro)}} className="rounded-full border border-slate-800 px-3 py-1.5 text-[10px] text-slate-400 hover:text-white hover:border-slate-600">{s.title}</button>)}</div></div>
        <div className="flex justify-end gap-2"><button type="button" onClick={()=>setAdding(false)} className="rounded-xl px-4 py-2 text-xs font-bold text-slate-400">Hủy</button><button type="submit" className="rounded-xl bg-emerald-400 px-5 py-2 text-xs font-black text-slate-950">Thêm thói quen</button></div>
      </div>
    </motion.form>}</AnimatePresence>

    <div className="p-5 md:p-6 space-y-3">
      {habits.map(habit => {
        const done = completedIds.includes(habit.id);
        const open = Boolean(expanded[habit.id]);
        return <motion.div layout key={habit.id} className={`rounded-3xl border transition-colors ${done?'border-emerald-500/25 bg-emerald-500/7':'border-slate-800 bg-slate-950/45'}`}>
          <div className="px-5 py-4 flex items-center justify-between gap-3">
            <button onClick={()=>onToggleHabit(habit.id,false)} className="min-w-0 flex flex-1 items-center gap-4 text-left">
              <span className={`w-7 h-7 rounded-full grid place-items-center shrink-0 ${done?'bg-emerald-400 text-slate-950':'border-2 border-slate-700 text-transparent'}`}>{done?<Check size={16} strokeWidth={3}/>:<Circle size={13}/>}</span>
              <span className="min-w-0"><span className={`block text-sm font-bold ${done?'text-slate-300':'text-white'}`}>{habit.title}</span>{habit.isMicro&&habit.microTitle&&<span className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-300"><Zap size={11}/> Bản tối thiểu: {habit.microTitle}</span>}</span>
            </button>
            <div className="flex items-center gap-1"><button onClick={()=>setExpanded(p=>({...p,[habit.id]:!p[habit.id]}))} className="p-2 text-slate-500 hover:text-white">{open?<ChevronUp size={17}/>:<ChevronDown size={17}/>}</button><button onClick={()=>onDeleteHabit(habit.id)} className="p-2 text-slate-600 hover:text-red-400"><Trash2 size={16}/></button></div>
          </div>

          <AnimatePresence initial={false}>{open&&<motion.div initial={{height:0,opacity:0}} animate={{height:'auto',opacity:1}} exit={{height:0,opacity:0}} className="overflow-hidden"><div className="border-t border-slate-800/70 px-5 py-4 pl-16 space-y-2">
            {(habit.subGoals||[]).map(sg=>{const sgDone=done||completedSubGoalIds.includes(sg.id);return <div key={sg.id} className="flex items-center gap-2"><button onClick={()=>onToggleSubGoal?.(habit.id,sg.id)} className="flex flex-1 items-center gap-2 text-left"><span className={`w-4 h-4 rounded-full grid place-items-center ${sgDone?'bg-emerald-400 text-slate-950':'border border-slate-700'}`}>{sgDone&&<Check size={10}/>}</span><span className={`text-xs ${sgDone?'text-slate-500 line-through':'text-slate-300'}`}>{sg.title}</span></button>{onDeleteSubGoal&&<button onClick={()=>onDeleteSubGoal(habit.id,sg.id)} className="text-slate-600 hover:text-red-400"><Trash2 size={12}/></button>}</div>})}
            {onAddSubGoal&&<form onSubmit={e=>{e.preventDefault();const t=(subTitle[habit.id]||'').trim();if(t){onAddSubGoal(habit.id,t);setSubTitle(p=>({...p,[habit.id]:''}))}}} className="flex gap-2 pt-1"><input value={subTitle[habit.id]||''} onChange={e=>setSubTitle(p=>({...p,[habit.id]:e.target.value}))} placeholder="Thêm bước nhỏ..." className="min-w-0 flex-1 bg-transparent border-b border-slate-800 py-1 text-xs text-white outline-none"/><button className="text-[10px] font-black text-emerald-300">THÊM</button></form>}
          </div></motion.div>}</AnimatePresence>

          {habit.isMicro&&!done&&habit.microTitle&&<div className="border-t border-slate-800/60 px-5 py-3 flex items-center justify-between gap-3"><p className="text-xs text-slate-500">Hôm nay ít sức? Làm bản nhỏ vẫn tốt hơn bỏ hẳn.</p><button onClick={()=>onToggleHabit(habit.id,true)} className="shrink-0 rounded-xl border border-amber-500/25 bg-amber-500/10 px-3 py-2 text-[10px] font-black text-amber-300">LÀM BẢN TỐI THIỂU</button></div>}
        </motion.div>;
      })}
      {!habits.length&&!adding&&<div className="py-12 text-center text-sm text-slate-500">Chưa có thói quen nào. Bắt đầu bằng một việc nhỏ bạn thật sự muốn giữ.</div>}
    </div>
  </section>;
};
