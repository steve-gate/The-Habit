import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Swords, Trophy, Timer, Zap, ChevronRight, AlertCircle } from 'lucide-react';
import { VirtualDuel as VirtualDuelType, UserProfile, Ebook } from '../types';
import { VIRTUAL_MENTORS } from '../lib/personas';

interface VirtualDuelProps {
  profile: UserProfile;
  activeDuel: VirtualDuelType | null;
  onStartDuel: (mentorId: string) => void;
  onCloseDuel?: () => void;
  library: Ebook[];
}

export const VirtualDuel: React.FC<VirtualDuelProps> = ({ profile, activeDuel, onStartDuel, onCloseDuel, library }) => {
  const [randomMentors, setRandomMentors] = useState<typeof VIRTUAL_MENTORS>([]);
  const [selectedMentorIndex, setSelectedMentorIndex] = useState(0);
  const [duelMessage, setDuelMessage] = useState<string>('');

  useEffect(() => {
    if (!activeDuel && randomMentors.length === 0) {
      const shuffled = [...VIRTUAL_MENTORS].sort(() => 0.5 - Math.random());
      setRandomMentors(shuffled.slice(0, 3));
    }
  }, [activeDuel, randomMentors.length]);

  // Time remaining calculation
  const getTimeRemaining = (deadline: string) => {
    const total = Date.parse(deadline) - Date.now();
    const seconds = Math.max(0, Math.floor((total / 1000) % 60));
    const minutes = Math.max(0, Math.floor((total / 1000 / 60) % 60));
    const hours = Math.max(0, Math.floor((total / (1000 * 60 * 60)) % 24));
    const days = Math.max(0, Math.ceil(total / (1000 * 60 * 60 * 24)));
    return { days, hours, minutes, seconds, total: Math.max(0, total) };
  };

  const [timeLeft, setTimeLeft] = useState(
    activeDuel ? getTimeRemaining(activeDuel.deadline) : { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 }
  );

  useEffect(() => {
    if (!activeDuel) return;

    // Immediate update
    setTimeLeft(getTimeRemaining(activeDuel.deadline));

    const timer = setInterval(() => {
      setTimeLeft(getTimeRemaining(activeDuel.deadline));
    }, 1000); 

    return () => clearInterval(timer);
  }, [activeDuel?.id, activeDuel?.deadline]);

  const userProgressRaw = activeDuel && activeDuel.objectives && activeDuel.objectives.length > 0
    ? (activeDuel.objectives.reduce((acc, obj) => {
        const target = Math.max(1, Number(obj.target) || 0);
        const current = Number(obj.current) || 0;
        return acc + Math.min(1, current / target);
      }, 0) / activeDuel.objectives.length) * 100 
    : 0;

  const userProgress = userProgressRaw > 0 && userProgressRaw < 1 ? 1 : Math.round(userProgressRaw);
  const mentorProgressRaw = activeDuel ? (Number(activeDuel.mentorProgress) || 0) : 0;
  const mentorProgress = mentorProgressRaw > 0 && mentorProgressRaw < 1 ? 1 : Math.round(mentorProgressRaw);

  // Generate a contextual duel message from the mentor
  useEffect(() => {
    if (!activeDuel) return;
    
    const mentor = VIRTUAL_MENTORS.find(m => m.id === activeDuel.mentorId);
    if (!mentor) return;

    const generateMessage = () => {
      const hasBooks = library.length > 0;
      const randomBook = hasBooks ? library[Math.floor(Math.random() * library.length)] : null;
      
      if (userProgress >= mentorProgress) {
        return randomBook 
          ? `Bạn đang dẫn trước, nhưng kiến thức từ cuốn "${randomBook.title}" dạy chúng ta rằng hành trình vạn dặm chỉ mới bắt đầu.`
          : 'Đừng vội mừng, tôi đã chứng kiến nhiều người bỏ cuộc ngay sát vạch đích rồi.';
      } else {
        return randomBook
          ? `Trong cuốn "${randomBook.title}", ${randomBook.author} có nhắc đến sự bền bỉ. Bạn dường như đang thiếu nó ngay lúc này.`
          : 'Bạn cần phải cố gắng hơn nữa nếu muốn theo kịp kỷ luật của tôi.';
      }
    };

    setDuelMessage(generateMessage());
  }, [activeDuel?.id, userProgress, mentorProgress, library]);

  return (
    <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/20">
            <Swords size={24} className="text-rose-500" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-wider">So tài cùng Huyền thoại</h3>
            <p className="text-xs text-slate-500 font-bold">Thử thách Tuần Lễ Kiên Trì</p>
          </div>
        </div>

        {activeDuel && (
          <div className="flex items-center gap-2 bg-slate-950/50 px-4 py-2 rounded-xl border border-slate-800">
            <Timer size={16} className="text-amber-500" />
            <span className="text-xs font-mono font-bold text-white uppercase tracking-tighter">
              {timeLeft.total > 0 ? (
                timeLeft.days > 1
                  ? `${timeLeft.days} NGÀY CÒN LẠI`
                  : timeLeft.days === 1 && timeLeft.hours >= 20
                    ? `1 NGÀY CÒN LẠI`
                    : `${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')} CÒN LẠI`
              ) : 'ĐÃ KẾT THÚC'}
            </span>
          </div>
        )}
      </div>

      {!activeDuel ? (
        randomMentors.length > 0 ? (
        <div className="space-y-6">
          <div className="bg-blue-500/5 border border-blue-500/20 rounded-2xl p-4 flex gap-4 items-start">
             <AlertCircle className="text-blue-400 mt-1" size={18} />
             <p className="text-sm text-slate-400 leading-relaxed">
               Thách đấu một Huyền thoại trong <span className="text-white font-bold">7 ngày</span>. Hoàn thành các mục tiêu ngẫu nhiên về thói quen, đọc sách và nỗ lực để giành chiến thắng.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {randomMentors.map((mentor, idx) => (
              <motion.button
                key={mentor.id}
                whileHover={{ y: -4 }}
                onClick={() => setSelectedMentorIndex(idx)}
                className={`relative group p-4 rounded-3xl border transition-all ${
                  selectedMentorIndex === idx 
                    ? 'bg-amber-500/10 border-amber-500' 
                    : 'bg-slate-800/30 border-slate-700/50 hover:border-slate-600'
                }`}
              >
                <div className="absolute -top-2 -right-2 bg-slate-900 border border-slate-700 px-2 py-0.5 rounded-lg text-[10px] font-black text-amber-500">
                  HUYỀN THOẠI
                </div>
                <div className="w-16 h-16 rounded-2xl overflow-hidden mx-auto mb-4 border-2 border-slate-800 shadow-xl">
                   <img src={mentor.avatar} alt={mentor.name} className="w-full h-full object-cover" />
                </div>
                <h4 className="text-sm font-black text-white mb-1">{mentor.name}</h4>
                <p className="text-[10px] text-slate-500 font-bold uppercase truncate">{mentor.role}</p>
              </motion.button>
            ))}
          </div>

          <div className="pt-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
               <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Kỷ luật</span>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-amber-500" />
                    <span className="text-sm font-black text-white">21 Thói quen</span>
                  </div>
               </div>
               <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Tri thức</span>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-blue-500" />
                    <span className="text-sm font-black text-white">30 Trang sách</span>
                  </div>
               </div>
               <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl">
                  <span className="text-[9px] text-slate-500 font-black uppercase tracking-widest block mb-1">Nỗ lực</span>
                  <div className="flex items-center gap-2">
                    <Zap size={14} className="text-rose-500" />
                    <span className="text-sm font-black text-white">1000 XP</span>
                  </div>
               </div>
            </div>

            <button
              onClick={() => onStartDuel(randomMentors[selectedMentorIndex].id)}
              className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm shadow-xl shadow-rose-900/20 hover:from-rose-500 hover:to-rose-400 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
            >
              Chấp nhận thách đấu <Swords size={20} />
            </button>
          </div>
        </div>
        ) : null
      ) : (
        <div className="space-y-8 py-4">
           {/* Progress visualization */}
           <div className="grid grid-cols-2 gap-8 relative">
              {/* VS Divider */}
              <div className="absolute left-1/2 top-11 -translate-x-1/2 z-10">
                 <div className="w-12 h-12 bg-slate-900 border-4 border-slate-800 rounded-full flex items-center justify-center shadow-2xl">
                    <span className="text-sm font-black text-rose-500 italic">VS</span>
                 </div>
              </div>

              {/* User Side */}
              <div className="space-y-4">
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-blue-500 p-1 mb-4 shadow-xl shadow-blue-900/10">
                       <img 
                         src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}`} 
                         alt="you" 
                         className="w-full h-full rounded-2xl object-cover" 
                       />
                    </div>
                    <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">BẠN ĐANG ĐẠT</span>
                    <span className="text-2xl font-black text-white">{Math.round(userProgress)}%</span>
                 </div>
                 
                 <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${userProgress}%` }}
                      className="h-full bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                    />
                 </div>
              </div>

              {/* Mentor Side */}
              <div className="space-y-4">
                 <div className="flex flex-col items-center">
                    <div className="w-20 h-20 rounded-3xl bg-slate-800 border-2 border-rose-500 p-1 mb-4 shadow-xl shadow-rose-900/10">
                       <img 
                         src={activeDuel.mentorAvatar} 
                         alt="mentor" 
                         className="w-full h-full rounded-2xl object-cover" 
                       />
                    </div>
                    <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">{activeDuel.mentorName.toUpperCase()}</span>
                    <span className="text-2xl font-black text-white">{Math.round(mentorProgress)}%</span>
                 </div>

                 <div className="h-2 w-full bg-slate-800 rounded-full relative overflow-hidden">
                    <motion.div 
                      key={activeDuel.mentorProgress}
                      initial={{ width: "0%" }}
                      animate={{ width: `${mentorProgress}%` }}
                      className="h-full bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]"
                    />
                 </div>
              </div>
           </div>

           {/* Detailed Objectives */}
           {activeDuel.objectives && activeDuel.objectives.length > 0 && (
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Mục tiêu hiện tại</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                   {activeDuel.objectives.map((obj) => (
                      <div key={obj.id} className="p-4 bg-slate-950/50 border border-slate-800 rounded-2xl space-y-3">
                         <div className="flex justify-between items-start">
                            <p className="text-[11px] font-bold text-slate-300 leading-tight pr-4">{obj.title}</p>
                            <div className={`p-1 rounded-md ${obj.current >= obj.target ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>
                               {obj.current >= obj.target ? <Zap size={10} className="fill-emerald-400" /> : <Zap size={10} />}
                            </div>
                         </div>
                         <div className="space-y-1.5">
                            <div className="flex justify-between text-[9px] font-black">
                               <span className="text-slate-500">{obj.current} / {obj.target}</span>
                             <span className={Number(obj.current) >= Number(obj.target) ? 'text-emerald-400' : 'text-amber-500'}>
                                {Number(obj.current) > 0 && (Number(obj.current) / Math.max(1, Number(obj.target))) * 100 < 1 
                                  ? 1 
                                  : Math.round(((Number(obj.current) || 0) / Math.max(1, Number(obj.target) || 1)) * 100)}%
                             </span>
                            </div>
                            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                               <motion.div 
                                 initial={{ width: 0 }}
                                 animate={{ width: `${Math.min(100, (obj.current / Math.max(1, obj.target)) * 100)}%` }}
                                 className={`h-full ${obj.current >= obj.target ? 'bg-emerald-500' : 'bg-amber-500'}`}
                               />
                            </div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

             <div className="bg-slate-950/40 border-t border-slate-800 px-6 py-4 -mx-6 -mb-6">
              <div className="flex items-center gap-4">
                 <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse border ${activeDuel.status === 'won' ? 'bg-emerald-500/10 border-emerald-500/20' : activeDuel.status === 'lost' ? 'bg-rose-500/10 border-rose-500/20' : 'bg-rose-500/10 border-rose-500/20'}`}>
                    {activeDuel.status === 'won' ? <Trophy size={18} className="text-emerald-500" /> : <AlertCircle size={18} className="text-rose-500" />}
                 </div>
                 <p className="text-xs text-slate-300 italic leading-relaxed flex-1">
                   {activeDuel.status === 'won' ? `Kỳ tích! Bạn đã chiến thắng thử thách và vượt qua ${activeDuel.mentorName}. Bạn là nguồn cảm hứng thực thụ!` : activeDuel.status === 'lost' ? `Đáng tiếc! ${activeDuel.mentorName} đã đạt 100% trước và giành chiến thắng. Hãy phục thù vào lần sau!` : `"${duelMessage}"`}
                 </p>
                 {activeDuel.status !== 'active' && onCloseDuel && (
                   <button
                     onClick={onCloseDuel}
                     className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-black uppercase tracking-widest rounded-xl border border-slate-700 transition-all active:scale-[0.98]"
                   >
                     Đóng
                   </button>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};
