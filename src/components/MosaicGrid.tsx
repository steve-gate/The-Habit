/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import React from 'react';

interface MosaicGridProps {
  daysInMonth: number;
  completedDays: number[];
  currentDate: number;
  streak: number;
  imageUrl: string;
}

export const MosaicGrid: React.FC<MosaicGridProps> = ({
  daysInMonth,
  completedDays,
  currentDate,
  streak,
  imageUrl,
}) => {
  // Calculate grid dimensions (e.g., 7 columns for a week-based view, but let's go with a balanced grid for monthly)
  const columns = 7;
  const rows = Math.ceil(daysInMonth / columns);

  return (
    <div className="relative w-full max-w-2xl mx-auto aspect-square bg-slate-900/50 rounded-2xl overflow-hidden shadow-2xl border border-slate-800 backdrop-blur-sm">
      {/* Background Image (the full mosaic) */}
      <div 
        className="absolute inset-0 grayscale transition-all duration-1000"
        style={{ 
          backgroundImage: `url(${imageUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          filter: completedDays.length / daysInMonth > 0.5 ? 'grayscale(0)' : 'grayscale(1)',
          opacity: 0.1
        }}
      />

      <div 
        className="grid gap-2 p-4 w-full h-full"
        style={{ 
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`
        }}
      >
        {Array.from({ length: daysInMonth }).map((_, i) => {
          const day = i + 1;
          const isCompleted = completedDays.includes(day);
          const isPast = day < currentDate;
          const isDusty = isPast && !isCompleted;
          const isSparkling = isCompleted && streak >= 7;

          return (
            <motion.div
              key={day}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.01 }}
              className={`relative overflow-hidden rounded-md border transition-all duration-500 ${
                isCompleted 
                  ? 'border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)] hover:scale-105 hover:z-10' 
                  : (isDusty 
                      ? 'border-red-900/40 bg-slate-950 shadow-[inset_0_0_10px_rgba(239,68,68,0.1)]' 
                      : (isPast ? 'border-slate-800 opacity-40' : 'border-slate-800 opacity-60'))
              }`}
              style={{
                backgroundImage: isCompleted ? `url(${imageUrl})` : 'none',
                backgroundSize: `${columns * 100}% ${rows * 100}%`,
                backgroundPosition: `${(i % columns) * (100 / (columns - 1))}% ${Math.floor(i / columns) * (100 / (rows - 1))}%`,
                backgroundColor: isCompleted ? 'transparent' : (isDusty ? 'rgba(24, 15, 15, 0.9)' : 'rgba(15, 23, 42, 0.5)'),
              }}
            >
              {/* Overlay for uncompleted days */}
              {!isCompleted && (
                <div className={`absolute inset-0 flex flex-col items-center justify-center text-[10px] font-mono font-bold ${isDusty ? 'text-red-700/80' : 'text-slate-700'}`}>
                  <span>{day}</span>
                  {isDusty && (
                    <span className="text-[7px] text-red-500/50 mt-0.5 tracking-tighter">BỤI</span>
                  )}
                </div>
              )}

              {/* Diagonal crack line for dusty days */}
              {isDusty && (
                <div className="absolute inset-0 pointer-events-none opacity-40 flex items-center justify-center">
                  <div className="w-[120%] h-[1px] bg-red-800/40 rotate-45 absolute" />
                  <div className="w-[120%] h-[1px] bg-red-800/40 -rotate-45 absolute" />
                </div>
              )}

              {/* Sparkle effect */}
              {isSparkling && (
                <motion.div
                  animate={{ opacity: [0, 0.4, 0], scale: [1, 1.5, 1] }}
                  transition={{ repeat: Infinity, duration: 2 + Math.random() }}
                  className="absolute inset-0 bg-gradient-to-tr from-amber-400/30 to-white/20 pointer-events-none"
                />
              )}

              {/* Reveal animation overlay */}
              {isCompleted && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.8 }}
                  className="absolute inset-0 bg-white/20 z-10 pointer-events-none"
                />
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
