import React, { useEffect, useMemo, useState } from 'react';
import { BatteryFull, BatteryLow, BatteryMedium, Check, ChevronDown, ChevronUp, Coins, Edit3, Flag, Play, Plus, Save, Target, TimerReset, Trophy, Zap } from 'lucide-react';
import { DailyLog, Habit, UserProfile } from '../types';

interface GoalCommandCenterProps { profile:UserProfile; habits:Habit[]; logs:DailyLog[]; onToggleHabit:(habitId:string)=>void; }
type HabitLink={enabled:boolean;weight:number;reason:string};
type KeyResult={id:string;title:string;current:number;target:number;unit:string;done:boolean;rewardCoins:number;rewardClaimed?:boolean};
type Milestone={id:string;title:string;done:boolean;targetDate?:string;rewardCoins:number;rewardClaimed?:boolean};
type Energy='low'|'normal'|'high';
type GoalGraph={title:string;vision:string;objective:string;why:string;targetDate:string;keyResults:KeyResult[];milestones:Milestone[];habitLinks:Record<string,HabitLink>;difficulty:number;evaluateNote:string;readjustNote:string;goalDone?:boolean;goalRewardClaimed?:boolean;updatedAt:string};
type Wallet={coins:number;earned:number;spent:number;purchases:string[];installments:any[]};
type MissionKind='instant'|'timer'|'count'|'reading';
type MissionPlan={kind:MissionKind;headline:string;detail:string;minutes?:number;reason:string};

const KEY='habit_mosaic_v12_goal_graph';
const LEGACY='habit_mosaic_v11_goal';
const ENERGY_KEY='habit_mosaic_daily_energy_v16';
const WALLET_KEY='habit_mosaic_reward_wallet_v16';
const REVIEW_KEY='habit_mosaic_v17_daily_context';
const TIMER_KEY='habit_mosaic_v17_mission_timer';
const dateKey=(d=new Date())=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
const addDays=(key:string,n:number)=>{const d=new Date(`${key}T12:00:00`);d.setDate(d.getDate()+n);return dateKey(d)};
const safeJson=<T,>(raw:string|null,fallback:T):T=>{try{return raw?{...(fallback as any),...JSON.parse(raw)}:fallback}catch{return fallback}};
const completionOn=(logs:DailyLog[],id:string,key:string)=>Boolean(logs.find(l=>l.date===key)?.completedHabitIds?.includes(id));
const rate=(logs:DailyLog[],id:string,end:string,days:number)=>{let n=0;for(let i=0;i<days;i++)if(completionOn(logs,id,addDays(end,-i)))n++;return days?n/days:0};
const normalize=(s:string)=>String(s||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d').replace(/[^a-z0-9\s]/g,' ');
const words=(s:string)=>new Set(normalize(s).split(/\s+/).filter(w=>w.length>=3&&!['muc','tieu','thoi','quen','hang','ngay','hoan','thanh','phat','trien'].includes(w)));
const overlap=(a:string,b:string)=>{const A=words(a),B=words(b);let n=0;A.forEach(x=>{if(B.has(x))n++});return n};
const defaultGraph=(habits:Habit[]):GoalGraph=>({title:localStorage.getItem(LEGACY)||'Mục tiêu dài hạn quan trọng nhất',vision:'',objective:'',why:'',targetDate:'',keyResults:[],milestones:[],habitLinks:Object.fromEntries(habits.map(h=>[h.id,{enabled:true,weight:1,reason:''}])),difficulty:3,evaluateNote:'',readjustNote:'',updatedAt:new Date().toISOString()});
const defaultWallet:Wallet={coins:0,earned:0,spent:0,purchases:[],installments:[]};
const maintenancePattern=/uống|nuoc|water|ngủ|ngu du|vitamin|đánh răng|danh rang|skincare|thuốc|thuoc/i;
const codingPattern=/code|lập trình|lap trinh|phần mềm|phan mem|project|dự án|du an|viết app|viet app/i;
const languagePattern=/ngoại ngữ|ngoai ngu|tiếng anh|tieng anh|tiếng trung|tieng trung|hsk|jlpt|vocab|từ vựng|tu vung|grammar|ngữ pháp|ngu phap|listening/i;
const readingPattern=/đọc|doc sach|sách|sach|trang/i;
const exercisePattern=/tập|tap the duc|gym|chạy|chay bo|workout|đi bộ|di bo/i;
const meditationPattern=/thiền|thien|thở|tho sau|tĩnh tâm|tinh tam/i;
const writingPattern=/viết|viet bai|viet sach|writing|journal/i;
const inferMission=(habit:Habit,energy:Energy):MissionPlan=>{
  const raw=normalize(habit.title);
  if(maintenancePattern.test(raw)) return {kind:'instant',headline:energy==='low'?'Làm một bước nhỏ ngay bây giờ':'Làm ngay, không cần hẹn giờ',detail:habit.isMicro&&habit.microTitle?habit.microTitle:'Hoàn thành phần hợp lý của thói quen này rồi đánh dấu xong.',reason:'Đây là thói quen dạng hành động/duy trì, không nên ép thành “20 phút”.'};
  if(readingPattern.test(raw)) return {kind:'reading',minutes:energy==='low'?2:energy==='normal'?10:20,headline:energy==='low'?'Đọc 1 trang':energy==='normal'?'Đọc 10 phút':'Đọc 20 phút',detail:'Bắt đầu nhỏ; dừng khi đủ phiên hoặc tiếp tục nếu đang vào guồng.',reason:'Đọc sách hợp với một phiên ngắn, không cần biến mọi ngày thành thử thách lớn.'};
  if(codingPattern.test(raw)||languagePattern.test(raw)||exercisePattern.test(raw)||meditationPattern.test(raw)||writingPattern.test(raw)) {const m=energy==='low'?2:energy==='normal'?20:45;return {kind:'timer',minutes:m,headline:`Làm ${m} phút`,detail:energy==='low'?'Chỉ cần bắt đầu. Hai phút vẫn tính là xuất hiện.':'Bấm bắt đầu để chạy phiên; hoàn thành rồi mới đánh dấu xong.',reason:'Thói quen này phù hợp với một phiên tập trung theo thời gian.'};}
  const m=energy==='low'?2:energy==='normal'?10:25;return {kind:'timer',minutes:m,headline:`Bắt đầu ${m} phút`,detail:'Nếu đây không phải việc tính theo thời gian, bạn có thể đánh dấu xong ngay khi làm đủ.',reason:'Chưa xác định được đơn vị tốt hơn nên dùng một phiên ngắn, có thể chỉnh lại trong Goal.'};
};

const GoalCommandCenter:React.FC<GoalCommandCenterProps>=({profile,habits,logs,onToggleHabit})=>{
  const today=dateKey();
  const [graph,setGraph]=useState<GoalGraph>(()=>safeJson(localStorage.getItem(KEY),defaultGraph(habits)));
  const [editing,setEditing]=useState(false);
  const [advanced,setAdvanced]=useState(false);
  const [newKr,setNewKr]=useState(''); const [newMs,setNewMs]=useState('');
  const [energy,setEnergy]=useState<Energy>(()=>safeJson<Record<string,Energy>>(localStorage.getItem(ENERGY_KEY),{})[today]||'normal');
  const [timer,setTimer]=useState<{habitId:string;startedAt:number;minutes:number}|null>(()=>safeJson<any>(localStorage.getItem(TIMER_KEY),null));
  const [clock,setClock]=useState(Date.now());
  const todayCompleted=logs.find(l=>l.date===today)?.completedHabitIds||[];

  useEffect(()=>{const id=setInterval(()=>setClock(Date.now()),1000);return()=>clearInterval(id)},[]);
  useEffect(()=>{setGraph(prev=>{const next={...prev,habitLinks:{...prev.habitLinks},keyResults:Array.isArray(prev.keyResults)?prev.keyResults:[],milestones:Array.isArray(prev.milestones)?prev.milestones:[]};let changed=false;habits.forEach(h=>{if(!next.habitLinks[h.id]){next.habitLinks[h.id]={enabled:true,weight:1,reason:''};changed=true}});Object.keys(next.habitLinks).forEach(id=>{if(!habits.some(h=>h.id===id)){delete next.habitLinks[id];changed=true}});return changed?{...next,updatedAt:new Date().toISOString()}:next})},[habits]);
  useEffect(()=>{localStorage.setItem(KEY,JSON.stringify(graph));localStorage.setItem(LEGACY,graph.title)},[graph]);
  useEffect(()=>{const map=safeJson<Record<string,Energy>>(localStorage.getItem(ENERGY_KEY),{});map[today]=energy;localStorage.setItem(ENERGY_KEY,JSON.stringify(map))},[energy,today]);
  useEffect(()=>{if(timer)localStorage.setItem(TIMER_KEY,JSON.stringify(timer));else localStorage.removeItem(TIMER_KEY)},[timer]);

  const goalText=[graph.title,graph.vision,graph.objective,graph.why,...graph.keyResults.map(x=>x.title),...graph.milestones.map(x=>x.title)].join(' ');
  const daily=habits.filter(h=>h.frequency!=='weekly');
  const linked=daily.filter(h=>graph.habitLinks[h.id]?.enabled!==false);
  const remaining=linked.filter(h=>!todayCompleted.includes(h.id));
  const ranked=useMemo(()=>remaining.map(h=>{const link=graph.habitLinks[h.id]||{enabled:true,weight:1,reason:''};const semantic=overlap(h.title,goalText);const manual=Math.max(.5,Math.min(2,Number(link.weight)||1));const r14=rate(logs,h.id,today,14);const maintenance=maintenancePattern.test(normalize(h.title));const explicit=Boolean(link.reason?.trim())||manual>1.05;const relevance=semantic>0||explicit;const score=(relevance?4:0)+semantic*1.6+manual*1.8+(1-r14)*.8-(maintenance&&!relevance?3.2:0);return{h,link,r14,semantic,relevance,score}}).sort((a,b)=>b.score-a.score),[remaining,graph.habitLinks,goalText,logs,today]);
  const next=ranked[0];
  const mission=next?inferMission(next.h,energy):null;
  const activeTimer=timer&&next&&timer.habitId===next.h.id?timer:null;
  const elapsed=activeTimer?Math.max(0,Math.floor((clock-activeTimer.startedAt)/1000)):0;
  const totalSec=(activeTimer?.minutes||0)*60; const left=Math.max(0,totalSec-elapsed);
  const fmt=(s:number)=>`${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  const adherence=linked.length?linked.reduce((s,h)=>s+rate(logs,h.id,today,14),0)/linked.length:0;
  const previous=linked.length?linked.reduce((s,h)=>s+rate(logs,h.id,addDays(today,-14),14),0)/linked.length:0;
  const momentum=Math.round(Math.max(0,Math.min(100,adherence*86+(adherence>=previous?9:3))));
  const nearWin=remaining.length===1&&linked.length>=2;
  const goalReward=Math.round(400+Math.pow(Math.max(1,Math.min(5,graph.difficulty||3)),2)*300+graph.keyResults.length*180+graph.milestones.length*120+linked.reduce((s,h)=>s+(graph.habitLinks[h.id]?.weight||1)*60,0));
  const goalReady=(graph.keyResults.length>0||graph.milestones.length>0)&&(graph.keyResults.length===0||graph.keyResults.every(x=>x.done))&&(graph.milestones.length===0||graph.milestones.every(x=>x.done));
  const smarter=[['S','Cụ thể',Boolean(graph.title.trim()&&graph.objective.trim())],['M','Đo được',graph.keyResults.length>0],['A','Khả thi',graph.difficulty>=1&&graph.difficulty<=5],['R','Liên quan',Boolean(graph.why.trim()||linked.length)],['T','Có hạn',Boolean(graph.targetDate)],['E','Đánh giá',Boolean(graph.evaluateNote.trim())],['R','Điều chỉnh',Boolean(graph.readjustNote.trim())]] as const;
  const smarterScore=smarter.filter(x=>x[2]).length;
  const addCoins=(amount:number)=>{if(amount<=0)return;const w=safeJson<Wallet>(localStorage.getItem(WALLET_KEY),defaultWallet);localStorage.setItem(WALLET_KEY,JSON.stringify({...w,coins:Number(w.coins||0)+amount,earned:Number(w.earned||0)+amount}));window.dispatchEvent(new CustomEvent('hm-reward-wallet-changed'))};
  const toggleKr=(id:string)=>setGraph(p=>({...p,keyResults:p.keyResults.map(x=>{if(x.id!==id)return x;const done=!x.done;if(done&&!x.rewardClaimed)addCoins(x.rewardCoins);return{...x,done,rewardClaimed:x.rewardClaimed||done}}),updatedAt:new Date().toISOString()}));
  const toggleMs=(id:string)=>setGraph(p=>({...p,milestones:p.milestones.map(x=>{if(x.id!==id)return x;const done=!x.done;if(done&&!x.rewardClaimed)addCoins(x.rewardCoins);return{...x,done,rewardClaimed:x.rewardClaimed||done}}),updatedAt:new Date().toISOString()}));
  const claimGoal=()=>{if(!goalReady||graph.goalRewardClaimed)return;addCoins(goalReward);setGraph(p=>({...p,goalDone:true,goalRewardClaimed:true,updatedAt:new Date().toISOString()}))};
  const setLink=(id:string,patch:Partial<HabitLink>)=>setGraph(p=>({...p,habitLinks:{...p.habitLinks,[id]:{...(p.habitLinks[id]||{enabled:true,weight:1,reason:''}),...patch}},updatedAt:new Date().toISOString()}));
  const addKr=()=>{const t=newKr.trim();if(!t)return;setGraph(p=>({...p,keyResults:[...p.keyResults,{id:`kr-${Date.now()}`,title:t,current:0,target:1,unit:'mốc',done:false,rewardCoins:300+p.difficulty*100}],updatedAt:new Date().toISOString()}));setNewKr('')};
  const addMs=()=>{const t=newMs.trim();if(!t)return;setGraph(p=>({...p,milestones:[...p.milestones,{id:`ms-${Date.now()}`,title:t,done:false,rewardCoins:200+p.difficulty*80}],updatedAt:new Date().toISOString()}));setNewMs('')};

  const missionReason=next?(next.link.reason?.trim()|| (next.relevance ? `Việc này có liên hệ rõ với mục tiêu “${graph.title}”.` : `Đây là việc chưa xong có nhịp yếu trong 14 ngày gần đây. Nếu nó không phục vụ mục tiêu, hãy tắt liên kết ở phần chỉnh mục tiêu.`)):'';
  useEffect(()=>{const review={generatedAt:new Date().toISOString(),goal:graph.title,momentum,nextAction:next?.h.title||'',remaining:remaining.length,energy};localStorage.setItem(REVIEW_KEY,JSON.stringify(review));const bridge=(window as any).habitMosaicDesktop;bridge?.setSmartContext?.({goal:graph.title,nextAction:next?.h.title||'',momentum,energy,completedToday:todayCompleted.length,totalHabits:linked.length}).catch?.(()=>{})},[graph.title,momentum,next?.h.id,remaining.length,energy,todayCompleted.length,linked.length]);

  return <section className="rounded-[30px] border border-emerald-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950/20 overflow-hidden shadow-2xl">
    <div className="p-6 border-b border-slate-800 flex flex-col xl:flex-row xl:items-start justify-between gap-5">
      <div className="min-w-0"><div className="text-[10px] uppercase tracking-[.2em] text-emerald-400 font-black flex items-center gap-2"><Target size={14}/> Mục tiêu dài hạn</div><h2 className="mt-2 text-2xl font-black text-white truncate">{graph.title}</h2><p className="mt-1 text-xs text-slate-400">Mục tiêu lớn → kết quả cần đạt → mốc nhỏ → thói quen → việc hôm nay.</p></div>
      <div className="flex gap-2"><div className="rounded-2xl border border-slate-800 bg-slate-950/45 px-4 py-3 text-center"><div className="text-xl font-black text-emerald-300">{momentum}</div><div className="text-[9px] uppercase text-slate-500">Đà hiện tại</div></div><button onClick={()=>setEditing(v=>!v)} className="rounded-2xl border border-slate-700 px-4 py-3 text-xs font-black text-slate-300 flex items-center gap-2">{editing?<Save size={15}/>:<Edit3 size={15}/>} {editing?'Xong':'Chỉnh mục tiêu'}</button></div>
    </div>

    {editing&&<div className="p-6 border-b border-slate-800 bg-slate-950/35 grid gap-4">
      <div className="grid md:grid-cols-2 gap-3"><label className="grid gap-1"><span className="text-[10px] font-black text-slate-500 uppercase">Mục tiêu</span><input value={graph.title} onChange={e=>setGraph(p=>({...p,title:e.target.value}))} className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"/></label><label className="grid gap-1"><span className="text-[10px] font-black text-slate-500 uppercase">Hạn</span><input type="date" value={graph.targetDate} onChange={e=>setGraph(p=>({...p,targetDate:e.target.value}))} className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"/></label></div>
      <label className="grid gap-1"><span className="text-[10px] font-black text-slate-500 uppercase">Objective · Bạn muốn đạt điều gì rõ ràng?</span><textarea value={graph.objective} onChange={e=>setGraph(p=>({...p,objective:e.target.value}))} className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"/></label>
      <label className="grid gap-1"><span className="text-[10px] font-black text-slate-500 uppercase">Vì sao điều này đáng làm?</span><textarea value={graph.why} onChange={e=>setGraph(p=>({...p,why:e.target.value}))} className="rounded-xl bg-slate-900 border border-slate-700 px-3 py-2 text-sm text-white"/></label>
      <div className="grid md:grid-cols-2 gap-4"><div className="rounded-2xl border border-slate-800 p-4"><div className="font-black text-sm text-white">Key Results</div><div className="mt-3 space-y-2">{graph.keyResults.map(x=><button key={x.id} onClick={()=>toggleKr(x.id)} className="w-full flex items-center justify-between gap-2 text-left"><span className={`text-xs ${x.done?'line-through text-slate-500':'text-slate-300'}`}>{x.title}</span><span className="text-[10px] text-amber-300">+{x.rewardCoins} coin</span></button>)}</div><div className="flex gap-2 mt-3"><input value={newKr} onChange={e=>setNewKr(e.target.value)} placeholder="Thêm kết quả đo được..." className="min-w-0 flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white"/><button onClick={addKr} className="p-2 text-emerald-300"><Plus size={16}/></button></div></div>
      <div className="rounded-2xl border border-slate-800 p-4"><div className="font-black text-sm text-white">Mốc nhỏ</div><div className="mt-3 space-y-2">{graph.milestones.map(x=><button key={x.id} onClick={()=>toggleMs(x.id)} className="w-full flex items-center justify-between gap-2 text-left"><span className={`text-xs ${x.done?'line-through text-slate-500':'text-slate-300'}`}>{x.title}</span><span className="text-[10px] text-amber-300">+{x.rewardCoins} coin</span></button>)}</div><div className="flex gap-2 mt-3"><input value={newMs} onChange={e=>setNewMs(e.target.value)} placeholder="Thêm mốc nhỏ..." className="min-w-0 flex-1 bg-slate-900 border border-slate-800 rounded-lg px-2 py-2 text-xs text-white"/><button onClick={addMs} className="p-2 text-emerald-300"><Plus size={16}/></button></div></div></div>
      <button onClick={()=>setAdvanced(v=>!v)} className="flex items-center gap-2 text-xs font-black text-slate-400">{advanced?<ChevronUp size={15}/>:<ChevronDown size={15}/>} Liên kết thói quen với mục tiêu</button>
      {advanced&&<div className="grid md:grid-cols-2 gap-2">{habits.map(h=>{const l=graph.habitLinks[h.id]||{enabled:true,weight:1,reason:''};return <div key={h.id} className="rounded-xl border border-slate-800 p-3"><label className="flex items-center gap-2 text-xs text-white"><input type="checkbox" checked={l.enabled!==false} onChange={e=>setLink(h.id,{enabled:e.target.checked})}/>{h.title}</label><div className="mt-2 grid grid-cols-[90px_1fr] gap-2"><select value={l.weight} onChange={e=>setLink(h.id,{weight:Number(e.target.value)})} className="bg-slate-900 border border-slate-800 rounded-lg text-xs text-white"><option value={0.5}>Phụ</option><option value={1}>Vừa</option><option value={1.5}>Quan trọng</option><option value={2}>Cốt lõi</option></select><input value={l.reason} onChange={e=>setLink(h.id,{reason:e.target.value})} placeholder="Vì sao nó giúp Goal?" className="bg-slate-900 border border-slate-800 rounded-lg px-2 text-xs text-white"/></div></div>})}</div>}
      <div className="flex flex-wrap items-center gap-2"><span className="text-xs text-slate-400">SMARTER {smarterScore}/7</span>{smarter.map(([k,label,ok],i)=><span key={`${k}-${i}`} className={`rounded-full px-2 py-1 text-[9px] font-bold ${ok?'bg-emerald-500/10 text-emerald-300':'bg-slate-800 text-slate-500'}`}>{k} · {label}</span>)}</div>
    </div>}

    <div className="p-6 border-b border-slate-800 grid xl:grid-cols-3 gap-4 bg-slate-950/20">
      <div className="rounded-2xl border border-emerald-500/15 bg-emerald-500/5 p-4">
        <div className="text-[10px] uppercase tracking-widest text-emerald-400 font-black">OKR · Objective</div>
        <div className="text-sm font-black text-white mt-2">{graph.objective.trim()||'Chưa viết Objective. Bấm “Chỉnh mục tiêu” để đặt.'}</div>
        <div className="text-[10px] text-slate-500 mt-2">Key Results: <b className="text-slate-300">{graph.keyResults.filter(x=>x.done).length}/{graph.keyResults.length}</b> · Mốc nhỏ: <b className="text-slate-300">{graph.milestones.filter(x=>x.done).length}/{graph.milestones.length}</b></div>
        <div className="mt-3 space-y-1">{graph.keyResults.slice(0,4).map(x=><div key={x.id} className="flex justify-between gap-2 text-[10px]"><span className={x.done?'text-slate-600 line-through':'text-slate-300'}>KR · {x.title}</span><span className="text-amber-300">+{x.rewardCoins}</span></div>)}{!graph.keyResults.length&&<div className="text-[10px] text-slate-600">OKR cần ít nhất một kết quả đo được.</div>}</div>
      </div>
      <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-4">
        <div className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">Cây mục tiêu</div>
        <div className="mt-3 text-xs leading-6 text-slate-300">
          <b className="text-white">Vision / Goal</b> → <b className="text-white">Objective</b> → <b className="text-white">Key Results</b> → <b className="text-white">Mốc nhỏ</b> → <b className="text-white">Thói quen</b> → <b className="text-white">Việc hôm nay</b>
        </div>
        <div className="mt-3 text-[10px] text-slate-500">{linked.length} thói quen đang nối vào Goal. Phần thưởng từng KR/mốc hiện ngay khi bạn chỉnh mục tiêu.</div>
      </div>
      <div className="rounded-2xl border border-violet-500/15 bg-violet-500/5 p-4">
        <div className="flex items-center justify-between"><div className="text-[10px] uppercase tracking-widest text-violet-300 font-black">SMARTER</div><div className="text-xl font-black text-white">{smarterScore}/7</div></div>
        <div className="mt-3 grid grid-cols-2 gap-2">{smarter.map(([k,label,ok],i)=><div key={`${k}-${i}`} className={`rounded-xl border px-2 py-2 text-[10px] ${ok?'border-emerald-500/20 bg-emerald-500/8 text-emerald-200':'border-slate-800 bg-slate-950/40 text-slate-500'}`}><b>{k}</b> · {label}</div>)}</div>
        <div className="text-[9px] text-slate-600 mt-3">S · rõ · M · đo được · A · làm được · R · đáng làm · T · có hạn · E · xem lại · R · chỉnh lại.</div>
      </div>
    </div>

    <div className="p-6 grid xl:grid-cols-[1.4fr_.6fr] gap-5">
      <div className="rounded-[26px] border border-emerald-500/20 bg-slate-950/50 p-5">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4"><div><div className="text-[10px] uppercase tracking-[.18em] text-emerald-400 font-black">Nhiệm vụ chính hôm nay</div><h3 className="text-3xl font-black text-white mt-2">{next?.h.title||'Hôm nay đã xong'}</h3>{next&&<p className="mt-2 text-xs text-slate-400 max-w-2xl">{missionReason}</p>}</div><div className="flex gap-2">{([['low','Cạn pin',BatteryLow],['normal','Bình thường',BatteryMedium],['high','Sung',BatteryFull]] as const).map(([id,label,Icon])=><button key={id} onClick={()=>setEnergy(id)} className={`w-[74px] rounded-2xl border p-3 text-center text-[10px] font-black ${energy===id?'border-emerald-400/40 bg-emerald-500/10 text-emerald-200':'border-slate-800 text-slate-600'}`}><Icon size={15} className="mx-auto mb-2"/>{label}</button>)}</div></div>
        {next&&mission&&<div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4"><div><div className="text-[9px] uppercase font-black text-amber-400">{energy==='low'?'Bản tối thiểu':energy==='normal'?'Mức bình thường':'Mức đầy đủ'}</div><div className="text-xl font-black text-white mt-1">{activeTimer?`Còn ${fmt(left)}`:mission.headline}</div><div className="text-xs text-slate-500 mt-1">{mission.detail}</div></div><div className="flex flex-wrap gap-2">{mission.kind==='timer'||mission.kind==='reading'?(!activeTimer?<button onClick={()=>setTimer({habitId:next.h.id,startedAt:Date.now(),minutes:mission.minutes||10})} className="rounded-2xl bg-emerald-400 px-5 py-3 text-xs font-black text-slate-950 flex items-center gap-2"><Play size={16}/> BẮT ĐẦU</button>:<button onClick={()=>setTimer(null)} className="rounded-2xl border border-slate-700 px-5 py-3 text-xs font-black text-slate-300 flex items-center gap-2"><TimerReset size={16}/> DỪNG PHIÊN</button>):null}<button onClick={()=>{setTimer(null);onToggleHabit(next.h.id)}} className="rounded-2xl border border-emerald-400/30 bg-emerald-500/10 px-5 py-3 text-xs font-black text-emerald-200 flex items-center gap-2"><Check size={16}/> ĐÃ LÀM XONG</button></div></div>}
        {!next&&<div className="mt-5 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-5 text-emerald-200 font-bold">Tốt rồi. Hôm nay không cần tự bịa thêm việc để chứng minh mình bận.</div>}
      </div>
      <div className="space-y-3"><div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4"><div className="text-[10px] uppercase text-slate-500 font-black">Tiến độ hôm nay</div><div className="mt-2 text-2xl font-black text-white">{todayCompleted.filter(id=>linked.some(h=>h.id===id)).length}/{linked.length}</div><div className="mt-2 h-2 bg-slate-800 rounded-full overflow-hidden"><div className="h-full bg-emerald-400" style={{width:`${linked.length?Math.round(todayCompleted.filter(id=>linked.some(h=>h.id===id)).length/linked.length*100):0}%`}}/></div>{nearWin&&<div className="mt-3 text-xs text-amber-300 font-bold">Còn đúng 1 việc để hoàn tất ngày hôm nay.</div>}</div><div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-4"><div className="flex items-center gap-2 text-amber-300 font-black text-sm"><Coins size={16}/> Phần thưởng Goal</div><div className="text-2xl text-white font-black mt-2">{goalReward.toLocaleString('vi-VN')} coin</div><div className="text-xs text-slate-500 mt-1">Chỉ nhận khi các KR/mốc đã hoàn thành.</div>{goalReady&&!graph.goalRewardClaimed&&<button onClick={claimGoal} className="mt-3 w-full rounded-xl bg-amber-400 py-2 text-xs font-black text-slate-950"><Trophy size={14} className="inline mr-1"/> NHẬN THƯỞNG</button>}</div></div>
    </div>
  </section>;
};

export { GoalCommandCenter };
