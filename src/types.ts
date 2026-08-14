/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DailyMicroGoal {
  id: string;
  title: string;
  category: 'health' | 'mindset' | 'wisdom' | 'creativity' | 'memory' | 'logic' | 'language';
  target: number;
  current: number;
  unit: string;
  isCompleted: boolean;
  xpReward: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  currentStreak: number;
  longestStreak: number;
  lastCheckIn?: string;
  xp: number;
  shiningPixels: number;
  level?: number;
  unlockedBadgeIds?: string[];
  unlockedSpiritIds?: string[];
  activeSpiritId?: string;
  pokemons?: Array<{id: number, name: string, sprite: string}>;
}

export type Frequency = 'daily' | 'weekly';

export interface HabitSubGoal {
  id: string;
  title: string;
}

export interface Habit {
  id: string;
  userId: string;
  title: string;
  frequency: Frequency;
  createdAt: string;
  isMicro?: boolean;
  microTitle?: string;
  subGoals?: HabitSubGoal[];
}

export interface DailyLog {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  completedHabitIds: string[];
  completedSubGoalIds?: string[];
}

export interface MosaicArchive {
  id: string;
  userId: string;
  month: string;
  year: number;
  imageUrl: string;
  completionRate: number;
}

export interface MosaicPiece {
  dayIndex: number;
  isCompleted: boolean;
  isSparkling: boolean;
  isDusty: boolean;
}

export interface EbookChapter {
  id: string;
  title: string;
  content: string;
}
export interface DuelObjective {
  id: string;
  title: string;
  target: number;
  current: number;
  type: 'habit_count' | 'reading_pages' | 'streak_days' | 'xp_gain';
}

export interface VirtualDuel {
  id: string;
  mentorId: string;
  mentorName: string;
  mentorAvatar: string;
  objectives: DuelObjective[];
  mentorProgress: number; // Overall percentage 0-100
  status: 'active' | 'won' | 'lost';
  deadline: string;
  createdAt: string;
}

export interface Ebook {
  id: string;
  title: string;
  author: string;
  coverImage: string | null;
  chapters: EbookChapter[];
  currentChapterIndex: number;
  readChapters: string[]; // List of completed chapter IDs / page markers
  format?: 'txt' | 'pdf';
  pdfUrl?: string; // Blob Object URL for active reading session
  currentPdfPage?: number;
  totalPdfPages?: number;
  unlockedChaptersCount?: number;
  unlockedPagesCount?: number;
}

export interface SocialComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
}

export interface SocialPost {
  id: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  imageUrl?: string;
  type: 'mosaic' | 'habit' | 'ebook' | 'achievement' | 'pet';
  createdAt: string;
  likes: number;
  comments: SocialComment[];
  communityIntent?: 'confide' | 'companion' | 'challenge';
  communitySession?: {
    mode: 'confide' | 'companion' | 'challenge';
    memberIds: string[];
    startedAt: string;
    checkInAt: string;
    habitId?: string;
    habitTitle?: string;
    npcCompletedIds: string[];
    userCompleted: boolean;
    checkInSent?: boolean;
    status: 'active' | 'completed';
  };
  challenge?: {
    habitId?: string;
    title: string;
    deadline: string;
    participants: number;
    participantIds?: string[];
  };
}


export interface VariableReward {
  type: 'xp' | 'shining_pixel' | 'cheeky_praise' | 'pokemon';
  value: any;
  message: string;
}
