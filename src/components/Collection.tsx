import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Trophy, Star, Shield, Award, Zap, BookOpen, Layers, CheckCircle2, Lock, Gift, Ghost, MessageCircle } from 'lucide-react';
import { UserProfile, MosaicArchive, Ebook } from '../types';

interface CollectionProps {
  profile: UserProfile;
  archives: MosaicArchive[];
  ebooks: Ebook[];
  onUpdateProfile: (p: Partial<UserProfile>) => void;
}

export const Collection: React.FC<CollectionProps> = ({ profile, archives, ebooks, onUpdateProfile }) => {
  const unlockedEbooks = ebooks.filter(e => (e.unlockedChaptersCount || 0) > 0 || (e.unlockedPagesCount || 0) > 0);
  const unlockedBadgeIds = profile.unlockedBadgeIds || ['b1']; // Default first badge
  
  const badges = [
    // WEEKLY BADGES - Focus on short term consistency
    { id: 'w1', cycle: 'Tuần', name: 'Chiến Binh Thứ Hai', desc: 'Hoàn thành mọi mục tiêu vào ngày đầu tuần', icon: <Zap />, color: 'text-amber-500' },
    { id: 'w2', cycle: 'Tuần', name: 'Đội Trưởng Tuần', desc: 'Duy trì Streak 7 ngày liên tiếp', icon: <Star />, color: 'text-blue-400' },
    { id: 'w3', cycle: 'Tuần', name: 'Dọn Dẹp Cuối Tuần', desc: 'Hoàn thành 5 MicroGoals vào Thứ 7 & Chủ Nhật', icon: <CheckCircle2 />, color: 'text-emerald-400' },
    { id: 'w4', cycle: 'Tuần', name: 'Tương Tác Tuần', desc: 'Bình luận 5 lần trong các bài đăng cộng đồng', icon: <MessageCircle />, color: 'text-indigo-400' },
    
    // MONTHLY BADGES - Focus on long term growth
    { id: 'm1', cycle: 'Tháng', name: 'Kiến Trúc Sư Mosaic', desc: 'Hoàn thành 80% bức tranh Mosaic tháng', icon: <Layers />, color: 'text-rose-400' },
    { id: 'm2', cycle: 'Tháng', name: 'Nhà Thông Thái', desc: 'Mở khóa và đọc hoàn thành 1 cuốn sách trong tháng', icon: <BookOpen />, color: 'text-amber-400' },
    { id: 'm3', cycle: 'Tháng', name: 'Kỷ Luật Thép', desc: 'Duy trì Streak 30 ngày liên tục', icon: <Shield />, color: 'text-sky-400' },
    { id: 'm4', cycle: 'Tháng', name: 'Thợ Săn Pixel', desc: 'Thu thập được 50 Shining Pixels trong tháng', icon: <Sparkles />, color: 'text-emerald-500' },
    
    // MILESTONES - Legendary feats
    { id: 'l1', cycle: 'Huyền thoại', name: 'Bậc Thầy Kỷ Luật', desc: 'Đạt cấp độ 20 và 100 ngày Streak', icon: <Trophy />, color: 'text-amber-300 shadow-[0_0_15px_rgba(252,211,77,0.4)]' },
    { id: 'l2', cycle: 'Huyền thoại', name: 'Triệu Phú Tri Thức', desc: 'Đọc toàn bộ sách trong thư viện hiện có', icon: <Award />, color: 'text-purple-400 shadow-[0_0_15px_rgba(192,132,252,0.4)]' },
  ];

  const totalUnlocked = unlockedBadgeIds.length;
  const progress = (totalUnlocked / badges.length) * 100;
  
  const getRank = () => {
    if (totalUnlocked >= 10) return { title: 'Grand Master', color: 'text-rose-400', bg: 'bg-rose-500/20' };
    if (totalUnlocked >= 7) return { title: 'Bậc Thầy', color: 'text-amber-400', bg: 'bg-amber-500/20' };
    if (totalUnlocked >= 4) return { title: 'Chuyên Gia', color: 'text-slate-300', bg: 'bg-slate-500/20' };
    if (totalUnlocked >= 2) return { title: 'Tập Sự', color: 'text-amber-700', bg: 'bg-amber-800/20' };
    return { title: 'Tân Thủ', color: 'text-slate-500', bg: 'bg-slate-800/20' };
  };

  const rank = getRank();

  const [pokemonSpirits, setPokemonSpirits] = React.useState<any[]>([]);
  const [loadingPokemon, setLoadingPokemon] = React.useState(true);

  // Combine default 8 and caught pokemons
  React.useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=8&offset=0');
        const data = await response.json();
        
        const detailedPokemon = await Promise.all(
          data.results.map(async (p: any, idx: number) => {
            const res = await fetch(p.url);
            const details = await res.json();
            return {
              id: `poke-${details.id}`,
              name: details.name.charAt(0).toUpperCase() + details.name.slice(1),
              image: details.sprites.other['official-artwork'].front_default || details.sprites.front_default,
              unlocked: (profile.unlockedSpiritIds || []).includes(`poke-${details.id}`)
            };
          })
        );
        
        // Add user caught pokemons that are outside the first 8
        const userCaught = (profile.pokemons || []).map(p => ({
          id: `poke-${p.id}`,
          name: p.name.charAt(0).toUpperCase() + p.name.slice(1),
          image: p.sprite,
          unlocked: true
        })).filter(uc => !detailedPokemon.find(dp => dp.id === uc.id));

        const combined = [...detailedPokemon, ...userCaught];

        // Ensure Bulbasaur (id 1) is unlocked by default if none are unlocked
        const finalPokemon = combined.map((p, idx) => {
          if (idx === 0 && (!profile.unlockedSpiritIds || profile.unlockedSpiritIds.length === 0)) {
             return { ...p, unlocked: true };
          }
          return p;
        });
        setPokemonSpirits(finalPokemon);
      } catch (error) {
        console.error("Failed to fetch pokemon:", error);
      } finally {
        setLoadingPokemon(false);
      }
    };

    fetchPokemon();
  }, [profile.unlockedSpiritIds, profile.pokemons, profile.shiningPixels]);

  const handleSetActive = (spiritId: string) => {
    onUpdateProfile({ activeSpiritId: spiritId });
  };

  const handleGacha = () => {
    if (profile.shiningPixels < 20) {
      alert("Bạn cần ít nhất 20 Shining Pixels để thu phục tinh linh hiếm!");
      return;
    }

    const lockedSpirits = pokemonSpirits.filter(s => !s.unlocked);
    if (lockedSpirits.length === 0) {
      alert("Bạn đã thu thập đủ tất cả tinh linh hiện có!");
      return;
    }

    const luckySpirit = lockedSpirits[Math.floor(Math.random() * lockedSpirits.length)];
    const newUnlocked = [...(profile.unlockedSpiritIds || []), luckySpirit.id];
    
    onUpdateProfile({ 
      shiningPixels: profile.shiningPixels - 20,
      unlockedSpiritIds: newUnlocked
    });

    setPokemonSpirits(prev => prev.map(s => s.id === luckySpirit.id ? { ...s, unlocked: true } : s));
    alert(`Chúc mừng! Bạn đã thu phục được ${luckySpirit.name}!`);
  };

  return (
    <div className="w-full space-y-10 pb-20 bg-slate-950 min-h-screen p-6 rounded-3xl overflow-hidden">
      {/* Header Info */}
      <header className="flex flex-col gap-8 border-b-2 border-slate-900 pb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
               <Trophy className="text-amber-400" size={32} />
               Bộ sưu tập
            </h1>
            <p className="text-slate-400 font-medium mt-2">Dấu ấn kỷ luật và thành quả nỗ lực của bạn.</p>
          </div>

          <div className="flex flex-col items-end gap-3">
            {totalUnlocked === badges.length && (
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-amber-500/20 border-2 border-amber-500/30 px-6 py-2 rounded-2xl flex items-center gap-3 mb-2 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
              >
                <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center animate-pulse">
                  <Trophy size={16} className="text-slate-900" />
                </div>
                <span className="text-xs font-black text-amber-500 uppercase tracking-widest">Bậc Thầy Kỷ Luật Tối Thượng</span>
              </motion.div>
            )}
            <div className={`px-6 py-2 rounded-2xl border-2 border-white/5 flex items-center gap-3 ${rank.bg}`}>
               <span className="text-[10px] font-black text-white/40 uppercase tracking-widest">Hạng sưu tầm:</span>
               <span className={`text-xl font-black uppercase italic ${rank.color}`}>{rank.title}</span>
            </div>
            <div className="flex items-center gap-3">
               <div className="w-48 h-2 bg-slate-900 rounded-full overflow-hidden border border-white/5">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    className={`h-full ${rank.color.replace('text', 'bg')}`} 
                  />
               </div>
               <span className="text-xs font-black text-slate-500 uppercase">{totalUnlocked}/{badges.length}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Badges Section */}
      <section>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10">
          <div className="flex items-center gap-3">
             <Award className="text-amber-500" size={24} />
             <h2 className="text-2xl font-black text-slate-200 uppercase tracking-tight">HUY HIỆU THÀNH TỰU</h2>
          </div>
          
          <div className="flex gap-2">
            {['Tuần', 'Tháng', 'Huyền thoại'].map(t => (
              <div key={t} className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter border ${
                t === 'Tuần' ? 'border-amber-900 text-amber-700' :
                t === 'Tháng' ? 'border-slate-700 text-slate-500' :
                'border-rose-500 text-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
              }`}>
                {t}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {badges.map((badge) => {
            const isUnlocked = unlockedBadgeIds.includes(badge.id);
            return (
              <motion.div 
                key={badge.id}
                whileHover={{ y: isUnlocked ? -5 : 0 }}
                className={`relative group p-6 rounded-[28px] border-2 transition-all overflow-hidden ${
                  isUnlocked 
                    ? 'bg-slate-900 border-slate-800 shadow-xl' 
                    : 'bg-slate-950 border-slate-900 opacity-30 grayscale'
                }`}
              >
                {/* Background Glow */}
                {isUnlocked && (
                   <div className={`absolute -top-10 -right-10 w-32 h-32 blur-[60px] opacity-20 ${badge.color.replace('text', 'bg')}`} />
                )}

                <div className="relative z-10 flex flex-col items-center text-center">
                  <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center mb-6 shadow-inner border-2 ${
                    isUnlocked ? 'bg-white border-white/10' : 'bg-slate-800 border-slate-700'
                  }`}>
                    {React.cloneElement(badge.icon as React.ReactElement, { 
                      size: 32, 
                      className: isUnlocked ? "text-slate-900" : "text-slate-600" 
                    })}
                  </div>
                  
                  <h3 className={`text-xl font-bold uppercase tracking-tight mb-2 ${isUnlocked ? 'text-white' : 'text-slate-700'}`}>
                    {badge.name}
                  </h3>
                  <p className="text-xs font-medium text-slate-500 max-w-[180px] leading-relaxed">
                    {badge.desc}
                  </p>

                  {!isUnlocked && (
                    <div className="mt-4 flex items-center gap-1">
                      <Lock size={12} className="text-slate-700" />
                      <span className="text-[10px] font-bold text-slate-700 uppercase tracking-widest underline decoration-dotted">Chưa đạt được</span>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Rewards Catalog - Replaces Pet Garden */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
         <section>
            <div className="flex items-center gap-3 mb-8">
               <Gift className="text-rose-500" size={24} />
               <h2 className="text-2xl font-black text-slate-200 uppercase tracking-tight">TINH LINH ĐỒNG HÀNH (POKÉMON)</h2>
            </div>

            <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
               <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-[28px] p-6 mb-6">
                  <div className="flex items-center gap-3 mb-2">
                     <Sparkles size={18} className="text-amber-500" />
                     <h4 className="text-sm font-black text-white uppercase italic">Cách để nhận Pokémon</h4>
                  </div>
                  <ul className="space-y-2">
                     <li className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full" />
                        Hoàn thành habit hàng ngày có tỉ lệ rơi ngẫu nhiên.
                     </li>
                     <li className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full" />
                        Lên cấp độ mới có tỉ lệ nhận được quà tinh linh.
                     </li>
                     <li className="text-[10px] text-slate-400 font-medium flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber-500 rounded-full" />
                        Sử dụng 20 Shining Pixels để thu phục ngay lập tức.
                     </li>
                  </ul>
               </div>

               {loadingPokemon ? (
                 <div className="flex items-center justify-center py-20">
                    <Sparkles className="text-amber-500 animate-spin" />
                 </div>
               ) : pokemonSpirits.map((spirit) => {
                 const isActive = profile.activeSpiritId === spirit.id;
                 return (
                 <div 
                  key={spirit.id} 
                  onClick={() => spirit.unlocked && handleSetActive(spirit.id)}
                  className={`bg-slate-900/50 border-2 rounded-[28px] p-4 flex items-center gap-5 group cursor-pointer transition-all ${
                    isActive ? 'border-emerald-500 bg-emerald-500/5' : 'border-slate-800 hover:border-slate-700'
                  }`}
                 >
                    <div className={`w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center border-2 border-slate-700 relative overflow-hidden shadow-lg ${!spirit.unlocked && 'grayscale opacity-50'}`}>
                       <div className="absolute top-1 left-1 bg-slate-950 text-amber-500 text-[8px] font-black px-1.5 py-0.5 rounded-md flex items-center justify-center z-10">
                          {spirit.xp} XP
                       </div>
                       <img src={spirit.image} alt={spirit.name} className="w-12 h-12 relative z-0 object-contain" />
                       <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    
                    <div className="flex-1">
                       <h4 className={`text-white font-black uppercase text-lg ${!spirit.unlocked && 'text-slate-600'}`}>{spirit.name}</h4>
                       <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Level {spirit.level} Pokémon Spirit</p>
                    </div>

                    {!spirit.unlocked ? (
                      <div className="px-4 py-2 bg-slate-950 border-2 border-slate-800 rounded-xl text-slate-700 text-[10px] font-black uppercase">
                        KHÓA
                      </div>
                    ) : (
                      <div className={`px-4 py-2 border-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                        isActive ? 'bg-emerald-500 border-emerald-400 text-slate-950' : 'bg-slate-950 border-slate-800 text-emerald-400'
                      }`}>
                        {isActive ? 'ACTIVE' : 'SELECT'}
                      </div>
                    )}
                 </div>
               )})}

               <button 
                  onClick={handleGacha}
                  className="w-full py-5 bg-white text-slate-900 rounded-[24px] font-black uppercase text-sm shadow-[0_10px_30px_rgba(255,255,255,0.1)] hover:scale-[1.02] active:scale-95 transition-all mt-4 border-2 border-white disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={profile.shiningPixels < 20}
               >
                  Thu phục tinh linh hiếm (20 SP)
               </button>
            </div>
         </section>

         <section className="bg-indigo-600/10 border-2 border-indigo-500/20 rounded-[40px] p-10 flex flex-col items-center text-center justify-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 blur-[100px] -mr-32 -mt-32" />
            
            <div className="w-24 h-24 bg-indigo-500/20 rounded-full flex items-center justify-center mb-6 border-2 border-indigo-500/30">
               <Layers size={40} className="text-indigo-400" />
            </div>
            
            <h3 className="text-2xl font-black text-white uppercase mb-4">Kho lưu trữ Mosaic</h3>
            <p className="text-slate-400 text-sm font-medium max-w-[300px] mb-8 leading-relaxed">
               Nơi lưu giữ toàn bộ các bức tranh Mosaic tháng trước đã hoàn thành. Hãy biến sự nỗ lực thành di sản.
            </p>

            <div className="flex -space-x-4">
               {archives.slice(0, 3).map((a, i) => (
                 <div key={i} className="w-16 h-16 rounded-2xl border-4 border-slate-950 bg-slate-900 overflow-hidden shadow-2xl">
                    <img src={a.imageUrl} className="w-full h-full object-cover grayscale opacity-50" />
                 </div>
               ))}
               <div className="w-16 h-16 rounded-2xl border-4 border-slate-950 bg-slate-800 flex items-center justify-center text-white font-black text-sm z-10 shadow-2xl">
                  +{Math.max(0, archives.length - 3)}
               </div>
            </div>

            <button className="mt-10 text-indigo-400 font-black uppercase text-xs tracking-widest hover:text-indigo-300 transition-colors">
               Xem toàn bộ lịch sử
            </button>
         </section>
      </div>
    </div>
  );
};
