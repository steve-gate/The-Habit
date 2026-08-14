import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Trophy, MessageSquare, Zap, Gift, Coins, X } from 'lucide-react';
import { VariableReward } from '../types';

interface VariableRewardOverlayProps {
  reward: VariableReward | null;
  onClose: () => void;
}

const SLOT_ICONS = [
  <Zap className="text-blue-500 fill-blue-500 w-12 h-12" />,
  <Sparkles className="text-amber-500 w-12 h-12" />,
  <MessageSquare className="text-rose-500 w-12 h-12" />,
  <Coins className="text-yellow-400 w-12 h-12 fill-yellow-400" />,
  <Gift className="text-indigo-400 w-12 h-12" />,
  <Trophy className="text-emerald-500 w-12 h-12" />
];

const SLOT_ITEM_HEIGHT = 100; // px

export const VariableRewardOverlay: React.FC<VariableRewardOverlayProps> = ({ reward, onClose }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [results, setResults] = useState([0, 0, 0]); // Indices of SLOT_ICONS

  const dynamicIcons = [
    ...SLOT_ICONS,
    reward?.type === 'pokemon' 
      ? <img src={reward.value.sprite} className="w-16 h-16 object-contain drop-shadow-md" alt="pokemon" key="poke" /> 
      : null
  ].filter(Boolean);

  useEffect(() => {
    if (reward) {
      setIsSpinning(false);
      setShowResult(false);
      setHasStarted(false);
    }
  }, [reward]);

  const handleSpin = () => {
    if (hasStarted) return;
    setHasStarted(true);
    setIsSpinning(true);
    
    let targetIndex = 0;
    if (reward?.type === 'shining_pixel') targetIndex = 1;
    else if (reward?.type === 'cheeky_praise') targetIndex = 2;
    else if (reward?.type === 'pokemon') targetIndex = dynamicIcons.length - 1;
    else targetIndex = 0;
    
    setTimeout(() => {
      setResults([targetIndex, targetIndex, targetIndex]);
      setIsSpinning(false);
      setShowResult(true);
    }, 2000); // 2 seconds spin

    // Auto close
    setTimeout(() => {
      if (document.getElementById('slot-overlay')) {
        onClose();
      }
    }, 7000);
  };

  if (!reward) return null;

  return (
    <AnimatePresence>
      <motion.div
        id="slot-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ scale: 0.8, y: 50 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.8, y: 50 }}
          className="bg-red-700 border-4 border-yellow-500 w-full max-w-md rounded-3xl p-6 shadow-[0_0_50px_rgba(239,68,68,0.4)] relative overflow-hidden"
        >
          {/* Light bulbs around the border */}
          <div className="absolute inset-2 border-2 border-dashed border-yellow-400 rounded-2xl opacity-50" />
          
          {/* Machine Header */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/40 to-transparent pointer-events-none" />
          
          <div className="flex justify-between items-center mb-6 relative z-10">
            <div className="flex items-center gap-3 bg-red-900 border-2 border-yellow-500 rounded-xl px-4 py-2 shadow-inner">
              <Sparkles className="text-yellow-400 animate-pulse" size={24} /> 
              <h3 className="text-xl font-black text-white uppercase tracking-widest text-shadow-sm">
                JACKPOT SLOT
              </h3>
              <Sparkles className="text-yellow-400 animate-pulse" size={24} /> 
            </div>
            {showResult && (
              <button 
                onClick={onClose}
                className="p-2 bg-black/40 text-slate-300 hover:text-white rounded-full transition-colors backdrop-blur-sm ml-2"
              >
                <X size={20} />
              </button>
            )}
          </div>

          {/* Slot Machine Display */}
          <div className="bg-slate-800 border-[6px] border-slate-900 rounded-xl p-3 shadow-inner mb-6 relative z-10">
            <div className="flex justify-between items-center bg-white rounded-lg overflow-hidden relative h-[100px] shadow-inner divide-x-4 divide-slate-300">
              {/* Highlight bar */}
              <div className="absolute top-1/2 left-0 w-full h-1 bg-red-500/20 -translate-y-1/2 z-0" />
              
              {/* 3 Reels */}
              {[0, 1, 2].map((reelIndex) => (
                <div key={reelIndex} className="w-1/3 flex justify-center relative z-10 overflow-hidden h-full bg-gradient-to-b from-slate-200 via-white to-slate-200">
                  <motion.div
                    className="flex flex-col gap-0"
                    initial={{ y: 0 }}
                    animate={
                      isSpinning 
                        ? { y: [-(SLOT_ITEM_HEIGHT) * dynamicIcons.length, 0] } 
                        : { y: -results[reelIndex] * SLOT_ITEM_HEIGHT } // Final position
                    }
                    transition={
                      isSpinning
                        ? { 
                            repeat: Infinity, 
                            duration: 0.2 + (reelIndex * 0.1), // slightly different speeds 
                            ease: "linear" 
                          }
                        : { type: "spring", stiffness: 80, damping: 15 }
                    }
                  >
                    {isSpinning ? (
                      <>
                        {dynamicIcons.map((icon, i) => (
                          <div key={`roll-1-${i}`} className="h-[100px] flex items-center justify-center shrink-0">
                            {icon}
                          </div>
                        ))}
                        {dynamicIcons.map((icon, i) => (
                          <div key={`roll-2-${i}`} className="h-[100px] flex items-center justify-center shrink-0">
                            {icon}
                          </div>
                        ))}
                      </>
                    ) : (
                      dynamicIcons.map((icon, i) => (
                        <div key={`fixed-${i}`} className="h-[100px] flex items-center justify-center shrink-0 transition-transform duration-300 hover:scale-110">
                          {icon}
                        </div>
                      ))
                    )}
                  </motion.div>
                </div>
              ))}
            </div>
          </div>

          {/* Result Area */}
          <div className="text-center min-h-[110px] relative z-10 bg-black/40 border-2 border-red-900 rounded-xl p-4 flex items-center justify-center">
            <AnimatePresence mode="wait">
              {!hasStarted ? (
                <motion.div
                  key="start"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                >
                  <button
                    onClick={handleSpin}
                    className="px-8 py-3 bg-gradient-to-b from-yellow-400 to-yellow-600 text-red-900 rounded-full font-black text-2xl uppercase tracking-widest shadow-[0_0_20px_rgba(234,179,8,0.6)] hover:scale-105 transition-all w-full border-4 border-yellow-200"
                  >
                    THỬ VẬN MAY!
                  </button>
                </motion.div>
              ) : isSpinning ? (
                <motion.div
                  key="spinning"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center h-full space-y-2"
                >
                  <p className="text-xl font-black text-yellow-400 uppercase tracking-widest animate-pulse">
                    ĐANG QUAY SỐ...
                  </p>
                </motion.div>
              ) : showResult ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="flex flex-col items-center justify-center space-y-2"
                >
                  <p className="text-xs font-black tracking-[0.2em] uppercase text-yellow-400 drop-shadow-md">
                    {reward.type === 'shining_pixel' ? 'TRÚNG LỚN: MẢNH GHÉP HIẾM!' : 
                     reward.type === 'cheeky_praise' ? 'JACKPOT: LỜI KHÊN TỪ MENTOR!' : 
                     reward.type === 'pokemon' ? 'XUẤT SẮC: BẠN BẮT ĐƯỢC POKÉMON!' : 
                     'THƯỞNG NGỌT NGÀO!'}
                  </p>
                  <h4 className="text-md font-black text-white leading-tight drop-shadow-md">
                    {reward.message}
                  </h4>
                  <motion.div
                    animate={{ scale: [1, 1.05, 1], rotate: [0, -2, 2, 0] }}
                    transition={{ duration: 1, repeat: Infinity }}
                    className="inline-block mt-2 px-6 py-2 bg-yellow-500 text-red-900 rounded-full text-xs font-black uppercase tracking-widest shadow-[0_0_15px_rgba(234,179,8,0.5)]"
                  >
                    Dopamine +99%
                  </motion.div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
