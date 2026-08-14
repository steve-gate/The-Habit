import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import { DailyLog, Habit } from '../types';
import { FACTS, FactCard } from './RewardData';

const STATE_KEY='habit_mosaic_reward_world_v19';
const QUEUE_KEY='habit_mosaic_reward_queue_v20_5';
const safe=<T,>(raw:string|null,fallback:T):T=>{try{return raw?{...(fallback as any),...JSON.parse(raw)}:fallback}catch{return fallback}};
const localDateKey=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
const hash=(v:string)=>{let h=2166136261;for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619)}return Math.abs(h>>>0)};

type PendingReward={id:string;type:'curiosity';day:string;factId:string;createdAt:number};
interface Props{habits:Habit[];logs:DailyLog[]}

const isVisible=(el:Element)=>{const r=(el as HTMLElement).getBoundingClientRect();const s=getComputedStyle(el as HTMLElement);return r.width>80&&r.height>80&&s.display!=='none'&&s.visibility!=='hidden'&&Number(s.opacity||1)>0};
const jackpotVisible=()=>{
  const candidates=Array.from(document.querySelectorAll('[role="dialog"], [class*="fixed"], [class*="modal"], [class*="overlay"]'));
  return candidates.some(el=>{
    if((el as HTMLElement).dataset?.curiosityRewardOverlay==='1')return false;
    if(!isVisible(el))return false;
    const text=(el.textContent||'').toLocaleLowerCase('vi-VN');
    return /jackpot|vòng quay|trúng thưởng|phần thưởng bất ngờ|chúc mừng.*thói quen/.test(text);
  });
};

const loadQueue=():PendingReward[]=>{try{const x=JSON.parse(localStorage.getItem(QUEUE_KEY)||'[]');return Array.isArray(x)?x:[]}catch{return[]}};
const saveQueue=(q:PendingReward[])=>localStorage.setItem(QUEUE_KEY,JSON.stringify(q));

export const CuriosityRewardWatcher:React.FC<Props>=({habits,logs})=>{
  const [card,setCard]=useState<FactCard|null>(null);
  const [rewardDay,setRewardDay]=useState('');
  const [waiting,setWaiting]=useState(false);
  const showTimer=useRef<any>(null);
  const daily=useMemo(()=>habits.filter(h=>h.frequency==='daily'),[habits]);
  const local=localDateKey(); const utc=new Date().toISOString().split('T')[0];
  const log=logs.find(l=>l.date===local)||logs.find(l=>l.date===utc);
  const day=log?.date||local;
  const doneIds=log?.completedHabitIds||[];
  const allDone=daily.length>0&&daily.every(h=>doneIds.includes(h.id));

  const ensureQueued=(targetDay:string)=>{
    const base={unlockedFacts:[] as string[],rewardedFullDays:[] as string[]};
    const state=safe<any>(localStorage.getItem(STATE_KEY),base);
    let q=loadQueue();
    if(q.some(x=>x.type==='curiosity'&&x.day===targetDay))return;
    if(Array.isArray(state.rewardedFullDays)&&state.rewardedFullDays.includes(targetDay)){
      const fid=state.lastUnlockedDate===targetDay?state.lastUnlockedFactId:'';
      if(fid&&!localStorage.getItem(`habit_mosaic_curiosity_seen_${targetDay}`)){
        q=[...q,{id:`curiosity:${targetDay}`,type:'curiosity',day:targetDay,factId:fid,createdAt:Date.now()}];saveQueue(q);
      }
      return;
    }
    const unlocked=Array.isArray(state.unlockedFacts)?state.unlockedFacts:[];
    const locked=FACTS.filter(f=>!unlocked.includes(f.id));
    const picked=(locked.length?locked:FACTS)[hash(`${targetDay}|${unlocked.length}|curiosity-v20.5`)%Math.max(1,(locked.length?locked:FACTS).length)];
    if(!picked)return;
    const next={...state,rewardedFullDays:[...(state.rewardedFullDays||[]),targetDay],unlockedFacts:unlocked.includes(picked.id)?unlocked:[...unlocked,picked.id],lastUnlockedFactId:picked.id,lastUnlockedDate:targetDay};
    localStorage.setItem(STATE_KEY,JSON.stringify(next));
    window.dispatchEvent(new CustomEvent('hm-reward-state-changed',{detail:next}));
    q=[...q,{id:`curiosity:${targetDay}`,type:'curiosity',day:targetDay,factId:picked.id,createdAt:Date.now()}];
    saveQueue(q);
  };

  const tryShowNext=()=>{
    if(card)return;
    const q=loadQueue();
    const next=q.find(x=>x.type==='curiosity'&&!localStorage.getItem(`habit_mosaic_curiosity_seen_${x.day}`));
    if(!next){setWaiting(false);return;}
    if(jackpotVisible()){setWaiting(true);return;}
    const fact=FACTS.find(f=>f.id===next.factId);
    if(!fact){saveQueue(q.filter(x=>x.id!==next.id));return;}
    setRewardDay(next.day);setCard(fact);setWaiting(false);
  };

  useEffect(()=>{
    if(allDone)ensureQueued(day);
    clearTimeout(showTimer.current);
    showTimer.current=setTimeout(()=>tryShowNext(),2600); // give Jackpot first turn
    const timer=setInterval(()=>tryShowNext(),900);
    const obs=new MutationObserver(()=>{
      if(card&&jackpotVisible())setCard(null); // Jackpot always goes first; curiosity remains queued
      else if(!jackpotVisible())tryShowNext();
    });
    obs.observe(document.body,{childList:true,subtree:true,attributes:true});
    return()=>{clearTimeout(showTimer.current);clearInterval(timer);obs.disconnect()};
    // eslint-disable-next-line react-hooks/exhaustive-deps
  },[allDone,day,daily.map(h=>h.id).join('|'),doneIds.join('|'),card?.id]);

  const dismiss=()=>{
    if(!rewardDay){setCard(null);return;}
    localStorage.setItem(`habit_mosaic_curiosity_seen_${rewardDay}`,'1');
    saveQueue(loadQueue().filter(x=>!(x.type==='curiosity'&&x.day===rewardDay)));
    setCard(null);setRewardDay('');
  };

  if(!card)return waiting?<div className="fixed bottom-5 right-5 z-[8000] rounded-2xl border border-cyan-400/15 bg-slate-950/90 px-4 py-3 text-xs text-cyan-200 shadow-xl">🎰 Jackpot trước nhé. Còn một điều thú vị đang xếp hàng.</div>:null;
  return <div className="fixed inset-0 z-[9999] bg-slate-950/75 backdrop-blur-sm grid place-items-center p-5" data-curiosity-reward-overlay="1">
    <div className="w-full max-w-lg rounded-[30px] border border-cyan-400/25 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/40 shadow-2xl p-6 relative">
      <button onClick={dismiss} className="absolute right-4 top-4 p-2 rounded-xl bg-slate-900 text-slate-400 hover:text-white"><X size={16}/></button>
      <div className="w-12 h-12 rounded-2xl bg-cyan-400/10 text-cyan-300 grid place-items-center"><Sparkles size={22}/></div>
      <div className="mt-4 text-[10px] uppercase tracking-[.22em] font-black text-cyan-400">10 vạn điều chưa biết · phần thưởng tiếp theo</div>
      <h3 className="mt-2 text-2xl font-black text-white">Hôm nay mở thêm một điều thú vị</h3>
      <div className="mt-5 rounded-2xl border border-cyan-400/15 bg-cyan-400/5 p-5"><div className="text-[10px] uppercase tracking-widest font-black text-cyan-300">{card.cat}</div><p className="mt-2 text-base leading-relaxed text-slate-100">{card.text}</p></div>
      <button onClick={dismiss} className="mt-5 w-full rounded-2xl bg-cyan-300 text-slate-950 py-3 text-sm font-black">Lưu vào kho và tiếp tục</button>
    </div>
  </div>;
};
