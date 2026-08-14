import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { DailyLog, Habit } from '../types';
import { RewardWorld } from './RewardWorld';

interface Props{activeTab:string;habits:Habit[];logs:DailyLog[]}

class RewardBoundary extends React.Component<{children:React.ReactNode},{error:string}> {
  declare props: Readonly<{children:React.ReactNode}>;
  state={error:''};
  static getDerivedStateFromError(error:any){return {error:String(error?.message||error||'Unknown error')}}
  componentDidCatch(error:any,info:any){console.error('Reward page crashed',error,info)}
  render(){if(this.state.error)return <div className="rounded-[28px] border border-rose-500/20 bg-rose-500/5 p-6"><div className="flex items-center gap-2 text-rose-300 font-black"><AlertTriangle size={18}/> Trang phần thưởng gặp lỗi</div><p className="mt-2 text-sm text-slate-400">Dữ liệu của bạn vẫn được giữ. Chi tiết: {this.state.error}</p></div>;return this.props.children}
}

export const RewardRouteHost:React.FC<Props>=({activeTab,habits,logs})=>{
  const view=activeTab==='artGallery'||activeTab==='collection'?'gallery':activeTab==='curiosity'?'curiosity':activeTab==='goalShop'?'shop':null;
  if(!view)return null;
  return <RewardBoundary><RewardWorld habits={habits} logs={logs} view={view}/></RewardBoundary>;
};
