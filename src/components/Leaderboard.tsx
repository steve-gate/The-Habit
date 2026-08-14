/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { motion } from 'motion/react';
import { Trophy, Medal, Crown, TrendingUp } from 'lucide-react';
import { VIRTUAL_MENTORS, VirtualPersona } from '../lib/personas';

interface LeaderboardEntry {
  id: string;
  name: string;
  xp: number;
  streak: number;
  avatar: string;
  isUser?: boolean;
}

interface LeaderboardProps {
  userXp: number;
  userStreak: number;
  userName: string;
}

export const Leaderboard: React.FC<LeaderboardProps> = ({ userXp, userStreak, userName }) => {
  // Map our virtual mentors to leaderboard entries with semi-realistic XP
  // We use the date to make XP progress look pseudo-persistent "per day"
  const today = new Date().toISOString().split('T')[0];
  const dateSeed = new Date(today).getTime() / (1000 * 60 * 60 * 24); // Days since epoch

  const ghostLeaders: LeaderboardEntry[] = VIRTUAL_MENTORS.map((m, idx) => {
    // Base XP + (growth factor * days since some point) + index offset
    const baseXP = 5000 - (idx * 400);
    const growthPerDay = 150 - (idx * 5); // Each person grows differently
    const currentXP = baseXP + Math.floor(growthPerDay * (dateSeed % 30)); // Cycle every 30 days for variety
    
    // Streak also grows slightly
    const baseStreak = 45 - (idx * 3);
    const currentStreak = baseStreak + Math.floor((dateSeed % 14) / 2);

    return {
      id: m.id,
      name: m.name,
      avatar: m.avatar,
      xp: currentXP,
      streak: currentStreak
    };
  });

  // Combine user with ghosts and sort by XP
  const allEntries: LeaderboardEntry[] = [
    ...ghostLeaders,
    { id: 'user', name: userName || 'Bạn', xp: userXp, streak: userStreak, avatar: '', isUser: true }
  ].sort((a, b) => b.xp - a.xp);

  return (
    <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="text-amber-500" size={20} />
            Bảng Xếp Hạng
          </h3>
          <p className="text-xs text-slate-500 font-serif italic mt-1">Cập nhật: Hôm nay</p>
        </div>
        <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center gap-2">
          <TrendingUp size={12} className="text-amber-500" />
          <span className="text-[10px] font-bold text-amber-500 uppercase tracking-tighter">Xu hướng tăng</span>
        </div>
      </div>

      <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {allEntries.map((entry, index) => {
          const rank = index + 1;
          return (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`p-3 rounded-2xl flex items-center gap-4 transition-all ${
                entry.isUser 
                  ? 'bg-amber-500/20 border border-amber-500/30' 
                  : 'bg-slate-800/20 border border-transparent hover:border-slate-700/50'
              }`}
            >
              <div className="w-8 flex justify-center">
                {rank === 1 ? <Crown className="text-amber-500" size={18} /> :
                 rank === 2 ? <Medal className="text-slate-300" size={18} /> :
                 rank === 3 ? <Medal className="text-orange-400" size={18} /> :
                 <span className="text-sm font-black text-slate-600">#{rank}</span>}
              </div>

              <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700 flex-shrink-0">
                <img 
                  src={entry.isUser 
                    ? `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.name}&backgroundColor=b6e3f4,c0aede,d1d4f9`
                    : entry.avatar
                  } 
                  alt={entry.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className={`text-sm font-bold truncate ${entry.isUser ? 'text-amber-400' : 'text-slate-200'}`}>
                  {entry.name} {entry.isUser && "(Bạn)"}
                </p>
                <p className="text-[10px] text-slate-500 font-medium">Chuỗi: {entry.streak} ngày</p>
              </div>

              <div className="text-right">
                <p className="text-sm font-black text-white">{entry.xp.toLocaleString()}</p>
                <p className="text-[9px] font-bold text-slate-600 uppercase">XP</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* User Status Summary at footer */}
      <div className="mt-6 pt-4 border-t border-slate-800">
        <div className="flex items-center justify-between">
            <span className="text-xs text-slate-500">Thứ hạng của bạn:</span>
            <span className="text-sm font-black text-amber-500">Top {Math.ceil((allEntries.findIndex(e => e.isUser) + 1) / allEntries.length * 100)}%</span>
        </div>
      </div>
    </div>
  );
};
