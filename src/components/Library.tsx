/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import React from 'react';
import { MosaicArchive } from '../types';
import { Calendar, ChevronRight } from 'lucide-react';

interface LibraryProps {
  archives: MosaicArchive[];
  onSelect: (archive: MosaicArchive) => void;
}

export const Library: React.FC<LibraryProps> = ({ archives, onSelect }) => {
  return (
    <div className="bg-slate-900/40 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-slate-800">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-serif italic text-white">Thư viện kỳ án</h2>
          <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mt-1">Những bức tranh đã được giải mã</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {archives.map((archive) => (
          <motion.div
            whileHover={{ y: -4, scale: 1.02 }}
            key={archive.id}
            onClick={() => onSelect(archive)}
            className="group relative h-56 bg-slate-950 rounded-2xl overflow-hidden cursor-pointer shadow-xl border border-slate-800"
          >
            <img
              src={archive.imageUrl}
              alt={`${archive.month} ${archive.year}`}
              className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-80 transition-all duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent opacity-90" />
            
            <div className="absolute bottom-0 left-0 p-6 space-y-2">
              <div className="flex items-center gap-2 text-amber-500/80 text-[10px] font-bold uppercase tracking-widest">
                <Calendar size={12} />
                <span>Tháng {archive.month}, {archive.year}</span>
              </div>
              <h3 className="text-white font-serif italic text-xl">
                Hoàn thành: {Math.round(archive.completionRate * 100)}%
              </h3>
            </div>

            <div className="absolute top-4 right-4 p-2 bg-white/5 backdrop-blur-md rounded-full text-white/40 group-hover:text-amber-500 group-hover:bg-amber-500/10 transition-all border border-white/5">
              <ChevronRight size={16} />
            </div>
          </motion.div>
        ))}

        {archives.length === 0 && (
          <div className="col-span-2 text-center py-24 bg-slate-950/50 rounded-2xl border-2 border-dashed border-slate-800 text-slate-600 font-medium italic">
            "Sương mù vẫn dày đặc, chưa có kỳ án nào được giải..."
          </div>
        )}
      </div>
    </div>
  );
};
