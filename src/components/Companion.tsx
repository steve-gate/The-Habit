/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, MessageCircle, Heart, Star, Coffee, Ghost } from 'lucide-react';

interface CompanionProps {
  xp: number;
  streak: number;
  activeSpiritId?: string;
}

const PET_PHRASES = [
  'Hôm nay bạn thấy thế nào?',
  'Đừng quên uống nước và vận động nhẹ nhé!',
  'Một thói quen nhỏ, một thành tựu lớn.',
  'Tôi đang quan sát sự trưởng thành của bạn đấy!',
  'Cố lên, tri thức đang chờ bạn mở khóa!',
  'Bạn có biết là mình đang làm rất tốt không?',
  'Nghỉ ngơi một chút rồi lại tiếp tục nhé.',
  'Hành trình vạn dặm bắt đầu từ bước đi đầu tiên.',
  'Bí kíp: Hãy bắt đầu thói quen khó nhất vào buổi sáng!',
  'Bạn đã đọc hết chương sách nào chưa?',
  'Đừng để chuỗi ngày rèn luyện bị ngắt quãng nhé!',
  'Một ly nước lọc ngay lúc này sẽ giúp bạn tỉnh táo hơn đấy.'
];

export const Companion: React.FC<CompanionProps> = ({ xp, streak, activeSpiritId }) => {
  const [bubble, setBubble] = useState<string | null>(null);
  const [isWaving, setIsWaving] = useState(false);

  const pokeId = activeSpiritId?.replace('poke-', '');
  const pokeImg = pokeId ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokeId}.png` : null;

  // Track XP to detect habit completions instantly
  const prevXpRef = useRef(xp);
  useEffect(() => {
    if (xp > prevXpRef.current) {
      let activeSpiritName = 'Ghosty';
      if (activeSpiritId) {
        if (activeSpiritId === 'poke-1') activeSpiritName = 'Bulbasaur';
        else if (activeSpiritId === 'poke-2') activeSpiritName = 'Ivysaur';
        else if (activeSpiritId === 'poke-3') activeSpiritName = 'Venusaur';
        else if (activeSpiritId === 'poke-4') activeSpiritName = 'Charmander';
        else if (activeSpiritId === 'poke-5') activeSpiritName = 'Charmeleon';
        else if (activeSpiritId === 'poke-6') activeSpiritName = 'Charizard';
        else if (activeSpiritId === 'poke-7') activeSpiritName = 'Squirtle';
        else if (activeSpiritId === 'poke-8') activeSpiritName = 'Wartortle';
        else activeSpiritName = 'Pokémon';
      }

      const habitPraisingPhrases = [
        `Uầy! ${activeSpiritName} thấy chủ nhân đỉnh vãiii! Lại quẹt thói quen rồi! 🔥`,
        `Ngon cành đào! ${activeSpiritName} cảm nhận được siêu năng lực đang chảy tràn trề!`,
        `Kỳ tích xuất hiện! ${activeSpiritName} thán phục sự siêng năng này! 👏`,
        `Xong một thói quen! ${activeSpiritName} vừa nhận thêm giáp chống trì hoãn rồi nhé!`,
        `Quá dữ dội! Não bộ chủ nhân đang phát sáng chói lòa luôn! ✨`,
        `Sợ chưa! Thần lười vừa tháo chạy khi thấy bạn click thói quen này đó!`,
        `Wow! Tôi thề sự siêng năng này lạ lẫm cực kì luôn á! Bái phục!`,
        `Tuyệt chiêu: Kỷ Luật Thần Linh! ${activeSpiritName} vô cùng ngưỡng mộ!`,
        `Aii chà chà! Kỷ luật thế này thì nghèo thế nào được nữa cưng ơi! 😎`,
        `Chúc mừng chủ nhân đã thoát ly hội cá mặn thêm một chút! Hoan hô!`
      ];

      const randomPhrase = habitPraisingPhrases[Math.floor(Math.random() * habitPraisingPhrases.length)];
      setBubble(randomPhrase);
      setIsWaving(true);

      const timer = setTimeout(() => {
        setBubble(null);
        setIsWaving(false);
      }, 5500);

      prevXpRef.current = xp;
      return () => clearTimeout(timer);
    }
    prevXpRef.current = xp;
  }, [xp, activeSpiritId]);

  // Randomly speak every 3-5 minutes (more natural/less intrusive)
  useEffect(() => {
    const talk = () => {
      const phrase = PET_PHRASES[Math.floor(Math.random() * PET_PHRASES.length)];
      setBubble(phrase);
      setIsWaving(true);
      
      setTimeout(() => {
        setBubble(null);
        setIsWaving(false);
      }, 7000);
    };

    const interval = setInterval(talk, 180000 + Math.random() * 120000);
    
    // Check-in reminders
    const reminderInterval = setInterval(() => {
      if (streak === 0) {
        setBubble('Hình như hôm nay bạn chưa đánh dấu thói quen nào? Hãy bắt đầu thôi!');
      } else {
        setBubble(`Tuyệt vời! Bạn đang có chuỗi ${streak} ngày rèn luyện rồi.`);
      }
      setIsWaving(true);
      setTimeout(() => setBubble(null), 6000);
    }, 600000); // 10 minutes check

    // Initial hello
    setTimeout(() => {
      setBubble('Chào mừng bạn quay lại! Thú cưng đồng hành luôn bên cạnh bạn.');
      setIsWaving(true);
      setTimeout(() => {
        setBubble(null);
        setIsWaving(false);
      }, 5000);
    }, 2000);

    return () => {
      clearInterval(interval);
      clearInterval(reminderInterval);
    };
  }, [streak]);

  return (
    <div className="fixed bottom-6 right-6 z-[70] flex flex-col items-end gap-2 group">
      <AnimatePresence>
        {bubble && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="mb-2 p-3 bg-white text-slate-950 rounded-2xl border border-slate-200 shadow-2xl relative max-w-[200px]"
          >
            <p className="text-[11px] font-bold leading-relaxed">{bubble}</p>
            {/* Speech bubble tail */}
            <div className="absolute -bottom-1.5 right-6 w-3 h-3 bg-white border-b border-r border-slate-200 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.1 }}
        animate={isWaving ? { rotate: [0, -10, 10, -10, 0] } : {}}
        transition={{ repeat: isWaving ? Infinity : 0, duration: 2 }}
        className="relative cursor-pointer"
        onClick={() => {
           setBubble(PET_PHRASES[Math.floor(Math.random() * PET_PHRASES.length)]);
           setTimeout(() => setBubble(null), 4000);
        }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-amber-500/20 blur-xl rounded-full scale-150 animate-pulse" />
        
        <div className={`w-14 h-14 bg-gradient-to-tr ${pokeImg ? 'from-emerald-500 to-teal-400' : 'from-amber-500 to-yellow-400'} rounded-2xl flex items-center justify-center border-2 border-white/50 shadow-2xl relative overflow-hidden group-hover:shadow-indigo-500/50 transition-all`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,_rgba(255,255,255,0.4),_transparent)]" />
          {pokeImg ? (
            <img src={pokeImg} alt="Pokemon" className="w-10 h-10 object-contain relative z-10" />
          ) : (
            <Ghost className="text-slate-950" size={32} />
          )}
          
          {/* Eyes animation */}
          {!pokeImg && (
            <div className="absolute top-5 left-1/2 -translate-x-1/2 flex gap-3">
              <motion.div 
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }} 
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }} 
                className="w-1 h-1 bg-slate-950 rounded-full" 
              />
              <motion.div 
                animate={{ scaleY: [1, 1, 0.1, 1, 1] }} 
                transition={{ repeat: Infinity, duration: 4, times: [0, 0.9, 0.95, 1] }} 
                className="w-1 h-1 bg-slate-950 rounded-full" 
              />
            </div>
          )}
        </div>

        {/* Level badge */}
        <div className="absolute -top-1 -left-1 w-6 h-6 bg-slate-950 border border-slate-800 rounded-lg flex items-center justify-center text-[10px] font-black text-amber-500 shadow-xl">
           {Math.floor(xp / 100) + 1}
        </div>
      </motion.div>
    </div>
  );
};
