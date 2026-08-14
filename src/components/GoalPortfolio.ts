import { Habit } from '../types';

export type HabitLink={enabled:boolean;weight:number;reason:string};
export type KrMilestone={
  id:string;
  title:string;
  done:boolean;
  targetDate?:string;
  rewardCoins:number;
  rewardClaimed?:boolean;
  targetKrId:string;
  targetValue:number;
  auto?:boolean;
};
export type KeyResult={
  id:string;
  title:string;
  current:number;
  target:number;
  unit:string;
  done:boolean;
  rewardCoins:number;
  rewardClaimed?:boolean;
  linkedHabitIds?:string[];
};
// Kept as an alias so older code importing Milestone does not break.
export type Milestone=KrMilestone;
export type GoalGraph={
  id:string;title:string;vision:string;objective:string;why:string;targetDate:string;
  keyResults:KeyResult[];milestones:KrMilestone[];habitLinks:Record<string,HabitLink>;
  difficulty:number;evaluateNote:string;readjustNote:string;updatedAt:string;createdAt?:string
};
export type GoalPortfolio={version:number;activeGoalId:string;goals:GoalGraph[]};

export const PORTFOLIO_KEY='habit_mosaic_goal_portfolio_v20_4';
export const LEGACY_GRAPH_KEY='habit_mosaic_v12_goal_graph';
export const LEGACY_TITLE_KEY='habit_mosaic_v11_goal';

const uid=(p:string)=>`${p}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
const safe=<T,>(raw:string|null,fallback:T):T=>{try{return raw?JSON.parse(raw):fallback}catch{return fallback}};
const plain=(s:string)=>String(s||'').toLocaleLowerCase('vi-VN').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/đ/g,'d');
const words=(s:string)=>new Set(plain(s).split(/[^a-z0-9]+/).filter(x=>x.length>1));

export const looksLikeHabit=(text:string)=>{
  const t=plain(text);
  return /moi ngay|hang ngay|moi tuan|hang tuan|\/ngay|\/tuan|phut moi ngay|phut\/ngay|lan moi tuan|lan\/tuan|[2-7]\s*lan\s*(mot\s*)?tuan/.test(t);
};

export const milestoneValues=(target:number)=>{
  const t=Math.max(1,Number(target)||1);
  if(t<=4) return Array.from({length:Math.round(t)},(_,i)=>i+1);
  const ratios=t>=1000?[.1,.2,.4,.7,1]:t>=50?[.1,.25,.5,.75,1]:[.25,.5,.75,1];
  const step=t>=1000?Math.pow(10,Math.max(0,Math.floor(Math.log10(t))-2)):1;
  const vals=ratios.map(r=>{
    const raw=t*r;
    return step>1?Math.max(1,Math.round(raw/step)*step):Math.max(1,Math.round(raw));
  });
  vals[vals.length-1]=t;
  return [...new Set(vals.filter(v=>v>0&&v<=t))].sort((a,b)=>a-b);
};

export const milestonesForKr=(kr:KeyResult,difficulty=3):KrMilestone[]=>{
  const values=milestoneValues(kr.target);
  return values.map((v,i)=>({
    id:uid('ms'),
    title:`${v.toLocaleString('vi-VN')} ${kr.unit||''}`.trim(),
    targetKrId:kr.id,
    targetValue:v,
    done:Number(kr.current)>=v,
    rewardCoins:Math.max(40,Math.round((70+difficulty*22)*(1+i*.14))),
    rewardClaimed:false,
    auto:true,
  }));
};

export const blankGoal=(habits:Habit[],title=''):GoalGraph=>({
  id:uid('goal'), title, vision:'', objective:'', why:'', targetDate:'',
  keyResults:[], milestones:[],
  habitLinks:Object.fromEntries(habits.map(h=>[h.id,{enabled:true,weight:1,reason:''}])),
  difficulty:3, evaluateNote:'', readjustNote:'',
  createdAt:new Date().toISOString(), updatedAt:new Date().toISOString()
});

const milestoneMatch=(m:any,krs:KeyResult[])=>{
  if(!krs.length)return '';
  if(m?.targetKrId&&krs.some(k=>k.id===m.targetKrId))return String(m.targetKrId);
  const mw=words(String(m?.title||''));
  let best=krs[0],bestScore=-1;
  for(const k of krs){
    const kw=words(`${k.title} ${k.unit}`);
    let score=0; mw.forEach(w=>{if(kw.has(w))score+=1});
    if(String(m?.title||'').includes(k.unit))score+=2;
    if(score>bestScore){best=k;bestScore=score}
  }
  return best.id;
};

const extractNumber=(text:string)=>{
  const m=String(text||'').replace(/\./g,'').replace(/,/g,'.').match(/\d+(?:\.\d+)?/);
  return m?Number(m[0]):0;
};

export const normalizeGoal=(raw:any,habits:Habit[]):GoalGraph=>{
  const base=blankGoal(habits,String(raw?.title||''));
  const links={...(raw?.habitLinks||{})};
  for(const h of habits) if(!links[h.id]) links[h.id]={enabled:true,weight:1,reason:''};
  const keyResults:KeyResult[]=Array.isArray(raw?.keyResults)?raw.keyResults.map((k:any)=>({
    id:String(k?.id||uid('kr')),title:String(k?.title||''),current:Math.max(0,Number(k?.current||0)),
    target:Math.max(1,Number(k?.target||1)),unit:String(k?.unit||'lần'),done:Boolean(k?.done),
    rewardCoins:Math.max(0,Number(k?.rewardCoins||0)),rewardClaimed:Boolean(k?.rewardClaimed),
    linkedHabitIds:Array.isArray(k?.linkedHabitIds)?k.linkedHabitIds.map(String):[],
  })):[];
  const milestones:KrMilestone[]=Array.isArray(raw?.milestones)?raw.milestones.map((m:any)=>{
    const targetKrId=milestoneMatch(m,keyResults);
    const kr=keyResults.find(k=>k.id===targetKrId);
    const guessed=Number(m?.targetValue||0)||extractNumber(m?.title)||Math.min(Number(kr?.target||1),1);
    return {
      id:String(m?.id||uid('ms')),title:String(m?.title||''),done:Boolean(m?.done),targetDate:String(m?.targetDate||''),
      rewardCoins:Math.max(0,Number(m?.rewardCoins||0)),rewardClaimed:Boolean(m?.rewardClaimed),
      targetKrId,targetValue:Math.max(0,guessed),auto:Boolean(m?.auto),
    };
  }):[];
  return {
    ...base,...raw,
    id:String(raw?.id||base.id),title:String(raw?.title||''),vision:String(raw?.vision||''),
    objective:String(raw?.objective||''),why:String(raw?.why||''),targetDate:String(raw?.targetDate||''),
    keyResults,milestones,habitLinks:links,
    difficulty:Math.min(5,Math.max(1,Number(raw?.difficulty||3))),evaluateNote:String(raw?.evaluateNote||''),
    readjustNote:String(raw?.readjustNote||''),updatedAt:String(raw?.updatedAt||new Date().toISOString()),
    createdAt:String(raw?.createdAt||new Date().toISOString())
  };
};

export const loadPortfolio=(habits:Habit[]):GoalPortfolio=>{
  const own=safe<any>(localStorage.getItem(PORTFOLIO_KEY),null);
  if(own&&Array.isArray(own.goals)&&own.goals.length){
    const goals=own.goals.map((g:any)=>normalizeGoal(g,habits));
    const activeGoalId=goals.some((g:GoalGraph)=>g.id===own.activeGoalId)?own.activeGoalId:goals[0].id;
    return {version:2,activeGoalId,goals};
  }
  const old=safe<any>(localStorage.getItem(LEGACY_GRAPH_KEY),null);
  const first=old?normalizeGoal(old,habits):blankGoal(habits,localStorage.getItem(LEGACY_TITLE_KEY)||'');
  const portfolio={version:2,activeGoalId:first.id,goals:[first]};
  savePortfolio(portfolio);
  return portfolio;
};

export const savePortfolio=(portfolio:GoalPortfolio)=>{
  localStorage.setItem(PORTFOLIO_KEY,JSON.stringify({...portfolio,version:2}));
  const active=portfolio.goals.find(g=>g.id===portfolio.activeGoalId)||portfolio.goals[0];
  if(active){
    const mirror={...active,updatedAt:new Date().toISOString()};
    localStorage.setItem(LEGACY_GRAPH_KEY,JSON.stringify(mirror));
    localStorage.setItem(LEGACY_TITLE_KEY,mirror.title||'');
    window.dispatchEvent(new CustomEvent('hm-goal-graph-changed',{detail:mirror}));
  }
  window.dispatchEvent(new CustomEvent('hm-goal-portfolio-changed',{detail:portfolio}));
};

export const smarterChecks=(goal:GoalGraph)=>{
  const measured=goal.keyResults.some(k=>k.title.trim()&&Number(k.target)>0);
  return [
    {k:'S',name:'Cụ thể',ok:Boolean(goal.title.trim()&&goal.vision.trim()),hint:'Nói rõ bạn muốn đạt điều gì và khi đạt sẽ trông như thế nào.'},
    {k:'M',name:'Đo được',ok:measured,hint:'Có ít nhất một Key Result với con số rõ trong OKR.'},
    {k:'A',name:'Khả thi',ok:goal.difficulty>=1&&goal.difficulty<=5,hint:'Khó vừa đủ để cố nhưng vẫn có đường làm.'},
    {k:'R',name:'Liên quan',ok:Boolean(goal.why.trim()),hint:'Biết vì sao mục tiêu này đáng để theo.'},
    {k:'T',name:'Có hạn',ok:Boolean(goal.targetDate),hint:'Có ngày đích.'},
    {k:'E',name:'Đánh giá',ok:Boolean(goal.evaluateNote.trim()),hint:'Có lịch xem lại tiến độ.'},
    {k:'R',name:'Điều chỉnh',ok:Boolean(goal.readjustNote.trim()),hint:'Biết sẽ đổi kế hoạch thế nào nếu bị lệch.'},
  ];
};
