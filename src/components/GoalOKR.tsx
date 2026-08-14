import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, ChevronDown, Coins, Link2, Plus, Route, Sparkles, Target, Trash2, WandSparkles } from 'lucide-react';
import { Habit, UserProfile } from '../types';
import { GoalPortfolio, KeyResult, KrMilestone, loadPortfolio, looksLikeHabit, milestonesForKr, savePortfolio, smarterChecks } from './GoalPortfolio';

interface Props{profile?:UserProfile;habits:Habit[]}
type WalletState={coins:number;earned:number;spent:number;purchases:string[];installments:any[]};
type Suggestion={title:string;target:number;unit:string;why:string};
const WALLET_KEY='habit_mosaic_reward_wallet_v16';
const safe=<T,>(raw:string|null,fallback:T):T=>{try{return raw?{...(fallback as any),...JSON.parse(raw)}:fallback}catch{return fallback}};
const uid=(p:string)=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const defaultWallet:WalletState={coins:0,earned:0,spent:0,purchases:[],installments:[]};
const norm=(s:string)=>String(s||'').toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');

const goalKind=(text:string)=>{
  const t=norm(text);
  if(/anh|trung|nhat|han|ngoai ngu|ielts|toeic|hsk|jlpt|b1|b2|c1|c2/.test(t))return 'language';
  if(/phan mem|app|ung dung|code|lap trinh|website|san pham|project|du an/.test(t))return 'software';
  if(/chay|gym|tap|the duc|can|kg|suc khoe|marathon/.test(t))return 'fitness';
  if(/doc|sach|ebook|tieu thuyet/.test(t))return 'reading';
  if(/thi|hoc|mon|diem|chung chi|khoa hoc/.test(t))return 'study';
  if(/tiet kiem|dau tu|tai chinh|tien/.test(t))return 'money';
  return 'general';
};
const suggestionsFor=(title:string,objective:string):Suggestion[]=>{
  const kind=goalKind(`${title} ${objective}`);
  if(kind==='language')return [
    {title:'Học đủ lượng từ vựng cốt lõi',target:5000,unit:'từ',why:'Đủ vốn từ để dùng ngôn ngữ thật.'},
    {title:'Luyện nghe tập trung',target:100,unit:'giờ',why:'Đo lượng luyện nghe đã tích lũy.'},
    {title:'Làm bài kiểm tra đạt chuẩn',target:20,unit:'bài',why:'Có bằng chứng rõ về trình độ.'},
  ];
  if(kind==='software')return [
    {title:'Hoàn thành chức năng chính',target:8,unit:'chức năng',why:'Đếm những phần sản phẩm dùng được.'},
    {title:'Test bằng sử dụng thực tế',target:30,unit:'ngày',why:'Biết sản phẩm có đứng vững khi dùng thật.'},
    {title:'Xử lý lỗi quan trọng',target:20,unit:'lỗi',why:'Đo mức ổn định thay vì cảm giác.'},
  ];
  if(kind==='fitness')return [
    {title:'Hoàn thành số buổi tập',target:24,unit:'buổi',why:'Đủ số lần lặp để cơ thể thay đổi.'},
    {title:'Duy trì đủ số tuần',target:8,unit:'tuần',why:'Đo sự bền bỉ.'},
    {title:'Đạt mốc hiệu suất chính',target:10,unit:'km',why:'Có một đích nhìn thấy được.'},
  ];
  if(kind==='reading')return [
    {title:'Đọc xong số sách đã đặt',target:20,unit:'cuốn',why:'Đếm sản phẩm hoàn thành.'},
    {title:'Viết ghi chú sau khi đọc',target:20,unit:'bài',why:'Biến đọc thành thứ còn lại trong đầu.'},
    {title:'Hoàn thành số trang mục tiêu',target:3000,unit:'trang',why:'Có thước đo rõ.'},
  ];
  if(kind==='study')return [
    {title:'Hoàn thành phần kiến thức chính',target:12,unit:'phần',why:'Biết đã đi hết chương trình chưa.'},
    {title:'Làm bài kiểm tra thử',target:20,unit:'bài',why:'Học xong phải thử sức.'},
    {title:'Đạt mức điểm mục tiêu',target:80,unit:'%',why:'Có con số nói rõ chất lượng.'},
  ];
  return [
    {title:'Hoàn thành các kết quả quan trọng',target:5,unit:'kết quả',why:'Chia đích lớn thành thứ đo được.'},
    {title:'Duy trì tiến độ đủ lâu',target:30,unit:'ngày',why:'Chứng minh đây không chỉ là hứng nhất thời.'},
    {title:'Đánh giá và chỉnh kế hoạch',target:4,unit:'lần',why:'Có lúc nhìn lại và sửa đường đi.'},
  ];
};

const autoHabitIds=(kr:KeyResult,habits:Habit[])=>{
  const k=norm(`${kr.title} ${kr.unit}`);
  const tokens=k.split(/[^a-z0-9]+/).filter(x=>x.length>2);
  return habits.filter(h=>{
    const t=norm(h.title);
    return tokens.some(w=>t.includes(w)) || (k.includes('tu vung')&&/(tu|vocab|ngoai ngu|anh|trung|nhat|han)/.test(t)) || (k.includes('nghe')&&/(nghe|listening)/.test(t));
  }).slice(0,3).map(h=>h.id);
};

export const GoalOKR:React.FC<Props>=({habits})=>{
  const [portfolio,setPortfolio]=useState<GoalPortfolio>(()=>loadPortfolio(habits));
  const [wallet,setWallet]=useState<WalletState>(()=>safe(localStorage.getItem(WALLET_KEY),defaultWallet));
  const [showAdd,setShowAdd]=useState(false);
  const [newKr,setNewKr]=useState({title:'',target:'',unit:'lần'});
  const [notice,setNotice]=useState('');
  useEffect(()=>savePortfolio(portfolio),[portfolio]);
  useEffect(()=>{localStorage.setItem(WALLET_KEY,JSON.stringify(wallet));window.dispatchEvent(new CustomEvent('hm-reward-wallet-changed'))},[wallet]);

  const active=portfolio.goals.find(g=>g.id===portfolio.activeGoalId)||portfolio.goals[0];
  if(!active)return null;
  const updateGoal=(patch:any)=>setPortfolio(p=>({...p,goals:p.goals.map(g=>g.id===p.activeGoalId?{...g,...patch,updatedAt:new Date().toISOString()}:g)}));
  const rewardBase=Math.round(180+(active.difficulty||3)*90);
  const score=smarterChecks(active).filter(x=>x.ok).length;
  const suggestions=useMemo(()=>suggestionsFor(active.title,active.objective),[active.title,active.objective]);

  const createKr=(title:string,target:number,unit:string)=>{
    const kr:KeyResult={id:uid('kr'),title,current:0,target:Math.max(1,target),unit:unit||'lần',done:false,rewardCoins:rewardBase,rewardClaimed:false,linkedHabitIds:[]};
    kr.linkedHabitIds=autoHabitIds(kr,habits);
    const ms=milestonesForKr(kr,active.difficulty);
    updateGoal({keyResults:[...active.keyResults,kr],milestones:[...active.milestones,...ms]});
  };
  const addSuggested=(s:Suggestion)=>{
    if(active.keyResults.some(k=>norm(k.title)===norm(s.title)))return;
    createKr(s.title,s.target,s.unit);
  };
  const addCustom=()=>{
    const title=newKr.title.trim(); const target=Math.max(0,Number(newKr.target));
    if(!title||target<=0)return;
    if(looksLikeHabit(title)){
      setNotice('Câu này nghe giống một thói quen lặp lại. Hãy viết KR thành kết quả cuối, ví dụ “Học được 2.000 từ”; còn “Học 7 từ mỗi ngày” để ở phần Thói quen.');
      return;
    }
    createKr(title,target,newKr.unit.trim()||'lần');
    setNewKr({title:'',target:'',unit:'lần'}); setNotice(''); setShowAdd(false);
  };
  const removeKr=(id:string)=>updateGoal({keyResults:active.keyResults.filter(k=>k.id!==id),milestones:active.milestones.filter(m=>m.targetKrId!==id)});
  const resetMilestones=(kr:KeyResult)=>updateGoal({milestones:[...active.milestones.filter(m=>m.targetKrId!==kr.id),...milestonesForKr(kr,active.difficulty)]});
  const toggleHabit=(kr:KeyResult,habitId:string)=>{
    const ids=new Set(kr.linkedHabitIds||[]); ids.has(habitId)?ids.delete(habitId):ids.add(habitId);
    updateGoal({keyResults:active.keyResults.map(k=>k.id===kr.id?{...k,linkedHabitIds:[...ids]}:k)});
  };
  const setCurrent=(kr:KeyResult,value:number)=>{
    const current=Math.max(0,Math.min(Number(kr.target),Number(value)||0));
    let award=0;
    const milestones=active.milestones.map(m=>{
      if(m.targetKrId!==kr.id)return m;
      const reached=current>=Number(m.targetValue||0);
      if(reached&&!m.rewardClaimed){award+=Number(m.rewardCoins||0);return {...m,done:true,rewardClaimed:true};}
      return {...m,done:reached||Boolean(m.done&&m.rewardClaimed)};
    });
    const reachedKr=current>=Number(kr.target);
    let nextKr={...kr,current,done:reachedKr};
    if(reachedKr&&!kr.rewardClaimed){award+=Number(kr.rewardCoins||0);nextKr={...nextKr,rewardClaimed:true};}
    updateGoal({keyResults:active.keyResults.map(k=>k.id===kr.id?nextKr:k),milestones});
    if(award>0)setWallet(w=>({...w,coins:w.coins+award,earned:w.earned+award}));
  };
  const potential=[...active.keyResults.filter(x=>!x.rewardClaimed),...active.milestones.filter(x=>!x.rewardClaimed)].reduce((s:any,x:any)=>s+(Number(x.rewardCoins)||0),0);

  return <section className="space-y-5">
    <header className="rounded-[30px] border border-cyan-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950/20 p-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><div className="text-[10px] uppercase tracking-[.2em] font-black text-cyan-400">Bước 2/2 · OKR · cùng Goal với SMARTER</div><h2 className="mt-2 text-3xl font-black text-white">Từ đích lớn thành một con đường nhìn thấy được</h2><p className="mt-2 text-sm text-slate-400 max-w-3xl">KR là kết quả cần đạt. Mỗi KR có các mốc nằm ngay bên trong nó. Habit chỉ là việc lặp lại để đẩy KR tiến lên.</p></div><div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-5 py-3"><div className="text-[9px] uppercase text-amber-500 font-black">Ví mục tiêu</div><div className="text-2xl font-black text-amber-300">{wallet.coins.toLocaleString('vi-VN')} coin</div><div className="text-[10px] text-slate-500">Còn có thể nhận: {potential.toLocaleString('vi-VN')}</div></div></div>
    </header>

    <div className="rounded-[28px] border border-slate-800 bg-slate-950/55 p-5 grid lg:grid-cols-[260px_1fr_140px] gap-3 items-end">
      <label className="grid gap-2"><span className="text-[10px] uppercase tracking-widest text-slate-500 font-black">Mục tiêu đang làm</span><select value={portfolio.activeGoalId} onChange={e=>setPortfolio(p=>({...p,activeGoalId:e.target.value}))} className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm text-white">{portfolio.goals.map(g=><option value={g.id} key={g.id}>{g.title||'Mục tiêu chưa đặt tên'}</option>)}</select></label>
      <label className="grid gap-2"><span className="text-[10px] uppercase tracking-widest text-cyan-400 font-black">Objective · kết quả lớn nhất</span><input value={active.objective} onChange={e=>updateGoal({objective:e.target.value})} placeholder={`Ví dụ: Đạt ${active.title||'mục tiêu'} ở mức mong muốn`} className="rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-black text-white"/></label>
      <div className="rounded-xl border border-violet-500/15 bg-violet-500/5 px-3 py-3"><div className="text-[9px] uppercase text-violet-300 font-black">SMARTER</div><div className="text-xl font-black text-white">{score}/7</div></div>
    </div>

    {active.keyResults.length===0&&<div className="rounded-[28px] border border-cyan-500/15 bg-cyan-500/5 p-5"><div className="flex items-center gap-2 text-cyan-300 font-black"><WandSparkles size={17}/> Bạn chưa cần tự nghĩ KR</div><p className="text-xs text-slate-500 mt-1">Chọn một gợi ý phù hợp rồi sửa lại nếu cần.</p><div className="mt-4 grid md:grid-cols-3 gap-3">{suggestions.map(s=><button key={s.title} onClick={()=>addSuggested(s)} className="text-left rounded-2xl border border-slate-800 bg-slate-950/60 p-4 hover:border-cyan-500/30"><div className="text-sm font-black text-white">{s.title}</div><div className="mt-1 text-lg font-black text-cyan-300">{s.target.toLocaleString('vi-VN')} {s.unit}</div><div className="mt-2 text-[11px] text-slate-500">{s.why}</div><div className="mt-3 text-[10px] font-black text-cyan-400">+ DÙNG GỢI Ý NÀY</div></button>)}</div></div>}

    <div className="rounded-[30px] border border-emerald-500/15 bg-emerald-500/[.035] p-5 md:p-6">
      <div className="flex items-start justify-between gap-3"><div><div className="flex items-center gap-2 text-emerald-300 font-black"><Route size={18}/> Roadmap của mục tiêu</div><p className="mt-1 text-xs text-slate-500">Mốc không còn là danh sách đứng riêng. Nó nằm ngay dưới KR mà nó đo.</p></div><button onClick={()=>setShowAdd(v=>!v)} className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs font-black text-emerald-300"><Plus size={14} className="inline mr-1"/> Thêm KR</button></div>

      {showAdd&&<div className="mt-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4"><div className="grid md:grid-cols-[1fr_150px_120px_auto] gap-2"><input value={newKr.title} onChange={e=>setNewKr(v=>({...v,title:e.target.value}))} placeholder="Ví dụ: Học được 2.000 từ" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"/><input type="number" min="1" value={newKr.target} onChange={e=>setNewKr(v=>({...v,target:e.target.value}))} placeholder="Mục tiêu" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"/><input value={newKr.unit} onChange={e=>setNewKr(v=>({...v,unit:e.target.value}))} placeholder="đơn vị" className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"/><button onClick={addCustom} className="rounded-xl bg-emerald-400 px-4 py-2 text-sm font-black text-slate-950">Thêm</button></div>{notice&&<div className="mt-3 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-200">{notice}</div>}</div>}

      <div className="mt-5 space-y-4">{active.keyResults.map((kr,index)=>{
        const pct=Math.max(0,Math.min(100,Math.round((Number(kr.current)||0)/Math.max(1,Number(kr.target))*100)));
        const ms=active.milestones.filter(m=>m.targetKrId===kr.id).sort((a,b)=>a.targetValue-b.targetValue);
        const linked=new Set(kr.linkedHabitIds||[]);
        const next=ms.find(m=>!m.done);
        return <article key={kr.id} className="rounded-[24px] border border-slate-800 bg-slate-950/65 overflow-hidden">
          <div className="p-5"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="text-[10px] uppercase tracking-wider text-slate-600 font-black">KR {index+1}</div><h3 className="mt-1 text-lg font-black text-white">{kr.title}</h3><div className="mt-1 text-xs text-slate-400">{Number(kr.current).toLocaleString('vi-VN')} / {Number(kr.target).toLocaleString('vi-VN')} {kr.unit}</div></div><button onClick={()=>removeKr(kr.id)} title="Xóa KR" className="text-slate-700 hover:text-red-400"><Trash2 size={16}/></button></div>
            <div className="mt-4 h-2.5 rounded-full bg-slate-800 overflow-hidden"><div className="h-full bg-emerald-400 transition-all" style={{width:`${pct}%`}}/></div>
            <div className="mt-3 flex flex-wrap items-center gap-3"><label className="text-xs text-slate-500">Tiến độ <input type="number" min="0" max={kr.target} value={kr.current} onChange={e=>setCurrent(kr,Number(e.target.value))} className="ml-2 w-28 rounded-lg border border-slate-700 bg-slate-900 px-2 py-1.5 text-white"/></label><span className="text-xs font-black text-emerald-300">{pct}%</span>{next&&<span className="text-[11px] text-slate-500">Mốc kế: <b className="text-violet-300">{next.title}</b></span>}{kr.rewardClaimed&&<span className="text-[10px] font-black text-amber-300"><Coins size={12} className="inline"/> Đã nhận thưởng KR</span>}</div>
          </div>

          <div className="border-t border-slate-800/70 p-5"><div className="flex items-center justify-between gap-3"><div><div className="text-xs font-black text-violet-300">Các mốc trên đường tới KR</div><div className="text-[10px] text-slate-600 mt-1">Chạm con số là mốc tự hoàn thành và coin chỉ nhận một lần.</div></div><button onClick={()=>resetMilestones(kr)} className="text-[10px] font-black text-slate-500 hover:text-violet-300">Chia lại mốc</button></div>
            <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-5 gap-2">{ms.map((m:KrMilestone)=><div key={m.id} className={`rounded-xl border p-3 ${m.done?'border-emerald-500/25 bg-emerald-500/8':'border-slate-800 bg-slate-900/50'}`}><div className={`flex items-center gap-1.5 text-xs font-black ${m.done?'text-emerald-300':'text-slate-300'}`}>{m.done?<CheckCircle2 size={14}/>:<Target size={14}/>} {m.title}</div><div className="mt-1 text-[10px] text-amber-400">+{m.rewardCoins.toLocaleString('vi-VN')} coin</div></div>)}</div>
          </div>

          <details className="border-t border-slate-800/70 p-5 group"><summary className="cursor-pointer list-none flex items-center gap-2 text-xs font-black text-slate-400"><Link2 size={14}/> Thói quen nào đang giúp KR này? <ChevronDown size={14} className="group-open:rotate-180 transition-transform"/></summary><div className="mt-3 flex flex-wrap gap-2">{habits.length?habits.map(h=><button key={h.id} onClick={()=>toggleHabit(kr,h.id)} className={`rounded-full border px-3 py-1.5 text-[11px] ${linked.has(h.id)?'border-cyan-400/30 bg-cyan-400/10 text-cyan-200':'border-slate-800 text-slate-500'}`}>{linked.has(h.id)?'✓ ':''}{h.title}</button>):<span className="text-xs text-slate-600">Chưa có thói quen nào.</span>}</div></details>
        </article>;
      })}</div>

      {active.keyResults.length===0&&<div className="mt-5 rounded-2xl border border-dashed border-slate-800 p-8 text-center text-sm text-slate-600">Chưa có KR. Chọn một gợi ý ở trên hoặc thêm một kết quả mà bạn có thể đo.</div>}
    </div>

    <div className="rounded-2xl border border-slate-800 bg-slate-950/45 p-4 text-xs text-slate-500"><Sparkles size={14} className="inline mr-1 text-cyan-400"/> Nhớ đơn giản: <b className="text-white">KR = kết quả</b>, <b className="text-violet-300">Mốc = checkpoint bên trong KR</b>, <b className="text-cyan-300">Habit = việc lặp lại để đẩy KR tiến lên</b>.</div>
  </section>;
};
