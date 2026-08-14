import React, { useEffect, useMemo, useState } from 'react';
import { Check, Circle, Copy, Plus, Save, Target, Trash2 } from 'lucide-react';
import { Habit, UserProfile } from '../types';
import { blankGoal, GoalGraph, GoalPortfolio, loadPortfolio, savePortfolio, smarterChecks } from './GoalPortfolio';

interface Props{profile?:UserProfile;habits:Habit[]}

export const GoalSMARTER:React.FC<Props>=({habits})=>{
  const [portfolio,setPortfolio]=useState<GoalPortfolio>(()=>loadPortfolio(habits));
  useEffect(()=>savePortfolio(portfolio),[portfolio]);
  const active=portfolio.goals.find(g=>g.id===portfolio.activeGoalId)||portfolio.goals[0];

  const update=(patch:Partial<GoalGraph>)=>setPortfolio(p=>({...p,goals:p.goals.map(g=>g.id===p.activeGoalId?{...g,...patch,updatedAt:new Date().toISOString()}:g)}));
  const addGoal=()=>{
    const g=blankGoal(habits,'Mục tiêu mới');
    setPortfolio(p=>({...p,activeGoalId:g.id,goals:[...p.goals,g]}));
  };
  const duplicate=()=>{
    if(!active)return;
    const g={...active,id:`goal-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,title:`${active.title||'Mục tiêu'} · bản sao`,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString(),keyResults:active.keyResults.map(k=>({...k,id:`kr-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,done:false,rewardClaimed:false,current:0})),milestones:active.milestones.map(m=>({...m,id:`ms-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,done:false,rewardClaimed:false}))};
    setPortfolio(p=>({...p,activeGoalId:g.id,goals:[...p.goals,g]}));
  };
  const remove=()=>{
    if(portfolio.goals.length<=1||!active)return;
    const left=portfolio.goals.filter(g=>g.id!==active.id);
    setPortfolio({version:1,activeGoalId:left[0].id,goals:left});
  };

  const checks=useMemo(()=>active?smarterChecks(active):[],[active]);
  const score=checks.filter(x=>x.ok).length;
  if(!active)return null;

  return <section className="space-y-5">
    <header className="rounded-[30px] border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 p-6">
      <div className="text-[10px] uppercase tracking-[.2em] font-black text-emerald-400">SMARTER · Tủ mục tiêu</div>
      <h2 className="mt-2 text-3xl font-black text-white">Bạn có thể theo nhiều mục tiêu cùng lúc</h2>
      <p className="mt-2 text-sm text-slate-400 max-w-3xl">Mỗi mục tiêu có SMARTER riêng và một OKR riêng. Chọn mục tiêu bên trái để chỉnh. Mục tiêu đang chọn cũng là mục tiêu mà Daily Mission và OKR sẽ dùng.</p>
    </header>

    <div className="grid xl:grid-cols-[310px_1fr] gap-5">
      <aside className="rounded-[28px] border border-slate-800 bg-slate-950/55 p-4 h-fit">
        <div className="flex items-center justify-between gap-2">
          <div><div className="text-sm font-black text-white">Mục tiêu của tôi</div><div className="text-[10px] text-slate-500 mt-1">{portfolio.goals.length} mục tiêu</div></div>
          <button onClick={addGoal} className="w-9 h-9 rounded-xl bg-emerald-400 text-slate-950 grid place-items-center" title="Thêm mục tiêu"><Plus size={17}/></button>
        </div>
        <div className="mt-4 space-y-2">
          {portfolio.goals.map(g=>{
            const s=smarterChecks(g).filter(x=>x.ok).length;
            const activeRow=g.id===portfolio.activeGoalId;
            return <button key={g.id} onClick={()=>setPortfolio(p=>({...p,activeGoalId:g.id}))} className={`w-full text-left rounded-2xl border p-3 transition ${activeRow?'border-emerald-400/30 bg-emerald-500/10':'border-slate-800 bg-slate-900/40 hover:border-slate-700'}`}>
              <div className={`text-xs font-black ${activeRow?'text-white':'text-slate-300'}`}>{g.title||'Mục tiêu chưa đặt tên'}</div>
              <div className="mt-2 flex items-center justify-between text-[10px]"><span className="text-slate-500">{g.targetDate||'Chưa có hạn'}</span><span className={s===7?'text-emerald-300':'text-violet-300'}>{s}/7</span></div>
            </button>
          })}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button onClick={duplicate} className="rounded-xl border border-slate-800 bg-slate-900 py-2 text-[10px] font-black text-slate-300 flex items-center justify-center gap-1"><Copy size={12}/> Nhân bản</button>
          <button onClick={remove} disabled={portfolio.goals.length<=1} className="rounded-xl border border-slate-800 bg-slate-900 py-2 text-[10px] font-black text-rose-300 disabled:opacity-30 flex items-center justify-center gap-1"><Trash2 size={12}/> Xóa</button>
        </div>
      </aside>

      <div className="space-y-5">
        <div className="grid xl:grid-cols-[1fr_340px] gap-5">
          <div className="rounded-[28px] border border-slate-800 bg-slate-950/55 p-6 space-y-4">
            <label className="grid gap-2"><span className="text-xs font-black text-white">1. Bạn muốn đạt điều gì?</span><input value={active.title} onChange={e=>update({title:e.target.value})} placeholder="Ví dụ: Đạt tiếng Anh B2" className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"/></label>
            <label className="grid gap-2"><span className="text-xs font-black text-white">2. Khi đạt rồi, bạn sẽ làm được gì?</span><textarea value={active.vision} onChange={e=>update({vision:e.target.value})} placeholder="Ví dụ: Nói chuyện, đọc và làm việc bằng tiếng Anh tự tin hơn." rows={3} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"/></label>
            <label className="grid gap-2"><span className="text-xs font-black text-white">3. Vì sao mục tiêu này đáng để làm?</span><textarea value={active.why} onChange={e=>update({why:e.target.value})} placeholder="Nói thật, ngắn thôi." rows={2} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white outline-none focus:border-emerald-500"/></label>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="grid gap-2"><span className="text-xs font-black text-white">4. Ngày muốn đạt</span><input type="date" value={active.targetDate} onChange={e=>update({targetDate:e.target.value})} className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"/></label>
              <label className="grid gap-2"><span className="text-xs font-black text-white">5. Độ khó</span><div className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3"><input type="range" min="1" max="5" value={active.difficulty||3} onChange={e=>update({difficulty:Number(e.target.value)})} className="w-full accent-emerald-400"/><div className="text-xs text-slate-500 mt-1">Mức {active.difficulty||3}/5</div></div></label>
            </div>
            <label className="grid gap-2"><span className="text-xs font-black text-white">6. Khi nào bạn xem lại tiến độ?</span><input value={active.evaluateNote} onChange={e=>update({evaluateNote:e.target.value})} placeholder="Ví dụ: Tối Chủ nhật mỗi tuần." className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"/></label>
            <label className="grid gap-2"><span className="text-xs font-black text-white">7. Nếu chậm, bạn sẽ đổi gì?</span><input value={active.readjustNote} onChange={e=>update({readjustNote:e.target.value})} placeholder="Ví dụ: Giảm khối lượng mỗi ngày nhưng vẫn giữ nhịp." className="rounded-2xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm text-white"/></label>
            <div className="flex items-center gap-2 text-emerald-300 text-xs font-black"><Save size={14}/> Tự lưu · OKR dùng đúng mục tiêu đang chọn</div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-[28px] border border-violet-500/20 bg-violet-500/5 p-5">
              <div className="flex items-center justify-between"><div><div className="text-[10px] uppercase tracking-widest text-violet-300 font-black">SMARTER</div><div className="text-xs text-slate-500 mt-1">Mục tiêu này rõ đến đâu?</div></div><div className="text-4xl font-black text-white">{score}<span className="text-slate-600 text-xl">/7</span></div></div>
              <div className="mt-4 space-y-2">{checks.map((x,i)=><div key={`${x.k}-${i}`} className={`rounded-2xl border p-3 ${x.ok?'border-emerald-500/20 bg-emerald-500/5':'border-slate-800 bg-slate-950/40'}`}><div className="flex gap-3"><div className={`w-7 h-7 rounded-full grid place-items-center shrink-0 ${x.ok?'bg-emerald-400 text-slate-950':'border border-slate-700 text-slate-600'}`}>{x.ok?<Check size={15}/>:<Circle size={12}/>}</div><div><div className="text-xs font-black text-white">{x.k} · {x.name}</div><div className="text-[10px] text-slate-500 mt-1 leading-relaxed">{x.hint}</div></div></div></div>)}</div>
            </div>
            <div className="rounded-[28px] border border-cyan-500/15 bg-cyan-500/5 p-5">
              <div className="flex items-center gap-2 text-cyan-300 font-black text-sm"><Target size={16}/> Nối với OKR</div>
              <div className="mt-3 text-sm font-black text-white">{active.objective||'Chưa có Objective'}</div>
              <div className="mt-2 text-xs text-slate-400">{active.keyResults.length} kết quả chính · {active.milestones.length} mốc nhỏ</div>
              <p className="mt-3 text-xs text-slate-500">Sửa mục tiêu ở đây → OKR thấy ngay. Thêm KR có con số ở OKR → chữ M · Đo được ở đây tự hoàn thành.</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  </section>;
};
