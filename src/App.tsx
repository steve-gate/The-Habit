/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RefreshCw, Sparkles, ListTodo, Library as LibraryIcon, Trophy, Share2, Bell, Upload, BookOpen, Edit3, Users, Clover, Gift, Award, X, Footprints } from 'lucide-react';
import { MosaicGrid } from './components/MosaicGrid';
import { HabitManager } from './components/HabitManager';
import { Library } from './components/Library';
import { EbookReader, DEFAULT_EBOOKS } from './components/EbookReader';
import { Companion } from './components/Companion';
import { GhostNotifications } from './components/GhostNotifications';
import { Leaderboard } from './components/Leaderboard';
import { CommunityWorld } from './components/CommunityWorld';
import { LegendaryRivalry } from './components/LegendaryRivalry';
import { RewardWorld } from './components/RewardWorld';
import { RewardRouteHost } from './components/RewardRouteHost';
import { CuriosityRewardWatcher } from './components/CuriosityRewardWatcher';
import { GoalSMARTER } from './components/GoalSMARTER';
import { GoalOKR } from './components/GoalOKR';
import { DailyMission } from './components/DailyMission';
import { MicroGoals } from './components/MicroGoals';
import { MentorInsights } from './components/MentorInsights';
import { Collection } from './components/Collection';
import { VariableRewardOverlay } from './components/VariableRewardOverlay';
import { Habit, DailyLog, UserProfile, MosaicArchive, Ebook, SocialPost, SocialComment, VirtualDuel as VirtualDuelType, DuelObjective, DailyMicroGoal, VariableReward } from './types';
import { VIRTUAL_MENTORS, VIRTUAL_PEERS } from './lib/personas';

// Constants
const ALL_PERSONAS = [...VIRTUAL_MENTORS, ...VIRTUAL_PEERS];

// Desktop V10 transport: AI calls use Electron IPC, so no localhost server or TCP port is needed.
const desktopAwareFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const route = typeof input === 'string' ? input : '';
  const bridge = (window as any).habitMosaicDesktop;
  if (route.startsWith('/api/') && bridge?.requestApi) {
    let body: any = {};
    if (typeof init?.body === 'string' && init.body) {
      try { body = JSON.parse(init.body); } catch { body = {}; }
    }
    const result = await bridge.requestApi(route, body);
    return new Response(JSON.stringify(result?.body ?? {}), {
      status: Number(result?.status || 500),
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return fetch(input, init);
};


// Asset paths for our generated mosaics
const SHERLOCK_IMG = new URL("./assets/images/sherlock_mosaic_base_1780880322356.png", import.meta.url).href;
const WUXIA_IMG = new URL("./assets/images/wuxia_mosaic_base_1780880338754.png", import.meta.url).href;

// Helper to ensure unique IDs from potentially corrupted localStorage
const ensureUniqueIds = <T extends { id: string }>(list: T[]): T[] => {
  const seen = new Set<string>();
  return list.map((item, idx) => {
    let newId = item.id;
    if (seen.has(newId)) {
      newId = `${newId}-${idx}-${Math.random().toString(36).substring(2, 5)}`;
    }
    seen.add(newId);
    return { ...item, id: newId };
  });
};

const App: React.FC = () => {
  // V21_SINGLE_SOCIAL_ENGINE: CommunityWorld/Living Society is the only NPC social engine.
  // Keep the legacy random post/comment loop disabled unless explicitly forcing legacy mode for debugging.
  if (localStorage.getItem('habit_mosaic_v21_social_engine') !== '0') {
    localStorage.setItem('habit_mosaic_v11_community_engine', '1');
  }

  if (!localStorage.getItem('habit_mosaic_v20_5_runtime_repair')) {
    const oldTab = localStorage.getItem('habit_mosaic_active_tab');
    if (oldTab === 'collection') localStorage.setItem('habit_mosaic_active_tab', 'artGallery');
    localStorage.setItem('habit_mosaic_v20_5_runtime_repair', '1');
  }

  if (!localStorage.getItem('habit_mosaic_v20_goal_link_migrated')) {
    const oldTab = localStorage.getItem('habit_mosaic_active_tab');
    if (oldTab === 'library' || oldTab === 'ebook' || oldTab === 'goals') localStorage.setItem('habit_mosaic_active_tab', 'mosaic');
    localStorage.setItem('habit_mosaic_v11_community_engine', '1');
    localStorage.setItem('habit_mosaic_v20_goal_link_migrated', '1');
  }

  if (!localStorage.getItem('habit_mosaic_v18_core_ux_migrated')) {
    localStorage.setItem('habit_mosaic_v11_community_engine', '1');
    localStorage.setItem('habit_mosaic_v18_core_ux_migrated', '1');
  }

  if (!localStorage.getItem('habit_mosaic_v17_repair_migrated')) {
    localStorage.setItem('habit_mosaic_v11_community_engine', '1');
    localStorage.setItem('habit_mosaic_v17_repair_migrated', '1');
  }

  if (!localStorage.getItem('habit_mosaic_v16_goal_reward_world_migrated')) {
    localStorage.setItem('habit_mosaic_v11_community_engine', '1');
    localStorage.setItem('habit_mosaic_v16_goal_reward_world_migrated', '1');
  }

  if (!localStorage.getItem('habit_mosaic_v15_comedy_chemistry_migrated')) {
    localStorage.setItem('habit_mosaic_v15_comedy_chemistry_migrated', '1');
  }

  if (!localStorage.getItem('habit_mosaic_v14_anti_repeat_migrated')) {
    localStorage.setItem('habit_mosaic_v14_anti_repeat_migrated', '1');
  }

  if (!localStorage.getItem('habit_mosaic_v13_offline_social_migrated')) {
    localStorage.setItem('habit_mosaic_v13_offline_social_migrated', '1');
  }

  // V12 migration: preserve logs/data, retire random duel/feed engines.
  if (!localStorage.getItem('habit_mosaic_v12_migrated')) {
    localStorage.removeItem('habit_mosaic_active_duel');
    localStorage.setItem('habit_mosaic_v11_community_engine', '1');
    localStorage.setItem('habit_mosaic_v12_migrated', '1');
  }

  // V11 migration: old random-per-minute duel is retired in favor of habit-derived Best-of-7 rivalry.
  if (!localStorage.getItem('habit_mosaic_v11_rivalry_migrated')) {
    localStorage.removeItem('habit_mosaic_active_duel');
    localStorage.setItem('habit_mosaic_v11_rivalry_migrated', '1');
    localStorage.setItem('habit_mosaic_v11_community_engine', '1');
  }

  const [currentDate, setCurrentDate] = useState(new Date().toISOString().split('T')[0]);
  const todayStr = currentDate;

  // Heartbeat to detect day change
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date().toISOString().split('T')[0];
      if (now !== currentDate) {
        console.log("New day detected! Refreshing state...");
        setCurrentDate(now);
        // Explicitly clear any "completed" habits for visual feedback
        setLogs(prev => {
           const existingToday = prev.find(l => l.date === now);
           if (!existingToday) {
             return [...prev, { date: now, completedHabitIds: [] }];
           }
           return prev;
        });
        setUnlockMessage(`Chào buổi sáng! Ngày mới ${now} đã bắt đầu. Chuẩn bị "cày" thôi cưng!`);
      }
    }, 30000); // Check every 30 seconds for snappier update
    return () => clearInterval(interval);
  }, [currentDate]);
  const [activeTab, setActiveTab] = useState<'mosaic' | 'habits' | 'community' | 'smarter' | 'okr' | 'artGallery' | 'curiosity' | 'goalShop' | 'collection'>(() => {
    return (localStorage.getItem('habit_mosaic_active_tab') as any) || 'mosaic';
  });

  useEffect(() => {
    localStorage.setItem('habit_mosaic_active_tab', activeTab);
  }, [activeTab]);
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('habit_mosaic_profile');
    const base = saved ? JSON.parse(saved) : {
      uid: 'local-user',
      displayName: 'Nhà khai mở tri thức',
      currentStreak: 0,
      longestStreak: 0,
      xp: 0,
      shiningPixels: 0,
      unlockedBadgeIds: ['b1'],
      unlockedSpiritIds: ['poke-1'],
      activeSpiritId: 'poke-1'
    };
    // Initialize level if missing
    if (base.level === undefined) {
      base.level = Math.floor(base.xp / 1000) + 1;
    }
    if (base.shiningPixels === undefined) base.shiningPixels = 0;
    if (!base.unlockedBadgeIds) base.unlockedBadgeIds = ['b1'];
    if (!base.unlockedSpiritIds || base.unlockedSpiritIds.length === 0) base.unlockedSpiritIds = ['poke-1'];
    if (!base.activeSpiritId) base.activeSpiritId = 'poke-1';
    return base;
  });
  const [currentTheme, setCurrentTheme] = useState<'sherlock' | 'wuxia' | 'custom'>(() => {
    return (localStorage.getItem('habit_mosaic_theme') as any) || 'sherlock';
  });
  const [customImage, setCustomImage] = useState<string | null>(() => {
    return localStorage.getItem('habit_mosaic_custom_image');
  });
  const [customTitle, setCustomTitle] = useState<string>(() => {
    return localStorage.getItem('habit_mosaic_custom_title') || 'Cuốn sách vĩ đại của tôi';
  });
  const [isEditingTitle, setIsEditingTitle] = useState(false);

  const [habits, setHabits] = useState<Habit[]>(() => {
    const saved = localStorage.getItem('habit_mosaic_habits');
    const list = saved ? JSON.parse(saved) : [
      { id: '1', userId: 'local-user', title: 'Thiền định buổi sáng', frequency: 'daily', createdAt: new Date().toISOString() },
      { id: '2', userId: 'local-user', title: 'Uống 2L nước', frequency: 'daily', createdAt: new Date().toISOString() },
    ];
    return ensureUniqueIds(list);
  });

  const [logs, setLogs] = useState<DailyLog[]>(() => {
    const saved = localStorage.getItem('habit_mosaic_logs');
    try {
      return ensureUniqueIds(saved ? JSON.parse(saved) : []);
    } catch { return []; }
  });

  const [archives, setArchives] = useState<MosaicArchive[]>(() => {
    const saved = localStorage.getItem('habit_mosaic_archives');
    try {
      return ensureUniqueIds(saved ? JSON.parse(saved) : []);
    } catch { return []; }
  });
  const [aiReminder, setAiReminder] = useState<string>("Đang chờ sư phụ 'phun' châu nhả ngọc... Chờ tí nha cưng!");
  const [sideQuest, setSideQuest] = useState<{ text: string, completed: boolean }>(() => {
    const saved = localStorage.getItem('habit_mosaic_side_quest');
    return saved ? JSON.parse(saved) : { text: 'Đang đi hóng hớt xem có gì hay cho bạn làm...', completed: false };
  });
  const [unlockedStory, setUnlockedStory] = useState<{ [key: string]: string }>(() => {
    const saved = localStorage.getItem('habit_mosaic_story');
    return saved ? JSON.parse(saved) : {};
  });

  const [ebooks, setEbooks] = useState<Ebook[]>(() => {
    const saved = localStorage.getItem('habit_mosaic_ebooks');
    try {
      return ensureUniqueIds(saved ? JSON.parse(saved) : DEFAULT_EBOOKS);
    } catch { return ensureUniqueIds(DEFAULT_EBOOKS); }
  });

  const [unlockMessage, setUnlockMessage] = useState<string | null>(null);
  const [activeReward, setActiveReward] = useState<VariableReward | null>(null);
  const [activeDuel, setActiveDuel] = useState<VirtualDuelType | null>(() => {
    const saved = localStorage.getItem('habit_mosaic_active_duel');
    if (!saved) return null;
    try {
      const parsed = JSON.parse(saved);
        if (parsed && Array.isArray(parsed.objectives)) {
          // Status migration
          if (!parsed.status) parsed.status = 'active';

          // Migration: ensure objectives have a type and valid numbers
          const sanitizedObjectives = parsed.objectives.map((obj: any) => {
            let updatedObj = { ...obj };
            const title = (obj.title || '').toLowerCase();
            
            if (!updatedObj.type) {
              if (title.includes('thói quen')) updatedObj.type = 'habit_count';
              else if (title.includes('sách') || title.includes('trang')) updatedObj.type = 'reading_pages';
              else if (title.includes('xp')) updatedObj.type = 'xp_gain';
              else updatedObj.type = 'habit_count';
            }
            
            // Strictly enforce numbers
            updatedObj.current = Number(updatedObj.current);
            if (isNaN(updatedObj.current)) updatedObj.current = 0;
            
            updatedObj.target = Number(updatedObj.target);
            if (isNaN(updatedObj.target) || updatedObj.target <= 0) {
              updatedObj.target = title.includes('xp') ? 1000 : title.includes('sách') ? 30 : 21;
            }
            
            return updatedObj;
          });

          return {
            ...parsed,
            objectives: ensureUniqueIds(sanitizedObjectives)
          };
        }
      return null;
    } catch { return null; }
  });

  const [socialPosts, setSocialPosts] = useState<SocialPost[]>(() => {
    const saved = localStorage.getItem('habit_mosaic_social_posts');
    if (!saved) return [];
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        // Sanitize to ensure each post has a comments array and unique IDs
        const sanitized = parsed.map(p => ({
          ...p,
          comments: ensureUniqueIds(p.comments || [])
        }));
        return ensureUniqueIds(sanitized);
      }
      return [];
    } catch {
      return [];
    }
  });

  const generateNewGoals = () => {
    const goalPool: Omit<DailyMicroGoal, 'id' | 'isCompleted' | 'current'>[] = [
      { title: 'Bơm 2L nước (Đừng để thành cá mặn khô)', category: 'health', target: 2, unit: 'lít', xpReward: 50 },
      { title: 'Thiền 5 phút (Tập trung luyện Như Lai Thần Chưởng)', category: 'mindset', target: 5, unit: 'phút', xpReward: 60 },
      { title: 'Đạp xe 15p (Nhanh như Đội bóng Thiếu Lâm)', category: 'health', target: 15, unit: 'phút', xpReward: 100 },
      { title: '3 ý tưởng (Dù có "vô hậu" cũng được)', category: 'creativity', target: 3, unit: 'ý tưởng', xpReward: 80 },
      { title: 'Nạp 5 từ vựng (Để đi cà khịa đẳng cấp cao)', category: 'language', target: 5, unit: 'từ', xpReward: 70 },
      { title: 'Nghe Podcast 10p (Nghe cho nó sang cái con người)', category: 'language', target: 10, unit: 'phút', xpReward: 60 },
      { title: 'Nhớ 7 số điện thoại (Phòng khi đi đòi nợ)', category: 'memory', target: 7, unit: 'số', xpReward: 90 },
      { title: 'Lâu đài Trí nhớ 5p (Xây biệt thự trong đầu)', category: 'memory', target: 5, unit: 'phút', xpReward: 100 },
      { title: 'Giải Sudoku (Đừng để não thành đậu hũ)', category: 'logic', target: 1, unit: 'bài', xpReward: 80 },
      { title: 'Cãi nhau văn minh (Luyện môi lưỡi như Bao Công)', category: 'logic', target: 1, unit: 'quan điểm', xpReward: 100 },
      { title: 'Note 3 điều biết ơn (Tạ ơn trời đất đã sinh ra tôi quá đẹp trai)', category: 'mindset', target: 3, unit: 'điều', xpReward: 50 },
      { title: '1 giải pháp hack cuộc đời (Dễ như ăn kẹo)', category: 'creativity', target: 1, unit: 'giải pháp', xpReward: 70 },
      { title: 'Ngủ sớm (Vì nhan sắc này cần được bảo tồn)', category: 'health', target: 1, unit: 'lần', xpReward: 120 },
      { title: 'Đọc 10 trang sách (Tri thức là sức mạnh nha cưng)', category: 'wisdom', target: 10, unit: 'trang', xpReward: 100 },
      { title: 'Học 1 cấu trúc ngữ pháp (Để bớt nói hớ)', category: 'language', target: 1, unit: 'cấu trúc', xpReward: 80 }
    ];

    return goalPool
      .sort(() => 0.5 - Math.random())
      .slice(0, 6)
      .map((g, idx) => ({
        ...g,
        id: `mg-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 5)}`,
        isCompleted: false,
        current: 0
      }));
  };

  const [microGoals, setMicroGoals] = useState<DailyMicroGoal[]>(() => {
    const saved = localStorage.getItem('habit_mosaic_micro_goals');
    const savedDate = localStorage.getItem('habit_mosaic_micro_goals_date');
    
    if (saved && savedDate === todayStr) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error("Failed to parse microGoals", e);
      }
    }
    
    return generateNewGoals();
  });

  const [declarationInput, setDeclarationInput] = useState('');
  const [morningDeclaration, setMorningDeclaration] = useState<string>(() => localStorage.getItem('habit_mosaic_morning_dec') || '');
  const [isDecCompleted, setIsDecCompleted] = useState<boolean>(() => localStorage.getItem('habit_mosaic_morning_dec_done') === todayStr);

  useEffect(() => {
    const savedDate = localStorage.getItem('habit_mosaic_morning_dec_done');
    if (savedDate !== todayStr) {
      setIsDecCompleted(false);
      setDeclarationInput('');
    }
  }, [todayStr]);

  const handleSubmitDeclaration = () => {
    if (!declarationInput.trim()) return;
    setMorningDeclaration(declarationInput);
    setIsDecCompleted(true);
    localStorage.setItem('habit_mosaic_morning_dec', declarationInput);
    localStorage.setItem('habit_mosaic_morning_dec_done', todayStr);
    
    addXP(15);
    setActiveReward({
      type: 'xp',
      value: 15,
      message: 'Uây! Kỷ luật tuyệt đỉnh! Tuyên ngôn cam kết của bạn đã được đóng dấu gửi lên mây bảo lưu hình ảnh. +15 XP động lực!'
    });
  };

  const handleAutoEnableMicro = () => {
    setHabits(prev => prev.map(h => {
      if (h.isMicro) return h;
      
      const t = h.title.toLowerCase();
      let microTitle = "Bắt đầu khởi động 1 phút";
      if (t.includes("đọc") || t.includes("sách") || t.includes("read") || t.includes("book")) {
        microTitle = "Mở sách, đọc đúng 1 dòng tuyển chọn";
      } else if (t.includes("chạy") || t.includes("thể dục") || t.includes("gym") || t.includes("chạy bộ") || t.includes("fitness") || t.includes("yoga") || t.includes("vận động")) {
        microTitle = "Xỏ giày vào chân hoặc mở thảm tập";
      } else if (t.includes("code") || t.includes("học") || t.includes("lập trình") || t.includes("program") || t.includes("dev") || t.includes("study") || t.includes("viết")) {
        microTitle = "Gõ 1 dòng code hoặc viết đúng 1 tiêu đề";
      } else if (t.includes("thiền") || t.includes("meditate") || t.includes("tĩnh tâm") || t.includes("ở")) {
        microTitle = "Thở sâu 3 nhịp chậm rãi tại chỗ";
      } else if (t.includes("nước") || t.includes("uống") || t.includes("water") || t.includes("drink")) {
        microTitle = "Rót một ly nước ấm ấm bốc khói";
      } else if (t.includes("dọn") || t.includes("sách") || t.includes("sạch") || t.includes("clean") || t.includes("gọn")) {
        microTitle = "Nhặt đúng 1 món đồ bỏ vào thùng rác";
      } else if (t.includes("ngủ") || t.includes("sớm") || t.includes("sleep")) {
        microTitle = "Tắt wifi điện thoại trước giờ ngủ";
      }
      
      return {
        ...h,
        isMicro: true,
        microTitle
      };
    }));

    addXP(10);
    setActiveReward({
      type: 'xp',
      value: 10,
      message: '✨ Kích hoạt Hệ thống Cổng Vi Mô thành công! Mỗi thói quen lớn đã được trang bị một cổng Đặt Chân Qua Cửa siêu dễ dàng! Nhận +10 XP khai phóng thói quen tí hon!'
    });
  };

  // Watch for date change to force reset goals
  useEffect(() => {
    const savedDate = localStorage.getItem('habit_mosaic_micro_goals_date');
    if (savedDate !== todayStr) {
      setMicroGoals(generateNewGoals());
    }
  }, [todayStr]);

  useEffect(() => {
    localStorage.setItem('habit_mosaic_micro_goals', JSON.stringify(microGoals));
    localStorage.setItem('habit_mosaic_micro_goals_date', todayStr);
  }, [microGoals]);

  useEffect(() => {
    localStorage.setItem('habit_mosaic_social_posts', JSON.stringify(socialPosts));
  }, [socialPosts]);

  // V23 FULL MERGE: the old global random-posting engine is permanently disabled.
  // CommunityWorld is now the single source of truth for NPC life, posts, likes and comments.
  useEffect(() => {
    localStorage.setItem('habit_mosaic_v11_community_engine', '1');
    localStorage.setItem('habit_mosaic_social_engine_owner', 'CommunityWorld-V23');
  }, []);

  useEffect(() => {
    localStorage.setItem('habit_mosaic_active_duel', JSON.stringify(activeDuel));
  }, [activeDuel]);

  // Check for Duel Expiration
  useEffect(() => {
    if (!activeDuel || activeDuel.status !== 'active') return;

    const checkExpiration = () => {
      const total = Date.parse(activeDuel.deadline) - Date.now();
      if (total <= 0) {
        setActiveDuel(prev => {
          if (!prev || prev.status !== 'active') return prev;
          
          const objectives = prev.objectives || [];
          const validObjectives = objectives.filter(obj => Number(obj.target) > 0);
          const allDone = validObjectives.length > 0 && 
                         validObjectives.every(obj => (Number(obj.current) || 0) >= (Number(obj.target) || 1));
          
          if (allDone) {
            return { ...prev, status: 'won' };
          } else {
            setTimeout(() => {
              setUnlockMessage(`HẾT GIỜ! Bạn đã không kịp hoàn thành thử thách Tuần Lễ Kiên Trì trước ${prev.mentorName}.`);
              handleShareToCommunity(`Thử thách Tuần Lễ Kiên Trì cùng ${prev.mentorName} đã kết thúc, tôi cần phải nỗ lực hơn nữa! ⏳ #HetGio #ChuaDuKienTri`, 'achievement');
            }, 1000);
            return { ...prev, status: 'lost' };
          }
        });
      }
    };

    checkExpiration();
    const interval = setInterval(checkExpiration, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [activeDuel?.id, activeDuel?.status, activeDuel?.deadline]);

  // Simulate Mentor Progress
  useEffect(() => {
    if (!activeDuel || activeDuel.status !== 'active') return;

    const interval = setInterval(() => {
      setActiveDuel(prev => {
        if (!prev || prev.status !== 'active') return prev;
        
        // Randomly increase mentor progress (0.1% to 1.5% per minute)
        const luck = Math.random();
        if (luck > 0.6) {
          const increment = (Math.random() * 1.5);
          const newProgressRaw = prev.mentorProgress + increment;
          const newProgress = Math.min(100, newProgressRaw);
          
          if (newProgress >= 100) {
            setTimeout(() => {
              setUnlockMessage(`THẤT BẠI! ${prev.mentorName} đã đạt 100% trước. Lần sau bạn hãy phục thù nhé!`);
              handleShareToCommunity(`Vừa vuột mất chiến thắng trước ${prev.mentorName} trong Tuần Lễ Kiên Trì. Cú vấp ngã này chỉ làm tôi mạnh mẽ hơn! 😤 #ThatBai #PhucThu`, 'achievement');
            }, 1000);
            return { ...prev, mentorProgress: 100, status: 'lost' };
          }
          return { ...prev, mentorProgress: newProgress };
        }
        return prev;
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [activeDuel?.id, activeDuel?.status]);

  useEffect(() => {
    if (unlockMessage) {
      const timer = setTimeout(() => setUnlockMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [unlockMessage]);

  const currentMonthDays = new Array(30).fill(0).map((_, i) => i + 1);
  const completedDays = useMemo(() => {
    const currentMonth = new Date().getMonth();
    return logs
      .filter(l => new Date(l.date).getMonth() === currentMonth && l.completedHabitIds.length >= habits.length && habits.length > 0)
      .map(l => new Date(l.date).getDate());
  }, [logs, habits]);

  const progress = Math.round((completedDays.length / currentMonthDays.length) * 100);

  // Fetch Side Quest
  const fetchSideQuest = async (forceRefetch = false) => {
    const today = new Date().toISOString().split('T')[0];
    const lastFetch = localStorage.getItem('habit_mosaic_quest_date');
    
    if (forceRefetch || lastFetch !== today) {
      if (forceRefetch) {
        setSideQuest({ text: 'Đang suy nghĩ nhiệm vụ mới...', completed: false });
      }
      try {
        const res = await desktopAwareFetch('/api/side-quest', {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({ theme: currentTheme, habits: habits.map(h => h.title), bookTitle: customTitle })
        });
        const data = await res.json();
        if (data.quest) {
          const newQuest = { text: data.quest, completed: false };
          setSideQuest(newQuest);
          localStorage.setItem('habit_mosaic_side_quest', JSON.stringify(newQuest));
          localStorage.setItem('habit_mosaic_quest_date', today);
        }
      } catch (e) { console.error(e); }
    }
  };

  useEffect(() => {
    fetchSideQuest();
  }, [currentTheme, customTitle, todayStr]);

  // Check for Story Unlocks
  useEffect(() => {
    const thresholds = [25, 50, 75, 100];
    const checkUnlocks = async () => {
      for (const t of thresholds) {
        const storyKey = currentTheme === 'custom' ? `custom_${customTitle}_${t}` : `${currentTheme}_${t}`;
        if (progress >= t && !unlockedStory[storyKey]) {
          try {
            const res = await desktopAwareFetch('/api/story-unlock', {
              method: 'POST',
              headers: {'Content-Type': 'application/json'},
              body: JSON.stringify({ theme: currentTheme, progress: t, bookTitle: customTitle })
            });
            const data = await res.json();
            if (data.story) {
              setUnlockedStory(prev => {
                const updated = { ...prev, [storyKey]: data.story };
                localStorage.setItem('habit_mosaic_story', JSON.stringify(updated));
                return updated;
              });
            }
          } catch (e) { console.error(e); }
        }
      }
    };
    checkUnlocks();
  }, [progress, currentTheme, customTitle]);

  useEffect(() => {
    const fetchReminder = async () => {
      try {
        const response = await desktopAwareFetch('/api/reminders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            streak: profile.currentStreak,
            habits: habits.map(h => h.title),
            theme: currentTheme,
            bookTitle: customTitle
          })
        });
        const data = await response.json();
        if (data.message) setAiReminder(data.message);
      } catch (e) {
        setAiReminder('Cố gắng lên, rèn luyện thói quen mỗi ngày để mở khóa tri thức vĩ đại!');
      }
    };
    fetchReminder();
  }, [profile.currentStreak, habits.length, currentTheme, customTitle]);

  // Simple persistence
  useEffect(() => {
    localStorage.setItem('habit_mosaic_habits', JSON.stringify(habits));
  }, [habits]);

  useEffect(() => {
    localStorage.setItem('habit_mosaic_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    if (customImage) {
      localStorage.setItem('habit_mosaic_custom_image', customImage);
    } else {
      localStorage.removeItem('habit_mosaic_custom_image');
    }
  }, [customImage]);

  useEffect(() => {
    localStorage.setItem('habit_mosaic_custom_title', customTitle);
  }, [customTitle]);

  useEffect(() => {
    localStorage.setItem('habit_mosaic_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('habit_mosaic_archives', JSON.stringify(archives));
  }, [archives]);

  useEffect(() => {
    localStorage.setItem('habit_mosaic_logs', JSON.stringify(logs));
    
    // Robust streak calculation
    const today = new Date().toISOString().split('T')[0];
    const uniqueDates = Array.from(new Set(logs.map(l => l.date))).sort().reverse();
    
    let streak = 0;
    
    // First, check if there's data for today. 
    // If not, check if there's data for yesterday. 
    // If neither, streak is 0.
    const latestLogDate: string | null = uniqueDates.length > 0 ? (uniqueDates[0] as string) : null;
    
    if (latestLogDate) {
      const msPerDay = 24 * 60 * 60 * 1000;
      const tDate = new Date(today);
      const lDate = new Date(latestLogDate);
      const diffDays = Math.floor((tDate.getTime() - lDate.getTime()) / msPerDay);
      
      if (diffDays <= 1) {
        // If diffDays is 0 (today) or 1 (yesterday), we can calculate a valid streak
        let checkDate = new Date(latestLogDate);
        for (const dateStr of uniqueDates) {
          const expectedDate = checkDate.toISOString().split('T')[0];
          if (dateStr === expectedDate) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }
    
    setProfile(prev => ({ 
      ...prev, 
      currentStreak: streak,
      longestStreak: Math.max(prev.longestStreak, streak)
    }));
  }, [logs]);

  const activeBook = ebooks.find(b => b.title === customTitle);
  const activeBookContent = activeBook ? (activeBook.chapters[activeBook.currentChapterIndex]?.content || "") : "";

  const todayLog = logs.find(l => l.date === todayStr);
  const completedHabitIds = todayLog?.completedHabitIds || [];

  const totalTodayHabits = habits.length;
  const completedTodayHabitsCount = completedHabitIds.length;
  const todayProgressPercent = totalTodayHabits > 0 ? Math.round((completedTodayHabitsCount / totalTodayHabits) * 100) : 0;

  const getFramedReminder = () => {
    if (totalTodayHabits === 0) {
      return "Hãy khởi tạo thói quen đầu tiên để thiết lập bánh đà phát triển của bạn ngày hôm nay nhé! ☀️";
    }
    
    if (completedTodayHabitsCount === 0) {
      return "Mục tiêu hôm nay đang chào đón bạn! Bắt đầu thật nhẹ nhàng với 1 Micro-Habit (chỉ cần xỏ giày chạy bộ vào chân, hay rót 1 cốc nước ấm!) để kích hoạt đà chiến thắng mở màn hoàn hảo. 🦶";
    }
    
    if (completedTodayHabitsCount === totalTodayHabits) {
      return "Kỳ tích Đã Đạt! 🌟 Bạn đã hoàn thành xuất sắc 100% mục tiêu của ngày hôm nay, khai mở trọn vẹn toàn bộ tiềm năng kỷ luật xuất sắc!";
    }
    
    return `Bạn đã hoàn thành gọn gàng ${todayProgressPercent}% mục tiêu của hôm nay rồi! Thật tuyệt vời, chỉ còn một chút nỗ lực nhỏ nữa thôi là ngày học tập & rèn luyện của bạn sẽ đạt ngưỡng hoàn hảo tuyệt đối! 🔥`;
  };

  const handleUnlockOnePage = () => {
    let unlockedText = '';
    setEbooks(currentBooks => {
      const updated = currentBooks.map(book => {
        if (book.title === customTitle) {
          if (book.format === 'pdf') {
            const currentUnlocked = book.unlockedPagesCount ?? 3;
            const newUnlocked = Math.min(book.totalPdfPages || 100, currentUnlocked + 1);
            if (newUnlocked > currentUnlocked) {
              unlockedText = `Khai sáng thói quen: Đã mở thêm Trang ${newUnlocked} sách "${book.title}"! (Đừng để nó mốc nhé!)`;
            } else {
              unlockedText = `Sách "${book.title}" đã khai quang trọn vẹn! Bạn chính là tổng kho tri thức di động!`;
            }
            return { ...book, unlockedPagesCount: newUnlocked };
          } else {
            const currentUnlocked = book.unlockedChaptersCount ?? 1;
            const newUnlocked = Math.min(book.chapters.length || 10, currentUnlocked + 1);
            if (newUnlocked > currentUnlocked) {
              unlockedText = `Khai sáng thói quen: Đã mở thêm Chương mới sách "${book.title}"! (Đọc lẹ lên, tác giả đang đợi!)`;
            } else {
              unlockedText = `Sách "${book.title}" đã "full-house"! Chúc mừng mọt sách đẳng cấp!`;
            }
            return { ...book, unlockedChaptersCount: newUnlocked };
          }
        }
        return book;
      });
      localStorage.setItem('habit_mosaic_ebooks', JSON.stringify(updated));
      if (unlockedText) {
        setUnlockMessage(unlockedText);
      } else {
        const saltyPhrases = [
          "Tích thói quen (+10 XP)! Não bộ đang phát sáng hơn cả tương lai của tôi rồi. Hãy link sách mục tiêu để cày nhé! ✨",
          "Thành công! Kỷ luật thế này thì nghèo thế nào được nữa. Nhớ link thêm sách để nạp tri thức nha! 📚",
          "Xong phăng! Sự siêng năng lúc này của bạn thật là kỳ lạ, hãy link sách để đọc cho nóng nhé! 😏",
          "Đã tick! Bạn vừa bóp nghẹt sự lười biếng thành công ngày hôm nay. Hãy link sách mục tiêu đọc tiếp nhé!",
          "Tích rồi nhé! Đừng để mốc thói quen, không là tôi rải muối cả nhà đấy. Mau link sách trỏ trang nào! 🧂",
          "Cháy máy! Bạn vừa kích hoạt chế độ 'siêu saiyan' cho thói quen này. Mau link thêm sách để bứt phá!",
          "Năng suất đỉnh chóp! Sắp tiến hóa thành tổng tài thói quen rồi. Mau link sách để cày nốt tri thức nha! 👑"
        ];
        const randomSalty = saltyPhrases[Math.floor(Math.random() * saltyPhrases.length)];
        setUnlockMessage(randomSalty);
      }
      return updated;
    });
  };

  const addXP = (amount: number) => {
    setProfile(p => {
      const newXp = (p.xp || 0) + amount;
      const newLevel = Math.floor(newXp / 1000) + 1;
      let newUnlockedBadges = [...(p.unlockedBadgeIds || [])];

      // Badge: Achievement of certain level
      if (newLevel >= 10 && !newUnlockedBadges.includes('b4')) {
        newUnlockedBadges.push('b4');
        setTimeout(() => {
          setUnlockMessage("ĐẠT CẤP ĐỘ 10! Huy hiệu 'Huyền Thoại' đã được thêm vào bộ sưu tập của bạn.");
        }, 2000);
      }
      
      // Bonus: Reward Shining Pixel on level up
      if (newLevel > (p.level || 1)) {
        setTimeout(() => {
          setActiveReward({
            type: 'shining_pixel',
            value: 5,
            message: `CẤP ĐỘ MỚI! Nhận thêm 5 Shining Pixels!`
          });
          setProfile(prev => ({ 
            ...prev, 
            shiningPixels: (prev.shiningPixels || 0) + 5 
          }));
        }, 1000);
      }
      
      return { ...p, xp: newXp, level: newLevel, unlockedBadgeIds: newUnlockedBadges };
    });

    updateDuelProgress('xp_gain', amount);
  };

  const updateDuelProgress = (type: DuelObjective['type'], amount: number) => {
    setActiveDuel(prev => {
      if (!prev || prev.status !== 'active' || !prev.objectives || prev.objectives.length === 0) return prev;
      
      let anyObjectiveUpdated = false;
      
      const updatedObjectives = prev.objectives.map(obj => {
        // Fallback type detection
        const objType = obj.type || (obj.title.toLowerCase().includes('xp') ? 'xp_gain' : 
                                   obj.title.toLowerCase().includes('sách') ? 'reading_pages' : 'habit_count');
        
        if (objType === type) {
          const currentVal = Number(obj.current) || 0;
          const targetVal = Number(obj.target) || 1;
          
          if (currentVal < targetVal) {
            const nextVal = Math.min(targetVal, currentVal + amount);
            anyObjectiveUpdated = true;
            return { ...obj, current: nextVal, type: objType };
          }
        }
        return { ...obj, type: objType };
      });

      if (!anyObjectiveUpdated) return prev;

      // Check for total victory
      const validObjectives = updatedObjectives.filter(obj => Number(obj.target) > 0);
      const allDone = validObjectives.length > 0 && validObjectives.every(obj => (Number(obj.current) || 0) >= (Number(obj.target) || 1));

      if (allDone) {
        setTimeout(() => {
          setUnlockMessage(`OUT TRÌNH! Bạn đã bán hành cho ${prev.mentorName} và chiến thắng Tuần Lễ Kiên Trì! +1000 Bonus XP vào túi.`);
          setProfile(p => ({ ...p, xp: p.xp + 1000 }));
          handleShareToCommunity(`Tôi vừa cho ${prev.mentorName} ngửi khói trong thử thách Tuần Lễ Kiên Trì! 🏆 #OutTrinh #MentorHaoHan`, 'achievement');
        }, 1000);
        return { ...prev, objectives: updatedObjectives, status: 'won' };
      }

      return { ...prev, objectives: updatedObjectives };
    });
  };

  const handleToggleHabit = (id: string, isMicroClicked?: boolean) => {
    const existingLog = logs.find(l => l.date === todayStr);
    const isCurrentlyCompleted = existingLog?.completedHabitIds.includes(id);
    const willBeCompleted = !isCurrentlyCompleted;

    setLogs(prev => {
      const existing = prev.find(l => l.date === todayStr);
      if (existing) {
        const newIds = isCurrentlyCompleted 
          ? existing.completedHabitIds.filter(hid => hid !== id)
          : [...existing.completedHabitIds, id];
        
        return prev.map(l => l.date === todayStr ? { ...l, completedHabitIds: newIds } : l);
      } else {
        return [...prev, { id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, userId: profile.uid, date: todayStr, completedHabitIds: [id] }];
      }
    });

    if (willBeCompleted) {
      const targetHabit = habits.find(h => h.id === id);
      const isMicroSuccess = !!(isMicroClicked && targetHabit?.isMicro);
      const earnedXp = isMicroSuccess ? 5 : 10;
      
      addXP(earnedXp);
      updateDuelProgress('habit_count', 1);
      handleUnlockOnePage();

      if (isMicroSuccess) {
        setTimeout(() => {
          setUnlockMessage(`🦶 Đặt Chân Qua Cửa thành công! Bạn đã hoàn thành nhiệm vụ vi mô "${targetHabit?.microTitle}" (+5 XP). Một bước chân nhỏ cứu cả hành trình vĩ đại!`);
        }, 1000);
      }

      // Badge: Kiên Trì (7 day streak)
      if (profile.currentStreak >= 7 && !(profile.unlockedBadgeIds || []).includes('b2')) {
        setProfile(p => ({
          ...p,
          unlockedBadgeIds: [...(p.unlockedBadgeIds || []), 'b2']
        }));
        setTimeout(() => {
          setUnlockMessage("ĐẠT CHUỖI 7 NGÀY! Huy hiệu 'Kiên Trì' đã được thêm vào bộ sưu tập.");
        }, 1500);
      }

      // Implement Variable Rewards (Pokemon Gacha)
      const rewardLuck = Math.random();
      const isPokemonWin = rewardLuck < 0.10; // 10% chance (giảm tỉ lệ trúng xuống để hiếm hơn)

      if (isPokemonWin) {
        const pokeId = Math.floor(Math.random() * 151) + 1; // Gen 1 
        fetch(`https://pokeapi.co/api/v2/pokemon/${pokeId}`)
          .then(res => res.json())
          .then(data => {
            const newPoke = { id: data.id, name: data.name, sprite: data.sprites.front_default };
            const spiritIdStr = `poke-${data.id}`;
            setProfile(p => ({
              ...p,
              unlockedSpiritIds: [...(p.unlockedSpiritIds || []).filter(id => id !== spiritIdStr), spiritIdStr],
              pokemons: [...(p.pokemons || []).filter(p => p.id !== newPoke.id), newPoke]
            }));
            setActiveReward({
              type: 'pokemon',
              value: newPoke,
              message: `Bạn vừa thu phục được ${data.name.toUpperCase()}!`
            });
          })
          .catch(() => {
            const bonus = 50 + Math.floor(Math.random() * 50);
            addXP(bonus);
            setActiveReward({
              type: 'xp',
              value: bonus,
              message: `Quay thẻ Pokémon thất bại mạng yếu, nhận tạm ${bonus} XP đền bù nhé!`
            });
          });
      } else {
        const cheekyPraises = [
            "Quay hụt òi! Lần sau cố lên nhé, ăn tạm XP vậy.",
            "Pokémon đã bỏ chạy... nhưng bạn vẫn còn XP cứu vớt!",
            "Tạch gacha rồi bạn ơi! Ráng rèn luyện cày thêm nha.",
            "Vừa ném trượt Pokéball rồi! Lần sau ném chuẩn hơn nhé.",
            "Pokémon hoang dã né thính rất giỏi. Đền bù XP cho bạn."
        ];
        const msg = cheekyPraises[Math.floor(Math.random() * cheekyPraises.length)];
        const bonus = 15 + Math.floor(Math.random() * 25);
        addXP(bonus);
        setActiveReward({
            type: 'xp',
            value: bonus,
            message: `${msg} (+${bonus} XP)`
        });
      }

      // Check if any old logic was here
    }
  };

  const addHabit = (title: string, isMicro?: boolean, microTitle?: string) => {
    const newHabit: Habit = {
      id: `habit-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: profile.uid,
      title,
      frequency: 'daily',
      createdAt: new Date().toISOString(),
      isMicro,
      microTitle
    };
    setHabits([...habits, newHabit]);
  };

  const deleteHabit = (id: string) => {
    setHabits(habits.filter(h => h.id !== id));
  };

  const handleToggleSubGoal = (habitId: string, subGoalId: string) => {
    const existingLog = logs.find(l => l.date === todayStr);
    const isCurrentlyCompleted = existingLog?.completedSubGoalIds?.includes(subGoalId);
    const willBeCompleted = !isCurrentlyCompleted;

    setLogs(prev => {
      const existing = prev.find(l => l.date === todayStr);
      if (existing) {
        const completedSubGoalIds = existing.completedSubGoalIds || [];
        const newIds = isCurrentlyCompleted 
          ? completedSubGoalIds.filter(id => id !== subGoalId)
          : [...completedSubGoalIds, subGoalId];
        
        return prev.map(l => l.date === todayStr ? { ...l, completedSubGoalIds: newIds } : l);
      } else {
        return [...prev, { 
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`, 
          userId: profile.uid, 
          date: todayStr, 
          completedHabitIds: [],
          completedSubGoalIds: [subGoalId]
        }];
      }
    });

    if (willBeCompleted) {
      addXP(2);
    }
  };

  const handleAddSubGoal = (habitId: string, title: string) => {
    if (!title.trim()) return;
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          subGoals: [...(h.subGoals || []), { id: `sg-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`, title: title.trim() }]
        };
      }
      return h;
    }));
  };

  const handleDeleteSubGoal = (habitId: string, subGoalId: string) => {
    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        return {
          ...h,
          subGoals: (h.subGoals || []).filter(sg => sg.id !== subGoalId)
        };
      }
      return h;
    }));
  };

  const archiveCurrentMosaic = () => {
    const activeImage = currentTheme === 'sherlock' ? SHERLOCK_IMG : (currentTheme === 'wuxia' ? WUXIA_IMG : (customImage || SHERLOCK_IMG));
    const newArchive: MosaicArchive = {
      id: `archive-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId: profile.uid,
      month: String(new Date().getMonth() + 1),
      year: new Date().getFullYear(),
      imageUrl: activeImage,
      completionRate: 1.0
    };
    
    setArchives([newArchive, ...archives]);
    setLogs([]);
    alert('Bùm! Bức tranh thói quen của bạn đã được đóng khung mạ vàng tại Thư viện. Hãy bắt đầu một chu kỳ mới để xem bạn còn "biến hóa" đến đâu!');
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCustomImage(base64String);
        setCurrentTheme('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveCustomImage = () => {
    setCustomImage(null);
    if (currentTheme === 'custom') {
      setCurrentTheme('sherlock');
    }
  };

  const shareResult = () => {
    const text = `Đang crafting bức tranh ${currentTheme === 'sherlock' ? 'Sherlock' : (currentTheme === 'wuxia' ? 'Giang Hồ' : customTitle)} bằng mồ hôi và nước mắt! Chuỗi streak: ${profile.currentStreak} ngày (Kinh điển!). #HabitMosaic #NoPainNoGain`;
    
    // Automatic share to virtual community
    handleShareToCommunity(text, 'mosaic');

    if (navigator.share) {
      navigator.share({ title: 'The Habit Mosaic', text, url: window.location.href });
    } else {
      alert('Đã chia sẻ lên Cộng đồng ảo và sao chép kết quả!');
    }
  };

  const handleShareToCommunity = (content: string, type: SocialPost['type'], imageUrl?: string) => {
    const newPost: SocialPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorName: profile.displayName,
      authorAvatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}`,
      content,
      type,
      imageUrl,
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    setSocialPosts(prev => [newPost, ...prev]);
    
    // Switch to community tab to show the post
    setActiveTab('community');

    // Trigger virtual comments from SocialFeed via state if needed, but since we are in App.tsx
    // we can implement a mechanism to auto-comment on new posts
  };

  // V22: CommunityWorld is the only Social Engine.
  // Legacy 3-5 random persona comments were removed completely so no hidden timer can bypass Soul/Living Society decisions.

  const handleStartDuel = (mentorId: string) => {
    const mentor = VIRTUAL_MENTORS.find(m => m.id === mentorId);
    if (!mentor) return;

    const objectives: DuelObjective[] = [
      { id: '1', title: 'Hoàn thành 21 thói quen (Kiên trì)', target: 21, current: 0, type: 'habit_count' },
      { id: '2', title: 'Đọc 30 trang sách (Tri thức)', target: 30, current: 0, type: 'reading_pages' },
      { id: '3', title: 'Kiếm 1000 XP (Nỗ lực)', target: 1000, current: 0, type: 'xp_gain' }
    ];

    const newDuel: VirtualDuelType = {
      id: `duel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      mentorId: mentor.id,
      mentorName: mentor.name,
      mentorAvatar: mentor.avatar,
      objectives,
      mentorProgress: 0,
      status: 'active',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      createdAt: new Date().toISOString()
    };

    setActiveDuel(newDuel);
    
    // Announce the duel on social feed
    const text = `Vừa "va chạm" nhẹ với ${mentor.name} trong kèo "Tuần Lễ Kiên Trì"! Chuẩn bị tinh thần để thấy tôi vượt mặt đi. #KèoNàyCủaTôi #GameOn`;
    handleShareToCommunity(text, 'achievement');
  };

  const handleCompleteMicroGoal = (goalId: string) => {
    const goal = microGoals.find(g => g.id === goalId);
    
    if (goal && !goal.isCompleted) {
      setMicroGoals(prev => prev.map(g => 
        g.id === goalId ? { ...g, isCompleted: true, current: g.target } : g
      ));

      addXP(goal.xpReward);
      updateDuelProgress('habit_count', 1);
      
      const streak = profile.currentStreak;
      const text = `Vừa dứt điểm mục tiêu "${goal.title}". Chuỗi ${streak} ngày này là thật chứ không phải mơ! Hệ thống MicroGoal này "quá là sướng" luôn. #DutDiem #StreakVip`;
      handleShareToCommunity(text, 'achievement');

    }
  };



  return (
    <div className="flex h-screen overflow-hidden bg-slate-950">
      {/* Left Sidebar for Desktop */}
      <aside className="hidden lg:flex w-72 bg-slate-900/50 border-r border-slate-800 flex-col overflow-y-auto flex-shrink-0 shadow-2xl z-40">
        <div className="p-8 text-center">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="w-24 h-24 mx-auto rounded-full border-2 border-amber-500/50 p-1 mb-4 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center">
              <span className="text-2xl font-serif italic text-amber-400">
                {currentTheme === 'sherlock' ? 'SH' : 'VH'}
              </span>
            </div>
          </motion.div>
          <h2 className="text-xl font-display font-semibold tracking-wide text-white">{profile.displayName}</h2>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold mt-1">
            {currentTheme === 'sherlock' ? 'Master Detective' : 'Cao Thủ Võ Lâm'}
          </p>
        </div>

        <nav className="px-4 space-y-2 flex-1">
          <div className="p-4 mb-6 rounded-xl bg-amber-500/10 border border-amber-500/20 shadow-[inset_0_0_10px_rgba(245,158,11,0.05)]">
            <p className="text-[10px] uppercase text-amber-500 font-bold mb-1 tracking-tighter">Chuỗi hiện tại</p>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-black text-amber-400">{profile.currentStreak}</span>
              <span className="text-sm text-amber-600 font-medium font-display">Ngày</span>
            </div>
          </div>

          <SidebarNavButton 
            active={activeTab === 'mosaic'} 
            onClick={() => setActiveTab('mosaic')} 
            icon={<Sparkles size={18} className="text-cyan-400" />} 
            label="Bức tranh thói quen" 
          />
          <SidebarNavButton 
            active={activeTab === 'habits'} 
            onClick={() => setActiveTab('habits')} 
            icon={<ListTodo size={18} className="text-emerald-400" />} 
            label="Ghi chép thói quen" 
          />
          <SidebarNavButton 
            active={activeTab === 'community'} 
            onClick={() => setActiveTab('community')} 
            icon={<Users size={18} className="text-blue-400" />} 
            label="Cộng đồng ảo" 
          />
          <SidebarNavButton
            active={activeTab === 'smarter'}
            onClick={() => setActiveTab('smarter')}
            icon={<Edit3 size={18} className="text-cyan-400" />}
            label="SMARTER · Đặt mục tiêu"
          />
          <SidebarNavButton
            active={activeTab === 'okr'}
            onClick={() => setActiveTab('okr')}
            icon={<Award size={18} className="text-emerald-400" />}
            label="OKR · Mục tiêu nhỏ"
          />
          <SidebarNavButton
            active={activeTab === 'artGallery'}
            onClick={() => setActiveTab('artGallery')}
            icon={<Trophy size={18} className="text-violet-400" />}
            label="Bộ sưu tập tranh"
          />
          <SidebarNavButton
            active={activeTab === 'curiosity'}
            onClick={() => setActiveTab('curiosity')}
            icon={<Clover size={18} className="text-cyan-400" />}
            label="10 vạn điều chưa biết"
          />
          <SidebarNavButton
            active={activeTab === 'goalShop'}
            onClick={() => setActiveTab('goalShop')}
            icon={<Gift size={18} className="text-amber-400" />}
            label="Cửa hàng mục tiêu"
          />
          <SidebarNavButton 
            active={activeTab === 'collection'} 
            onClick={() => setActiveTab('collection')} 
            icon={<Trophy size={18} className="text-amber-400" />} 
            label="Thành tựu & Linh hồn" 
          />
        </nav>

        <div className="p-6 mt-auto">
          <div className="p-4 bg-indigo-900/10 rounded-xl border border-indigo-500/20">
            <p className="text-[10px] text-indigo-400 uppercase tracking-widest mb-3 font-bold">Mẩu tin tình báo</p>
            <p className="text-[11px] text-slate-400 leading-relaxed italic">
              "{aiReminder}"
            </p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black overflow-y-auto">
        {/* Mobile Header */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-950/80 backdrop-blur-md border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles size={20} className="text-amber-500" />
            <h1 className="font-display font-bold text-lg tracking-tight">The Habit Mosaic</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 text-amber-500 rounded-full border border-amber-500/20 text-xs font-bold">
              {profile.currentStreak} DAYS
            </div>
            <button onClick={shareResult} className="p-2 text-slate-400">
              <Share2 size={18} />
            </button>
          </div>
        </header>

        <main className="flex-1 w-full max-w-5xl mx-auto px-6 py-10 lg:px-12">
          {/* Legendary unlock popup toast */}
          <AnimatePresence>
            {unlockMessage && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="mb-6 p-4 bg-gradient-to-r from-amber-500/20 via-yellow-500/10 to-transparent border border-amber-500/30 rounded-2xl flex items-center justify-between gap-4 shadow-[0_0_20px_rgba(245,158,11,0.15)] relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 w-1/3 h-[1px] bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 animate-pulse" />
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 text-amber-400 rounded-xl animate-bounce">
                    <Sparkles size={18} />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest font-sans">THÀNH TỰU KHAI SÁNG</p>
                    <p className="text-xs text-white font-serif mt-0.5">{unlockMessage}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setUnlockMessage(null)}
                  className="text-slate-400 hover:text-white text-[10px] uppercase font-bold tracking-wider px-2.5 py-1.5 bg-slate-950/80 border border-slate-800 rounded-xl hover:border-slate-700 transition-all font-sans cursor-pointer whitespace-nowrap"
                >
                  Đóng
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-4">
            <RewardRouteHost activeTab={activeTab} habits={habits} logs={logs} />
            <AnimatePresence mode="wait">
              {activeTab === 'mosaic' && (
                <motion.div
                  key="mosaic"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="space-y-10"
                >
                  <DailyMission profile={profile} habits={habits} logs={logs} onToggleHabit={handleToggleHabit} />
                  <RewardWorld habits={habits} logs={logs} />
                  <div className="grid grid-cols-1 xl:grid-cols-4 gap-8 items-start">
                    <div className="xl:col-span-3 space-y-10">
                      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                          <h1 className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-2 font-bold">DỰ ÁN HIỆN TẠI</h1>
                          <div className="flex items-center gap-3">
                            {isEditingTitle && currentTheme === 'custom' ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="text"
                                  value={customTitle}
                                  onChange={(e) => setCustomTitle(e.target.value)}
                                  onBlur={() => setIsEditingTitle(false)}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') setIsEditingTitle(false);
                                  }}
                                  className="bg-slate-900 border border-amber-500/50 text-white rounded px-3 py-1 font-serif text-2xl md:text-3xl focus:outline-none focus:ring-1 focus:ring-amber-500"
                                  autoFocus
                                />
                                <button
                                  onClick={() => setIsEditingTitle(false)}
                                  className="px-3 py-1 bg-amber-500 text-slate-950 font-bold text-xs rounded transition-all hover:bg-amber-400"
                                >
                                  Xong
                                </button>
                              </div>
                            ) : (
                              <h2 className="text-4xl md:text-5xl font-serif italic text-white tracking-tight flex items-center gap-3">
                                {currentTheme === 'sherlock' ? 'Bí ẩn Baker Street' : (currentTheme === 'wuxia' ? 'Giang Hồ Hiệp Khách' : customTitle)}
                                {currentTheme === 'custom' && (
                                  <button 
                                    onClick={() => setIsEditingTitle(true)}
                                    className="p-1.5 rounded bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-colors"
                                    title="Đổi tên quyển sách/mục tiêu"
                                  >
                                    <Edit3 size={16} />
                                  </button>
                                )}
                              </h2>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3 translate-y-1">
                          <div className="flex items-baseline gap-2">
                            <span className="text-3xl font-light text-slate-300">
                              {progress}%
                            </span>
                            <span className="text-xs text-slate-500 uppercase tracking-widest font-bold">Hoàn thành</span>
                          </div>
                          <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${progress}%` }}
                              className="h-full bg-gradient-to-r from-amber-600 to-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]"
                            />
                          </div>
                          {progress === 100 && (
                            <motion.button
                              initial={{ scale: 0.9, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              onClick={archiveCurrentMosaic}
                              className="px-4 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.4)] transition-all"
                            >
                              Lưu vào Thư viện & Reset
                            </motion.button>
                          )}
                        </div>
                      </div>

                      {/* --- PSYCHOLOGY-BASED MOTIVATION SYSTEM --- */}
                      <div className="space-y-6">
                        {/* 1. Positive Framing Alert Box */}
                        <div className="bg-slate-900/60 backdrop-blur-md rounded-3xl p-5 border border-slate-800 shadow-lg flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">📈</span>
                            <div>
                              <p className="text-[10px] uppercase font-black text-amber-500 tracking-wider">Động Lực Tích Cực (Framing Effect)</p>
                              <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-semibold">
                                {getFramedReminder()}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* 2. Morning Commitment & Consistency */}
                        {!isDecCompleted ? (
                          <div className="bg-slate-900/80 backdrop-blur-md rounded-3xl p-6 border-2 border-amber-500/20 shadow-xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 blur-2xl rounded-full" />
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-lg">☀️</span>
                                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest">Tuyên ngôn Nhất quán Buổi Sáng</h4>
                                </div>
                                <p className="text-[11px] text-slate-400">
                                  Kỹ thuật <strong>Cam Kết & Nhất Quán</strong>: Việc ký/gõ bằng tay tự tạo cam kết trong tâm trí, giúp bạn kiên trì gấp 3 lần bình thường.
                                </p>
                              </div>
                              <div className="bg-amber-500/10 px-3 py-1.5 text-amber-400 font-bold text-[10px] tracking-wider uppercase rounded-xl border border-amber-500/20 self-start md:self-center">
                                Thưởng +15 XP
                              </div>
                            </div>
                            <div className="mt-4 flex gap-3">
                              <input 
                                type="text" 
                                value={declarationInput}
                                onChange={(e) => setDeclarationInput(e.target.value)}
                                placeholder="Ví dụ: Hôm nay tôi cam kết hoàn thành ít nhất 1 thói quen để chiến thắng sự trì hoãn..."
                                className="flex-1 bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-amber-500/30 font-medium"
                              />
                              <button 
                                onClick={handleSubmitDeclaration}
                                disabled={!declarationInput.trim()}
                                className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-widest rounded-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 flex-shrink-0 cursor-pointer"
                              >
                                Cam Kết 🚀
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="bg-emerald-500/5 backdrop-blur-md rounded-3xl p-5 border border-emerald-500/20 shadow-lg flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold">
                                ✓
                              </div>
                              <div>
                                <p className="text-[10px] uppercase font-black text-emerald-400 tracking-wider">Đã ký cam kết nhất quán hôm nay</p>
                                <p className="text-xs text-slate-300 italic font-medium">"{morningDeclaration}"</p>
                              </div>
                            </div>
                            <div className="text-[10px] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 text-emerald-400 uppercase font-black tracking-widest">
                              Nhất quán
                            </div>
                          </div>
                        )}

                        {/* 3. Foot-in-the-Door (Đặt chân qua cửa) & Micro-Habit Booster Panel */}
                        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 backdrop-blur-md space-y-6 relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 blur-3xl rounded-full" />
                          
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
                                <Footprints size={20} className="animate-pulse" />
                              </div>
                              <div>
                                <h3 className="text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
                                  BẢO BỐI: ĐẶT CHÂN QUA CỬA <span className="text-[10px] bg-amber-500/25 text-amber-300 px-2 py-0.5 rounded-full font-black uppercase tracking-wider scale-90">Foot-in-the-Door</span>
                                </h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Cơ chế bẻ gãy lực cản tâm lý triệt để</p>
                              </div>
                            </div>
                          </div>

                          {/* Concept Explainer box */}
                          <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 space-y-2.5 text-xs text-slate-300">
                            <p className="leading-relaxed">
                              🧠 <strong>Bí pháp lừa não bộ bằng dolomite:</strong> Não bộ cực kì bài xích những mục tiêu vĩ mô ngột ngạt (như <em>"Học Code liên tục 3 tiếng"</em> hay <em>"Chạy bộ vã mồ hôi 5km"</em>). Lực cản luôn nằm ở <strong>hành động bắt đầu</strong>.
                            </p>
                            <p className="leading-relaxed border-t border-slate-800/40 pt-2 text-slate-400">
                              💡 <strong>Kỹ thuật Đặt Chân Qua Cửa:</strong> Chỉ cần cam kết thực hiện một việc siêu nhỏ vô hại dài chưa tới 1 phút (ví dụ: <em>gõ đúng 1 dòng code, mở đúng trang đầu của chương sách hay xỏ chân vào đôi giày chạy bộ</em>). Khi cơ thể đã chuyển động cho bước nhỏ đầu tiên, quán tính học tập tự động kích hoạt dopamine, giúp bạn hoàn thành xuất sắc mục tiêu thật sự dễ dàng!
                            </p>
                          </div>

                          {/* Dynamic Progress Gate indicator */}
                          <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-slate-400 uppercase tracking-widest font-black">Cửa Thắng Tối Thiểu Ngày:</span>
                              <span className="text-[10px] text-amber-400 font-sans font-black tracking-wider uppercase">
                                {habits.length > 0 && habits.some(h => completedHabitIds.includes(h.id)) 
                                  ? "ĐÃ MỞ CỬA THẮNG! 🎉" 
                                  : "ĐANG CHỜ BƯỚC CHÂN ĐẦU TIÊN"}
                              </span>
                            </div>

                            {/* Progress bar towards at least 1 completed habit */}
                            <div className="h-2 bg-slate-900 rounded-full overflow-hidden">
                              <motion.div 
                                className="h-full bg-gradient-to-r from-amber-500 to-yellow-400"
                                initial={{ width: "20%" }}
                                animate={{ width: habits.length > 0 && habits.some(h => completedHabitIds.includes(h.id)) ? "100%" : "20%" }}
                                transition={{ type: "spring", stiffness: 80 }}
                              />
                            </div>
                            <p className="text-[10px] text-slate-500 leading-relaxed font-semibold italic">
                              {habits.length > 0 && habits.some(h => completedHabitIds.includes(h.id))
                                ? "✨ Tuyệt vời! Bạn đã vượt cửa thành công, khai phóng dopamine dồi dào. Thừa thắng xông lên thôi!"
                                : "⚡️ Chỉ cần thực hiện ít nhất 1 thói quen (hoặc click bước vi mô bên dưới) để bảo toàn đà thắng (Win-streak) rực rỡ hôm nay!"
                              }
                            </p>
                          </div>

                          {/* Micro-habit Trigger Section */}
                          <div className="space-y-3">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nhiệm Vụ Vi Mô Hôm Nay (Micro-Habit):</h4>
                            
                            {habits.filter(h => h.isMicro).length === 0 ? (
                              <div className="bg-slate-950/80 rounded-2xl p-5 border border-dashed border-slate-800 text-center space-y-4">
                                <span className="text-2xl block animate-bounce">🦶</span>
                                <p className="text-xs text-slate-450 leading-relaxed font-semibold">
                                  Bạn chưa có mục tiêu <strong>Micro-Habit</strong> nào kích hoạt cho danh sách thói quen hiện tại.
                                </p>
                                <p className="text-[10px] text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">
                                  Bạn có thể tự trang bị hành động siêu dễ bằng nút thông minh tự thiết lập bên dưới hoặc cấu hình tại tab "Quản Lý Thói Quen"!
                                </p>
                                <div className="pt-2">
                                  <button
                                    onClick={handleAutoEnableMicro}
                                    className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-[10px] uppercase tracking-widest rounded-xl transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-95"
                                  >
                                    ✨ Tự động trang bị Cổng Vi Mô cho thói quen lớn
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                {habits.filter(h => h.isMicro).map(h => {
                                  const isDone = completedHabitIds.includes(h.id);
                                  return (
                                    <div 
                                      key={h.id} 
                                      className={`bg-slate-950/70 border rounded-2xl p-4 transition-all flex flex-col justify-between gap-3 ${
                                        isDone 
                                          ? 'border-emerald-500/30 bg-emerald-500/5 shadow-[0_0_15px_rgba(16,185,129,0.05)]' 
                                          : 'border-slate-850 hover:border-slate-800'
                                      }`}
                                    >
                                      <div>
                                        <div className="flex items-center gap-1.5 mb-1">
                                          <span className="text-[9px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-amber-500 font-bold uppercase tracking-wider">
                                            Chủ đề: {h.title}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1">
                                          <span className="text-md">🦶</span>
                                          <p className="text-xs font-semibold text-slate-200">{h.microTitle || "Bắt đầu khởi động 1 phút"}</p>
                                        </div>
                                      </div>

                                      <div className="pt-2 border-t border-slate-900/60 flex items-center justify-between">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">
                                          Thưởng: +5 XP
                                        </span>
                                        
                                        <button
                                          onClick={() => handleToggleHabit(h.id, true)}
                                          className={`px-3 py-1.5 rounded-xl font-black text-[9px] uppercase tracking-widest transition-all cursor-pointer ${
                                            isDone 
                                              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' 
                                              : 'bg-amber-500 hover:bg-amber-400 text-slate-950 hover:scale-105 active:scale-95'
                                          }`}
                                        >
                                          {isDone ? '✓ ĐÃ VƯỢT CỬA' : '🦶 BƯỚC NGAY'}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div></div>

                    <div className="xl:col-span-1 h-full animate-in fade-in slide-in-from-right duration-700">
                      <Leaderboard 
                         userXp={profile.xp} 
                         userStreak={profile.currentStreak} 
                         userName={profile.displayName} 
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Level Stats */}
                    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 flex flex-col gap-5 shadow-xl">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                          <Trophy size={24} />
                        </div>
                        <div>
                          <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Danh hiệu: Kẻ Hủy Diệt Sự Trì Hoãn</div>
                          <div className="text-xl font-display font-semibold text-white">Cảnh Giới {Math.floor(profile.xp / 100) + 1} (Sắp thành Tiên rồi!)</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                          <span>Năng Lượng Level-up (Cần thêm doping?)</span>
                          <span>{profile.xp % 100} / 100</span>
                        </div>
                        <div className="w-full bg-slate-800/50 h-2 rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${profile.xp % 100}%` }}
                            className="h-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" 
                          />
                        </div>
                      </div>
                    </div>

                    {/* Side Quest Section */}
                    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 flex flex-col gap-4 shadow-xl relative overflow-hidden group">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-purple-500/10 rounded-lg text-purple-400">
                            <Sparkles size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Nhiệm Vụ Cơ Hội (Bào XP nè!)</p>
                            <div className="flex gap-2 mt-0.5">
                              <span className="text-[7px] px-1.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full font-bold uppercase tracking-tighter">Thói quen 2 phút</span>
                              <span className="text-[7px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full font-bold uppercase tracking-tighter">Tư duy phát triển</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => fetchSideQuest(true)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 text-slate-300 hover:text-amber-400 hover:bg-slate-700 rounded-lg text-[10px] font-bold uppercase transition-all shadow-sm"
                            title="Xin nhiệm vụ mới"
                          >
                            <RefreshCw size={12} /> Làm mới
                          </button>
                          {sideQuest.completed ? (
                            <div className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-[8px] font-bold uppercase rounded">Hoàn thành</div>
                          ) : (
                            <div className="px-2 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] font-bold uppercase rounded">Đang mở</div>
                          )}
                        </div>
                      </div>
                      
                      <div className={`p-4 rounded-xl border transition-all ${sideQuest.completed ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-slate-950 border-slate-800'}`}>
                        <p className={`text-sm leading-relaxed ${sideQuest.completed ? 'text-emerald-200 line-through' : 'text-slate-200'}`}>
                          "{sideQuest.text}"
                        </p>
                      </div>

                      {!sideQuest.completed && (
                        <button 
                          onClick={() => {
                            const newQuest = { ...sideQuest, completed: true };
                            setSideQuest(newQuest);
                            localStorage.setItem('habit_mosaic_side_quest', JSON.stringify(newQuest));
                            setProfile(p => ({ ...p, xp: p.xp + 50 })); // Bonus XP for side quest
                          }}
                          className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all"
                        >
                          Xác nhận hoàn thành (Lụm +50 XP)
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Story Progress Section */}
                  <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
                        <LibraryIcon size={20} />
                      </div>
                      <h3 className="text-xl font-serif italic text-white">Nhật Ký Hành Trình Vượt Lười</h3>
                    </div>

                    <div className="space-y-4">
                      {[25, 50, 75, 100].map(t => (
                        <div key={t} className={`flex gap-6 p-4 rounded-2xl border transition-all ${progress >= t ? 'bg-slate-900/60 border-slate-700' : 'bg-slate-950/20 border-slate-800/40 opacity-40'}`}>
                          <div className="flex-shrink-0 flex flex-col items-center">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${progress >= t ? 'border-amber-500 text-amber-500' : 'border-slate-800 text-slate-700'}`}>
                              <span className="text-xs font-bold">{t}%</span>
                            </div>
                            <div className="w-[1px] h-full bg-slate-800 my-2" />
                          </div>
                          
                          <div className="flex-1 pt-1">
                            <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${progress >= t ? 'text-amber-500' : 'text-slate-600'}`}>
                              {t === 100 ? 'Hồi kết' : `Chương ${t / 25}`}
                            </p>
                            <p className="text-sm text-slate-300 leading-relaxed italic">
                              {progress >= t 
                                ? (unlockedStory[currentTheme === 'custom' ? `custom_${customTitle}_${t}` : `${currentTheme}_${t}`] || "Đang giải mã chương hồi...")
                                : "Tiếp tục hoàn thành thói quen để hé lộ chương này."
                              }
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-800 flex items-center gap-5 shadow-xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent pointer-events-none" />
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                      <Bell size={24} />
                    </div>
                    <div className="flex-1">
                      <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Lời nhắc tối mật</div>
                      <div className="text-sm font-medium text-slate-200 leading-relaxed italic">
                        "{aiReminder}"
                      </div>
                    </div>
                  </div>
                  
                  <footer className="flex items-center justify-between pt-8 border-t border-slate-800/50">
                    <p className="text-xs text-slate-500 font-medium">Bản quyền © 2024 Habit Mosaic Studio</p>
                    <button 
                      onClick={shareResult}
                      className="px-8 py-2.5 bg-white text-slate-950 rounded-full font-bold text-xs uppercase tracking-[0.2em] hover:bg-amber-400 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95"
                    >
                      Chia sẻ thành quả
                    </button>
                  </footer>
                </motion.div>
              )}

              {activeTab === 'habits' && (
                <motion.div
                  key="habits"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <HabitManager 
                    habits={habits}
                    onAddHabit={addHabit}
                    onDeleteHabit={deleteHabit}
                    completedIds={completedHabitIds}
                    onToggleHabit={handleToggleHabit}
                    completedSubGoalIds={todayLog?.completedSubGoalIds || []}
                    onToggleSubGoal={handleToggleSubGoal}
                    onAddSubGoal={handleAddSubGoal}
                    onDeleteSubGoal={handleDeleteSubGoal}
                  />
                </motion.div>
              )}

              {activeTab === 'smarter' && (
                <motion.div key="v20-smarter" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <GoalSMARTER profile={profile} habits={habits} />
                </motion.div>
              )}
              {activeTab === 'okr' && (
                <motion.div key="v20-okr" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}>
                  <GoalOKR profile={profile} habits={habits} />
                </motion.div>
              )}
              {activeTab === 'community' && (
                <motion.div
                  key="community"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >

                  <LegendaryRivalry
                    profile={profile}
                    habits={habits}
                    logs={logs}
                    library={ebooks}
                    onAnnounce={(text) => handleShareToCommunity(text, 'achievement')}
                  />

                  <CommunityWorld
                    userName={profile.displayName}
                    userAvatar={`https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.displayName}`}
                    posts={socialPosts}
                    setPosts={setSocialPosts}
                    onPostCreated={() => { /* V11 CommunityWorld handles its own relationship-aware replies. */ }}
                    library={ebooks}
                    habits={habits}
                    logs={logs}
                  />
                </motion.div>
              )}

              {activeTab === 'collection' && (
                <motion.div
                  key="collection"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full"
                >
                  <Collection 
                    profile={profile}
                    archives={archives}
                    ebooks={ebooks}
                    onUpdateProfile={(p) => setProfile(prev => ({ ...prev, ...p }))}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>
      </div>

      <CuriosityRewardWatcher habits={habits} logs={logs} />
      <VariableRewardOverlay reward={activeReward} onClose={() => setActiveReward(null)} />
      {/* Floating Bottom Nav for Mobile Only */}
      <nav className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 px-2 py-2 rounded-2xl shadow-2xl z-50 flex items-center gap-1 max-w-[96vw] overflow-x-auto">
        <NavButton active={activeTab === 'mosaic'} onClick={() => setActiveTab('mosaic')} icon={<Sparkles size={18} />} label="Bức tranh" />
        <NavButton active={activeTab === 'habits'} onClick={() => setActiveTab('habits')} icon={<ListTodo size={18} />} label="Thói quen" />
        <NavButton active={activeTab === 'community'} onClick={() => setActiveTab('community')} icon={<Users size={18} />} label="Cộng đồng" />
        <NavButton active={activeTab === 'smarter'} onClick={() => setActiveTab('smarter')} icon={<Edit3 size={18} />} label="SMARTER" />
        <NavButton active={activeTab === 'okr'} onClick={() => setActiveTab('okr')} icon={<Award size={18} />} label="OKR" />
        <NavButton active={activeTab === 'collection'} onClick={() => setActiveTab('collection')} icon={<Trophy size={18} />} label="Bộ sưu tập" />
      </nav>

      {/* Virtual Companion & Psychological Motivation */}
      <GhostNotifications />
      <Companion xp={profile.xp} streak={profile.currentStreak} activeSpiritId={profile.activeSpiritId} />
    </div>
  );
};

const SidebarNavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-xl border transition-all ${
      active 
        ? 'bg-slate-800 border-slate-700 text-white shadow-lg' 
        : 'bg-transparent border-transparent text-slate-500 hover:bg-slate-800/30 hover:text-slate-300'
    }`}
  >
    <div className={`p-1.5 rounded-lg ${active ? 'bg-slate-900' : 'bg-transparent'}`}>
      {icon}
    </div>
    <span className="text-sm font-semibold tracking-tight">{label}</span>
  </button>
);

const Tabs = ({ active, onChange }: { active: string, onChange: (v: any) => void }) => {
  return (
    <div className="hidden md:flex items-center gap-1 p-1 bg-slate-100 rounded-xl w-fit">
      {(['mosaic', 'habits'] as const).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
            active === tab 
              ? 'bg-white text-slate-900 shadow-sm' 
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab === 'mosaic' && 'Bức tranh'}
          {tab === 'habits' && 'Thói quen'}
        </button>
      ))}
    </div>
  );
};

const NavButton = ({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${
      active ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'
    }`}
  >
    {icon}
    {active && <span className="text-xs font-bold whitespace-nowrap">{label}</span>}
  </button>
);

export default App;
