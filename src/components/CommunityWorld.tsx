import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Activity, Brain, CalendarClock, CheckCircle2, Clock3, Eye, HandHeart, Heart, Leaf, MessageCircle, Send, Sparkles, Swords, Target, Timer, Users, Zap } from 'lucide-react';
import { DailyLog, Ebook, Habit, SocialComment, SocialPost } from '../types';
import { characterConstitutionFor, personaPairChemistryLine } from '../lib/characterConstitutionV236';
import { getLifeStoryMomentsV238, getNpcLifeCardV238, getOpenLifeArcsV238, heartbeatLifeStoriesV238, lifeStoryPromptContextV238, storyAwareFallbackV238 } from '../lib/lifeStoryV238';
import {
  advanceSocialRitual, chooseRitualMembers, completeRitualSpeech, createSocialRitual, inferRitualNeed,
  initialRitualSpeakers, migrateSocialRitual, recordRitualMessage, recordSupportAction, ritualEventLabel,
} from '../lib/socialRitualEngineV239';
import type { SocialRitualEvent, SocialRitualScheduledAction } from '../types';
// V21_LIVING_SOCIETY_INTEGRATION
import {
  chooseLivingActor, chooseSocialPartner, decideLivingEvent, drainDueUserReactions, expertForTopic, getAmbientMoments, getNpcPresenceCard, getStoryContextForNpc,
  getWorldContextForNpc, getWorldTopics, heartbeatLivingSociety, innerLifeContextForNpc, memoriesFromUserText, openOrAdvanceThread, queueNpcPostReactions,
  propagateWorldKnowledge, queueUserPostReactions, recordNpcInteraction, remember, soulFallbackReply, soulPromptContext, followUpReplyV237, syncWorldAwareness,
  updateRelationship, worldAwareFallback,
} from '../lib/livingSocietyV21';

interface CommunityWorldProps {
  userName: string;
  userAvatar: string;
  posts: SocialPost[];
  setPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  onPostCreated: (post: SocialPost) => void;
  library: Ebook[];
  habits: Habit[];
  logs: DailyLog[];
}

type RelationshipStage = 'Người lạ' | 'Biết mặt' | 'Bạn đồng hành' | 'Bạn thân' | 'Rival';
type WorldEventKind = 'routine' | 'npc_win' | 'npc_fail' | 'banter' | 'callback' | 'comeback' | 'relationship' | 'milestone' | 'user_signal' | 'duel' | 'world_topic' | 'world_reaction' | 'world_debate' | 'world_discovery' | 'world_followup';
type EventTier = 1 | 2 | 3 | 4 | 5;
type SocialVisibility = 'silent' | 'timeline' | 'feed';
type SimulationMode = 'live' | 'detail' | 'compressed-day' | 'highlights' | 'summary';
type CommunityIntent = 'confide' | 'companion' | 'challenge';

const COMMUNITY_INTENTS: { id: CommunityIntent; label: string; hint: string }[] = [
  { id: 'confide', label: 'Tâm sự', hint: 'Mình chỉ cần được lắng nghe' },
  { id: 'companion', label: 'Cùng tiến', hint: 'Cho mình một người đồng hành' },
  { id: 'challenge', label: 'Mở thử thách', hint: 'Cùng làm một việc thật' },
];

interface NpcRoutine {
  wakeHour: number;
  focusHours: number[];
  socialHours: number[];
  lowEnergyHours: number[];
  restHour: number;
}

interface NpcEmotionState {
  joy: number;
  sadness: number;
  frustration: number;
  affection: number;
  pride: number;
  envy: number;
  worry: number;
  hope: number;
  energy: number;
  vulnerability: number;
  primaryCause: string;
  secondaryCause?: string;
  lastChangedAt: string;
}

interface NpcSocialEmotion {
  affection: number;
  irritation: number;
  respect: number;
  lastReason: string;
  lastChangedAt: string;
}

interface NpcState {
  id: string;
  relationship: number;
  mood: 'sunny' | 'focused' | 'tired' | 'chaotic' | 'competitive';
  lifeProgress: number;
  failures: number;
  wins: number;
  comedyDNA: string[];
  runningGag: string;
  recentJokes: string[];
  memories?: string[];
  memoryBank?: { facts: string[]; relationshipEvents: string[]; insideJokes: string[]; recentEvents: string[]; summary: string };
  humorFatigue?: number;
  jokeCooldowns?: Record<string, number>;
  socialLinks?: Record<string, number>;
  lifeGoal?: string;
  lifeStage?: string;
  routine?: NpcRoutine;
  currentStreak?: number;
  recoveryNeed?: number;
  lastOutcomeAt?: string;
  emotionalState?: NpcEmotionState;
  socialEmotions?: Record<string, NpcSocialEmotion>;
}

interface WorldEvent {
  id: string;
  npcId: string;
  npcName: string;
  npcAvatar: string;
  kind: WorldEventKind;
  tier: EventTier;
  visibility: SocialVisibility;
  content: string;
  createdAt: string;
  actionHint?: string;
  comedyStyle?: string;
  partnerIds?: string[];
  source: 'offline' | 'live';
  aiEnriched?: boolean;
}

interface OfflineSummary {
  from: string;
  to: string;
  durationMinutes: number;
  simulatedEvents: number;
  publishedPosts: number;
  generatedComments: number;
  relationshipChanges: number;
  mode: SimulationMode;
  headline: string;
}

interface WorldState {
  lastSimulatedAt: number;
  lastOpenedAt: number;
  npc: Record<string, NpcState>;
  events: WorldEvent[];
  offlineGenerated: number;
  publishedEventIds: string[];
  lastAiEnrichedAt: number;
  offlineSummary?: OfflineSummary;
  lastSeenCompletionIds: string[];
  recentContentFingerprints: string[];
  lastPublishedByNpc: Record<string, number>;
  simulatorVersion: number;
}

interface SimulationResult {
  world: WorldState;
  feedEvents: WorldEvent[];
  summary?: OfflineSummary;
}

const WORLD_KEY = 'habit_mosaic_community_world_v20_6';
const V19_WORLD_KEY = 'habit_mosaic_community_world_v19';
const V18_WORLD_KEY = 'habit_mosaic_community_world_v18';
const V17_WORLD_KEY = 'habit_mosaic_community_world_v17';
const V16_WORLD_KEY = 'habit_mosaic_community_world_v16';
const V15_WORLD_KEY = 'habit_mosaic_community_world_v15';
const V14_WORLD_KEY = 'habit_mosaic_community_world_v14';
const V13_WORLD_KEY = 'habit_mosaic_community_world_v13';
const V12_WORLD_KEY = 'habit_mosaic_community_world_v12';
const V11_WORLD_KEY = 'habit_mosaic_community_world_v11';
// V16: fixed fictional cast. Legendary / celebrity figures NEVER enter the everyday Community.
const avatar = (seed: string) => `https://api.dicebear.com/9.x/lorelei/svg?seed=${encodeURIComponent(seed)}&backgroundColor=0f172a,164e63,581c87,713f12,7f1d1d`;
const SOCIAL_PERSONAS: any[] = [
  { id:'hm-hai', name:'Hải Quay Xe', role:'Bạn hay bẻ lái', avatar:avatar('HaiQuayXe') },
  { id:'hm-tram', name:'Trâm Trầm Tư', role:'Bạn biết lắng nghe', avatar:avatar('TramTramTu') },
  { id:'hm-mai', name:'Mai Sát Muối', role:'Bạn cà khịa có tâm', avatar:avatar('MaiSatMuoi') },
  { id:'hm-phuc', name:'Phúc Lấp Liếm', role:'Vua tự bào chữa rồi tự bóc mình', avatar:avatar('PhucLapLiem') },
  { id:'hm-son', name:'Sơn Sát Thủ', role:'Đối thủ kỷ luật', avatar:avatar('SonSatThu') },
  { id:'hm-tu', name:'Tú Tò Mò', role:'Bạn thích hỏi vì sao', avatar:avatar('TuToMo') },
  { id:'hm-ken', name:'Ken', role:'Bạn deadpan', avatar:avatar('KenDeadpan') },
  { id:'hm-maya', name:'Maya', role:'Bạn ấm áp nhưng không nịnh', avatar:avatar('MayaWarm') },
  { id:'hm-k', name:'Thám Tử K', role:'Bạn soi pattern', avatar:avatar('ThamTuK') },
  { id:'hm-leo', name:'Leo', role:'Rival thích bảng điểm', avatar:avatar('LeoRival') },
  { id:'hm-aiko', name:'Aiko', role:'Chuyên gia fail rồi quay lại', avatar:avatar('AikoComeback') },
  { id:'hm-nora', name:'Nora', role:'Người thực tế', avatar:avatar('NoraPractical') },
];

type CareReading = NonNullable<SocialPost['communitySession']>['careReading'];

const inferCareReading = (content: string, intent: CommunityIntent): CareReading => {
  const text = String(content || '').trim();
  const lower = text.toLocaleLowerCase('vi-VN');
  const anchor = (text.split(/[.!?\n]/).find(part => part.trim().length >= 4) || text).trim().slice(0, 88);
  const hasLoss = /mất tiền|mất việc|bị lừa|thiệt hại|mất mát|đánh mất/.test(lower);
  const hasAnger = /ức chế|tức|bực|cáu|điên|khó chịu|bất công/.test(lower);
  const hasShame = /xấu hổ|nhục|tệ|vô dụng|thất bại|lại hỏng|lại fail/.test(lower);
  const hasExhaustion = /kiệt sức|mệt|đuối|cạn pin|quá tải|không chịu nổi/.test(lower);
  const hasLoneliness = /cô đơn|một mình|không ai|chẳng ai|có ai không/.test(lower);
  const hasFear = /sợ|lo|hoảng|bất an|không biết.*sao/.test(lower);
  const primaryEmotion = hasLoss && hasAnger ? 'tổn thất kèm bức bối'
    : hasLoss ? 'tổn thất'
      : hasShame ? 'thất vọng và dễ tự trách'
        : hasExhaustion ? 'quá tải'
          : hasLoneliness ? 'cô độc'
            : hasFear ? 'lo lắng'
              : hasAnger ? 'bực và bất lực'
                : intent === 'challenge' ? 'quyết tâm cạnh tranh'
                  : intent === 'companion' ? 'muốn có người cùng bước'
                    : 'cảm xúc chưa đủ rõ';
  let intensity = /rất|quá|không chịu nổi|tuyệt vọng|kiệt sức/.test(lower) ? 4 : 2;
  if (hasLoss || hasShame || hasLoneliness) intensity += 1;
  intensity = Math.min(5, intensity);
  const need: CareReading['need'] = /cho.*lời khuyên|phải làm sao|nên làm gì|giúp.*cách/.test(lower) ? 'advice'
    : /tại sao|vì sao|không hiểu|gỡ rối/.test(lower) ? 'clarify'
      : /ở đây|có ai|một mình|cùng tôi|cùng nhau/.test(lower) ? 'company'
        : intent === 'challenge' ? 'challenge'
          : intent === 'companion' ? 'company'
            : 'listen';
  const misreadRisk = intensity >= 4 && need !== 'advice'
    ? 'khuyên hoặc đùa quá sớm'
    : primaryEmotion === 'cảm xúc chưa đủ rõ'
      ? 'tự kết luận thay người dùng'
      : 'nhắc lại sáo rỗng mà không chạm đúng chi tiết';
  return { primaryEmotion, intensity, need, anchor, misreadRisk };
};

const groundedCareReply = (personaId: string, reading: CareReading, content: string) => {
  const lower = content.toLocaleLowerCase('vi-VN');
  const loss = /mất tiền|bị lừa|thiệt hại/.test(lower);
  if (personaId === 'hm-tram') {
    if (loss) return 'Mất tiền đã đau; chữ “ức chế” nghe như còn có phần bất lực hoặc bất công ở đó. Tôi đoán có đúng không?';
    if (reading.primaryEmotion.includes('tự trách')) return 'Tôi nghe bạn kể một chuyện đã hỏng, nhưng bạn đang nói về mình như thể chính bạn là thứ bị hỏng. Hai chuyện đó khác nhau.';
    if (reading.primaryEmotion === 'quá tải') return 'Nghe như bạn đã phải gồng lâu hơn một ngày. Muốn tôi hỏi tiếp, hay chỉ ngồi đây một lúc?';
    return `Tôi để ý đoạn “${reading.anchor}”. Cái nặng nhất là chuyện đã xảy ra, hay cảm giác còn sót lại sau đó?`;
  }
  if (personaId === 'hm-maya') {
    if (loss) return 'Tôi không kéo bạn sang “nghĩ tích cực” lúc này. Bạn muốn kể phần tiền đã mất, hay phần khiến bạn thấy bị dồn nhất?';
    if (reading.primaryEmotion.includes('bực')) return 'Cơn bực này có vẻ đang giữ hộ một điều khác. Có phải bạn thấy mình không kiểm soát được chuyện đó?';
    if (reading.need === 'company') return 'Tôi ở đây. Chưa cần giải quyết ngay—bạn muốn kể tiếp thì kể, muốn im một chút cũng được.';
    return `Tôi chưa chắc đã hiểu hết câu “${reading.anchor}”. Bạn muốn được nghe lại cho rõ, hay muốn cùng gỡ một nút thôi?`;
  }
  return `Lúc trước bạn nói “${reading.anchor}”. Giờ nếu chấm độ nặng từ 1 đến 10, nó đang ở mức nào?`;
};

const ritualCareFallback = (personaId: string, text: string, need: string | undefined) => {
  const lower = text.toLocaleLowerCase('vi-VN');
  const beingDismissed = /giả vờ.*không|coi như.*không|phủi|chối|không nhận/.test(lower);
  if (personaId === 'hm-hai') return 'Tôi không biết nói gì cho hay. Nhưng tôi đang đọc đây; ông cứ kể tiếp.';
  if (personaId === 'hm-tu') return beingDismissed
    ? 'Vậy phần làm ông bực không chỉ là tiền, mà là cách người đó phủi luôn chuyện đã xảy ra. Tôi nghe tiếp.'
    : 'Tôi chưa kết luận gì đâu. Ông cứ kể tiếp phần ông muốn kể.';
  if (personaId === 'hm-mai') return 'Nay tôi cất muối. Ông tự bực đủ rồi; cứ nói tiếp đi.';
  if (personaId === 'hm-son' || personaId === 'hm-leo') return 'Tôi không giỏi đoạn này. Nhưng tôi có mặt. Kể tiếp đi.';
  if (personaId === 'hm-ken') return 'Đã đọc. Tôi không chen bản sửa vào lúc này.';
  if (personaId === 'hm-aiko') return 'Tôi nghe đây. Không cần biến nó thành bài học ngay.';
  if (personaId === 'hm-nora') return 'Ừ. Chưa cần xử lý gì cả. Nói nốt phần đang mắc đi.';
  if (personaId === 'hm-maya') return 'Tôi ở đây. Bạn muốn kể tiếp thì kể; muốn dừng một chút cũng được.';
  if (need === 'LISTEN_ONLY' || need === 'VENT') return 'Ừ. Kể tiếp đi. Tôi nghe.';
  return '';
};

const circleOpeningLine = (personaId: string, intent: CommunityIntent, content: string, habitTitle = '') => {
  const excerpt = content.length > 74 ? `${content.slice(0, 71).trim()}…` : content;
  if (intent === 'confide') {
    return groundedCareReply(personaId, inferCareReading(content, intent), content);
  }
  if (intent === 'companion') {
    if (personaId === 'hm-aiko') return `Tôi vào nhóm. “${habitTitle || excerpt}” — hôm nay tôi cũng làm một lượt, xong sẽ quay lại báo.`;
    if (personaId === 'hm-hai') return 'Cho tôi một suất. Nhưng đừng họp khởi động 40 phút nhé; bắt đầu 10 phút trước đã.';
    return `Chốt việc nhé: ${habitTitle || excerpt}. Nhóm này đếm hành động, không đếm lời hứa.`;
  }
  if (personaId === 'hm-son') return `Nhận kèo: ${habitTitle || excerpt}. Tôi không nhường đâu.`;
  if (personaId === 'hm-leo') return 'Đã vào bảng điểm. 24 giờ, ai làm xong trước thì lên tiếng.';
  return 'Tôi nhận kèo. Báo trước: tôi chuyên hụt nhịp đầu rồi quay lại ở đoạn cuối.';
};

const circleProgressLine = (personaId: string, intent: CommunityIntent, habitTitle = '', careReading?: CareReading) => {
  if (intent === 'confide') return careReading
    ? `Lúc trước bạn nói “${careReading.anchor}”. Giờ nếu chấm độ nặng từ 1 đến 10, nó đang ở mức nào?`
    : 'Tôi quay lại hỏi thật: giờ chuyện này còn nặng như lúc bạn viết không?';
  const persona = SOCIAL_PERSONAS.find((item:any) => item.id === personaId);
  if (intent === 'companion') return `${persona?.name || 'Một người trong nhóm'} báo phần mình: “${habitTitle}” đã xong. Không để bạn làm một mình.`;
  return `${persona?.name || 'Đối thủ'} đã hoàn thành “${habitTitle}”. Bảng điểm vừa đổi.`;
};

const circleComment = (personaId: string, content: string, id: string, createdAt: string): SocialComment => {
  const persona = SOCIAL_PERSONAS.find((item:any) => item.id === personaId) || SOCIAL_PERSONAS[0];
  return { id, authorId: persona.id, authorName: persona.name, authorAvatar: persona.avatar, content, createdAt };
};
const FORBIDDEN_SOCIAL_NAME_PATTERN = /yoda|thomas edison|edison|warren buffett|buffett|leonardo|da vinci|elon musk|steve jobs|oprah|angela merkel|gordon ramsay|einstein|marie curie|curie|musashi|miyamoto|benjamin franklin|franklin|charles darwin|darwin|hemingway|beethoven|nikola tesla|tesla|newton|confucius|bill gates|mark zuckerberg|jeff bezos|barack obama|trump/i;
const isForbiddenSocialName = (name: string) => FORBIDDEN_SOCIAL_NAME_PATTERN.test(String(name || ''));

const COMEDY_STYLES = [
  'Quan sát', 'Tình huống', 'Phi lý', 'Tự trào', 'Chơi chữ', 'Kể chuyện hài',
  'Nhại/Parody', 'Châm biếm', 'Ngẫu hứng', 'Mo lei tau', 'Deadpan',
  'Hiểu lầm', 'Lặp rồi phá', 'Nghiêm trọng hóa', 'Bất cân xứng thông tin',
  'Phản ứng quá mức', 'Leo thang', 'Callback', 'Roast nhẹ', 'Teasing có kiểm soát'
];

const MOODS: NpcState['mood'][] = ['sunny', 'focused', 'tired', 'chaotic', 'competitive'];

const hash = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h >>> 0);
};

const pick = <T,>(items: T[], seed: number): T => items[Math.abs(seed) % items.length];
const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));
const localDateKey = (date = new Date()) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

const relationshipStage = (score: number): RelationshipStage => {
  if (score >= 82) return 'Rival';
  if (score >= 65) return 'Bạn thân';
  if (score >= 42) return 'Bạn đồng hành';
  if (score >= 20) return 'Biết mặt';
  return 'Người lạ';
};

const isSeriousText = (text: string) => /kiệt sức|tuyệt vọng|buồn|mất mát|đau|khủng hoảng|thất bại nặng|không ổn|bệnh|tang|chia tay/i.test(text);

const emotionForText = (text: string) => {
  if (isSeriousText(text)) return 'heavy';
  if (/mệt|đuối|cạn pin|buồn ngủ|hết sức/i.test(text)) return 'tired';
  if (/bực|cáu|ức|khó chịu|điên/i.test(text)) return 'frustrated';
  if (/nản|xấu hổ|tệ|chán|thua|fail/i.test(text)) return 'down';
  if (/vui|xong|làm được|thắng|tốt quá|tự hào/i.test(text)) return 'proud';
  return 'neutral';
};
const simpleHumanText = (text: string) => String(text || '')
  .replace(/^[^:\n]{1,35}:\s*/gm, '')
  .replace(/tối ưu(?: hóa)?/gi, 'làm gọn')
  .replace(/workflow/gi, 'cách làm')
  .replace(/datapoint|data/gi, 'dữ liệu')
  .replace(/recovery plan/gi, 'cách quay lại')
  .replace(/scope/gi, 'phần việc')
  .replace(/adherence/gi, 'độ đều')
  .replace(/pattern/gi, 'kiểu lặp')
  .replace(/milestone/gi, 'mốc')
  .replace(/output/gi, 'thứ làm ra')
  .replace(/pending/gi, 'đang chờ')
  .replace(/villain/gi, 'thủ phạm')
  .replace(/material/gi, 'chuyện để đùa')
  .replace(/recovery/gi, 'quay lại')
  .replace(/reset/gi, 'làm lại')
  .replace(/benchmark/gi, 'mốc so sánh')
  .replace(/comeback/gi, 'quay lại')
  .replace(/round/gi, 'lượt')
  .replace(/to-do/gi, 'việc chưa làm')
  .replace(/did-list/gi, 'việc đã xong')
  .replace(/checklist/gi, 'danh sách')
  .replace(/streak/gi, 'chuỗi')
  .replace(/encore/gi, 'màn nữa')
  .replace(/drama/gi, 'chuyện lớn')
  .replace(/redesign/gi, 'làm lại')
  .replace(/screenshot/gi, 'ảnh chụp')
  .replace(/case update/gi, 'cập nhật')
  .replace(/checkbox/gi, 'ô đánh dấu')
  .replace(/bug/gi, 'lỗi')
  .replace(/series/gi, 'cả chuỗi')
  .replace(/backlog/gi, 'đống việc cũ')
  .replace(/[ \t]{2,}/g, ' ')
  .replace(/\n{3,}/g, '\n\n')
  .trim();

// V14 Anti-Repetition Engine: normalize away names, quoted habit titles and numbers so
// two posts using the same skeleton are treated as repeats even when another NPC says it.
const contentFingerprint = (text: string) => text
  .toLocaleLowerCase('vi-VN')
  .replace(/[“”\"'][^“”\"']{1,90}[“”\"']/g, '<q>')
  .replace(/\b\d+(?:[.,]\d+)?\b/g, '#')
  .replace(/[^\p{L}\p{N}<>]+/gu, ' ')
  .replace(/\s+/g, ' ')
  .trim()
  .slice(0, 180);

const eventSubject = (event: Partial<WorldEvent>) => {
  const quoted = String(event.content || '').match(/[“\"]([^”\"]{1,90})[”\"]/);
  return quoted?.[1]?.toLocaleLowerCase('vi-VN').trim() || '';
};

const dedupeMigratedEvents = (items: WorldEvent[]) => {
  const sorted = [...items].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const kept: WorldEvent[] = [];
  const exactSeen = new Map<string, number>();
  const signalSeen = new Map<string, number>();
  const skeletonSeen = new Map<string, number>();
  for (const event of sorted) {
    const at = new Date(event.createdAt).getTime() || 0;
    const exact = String(event.content || '').trim().toLocaleLowerCase('vi-VN');
    const skeleton = `${event.kind || 'event'}:${contentFingerprint(String(event.content || ''))}`;
    const subject = event.kind === 'user_signal' ? eventSubject(event) : '';
    const exactAt = exactSeen.get(exact) || 0;
    const skeletonAt = skeletonSeen.get(skeleton) || 0;
    const signalAt = subject ? (signalSeen.get(subject) || 0) : 0;
    // Remove the V13 bug pattern: the same completed habit being re-announced every live tick.
    if (subject && signalAt && Math.abs(signalAt - at) < 18 * 60 * 60_000) continue;
    if (exact && exactAt && Math.abs(exactAt - at) < 7 * 24 * 60 * 60_000) continue;
    if (skeleton && skeletonAt && Math.abs(skeletonAt - at) < 6 * 60 * 60_000) continue;
    kept.push(event);
    if (exact) exactSeen.set(exact, at);
    if (skeleton) skeletonSeen.set(skeleton, at);
    if (subject) signalSeen.set(subject, at);
    if (kept.length >= 120) break;
  }
  return kept;
};

const pickFresh = (items: string[], seed: number, recent: Set<string>) => {
  if (!items.length) return '';
  for (let offset = 0; offset < items.length; offset++) {
    const candidate = items[(Math.abs(seed) + offset) % items.length];
    if (!recent.has(contentFingerprint(candidate))) return candidate;
  }
  return items[Math.abs(seed) % items.length];
};

type VoiceArchetype = 'analyst' | 'deadpan' | 'warm' | 'rival' | 'pragmatic' | 'wordplay';
const voiceForPersona = (persona: any): VoiceArchetype => {
  const text = `${persona?.name || ''} ${persona?.role || ''}`.toLocaleLowerCase('vi-VN');
  if (/sherlock|thám tử|phân tích|analyst|detect/.test(text)) return 'analyst';
  if (/coach|oprah|mentor|đồng hành|support/.test(text)) return 'warm';
  if (/rival|thách|chiến|musashi|competitive/.test(text)) return 'rival';
  if (/steve|jobs|focus|thiết kế|builder|maker/.test(text)) return 'pragmatic';
  const voices: VoiceArchetype[] = ['deadpan', 'wordplay', 'analyst', 'warm', 'rival', 'pragmatic'];
  return pick(voices, hash(persona?.id || persona?.name || 'voice'));
};

type PostIntent = 'observe' | 'vent' | 'self_roast' | 'tease' | 'banter' | 'support' | 'reflect' | 'flex' | 'problem_solve' | 'callback';
interface CharacterVoiceProfile {
  archetype: VoiceArchetype;
  cadence: 'short' | 'mixed' | 'reflective';
  warmth: number;
  roast: number;
  selfRoast: number;
  wordplay: number;
  banter: number;
  advice: number;
  signature: string;
}

const characterVoiceForPersona = (persona: any): CharacterVoiceProfile => {
  const text = `${persona?.name || ''} ${persona?.role || ''}`.toLocaleLowerCase('vi-VN');
  const constitution = characterConstitutionFor(persona?.id || '');
  const exact = (pattern: RegExp, profile: CharacterVoiceProfile) => pattern.test(text) ? profile : null;
  const known =
    exact(/hải quay xe/, { archetype: 'wordplay', cadence: 'short', warmth: .45, roast: .72, selfRoast: .78, wordplay: .82, banter: .88, advice: .12, signature: 'bẻ lái, nói nhanh, tự vạch mặt lý do của mình' }) ||
    exact(/trâm trầm tư/, { archetype: 'warm', cadence: 'reflective', warmth: .82, roast: .15, selfRoast: .34, wordplay: .28, banter: .38, advice: .28, signature: 'ít chữ, quan sát tinh, hài khô rất nhẹ' }) ||
    exact(/mai sát muối/, { archetype: 'deadpan', cadence: 'short', warmth: .42, roast: .86, selfRoast: .55, wordplay: .52, banter: .9, advice: .1, signature: 'một câu sát thương rồi thôi, không giảng đạo' }) ||
    exact(/phúc lấp liếm/, { archetype: 'wordplay', cadence: 'mixed', warmth: .52, roast: .5, selfRoast: .9, wordplay: .9, banter: .82, advice: .08, signature: 'biện hộ hài, chơi chữ, tự lộ sơ hở' }) ||
    exact(/sơn sát thủ/, { archetype: 'rival', cadence: 'short', warmth: .28, roast: .62, selfRoast: .24, wordplay: .22, banter: .66, advice: .2, signature: 'cộc, cạnh tranh, chốt gọn' }) ||
    exact(/tú tò mò/, { archetype: 'analyst', cadence: 'mixed', warmth: .62, roast: .25, selfRoast: .42, wordplay: .55, banter: .5, advice: .26, signature: 'hỏi ngược, tò mò, nhìn vấn đề từ góc lạ' }) ||
    exact(/ken/, { archetype: 'deadpan', cadence: 'short', warmth: .42, roast: .72, selfRoast: .58, wordplay: .48, banter: .86, advice: .12, signature: 'deadpan, nói như không đùa nhưng rõ ràng đang đùa' }) ||
    exact(/maya/, { archetype: 'warm', cadence: 'mixed', warmth: .88, roast: .22, selfRoast: .5, wordplay: .38, banter: .56, advice: .3, signature: 'ấm, quan sát, đùa để giảm áp lực' }) ||
    exact(/sherlock|thám tử/, { archetype: 'analyst', cadence: 'mixed', warmth: .32, roast: .55, selfRoast: .16, wordplay: .36, banter: .6, advice: .35, signature: 'data, pattern, kết luận khô' }) ||
    exact(/leo|rival/, { archetype: 'rival', cadence: 'short', warmth: .3, roast: .68, selfRoast: .22, wordplay: .25, banter: .72, advice: .18, signature: 'thách thức, ít khen, thích bảng điểm' }) ||
    exact(/aiko/, { archetype: 'warm', cadence: 'mixed', warmth: .8, roast: .18, selfRoast: .82, wordplay: .42, banter: .52, advice: .24, signature: 'hay fail rồi tự trào và comeback' }) ||
    exact(/nora/, { archetype: 'pragmatic', cadence: 'short', warmth: .58, roast: .28, selfRoast: .4, wordplay: .26, banter: .4, advice: .42, signature: 'thực tế, cắt scope, không màu mè' });
  if (known) return { ...known, signature: `${known.signature}; lõi: ${constitution.coreWant}; sợ: ${constitution.coreFear}; care: ${constitution.careLanguage}` };
  const seed = hash(persona?.id || persona?.name || 'voice-profile');
  const archetype = voiceForPersona(persona);
  const base: Record<VoiceArchetype, Omit<CharacterVoiceProfile, 'archetype' | 'signature'>> = {
    analyst: { cadence: 'mixed', warmth: .38, roast: .42, selfRoast: .2, wordplay: .32, banter: .48, advice: .36 },
    deadpan: { cadence: 'short', warmth: .4, roast: .68, selfRoast: .5, wordplay: .42, banter: .8, advice: .12 },
    warm: { cadence: 'mixed', warmth: .82, roast: .18, selfRoast: .48, wordplay: .34, banter: .5, advice: .3 },
    rival: { cadence: 'short', warmth: .3, roast: .66, selfRoast: .24, wordplay: .25, banter: .7, advice: .2 },
    pragmatic: { cadence: 'short', warmth: .55, roast: .28, selfRoast: .34, wordplay: .22, banter: .38, advice: .42 },
    wordplay: { cadence: 'mixed', warmth: .48, roast: .52, selfRoast: .62, wordplay: .84, banter: .78, advice: .14 },
  };
  return { archetype, ...base[archetype], signature: `${constitution.socialMask}; ${constitution.attentionBias}; ${constitution.careLanguage}` };
};

const isProblemText = (text: string) => /trì hoãn|lười|không làm|chưa làm|kẹt|khó bắt đầu|bỏ lỡ|quên|fail|thất bại|nản|mất động lực|không biết|không thể|chậm|quá tải/i.test(text);

const contextualWordplay = (subject: string, seed: number) => {
  const s = subject.toLocaleLowerCase('vi-VN');
  const packs: Array<[RegExp, string[]]> = [
    [/nước|2l|uống/, ['Nước không biết giận. Chai vẫn nằm đó, chờ cậu nhớ ra.', 'Hôm nay đừng để bình nước làm đồ trang trí.', 'Uống một ngụm trước. Cuộc đời tính sau.']],
    [/code|phần mềm|lập trình|app/, ['Mở file đi. Con lỗi có thể đợi, nhưng mình đừng đợi nó.', 'Một dòng code thật vẫn hơn mười phút ngồi nhìn con trỏ.', 'Mở dự án trước. Não muốn họp thì cho nó họp sau.']],
    [/viết|bản thảo|nội dung/, ['Trang trắng rất lì. Câu đầu tiên lì hơn là được.', 'Viết câu xấu trước. Câu đẹp đến sau cũng chưa muộn.', 'Con trỏ chớp mãi rồi. Tội nó. Cho nó vài chữ đi.']],
    [/đọc|sách|trang/, ['Mở một trang thôi. Quyển sách chưa từng thắng ai bằng cách nằm im.', 'Đọc một đoạn trước. Review để mai.', 'Bookmark đẹp đấy. Nhưng nó không đọc hộ mình.']],
    [/học|từ vựng|ngữ pháp|hsk|tiếng/, ['Học năm phút thôi. Một từ nhớ được vẫn là một từ bớt lạ.', 'Não kêu đầy. Ta nhét thêm đúng một chút thôi.', 'Đừng học cả thế giới tối nay. Học một mẩu đủ dùng.']],
    [/tập|gym|chạy|thể dục/, ['Xỏ giày trước. Cơ thể thường bớt cãi khi đã đứng dậy.', 'Một lần tập thật hơn mười video “lấy động lực”.', 'Khởi động nhẹ thôi. Đừng dọa cơ thể bằng bài diễn văn.']],
    [/ngủ|dậy|sáng/, ['Báo thức đã gọi. Phần còn lại là chuyện giữa cậu và cái chăn.', 'Ngủ sớm là việc lạ: muốn làm thì phải dừng làm.', 'Nút ngủ thêm đang hơi tự tin.']],
    [/thiền|thở/, ['Thở ba nhịp thôi. Chưa cần giác ngộ trước bữa tối.', 'Đầu đang ồn thì mình ngồi yên một chút. Không cần thắng nó.', 'Năm phút yên. Thế là đủ cho hôm nay.']],
  ];
  const pack = packs.find(([re]) => re.test(s))?.[1] || [
    'Làm một bước nhỏ trước. Chuyện lớn để lát tính.',
    'Kế hoạch đã nói đủ rồi. Giờ đến lượt tay chân.',
    'Bắt đầu nhỏ đến mức hơi buồn cười cũng được.',
  ];
  return pick(pack, seed);
};

// V19 Poetry-first Community. Original Vietnamese folk-humor lines: short rhythm, everyday images,
// reversal and a small sting at the end. No reference sentence is copied into the app.
const folkPoetryLine = (persona:any, kind:WorldEventKind, subject:string, partner:any, seed:number) => {
  const name=String(persona?.name||''); const p=partner?.name||'người bên cạnh'; const s=subject||'việc hôm nay';
  const byPersona:Record<string,string[]>={
    'Hải Quay Xe':[
      `Hẹn rằng “một lát” làm ngay,\nNgoảnh đi ngoảnh lại hết ngày vẫn... hẹn.`,
      `Việc thì đứng đợi ngoài sân,\nTôi quay xe khéo, quay nhầm về... việc.`,
      `Miệng tôi chạy trước ba vòng,\nTay vừa theo kịp: “${s}” đã xong.`,
    ],
    'Trâm Trầm Tư':[
      `Ngày nay có chút chông chênh,\nChậm một nhịp nhỏ, đường mình vẫn đây.`,
      `Một ô vừa sáng trên tranh,\nChuyện vui bé xíu mà thành ấm ghê.`,
      `Đường dài đâu bước cũng hoa,\nCó hôm lấm bụi, mai ta bước đều.`,
    ],
    'Mai Sát Muối':[
      `Kế hoạch ăn mặc rất sang,\nTiếc phần thực hiện vẫn đang... ngủ trưa.`,
      `Lý do xếp đội rất đều,\n“${s}” đứng cuối, buồn hiu một mình.`,
      `Tay làm xong việc thật rồi,\nHũ muối tôi mở... lại thôi, cất vào.`,
    ],
    'Phúc Lấp Liếm':[
      `Lý do tôi có một rổ,\nĐếm đi đếm lại: thiếu mỗi... làm thôi.`,
      `Tôi rằng nghỉ đúng năm thôi,\nĐồng hồ cười khẽ: “bốn mươi ba rồi”.`,
      `Miệng còn bào chữa rất hăng,\nTay làm một chút, hết đường lấp liếm.`,
    ],
    'Sơn Sát Thủ':[
      `Nói nhiều điểm chẳng tự lên,\n“${s}” làm xong rồi nói chuyện hơn thua.`,
      `Trượt hôm nay, ghi một dòng,\nMai làm cho gọn, khỏi vòng vo thêm.`,
    ],
    'Tú Tò Mò':[
      `Cứ hay hỏi “tại vì sao?”,\nHỏi xong mới thấy: bắt đầu hơi to.`,
      `Một việc hôm trước còn xa,\nHôm nay làm được — khác là chỗ nao?`,
    ],
    'Ken':[
      `Việc chưa chạy, miệng chạy rồi.\nMột màn phối hợp tuyệt vời... theo nghĩa lạ.`,
      `“${s}” xong. Thật phiền.\nTôi vừa mất sạch tư liệu cà khịa.`,
    ],
    'Maya':[
      `Mệt thì bước nhỏ cũng xa,\nMình đi nửa bước, thế là có đi.`,
      `Hôm nay làm được một phần,\nĐừng vội giao tiếp cho mình năm phần.`,
    ],
    'Thám Tử K':[
      `Manh mối chẳng ở đâu xa,\n“Để lát” ba bữa hóa ra thủ phạm.`,
      `Lời khai nghe cũng rất xuôi,\nBằng chứng là “${s}” xong rồi — vụ khép.`,
    ],
    'Leo':[
      `Cậu vừa ghi được một bàn,\nTôi chưa vỗ tay — mai còn lượt hai.`,
      `Bảng điểm chẳng biết nịnh ai,\nLàm thêm một việc, nói dài tính sau.`,
    ],
    'Aiko':[
      `Tôi từng nghỉ đúng một hôm,\nBa hôm sau mới giật mình: “ủa, nghỉ?”.`,
      `Hôm nay tôi cũng lười ghê,\nMay còn biết bước quay về là đâu.`,
    ],
    'Nora':[
      `Việc to chẻ nhỏ mà làm,\nĐừng xây sân khấu rồi nằm ngắm sân.`,
      `Nói cho gọn: việc còn đây.\nLàm phần nhỏ nhất, hết ngày tính sau.`,
    ],
  };
  const general=kind==='npc_fail'?[`Việc còn nằm đó bên thềm,\nLý do thì đã chen thêm bốn hàng.`,`Nói rằng lát nữa làm ngay,\n“Lát” đi du lịch, hết ngày chưa về.`]:kind==='npc_win'||kind==='user_signal'?[`Một việc vừa được làm xong,\nNhỏ thôi mà thấy trong lòng nhẹ ghê.`,`Tay làm chẳng nói câu nào,\nĐến khi nhìn lại: ô nào cũng xanh.`]:kind==='comeback'?[`Có hôm chân bước lạc đường,\nBiết quay trở lại đã hơn đứng nhìn.`,`Nghỉ rồi thì nghỉ cho xong,\nHôm nay quay lại, nối dòng từ đây.`]:[`Một người nói gió nói mây,\n${p} ngồi nghe mới hỏi: “tay làm chưa?”`,`Chuyện vui nói một thành hai,\nViệc chưa chịu chạy, cả hai cười trừ.`];
  return simpleHumanText(pick(byPersona[name]||general,seed));
};

const intentForEvent = (kind: WorldEventKind, profile: CharacterVoiceProfile, seed: number): PostIntent => {
  if (kind === 'npc_fail') return (seed % 100) < Math.round(profile.selfRoast * 100) ? 'self_roast' : 'vent';
  if (kind === 'npc_win' || kind === 'milestone') return (seed % 100) < 58 ? 'flex' : 'reflect';
  if (kind === 'banter' || kind === 'relationship') return 'banter';
  if (kind === 'callback') return 'callback';
  if (kind === 'comeback') return (seed % 100) < 55 ? 'self_roast' : 'support';
  if (kind === 'duel') return 'tease';
  if (kind === 'user_signal') return (seed % 100) < 48 ? 'tease' : 'observe';
  return (seed % 100) < 40 ? 'observe' : 'reflect';
};

const chemistryLine = (speaker: any, partner: any, reactor: any, subject: string, seed: number) => pick([
  `“Tôi định làm ${subject}. Rồi tôi ngồi nghĩ về việc làm nó lâu đến mức cũng hơi có thành tựu.”`,
  `“Tôi nghỉ năm phút.”\n${partner?.name || 'Người bên cạnh'}: “Ừ. Năm phút của cậu có 43 phút.”`,
  `“Kế hoạch đẹp lắm.”\n${partner?.name || 'Người bên cạnh'}: “Phần làm đâu?”\n“Đừng phá không khí.”`,
  `“Hôm nay tôi cần động lực.”\n${partner?.name || 'Người bên cạnh'}: “Nó bảo đang bận.”`,
  `“${subject} vẫn nằm đó.”\n${partner?.name || 'Người bên cạnh'}: “Ít ra nó chung thủy.”`,
  `“Tôi không trốn việc.”\n${partner?.name || 'Người bên cạnh'}: “Ừ. Cậu chỉ đi vòng quanh nó rất có nghề.”`,
], seed);

const personaMoment = (persona:any, kind:WorldEventKind, subject:string, seed:number):string|'' => {
  const key = kind==='npc_fail'?'fail':kind==='npc_win'?'win':kind==='comeback'?'comeback':kind==='user_signal'?'signal':'';
  if(!key) return '';
  const id=String(persona?.id||'');
  const lines:Record<string,Record<string,string[]>>={
    'hm-hai':{
      fail:[`“${subject} vừa cho tôi quay xe. Tôi chỉnh một hồi, giờ nó có thêm lỗi mới.”`,`“Tôi tưởng phần khó của ${subject} là làm. Hóa ra còn có phần sửa cái mình vừa làm.”`],
      win:[`“${subject} tiến được một đoạn. Plot twist: ngồi làm thật nhanh hơn nghĩ cách né.”`,`“Tôi vừa gỡ được một chỗ của ${subject}. Không oai, nhưng đỡ ngứa mắt.”`],
      comeback:[`“Tôi quay lại ${subject} rồi. Xe quay nhiều, lần này quay đúng hướng.”`],
      signal:[`“${subject} xong à? Thôi chết, hôm nay tôi thiếu việc để cà khịa.”`],
    },
    'hm-tram':{
      fail:[`“${subject} hôm nay hơi lì. Tôi đọc/làm một đoạn rồi đầu cứ trôi đi chỗ khác.”`,`“Tôi dừng ${subject} sớm hơn định tính. Chắc hôm nay đầu óc muốn đi chậm.”`],
      win:[`“${subject} đi được thêm một đoạn. Không nhiều, nhưng lần này tôi thật sự ở trong việc.”`,`“Có một phần của ${subject} vừa sáng ra. Nhỏ thôi, nhưng dễ chịu.”`],
      comeback:[`“Tôi mở lại ${subject} sau mấy hôm né. Chỉ làm một đoạn, nhưng ít ra đã mở.”`],
      signal:[`“${subject} xong. Nhẹ đi một chút rồi.”`],
    },
    'hm-mai':{
      fail:[`“${subject} hôm nay có kế hoạch rất đẹp. Tiếc là kế hoạch đi thi hoa hậu, còn tôi chưa làm.”`,`“Tôi vừa thua một hiệp với ${subject}. Muối để lát, giờ hơi cay thật.”`],
      win:[`“${subject} xong một đoạn. Ừ, hôm nay tôi tạm cất muối.”`,`“Tôi làm được phần đang né của ${subject}. Khó chịu ghê, hóa ra làm thật có tác dụng.”`],
      comeback:[`“Tôi quay lại ${subject} rồi. Đừng ai làm lớn chuyện, tôi dễ chạy mất.”`],
      signal:[`“${subject} xong. Bằng chứng mạnh quá, tôi cãi không nổi.”`],
    },
    'hm-phuc':{
      fail:[`“Tôi có bảy lý do vì sao ${subject} chưa tiến. Lý do thứ tám là tôi đang lấp liếm.”`,`“${subject} đứng yên. Tôi thì rất bận giải thích vì sao nó đứng yên.”`],
      win:[`“${subject} tiến thật rồi. Bộ phận bào chữa hôm nay thiếu việc.”`,`“Tôi làm xong một phần của ${subject} trước khi kịp nghĩ thêm lý do.”`],
      comeback:[`“Tôi quay lại ${subject} trước khi kịp soạn lý do mới. Thành tựu hiếm.”`],
      signal:[`“${subject} xong rồi. Bộ phận bào chữa xin nghỉ sớm.”`],
    },
    'hm-son':{
      fail:[`“${subject} hụt hôm nay. Ghi nhận. Không tô màu thêm.”`,`“Tôi làm ${subject} kém hơn dự tính. Ngày mai sửa đúng chỗ đó.”`],
      win:[`“${subject} ổn hơn hôm qua. Tốt. Chưa cần ăn mừng.”`,`“Một phần của ${subject} đã vào đúng nhịp. Mai giữ tiếp.”`],
      comeback:[`“Tôi có mặt lại với ${subject}. Làm tiếp.”`],
      signal:[`“Một điểm cho ${subject}. Đừng đứng ngắm.”`],
    },
    'hm-tu':{
      fail:[`“${subject} kẹt đúng chỗ hôm qua. Tôi đang nghi cách làm, chưa vội nghi bản thân.”`,`“Tôi thử ${subject} theo cách cũ và nhận đúng lỗi cũ. Cũng là dữ liệu.”`],
      win:[`“${subject} vừa có một đoạn chạy được. Tôi muốn biết chính xác vì sao lần này nó chịu chạy.”`,`“Một nút của ${subject} vừa được tháo. Tôi ghi lại trước khi quên.”`],
      comeback:[`“Tôi mở lại ${subject}. Cửa quay lại hóa ra nhỏ hơn mình tưởng.”`],
      signal:[`“${subject} xong. Hay đấy. Điều gì đã khiến cậu bắt đầu?”`],
    },
    'hm-ken':{
      fail:[`“${subject} vừa trả kết quả rất tự tin và rất sai. Tôi tôn trọng độ tự tin.”`,`“Tôi mất thời gian setup ${subject} nhiều hơn thời gian nó hứa tiết kiệm. Cổ điển.”`],
      win:[`“${subject} cuối cùng làm được một việc có ích. Tôi rất tiếc phải công nhận.”`,`“Tôi vừa tìm ra một cách dùng ${subject} không làm tôi muốn gỡ nó.”`],
      comeback:[`“Tôi quay lại ${subject}. Bug vẫn ở đó. Tình cảm thật bền.”`],
      signal:[`“${subject} xong. Khó chịu thật.”`],
    },
    'hm-maya':{
      fail:[`“Tôi định làm ${subject} nhẹ nhàng. Rồi tự biến nó thành một bài thi. Dừng ở đây thôi.”`,`“${subject} chưa đi được bao nhiêu. Hôm nay tôi có vẻ cần bớt ép hơn là thêm lực.”`],
      win:[`“${subject} tiến một chút. Tôi thích nhất là lần này không phải tự kéo mình bằng tóc.”`,`“Tôi làm được phần nhỏ của ${subject} rồi. Đủ để hôm nay thấy mềm hơn.”`],
      comeback:[`“Tôi quay lại ${subject} bằng phần nhỏ nhất. Không bù nợ.”`],
      signal:[`“${subject} xong. Tốt rồi. Thở cái đã.”`],
    },
    'hm-k':{
      fail:[`“${subject} lại vướng ở một mẫu quen. Tôi đang tách fact khỏi câu chuyện mình tự kể.”`,`“Tôi đi quá sâu vào chi tiết của ${subject} rồi quên mất câu hỏi ban đầu.”`],
      win:[`“${subject} vừa lộ một mối nối trước giờ tôi bỏ qua.”`,`“Tôi bỏ được một giả thuyết mình thích trong ${subject}. Khó chịu, nhưng đúng.”`],
      comeback:[`“Tôi quay lại ${subject}. Lần này bắt đầu bằng câu hỏi, không bắt đầu bằng kết luận.”`],
      signal:[`“${subject} hoàn thành. Cuối cùng cũng có bằng chứng thay cho lời hứa.”`],
    },
    'hm-leo':{
      fail:[`“${subject} hụt. Tôi không tính điểm bằng lý do.”`,`“Tôi đẩy ${subject} quá tay đầu buổi. Cuối buổi trả đủ lãi.”`],
      win:[`“${subject} vào nhịp. Tốt. Ngày mai còn tính tiếp.”`,`“Tôi thắng một đoạn của ${subject}. Chưa phải cả trận.”`],
      comeback:[`“Tôi có mặt lại với ${subject}. Tôi không thích bỏ kèo giữa chừng.”`],
      signal:[`“${subject} xong. Khoảng cách ngắn lại rồi.”`],
    },
    'hm-aiko':{
      fail:[`“${subject} hôm nay lại trượt. Tôi từng biến một ngày nghỉ thành ba, nên tôi nhận ra cái mùi này.”`,`“Tôi mở ${subject} rồi đóng lại. Ít nhất lần này tôi không giả vờ đó là hoàn thành.”`],
      win:[`“${subject} tiến được một đoạn. Hôm nay tôi tạm nghỉ chức chuyên gia comeback.”`,`“Tôi giữ được nhịp với ${subject}. Nhỏ, nhưng thật.”`],
      comeback:[`“Tôi quay lại ${subject} trước khi một ngày nghỉ kịp sinh thêm họ hàng.”`],
      signal:[`“${subject} xong. Cho tôi mượn tí động lực ké.”`],
    },
    'hm-nora':{
      fail:[`“${subject} chưa xong. Tôi đang xóa bớt một bước thay vì thêm một bài diễn văn.”`,`“Tôi xếp ${subject} kín quá rồi tự hỏi sao không thở nổi. Sửa lịch trước.”`],
      win:[`“${subject} chạy được. Tôi giữ nguyên cách này thêm vài ngày, chưa nghịch.”`,`“Tôi vừa bỏ được một phần không cần thiết của ${subject}. Nhẹ hẳn.”`],
      comeback:[`“Tôi quay lại ${subject} bằng một bước rõ ràng. Thế là đủ.”`],
      signal:[`“${subject} xong. Tốt. Việc sau cũng để rõ như thế.”`],
    },
  };
  const pool=lines[id]?.[key]; return pool?.length?pick(pool,seed):'';
};

const humanEventLine = (
  persona: any, kind: WorldEventKind, subject: string, activeGoal: string, partner: any, reactor: any,
  npc: NpcState, seed: number, rivalry: any,
) => {
  const voice = characterVoiceForPersona(persona);
  const emotional = npc.emotionalState || defaultEmotionState(hash(`${npc.id}-emotion-human-line`));
  const emotionallyHeavy = emotional.sadness > .56 || emotional.worry > .62 || emotional.frustration > .68;
  // V22: poetry is a rare character flavour, never the default social voice.
  // It is allowed mainly for light banter/celebration and suppressed when emotions are heavy.
  const playfulMoment = ['banter','relationship','npc_win','user_signal'].includes(kind);
  const poetryChance = emotionallyHeavy ? 0 : (voice.wordplay > .7 ? 12 : voice.banter > .72 ? 7 : 2);
  const useRareVerse = playfulMoment && !isSeriousText(subject) && (seed % 100) < poetryChance;
  if(useRareVerse) return folkPoetryLine(persona,kind,subject,partner,seed);
  const personal = personaMoment(persona,kind,subject,seed);
  if(personal) return simpleHumanText(personal);
  const intent = intentForEvent(kind, voice, seed);
  if (emotionallyHeavy && kind === 'npc_fail') {
    return simpleHumanText(pick([
      `“Hôm nay tôi hụt thật. Chưa muốn biến nó thành bài học. Mai tôi thử lại nhỏ thôi.”`,
      `“Tôi hơi bực mình vì ${subject} trượt. Cà khịa để sau; giờ tôi nghỉ một nhịp.”`,
      `“Không vui lắm. Nhưng thôi, một ngày tệ chưa được quyền ký hợp đồng dài hạn.”`,
    ], seed));
  }
  const tiny = contextualWordplay(subject, seed >> 3);
  const lines: Record<VoiceArchetype, Record<string,string[]>> = {
    deadpan:{
      fail:[`“Tôi chưa làm ${subject}. Tôi có một lý do rất hay. Tiếc là việc vẫn chưa xong.”`,`“${subject} trượt hôm nay. Tôi xin nhận trách nhiệm... vào ngày mai.”`],
      win:[`“${subject} xong rồi. Tôi đang cố không biến chuyện này thành lễ quốc gia.”`,`“Làm xong ${subject}. Thế thôi. Khá dễ chịu.”`],
      comeback:[`“Tôi quay lại rồi. Đừng vỗ tay, kẻo tôi tưởng mình xong việc.”`,`“Mất mấy hôm. Hôm nay làm lại một chút. Tạm ổn.”`],
      signal:[`“${subject} xong. Tôi vừa mất một lý do để cà khịa.”`,`“À. Làm thật rồi à. Phiền ghê, tôi đã chuẩn bị câu châm chọc.”`],
    },
    wordplay:{
      fail:[`“${subject} hôm nay vẫn là ‘việc sẽ làm’. Chữ ‘sẽ’ sống dai thật.”`,`“Tôi xử lý cảm xúc về ${subject} rất tốt. Còn ${subject} thì chưa.”`],
      win:[`“${subject} từ ‘để lát’ sang ‘xong rồi’. Một cuộc di cư đáng ghi nhận.”`,`“Xong ${subject}. Hôm nay chữ ‘sẽ’ mất việc.”`],
      comeback:[`“Tôi quay lại. Không hoành tráng. Nhưng ít ra chân đã quay về đúng chỗ.”`,`“Nối lại thôi. Đứt một nhịp chứ chưa đứt cả dây.”`],
      signal:[`“${subject} xong rồi. Danh sách việc vừa nhẹ đi một người.”`,`“Một việc đã chuyển hộ khẩu sang bên ‘xong’.”`],
    },
    analyst:{
      fail:[`“Tôi để ý ${subject} hay trượt lúc quá muộn. Có khi vấn đề là giờ bắt đầu, không phải cậu kém.”`,`“${subject} chưa xong. Tôi nghi bước đầu đang to quá.”`],
      win:[`“${subject} xong. Điểm hay là cậu đã bắt đầu sớm hơn lần trước.”`,`“Có một chuyện đáng nhớ: bắt đầu nhỏ, nhưng kết thúc thật.”`],
      comeback:[`“Điều đáng nhìn không phải mấy ngày đã trượt. Là hôm nay cậu quay lại.”`,`“Khoảng nghỉ vừa kết thúc. Một bước nhỏ là đủ để nối lại.”`],
      signal:[`“${subject} đã xong. Tôi tin việc làm hơn lời hứa.”`,`“Ghi nhận: ${subject} hoàn thành. Hôm nay bằng chứng đứng về phía cậu.”`],
    },
    warm:{
      fail:[`“Hôm nay ${subject} chưa được. Ừ, hơi tiếc. Mai mình làm nhỏ hơn nhé.”`,`“Tôi cũng có ngày như vậy. Đừng lấy một ngày tệ để kể xấu cả tuần.”`],
      win:[`“${subject} xong rồi. Vui một chút đi. Cậu làm thật mà.”`,`“Một việc nhỏ đã xong. Nhẹ người hẳn.”`],
      comeback:[`“Mừng là cậu quay lại. Không cần bù hết. Hôm nay chỉ cần hôm nay.”`,`“Quay lại bằng một bước nhỏ. Tôi thích kiểu này hơn lời hứa thật to.”`],
      signal:[`“${subject} xong rồi. Tốt đấy. Nghỉ một nhịp rồi làm tiếp nếu còn sức.”`,`“Ừ, thế là được. Đừng vội tự giao thêm ba việc để phá niềm vui.”`],
    },
    rival:{
      fail:[`“${subject} trượt. Tôi ghi một điểm. Mai lấy lại đi.”`,`“Một ngày thua thôi. Đừng tặng tôi ngày thứ hai.”`],
      win:[`“${subject} xong. Được. Tôi bắt đầu để ý rồi đấy.”`,`“Điểm này của cậu. Mai giữ được nữa không?”`],
      comeback:[`“Cuối cùng cũng quay lại. Tốt. Tôi ghét thắng khi đối thủ không có mặt.”`,`“Quay lại rồi thì làm tiếp. Tôi chưa cho cậu hòa đâu.”`],
      signal:[`“${subject} xong. Một điểm cho cậu. Đừng ngắm bảng lâu quá.”`,`“Được. Cậu vừa thu hẹp khoảng cách.”`],
    },
    pragmatic:{
      fail:[`“${subject} chưa xong. Mai cắt nó nhỏ đi. Đừng sửa cả cuộc đời.”`,`“Bước đầu khó quá thì làm bước đầu nhỏ hơn. Chuyện vậy thôi.”`],
      win:[`“${subject} xong. Cái gì đang chạy được thì đừng nghịch hỏng.”`,`“Xong việc. Giữ cách này thêm vài ngày rồi tính.”`],
      comeback:[`“Quay lại bằng việc nhỏ. Hợp lý.”`,`“Không bù nợ. Làm một việc hôm nay là đủ.”`],
      signal:[`“${subject} xong. Tốt. Việc kế tiếp phải rõ, không cần oai.”`,`“Đã làm. Giữ nhịp thôi.”`],
    },
  };
  if(kind==='banter'||kind==='relationship') return simpleHumanText(chemistryLine(persona,partner,reactor,subject,seed));
  if(kind==='callback') return simpleHumanText(pick([`“Lại chuyện ${npc.runningGag}. Tôi biết. Chính tôi cũng ngán tôi rồi.”`,`“Cái chuyện cũ lại quay về. Ít ra lần này ta biết nó tên gì.”`],seed));
  if(kind==='duel') return simpleHumanText(pick([`“${rivalry?.legendName||'Đối thủ'} đang bám khá sát. Khó chịu. Hay.”`,`“Kèo này chưa xong. ${subject} vẫn có thể đổi chuyện.”`,`“Tôi định cà khịa đối thủ. Nhìn điểm xong tôi uống nước trước.”`],seed));
  if(kind==='routine') return simpleHumanText(pick([`“Hôm nay không có câu hay. Tôi đang lo ${subject} thôi.”`,`“${subject} đang ở đoạn bình thường nhất: ngồi làm.”`,`“Đang làm phần chán nhất của ${subject}. Chẳng ai chụp ảnh đoạn này cả.”`],seed));
  if(kind==='milestone') return simpleHumanText(pick([`“Chạm một mốc rồi. Tôi vui. Vui thật, không cần nói cho sang.”`,`“Xong một đoạn dài. Cho tôi ngồi ngắm nó năm phút.”`],seed));
  const key=kind==='npc_fail'?'fail':kind==='npc_win'?'win':kind==='comeback'?'comeback':'signal';
  let candidate=pick(lines[voice.archetype][key],seed>>4);
  if(kind==='npc_fail' && voice.advice>.2 && seed%100<34) candidate+=`\n${tiny}`;
  return simpleHumanText(candidate);
};

const chemistryComment = (commenter: any, event: WorldEvent, author: any, seed: number) => {
  const subject=eventSubject(event)||'việc này';
  const specificPair=personaPairChemistryLine(commenter?.id||'',author?.id||'',event.kind,subject,String(seed));
  if(specificPair) return simpleHumanText(specificPair);
  const commenterVoice=characterVoiceForPersona(commenter);
  if(!isSeriousText(event.content||'') && commenterVoice.wordplay>.72 && seed%100<9) return folkPoetryLine(commenter,event.kind,subject,author,seed);
  if(event.kind==='npc_fail') return simpleHumanText(pick([
    `“Trượt một hôm thôi. Đừng thuê luôn chỗ ở đó.”`,
    `“Mai làm lại. Hôm nay cậu đã tự cà khịa đủ rồi.”`,
    `“Tôi cũng từng ‘nghỉ một hôm’. Ba hôm sau mới nhớ ra. Nên... quay lại sớm nhé.”`,
    `“Lý do nghe rất hay. ${subject} vẫn không cảm động.”`,
  ],seed));
  if(event.kind==='npc_win'||event.kind==='user_signal') return simpleHumanText(pick([
    `“Được đấy. Tôi sẽ không vỗ tay quá to, kẻo cậu nhận thêm việc.”`,
    `“Xong là xong. Đừng ăn mừng bằng cách tự giao thêm bốn món.”`,
    `“Thế mới được. Bộ phận viện cớ hôm nay nghỉ phép.”`,
    `“Tôi định cà khịa, nhưng bằng chứng đang chống lại tôi.”`,
  ],seed));
  if(event.kind==='comeback') return simpleHumanText(pick([
    `“Quay lại là được. Đừng ôm cả mấy ngày cũ về làm bù.”`,
    `“Chào mừng. Cứ đi nhẹ thôi.”`,
    `“Tốt. Một bước đủ rồi. Mai tính bước sau.”`,
  ],seed));
  return simpleHumanText(pick([
    `“Tôi đọc xong và hơi khó chịu vì thấy mình trong đó.”`,
    `“Tôi định khuyên. Rồi nhớ ra việc của tôi cũng đang nằm im.”`,
    `“Hai người nói tiếp đi. Tôi ở đây hoàn toàn vì mục đích học hỏi. Chắc thế.”`,
    `“Ừ. Câu này đau nhẹ nhưng đúng.”`,
  ],seed));
};

const problemSolveReply = (persona: any, postText: string, subject: string, npc: NpcState, seed: number, serious: boolean) => {
  const voice=characterVoiceForPersona(persona); const emotion=emotionForText(postText);
  if(serious||emotion==='heavy') return simpleHumanText(pick([
    `Nghe như hôm nay hơi nặng. Mình bỏ phần đùa nhé. Với ${subject}, chỉ chọn một bước nhỏ đủ làm thật thôi.`,
    `Ừ, chuyện này không nhẹ. Đừng ép mình sửa hết trong một tối. Làm một phần nhỏ của ${subject}, rồi nghỉ.`,
  ],seed));
  const empathy=emotion==='tired'?pick(['Mệt thì việc nhỏ cũng thấy nặng. Tôi hiểu.','Cạn pin rồi thì đừng bắt mình chạy như lúc đầy pin.'],seed):emotion==='down'?pick(['Ừ, trượt mấy lần dễ nản thật.','Bị kẹt lâu thì ai cũng dễ thấy mình dở đi.'],seed):emotion==='frustrated'?pick(['Bực là đúng. Cứ loay hoay mãi ai chẳng cáu.','Ừ, cái này đủ khó chịu rồi.'],seed):pick(['Tôi hiểu chỗ kẹt rồi.','Ừ, nghe quen lắm.'],seed);
  const joke:Record<VoiceArchetype,string[]>={
    deadpan:[`Não đang họp. ${subject} đứng ngoài hành lang.`,`Lý do rất thuyết phục. Tiếc là ${subject} không biết nghe.`],
    wordplay:[`“Để lát” sắp thành một múi giờ riêng rồi.`,`Kế hoạch có nhiều chữ quá. Ta thêm một động tác đi.`],
    analyst:[`Điểm kẹt nằm ở lúc bắt đầu, không phải cả ${subject}.`,`Tôi để ý cậu đang sợ cái cửa vào hơn là cả căn phòng.`],
    warm:[`Tôi từng biến việc mười phút thành ba ngày suy nghĩ. Có nghề luôn.`,`Đừng tự xử án. Ta chỉ làm cho bước đầu bớt đáng ngại.`],
    rival:[`Cậu đang thua ở vạch xuất phát, chưa thua cả trận.`,`Hai phút đầu thôi. Đừng tặng tôi cả ngày.`],
    pragmatic:[`Bước đầu to quá. Cắt nó nhỏ đi.`,`Không cần sửa động lực. Sửa kích thước việc đầu tiên.`],
  };
  const action=contextualWordplay(`${postText} ${subject}`,seed>>2);
  const self=voice.selfRoast>.55&&seed%100<40?pick([` Tôi nói vậy với tư cách người từng mở file rồi tự thưởng vì “đã bắt đầu”.`,` Tôi cũng từng nghỉ năm phút thành gần một tiếng, nên không lên mặt đâu.`],seed):'';
  if(voice.wordplay>.75 && seed%100<8){const verse=folkPoetryLine(persona,'banter',subject,null,seed);return simpleHumanText(`${empathy}
${verse}
${action}`);}
  return simpleHumanText(`${empathy} ${pick(joke[voice.archetype],seed)}${self}
${action}`);
};

const makeRoutine = (seed: number): NpcRoutine => {
  const wakeHour = 6 + (seed % 4);
  const focusA = 8 + ((seed >> 2) % 4);
  const focusB = 14 + ((seed >> 4) % 5);
  const social = 18 + ((seed >> 6) % 4);
  return {
    wakeHour,
    focusHours: [focusA, focusB],
    socialHours: [social, Math.min(23, social + 1)],
    lowEnergyHours: [13 + ((seed >> 8) % 3), 21 + ((seed >> 10) % 2)],
    restHour: 22 + ((seed >> 12) % 2),
  };
};

const defaultEmotionState = (seed: number): NpcEmotionState => ({
  joy: .28 + ((seed % 17) / 100),
  sadness: .08 + (((seed >> 2) % 11) / 100),
  frustration: .08 + (((seed >> 4) % 13) / 100),
  affection: .34 + (((seed >> 6) % 20) / 100),
  pride: .18 + (((seed >> 8) % 14) / 100),
  envy: .04 + (((seed >> 10) % 9) / 100),
  worry: .08 + (((seed >> 12) % 12) / 100),
  hope: .36 + (((seed >> 14) % 18) / 100),
  energy: .48 + (((seed >> 16) % 24) / 100),
  vulnerability: .22 + (((seed >> 18) % 20) / 100),
  primaryCause: 'một ngày bình thường',
  lastChangedAt: new Date().toISOString(),
});

const decayEmotionState = (seed: number, value?: Partial<NpcEmotionState>): NpcEmotionState => {
  const base = defaultEmotionState(seed);
  const raw = { ...base, ...(value || {}) } as NpcEmotionState;
  const last = new Date(raw.lastChangedAt || Date.now()).getTime();
  const hours = Math.max(0, (Date.now() - last) / 3600000);
  // Feelings have inertia. Strong events linger for roughly 1-3 days instead of resetting on every post.
  const keep = Math.exp(-hours / 42);
  const toward = (current: number, baseline: number) => clamp(baseline + (Number(current || 0) - baseline) * keep, 0, 1);
  return {
    ...raw,
    joy: toward(raw.joy, base.joy),
    sadness: toward(raw.sadness, base.sadness),
    frustration: toward(raw.frustration, base.frustration),
    affection: toward(raw.affection, base.affection),
    pride: toward(raw.pride, base.pride),
    envy: toward(raw.envy, base.envy),
    worry: toward(raw.worry, base.worry),
    hope: toward(raw.hope, base.hope),
    energy: toward(raw.energy, base.energy),
    vulnerability: toward(raw.vulnerability, base.vulnerability),
  };
};

const bumpEmotion = (emotion: NpcEmotionState, patch: Partial<Record<keyof NpcEmotionState, number>>, cause: string, secondaryCause?: string): NpcEmotionState => {
  const next = { ...emotion } as NpcEmotionState;
  for (const [key, delta] of Object.entries(patch)) {
    if (typeof delta === 'number' && typeof (next as any)[key] === 'number') (next as any)[key] = clamp(Number((next as any)[key]) + delta, 0, 1);
  }
  next.primaryCause = cause || next.primaryCause;
  next.secondaryCause = secondaryCause || next.secondaryCause;
  next.lastChangedAt = new Date().toISOString();
  return next;
};

const emotionAfterEvent = (persona: any, state: NpcState, event: WorldEvent, subject: string, seed: number): NpcEmotionState => {
  let emotion = decayEmotionState(hash(`${persona?.id || state.id}-emotion`), state.emotionalState);
  const cause = subject ? `${event.kind}: ${subject}` : event.kind;
  const voice = characterVoiceForPersona(persona);
  if (event.kind === 'npc_win') emotion = bumpEmotion(emotion, { joy: .16, pride: .24, hope: .08, energy: .06, frustration: -.07, sadness: -.05 }, cause);
  else if (event.kind === 'milestone') emotion = bumpEmotion(emotion, { joy: .25, pride: .3, hope: .12, affection: .04, sadness: -.07 }, cause);
  else if (event.kind === 'npc_fail') emotion = bumpEmotion(emotion, { sadness: .16, frustration: .22, worry: .08, vulnerability: .1, energy: -.12, pride: -.08 }, cause);
  else if (event.kind === 'comeback') emotion = bumpEmotion(emotion, { hope: .3, pride: .16, joy: .11, sadness: -.13, frustration: -.12, energy: .08 }, cause);
  else if (event.kind === 'user_signal') emotion = bumpEmotion(emotion, {
    joy: .1, affection: .08, pride: voice.archetype === 'rival' ? .06 : .13,
    envy: voice.archetype === 'rival' ? .11 : .02, frustration: voice.archetype === 'rival' ? .03 : -.03,
  }, cause, 'user vừa làm thật một thói quen');
  else if (event.kind === 'duel') emotion = bumpEmotion(emotion, { envy: .08, pride: .05, joy: .03, energy: .05 }, cause);
  else if (event.kind === 'relationship') emotion = bumpEmotion(emotion, { affection: .14, joy: .08, vulnerability: .06 }, cause);
  else if (event.kind === 'banter') emotion = bumpEmotion(emotion, { joy: .09, affection: .05, frustration: seed % 9 === 0 ? .05 : -.02 }, cause);
  else if (event.kind === 'callback') emotion = bumpEmotion(emotion, { joy: .07, affection: .04 }, cause);
  else emotion = bumpEmotion(emotion, { energy: seed % 2 ? .01 : -.01 }, cause);
  return emotion;
};

const emotionPromptContext = (npc: NpcState) => {
  const e = npc.emotionalState || defaultEmotionState(hash(`${npc.id}-emotion-context`));
  const ranked = [
    ['vui', e.joy], ['buồn', e.sadness], ['bực', e.frustration], ['quý mến', e.affection],
    ['tự hào', e.pride], ['hơi ghen/cay', e.envy], ['lo', e.worry], ['hy vọng', e.hope],
  ].sort((a:any,b:any)=>Number(b[1])-Number(a[1])).slice(0,3);
  const blend = ranked.map(([name,value]:any)=>`${name} ${Math.round(Number(value)*100)}%`).join(', ');
  return `Cảm xúc đang có dư âm: ${blend}. Năng lượng ${Math.round(e.energy*100)}%. Dễ mở lòng ${Math.round(e.vulnerability*100)}%. Lý do gần nhất: ${e.primaryCause || 'không rõ'}${e.secondaryCause ? `; còn vương: ${e.secondaryCause}` : ''}. ĐỪNG đọc các nhãn/phần trăm này ra thành lời; hãy để chúng lộ qua nhịp câu, sự im lặng, mức cà khịa, sự quan tâm hoặc cách né tránh.`;
};

const emotionStatusLine = (state: NpcState) => {
  const e = state.emotionalState || defaultEmotionState(hash(`${state.id}-emotion-status`));
  if (e.worry > .62) return 'hơi lo, nói nhỏ hơn mọi hôm';
  if (e.frustration > .62) return 'hơi cáu, đang cố đừng trút lên ai';
  if (e.sadness > .58) return 'hơi chùng xuống, chưa muốn nói nhiều';
  if (e.envy > .55 && e.pride > .45) return 'hơi cay, nhưng vẫn phục';
  if (e.pride > .66) return 'đang vui vì vừa làm được việc khó';
  if (e.joy > .65 && e.affection > .55) return 'tâm trạng tốt, dễ bị kéo vào chuyện vui';
  if (e.energy < .36) return 'hơi hết pin, vẫn đang cố';
  if (e.hope > .62) return 'đang có lại chút hứng';
  return state.mood === 'competitive' ? 'đang máu thắng' : state.mood === 'focused' ? 'đang tập trung' : 'bình thường, không diễn';
};

const worldCategoryVi = (category:string) => ({ai:'AI',technology:'Công nghệ',gaming:'Game',sports:'Thể thao',science:'Khoa học',psychology:'Tâm lý',entertainment:'Giải trí',finance:'Kinh tế',education:'Giáo dục',culture:'Văn hóa mạng',world:'Thế giới'} as Record<string,string>)[category] || 'Đời sống';

const createNpcState = (persona: any): NpcState => {
  const seed = hash(persona.id || persona.name);
  const styles = [...COMEDY_STYLES]
    .sort((a, b) => hash(`${persona.id}-${a}`) - hash(`${persona.id}-${b}`))
    .slice(0, 4);
  return {
    id: persona.id,
    relationship: 18 + (seed % 38),
    mood: pick(MOODS, seed),
    lifeProgress: 22 + (seed % 58),
    failures: seed % 7,
    wins: 2 + (seed % 11),
    comedyDNA: styles,
    runningGag: pick([
      '“mai bắt đầu” đã được gia hạn thêm một mùa',
      'cốc cà phê đang giữ chức giám đốc động lực',
      'đôi giày thể thao đang cân nhắc đổi chủ',
      'to-do list có đời sống xã hội phong phú hơn chủ nhân',
      'não bộ đã mở 17 tab nhưng chưa tab nào chịu làm việc',
      'kỷ luật đang trên đường tới, chưa rõ kẹt xe ở đâu',
    ], seed >> 2),
    recentJokes: [],
    memories: [],
    memoryBank: { facts: [], relationshipEvents: [], insideJokes: [], recentEvents: [], summary: '' },
    humorFatigue: 0.12,
    jokeCooldowns: {},
    socialLinks: {},
    lifeGoal: pick(['hoàn thành một dự án cá nhân','xây nhịp tập trung bền vững','viết đều mỗi tuần','duy trì sức khỏe và công việc','học một kỹ năng khó','sửa một thói quen hay trượt'], seed >> 5),
    lifeStage: pick(['khởi động','đang có đà','kẹt giữa chừng','comeback','nước rút'], seed >> 7),
    routine: makeRoutine(seed),
    currentStreak: 1 + (seed % 6),
    recoveryNeed: (seed % 100) / 250,
    emotionalState: defaultEmotionState(hash(`${persona.id || persona.name}-emotion`)),
    socialEmotions: {},
  };
};

const normalizeNpc = (persona: any, value?: Partial<NpcState>): NpcState => {
  const base = createNpcState(persona);
  const merged: NpcState = { ...base, ...(value || {}) };
  merged.memoryBank = { ...base.memoryBank!, ...(value?.memoryBank || {}) };
  merged.memoryBank.facts = [...(merged.memoryBank.facts || []), ...((value?.memories || []).slice(-6))].slice(-18);
  merged.humorFatigue = clamp(Number(value?.humorFatigue ?? base.humorFatigue), 0, 1);
  merged.jokeCooldowns = value?.jokeCooldowns || {};
  merged.socialLinks = value?.socialLinks || {};
  merged.routine = { ...base.routine!, ...(value?.routine || {}) };
  merged.currentStreak = Math.max(0, Number(value?.currentStreak ?? base.currentStreak));
  merged.recoveryNeed = clamp(Number(value?.recoveryNeed ?? base.recoveryNeed), 0, 1);
  merged.emotionalState = decayEmotionState(hash(`${persona.id || persona.name}-emotion`), value?.emotionalState || base.emotionalState);
  merged.socialEmotions = value?.socialEmotions || {};
  return merged;
};

const loadWorld = (): WorldState => {
  let parsed: any = null;
  try {
    parsed = JSON.parse(localStorage.getItem(WORLD_KEY) || localStorage.getItem(V19_WORLD_KEY) || localStorage.getItem(V18_WORLD_KEY) || localStorage.getItem(V17_WORLD_KEY) || localStorage.getItem(V16_WORLD_KEY) || localStorage.getItem(V15_WORLD_KEY) || localStorage.getItem(V14_WORLD_KEY) || localStorage.getItem(V13_WORLD_KEY) || localStorage.getItem(V12_WORLD_KEY) || localStorage.getItem(V11_WORLD_KEY) || 'null');
  } catch {}
  const hasV19World = Boolean(localStorage.getItem(WORLD_KEY) || localStorage.getItem(V19_WORLD_KEY));
  const npc: Record<string, NpcState> = {};
  SOCIAL_PERSONAS.forEach((p: any) => { npc[p.id] = normalizeNpc(p, parsed?.npc?.[p.id]); });
  const now = Date.now();
  const socialIds = new Set(SOCIAL_PERSONAS.map((persona: any) => persona.id));
  const migratedEvents = hasV19World && Array.isArray(parsed?.events) ? parsed.events.slice(0, 180).map((event: any) => ({
    tier: 2,
    visibility: 'timeline',
    source: 'offline',
    ...event,
  })).filter((event: any) => socialIds.has(event.npcId)).map((event:any)=>({...event,content:simpleHumanText(event.content||'')})) as WorldEvent[] : [];
  const events = dedupeMigratedEvents(migratedEvents);
  return {
    lastSimulatedAt: Number(parsed?.lastSimulatedAt || now),
    lastOpenedAt: Number(parsed?.lastOpenedAt || parsed?.lastSimulatedAt || now),
    npc,
    events,
    offlineGenerated: Number(parsed?.offlineGenerated || 0),
    publishedEventIds: hasV19World && Array.isArray(parsed?.publishedEventIds) ? parsed.publishedEventIds.slice(-240) : [],
    lastAiEnrichedAt: Number(parsed?.lastAiEnrichedAt || 0),
    offlineSummary: parsed?.offlineSummary,
    lastSeenCompletionIds: Array.isArray(parsed?.lastSeenCompletionIds) ? parsed.lastSeenCompletionIds : [],
    recentContentFingerprints: Array.isArray(parsed?.recentContentFingerprints)
      ? parsed.recentContentFingerprints.slice(-80)
      : events.slice(0, 50).map(event => contentFingerprint(event.content)).filter(Boolean),
    lastPublishedByNpc: parsed?.lastPublishedByNpc && typeof parsed.lastPublishedByNpc === 'object' ? parsed.lastPublishedByNpc : {},
    simulatorVersion: 206,
  };
};

const simulationModeFor = (elapsedMs: number, forceOne: boolean): SimulationMode => {
  if (forceOne) return 'live';
  const hours = elapsedMs / 3600000;
  if (hours <= 6) return 'detail';
  if (hours <= 24) return 'compressed-day';
  if (hours <= 24 * 7) return 'compressed-day';
  if (hours <= 24 * 30) return 'highlights';
  return 'summary';
};

const eventCountFor = (elapsedMs: number, mode: SimulationMode, forceOne: boolean) => {
  if (forceOne) return 1;
  const hours = elapsedMs / 3600000;
  const days = hours / 24;
  if (mode === 'detail') return clamp(Math.floor(hours * 2.4), 1, 16);
  if (mode === 'compressed-day') return clamp(Math.floor(hours * 1.15), 6, 28);
  if (mode === 'highlights') return clamp(Math.round(days * 1.8), 14, 38);
  if (mode === 'summary') return 18;
  return 1;
};

const feedLimitFor = (mode: SimulationMode, elapsedMs: number) => {
  if (mode === 'live') return 1;
  const hours = elapsedMs / 3600000;
  if (hours <= 6) return 4;
  if (hours <= 24) return 8;
  if (hours <= 24 * 7) return 10;
  if (hours <= 24 * 30) return 8;
  return 6;
};

const absenceHeadline = (minutes: number, published: number) => {
  if (minutes < 60) return `Thế giới vừa có ${published} cập nhật đáng chú ý.`;
  if (minutes < 24 * 60) return `Trong lúc bạn vắng mặt, cộng đồng có ${published} chuyện đáng đăng.`;
  if (minutes < 4 * 24 * 60) return `Bạn vắng ${Math.max(1, Math.round(minutes / 1440))} ngày. Cộng đồng vẫn sống, nhưng không ai spam bạn.`;
  if (minutes < 20 * 24 * 60) return `Bạn quay lại sau ${Math.max(1, Math.round(minutes / 1440))} ngày. Community chuyển sang nhịp comeback, giảm cà khịa.`;
  return `Bạn quay lại sau một quãng dài. Hệ thống chỉ giữ highlights quan trọng thay vì tạo hàng nghìn bài giả.`;
};

const timestampAt = (from: number, to: number, index: number, count: number, seed: number) => {
  const span = Math.max(60_000, to - from);
  const slot = span / Math.max(1, count);
  const jitter = (seed % Math.max(1, Math.floor(slot * 0.55)));
  return Math.min(to - 1000, Math.max(from + 1000, from + index * slot + jitter));
};

const eventTier = (kind: WorldEventKind): EventTier => {
  if (kind === 'milestone') return 5;
  if (kind === 'comeback' || kind === 'duel' || kind === 'relationship' || kind === 'world_debate') return 4;
  if (kind === 'banter' || kind === 'callback' || kind === 'npc_fail' || kind === 'user_signal' || kind === 'world_reaction' || kind === 'world_followup') return 3;
  if (kind === 'npc_win' || kind === 'world_topic' || kind === 'world_discovery') return 2;
  return 1;
};

const socialVisibility = (kind: WorldEventKind, tier: EventTier, seed: number): SocialVisibility => {
  if (tier >= 5) return 'feed';
  if (tier === 4) return (seed % 100) < 86 ? 'feed' : 'timeline';
  if (tier === 3) return (seed % 100) < 58 ? 'feed' : 'timeline';
  if (tier === 2) return (seed % 100) < 24 ? 'feed' : 'timeline';
  if (kind === 'routine') return (seed % 100) < 24 ? 'timeline' : 'silent';
  return 'timeline';
};

const stageForElapsed = (minutes: number) => {
  if (minutes < 240) return 'normal';
  if (minutes < 1440) return 'noticed';
  if (minutes < 4 * 1440) return 'missed';
  if (minutes < 20 * 1440) return 'comeback';
  return 'returning';
};

const makeWorldEvent = (
  eventTime: number,
  index: number,
  npcRecord: Record<string, NpcState>,
  source: 'offline' | 'live',
  absenceMinutes: number,
  userName: string,
  activeGoal: string,
  habits: Habit[],
  incompleteHabits: Habit[],
  todayCompletedIds: string[],
  rivalry: any,
  newlyCompletedHabit: Habit | null,
  allowUserSignal: boolean,
  recentContent: Set<string>,
): WorldEvent => {
  const salt = `${eventTime}-${index}-${activeGoal}`;
  const persona = chooseLivingActor(SOCIAL_PERSONAS, npcRecord, eventTime, salt) as any;
  const npc = npcRecord[persona.id] || createNpcState(persona);
  const seed = hash(`${salt}-${persona.id}-${npc.lifeProgress}-${npc.currentStreak}`);
  const routine = npc.routine || makeRoutine(seed);
  const hour = new Date(eventTime).getHours();
  const fatigue = Number(npc.humorFatigue || 0);
  const stage = stageForElapsed(absenceMinutes);
  const selectedHabit = habits.length ? habits[seed % habits.length] : null;
  const unfinished = incompleteHabits.length ? incompleteHabits[seed % incompleteHabits.length] : null;
  let partner: any = null;
  let reactor: any = null;
  const isFocusHour = routine.focusHours.includes(hour);
  const isSocialHour = routine.socialHours.includes(hour);
  const isLowEnergyHour = routine.lowEnergyHours.includes(hour) || hour >= routine.restHour;
  const chance = seed % 100;
  let kind: WorldEventKind = 'routine';

  if (rivalry?.active && chance < 8 && absenceMinutes > 45) kind = 'duel';
  else if ((npc.recoveryNeed || 0) > 0.56 && chance < 40) kind = 'comeback';
  else if (isSocialHour && chance < 58) kind = chance < 22 ? 'relationship' : 'banter';
  else if (isFocusHour) kind = chance < 58 ? 'npc_win' : chance < 80 ? 'npc_fail' : chance < 91 ? 'milestone' : 'callback';
  else if (isLowEnergyHour) kind = chance < 47 ? 'npc_fail' : chance < 67 ? 'comeback' : chance < 83 ? 'banter' : 'routine';
  else if (chance < 19) kind = 'npc_win';
  else if (chance < 36) kind = 'npc_fail';
  else if (chance < 50) kind = 'banter';
  else if (chance < 58) kind = 'relationship';
  else if (chance < 64) kind = 'callback';
  else kind = 'routine';

  if (allowUserSignal && newlyCompletedHabit && source === 'live') kind = 'user_signal';
  // V21: legacy kind is only a candidate. Needs, private life, information behavior and social pressure decide whether/how it surfaces.
  const v21Plan = decideLivingEvent({ npcId: persona.id, legacyKind: kind as any, seed: String(seed), eventTime, isSocialHour, isLowEnergyHour, source });
  kind = v21Plan.kind as WorldEventKind;
  const partnerPurpose = (kind === 'npc_fail' || kind === 'comeback' || kind === 'relationship') ? 'support' : kind === 'world_debate' ? 'conflict' : kind === 'banter' ? 'banter' : 'share';
  const topicExpert = v21Plan.topic ? expertForTopic(SOCIAL_PERSONAS.filter((p:any)=>p.id !== persona.id), v21Plan.topic.category) : null;
  partner = (kind.startsWith('world_') && topicExpert)
    ? topicExpert
    : chooseSocialPartner(persona, SOCIAL_PERSONAS, npcRecord, `${salt}-partner`, partnerPurpose as any) as any;
  reactor = chooseSocialPartner(persona, SOCIAL_PERSONAS.filter((p:any)=>p.id !== partner?.id), npcRecord, `${salt}-reactor`, 'share') as any;

  const tier = eventTier(kind);
  const visibility = (v21Plan.visibility || socialVisibility(kind, tier, seed)) as SocialVisibility;
  const style = fatigue > 0.72 ? 'Quan sát' : pick(npc.comedyDNA, seed);
  const subject = unfinished?.title || selectedHabit?.title || 'việc quan trọng hôm nay';
  const livingContext=innerLifeContextForNpc(persona.id) as any;
  const ownLifeSubject=String(livingContext?.currentProject || '').trim() || subject;
  const v21Subject = v21Plan.topic?.title || (kind==='user_signal'||kind==='duel' ? subject : ownLifeSubject);
  let content = v21Plan.topic && kind.startsWith('world_')
    ? worldAwareFallback(persona.id, kind as any, v21Plan.topic)
    : humanEventLine(persona, kind, v21Subject, activeGoal, partner, reactor, npc, seed, rivalry);
  if (v21Plan.topic && partner?.id) propagateWorldKnowledge(persona.id, partner.id, v21Plan.topic.id, `nghe ${persona.name} nhắc trong cộng đồng`);
  if (partner?.id && kind === 'relationship') {
    updateRelationship(persona.id, partner.id, { trust:.035, affection:.025, emotionalSafety:.025, unresolvedTension:-.03 }, 'một tương tác làm quan hệ mềm hơn');
    updateRelationship(partner.id, persona.id, { trust:.02, affection:.018 }, 'được đối phương chủ động tương tác');
  } else if (partner?.id && kind === 'banter') {
    updateRelationship(persona.id, partner.id, { playfulness:.035, closeness:.012, irritation:(seed % 17 === 0 ? .025 : 0) }, 'banter có lịch sử, đôi lúc vui, đôi lúc hơi chạm');
  } else if (partner?.id && kind === 'world_debate') {
    updateRelationship(persona.id, partner.id, { irritation:.025, unresolvedTension:.035, respect:.008 }, 'bất đồng về một chuyện ngoài đời');
  } else if (partner?.id && kind === 'comeback') {
    updateRelationship(partner.id, persona.id, { respect:.018, unresolvedTension:-.012 }, 'thấy đối phương quay lại sau một nhịp hụt');
  }
  if (['relationship','banter','callback','npc_fail','comeback','world_debate','world_followup'].includes(kind)) {
    openOrAdvanceThread([persona.id, partner?.id].filter(Boolean), `${persona.name}: ${v21Subject}`, content || `${kind}: ${v21Subject}`, kind === 'relationship' || kind === 'comeback' ? -.025 : .035);
  }
  // V16: Community speech never carries a hidden coach CTA. The system Next Move is rendered separately.
  const actionHint = '';
  if (kind === 'user_signal') {
    const completedHabit = newlyCompletedHabit || habits.find(h => todayCompletedIds.includes(h.id)) || selectedHabit;
    const completedTitle = completedHabit?.title || 'một thói quen';
    content = humanEventLine(persona, kind, completedTitle, activeGoal, partner, reactor, npc, seed, rivalry);
  }


  return {
    id: `osle-${eventTime}-${index}-${seed}`,
    npcId: persona.id,
    npcName: persona.name,
    npcAvatar: persona.avatar,
    kind,
    tier,
    visibility,
    content,
    actionHint,
    comedyStyle: style,
    partnerIds: ['banter','relationship','world_debate','world_reaction','world_followup'].includes(kind) ? [partner?.id, reactor?.id].filter(Boolean) : undefined,
    createdAt: new Date(eventTime).toISOString(),
    source,
    aiEnriched: true,
  };
};

const eventToPost = (event: WorldEvent, _now: number, availableHabits: Habit[] = []): SocialPost => {
  const id = `osle-post-${event.id}`;
  const startedAt = new Date(event.createdAt).getTime() || Date.now();
  // Only meaningful story beats can self-open a ritual; routine filler never does.
  // Companion/challenge rituals bind to a real user habit so accepting one has consequences.
  const selectedHabit = availableHabits.length ? availableHabits[hash(`${id}|ritual-habit`) % availableHabits.length] : undefined;
  const ritualMode: CommunityIntent | undefined = event.kind === 'npc_fail' && event.tier >= 3
    ? 'confide'
    : selectedHabit && event.kind === 'comeback' && event.tier >= 3
      ? 'companion'
      : selectedHabit && (event.kind === 'duel' || event.kind === 'milestone') && event.tier >= 4
        ? 'challenge'
        : undefined;
  const otherMembers = ritualMode ? chooseRitualMembers(ritualMode, id, SOCIAL_PERSONAS.map((persona:any) => persona.id).filter(npcId => npcId !== event.npcId)) : [];
  const memberIds = ritualMode === 'confide' ? otherMembers : ritualMode ? [event.npcId, ...otherMembers.slice(0, 2)] : [];
  const deadline = startedAt + (ritualMode === 'challenge' ? 24 : ritualMode === 'companion' ? 6 : 12) * 60 * 60_000;
  return {
    id,
    authorName: event.npcName,
    authorAvatar: event.npcAvatar,
    content: event.content,
    type: 'habit',
    createdAt: event.createdAt,
    likes: 0,
    comments: [],
    communityIntent: ritualMode,
    communitySession: ritualMode ? {
      ...createSocialRitual({ postId: id, mode: ritualMode, content: event.content, creatorId: event.npcId, habitId: ritualMode === 'confide' ? undefined : selectedHabit?.id, habitTitle: ritualMode === 'confide' ? undefined : selectedHabit?.title, memberIds, startedAt, checkInAt: deadline }),
      careReading: inferCareReading(event.content, ritualMode),
    } : undefined,
    challenge: ritualMode === 'challenge' && selectedHabit ? { habitId: selectedHabit.id, title: selectedHabit.title, deadline: new Date(deadline).toISOString(), participants: memberIds.length, participantIds: memberIds } : undefined,
  };
};
const weakLegacySocialLine = (text:string) => {
  const t=String(text||'').trim().toLocaleLowerCase('vi-VN');
  if(!t)return false;
  return /ổn\.?\s*cứ để tiến bộ nhỏ|cố lên|đừng bỏ cuộc|hãy tiếp tục|mỗi bước nhỏ|không sao.*(?:cố|ngày mai)|kỷ luật là chìa khóa|hỏi hay thì cứ hỏi|làm thật mới tài|giữ cho bền|tôi hiểu cảm giác|mình hiểu bạn|mọi chuyện rồi sẽ ổn|bạn không đơn độc|tôi có giả thuyết,? nhưng cho fact trước/.test(t);
};
const isKnownNpcName=(name:string)=>SOCIAL_PERSONAS.some((p:any)=>String(p.name||'')===String(name||''));

const CommunityWorld: React.FC<CommunityWorldProps> = ({
  userName, userAvatar, posts, setPosts, onPostCreated, library, habits, logs
}) => {
  const [world, setWorld] = useState<WorldState>(loadWorld);
  const worldRef = useRef<WorldState>(world);
  const postsRef = useRef<SocialPost[]>(posts);
  const mountedRef = useRef(false);
  const completionWatcherReadyRef = useRef(false);
  const circleRepliesInFlightRef = useRef<Set<string>>(new Set());
  const ritualActionsInFlightRef = useRef<Set<string>>(new Set());
  const [newPostContent, setNewPostContent] = useState('');
  const [postIntent, setPostIntent] = useState<CommunityIntent>('confide');
  const [challengeHabitId, setChallengeHabitId] = useState('');
  const [commentInputs, setCommentInputs] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [supportedPosts, setSupportedPosts] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('habit_mosaic_community_supports') || '{}'); } catch { return {}; }
  });
  const [joinedChallenges, setJoinedChallenges] = useState<Record<string, boolean>>(() => {
    try { return JSON.parse(localStorage.getItem('habit_mosaic_joined_challenges') || '{}'); } catch { return {}; }
  });
  const [worldPulse, setWorldPulse] = useState<any[]>(() => getWorldTopics().filter((t:any)=>Number(t.storyValue||0)>=.60).slice(0, 3));
  const [ambientMoments, setAmbientMoments] = useState<any[]>(() => getAmbientMoments(10));
  const [lifeStoryMoments, setLifeStoryMoments] = useState<any[]>(() => getLifeStoryMomentsV238(10));
  const [presencePulse, setPresencePulse] = useState(0);
  const today = localDateKey();
  const todayCompletedIds = logs.find(l => l.date === today)?.completedHabitIds || [];
  const incompleteHabits = habits.filter(h => !todayCompletedIds.includes(h.id));
  const selectedChallengeHabit = habits.find(h => h.id === challengeHabitId) || incompleteHabits[0] || habits[0];
  let goalGraph: any = {};
  try { goalGraph = JSON.parse(localStorage.getItem('habit_mosaic_v12_goal_graph') || '{}'); } catch {}
  const activeGoal = goalGraph.title || localStorage.getItem('habit_mosaic_v11_goal') || 'mục tiêu hiện tại của bạn';
  const rivalryRaw = localStorage.getItem('habit_mosaic_legendary_rivalry_v21') || localStorage.getItem('habit_mosaic_legendary_rivalry_v12') || localStorage.getItem('habit_mosaic_legendary_rivalry_v11');
  const rivalry = useMemo(() => {
    try { return rivalryRaw ? JSON.parse(rivalryRaw) : null; } catch { return null; }
  }, [rivalryRaw]);
  const completionSignature = `${today}:${[...todayCompletedIds].sort().join('|')}`;
  const liveContextRef = useRef({ userName, activeGoal, habits, incompleteHabits, todayCompletedIds, rivalry });

  useEffect(() => {
    worldRef.current = world;
    localStorage.setItem(WORLD_KEY, JSON.stringify(world));
  }, [world]);

  useEffect(() => { localStorage.setItem('habit_mosaic_community_supports', JSON.stringify(supportedPosts)); }, [supportedPosts]);
  useEffect(() => { localStorage.setItem('habit_mosaic_joined_challenges', JSON.stringify(joinedChallenges)); }, [joinedChallenges]);
  useEffect(() => {
    if (!challengeHabitId && selectedChallengeHabit) setChallengeHabitId(selectedChallengeHabit.id);
  }, [challengeHabitId, selectedChallengeHabit]);

  useEffect(() => { postsRef.current = posts; }, [posts]);
  // V21 World Awareness: factual topics are fetched in desktop main; the LLM may react but never invent the external event.
  useEffect(() => {
    const bridge=(window as any).habitMosaicDesktop;
    const sync=async()=>{
      const topics=await syncWorldAwareness(bridge);
      setWorldPulse((Array.isArray(topics)&&topics.length?topics:getWorldTopics()).filter((t:any)=>Number(t.storyValue||0)>=.60).slice(0,3));
    };
    void sync();
    const id=setInterval(()=>{void sync();},30*60_000);
    return()=>clearInterval(id);
  }, []);
  // V23.8 LIFE STORY: NPCs have dreams -> goals -> story arcs -> private/public beats. Soul Expression speaks AFTER life has actually happened.
  useEffect(() => {
    const beat=()=>{
      const at=Date.now();
      heartbeatLivingSociety(SOCIAL_PERSONAS, worldRef.current.npc, at);
      const storyBeats=heartbeatLifeStoriesV238(SOCIAL_PERSONAS, getWorldTopics(), at) as any[];
      storyBeats.forEach((b:any)=>{
        if(Number(b.signal||0)>=.68) remember(b.npcId,{type:'episode',subject:'chương đời đang chạy',content:String(b.event||'').slice(0,180),salience:Math.min(.9,.52+Number(b.signal||0)*.32),emotionalWeight:b.type==='failure'||b.type==='conflict'?.72:b.type==='breakthrough'?.68:.48,confidence:.9,decayHalfLifeHours:720,sourceId:b.id});
        if(b.relatedNpcId){
          const delta=b.type==='conflict'?{irritation:.045,unresolvedTension:.065}:b.type==='repair'?{trust:.045,affection:.03,unresolvedTension:-.08,awkwardness:-.04}:{closeness:.02,playfulness:.018,respect:.012};
          updateRelationship(b.npcId,b.relatedNpcId,delta,`life-story beat: ${String(b.event||'').slice(0,90)}`);
          openOrAdvanceThread([b.npcId,b.relatedNpcId],String(b.arcId||'quan hệ đang chạy'),String(b.event||''),b.type==='repair'?-.06:b.type==='conflict'?.06:.02);
        }
      });
      setAmbientMoments(getAmbientMoments(12));
      setLifeStoryMoments(getLifeStoryMomentsV238(12));
      setPresencePulse(v=>v+1);
    };
    beat();
    const id=setInterval(beat,90_000);
    return()=>clearInterval(id);
  }, []);
  // Every user-authored post created anywhere in App enters ONE V21 social queue.
  useEffect(() => {
    posts.filter(p=>!String(p.id||'').startsWith('osle-post-') && (p.authorName===userName || /^cw-post-|^post-/.test(String(p.id||'')))).slice(0,24)
      .forEach(p=>queueUserPostReactions(p,SOCIAL_PERSONAS,worldRef.current.npc));
  }, [posts, userName]);

  useEffect(() => {
    liveContextRef.current = { userName, activeGoal, habits, incompleteHabits, todayCompletedIds, rivalry };
  }, [userName, activeGoal, habits, incompleteHabits, completionSignature, rivalryRaw]);

  // V17: sanitize continuously, because legacy App effects can append an old celebrity post after mount.
  useEffect(() => {
    const retained = new Set(worldRef.current.events.map(event => event.id));
    const clean = posts.filter(post => {
      if (isForbiddenSocialName(post.authorName || '')) return false;
      if (/^(ap-|vpost-|vcomment-)/.test(String(post.id||''))) return false;
      if (post.id.startsWith('osle-post-')) {
        const eventId = post.id.slice('osle-post-'.length);
        return retained.has(eventId);
      }
      return true;
    }).map(post => ({...post, comments:(post.comments || []).filter((comment:any)=>{
      const author=String(comment.authorName || comment.userName || '');
      if(isForbiddenSocialName(author))return false;
      // Remove only known weak NPC fallbacks left in persisted V20/V21 data; never delete the user's own text.
      if(isKnownNpcName(author) && weakLegacySocialLine(String(comment.content||'')))return false;
      return true;
    })}));
    const changed = clean.length !== posts.length || clean.some((post,i)=>(post.comments||[]).length !== (posts[i]?.comments||[]).length);
    if (changed) { postsRef.current = clean; setPosts(clean); }
  }, [posts, setPosts, world.events.length]);

  const publishFeedEvents = (events: WorldEvent[], nextWorld: WorldState) => {
    const candidates = events.filter(event => event.visibility === 'feed' && !nextWorld.publishedEventIds.includes(event.id));
    if (!candidates.length) return nextWorld;
    const now = Date.now();
    const recentPosts = postsRef.current.slice(0, 40);
    const recentFingerprints = new Set([
      ...nextWorld.recentContentFingerprints.slice(-60),
      ...recentPosts.map(post => contentFingerprint(post.content)).filter(Boolean),
    ]);
    const lastPublishedByNpc = { ...(nextWorld.lastPublishedByNpc || {}) };
    const accepted: WorldEvent[] = [];
    const batchKinds = new Map<WorldEventKind, number>();

    for (const event of candidates) {
      const fp = contentFingerprint(event.content);
      const lastNpcPost = Number(lastPublishedByNpc[event.npcId] || 0);
      const npcCooldown = event.tier >= 5 ? 45 * 60_000 : 90 * 60_000;
      const kindCount = batchKinds.get(event.kind) || 0;
      // Same skeleton, same NPC too soon, or too many copies of one event kind in the same batch -> timeline only.
      if ((fp && recentFingerprints.has(fp)) || (lastNpcPost && now - lastNpcPost < npcCooldown) || (event.kind !== 'milestone' && kindCount >= 2)) {
        continue;
      }
      accepted.push(event);
      if (fp) recentFingerprints.add(fp);
      lastPublishedByNpc[event.npcId] = new Date(event.createdAt).getTime() || now;
      batchKinds.set(event.kind, kindCount + 1);
    }

    if (accepted.length) {
      accepted.forEach(event => queueNpcPostReactions(event, `osle-post-${event.id}`, SOCIAL_PERSONAS, nextWorld.npc));
      const newPosts = accepted.map(event => eventToPost(event, now, liveContextRef.current.habits));
      setPosts(prev => {
        const existingIds = new Set(prev.map(post => post.id));
        const existingFp = new Set(prev.slice(0, 50).map(post => contentFingerprint(post.content)).filter(Boolean));
        const unique = newPosts.filter(post => {
          const fp = contentFingerprint(post.content);
          if (existingIds.has(post.id) || (fp && existingFp.has(fp))) return false;
          if (fp) existingFp.add(fp);
          return true;
        });
        const next = [...unique, ...prev]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 100);
        postsRef.current = next;
        return next;
      });
    }

    // Mark every candidate handled so rejected repeats never resurface on the next tick.
    return {
      ...nextWorld,
      publishedEventIds: [...nextWorld.publishedEventIds, ...candidates.map(e => e.id)].slice(-240),
      lastPublishedByNpc,
      recentContentFingerprints: [...recentFingerprints].slice(-80),
    };
  };

  const simulateWindow = (forceOne = false): SimulationResult => {
    const prev = worldRef.current;
    const ctx = liveContextRef.current;
    const now = Date.now();
    const from = forceOne ? Math.max(prev.lastSimulatedAt, now - 4 * 60_000) : prev.lastSimulatedAt;
    const elapsed = Math.max(0, now - from);
    if (!forceOne && elapsed < 18 * 60_000) return { world: prev, feedEvents: [] };
    const mode = simulationModeFor(elapsed, forceOne);
    const count = eventCountFor(elapsed, mode, forceOne);
    const absenceMinutes = elapsed / 60_000;
    const nextNpc = { ...prev.npc };
    const events: WorldEvent[] = [];
    let relationshipChanges = 0;

    const previousSeen = Array.isArray(prev.lastSeenCompletionIds) ? prev.lastSeenCompletionIds : [];
    const newlyCompletedIds = ctx.todayCompletedIds.filter(id => !previousSeen.includes(id));
    const recentSignalsToday = new Set(
      prev.events
        .filter(event => event.kind === 'user_signal' && localDateKey(new Date(event.createdAt)) === localDateKey())
        .map(event => eventSubject(event))
        .filter(Boolean),
    );
    const newlyCompletedHabit = newlyCompletedIds
      .map(id => ctx.habits.find(habit => habit.id === id) || null)
      .find(habit => habit && !recentSignalsToday.has(habit.title.toLocaleLowerCase('vi-VN').trim())) || null;
    const shouldEmitUserSignal = forceOne && !!newlyCompletedHabit;

    const recentContent = new Set<string>([
      ...(prev.recentContentFingerprints || []).slice(-80),
      ...prev.events.slice(0, 50).map(event => contentFingerprint(event.content)).filter(Boolean),
      ...postsRef.current.slice(0, 30).map(post => contentFingerprint(post.content)).filter(Boolean),
    ]);

    for (let i = 0; i < count; i++) {
      const seed = hash(`${from}-${now}-${i}-${mode}`);
      const eventTime = forceOne ? now : timestampAt(from, now, i, count, seed);
      const event = makeWorldEvent(
        eventTime,
        i,
        nextNpc,
        forceOne ? 'live' : 'offline',
        absenceMinutes,
        ctx.userName,
        ctx.activeGoal,
        ctx.habits,
        ctx.incompleteHabits,
        ctx.todayCompletedIds,
        ctx.rivalry,
        newlyCompletedHabit,
        shouldEmitUserSignal && i === 0,
        recentContent,
      );
      events.push(event);
      const fp = contentFingerprint(event.content);
      if (fp) recentContent.add(fp);
      const state = nextNpc[event.npcId] || createNpcState(SOCIAL_PERSONAS.find((p: any) => p.id === event.npcId));
      const partnerId = event.partnerIds?.[0];
      const funnyTurn = event.kind === 'banter' || event.kind === 'callback';
      const nextFatigue = clamp(Number(state.humorFatigue || 0) + (funnyTurn ? 0.12 : -0.045), 0, 1);
      const bank = state.memoryBank || { facts: [], relationshipEvents: [], insideJokes: [], recentEvents: [], summary: '' };
      const winDelta = event.kind === 'npc_win' || event.kind === 'milestone' || event.kind === 'comeback' ? 1 : 0;
      const failDelta = event.kind === 'npc_fail' ? 1 : 0;
      const progressDelta = event.kind === 'milestone' ? 4 : event.kind === 'npc_win' ? 1.8 : event.kind === 'comeback' ? 1.1 : event.kind === 'npc_fail' ? 0.08 : 0.3;
      const nextRecovery = clamp(Number(state.recoveryNeed || 0) + (event.kind === 'npc_fail' ? 0.22 : event.kind === 'comeback' ? -0.48 : -0.03), 0, 1);
      const nextStreak = event.kind === 'npc_fail' ? 0 : event.kind === 'npc_win' || event.kind === 'comeback' || event.kind === 'milestone' ? Number(state.currentStreak || 0) + 1 : Number(state.currentStreak || 0);
      let socialLinks = state.socialLinks || {};
      let relationshipEvents = bank.relationshipEvents || [];
      if (partnerId && (event.kind === 'banter' || event.kind === 'relationship')) {
        const delta = event.kind === 'relationship' ? 4 : 2;
        socialLinks = { ...socialLinks, [partnerId]: clamp(Number(socialLinks[partnerId] || 25) + delta, 0, 100) };
        relationshipEvents = [...relationshipEvents, `${event.kind === 'relationship' ? 'Gần gũi hơn' : 'Banter'} với ${partnerId} lúc ${new Date(event.createdAt).toLocaleString()}`].slice(-12);
        relationshipChanges += 1;
      }
      const recentEvents = [...(bank.recentEvents || []), `${event.kind}: ${event.content.slice(0, 110)}`].slice(-14);
      const insideJokes = event.kind === 'callback' ? [...(bank.insideJokes || []), state.runningGag].slice(-8) : (bank.insideJokes || []);
      const eventPersona = SOCIAL_PERSONAS.find((p:any)=>p.id===event.npcId) || { id:event.npcId, name:event.npcName, role:'' };
      const subjectForEmotion = eventSubject(event) || ctx.incompleteHabits[0]?.title || ctx.activeGoal || event.kind;
      const nextEmotion = emotionAfterEvent(eventPersona, state, event, subjectForEmotion, seed);
      let socialEmotions = { ...(state.socialEmotions || {}) };
      if (partnerId) {
        const oldSocial = socialEmotions[partnerId] || { affection:.34, irritation:.08, respect:.35, lastReason:'chưa có chuyện lớn', lastChangedAt:event.createdAt };
        socialEmotions[partnerId] = {
          affection: clamp(oldSocial.affection + (event.kind === 'relationship' ? .12 : event.kind === 'banter' ? .04 : 0), 0, 1),
          irritation: clamp(oldSocial.irritation + (event.kind === 'banter' && seed % 11 === 0 ? .08 : -.015), 0, 1),
          respect: clamp(oldSocial.respect + (event.kind === 'relationship' ? .06 : event.kind === 'npc_win' ? .04 : 0), 0, 1),
          lastReason: `${event.kind}: ${subjectForEmotion}` ,
          lastChangedAt: event.createdAt,
        };
      }
      nextNpc[event.npcId] = {
        ...state,
        mood: event.kind === 'npc_fail' ? 'tired' : event.kind === 'comeback' ? 'focused' : pick(MOODS, seed >> 4),
        lifeProgress: clamp(state.lifeProgress + progressDelta, 0, 100),
        lifeStage: event.kind === 'npc_fail' ? 'kẹt giữa chừng' : event.kind === 'comeback' ? 'comeback' : event.kind === 'milestone' || state.lifeProgress > 80 ? 'nước rút' : state.lifeStage,
        wins: state.wins + winDelta,
        failures: state.failures + failDelta,
        currentStreak: nextStreak,
        recoveryNeed: nextRecovery,
        humorFatigue: nextFatigue,
        socialLinks,
        emotionalState: nextEmotion,
        socialEmotions,
        lastOutcomeAt: event.createdAt,
        memoryBank: {
          ...bank,
          recentEvents,
          relationshipEvents,
          insideJokes,
          summary: `${state.lifeGoal || 'mục tiêu riêng'} · ${event.kind === 'npc_fail' ? 'vừa trượt' : event.kind === 'comeback' ? 'đang comeback' : state.lifeStage || 'đang tiến hành'} · W${state.wins + winDelta} L${state.failures + failDelta}`,
        },
      };
    }

    const feedLimit = feedLimitFor(mode, elapsed);
    const recentHistoricalFp = new Set(prev.events.slice(0, 45).map(event => contentFingerprint(event.content)).filter(Boolean));
    const perKind = new Map<WorldEventKind, number>();
    const ranked = events
      .filter(event => event.visibility === 'feed')
      .sort((a, b) => (b.tier - a.tier) || (new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
      .filter(event => {
        const fp = contentFingerprint(event.content);
        const seen = fp && recentHistoricalFp.has(fp);
        const used = perKind.get(event.kind) || 0;
        if (seen || (event.kind !== 'milestone' && used >= 2)) return false;
        if (fp) recentHistoricalFp.add(fp);
        perKind.set(event.kind, used + 1);
        return true;
      })
      .slice(0, feedLimit)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    const feedIds = new Set(ranked.map(event => event.id));
    const normalizedEvents = events.map(event => event.visibility === 'feed' && !feedIds.has(event.id) ? { ...event, visibility: 'timeline' as SocialVisibility } : event);

    // V20.5: when Gemini is configured, character language should come from the NPC system prompt,
    // not from one hard-coded polished post every 90 minutes. Mark the most important new posts
    // for prompt-based rewriting; simulation facts remain deterministic and offline-safe.
    [...ranked].sort((a, b) => b.tier - a.tier).slice(0, 3).forEach(candidate => {
      const matching = normalizedEvents.find(event => event.id === candidate.id);
      if (matching) matching.aiEnriched = false;
    });

    const generatedComments = 0; // V21 comments are scheduled causal actions and may arrive later/offline.
    const summary: OfflineSummary | undefined = forceOne ? undefined : {
      from: new Date(from).toISOString(),
      to: new Date(now).toISOString(),
      durationMinutes: Math.round(absenceMinutes),
      simulatedEvents: count,
      publishedPosts: ranked.length,
      generatedComments,
      relationshipChanges,
      mode,
      headline: absenceHeadline(absenceMinutes, ranked.length),
    };

    const allEvents = dedupeMigratedEvents([
      ...normalizedEvents.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
      ...prev.events,
    ]);
    const nextWorld: WorldState = {
      ...prev,
      lastSimulatedAt: now,
      lastOpenedAt: now,
      npc: nextNpc,
      events: allEvents,
      offlineGenerated: forceOne ? prev.offlineGenerated : count,
      offlineSummary: summary || prev.offlineSummary,
      lastSeenCompletionIds: [...ctx.todayCompletedIds],
      recentContentFingerprints: [...recentContent].slice(-80),
      simulatorVersion: 206,
    };
    return { world: nextWorld, feedEvents: ranked, summary };
  };

  const runSimulation = (forceOne = false) => {
    const result = simulateWindow(forceOne);
    if (result.world === worldRef.current && result.feedEvents.length === 0) return;
    let nextWorld = publishFeedEvents(result.feedEvents, result.world);
    worldRef.current = nextWorld;
    setWorld(nextWorld);
  };

  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    runSimulation(false);
    const interval = setInterval(() => runSimulation(true), 4 * 60_000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A real habit completion is edge-triggered. V13 announced the same completed habit on every
  // 4-minute live tick; V14 runs one signal only when the completion set actually changes.
  useEffect(() => {
    if (!completionWatcherReadyRef.current) {
      completionWatcherReadyRef.current = true;
      return;
    }
    runSimulation(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completionSignature]);

  // AI only polishes one notable event at a bounded cadence. Simulation facts, outcome, timestamp,
  // relationships and habit/rivalry state remain deterministic code, so no API cannot kill the world.
  useEffect(() => {
    const latest = world.events.find(event => event.visibility === 'feed' && event.aiEnriched === false);
    if (!latest) return;
    const bridge = (window as any).habitMosaicDesktop;
    if (!bridge?.requestApi) {
      setWorld(prev => ({ ...prev, events: prev.events.map(event => event.id === latest.id ? { ...event, aiEnriched: true } : event) }));
      return;
    }
    const persona = SOCIAL_PERSONAS.find((p: any) => p.id === latest.npcId) as any;
    const npc = world.npc[latest.npcId];
    if (!persona || !npc) return;
    let cancelled = false;
    (async () => {
      try {
        const recentCommunity = world.events
          .filter(event => event.id !== latest.id)
          .slice(0, 14)
          .map(event => event.content.slice(0, 160));
        const result = await bridge.requestApi('/api/generate-community-turn', {
          personaName: persona.name,
          personaRole: persona.role,
          comedyDNA: npc.comedyDNA,
          voiceProfile: characterVoiceForPersona(persona),
          intent: intentForEvent(latest.kind, characterVoiceForPersona(persona), hash(latest.id)),
          chemistryContext: latest.partnerIds?.map(id => SOCIAL_PERSONAS.find((p: any) => p.id === id)?.name).filter(Boolean).join(' ↔ ') || '',
          mood: npc.mood,
          emotionContext: emotionPromptContext(npc),
          soulContext: JSON.stringify(innerLifeContextForNpc(persona.id)),
          worldAwareness: getWorldContextForNpc(persona.id),
          storyContext: getStoryContextForNpc(persona.id),
          lifeStoryContext: JSON.stringify(lifeStoryPromptContextV238(persona.id)),
          relationshipStage: relationshipStage(npc.relationship),
          goalContext: activeGoal,
          habits: habits.map(h => h.title),
          memory: `life goal: ${npc.lifeGoal}; life stage: ${npc.lifeStage}; summary: ${npc.memoryBank?.summary || ''}; inside jokes: ${(npc.memoryBank?.insideJokes || []).slice(-3).join(' | ') || 'chưa có'}`,
          recentJokes: npc.recentJokes.slice(-5).join(' | '),
          humorFatigue: npc.humorFatigue || 0,
          worldContext: `SỰ KIỆN ĐÃ ĐƯỢC CODE CHỐT: ${latest.content}. Kind=${latest.kind}; tier=${latest.tier}; timestamp=${latest.createdAt}. Viết như một người thật trong nhóm, không như người viết status chuyên nghiệp. Trước khi nói, bám vào inner-life + memory + relationship + world/story context: nhân vật thấy gì, nó chạm vào chuyện gì cũ, đang muốn gần hay tránh, điều gì muốn nói nhưng không nói thẳng. Câu ngắn, đời thường, có thể vụng, cụt hoặc chỉ một chi tiết đúng chỗ. KHÔNG mặc định làm thơ, ca dao, quote hay chốt bài học; vần/chơi chữ chỉ hiếm khi đúng character và khoảnh khắc nhẹ. Nếu fail/nặng lòng: đừng tự động khuyên; đôi khi chỉ thú nhận, hỏi, im hoặc nói ít. Nếu có joke thì tự nhiên và phải phục vụ subtext/quan hệ. Tránh cấu trúc/câu/CTA giống các dòng gần đây: ${recentCommunity.join(' || ')}. KHÔNG đổi ai thắng/thua, không đổi fact, không giả trích dẫn.${rivalry?.active ? ` User đang Best-of-7 với ${rivalry.legendName || 'một huyền thoại'}.` : ''}`,
        });
        const rawContent = simpleHumanText(String(result?.body?.content || '').trim());
        const recentFp = new Set(world.events.filter(event => event.id !== latest.id).slice(0, 40).map(event => contentFingerprint(event.content)).filter(Boolean));
        const freshContent = rawContent && !recentFp.has(contentFingerprint(rawContent)) ? rawContent : '';
        if (cancelled) return;
        const now = Date.now();
        setWorld(prev => ({
          ...prev,
          lastAiEnrichedAt: now,
          events: prev.events.map(event => event.id === latest.id ? { ...event, content: freshContent || event.content, aiEnriched: true } : event),
          recentContentFingerprints: freshContent
            ? [...(prev.recentContentFingerprints || []), contentFingerprint(freshContent)].slice(-80)
            : prev.recentContentFingerprints,
          npc: {
            ...prev.npc,
            [latest.npcId]: {
              ...prev.npc[latest.npcId],
              recentJokes: freshContent ? [...(prev.npc[latest.npcId]?.recentJokes || []), freshContent.slice(0, 140)].slice(-8) : (prev.npc[latest.npcId]?.recentJokes || []),
            },
          },
        }));
        if (freshContent) {
          setPosts(prev => {
            const next = prev.map(post => post.id === `osle-post-${latest.id}` ? { ...post, content: freshContent } : post);
            postsRef.current = next;
            return next;
          });
        }
      } catch {
        if (!cancelled) setWorld(prev => ({ ...prev, lastAiEnrichedAt: Date.now(), events: prev.events.map(event => event.id === latest.id ? { ...event, aiEnriched: true } : event) }));
      }
    })();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [world.events.map(e => `${e.id}:${e.aiEnriched}`).join('|')]);

  const askAiReply = async (persona: any, post: SocialPost, npc: NpcState, actionContext = '') => {
    const bridge = (window as any).habitMosaicDesktop;
    if (!bridge?.requestApi) return '';
    try {
      const recent = npc.recentJokes.slice(-5).join(' | ');
      const careReading = post.communitySession?.careReading || inferCareReading(post.content, post.communityIntent || 'companion');
      const intentContext = post.communityIntent === 'confide'
        ? 'Đây là lời tâm sự. Trước hết hãy lắng nghe và phản hồi vào một chi tiết cụ thể; không giảng đạo, không ép người dùng tích cực.'
        : post.communityIntent === 'companion'
          ? 'Người dùng đang tìm bạn đồng hành. Hãy đề nghị một bước nhỏ, cụ thể mà hai bên có thể cùng làm.'
          : post.communityIntent === 'challenge'
            ? `Đây là lời mở thử thách cùng phát triển${post.challenge?.title ? ` về “${post.challenge.title}”` : ''}. Có thể nhận kèo hoặc khích lệ bằng lời ngắn, có tinh thần cạnh tranh lành mạnh.`
            : '';
      const result = await bridge.requestApi('/api/generate-persona-comment', {
        personaName: persona.name,
        personaRole: persona.role,
        postContent: post.content,
        category: 'motivation',
        goalContext: activeGoal,
        habits: habits.map(h => h.title),
        userStreak: logs.length,
        relationshipStage: relationshipStage(npc.relationship),
        comedyDNA: npc.comedyDNA,
        voiceProfile: characterVoiceForPersona(persona),
        problemMode: isProblemText(post.content),
        runningGag: npc.runningGag,
        recentJokes: recent,
        userMemory: [...(npc.memoryBank?.facts || []), ...(npc.memoryBank?.relationshipEvents || [])].slice(-6),
        humorFatigue: npc.humorFatigue || 0,
        seriousness: isSeriousText(post.content) ? 'high' : 'normal',
        emotion: emotionForText(post.content),
        emotionContext: emotionPromptContext(npc),
        empathyContext: JSON.stringify(careReading),
        soulContext: JSON.stringify(soulPromptContext(persona.id, post.content, npc.relationship, npc.humorFatigue || 0)),
        actionContext: [intentContext, actionContext].filter(Boolean).join(' '),
        worldAwareness: getWorldContextForNpc(persona.id),
        storyContext: getStoryContextForNpc(persona.id),
        lifeStoryContext: JSON.stringify(lifeStoryPromptContextV238(persona.id)),
        languageRule: 'Tiếng Việt rất đơn giản, câu ngắn, đời thường. Không mặc định làm thơ hay nói kiểu quote. Vần/chơi chữ chỉ dùng hiếm khi đúng cá tính và đúng khoảnh khắc; ưu tiên một chi tiết cụ thể, một câu hỏi đúng chỗ hoặc subtext hơn câu hay.',
        worldContext: rivalry?.active ? `Người dùng đang so tài với ${rivalry.legendName || 'một huyền thoại'}.` : '',
      });
      return String(result?.body?.comment || '');
    } catch {
      return '';
    }
  };

  const addNpcReply = async (post: SocialPost, forcedPersonaId?: string, actionContext = '') => {
    const persona = (forcedPersonaId ? SOCIAL_PERSONAS.find((p:any)=>p.id===forcedPersonaId) : null)
      || chooseLivingActor(SOCIAL_PERSONAS, worldRef.current.npc, Date.now(), `${post.id}-reply`) as any;
    const npc = worldRef.current.npc[persona.id] || createNpcState(persona);
    const serious = isSeriousText(post.content);
    let content = actionContext === 'v237_check_in'
      ? followUpReplyV237(persona.id, post.content, `${post.id}|${persona.id}|follow-up`)
      : await askAiReply(persona, post, npc, actionContext);
    const recentReplyFp = new Set<string>((npc.recentJokes || []).slice(-8).map(item => contentFingerprint(item)).filter(Boolean));
    if (content && recentReplyFp.has(contentFingerprint(content))) content = '';
    if (!content) {
      const seed = hash(`${post.id}-${persona.id}-soul-fallback-v238`);
      const storyRelevant = /ước mơ|mục tiêu|sau này|muốn trở thành|lại|thất bại|fail|bỏ|trượt|mệt|đuối|hết pin/i.test(post.content);
      content = storyRelevant
        ? storyAwareFallbackV238(persona.id, post.content, String(seed))
        : soulFallbackReply(persona.id, persona.name, post.content, npc.relationship, String(seed));
    }
    const comment: SocialComment = {
      id: `cw-c-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      authorId: persona.id,
      authorName: persona.name,
      authorAvatar: persona.avatar,
      content,
      createdAt: new Date().toISOString(),
    };
    setPosts(prev => prev.map(p => p.id === post.id ? { ...p, comments: [...(p.comments || []), comment] } : p));
    const semanticMemories = memoriesFromUserText(persona.id, post.content, post.id);
    const userEmotion = emotionForText(post.content);
    let replyEmotion = decayEmotionState(hash(`${persona.id}-emotion-reply`), npc.emotionalState);
    if (userEmotion === 'heavy' || userEmotion === 'down') replyEmotion = bumpEmotion(replyEmotion, { worry:.2, affection:.1, vulnerability:.06, joy:-.08 }, `user đang ${userEmotion === 'heavy' ? 'rất nặng lòng' : 'nản'}`, post.content.slice(0,80));
    else if (userEmotion === 'frustrated') replyEmotion = bumpEmotion(replyEmotion, { worry:.1, frustration:.05, affection:.06 }, 'user đang bực', post.content.slice(0,80));
    else if (userEmotion === 'proud') replyEmotion = bumpEmotion(replyEmotion, { joy:.12, pride:.13, affection:.08 }, 'user vừa có chuyện vui', post.content.slice(0,80));
    else replyEmotion = bumpEmotion(replyEmotion, { affection:.03 }, 'vừa nói chuyện với user', post.content.slice(0,80));
    setWorld(prev => ({
      ...prev,
      npc: {
        ...prev.npc,
        [persona.id]: {
          ...npc,
          relationship: Math.min(100, npc.relationship + 2),
          recentJokes: [...npc.recentJokes, content.slice(0, 120)].slice(-10),
          memories: [...(npc.memories || []), ...semanticMemories.map(m=>`${m.type}:${m.subject}`).slice(-4)].slice(-12),
          humorFatigue: clamp(Number(npc.humorFatigue || 0) + (serious ? -0.15 : 0.08), 0, 1),
          emotionalState: replyEmotion,
          memoryBank: {
            ...(npc.memoryBank || { facts: [], relationshipEvents: [], insideJokes: [], recentEvents: [], summary: '' }),
            facts: [...(npc.memoryBank?.facts || []), ...semanticMemories.filter(m=>m.type==='fact').map(m=>`${m.subject}: ${m.content}`)].slice(-18),
            relationshipEvents: [...(npc.memoryBank?.relationshipEvents || []), `Đã phản hồi user vào ${new Date().toLocaleDateString()}`].slice(-10),
            recentEvents: [...(npc.memoryBank?.recentEvents || []), ...semanticMemories.filter(m=>m.type==='episode').map(m=>`Episode: ${m.content}`)].slice(-12),
            summary: `${relationshipStage(Math.min(100, npc.relationship + 2))}; life goal ${npc.lifeGoal || 'riêng'}; nhớ ${Math.min(18, (npc.memoryBank?.facts || []).length + 1)} fact`,
          },
        }
      }
    }));
    recordNpcInteraction(persona.id, post.content, content, post.id);
  };

  // V21: interaction memory/relationship is updated after a real reply, not after a random timer.
  // Pending actions survive app close through localStorage; silence/ignore are valid outcomes.
  useEffect(() => {
    let busy=false;
    const pump=async()=>{ if(busy)return; busy=true; try {
      const due=drainDueUserReactions();
      for(const action of due){
        const post=postsRef.current.find(p=>p.id===action.postId); if(!post)continue;
        if(action.kind==='like') {
          setPosts(prev=>prev.map(p=>p.id===post.id?{...p,likes:(p.likes||0)+1}:p));
          continue;
        }
        if(action.kind==='remember') {
          memoriesFromUserText(action.npcId, action.stimulusText || post.content, action.stimulusId || post.id);
          continue;
        }
        if(action.kind==='comment') {
          if(action.stimulusText) {
            await addNpcReply({...post, content:action.stimulusText}, action.npcId, action.motivation);
          } else if(post.id.startsWith('osle-post-')) {
            const eventId=post.id.slice('osle-post-'.length);
            const event=worldRef.current.events.find(e=>e.id===eventId); if(!event)continue;
            const persona=SOCIAL_PERSONAS.find((p:any)=>p.id===action.npcId) as any;
            const author=SOCIAL_PERSONAS.find((p:any)=>p.id===event.npcId) as any;
            if(!persona||!author)continue;
            const text=chemistryComment(persona,event,author,hash(`${action.id}-chemistry`));
            const comment:SocialComment={id:`v21-${action.id}`,authorId:persona.id,authorName:persona.name,authorAvatar:persona.avatar,content:text,createdAt:new Date().toISOString()};
            setPosts(prev=>prev.map(p=>p.id===post.id&&!(p.comments||[]).some(c=>c.id===comment.id)?{...p,comments:[...(p.comments||[]),comment]}:p));
            updateRelationship(persona.id,author.id,{closeness:.006,playfulness: event.kind === 'banter' ? .012 : .004,respect: event.kind === 'milestone' ? .01 : .003},`đã phản ứng với post của ${author.name}`);
          }
        }
      }
    } finally { busy=false; } };
    void pump(); const id=setInterval(()=>{void pump();},8_000); return()=>clearInterval(id);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // V23.9 migrates both intent-only cards and the first circle implementation into
  // one Social Ritual model. Old comments stay intact; only missing event state is added.
  useEffect(() => {
    setPosts(prev => {
      let changed = false;
      const next = prev.map(post => {
        if (!post.communityIntent) return post;
        const now = Date.now();
        if (!post.communitySession) {
          const mode = post.communityIntent;
          const startedAt = new Date(post.createdAt).getTime() || now;
          const memberIds = chooseRitualMembers(mode, post.id, SOCIAL_PERSONAS.map((persona:any) => persona.id));
          const habitId = post.challenge?.habitId;
          const habitTitle = post.challenge?.title || (mode === 'companion' ? post.content : undefined);
          const delay = mode === 'confide' ? 12 * 60 * 60_000 : mode === 'companion' ? 6 * 60 * 60_000 : 24 * 60 * 60_000;
          changed = true;
          return {
            ...post,
            communitySession: {
              ...createSocialRitual({ postId: post.id, mode, content: post.content, habitId, habitTitle, memberIds, startedAt, checkInAt: startedAt + delay, userCompleted: !!habitId && todayCompletedIds.includes(habitId) }),
              careReading: inferCareReading(post.content, mode),
              replyState: 'ready' as const,
            },
            challenge: post.challenge ? { ...post.challenge, participants: memberIds.length + 1, participantIds: ['local-user', ...memberIds] } : undefined,
          };
        }
        const migrated = migrateSocialRitual(post, SOCIAL_PERSONAS.map((persona:any) => persona.id), now);
        if (!migrated || migrated === post.communitySession) return post;
        changed = true;
        return { ...post, communitySession: migrated };
      });
      return changed ? next : prev;
    });
  }, [completionSignature, setPosts]);

  const applyRitualConsequences = (post: SocialPost, events: SocialRitualEvent[]) => {
    const relationshipTarget = post.communitySession?.creatorId?.startsWith('hm-') ? post.communitySession.creatorId : 'local-user';
    events.forEach(ritualEvent => {
      if (!ritualEvent.actorId.startsWith('hm-')) return;
      if (ritualEvent.actorId === relationshipTarget) return;
      const isCare = ritualEvent.kind === 'message' || ritualEvent.kind === 'check_in' || ritualEvent.kind === 'support_action';
      const isSharedWork = ritualEvent.kind === 'completed' || ritualEvent.kind === 'resumed';
      const isBroken = ritualEvent.kind === 'failed';
      updateRelationship(ritualEvent.actorId, relationshipTarget, {
        closeness: isCare ? .018 : isSharedWork ? .025 : .004,
        trust: isCare ? .015 : isSharedWork ? .02 : isBroken ? -.008 : .003,
        respect: isSharedWork ? .025 : isBroken ? -.004 : .002,
        emotionalSafety: isCare ? .018 : .002,
        playfulness: post.communityIntent === 'challenge' && isSharedWork ? .012 : .002,
      }, `social ritual ${post.communityIntent || 'community'}: ${ritualEvent.kind}`);
      if (isCare || isSharedWork || isBroken) remember(ritualEvent.actorId, {
        type: isCare ? 'relationship' : 'episode',
        subject: post.communityIntent === 'confide' ? `đã ở cạnh ${post.authorName}` : post.communityIntent === 'companion' ? `đã cùng tiến với ${post.authorName}` : `kèo với ${post.authorName}`,
        content: `${ritualEvent.kind}: ${post.communitySession?.habitTitle || post.content}`.slice(0, 180),
        salience: isSharedWork ? .72 : isCare ? .66 : .58,
        emotionalWeight: isCare ? .64 : .5,
        confidence: .96,
        decayHalfLifeHours: 960,
        sourceId: ritualEvent.id,
      });
    });
  };

  const realizeScheduledRitualSpeech = async (post: SocialPost, action: SocialRitualScheduledAction) => {
    if (!post.communitySession || ritualActionsInFlightRef.current.has(action.id)) return;
    ritualActionsInFlightRef.current.add(action.id);
    try {
      const persona = SOCIAL_PERSONAS.find((item:any) => item.id === action.actorId);
      if (!persona) return;
      const npc = worldRef.current.npc[action.actorId] || createNpcState(persona);
      const transcript = (post.comments || []).slice(-6).map(comment => `${comment.authorName}: ${comment.content}`).join(' | ');
      const ritualPost = { ...post, content: post.content };
      const actionContext = `SOCIAL RITUAL V23.9. Hành vi đã được NPC Brain chọn: ${action.behavior}. Need=${post.communitySession.conversationNeed || 'UNKNOWN'}. Timeline gần đây: ${transcript || 'chưa ai nói'}. Giữ nguyên tính cách ngoài feed. Có quyền nói vụng/ngắn; không biến thành chuyên gia tâm lý. Chỉ hiện thực hóa hành vi thành đúng một lời nói tự nhiên.`;
      let text = await askAiReply(persona, ritualPost, npc, actionContext);
      if (!text || weakLegacySocialLine(text)) text = action.kind === 'check_in'
        ? followUpReplyV237(persona.id, post.content, action.id)
        : soulFallbackReply(persona.id, persona.name, post.content, npc.relationship, action.id);
      const createdAt = new Date().toISOString();
      const comment = circleComment(action.actorId, text, `ritual-speech-${action.id}`, createdAt);
      let consequenceEvent: SocialRitualEvent | undefined;
      setPosts(prev => prev.map(item => {
        if (item.id !== post.id || !item.communitySession || (item.comments || []).some(existing => existing.id === comment.id)) return item;
        const nextSession = completeRitualSpeech(item.communitySession, action, text, Date.now());
        consequenceEvent = nextSession.timeline?.find(timelineEvent => timelineEvent.id === action.id);
        return { ...item, comments: [...(item.comments || []), comment], communitySession: nextSession };
      }));
      if (consequenceEvent) applyRitualConsequences(post, [consequenceEvent]);
      recordNpcInteraction(persona.id, post.content, text, action.id);
    } finally {
      ritualActionsInFlightRef.current.delete(action.id);
    }
  };

  // Social rituals advance as event timelines. A participant may start, pause, fail,
  // decline or stay silent; only actual habit data can complete the user's side.
  useEffect(() => {
    const advanceSessions = () => {
      const now = Date.now();
      const speechQueue: Array<{ post: SocialPost; action: SocialRitualScheduledAction }> = [];
      const consequenceQueue: Array<{ post: SocialPost; events: SocialRitualEvent[] }> = [];
      setPosts(prev => {
        let anyChanged = false;
        const next = prev.map(post => {
          const session = post.communitySession;
          if (!session || session.ritualVersion !== 239 || session.status === 'completed') return post;
          let workingSession = session;
          let comments = [...(post.comments || [])];
          const userEvents: SocialRitualEvent[] = [];
          const habitDone = session.mode !== 'confide' && !!session.habitId && todayCompletedIds.includes(session.habitId);
          if (habitDone && !session.userCompleted) {
              const completedAt = new Date().toISOString();
              const userEvent: SocialRitualEvent = { id: `ritual-${post.id}-user-completed`, kind: 'completed', actorId: 'local-user', at: completedAt, visibility: 'timeline', progress: 100, memoryKey: `user-completed-${session.habitId}` };
              workingSession = { ...workingSession, userCompleted: true, timeline: [...(workingSession.timeline || []), userEvent] };
              userEvents.push(userEvent);
              const witnessId = session.participants?.find(participant => ['joined','active','completed'].includes(participant.status))?.npcId || session.memberIds[0];
              const commentId = `circle-user-done-${post.id}`;
              if (!comments.some(comment => comment.id === commentId)) {
                const line = session.mode === 'challenge'
                  ? `Bạn đã hoàn thành “${session.habitTitle}” bằng dữ liệu thói quen thật. Điểm này tính; tôi thấy rồi.`
                  : `Bạn đã làm xong “${session.habitTitle}”. Nhóm này có bằng chứng đầu tiên rồi.`;
                comments.push(circleComment(witnessId, line, commentId, new Date().toISOString()));
              }
          }
          const advanced = advanceSocialRitual(workingSession, now);
          const changed = userEvents.length > 0 || advanced.newEvents.length > 0;
          advanced.dueSpeechActions.forEach(action => speechQueue.push({ post: { ...post, comments, communitySession: advanced.session }, action }));
          if (advanced.newEvents.length) consequenceQueue.push({ post, events: advanced.newEvents });
          if (!changed) return post;
          anyChanged = true;
          return { ...post, comments, communitySession: advanced.session };
        });
        return anyChanged ? next : prev;
      });
      consequenceQueue.forEach(item => applyRitualConsequences(item.post, item.events));
      speechQueue.forEach(item => { void realizeScheduledRitualSpeech(item.post, item.action); });
    };
    advanceSessions();
    const id = setInterval(advanceSessions, 60_000);
    return () => clearInterval(id);
  }, [completionSignature, setPosts]);

  const addThoughtfulCircleReplies = async (post: SocialPost) => {
    const session = post.communitySession;
    if (!session || circleRepliesInFlightRef.current.has(post.id)) return;
    circleRepliesInFlightRef.current.add(post.id);
    try {
      const reading = session.careReading || inferCareReading(post.content, session.mode);
      const priorReplies: string[] = [];
      const speakerIds = initialRitualSpeakers(session);
      const needRule = session.mode === 'confide'
        ? `Need=${session.conversationNeed || inferRitualNeed(post.content)}. LISTEN_ONLY cấm lời khuyên; VENT ưu tiên hiện diện hoặc “kể tiếp đi”.`
        : '';
      const authorRule = session.creatorId?.startsWith('hm-')
        ? `Người mở ritual là NPC ${post.authorName}, không phải user. Hãy phản ứng với ${post.authorName} như một người bạn có đời sống riêng.`
        : 'Người mở ritual là user.';
      const roles = session.mode === 'confide'
        ? ['phản chiếu đúng một chi tiết và kiểm tra giả thuyết; có thể chỉ nói một câu vụng nhưng thật']
        : session.mode === 'companion'
          ? ['tự nhận một phần việc/thời lượng thật', 'nói rõ giới hạn thời gian hoặc lực cản của chính mình']
          : ['nhận kèo đúng cá tính và chốt cách tính', 'tạo áp lực cạnh tranh bằng giới hạn thật, không hô khẩu hiệu'];

      for (let index = 0; index < speakerIds.length; index++) {
        const memberId = speakerIds[index];
        const persona = SOCIAL_PERSONAS.find((item:any) => item.id === memberId);
        if (!persona) continue;
        const npc = worldRef.current.npc[memberId] || createNpcState(persona);
        const actionContext = `SOCIAL RITUAL V23.9, không phải chế độ tạo comment. ${authorRule} NPC Brain đã chọn hành vi nói. Vai trò lượt này: ${roles[index] || roles[0]}. ${needRule} Giữ nguyên careLanguage/conflictStyle ngoài feed. ${priorReplies.length ? `Người trước đã nói: ${priorReplies.join(' | ')}. Không lặp.` : 'Không cần nói cho đủ đội hình.'}`;
        let content = await askAiReply(persona, post, npc, actionContext);
        if (!content || weakLegacySocialLine(content) || priorReplies.some(reply => contentFingerprint(reply) === contentFingerprint(content))) {
          content = session.mode === 'confide'
            ? ritualCareFallback(memberId, post.content, session.conversationNeed) || groundedCareReply(memberId, reading, post.content)
            : circleOpeningLine(memberId, session.mode, post.content, session.habitTitle);
        }
        priorReplies.push(content);
        const createdAt = new Date().toISOString();
        const comment = circleComment(memberId, content, `circle-thoughtful-${post.id}-${memberId}`, createdAt);
        let eventForConsequence: SocialRitualEvent | undefined;
        setPosts(prev => prev.map(item => {
          if (item.id !== post.id || !item.communitySession || (item.comments || []).some(existing => existing.id === comment.id)) return item;
          const nextSession = recordRitualMessage(item.communitySession, memberId, content, Date.now(), `ritual-open-message-${post.id}-${memberId}`);
          eventForConsequence = nextSession.timeline?.find(timelineEvent => timelineEvent.id === `ritual-open-message-${post.id}-${memberId}`);
          return { ...item, comments: [...(item.comments || []), comment], communitySession: nextSession };
        }));
        if (eventForConsequence) applyRitualConsequences(post, [eventForConsequence]);
        recordNpcInteraction(memberId, post.content, content, `ritual-open-${post.id}`);
      }

      setPosts(prev => prev.map(item => item.id === post.id && item.communitySession
        ? { ...item, communitySession: { ...item.communitySession, careReading: reading, replyState: 'ready' } }
        : item));
    } finally {
      circleRepliesInFlightRef.current.delete(post.id);
    }
  };

  useEffect(() => {
    posts.filter(post => post.communitySession?.replyState === 'thinking' && !(post.comments || []).some(comment => comment.id.startsWith(`circle-thoughtful-${post.id}-`))).slice(0, 3).forEach(post => { void addThoughtfulCircleReplies(post); });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [posts.map(post => `${post.id}:${post.communitySession?.replyState || ''}`).join('|')]);

  const createPost = () => {
    const content = newPostContent.trim();
    if (!content) return;
    const isChallenge = postIntent === 'challenge';
    const now = Date.now();
    const createdAt = new Date(now).toISOString();
    const postId = `cw-post-${now}-${Math.random().toString(36).slice(2, 7)}`;
    const memberIds = chooseRitualMembers(postIntent, postId, SOCIAL_PERSONAS.map((persona:any) => persona.id));
    const habitTitle = postIntent === 'confide' ? '' : (selectedChallengeHabit?.title || content);
    const careReading = inferCareReading(content, postIntent);
    const checkInDelay = postIntent === 'confide' ? 12 * 60 * 60_000 : postIntent === 'companion' ? 6 * 60 * 60_000 : 24 * 60 * 60_000;
    const ritualSession = createSocialRitual({
      postId,
      mode: postIntent,
      content,
      habitId: postIntent === 'confide' ? undefined : selectedChallengeHabit?.id,
      habitTitle: habitTitle || undefined,
      memberIds,
      startedAt: now,
      checkInAt: now + checkInDelay,
      userCompleted: postIntent !== 'confide' && !!selectedChallengeHabit && todayCompletedIds.includes(selectedChallengeHabit.id),
    });
    const post: SocialPost = {
      id: postId,
      authorName: userName || 'Bạn',
      authorAvatar: userAvatar,
      content,
      type: 'habit',
      createdAt,
      likes: 0,
      comments: [],
      communityIntent: postIntent,
      communitySession: {
        ...ritualSession,
        careReading,
      },
      challenge: isChallenge ? {
        habitId: selectedChallengeHabit?.id,
        title: habitTitle || 'Một bước nhỏ trong 24 giờ tới',
        deadline: new Date(now + 24 * 60 * 60_000).toISOString(),
        participants: memberIds.length + 1,
        participantIds: ['local-user', ...memberIds],
      } : undefined,
    };
    setPosts(prev => [post, ...prev]);
    setExpanded(prev => ({ ...prev, [post.id]: true }));
    if (isChallenge) setJoinedChallenges(prev => ({ ...prev, [post.id]: true }));
    setNewPostContent('');
    onPostCreated(post);
    queueUserPostReactions(post, SOCIAL_PERSONAS, worldRef.current.npc);
    applyRitualConsequences(post, ritualSession.timeline || []);
    void addThoughtfulCircleReplies(post);
  };

  const toggleSupport = (postId: string) => {
    const wasSupported = !!supportedPosts[postId];
    const targetPost = postsRef.current.find(post => post.id === postId);
    const supportId = `ritual-support-${postId}-local-user`;
    setSupportedPosts(prev => ({ ...prev, [postId]: !wasSupported }));
    setPosts(prev => prev.map(post => post.id === postId
      ? {
          ...post,
          likes: Math.max(0, (post.likes || 0) + (wasSupported ? -1 : 1)),
          communitySession: !wasSupported && post.communitySession && !(post.communitySession.timeline || []).some(event => event.id === supportId)
            ? recordSupportAction(post.communitySession, 'local-user', Date.now(), supportId)
            : post.communitySession,
        }
      : post));
    if (!wasSupported && targetPost) {
      const author = SOCIAL_PERSONAS.find((persona:any) => persona.name === targetPost.authorName);
      if (author) {
        updateRelationship(author.id, 'local-user', { closeness: .014, trust: .012, affection: .018, emotionalSafety: .012 }, 'user chủ động gửi tín hiệu nâng đỡ');
        remember(author.id, { type: 'relationship', subject: 'user đã chăm sóc mình', content: `User gửi nâng đỡ vào lúc: ${targetPost.content}`.slice(0, 180), salience: .7, emotionalWeight: .66, confidence: .98, decayHalfLifeHours: 1200, sourceId: supportId });
      }
    }
  };

  const joinChallenge = (postId: string) => {
    if (joinedChallenges[postId]) return;
    setJoinedChallenges(prev => ({ ...prev, [postId]: true }));
    setPosts(prev => prev.map(post => post.id === postId && post.challenge
      ? {
          ...post,
          challenge: { ...post.challenge, participants: post.challenge.participants + 1, participantIds: [...new Set([...(post.challenge.participantIds || []), 'local-user'])] },
          communitySession: post.communitySession
            ? { ...post.communitySession, timeline: [...(post.communitySession.timeline || []), { id: `ritual-${post.id}-user-joined`, kind: 'joined', actorId: 'local-user', at: new Date().toISOString(), visibility: 'timeline' }] }
            : post.communitySession,
        }
      : post));
  };

  const replyInsideRitual = async (post: SocialPost, userText: string, sourceId: string) => {
    const session = post.communitySession;
    if (!session || session.status === 'completed' || ritualActionsInFlightRef.current.has(sourceId)) return;
    ritualActionsInFlightRef.current.add(sourceId);
    try {
      const lastNpcId = [...(post.comments || [])].reverse().find(comment => comment.authorId.startsWith('hm-'))?.authorId;
      const available = (session.participants || [])
        .filter(item => !['declined','failed','left'].includes(item.status))
        .map(item => item.npcId);
      const responderId = available.find(id => id !== lastNpcId) || available[0] || session.memberIds[0];
      const persona = SOCIAL_PERSONAS.find((item:any) => item.id === responderId);
      if (!persona) return;
      const npc = worldRef.current.npc[responderId] || createNpcState(persona);
      const nextNeed = inferRitualNeed(userText);
      const effectiveNeed = session.conversationNeed === 'LISTEN_ONLY' && nextNeed !== 'ASK_FOR_ADVICE'
        ? 'LISTEN_ONLY'
        : nextNeed === 'UNKNOWN' ? session.conversationNeed : nextNeed;
      const transcript = [...(post.comments || []), { authorName: userName || 'Bạn', content: userText } as SocialComment]
        .slice(-8).map(comment => `${comment.authorName}: ${comment.content}`).join(' | ');
      const replyPost: SocialPost = { ...post, content: userText, communitySession: { ...session, conversationNeed: effectiveNeed } };
      const actionContext = `SOCIAL RITUAL V23.9 đang tiếp diễn. User vừa trả lời, không được khởi động lại hội thoại. Need hiện tại=${effectiveNeed || 'UNKNOWN'}. Lịch sử: ${transcript}. Hãy quyết định như cùng một con người ngoài feed: có thể xác nhận mình hiểu thêm, hỏi đúng một câu, nói vụng, hoặc để khoảng trống. LISTEN_ONLY tuyệt đối không khuyên.`;
      let content = await askAiReply(persona, replyPost, npc, actionContext);
      if (!content || weakLegacySocialLine(content)) content = ritualCareFallback(responderId, userText, effectiveNeed)
        || soulFallbackReply(responderId, persona.name, userText, npc.relationship, sourceId);
      const createdAt = new Date().toISOString();
      const reply = circleComment(responderId, content, `ritual-reply-${sourceId}-${responderId}`, createdAt);
      let consequenceEvent: SocialRitualEvent | undefined;
      setPosts(prev => prev.map(item => {
        if (item.id !== post.id || !item.communitySession || (item.comments || []).some(comment => comment.id === reply.id)) return item;
        const eventId = `ritual-message-${sourceId}-${responderId}`;
        const nextSession = recordRitualMessage({ ...item.communitySession, conversationNeed: effectiveNeed }, responderId, content, Date.now(), eventId);
        consequenceEvent = nextSession.timeline?.find(event => event.id === eventId);
        return { ...item, comments: [...(item.comments || []), reply], communitySession: { ...nextSession, replyState: 'ready' } };
      }));
      if (consequenceEvent) applyRitualConsequences(post, [consequenceEvent]);
      recordNpcInteraction(responderId, userText, content, sourceId);
    } finally {
      ritualActionsInFlightRef.current.delete(sourceId);
    }
  };

  const addUserComment = (postId: string) => {
    const text = (commentInputs[postId] || '').trim();
    if (!text) return;
    const comment: SocialComment = {
      id: `cw-user-c-${Date.now()}`,
      authorId: 'local-user',
      authorName: userName || 'Bạn',
      authorAvatar: userAvatar,
      content: text,
      createdAt: new Date().toISOString(),
    };
    const targetPost = postsRef.current.find(post => post.id === postId);
    setPosts(prev => prev.map(p => p.id === postId ? {
      ...p,
      comments: [...(p.comments || []), comment],
      communitySession: p.communitySession
        ? { ...recordRitualMessage(p.communitySession, 'local-user', text, Date.now(), `ritual-user-message-${comment.id}`), replyState: p.communitySession.status === 'active' ? 'thinking' : p.communitySession.replyState }
        : p.communitySession,
    } : p));
    queueUserPostReactions({ id: comment.id, targetPostId: postId, content: text, createdAt: comment.createdAt }, SOCIAL_PERSONAS, worldRef.current.npc);
    setCommentInputs(prev => ({ ...prev, [postId]: '' }));
    if (targetPost?.communitySession?.status === 'active') void replyInsideRitual(targetPost, text, comment.id);
  };

  const activeNpcCount = (Object.values(world.npc) as NpcState[]).filter(n => n.mood !== 'tired').length;
  const featuredNpcs = SOCIAL_PERSONAS.map((p: any) => {
    const state=world.npc[p.id] || createNpcState(p);
    const presence=getNpcPresenceCard(p.id,state,Date.now()+presencePulse*0);
    const life=getNpcLifeCardV238(p.id,Number(state.relationship||0),Date.now()+presencePulse*0);
    const stateBoost=state.mood==='competitive'?.12:state.mood==='tired'?.03:.07;
    return { persona:p, state, presence, life, featureScore:Number(presence.signal||0)*.35+Number(life.storyHeat||0)*.65+stateBoost };
  }).sort((a:any,b:any)=>b.featureScore-a.featureScore).slice(0,4);
  const timelineEvents = world.events.filter(event => event.visibility !== 'silent').slice(0, 14);
  const recentMoments=[
    ...timelineEvents.slice(0,8).map(event=>({id:event.id,npcId:event.npcId,npcName:event.npcName,npcAvatar:event.npcAvatar,at:new Date(event.createdAt).getTime(),text:simpleHumanText(event.content),kind:'public'})),
    ...lifeStoryMoments.slice(0,12).map((moment:any)=>{const persona=SOCIAL_PERSONAS.find((p:any)=>p.id===moment.npcId);return{id:moment.id,npcId:moment.npcId,npcName:persona?.name||'Một người trong nhóm',npcAvatar:persona?.avatar||'',at:Number(moment.at||0),text:String(moment.text||''),kind:moment.kind,arcTitle:moment.arcTitle,hook:moment.hook};}),
    ...ambientMoments.slice(0,8).map((moment:any)=>{const persona=SOCIAL_PERSONAS.find((p:any)=>p.id===moment.npcId);return{id:moment.id,npcId:moment.npcId,npcName:persona?.name||'Một người trong nhóm',npcAvatar:persona?.avatar||'',at:Number(moment.at||0),text:String(moment.text||''),kind:moment.kind};}),
  ].sort((a,b)=>b.at-a.at).filter((item,index,array)=>array.findIndex(x=>x.id===item.id)===index).slice(0,5);
  const openLifeArcs=getOpenLifeArcsV238(3);
  const summary = world.offlineSummary;
  const completionRate = habits.length ? Math.round(todayCompletedIds.length / habits.length * 100) : 0;
  const dailySeed = completionRate >= 100
    ? 'Hôm nay bạn đã giữ trọn lời hứa với mình. Hãy để thành quả này trở thành bóng mát cho một người khác.'
    : completionRate > 0
      ? `Bạn đã đi được ${completionRate}% hôm nay. Một bước còn dang dở không phủ nhận những bước đã làm.`
      : 'Hạt giống không cần nở ngay hôm nay. Nó chỉ cần một lần được đặt xuống đất bằng hành động thật.';
  const composerPlaceholder = postIntent === 'confide'
    ? 'Có chuyện gì bạn đang giữ trong lòng? Cứ kể thật, không cần viết cho hay...'
    : postIntent === 'companion'
      ? 'Bạn muốn có người cùng làm điều gì trong hôm nay?'
      : `Mở kèo 24 giờ cho “${selectedChallengeHabit?.title || 'một bước nhỏ'}” — bạn muốn rủ mọi người thế nào?`;
  const intentLabel = (intent?: SocialPost['communityIntent']) => COMMUNITY_INTENTS.find(item => item.id === intent)?.label;

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-fuchsia-500/20 bg-gradient-to-br from-slate-900/90 via-slate-900/75 to-fuchsia-950/20 p-6 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:items-center gap-5 justify-between">
          <div>
            <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.24em] text-fuchsia-300 font-black"><Activity size={15} /> Cộng đồng ảo <span className="ml-1 rounded-md border border-fuchsia-400/25 bg-fuchsia-400/10 px-1.5 py-0.5 text-[8px] tracking-[.16em] text-fuchsia-200">V23.9 · SOCIAL RITUALS</span></div>
            <h3 className="text-2xl font-black text-white mt-2">Một nơi để được hiểu, rồi cùng nhau lớn lên</h3>
            <p className="text-sm text-slate-400 mt-2 max-w-3xl">Ở đây bạn có thể nói thật khi mệt, tìm một người cùng bước, hoặc mở một cuộc đua lành mạnh. Mỗi câu chuyện được lắng nghe, mỗi thử thách phải dẫn về một hành động thật.</p>
          </div>
          <div className="grid grid-cols-3 gap-2 min-w-[320px]">
            <div className="rounded-2xl bg-slate-950/50 border border-slate-800 px-3 py-3 text-center"><Users size={16} className="mx-auto text-cyan-400 mb-1" /><div className="text-xl font-black text-white">{activeNpcCount}</div><div className="text-[9px] uppercase text-slate-500 font-black">Đang hoạt động</div></div>
            <div className="rounded-2xl bg-slate-950/50 border border-slate-800 px-3 py-3 text-center"><Eye size={16} className="mx-auto text-amber-400 mb-1" /><div className="text-xl font-black text-white">{summary?.publishedPosts || 0}</div><div className="text-[9px] uppercase text-slate-500 font-black">Chuyện mới</div></div>
            <div className="rounded-2xl bg-slate-950/50 border border-slate-800 px-3 py-3 text-center"><Brain size={16} className="mx-auto text-fuchsia-400 mb-1" /><div className="text-xl font-black text-white">{SOCIAL_PERSONAS.length}</div><div className="text-[9px] uppercase text-slate-500 font-black">Nhân vật</div></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-7 rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-900/70 to-amber-500/5 p-5">
          <div className="flex gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center shrink-0"><Leaf size={19} className="text-emerald-300" /></div>
            <div><div className="text-[10px] uppercase tracking-[.2em] text-emerald-300 font-black">Hạt giống hôm nay</div><p className="mt-2 text-sm leading-relaxed text-slate-200">{dailySeed}</p><div className="mt-3 h-1.5 rounded-full bg-slate-950/70 overflow-hidden"><div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-amber-400 transition-all" style={{width:`${completionRate}%`}} /></div></div>
          </div>
        </div>
        <div className="lg:col-span-5 grid grid-cols-3 gap-2">
          <div className="rounded-2xl border border-rose-500/15 bg-rose-500/5 p-3"><HandHeart size={17} className="text-rose-300"/><div className="mt-2 text-xs font-black text-white">Được lắng nghe</div><div className="mt-1 text-[10px] text-slate-500">Không vội sửa bạn</div></div>
          <div className="rounded-2xl border border-cyan-500/15 bg-cyan-500/5 p-3"><Users size={17} className="text-cyan-300"/><div className="mt-2 text-xs font-black text-white">Có bạn cùng đi</div><div className="mt-1 text-[10px] text-slate-500">Bước nhỏ, làm thật</div></div>
          <div className="rounded-2xl border border-amber-500/15 bg-amber-500/5 p-3"><Swords size={17} className="text-amber-300"/><div className="mt-2 text-xs font-black text-white">Đua để cùng lớn</div><div className="mt-1 text-[10px] text-slate-500">Thắng mình hôm qua</div></div>
        </div>
      </div>

      {worldPulse.length > 0 && (
        <div className="rounded-3xl border border-sky-500/20 bg-sky-500/5 p-5">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[.2em] text-sky-300 font-black"><Eye size={14}/> Tin đủ đáng bàn mới lọt vào nhóm</div>
              <div className="text-xs text-slate-500 mt-1">Tin mới phải qua 3 cửa: đủ mới, đủ hệ quả/độ lạ và phải là tiếng Việt tự nhiên. Tin giải thích vụn, lịch tập, preview, mẹo vặt và headline rác bị loại.</div>
            </div>
            <div className="text-[9px] text-slate-600">nguồn ngoài · tiếng Việt · fact lock</div>
          </div>
          <div className="grid md:grid-cols-2 gap-2">
            {worldPulse.slice(0,3).map((topic:any)=>{
              const expert=expertForTopic(SOCIAL_PERSONAS,topic.category);
              return <div key={topic.id} className="rounded-2xl border border-slate-800 bg-slate-950/45 p-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-xs font-black text-white line-clamp-2">{topic.title}</div>
                    <div className="text-[9px] text-slate-500 mt-1">{worldCategoryVi(topic.category)} · {topic.sourceNames?.slice(0,2).join(', ')||'nguồn ngoài'}</div>
                  </div>
                  <div className="shrink-0 text-right"><div className="text-[9px] text-sky-300 font-black">{Math.round(Number(topic.storyValue||0)*100)}%</div><div className="text-[8px] text-slate-600">đáng bàn</div></div>
                </div>
                <div className="mt-2 text-[11px] text-slate-400 leading-relaxed line-clamp-3">{topic.whyItMatters||topic.summary}</div>
                <div className="mt-2 text-[10px] text-slate-500">Người dễ để ý nhất: <b className="text-slate-300">{expert?.name||'chưa rõ'}</b></div>
              </div>
            })}
          </div>
        </div>
      )}

      {summary && summary.durationMinutes >= 18 && (
        <div className="rounded-3xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.2em] text-cyan-300 font-black"><CalendarClock size={15} /> Trong lúc bạn vắng mặt</div>
              <div className="text-base font-black text-white mt-2">{summary.headline}</div>
              <div className="text-xs text-slate-500 mt-1">Có {summary.publishedPosts} bài mới, {summary.generatedComments} bình luận và {summary.relationshipChanges} thay đổi trong các mối quan hệ.</div>
            </div>
            <div className="text-[10px] text-slate-500 md:text-right">{new Date(summary.from).toLocaleString()}<br />→ {new Date(summary.to).toLocaleString()}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        <div className="xl:col-span-8 space-y-5">
          <div className="rounded-3xl bg-slate-900/70 border border-slate-800 p-4">
            <div className="flex gap-3">
              <img src={userAvatar} className="w-11 h-11 rounded-2xl bg-slate-800" />
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-3">
                  {COMMUNITY_INTENTS.map(intent => <button key={intent.id} onClick={() => setPostIntent(intent.id)} title={intent.hint} className={`rounded-full border px-3 py-1.5 text-[10px] font-black transition-all ${postIntent === intent.id ? intent.id === 'confide' ? 'border-rose-400/40 bg-rose-400/15 text-rose-200' : intent.id === 'companion' ? 'border-cyan-400/40 bg-cyan-400/15 text-cyan-200' : 'border-amber-400/40 bg-amber-400/15 text-amber-200' : 'border-slate-800 bg-slate-950/30 text-slate-500 hover:text-slate-300'}`}>{intent.label}</button>)}
                </div>
                {postIntent !== 'confide' && habits.length > 0 && <div className={`mb-3 rounded-2xl border p-3 ${postIntent === 'challenge' ? 'border-amber-500/15 bg-amber-500/5' : 'border-cyan-500/15 bg-cyan-500/5'}`}><div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-black ${postIntent === 'challenge' ? 'text-amber-300' : 'text-cyan-300'}`}><Target size={13}/> {postIntent === 'challenge' ? 'Chọn việc để cả nhóm cùng đua trong 24 giờ' : 'Chọn việc thật để nhóm cùng theo đến lúc xong'}</div><div className="mt-2 flex flex-wrap gap-2">{habits.slice(0,6).map(habit => <button key={habit.id} onClick={() => setChallengeHabitId(habit.id)} className={`rounded-xl border px-2.5 py-1.5 text-[10px] ${challengeHabitId === habit.id ? postIntent === 'challenge' ? 'border-amber-400/35 bg-amber-400/15 text-amber-100' : 'border-cyan-400/35 bg-cyan-400/15 text-cyan-100' : 'border-slate-800 text-slate-500'}`}>{habit.title}</button>)}</div><div className="mt-2 text-[9px] text-slate-600">Tiến độ chỉ đổi khi thói quen này được hoàn thành trong ứng dụng.</div></div>}
                <textarea value={newPostContent} onChange={e => setNewPostContent(e.target.value)} placeholder={composerPlaceholder} className="w-full min-h-[82px] resize-none bg-transparent outline-none text-sm text-slate-200 placeholder:text-slate-600" />
                <div className="flex items-center justify-between border-t border-slate-800 pt-3">
                  <span className="text-[10px] text-slate-500">{COMMUNITY_INTENTS.find(item => item.id === postIntent)?.hint}</span>
                  <button onClick={createPost} disabled={!newPostContent.trim()} className={`px-4 py-2 rounded-xl disabled:opacity-30 text-white text-xs font-black flex items-center gap-2 ${postIntent === 'challenge' ? 'bg-amber-500 text-slate-950' : postIntent === 'companion' ? 'bg-cyan-500 text-slate-950' : 'bg-rose-500'}`}>{postIntent === 'challenge' ? 'Mở kèo' : 'Chia sẻ'} <Send size={14} /></button>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-900/40 overflow-hidden">
            <div className="p-5 border-b border-slate-800"><div className="flex items-center justify-between gap-3"><div><h4 className="font-black text-white">Chuyện đáng kể</h4><p className="text-xs text-slate-500 mt-1">Chỉ hiện bước ngoặt, va chạm, phát hiện hoặc tin đủ đáng bàn. Việc vặt không được đưa lên đây.</p></div><span className="text-[9px] font-black tracking-[.16em] text-cyan-400 border border-cyan-500/20 bg-cyan-500/10 rounded-full px-2.5 py-1">V23.9 LIVING SOCIETY</span></div></div>
            <div className="divide-y divide-slate-800/60">{recentMoments.map((item:any)=>{const label=item.kind==='world'||item.kind==='world_story'?'THẾ GIỚI → ĐỜI SỐNG':item.kind==='relationship'||item.kind==='relationship_story'?'QUAN HỆ ĐANG TIẾP DIỄN':item.kind==='life_story'?(String(item.hook||'CHƯƠNG ĐỜI').toLocaleUpperCase('vi-VN')):item.kind==='small_fail'?'VƯỚNG THẬT':item.kind==='small_win'?'BƯỚC TIẾN':item.kind==='public'?'BÀI ĐĂNG':'ĐỜI SỐNG';return <div key={item.id} className="p-4 flex gap-3"><img src={item.npcAvatar} className="w-10 h-10 rounded-xl bg-slate-800"/><div className="min-w-0 flex-1"><div className="flex items-center gap-2 flex-wrap"><span className="text-xs font-black text-white">{item.npcName}</span><span className="text-[9px] text-slate-600">{new Date(item.at).toLocaleString('vi-VN')}</span><span className="text-[8px] uppercase tracking-wider text-cyan-400/80 border border-cyan-500/15 rounded-full px-1.5 py-0.5">{label}</span></div>{item.arcTitle&&<div className="mt-1 text-[10px] font-black text-fuchsia-300/80">↳ {item.arcTitle}</div>}<p className="text-sm text-slate-300 mt-1.5 leading-relaxed whitespace-pre-line">{item.text}</p></div></div>})}{!recentMoments.length&&<div className="p-8 text-center text-sm text-slate-500">Chưa có chuyện nào đủ đáng kể. Nhóm vẫn sống phía sau, nhưng app không biến mọi việc vặt thành “tin”.</div>}</div>
          </div>

          <div className="space-y-4">
            {posts.slice(0, 20).map(post => (
              <div key={post.id} className="rounded-3xl bg-slate-900/55 border border-slate-800 overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-3"><img src={post.authorAvatar} className="w-10 h-10 rounded-xl bg-slate-800" /><div className="flex-1"><div className="flex items-center gap-2 flex-wrap"><div className="text-sm font-black text-white">{post.authorName}</div>{post.communityIntent && <span className={`text-[8px] uppercase tracking-wider rounded-full border px-1.5 py-0.5 ${post.communityIntent === 'confide' ? 'border-rose-500/20 text-rose-300' : post.communityIntent === 'companion' ? 'border-cyan-500/20 text-cyan-300' : 'border-amber-500/20 text-amber-300'}`}>{intentLabel(post.communityIntent)}</span>}</div><div className="text-[9px] uppercase tracking-widest text-slate-600">{new Date(post.createdAt).toLocaleString()}</div></div></div>
                  <p className="text-sm text-slate-300 leading-relaxed mt-3 whitespace-pre-line">{post.content}</p>
                  {post.communitySession && (() => {
                    const session = post.communitySession;
                    const participants = session.participants || session.memberIds.map(npcId => ({ npcId, status: 'joined' as const, progress: session.npcCompletedIds.includes(npcId) ? 100 : 0 }));
                    const members = participants.map(participant => ({ participant, persona: SOCIAL_PERSONAS.find((persona:any) => persona.id === participant.npcId) })).filter(item => item.persona);
                    const activeParticipants = participants.filter(participant => !['declined','left'].includes(participant.status));
                    const completed = (session.userCompleted ? 1 : 0) + activeParticipants.filter(participant => participant.status === 'completed').length;
                    const total = Math.max(1, activeParticipants.length + 1);
                    const progress = session.mode === 'confide' ? 0 : Math.round(((session.userCompleted ? 100 : 0) + activeParticipants.reduce((sum, participant) => sum + Number(participant.progress || 0), 0)) / total);
                    const tone = session.mode === 'confide' ? 'rose' : session.mode === 'companion' ? 'cyan' : 'amber';
                    const needLabel: Record<string,string> = { LISTEN_ONLY:'Chỉ lắng nghe', VENT:'Cho phép xả', ASK_FOR_ADVICE:'Đang xin lời khuyên', NEED_REASSURANCE:'Cần được trấn an', NEED_DISTRACTION:'Cần đổi không khí', NEED_HELP:'Cần giúp thật', UNKNOWN:'Chưa vội kết luận' };
                    const timeline = (session.timeline || []).filter(event => event.visibility === 'timeline' && event.kind !== 'ritual_created').slice(-6);
                    return <div className={`mt-3 rounded-2xl border p-3 ${tone==='rose'?'border-rose-500/20 bg-rose-500/5':tone==='cyan'?'border-cyan-500/20 bg-cyan-500/5':'border-amber-500/20 bg-amber-500/5'}`}>
                      <div className="flex items-start justify-between gap-3"><div><div className={`flex items-center gap-2 text-[10px] uppercase tracking-wider font-black ${tone==='rose'?'text-rose-300':tone==='cyan'?'text-cyan-300':'text-amber-300'}`}>{session.mode==='confide'?<HandHeart size={14}/>:session.mode==='companion'?<Users size={14}/>:<Swords size={14}/>} {session.mode==='confide'?'Vòng lắng nghe':session.mode==='companion'?'Nhóm cùng tiến':'Kèo 24 giờ'}</div>{session.habitTitle&&<div className="mt-1.5 text-sm font-black text-white">{session.habitTitle}</div>}</div><span className={`text-[8px] uppercase tracking-wider rounded-full border px-2 py-1 ${session.status==='completed'?'border-emerald-500/20 text-emerald-300':'border-slate-700 text-slate-500'}`}>{session.status==='completed'?'Đã khép lại':'Đang diễn ra'}</span></div>
                      {session.mode === 'confide' && <div className="mt-2 inline-flex rounded-full border border-rose-500/15 bg-rose-500/5 px-2 py-1 text-[9px] text-rose-200/70">{needLabel[session.conversationNeed || 'UNKNOWN']}</div>}
                      <div className="mt-3 flex flex-wrap gap-2">{members.map(({participant,persona}:any)=><div key={persona.id} className={`flex items-center gap-1.5 rounded-full border px-2 py-1 ${participant.status==='declined'?'border-slate-800 text-slate-600 opacity-65':participant.status==='seen'||participant.status==='tentative'||participant.status==='invited'?'border-slate-700 text-slate-500':'border-slate-700/80 text-slate-300'}`}><img src={persona.avatar} title={persona.name} className="h-5 w-5 rounded-full bg-slate-800"/><span className="text-[9px]">{persona.name}</span><span className="text-[8px] uppercase text-slate-600">{participant.status==='seen'?'đã xem':participant.status==='tentative'?'chưa chắc':participant.status==='invited'?'được mời':participant.status==='declined'?'từ chối':participant.status==='active'?'đang làm':participant.status==='completed'?'xong':participant.status==='failed'?'trượt':'đã vào'}</span></div>)}</div>
                      {session.mode==='confide'?<div className="mt-3 flex items-center gap-1.5 text-[10px] text-slate-500"><Timer size={12}/> Sẽ quay lại hỏi thăm lúc {new Date(session.checkInAt).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</div>:<div className="mt-3"><div className="flex items-center justify-between text-[10px]"><span className="text-slate-500">Tiến độ từ hành động thật</span><span className="font-black text-slate-200">{completed}/{total} hoàn thành · {progress}%</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-slate-950"><div className={`h-full rounded-full ${tone==='cyan'?'bg-cyan-400':'bg-amber-400'}`} style={{width:`${Math.max(0,Math.min(100,progress))}%`}}/></div>{post.challenge&&<div className="mt-2 text-[9px] text-slate-600">Kết thúc {new Date(post.challenge.deadline).toLocaleString('vi-VN')}</div>}</div>}
                      {timeline.length > 0 && <div className="mt-3 space-y-1.5 border-t border-slate-800/70 pt-3">{timeline.map(event => { const actorName=event.actorId==='local-user'?(userName||'Bạn'):event.actorId==='system'?'Hệ thống':SOCIAL_PERSONAS.find((persona:any)=>persona.id===event.actorId)?.name||'Một người'; const label=ritualEventLabel(event.kind,actorName,event.progress); return label?<div key={event.id} className="flex items-start gap-2 text-[9px] text-slate-500"><Clock3 size={11} className="mt-0.5 shrink-0 text-slate-700"/><span className="w-10 shrink-0 text-slate-700">{new Date(event.at).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}</span><span>{label}</span></div>:null;})}</div>}
                    </div>;
                  })()}
                  <div className="flex flex-wrap items-center gap-5 mt-4 pt-3 border-t border-slate-800/70"><button onClick={() => toggleSupport(post.id)} className={`text-xs flex items-center gap-1.5 ${supportedPosts[post.id] ? 'text-rose-400 font-black' : 'text-slate-500 hover:text-rose-400'}`}><Heart size={15} className={supportedPosts[post.id] ? 'fill-rose-400' : ''} /> {post.communityIntent === 'confide' ? 'Nâng đỡ' : 'Tiếp sức'} · {post.likes}</button>{post.challenge && <button onClick={() => joinChallenge(post.id)} disabled={joinedChallenges[post.id]} className={`text-xs flex items-center gap-1.5 ${joinedChallenges[post.id] ? 'text-emerald-400' : 'text-amber-400 hover:text-amber-300'}`}><Swords size={15}/>{joinedChallenges[post.id] ? 'Đã nhận kèo' : 'Nhận kèo'}</button>}<button onClick={() => setExpanded(prev => ({ ...prev, [post.id]: !prev[post.id] }))} className="text-xs text-slate-500 hover:text-fuchsia-400 flex items-center gap-1.5"><MessageCircle size={15} /> Trò chuyện · {(post.comments || []).length}</button></div>
                </div>
                {(expanded[post.id] || (post.comments || []).length > 0) && (
                  <div className="border-t border-slate-800 bg-slate-950/25 p-4 space-y-3">
                    {post.communitySession?.replyState === 'thinking' && <div className="flex items-center gap-2 rounded-2xl border border-fuchsia-500/10 bg-fuchsia-500/5 px-3 py-2 text-[10px] text-fuchsia-200/70"><Brain size={13} className="animate-pulse"/> Mọi người đang đọc kỹ điều bạn nói, không trả lời vội...</div>}
                    {(post.comments || []).slice(-8).map(comment => <div key={comment.id} className="flex gap-2"><img src={comment.authorAvatar} className="w-8 h-8 rounded-lg bg-slate-800" /><div className="rounded-2xl rounded-tl-none bg-slate-800/55 px-3 py-2 flex-1"><div className="text-[10px] font-black text-amber-400">{comment.authorName}</div><div className="text-xs text-slate-300 mt-0.5">{comment.content}</div><div className="text-[8px] text-slate-600 mt-1">{new Date(comment.createdAt).toLocaleString()}</div></div></div>)}
                    <div className="flex gap-2"><input value={commentInputs[post.id] || ''} onChange={e => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))} onKeyDown={e => e.key === 'Enter' && addUserComment(post.id)} placeholder="Bình luận..." className="flex-1 rounded-xl bg-slate-900 border border-slate-800 px-3 py-2 text-xs text-white outline-none" /><button onClick={() => addUserComment(post.id)} className="w-10 rounded-xl bg-slate-800 text-slate-300 flex items-center justify-center"><Send size={14} /></button></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="xl:col-span-4 space-y-5">
          <div className="rounded-3xl bg-slate-900/60 border border-slate-800 p-5">
            <div className="flex items-center gap-2 mb-4"><Users size={17} className="text-cyan-400"/><h4 className="text-sm font-black text-white">Mọi người hôm nay</h4><span className="ml-auto text-[9px] text-slate-600">4 người đang có chuyện nhất</span></div>
            <div className="space-y-3">{featuredNpcs.map(({persona,presence,life}:any)=><div key={persona.id} className="rounded-2xl bg-slate-950/45 border border-slate-800 p-3"><div className="flex items-center gap-3"><img src={persona.avatar} className="w-9 h-9 rounded-xl bg-slate-800"/><div className="min-w-0 flex-1"><div className="text-xs font-black text-white truncate">{persona.name}</div><div className="text-[10px] text-slate-500">{presence.lastSeenText} · <span className="text-fuchsia-300/80">{life.chapterLine||presence.mood||presence.presence}</span></div></div></div><div className="mt-2 text-xs font-black text-slate-100">{life.arcTitle||presence.project}</div><div className="mt-1.5 text-[11px] leading-relaxed text-slate-400">{life.recentBeat||presence.detail}</div><div className="mt-2 grid gap-1.5 text-[10.5px]"><div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-2.5 py-2 text-amber-100/80"><span className="text-amber-400 font-black">Ước mơ:</span> {life.dream}</div><div className="rounded-xl bg-cyan-500/5 border border-cyan-500/10 px-2.5 py-2 text-cyan-100/80"><span className="text-cyan-400 font-black">Đang cố:</span> {life.goal}</div></div>{life.openLoop&&<div className="mt-2 rounded-xl border-l-2 border-fuchsia-400/50 bg-fuchsia-500/5 px-2.5 py-2 text-[10.5px] italic leading-relaxed text-fuchsia-100/80">{life.openLoop}</div>}{life.dreamMeaning&&<div className="mt-2 text-[10px] leading-relaxed text-slate-500">Có vẻ chuyện này với {persona.name} còn riêng tư hơn những gì họ nói ra.</div>}</div>)}</div>
          </div>
          <div className="rounded-3xl bg-slate-900/55 border border-fuchsia-500/15 p-5"><div className="flex items-center gap-2"><Sparkles size={16} className="text-fuchsia-400"/><div className="text-sm font-black text-white">Những câu chuyện đang chạy</div></div><div className="mt-3 space-y-3">{openLifeArcs.map((arc:any)=><div key={arc.id} className="rounded-2xl bg-slate-950/45 border border-slate-800 p-3"><div className="flex items-center gap-2"><span className="text-[8px] uppercase tracking-wider rounded-full border border-fuchsia-500/15 px-1.5 py-0.5 text-fuchsia-300/80">{arc.type==='personal'?'ĐỜI RIÊNG':arc.type==='relationship'?'QUAN HỆ':'THẾ GIỚI'}</span><span className="text-[9px] text-slate-600">{arc.currentPhase}</span></div><div className="mt-1.5 text-xs font-black text-slate-200">{arc.title}</div>{arc.lastBeat&&<div className="mt-1.5 text-[10.5px] text-slate-400 leading-relaxed">{arc.lastBeat}</div>}<div className="mt-2 text-[10px] italic text-fuchsia-200/60">{arc.openLoop}</div></div>)}</div></div>
          <div className="rounded-3xl bg-gradient-to-br from-amber-500/10 to-slate-900 border border-amber-500/20 p-5"><div className="text-[10px] uppercase tracking-[.18em] text-amber-400 font-black">Việc còn lại hôm nay</div><div className="text-sm font-black text-white mt-2">{incompleteHabits[0]?.title || 'Xong rồi. Nghỉ mà không thấy có lỗi cũng được.'}</div><p className="text-xs text-slate-500 mt-2">Cộng đồng có thể nhắc hoặc cà khịa, nhưng đây mới là phần hành động thật.</p></div>
          {rivalry?.active && <div className="rounded-3xl bg-rose-500/10 border border-rose-500/20 p-5"><div className="text-[10px] uppercase tracking-widest text-rose-300 font-black">Kèo đang được cả nhóm để ý</div><div className="text-sm font-black text-white mt-2">Bạn vs {rivalry.legendName}</div><div className="text-xs text-slate-400 mt-1">Mọi người có thể trêu chuyện này, nhưng điểm chỉ đổi khi bạn thật sự làm thói quen.</div></div>}
        </div>
      </div>
    </div>
  );
};

export { CommunityWorld };
