/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Heart, User, Flame, MessageSquare } from 'lucide-react';
import { VIRTUAL_MENTORS } from '../lib/personas';

interface Notification {
  id: string;
  userName: string;
  avatar: string;
  message: string;
  type: 'habit' | 'unlock' | 'streak' | 'quote' | 'interaction';
}

const HABITS = [
  'đọc Ebook', 'thiền định', 'uống nước', 'tập thể dục', 
  'học tiếng Anh', 'viết lách', 'chạy bộ', 'nghe nhạc thiền',
  'hoàn thành thói quen buổi sáng', 'mở khóa mảnh ghép mới'
];

const MESSAGES = [
  'vừa hoàn thành $habit',
  'vừa đạt chuỗi 7 ngày liên tiếp!',
  'đã mở khóa một chương tri thức mới!',
  'vừa nhận được 50 XP từ nhiệm vụ phụ',
  'vừa ghép xong một mảnh Mosaic!'
];

const INTERACTIONS = [
  'vừa thả tim thói quen của $otherName',
  'vừa khích lệ $otherName: "Cố lên!"',
  'đang thảo luận về $habit cùng $otherName',
  'vừa gửi lời chúc mừng đến $otherName'
];

const playNotifSound = () => {
  try {
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // A5
    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);
    
    gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.05, audioCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
    
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 0.3);
  } catch (e) {
    // Audio might be blocked by browser policy
  }
};

export const GhostNotifications: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const triggerNotification = () => {
      const mentor = VIRTUAL_MENTORS[Math.floor(Math.random() * VIRTUAL_MENTORS.length)];
      const id = `gn-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      const typeRand = Math.random();
      let type: Notification['type'] = 'habit';
      let message = '';

      if (typeRand < 0.4) {
        // Normal habit message
        type = 'habit';
        const habit = HABITS[Math.floor(Math.random() * HABITS.length)];
        const rawMessage = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
        message = rawMessage.replace('$habit', habit);
        if (message.includes('chuỗi')) type = 'streak';
        if (message.includes('mở khóa') || message.includes('Mosaic')) type = 'unlock';
      } else if (typeRand < 0.7) {
        // Mentor Quote
        type = 'quote';
        message = `chia sẻ: "${mentor.quote}"`;
      } else {
        // Interaction
        type = 'interaction';
        const otherMentor = VIRTUAL_MENTORS[Math.floor(Math.random() * VIRTUAL_MENTORS.length)];
        const interaction = INTERACTIONS[Math.floor(Math.random() * INTERACTIONS.length)];
        const habit = HABITS[Math.floor(Math.random() * HABITS.length)];
        message = interaction.replace('$otherName', otherMentor.name === mentor.name ? 'Bạn' : otherMentor.name).replace('$habit', habit);
      }

      const newNotif: Notification = {
        id,
        userName: mentor.name,
        avatar: mentor.avatar,
        message,
        type
      };

      setNotifications(prev => [newNotif, ...prev].slice(0, 3));
      playNotifSound();

      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
      }, 7000);
    };

    const interval = setInterval(triggerNotification, 45000 + Math.random() * 90000); // 45s to 2min
    const initialTimer = setTimeout(triggerNotification, 10000);

    return () => {
      clearInterval(interval);
      clearTimeout(initialTimer);
    };
  }, []);

  return (
    <div className="fixed bottom-28 right-6 z-[60] flex flex-col gap-3 pointer-events-none w-80">
      <AnimatePresence>
        {notifications.map((notif) => (
          <motion.div
            key={notif.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.9 }}
            className={`p-3 bg-slate-900/95 backdrop-blur-2xl border rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-start gap-3 pointer-events-auto ring-1 ring-white/5 ${
              notif.type === 'quote' ? 'border-amber-500/30' : 'border-slate-800/50'
            }`}
          >
            <div className="relative flex-shrink-0">
               <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                  <img src={notif.avatar} alt="avatar" className="w-full h-full object-cover" />
               </div>
               <div className={`absolute -bottom-1 -right-1 p-1 rounded-lg ${
                  notif.type === 'streak' ? 'bg-orange-500 text-white' :
                  notif.type === 'unlock' ? 'bg-purple-500 text-white' :
                  notif.type === 'quote' ? 'bg-amber-500 text-slate-950' :
                  notif.type === 'interaction' ? 'bg-blue-500 text-white' :
                  'bg-emerald-500 text-white'
                }`}>
                  {notif.type === 'streak' ? <Flame size={10} /> : 
                   notif.type === 'unlock' ? <Sparkles size={10} /> : 
                   notif.type === 'quote' ? <Sparkles size={10} /> :
                   notif.type === 'interaction' ? <MessageSquare size={10} /> :
                   <User size={10} />}
               </div>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{notif.userName}</p>
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              </div>
              <p className={`text-xs mt-0.5 leading-relaxed font-medium ${notif.type === 'quote' ? 'text-amber-200 italic' : 'text-slate-200'}`}>
                {notif.message}
              </p>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};
