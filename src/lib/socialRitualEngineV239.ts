import { personaDecisionBias } from './characterConstitutionV236';
import type {
  SocialPost,
  SocialRitualEvent,
  SocialRitualEventKind,
  SocialRitualNeed,
  SocialRitualParticipant,
  SocialRitualRelationshipHistory,
  SocialRitualScheduledAction,
} from '../types';

export type RitualMode = 'confide' | 'companion' | 'challenge';
export type RitualSession = NonNullable<SocialPost['communitySession']>;

const hash = (value: string) => {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
};

const unit = (seed: string) => hash(seed) / 4294967295;
const iso = (at: number) => new Date(at).toISOString();
const emptyHistory = (): SocialRitualRelationshipHistory => ({ ritualsTogether: 0, completedTogether: 0, npcPulledUserBack: 0, userPulledNpcBack: 0, brokenPromises: 0, careGiven: 0, careReceived: 0, insideJokes: [] });

export const inferRitualNeed = (raw: string): SocialRitualNeed => {
  const text = String(raw || '').toLocaleLowerCase('vi-VN');
  if (/chỉ (?:muốn|cần).*(?:nghe|lắng nghe)|(?:không|chưa) (?:cần|muốn).*(?:khuyên|lời khuyên|giải pháp)|đừng khuyên|ngồi nghe thôi/.test(text)) return 'LISTEN_ONLY';
  if (/cho (?:tôi|mình).*(?:xả|than)|để.*xả|ức chế|bực|tức|cay|khó chịu/.test(text)) return 'VENT';
  if (/nên làm gì|phải làm sao|cho.*lời khuyên|xin.*ý kiến|cách nào|giúp.*gỡ/.test(text)) return 'ASK_FOR_ADVICE';
  if (/có ổn không|liệu.*được không|sợ.*không|cần.*yên tâm|hoang mang|bất an/.test(text)) return 'NEED_REASSURANCE';
  if (/nói chuyện khác|đánh lạc hướng|làm.*quên|đổi không khí|kể.*vui/.test(text)) return 'NEED_DISTRACTION';
  if (/cứu|giúp tôi|giúp mình|không tự làm được|cần người.*giúp|khẩn cấp/.test(text)) return 'NEED_HELP';
  return 'UNKNOWN';
};

const situationFor = (mode: RitualMode) => mode === 'confide' ? 'serious' : mode === 'challenge' ? 'challenge' : 'social_call';

export const chooseRitualMembers = (mode: RitualMode, seed: string, personaIds: string[]) => {
  const ranked = personaIds.map(npcId => {
    const bias = personaDecisionBias(npcId, situationFor(mode));
    const availability = unit(`${seed}|${npcId}|availability`);
    const score = bias.notice * .76 + availability * .18 + (1 - bias.publicity) * (mode === 'confide' ? .12 : .02);
    return { npcId, score, availability };
  }).sort((a, b) => b.score - a.score);
  return ranked.slice(0, mode === 'confide' ? 4 : 3).map(item => item.npcId);
};

const event = (id: string, kind: SocialRitualEventKind, actorId: string, at: number, text?: string, progress?: number): SocialRitualEvent => ({
  id,
  kind,
  actorId,
  at: iso(at),
  text,
  progress,
  visibility: kind === 'message' || kind === 'check_in' ? 'conversation' : 'timeline',
});

const scheduled = (id: string, actorId: string, kind: SocialRitualEventKind, dueAt: number, behavior: string, progress?: number): SocialRitualScheduledAction => ({
  id,
  actorId,
  kind,
  dueAt: iso(dueAt),
  behavior,
  progress,
  state: 'pending',
});

const participant = (npcId: string, status: SocialRitualParticipant['status'], at: number, reason = ''): SocialRitualParticipant => ({
  npcId,
  status,
  joinedAt: status === 'joined' ? iso(at) : undefined,
  progress: 0,
  lastActionAt: iso(at),
  reason,
});

export const createSocialRitual = (args: {
  postId: string;
  mode: RitualMode;
  content: string;
  creatorId?: string;
  habitId?: string;
  habitTitle?: string;
  memberIds: string[];
  startedAt: number;
  checkInAt: number;
  userCompleted?: boolean;
}): RitualSession => {
  const { postId, mode, content, creatorId = 'local-user', habitId, habitTitle, memberIds, startedAt, checkInAt } = args;
  const need = mode === 'confide' ? inferRitualNeed(content) : 'UNKNOWN';
  const participants: SocialRitualParticipant[] = [];
  const relationshipHistory: Record<string, SocialRitualRelationshipHistory> = {};
  const timeline: SocialRitualEvent[] = [event(`ritual-${postId}-created`, 'ritual_created', creatorId, startedAt)];
  const scheduledActions: SocialRitualScheduledAction[] = [];

  memberIds.forEach((npcId, index) => {
    relationshipHistory[npcId] = { ...emptyHistory(), ritualsTogether: 1 };
    if (mode === 'confide') {
      const status: SocialRitualParticipant['status'] = index === 0 ? 'joined' : index === 1 ? 'seen' : 'invited';
      participants.push(participant(npcId, status, startedAt + index * 900));
      if (index === 0) timeline.push(event(`ritual-${postId}-${npcId}-joined`, 'joined', npcId, startedAt + 900));
      if (index === 1) timeline.push(event(`ritual-${postId}-${npcId}-seen`, 'seen', npcId, startedAt + 1500));
      if (index === 1) scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-late-message`, npcId, 'message', startedAt + 17 * 60_000, 'đã đọc từ trước, chỉ nói khi hiểu thêm; phản hồi ngắn và không biến thành tư vấn'));
      if (index === 2) scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-checkin`, npcId, 'check_in', checkInAt, 'quay lại hỏi thăm bằng một chi tiết đã nhớ; không hỏi chung chung'));
    } else if (mode === 'companion') {
      const status: SocialRitualParticipant['status'] = index < 2 ? 'joined' : 'tentative';
      participants.push(participant(npcId, status, startedAt + index * 1100, status === 'tentative' ? 'còn việc riêng, chưa hứa chắc' : ''));
      timeline.push(event(`ritual-${postId}-${npcId}-${status}`, status, npcId, startedAt + index * 1100));
      if (index < 2) {
        const startDelay = (index === 0 ? 4 : 22) * 60_000;
        const finishDelay = (index === 0 ? 112 : 94) * 60_000;
        scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-start`, npcId, 'started', startedAt + startDelay, 'bắt đầu phần việc đã nhận'));
        scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-progress`, npcId, 'progress', startedAt + Math.round((startDelay + finishDelay) / 2), 'đang làm thật, có thể bị gián đoạn hoặc gọi người lập nhóm vào bàn', index === 0 ? 45 : 60));
        scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-done`, npcId, 'completed', startedAt + finishDelay, 'hoàn thành phần đã nhận và để lại dấu vết cho nhóm', 100));
      } else {
        const willDecline = unit(`${postId}|${npcId}|tentative`) < .55;
        scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-decision`, npcId, willDecline ? 'declined' : 'joined', startedAt + 34 * 60_000, willDecline ? 'không thu xếp được việc riêng nên từ chối, không viện cớ đẹp' : 'thu xếp xong việc riêng và vào nhóm muộn'));
      }
    } else {
      const status: SocialRitualParticipant['status'] = index < 2 ? 'joined' : 'declined';
      const reason = status === 'declined' ? 'biết hôm nay không giữ được kèo' : '';
      participants.push(participant(npcId, status, startedAt + index * 1000, reason));
      timeline.push(event(`ritual-${postId}-${npcId}-${status}`, status, npcId, startedAt + index * 1000));
      if (index < 2) {
        const startDelay = (index === 0 ? 18 : 42) * 60_000;
        const progress = index === 0 ? 76 : 54;
        scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-start`, npcId, 'started', startedAt + startDelay, 'bắt đầu kèo, bảng điểm có dữ liệu đầu tiên'));
        scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-progress`, npcId, 'progress', startedAt + (index === 0 ? 8 : 11) * 60 * 60_000, 'cập nhật giữa kèo bằng con số, không hô động lực', progress));
        const succeeds = unit(`${postId}|${npcId}|challenge-outcome`) > (index === 0 ? .24 : .42);
        scheduledActions.push(scheduled(`ritual-${postId}-${npcId}-outcome`, npcId, succeeds ? 'completed' : 'failed', startedAt + (index === 0 ? 19 : 22) * 60 * 60_000, succeeds ? 'hoàn thành kèo, kết quả được ghi vào lịch sử' : 'không hoàn thành kèo và phải sống với lời đã gáy', succeeds ? 100 : progress));
      }
    }
  });

  return {
    mode,
    creatorId,
    memberIds,
    startedAt: iso(startedAt),
    checkInAt: iso(checkInAt),
    habitId,
    habitTitle,
    npcCompletedIds: [],
    userCompleted: !!args.userCompleted,
    ritualVersion: 239,
    conversationNeed: need,
    participants,
    timeline,
    scheduledActions,
    relationshipHistory,
    appliedEventIds: [],
    replyState: 'thinking',
    status: 'active',
  };
};

export const initialRitualSpeakers = (session: RitualSession) => {
  const participants = (session.participants || []).filter(item => item.npcId !== session.creatorId);
  if (session.mode === 'confide') return participants.filter(item => item.status === 'joined').slice(0, 1).map(item => item.npcId);
  return participants.filter(item => item.status === 'joined').slice(0, 2).map(item => item.npcId);
};

const statusForEvent = (kind: SocialRitualEventKind): SocialRitualParticipant['status'] | undefined => {
  if (kind === 'joined') return 'joined';
  if (kind === 'tentative') return 'tentative';
  if (kind === 'declined') return 'declined';
  if (kind === 'seen') return 'seen';
  if (kind === 'started' || kind === 'progress' || kind === 'resumed') return 'active';
  if (kind === 'paused') return 'paused';
  if (kind === 'completed') return 'completed';
  if (kind === 'failed') return 'failed';
  return undefined;
};

const applyParticipantEvent = (participants: SocialRitualParticipant[], action: SocialRitualScheduledAction, at: number) => participants.map(item => {
  if (item.npcId !== action.actorId) return item;
  const status = statusForEvent(action.kind) || item.status;
  return {
    ...item,
    status,
    joinedAt: status === 'joined' && !item.joinedAt ? iso(at) : item.joinedAt,
    progress: typeof action.progress === 'number' ? action.progress : item.progress,
    lastActionAt: iso(at),
    reason: action.kind === 'declined' ? action.behavior : item.reason,
  };
});

export const advanceSocialRitual = (session: RitualSession, now: number) => {
  let participants = [...(session.participants || [])];
  let timeline = [...(session.timeline || [])];
  let scheduledActions = [...(session.scheduledActions || [])];
  let relationshipHistory = { ...(session.relationshipHistory || {}) };
  const dueSpeechActions: SocialRitualScheduledAction[] = [];
  const newEvents: SocialRitualEvent[] = [];

  scheduledActions = scheduledActions.map(action => {
    if (action.state !== 'pending' || new Date(action.dueAt).getTime() > now) return action;
    if (action.kind === 'message' || action.kind === 'check_in') {
      dueSpeechActions.push(action);
      return action;
    }
    const nextEvent = event(action.id, action.kind, action.actorId, new Date(action.dueAt).getTime(), undefined, action.progress);
    timeline.push(nextEvent);
    newEvents.push(nextEvent);
    participants = applyParticipantEvent(participants, action, new Date(action.dueAt).getTime());
    const history = { ...(relationshipHistory[action.actorId] || emptyHistory()) };
    if (action.kind === 'completed' && session.userCompleted) history.completedTogether += 1;
    if (action.kind === 'failed') history.brokenPromises += 1;
    if (action.kind === 'resumed') history.npcPulledUserBack += 1;
    relationshipHistory[action.actorId] = history;
    return { ...action, state: 'done' };
  });

  const npcCompletedIds = participants.filter(item => item.status === 'completed').map(item => item.npcId);
  let status = session.status;
  if (session.mode === 'companion' && session.userCompleted && npcCompletedIds.length > 0) status = 'completed';
  if (session.mode === 'challenge' && now >= new Date(session.checkInAt).getTime()) status = 'completed';
  if (status === 'completed' && !timeline.some(item => item.kind === 'ritual_closed')) {
    const closed = event(`ritual-${session.startedAt}-closed`, 'ritual_closed', 'system', now);
    timeline.push(closed);
    newEvents.push(closed);
  }

  return {
    session: { ...session, participants, timeline, scheduledActions, relationshipHistory, npcCompletedIds, status },
    dueSpeechActions,
    newEvents,
  };
};

export const completeRitualSpeech = (session: RitualSession, action: SocialRitualScheduledAction, text: string, now: number) => {
  const nextEvent = event(action.id, action.kind, action.actorId, now, text);
  const scheduledActions = (session.scheduledActions || []).map(item => item.id === action.id ? { ...item, state: 'done' as const } : item);
  const participants = (session.participants || []).map(item => item.npcId === action.actorId ? { ...item, lastActionAt: iso(now) } : item);
  const relationshipHistory = { ...(session.relationshipHistory || {}) };
  const history = { ...(relationshipHistory[action.actorId] || emptyHistory()) };
  history.careGiven += 1;
  if (action.kind === 'check_in') history.npcPulledUserBack += 1;
  relationshipHistory[action.actorId] = history;
  return {
    ...session,
    scheduledActions,
    participants,
    relationshipHistory,
    timeline: [...(session.timeline || []), nextEvent],
    checkInSent: action.kind === 'check_in' ? true : session.checkInSent,
    status: action.kind === 'check_in' && session.mode === 'confide' ? 'completed' as const : session.status,
  };
};

export const recordRitualMessage = (session: RitualSession, actorId: string, text: string, at: number, id: string) => {
  const relationshipHistory = { ...(session.relationshipHistory || {}) };
  if (actorId.startsWith('hm-')) {
    const history = { ...(relationshipHistory[actorId] || emptyHistory()) };
    history.careGiven += session.mode === 'confide' ? 1 : 0;
    relationshipHistory[actorId] = history;
  } else if (session.creatorId?.startsWith('hm-')) {
    const history = { ...(relationshipHistory[session.creatorId] || emptyHistory()) };
    history.careReceived += 1;
    relationshipHistory[session.creatorId] = history;
  }
  return { ...session, relationshipHistory, timeline: [...(session.timeline || []), event(id, 'message', actorId, at, text)] };
};

export const recordSupportAction = (session: RitualSession, actorId: string, at: number, id: string) => {
  const relationshipHistory = { ...(session.relationshipHistory || {}) };
  if (actorId === 'local-user' && session.creatorId?.startsWith('hm-')) {
    const history = { ...(relationshipHistory[session.creatorId] || emptyHistory()) };
    history.careReceived += 1;
    history.userPulledNpcBack += 1;
    relationshipHistory[session.creatorId] = history;
  }
  return { ...session, relationshipHistory, timeline: [...(session.timeline || []), event(id, 'support_action', actorId, at)] };
};

export const migrateSocialRitual = (post: SocialPost, allPersonaIds: string[], now: number): RitualSession | undefined => {
  const old = post.communitySession;
  if (!old) return undefined;
  if (old.ritualVersion === 239 && old.participants && old.timeline && old.scheduledActions) return old;
  const startedAt = new Date(old.startedAt || post.createdAt).getTime() || now;
  const memberIds = old.memberIds?.length ? old.memberIds : chooseRitualMembers(old.mode, post.id, allPersonaIds);
  const migrated = createSocialRitual({
    postId: post.id,
    mode: old.mode,
    content: post.content,
    creatorId: old.creatorId || 'local-user',
    habitId: old.habitId,
    habitTitle: old.habitTitle,
    memberIds,
    startedAt,
    checkInAt: new Date(old.checkInAt).getTime() || startedAt + (old.mode === 'challenge' ? 24 : 12) * 60 * 60_000,
    userCompleted: old.userCompleted,
  });
  return {
    ...migrated,
    replyState: old.replyState || 'ready',
    careReading: old.careReading,
    checkInSent: old.checkInSent,
    status: old.status,
    npcCompletedIds: old.npcCompletedIds || [],
  };
};

export const ritualEventLabel = (kind: SocialRitualEventKind, actorName: string, progress?: number) => {
  if (kind === 'ritual_created') return 'Nghi thức được mở';
  if (kind === 'joined') return `${actorName} tham gia`;
  if (kind === 'tentative') return `${actorName} chưa hứa chắc`;
  if (kind === 'declined') return `${actorName} từ chối`;
  if (kind === 'seen') return `${actorName} đã xem nhưng chưa nói`;
  if (kind === 'started') return `${actorName} bắt đầu`;
  if (kind === 'paused') return `${actorName} bị gián đoạn`;
  if (kind === 'resumed') return `${actorName} quay lại`;
  if (kind === 'progress') return `${actorName} đang ở ${Math.round(progress || 0)}%`;
  if (kind === 'completed') return `${actorName} hoàn thành`;
  if (kind === 'failed') return `${actorName} không hoàn thành kèo`;
  if (kind === 'support_action') return `${actorName} đã gửi một tín hiệu nâng đỡ`;
  if (kind === 'ritual_closed') return 'Nghi thức đã khép lại';
  return '';
};
