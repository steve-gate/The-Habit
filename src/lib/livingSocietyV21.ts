import { characterConstitutionFor, constitutionPromptBlock, personaAmbientVoice, personaDecisionBias, personaSituationReply, presenceVoiceForPersona, personaPairChemistryLine } from './characterConstitutionV236';
import { buildSoulExpressionPlanV237, followUpLineV237, soulExpressionFallbackV237, type V237ResidueLike } from './soulExpressionV237';

export type V21WorldEventKind =
  | 'routine' | 'npc_win' | 'npc_fail' | 'banter' | 'callback' | 'comeback'
  | 'relationship' | 'milestone' | 'user_signal' | 'duel'
  | 'world_topic' | 'world_reaction' | 'world_debate' | 'world_discovery' | 'world_followup';

export type V21SocialVisibility = 'silent' | 'timeline' | 'feed';
export type V21Need = 'validation' | 'connection' | 'solitude' | 'achievement' | 'novelty' | 'support' | 'play';
export type V21ConversationNeed = 'VENT' | 'VALIDATION' | 'COMPANY' | 'HUMOR' | 'ADVICE' | 'CHALLENGE' | 'SPACE' | 'CELEBRATION';
export type V21MemoryType = 'fact' | 'episode' | 'promise' | 'emotion' | 'inside_joke' | 'relationship' | 'world_topic';
export type V21PendingActionKind = 'like' | 'comment' | 'remember';

export interface V21Memory {
  id: string;
  type: V21MemoryType;
  subject: string;
  content: string;
  salience: number;
  emotionalWeight: number;
  confidence: number;
  createdAt: number;
  lastRecalledAt: number;
  recallCount: number;
  decayHalfLifeHours: number;
  sourceId?: string;
}

export interface V21Relationship {
  closeness: number;
  trust: number;
  affection: number;
  respect: number;
  irritation: number;
  envy: number;
  awkwardness: number;
  debt: number;
  protectiveness: number;
  emotionalSafety: number;
  playfulness: number;
  unresolvedTension: number;
  lastReason: string;
  updatedAt: number;
}

export interface V21Needs {
  social: number;
  validation: number;
  curiosity: number;
  support: number;
  solitude: number;
  achievement: number;
  novelty: number;
  play: number;
  energy: number;
  stress: number;
}

export interface V21PrivateLife {
  currentActivity: string;
  dailyPlan: string[];
  unfinishedBusiness: string[];
  currentProblem: string;
  recentPrivateEvents: string[];
  lastPrivateTick: number;
  lastPublicActionAt: number;
  planDate?: string;
}

export interface V21StoryThread {
  id: string;
  title: string;
  actors: string[];
  tension: number;
  state: 'open' | 'cooling' | 'repairing' | 'resolved';
  startedAt: number;
  updatedAt: number;
  beats: string[];
}

export interface V237EmotionalResidue extends V237ResidueLike {
  warmth:number;
  worry:number;
  irritation:number;
  tenderness:number;
  guilt:number;
  admiration:number;
  protectiveness:number;
  awkwardness:number;
  lastCause:string;
  updatedAt:number;
}

export interface V21NpcRuntime {
  id: string;
  needs: V21Needs;
  privateLife: V21PrivateLife;
  memories: V21Memory[];
  relationships: Record<string, V21Relationship>;
  worldKnowledge: Record<string, { awareness:number; understanding:number; interest:number; stance:number; discoveredAt:number; lastDiscussedAt:number; stanceHistory?:Array<{at:number;stance:number;reason:string}> }>;
  defenseStyle: string;
  socialRole: string;
  lastSeenAt: number;
  lastDecision: string;
  emotionalResidue?: V237EmotionalResidue;
  empathyCalibration?: { misreadCount:number; repairCount:number; lastMisreadAt:number; lastRepairAt:number; note:string };
}

export interface V21WorldTopic {
  id: string;
  title: string;
  category: string;
  summary: string;
  facts?: string[];
  sourceNames: string[];
  sourceUrls: string[];
  firstSeenAt: number;
  lastUpdatedAt: number;
  heat: number;
  momentum: number;
  importance: number;
  controversy: number;
  confidence: number;
  verified: boolean;
  storyValue?: number;
  curiosity?: number;
  consequence?: number;
  whyItMatters?: string;
  language?: 'vi';
}

export interface V21AmbientMoment {
  id: string;
  npcId: string;
  text: string;
  kind: 'life' | 'relationship' | 'world' | 'small_win' | 'small_fail';
  at: number;
  relatedNpcId?: string;
  topicId?: string;
  signal?: number;
  hook?: string;
}

export interface V21PendingAction {
  id: string;
  postId: string;
  npcId: string;
  kind: V21PendingActionKind;
  earliestAt: number;
  expiresAt: number;
  motivation: string;
  probability: number;
  createdAt: number;
  stimulusText?: string;
  stimulusId?: string;
}

export interface V21State {
  version: 21;
  npc: Record<string,V21NpcRuntime>;
  topics: V21WorldTopic[];
  pending: V21PendingAction[];
  threads: V21StoryThread[];
  queuedUserPostIds: string[];
  queuedNpcPostIds: string[];
  ambientMoments: V21AmbientMoment[];
  lastHeartbeatAt: number;
  lastWorldSyncAt: number;
  lastTickAt: number;
  qualityVersion?: number;
}

const KEY = 'habit_mosaic_living_society_v21';
const now = () => Date.now();
const clamp = (v:number,min=0,max=1)=>Math.min(max,Math.max(min,v));
const hash=(v:string)=>{let h=2166136261;for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619);}return Math.abs(h>>>0)};
const rnd=(seed:string)=>hash(seed)/4294967295;
const pick=<T,>(items:T[],seed:string)=>items[Math.floor(rnd(seed)*items.length)%items.length];

const DEFENSE:Record<string,string>={
  'hm-hai':'joke_then_truth', 'hm-tram':'observe_then_one_sentence', 'hm-mai':'tease_to_hide_care',
  'hm-phuc':'self_excuse_then_self_expose', 'hm-son':'competitive_distance', 'hm-tu':'question_before_judgment',
  'hm-ken':'deadpan_care', 'hm-maya':'warm_space', 'hm-k':'pattern_first', 'hm-leo':'scoreboard_rivalry',
  'hm-aiko':'self_disclosure', 'hm-nora':'practical_care'
};
const ROLES:Record<string,string>={
  'hm-hai':'người bẻ lái và phá căng thẳng','hm-tram':'người nghe kỹ','hm-mai':'người cà khịa có tâm',
  'hm-phuc':'người tự bóc lý do','hm-son':'đối thủ kỷ luật','hm-tu':'người hỏi vì sao','hm-ken':'người công nghệ/deadpan',
  'hm-maya':'người giữ không gian cảm xúc','hm-k':'người soi mẫu hình','hm-leo':'người nhìn bảng điểm',
  'hm-aiko':'người hiểu comeback','hm-nora':'người kéo mọi thứ về thực tế'
};


type V21LifeProject={title:string;steps:string[];wins:string[];fails:string[]};
const LIFE_PROJECTS:Record<string,V21LifeProject[]>={
  'hm-hai':[
    {title:'học chỉnh màu video',steps:['thử chỉnh skin tone trên một đoạn 20 giây','xem lại tutorial về contrast','so hai bản màu rồi tự chê cả hai'],wins:['bản thứ ba nhìn đỡ như phim tận thế','cuối cùng giữ được màu da không bị ám xanh'],fails:['grade xong nhìn ai cũng như vừa sốt','ngồi 25 phút rồi nhận ra chỉnh nhầm layer']},
    {title:'sửa chiếc xe đạp cũ',steps:['tìm tiếng kêu ở bánh sau','tháo rồi lắp lại bộ phanh','đi thử một vòng ngắn'],wins:['cái phanh chịu im sau ba lần chỉnh','đi thử được một vòng mà không nghe tiếng lạch cạch'],fails:['tháo ra xong thừa đúng một con ốc','càng chỉnh càng nghe thêm một tiếng mới']}
  ],
  'hm-tram':[
    {title:'quay lại học tiếng Nhật',steps:['ôn một cụm ngữ pháp cũ','đọc 2 trang rồi ghi đúng một dòng','nghe lại đoạn audio hôm qua'],wins:['nhớ được mẫu hôm qua từng quên','đọc hết 2 trang mà không mở điện thoại'],fails:['đọc một đoạn ba lần vẫn trôi khỏi đầu','mở sách ra rồi ngồi nhìn chữ lâu hơn học']},
    {title:'viết 500 chữ cho dự án cá nhân',steps:['viết đoạn mở đầu thật xấu trước','sửa một đoạn hôm qua','gom ba ý rời thành một đoạn'],wins:['qua được đoạn mở đầu hay mắc','viết được 300 chữ trước khi tự phán xét'],fails:['xóa nhiều hơn viết','kẹt đúng một câu gần nửa tiếng']}
  ],
  'hm-mai':[
    {title:'giữ lịch tập 3 buổi một tuần',steps:['thay đồ tập trước khi não kịp mặc cả','làm 20 phút thay vì bỏ cả buổi','đi bộ thêm một vòng sau giờ làm'],wins:['đi tập dù ban đầu chỉ định nằm','kết thúc buổi ngắn mà không tự chê'],fails:['ngồi buộc dây giày xong lại tháo ra','hẹn 10 phút nghỉ rồi nghỉ luôn một tiếng']},
    {title:'làm một clip ngắn',steps:['cắt 30 giây đầu','chọn đúng một nhạc nền','bỏ bớt hiệu ứng thay vì thêm'],wins:['cắt xong trước khi đổi ý lần bảy','chịu đăng bản chưa hoàn hảo'],fails:['mất 20 phút chỉ để đổi font','render xong mới thấy sai chính tả']}
  ],
  'hm-phuc':[
    {title:'xây nhịp tập trung 45 phút',steps:['đóng bớt tab trước khi bắt đầu','làm một block không chạm điện thoại','ghi lại đúng một lý do bị ngắt'],wins:['ngồi hết một block mà không đi lạc sang YouTube','bắt đầu đúng giờ hơn hôm qua'],fails:['mở tab tra một thứ rồi biến mất 18 phút','đặt timer xong quên bấm bắt đầu']},
    {title:'học guitar lại từ đầu',steps:['đổi hợp âm chậm 10 phút','tập đúng một đoạn ngắn','ghi âm một lần để nghe lỗi'],wins:['đổi hợp âm không còn dừng giữa đường','chơi liền được đoạn ngắn đầu tiên'],fails:['bấm đau tay rồi viện cớ rất hợp lý','chơi sai đúng chỗ hôm qua sai']}
  ],
  'hm-son':[
    {title:'chạy 5 km dưới một mốc tự đặt',steps:['chạy easy thay vì lao ngay','giữ pace trong 2 km đầu','đi ngủ sớm hơn cho buổi sáng'],wins:['giữ được pace đều hơn tuần trước','không bỏ bài dù chân nặng'],fails:['đi nhanh quá đầu buổi rồi trả lãi cuối buổi','đồng hồ báo đẹp nhưng chân phản đối']},
    {title:'tập sức mạnh đều 4 buổi',steps:['làm đủ bài chính rồi mới thêm','ghi lại mức tạ thật','nghỉ đúng lúc thay vì sĩ'],wins:['tăng được một rep sạch','chịu giảm tạ để form đẹp hơn'],fails:['ham thêm set rồi mất form','đến phòng tập mới nhớ quên bình nước']}
  ],
  'hm-tu':[
    {title:'làm một side project nhỏ',steps:['viết lại phần lỗi đang né','làm một chức năng chạy được trước','ghi câu hỏi trước khi mở thêm tài liệu'],wins:['fix được bug tưởng phải đập đi làm lại','đóng được một issue nhỏ'],fails:['sửa lỗi A xong sinh lỗi B','đọc docs 40 phút mà chưa chạm code']},
    {title:'đọc một bài nghiên cứu khó',steps:['đọc abstract rồi tự tóm tắt','chỉ tra đúng ba khái niệm','ghi một câu mình chưa tin'],wins:['hiểu được biểu đồ từng bỏ qua','tóm được ý chính bằng lời của mình'],fails:['đọc hết trang mà não không lưu gì','mở thêm sáu tab để hiểu một từ']}
  ],
  'hm-ken':[
    {title:'thử một công cụ AI mới',steps:['test bằng một việc thật thay vì demo','so kết quả với cách cũ','ghi lại chỗ tool nói rất tự tin nhưng sai'],wins:['tìm ra một workflow tiết kiệm được vài bước','bắt được một giới hạn mà quảng cáo không nói'],fails:['mất thời gian setup nhiều hơn thời gian tiết kiệm','tool trả lời rất hay và rất sai']},
    {title:'build một tiện ích nhỏ',steps:['làm chức năng lõi trước UI','fix một bug tồn từ hôm qua','xóa code thừa trước khi thêm mới'],wins:['feature nhỏ chạy thật','xóa được đống workaround khó chịu'],fails:['dependency update phá mất nửa buổi','bug chỉ xuất hiện khi tưởng đã xong']}
  ],
  'hm-maya':[
    {title:'giữ một tuần ít quá tải hơn',steps:['đi bộ 20 phút không nghe gì','tắt thông báo một khoảng','viết ba dòng trước khi ngủ'],wins:['nghỉ được mà không lén mở việc','nhận ra mình đang căng trước khi cáu'],fails:['nghỉ nhưng đầu vẫn họp nội bộ','định đi bộ rồi đứng ngoài cửa năm phút']},
    {title:'học nấu một món mới',steps:['chuẩn bị hết nguyên liệu trước','làm đúng công thức một lần','ghi lại chỗ lần sau muốn đổi'],wins:['món đầu tiên ăn được thật','không nêm thêm vì hoảng'],fails:['đọc nhầm lượng muối','bếp trông như vừa có tranh chấp']}
  ],
  'hm-k':[
    {title:'xây hệ thống ghi chú tốt hơn',steps:['gom một chủ đề rời vào một trang','xóa ba note trùng','viết một liên kết vì sao hai ý có liên quan'],wins:['tìm lại được note trong vài giây','một cụm note bắt đầu thành hệ thống'],fails:['dọn note xong tạo thêm tám note','đặt tag nhiều hơn số ý']},
    {title:'đọc một case study khó',steps:['tách fact khỏi suy đoán','ghi ba giả thuyết cạnh tranh','tìm chi tiết làm mình đổi ý'],wins:['bỏ được giả thuyết mình thích nhất vì dữ liệu','nhìn ra một mâu thuẫn nhỏ nhưng quan trọng'],fails:['mê một giả thuyết rồi đọc mọi thứ theo nó','ghi quá nhiều chi tiết mà chưa có câu hỏi']}
  ],
  'hm-leo':[
    {title:'giữ nhịp tập và công việc cùng lúc',steps:['chốt bài tập chính trước','xong việc quan trọng rồi mới giải trí','ghi đúng số thay vì tự kể chuyện'],wins:['xử lý việc khó trước khi mood kịp phản đối','giữ được nhịp dù hôm nay không sung'],fails:['máu thắng đầu buổi rồi hụt pin cuối buổi','định nghỉ 15 phút thành một hiệp phụ']}
  ],
  'hm-aiko':[
    {title:'quay lại một thói quen từng bỏ',steps:['làm 10 phút để lấy lại nhịp','đừng bù những ngày đã mất','ghi một dòng sau khi xong'],wins:['quay lại được mà không cố trả nợ quá khứ','giữ được ba ngày liên tiếp'],fails:['ngày đầu làm quá tay rồi ngày sau né','mở đúng app rồi ngồi thương lượng với chính mình']},
    {title:'vẽ lại mỗi tối một chút',steps:['phác một vật ngay trước mặt','chỉ sửa ánh sáng thay vì vẽ lại','dừng sau 20 phút dù chưa ưng'],wins:['bản phác có một góc mình thật sự thích','chịu giữ lại nét chưa hoàn hảo'],fails:['tẩy đến mức giấy bắt đầu phản đối','mải sửa một mắt rồi quên cả khuôn mặt']}
  ],
  'hm-nora':[
    {title:'dọn lại kế hoạch tuần',steps:['chọn ba việc thật sự quan trọng','xóa một việc không còn đáng làm','đặt lịch cho việc khó nhất'],wins:['lịch tuần bớt giống danh sách chuộc lỗi','bỏ được một việc chỉ vì ngại nói không'],fails:['xếp lịch kín đến mức không còn chỗ thở','đổi thứ tự công việc năm lần mà chưa làm']},
    {title:'quản lý chi tiêu gọn hơn',steps:['ghi lại khoản dễ quên','so một khoản định mua với mục tiêu tháng','để món muốn mua qua một đêm'],wins:['không mua món chỉ vì đang sale','nhìn ra một khoản rò nhỏ nhưng đều'],fails:['quên ghi đúng khoản mình hay quên','mở app ngân hàng rồi tự giả vờ không thấy']}
  ]
};


type V235DriveProfile={coreDrive:string;pressure:string;winHunger:string;failDefiance:string};
const DRIVE_PROFILES:Record<string,V235DriveProfile>={
  'hm-hai':{coreDrive:'muốn học đến lúc tự tay làm được, không bẻ lái đúng lúc bắt đầu thấy mình ngu',pressure:'càng lỗi càng ngứa tay muốn gỡ',winHunger:'được một chút là muốn biết mình có làm lại được lần hai không',failDefiance:'cay thì có cay, nhưng bỏ ngang còn cay hơn'},
  'hm-tram':{coreDrive:'muốn lấy lại cảm giác tiến bộ chậm nhưng chắc, không cần ai vỗ tay',pressure:'ghét nhất cảm giác đọc mãi mà mình vẫn đứng yên',winHunger:'mỗi bước nhỏ làm cô ấy muốn giữ nhịp thêm một ngày',failDefiance:'không ồn ào, nhưng thường quay lại đúng chỗ vừa mắc'},
  'hm-mai':{coreDrive:'muốn thắng cái phiên bản chuyên mặc cả với chính mình',pressure:'càng bị bản thân kiếm cớ càng muốn chọc thủng cái cớ đó',winHunger:'thắng một kèo nhỏ là bắt đầu ngứa nghề muốn thắng tiếp',failDefiance:'tự cà khịa trước rồi quay lại gỡ, đỡ phải để đời cà khịa hộ'},
  'hm-phuc':{coreDrive:'muốn bớt sống bằng lý do nghe rất hợp lý và có thứ thật để khoe',pressure:'biết mình giỏi bào chữa nên càng muốn bắt quả tang chính mình',winHunger:'mỗi lần làm thật được một đoạn là bớt một lý do để lấp liếm',failDefiance:'thua lý do của mình một hiệp không có nghĩa phải ký hợp đồng dài hạn'},
  'hm-son':{coreDrive:'muốn nhìn con số và biết mình đã ép được bản thân tiến thêm một nấc',pressure:'bị chậm một nhịp là máu cạnh tranh tự bật lên',winHunger:'vượt mốc xong thường lập tức nhìn mốc kế tiếp',failDefiance:'ghét thua, kể cả thua chính mình hôm qua'},
  'hm-tu':{coreDrive:'muốn hiểu tới tận gốc, không chỉ làm cho chạy rồi thôi',pressure:'càng không hiểu càng khó bỏ qua',winHunger:'giải được một câu hỏi chỉ làm nảy thêm hai câu đáng hỏi hơn',failDefiance:'kẹt thì đổi câu hỏi, không đổi mục tiêu'},
  'hm-ken':{coreDrive:'muốn biến tò mò thành thứ chạy được, không phải thêm một tab để đó',pressure:'tool càng khoe thông minh càng muốn đem việc thật ra thử',winHunger:'workflow chạy được là lập tức muốn phá thử xem nó chịu tới đâu',failDefiance:'bug có thể thắng một round, chưa được quyền thắng cả repo'},
  'hm-maya':{coreDrive:'muốn sống đều mà không phải tự đốt mình để chứng minh đang cố',pressure:'nhận ra mình quá tải là muốn giành lại nhịp trước khi cáu với cả thế giới',winHunger:'một ngày vừa sức làm cô ấy muốn bảo vệ nhịp đó thêm',failDefiance:'trượt nhịp thì sửa nhịp, không biến nó thành bản án'},
  'hm-k':{coreDrive:'muốn biến đống hỗn độn thành một hệ thống thật sự dùng được',pressure:'càng thấy pattern lộn xộn càng khó làm ngơ',winHunger:'xếp được một mảnh là muốn biết ba mảnh còn lại nối vào đâu',failDefiance:'giả thuyết sai thì bỏ giả thuyết, không cưới nó'},
  'hm-leo':{coreDrive:'muốn giữ kèo đủ lâu để không ai gọi đó là ăn may',pressure:'thấy khoảng cách điểm co lại là tự động nghiêm túc hơn',winHunger:'thắng rồi vẫn nhìn bảng như thể đối thủ còn nợ mình một round',failDefiance:'mất một lượt thì lấy lượt sau, không làm lễ tang cho bảng điểm'},
  'hm-aiko':{coreDrive:'muốn chứng minh quay lại cũng là một kiểu thắng, kể cả quay lại hơi quê',pressure:'càng nhớ lần bỏ dở càng muốn lần này đi thêm một chút',winHunger:'giữ được nhịp là muốn âm thầm nối thêm một ngày',failDefiance:'ngã quen rồi nên kỹ năng đứng dậy cũng được luyện hơi nhiều'},
  'hm-nora':{coreDrive:'muốn cuộc sống gọn đến mức điều quan trọng có chỗ thở',pressure:'càng nhiều thứ chen nhau càng muốn cắt bớt cho ra việc',winHunger:'bỏ được một thứ thừa là muốn dọn thêm một góc nữa',failDefiance:'lịch vỡ thì sửa lịch, không viết thêm một lịch để than về lịch cũ'}
};

const driveProfileFor=(id:string)=>DRIVE_PROFILES[id]||{coreDrive:'muốn làm việc này tới nơi tới chốn',pressure:'đang có lý do để không muốn bỏ',winHunger:'được một bước là muốn giữ đà',failDefiance:'vướng thì gỡ, chưa vội buông'};
const capVi=(text:string)=>text?text.charAt(0).toLocaleUpperCase('vi-VN')+text.slice(1):text;
const v235Wit=(npcId:string,kind:'win'|'fail'|'effort',seed:string)=>{
  const pool:Record<string,Record<'win'|'fail'|'effort',string[]>>={
    'hm-hai':{win:['Tạm thời cứu được danh dự nghề tay trái.','Ít nhất hôm nay mắt mình chưa bị màu hóa học.'],fail:['Kỹ năng mới vừa thu học phí bằng lòng tự trọng.','Bài học hôm nay: layer cũng biết chơi trốn tìm.'],effort:['Đang bẻ lái khỏi ý định “để mai học tiếp”.','Não xin nghỉ, tay chưa ký duyệt.']},
    'hm-tram':{win:['Không pháo hoa. Chỉ có một dấu gạch nhỏ nhưng thật.','Tiến bộ hôm nay nói hơi nhỏ, nhưng có nói.'],fail:['Não đọc xong rồi giả vờ chưa từng gặp đoạn này.','Chữ vẫn ở đó. Tự tin thì đi đâu chưa rõ.'],effort:['Đang đi chậm tới mức cái cớ cũng khó chen vào.','Không hứng lắm, nhưng vẫn mở lại.']},
    'hm-mai':{win:['Xin ghi nhận: hôm nay cái cớ thua điểm.','Tự ái đang khá vui vì có bằng chứng.'],fail:['Kế hoạch vừa ăn một cú tự vả rất có kỹ thuật.','Não thắng hiệp một. Mai chưa ký biên bản thua trận.'],effort:['Đang thương lượng với bản thân bằng giọng không mấy ngoại giao.','Cái cớ đang nói nhiều. Mai đang nói ít và làm tiếp.']},
    'hm-phuc':{win:['Hôm nay lý do bào chữa bị thiếu bằng chứng.','Có làm thật nên tạm thời hết quyền lấp liếm.'],fail:['Một cái tab mở ra, mười tám phút mất tích. Vụ án quen thuộc.','Timer đã làm tròn trách nhiệm: nằm đó rất đúng giờ.'],effort:['Đang cố làm trước khi kịp nghĩ ra lý do hay.','Lý do thì đủ bộ; thiếu mỗi quyền quyết định.']},
    'hm-son':{win:['Bảng số nói được. Khỏi cần diễn văn.','Mốc cũ vừa bị cho nghỉ việc.'],fail:['Đầu buổi gáy hơi to, cuối buổi trả lãi.','Đồng hồ bảo ổn. Chân gửi đơn khiếu nại.'],effort:['Đang lì thêm một hiệp.','Không nhanh hơn cũng được, miễn đừng mềm hơn.']},
    'hm-tu':{win:['Một câu hỏi chết, hai câu mới nở. Cũng coi như lời.','Ít nhất lần này “hiểu rồi” có bằng chứng.'],fail:['Đọc docs xong kiến thức tăng chưa rõ, số tab thì chắc chắn.','Bug A đi, bug B vào ca. Hệ sinh thái ổn định.'],effort:['Đang hỏi lại câu hỏi thay vì chửi câu trả lời.','Chưa hiểu nên chưa chịu đóng tab cuối cùng.']},
    'hm-ken':{win:['Tool sống sót qua bài test thật. Tạm cấp quyền tồn tại.','Workflow chạy được. Giờ tới phần cố tình phá nó.'],fail:['AI trả lời rất tự tin. Sai cũng rất tự tin.','Dependency vừa chứng minh nó cũng có cảm xúc.'],effort:['Đang test quảng cáo bằng sự hoài nghi có tổ chức.','Máy nói “done”. Ken nói “để tôi xem”.']},
    'hm-maya':{win:['Một ngày không tự đốt mình vẫn tính là ngày có tiến triển.','Hóa ra nghỉ đúng lúc không làm trái đất dừng quay.'],fail:['Định nghỉ đầu óc. Đầu óc mở họp nội bộ.','Bước ra cửa rồi đứng đó năm phút. Kỹ thuật chuyển cảnh hơi lâu.'],effort:['Đang cố nhẹ tay mà không buông tay.','Không ép thêm. Vẫn giữ nhịp.']},
    'hm-k':{win:['Một mớ hỗn độn vừa chịu nhận họ hàng với nhau.','Pattern hôm nay chịu ló mặt.'],fail:['Dọn note xong sinh thêm note. Hệ thống đang tự nhân giống.','Giả thuyết đẹp quá nên suýt được miễn kiểm chứng.'],effort:['Đang tách dữ liệu khỏi cảm tình.','Chưa kết luận. Đang săn thứ làm mình đổi ý.']},
    'hm-leo':{win:['Bảng điểm vừa bớt nói chuyện bằng dấu hỏi.','Một round sạch. Còn lâu mới đủ.'],fail:['Mất một nhịp. Chưa mất kèo.','Điểm rơi hôm nay hơi trượt. Bảng điểm chưa đóng cửa.'],effort:['Đang giữ nhịp như giữ kèo.','Không cần đẹp. Cần còn trong trận.']},
    'hm-aiko':{win:['Comeback nhỏ thôi, nhưng nhỏ vẫn là back.','Hôm nay quá khứ bị từ chối quyền biểu quyết.'],fail:['Lại thương lượng với chính mình. Bên kia có luật sư khá giỏi.','Ngày đầu làm quá tay, ngày sau nhận hóa đơn. Cổ điển.'],effort:['Đang quay lại hơi quê nhưng vẫn quay lại.','Không bù quá khứ. Chỉ làm hôm nay.']},
    'hm-nora':{win:['Một việc thừa vừa bị cho ra khỏi lịch. Không ai khóc.','Lịch thở được thêm một ô. Tiến bộ rất hành chính.'],fail:['Xếp lịch kín quá. Thời gian gửi đơn từ chối hợp tác.','Mở app ngân hàng rồi giả vờ không thấy. Chiến thuật không bền.'],effort:['Đang cắt việc, không cắt sự tỉnh táo.','Bớt một thứ để giữ đúng một thứ.']}
  };
  const set=pool[npcId]||{win:['Có tiến triển thật.'],fail:['Vướng thật, nhưng chưa bỏ.'],effort:['Đang làm tiếp.']};
  return pick(set[kind],`${npcId}|${kind}|${seed}`);
};

const driveMoodFor=(n:V21NpcRuntime,last?:V21AmbientMoment)=>{
  if(last?.kind==='small_fail')return 'đang gỡ';
  if(last?.kind==='small_win')return 'đang lên đà';
  if(n.needs.energy<.34&&n.needs.achievement>.56)return 'hết pin nhưng chưa buông';
  if(n.needs.stress>.65)return 'đang lì qua đoạn khó';
  if(n.needs.play>.7)return 'vừa làm vừa tự cà khịa';
  if(n.needs.achievement>.68)return 'đang máu làm cho ra';
  return 'đang cố cho tới nơi';
};

const activeLifeProject=(id:string,at:number)=>{const list=LIFE_PROJECTS[id]||[{title:'một việc cá nhân cụ thể',steps:['làm một phần nhỏ'],wins:['xong được một phần'],fails:['kẹt ở một phần']}];const d=new Date(at);const week=Math.floor((Date.UTC(d.getFullYear(),d.getMonth(),d.getDate())/86400000)/7);return list[hash(`${id}|${week}`)%list.length];};

export interface V21InformationBehavior { newsConsumption:number; curiosity:number; skepticism:number; gossipAffinity:number; trendSensitivity:number; sharingThreshold:number; }
export const V21_INFO_BEHAVIOR:Record<string,V21InformationBehavior>={
  'hm-hai':{newsConsumption:.42,curiosity:.62,skepticism:.48,gossipAffinity:.55,trendSensitivity:.66,sharingThreshold:.58},
  'hm-tram':{newsConsumption:.63,curiosity:.82,skepticism:.78,gossipAffinity:.18,trendSensitivity:.42,sharingThreshold:.72},
  'hm-mai':{newsConsumption:.78,curiosity:.76,skepticism:.52,gossipAffinity:.76,trendSensitivity:.88,sharingThreshold:.46},
  'hm-phuc':{newsConsumption:.5,curiosity:.65,skepticism:.44,gossipAffinity:.66,trendSensitivity:.79,sharingThreshold:.5},
  'hm-son':{newsConsumption:.48,curiosity:.55,skepticism:.62,gossipAffinity:.2,trendSensitivity:.36,sharingThreshold:.68},
  'hm-tu':{newsConsumption:.8,curiosity:.92,skepticism:.86,gossipAffinity:.12,trendSensitivity:.47,sharingThreshold:.74},
  'hm-ken':{newsConsumption:.92,curiosity:.95,skepticism:.73,gossipAffinity:.3,trendSensitivity:.9,sharingThreshold:.44},
  'hm-maya':{newsConsumption:.58,curiosity:.74,skepticism:.68,gossipAffinity:.2,trendSensitivity:.4,sharingThreshold:.78},
  'hm-k':{newsConsumption:.86,curiosity:.88,skepticism:.91,gossipAffinity:.1,trendSensitivity:.34,sharingThreshold:.82},
  'hm-leo':{newsConsumption:.68,curiosity:.62,skepticism:.52,gossipAffinity:.4,trendSensitivity:.72,sharingThreshold:.5},
  'hm-aiko':{newsConsumption:.59,curiosity:.76,skepticism:.55,gossipAffinity:.44,trendSensitivity:.67,sharingThreshold:.57},
  'hm-nora':{newsConsumption:.7,curiosity:.7,skepticism:.74,gossipAffinity:.16,trendSensitivity:.43,sharingThreshold:.73},
};

export const V21_INTERESTS:Record<string,Record<string,number>>={
  'hm-hai':{fitness:.68,gaming:.62,entertainment:.78,ai:.35,technology:.4,culture:.74,psychology:.45,sports:.57,science:.28,finance:.2},
  'hm-tram':{education:.88,psychology:.9,culture:.72,science:.56,ai:.45,technology:.38,entertainment:.42,finance:.18,sports:.16},
  'hm-mai':{culture:.92,entertainment:.9,social:.92,ai:.56,technology:.42,gaming:.48,psychology:.62,sports:.32,finance:.25},
  'hm-phuc':{entertainment:.82,culture:.75,gaming:.72,ai:.46,technology:.5,finance:.34,psychology:.4},
  'hm-son':{fitness:.94,sports:.9,productivity:.8,psychology:.42,technology:.28,finance:.32},
  'hm-tu':{science:.9,ai:.8,technology:.78,psychology:.8,education:.76,culture:.58,finance:.45},
  'hm-ken':{ai:.96,technology:.96,gaming:.82,science:.78,finance:.5,culture:.44,entertainment:.48},
  'hm-maya':{psychology:.9,culture:.7,education:.66,health:.72,science:.5,ai:.4,entertainment:.45},
  'hm-k':{science:.84,technology:.76,ai:.74,psychology:.82,finance:.58,crime:.8,culture:.32},
  'hm-leo':{sports:.86,finance:.72,technology:.6,gaming:.58,productivity:.84,ai:.54},
  'hm-aiko':{culture:.78,entertainment:.74,education:.72,psychology:.8,ai:.5,gaming:.52},
  'hm-nora':{finance:.72,health:.7,technology:.62,education:.66,ai:.54,science:.52,productivity:.84}
};

const baseRelationship=(seed:string):V21Relationship=>({
  closeness:.2+rnd(seed+'c')*.2,trust:.35+rnd(seed+'t')*.2,affection:.35+rnd(seed+'a')*.2,respect:.4+rnd(seed+'r')*.25,
  irritation:rnd(seed+'i')*.18,envy:rnd(seed+'e')*.12,awkwardness:rnd(seed+'w')*.18,debt:0,protectiveness:.15+rnd(seed+'p')*.18,
  emotionalSafety:.3+rnd(seed+'s')*.2,playfulness:.3+rnd(seed+'pl')*.35,unresolvedTension:0,lastReason:'chưa có lịch sử rõ',updatedAt:now()
});
const baseNeeds=(id:string):V21Needs=>({
  social:.32+rnd(id+'social')*.3,validation:.2+rnd(id+'validation')*.35,curiosity:.35+rnd(id+'curiosity')*.5,
  support:.15+rnd(id+'support')*.3,solitude:.25+rnd(id+'solitude')*.4,achievement:.45+rnd(id+'achievement')*.45,
  novelty:.3+rnd(id+'novelty')*.45,play:.28+rnd(id+'play')*.48,energy:.55+rnd(id+'energy')*.3,stress:.16+rnd(id+'stress')*.25
});

const makeNpc=(id:string):V21NpcRuntime=>({
  id,needs:baseNeeds(id),privateLife:{currentActivity:'đang sống việc riêng',dailyPlan:[],unfinishedBusiness:[],currentProblem:'',recentPrivateEvents:[],lastPrivateTick:now(),lastPublicActionAt:0},
  memories:[],relationships:{},worldKnowledge:{},defenseStyle:DEFENSE[id]||'mixed',socialRole:ROLES[id]||'một người trong nhóm',lastSeenAt:now(),lastDecision:'silent',
  emotionalResidue:{warmth:.18,worry:.08,irritation:.04,tenderness:.08,guilt:0,admiration:.08,protectiveness:.08,awkwardness:.04,lastCause:'chưa có dư âm mạnh',updatedAt:now()},
  empathyCalibration:{misreadCount:0,repairCount:0,lastMisreadAt:0,lastRepairAt:0,note:'chưa có lần hiểu sai đáng nhớ'}
});

const ensureV237Runtime=(n:V21NpcRuntime)=>{
  const at=now();
  if(!n.emotionalResidue)n.emotionalResidue={warmth:.18,worry:.08,irritation:.04,tenderness:.08,guilt:0,admiration:.08,protectiveness:.08,awkwardness:.04,lastCause:'chưa có dư âm mạnh',updatedAt:at};
  if(!n.empathyCalibration)n.empathyCalibration={misreadCount:0,repairCount:0,lastMisreadAt:0,lastRepairAt:0,note:'chưa có lần hiểu sai đáng nhớ'};
  const r=n.emotionalResidue; const dt=Math.max(0,Math.min(168,(at-(r.updatedAt||at))/3600000)); const decay=Math.pow(.5,dt/42);
  r.worry=clamp((r.worry||0)*decay);r.irritation=clamp((r.irritation||0)*decay);r.tenderness=clamp((r.tenderness||0)*decay);r.guilt=clamp((r.guilt||0)*decay);r.admiration=clamp((r.admiration||0)*Math.pow(.5,dt/96));r.protectiveness=clamp((r.protectiveness||0)*Math.pow(.5,dt/72));r.awkwardness=clamp((r.awkwardness||0)*decay);r.warmth=clamp(.12+(r.warmth||0)*Math.pow(.5,dt/120));r.updatedAt=at;
  return n;
};
const fallbackState=():V21State=>({version:21,npc:{},topics:[],pending:[],threads:[],queuedUserPostIds:[],queuedNpcPostIds:[],ambientMoments:[],lastHeartbeatAt:0,lastWorldSyncAt:0,lastTickAt:now(),qualityVersion:238});
const looksVietnameseClientText=(text:string)=>{const t=` ${String(text||'').toLocaleLowerCase('vi-VN')} `;const accent=(t.match(/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/g)||[]).length;const vi=(t.match(/\b(và|của|với|trong|đang|được|cho|tại|mới|sau|trước|người|này|về|khi|những|một|không|công nghệ|thể thao|khoa học|kinh tế|trí tuệ|phim|âm nhạc)\b/g)||[]).length;return accent>=2||vi>=3;};
const migrateQuality238=(state:V21State):V21State=>{if(Number(state.qualityVersion||0)>=238)return state;const topics=(state.topics||[]).filter(t=>looksVietnameseClientText(`${t.title} ${t.summary}`));return{...state,topics,ambientMoments:[],lastHeartbeatAt:0,lastWorldSyncAt:0,qualityVersion:238};};
export const loadV21State=():V21State=>{try{const x=JSON.parse(localStorage.getItem(KEY)||'null');const state=x?.version===21?{...fallbackState(),...x}:fallbackState();return migrateQuality238(state);}catch{return fallbackState();}};
export const saveV21State=(s:V21State)=>{try{localStorage.setItem(KEY,JSON.stringify({...s,version:21}));}catch{}};
const mutate=(fn:(s:V21State)=>void)=>{const s=loadV21State();fn(s);s.lastTickAt=now();saveV21State(s);return s;};
export const ensureNpc=(id:string)=>{const s=loadV21State();if(!s.npc[id])s.npc[id]=makeNpc(id);ensureV237Runtime(s.npc[id]);saveV21State(s);return s.npc[id];};

function ensurePrivateDay(n:V21NpcRuntime,at:number,legacy:any={}){
  const d=new Date(at);const date=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  if(n.privateLife.planDate===date)return;
  const project=activeLifeProject(n.id,at);
  n.privateLife.dailyPlan=[...project.steps];
  n.privateLife.unfinishedBusiness=[];
  n.privateLife.currentProblem='';
  n.privateLife.currentActivity=`đang lo chuyện “${project.title}”`;
  n.privateLife.planDate=date;
  const legacyGoal=String(legacy?.lifeGoal||'').trim();
  if(legacyGoal&&legacyGoal!==project.title)n.privateLife.recentPrivateEvents=[...n.privateLife.recentPrivateEvents,`hôm nay ưu tiên ${project.title} thay vì nói chung chung “${legacyGoal}”`].slice(-10);
}
function tickNeeds(n:V21NpcRuntime,at:number,legacy:any={}){
  ensurePrivateDay(n,at,legacy);
  const dt=Math.max(0,Math.min(24,(at-n.privateLife.lastPrivateTick)/3600000));
  if(!dt)return;
  const hour=new Date(at).getHours();
  n.needs.energy=clamp(n.needs.energy+(hour>=7&&hour<=17?.018:-.025)*dt);
  n.needs.social=clamp(n.needs.social+.012*dt);
  n.needs.solitude=clamp(n.needs.solitude+(n.needs.social>.72?.008:-.006)*dt);
  n.needs.achievement=clamp(n.needs.achievement+.01*dt);
  n.needs.play=clamp(n.needs.play+.007*dt);
  n.needs.stress=clamp(n.needs.stress-.008*dt);
  n.privateLife.lastPrivateTick=at;
  const slot=hour<8?'chuẩn bị ngày mới':hour<12?'đang tập trung':hour<14?'đang nghỉ/ngó tin':hour<18?'đang làm phần việc chiều':hour<22?'đang sống việc cá nhân':'đang hạ nhịp';
  const activeProject=activeLifeProject(n.id,at);n.privateLife.currentActivity=`${slot}: ${activeProject.title}`;
  if(rnd(`${n.id}|${Math.floor(at/3600000)}|private`)<.24){
    const project=activeLifeProject(n.id,at);const fail=rnd(`${n.id}|${at}|private-outcome`)<(.28+n.needs.stress*.16);const beat=fail?pick(project.fails,`${n.id}|${at}|fail`):pick(project.wins,`${n.id}|${at}|win`);
    n.privateLife.recentPrivateEvents=[...n.privateLife.recentPrivateEvents,`${project.title}: ${beat}`].slice(-10);
    n.privateLife.currentActivity=fail?`đang mắc ở ${project.title}`:`vừa tiến thêm ở ${project.title}`;
    if(fail){n.needs.stress=clamp(n.needs.stress+.08);n.needs.validation=clamp(n.needs.validation+.06);n.privateLife.currentProblem=beat;n.privateLife.unfinishedBusiness=[...n.privateLife.unfinishedBusiness,pick(project.steps,`${n.id}|${at}|unfinished`)].slice(-5);}
    else{n.needs.achievement=clamp(n.needs.achievement-.12);n.needs.validation=clamp(n.needs.validation-.05);if(n.privateLife.unfinishedBusiness.length&&rnd(`${n.id}|${at}|resolve`)>.45)n.privateLife.unfinishedBusiness.shift();if(!n.privateLife.unfinishedBusiness.length)n.privateLife.currentProblem='';}
  }
}

export const chooseLivingActor=(personas:any[],npcRecord:Record<string,any>,eventTime:number,salt:string)=>{
  const s=loadV21State();
  let best=personas[0],bestScore=-1;
  for(const p of personas){
    const n=s.npc[p.id]||(s.npc[p.id]=makeNpc(p.id));const legacy=npcRecord[p.id]||{};tickNeeds(n,eventTime,legacy);
    const publicGap=Math.min(1,(eventTime-(n.privateLife.lastPublicActionAt||0))/(8*3600000));
    const socialPressure=clamp(n.needs.social*.35+n.needs.validation*.12+n.needs.play*.15+n.needs.achievement*.1-n.needs.solitude*.25-n.needs.stress*.12+publicGap*.28);
    const legacyBoost=legacy?.mood==='competitive'?.08:legacy?.mood==='tired'?-.1:0;
    const score=socialPressure+legacyBoost+rnd(`${salt}|${p.id}`)*.22;
    if(score>bestScore){bestScore=score;best=p;}
  }
  saveV21State(s);return best;
};

export const chooseSocialPartner=(actor:any,personas:any[],npcRecord:Record<string,any>,seed:string,purpose:'support'|'banter'|'conflict'|'share'='banter')=>{
  const s=loadV21State();const n=s.npc[actor.id]||(s.npc[actor.id]=makeNpc(actor.id));
  let best:any=null,bestScore=-999;
  for(const p of personas){if(!p||p.id===actor.id)continue;const rel=n.relationships[p.id]||(n.relationships[p.id]=baseRelationship(`${actor.id}|${p.id}`));const legacy=npcRecord[actor.id]?.socialEmotions?.[p.id]||{};
    let score=rel.closeness*.24+rel.affection*.18+rel.respect*.14+rel.playfulness*.18+Number(legacy.affection||0)*.1+Number(legacy.respect||0)*.08;
    if(purpose==='support')score+=rel.trust*.24+rel.emotionalSafety*.2-rel.irritation*.2;
    if(purpose==='banter')score+=rel.playfulness*.3+rel.closeness*.16-rel.awkwardness*.1;
    if(purpose==='conflict')score+=rel.irritation*.42+rel.unresolvedTension*.35+rel.envy*.18;
    score+=rnd(`${seed}|${p.id}`)*.18;
    if(score>bestScore){bestScore=score;best=p;}
  }saveV21State(s);return best||personas.find(p=>p.id!==actor.id)||personas[0];
};

const weightedTopicFor=(npcId:string,topics:V21WorldTopic[],seed:string)=>{
  const interests=V21_INTERESTS[npcId]||{};const behavior=V21_INFO_BEHAVIOR[npcId]||{newsConsumption:.5,curiosity:.5,skepticism:.5,gossipAffinity:.3,trendSensitivity:.5,sharingThreshold:.65};let best:V21WorldTopic|undefined;let bestScore=0;
  for(const t of topics){
    if(!looksVietnameseClientText(`${t.title} ${t.summary}`))continue;
    const story=clamp(Number(t.storyValue??.45));if(story<.58)continue;
    const interest=Math.max(interests[t.category]||0,(interests.social||0)*.2);const freshness=clamp(1-(now()-t.lastUpdatedAt)/(72*3600000));const trend=Math.max(0,t.momentum)*behavior.trendSensitivity;const trust=t.confidence*(1-behavior.skepticism*.22);const consequence=clamp(Number(t.consequence??t.importance));const curiosity=clamp(Number(t.curiosity??.45));
    const score=interest*.31+story*.24+consequence*.12+curiosity*.09+t.heat*.08+trend*.05+trust*.06+freshness*.03+behavior.newsConsumption*.01+behavior.curiosity*.01+rnd(seed+t.id)*.025;
    if(score>bestScore){bestScore=score;best=t;}
  }
  return bestScore>.54?best:undefined;
};

export const decideLivingEvent=(args:{npcId:string;legacyKind:V21WorldEventKind;seed:string;eventTime:number;isSocialHour:boolean;isLowEnergyHour:boolean;source:'offline'|'live'})=>{
  const s=loadV21State();const n=s.npc[args.npcId]||(s.npc[args.npcId]=makeNpc(args.npcId));tickNeeds(n,args.eventTime);
  const topic=weightedTopicFor(args.npcId,s.topics,args.seed);
  const behavior=V21_INFO_BEHAVIOR[args.npcId]||{newsConsumption:.5,curiosity:.5,skepticism:.5,gossipAffinity:.3,trendSensitivity:.5,sharingThreshold:.65};
  const worldImpulse=topic?clamp((V21_INTERESTS[args.npcId]?.[topic.category]||.1)*topic.heat*behavior.newsConsumption):0;
  let kind=args.legacyKind;
  if(topic&&worldImpulse>.28&&rnd(args.seed+'world')<(.07+.13*behavior.trendSensitivity)){
    const known=n.worldKnowledge[topic.id];
    const oldStance=known?.stance??(rnd(args.seed+'stance')-.5);
    const evidenceShift=(topic.confidence-.5)*.16*(1-behavior.skepticism*.35)+(rnd(args.seed+'opinion-shift')-.5)*.12;
    const newStance=clamp(oldStance+evidenceShift,-1,1);
    kind=known?.awareness>.65?(known.lastDiscussedAt&&args.eventTime-known.lastDiscussedAt<36*3600000?'world_followup':(topic.controversy>.58?'world_debate':'world_reaction')):'world_discovery';
    const stanceHistory=[...(known?.stanceHistory||[])];if(!known||Math.abs(newStance-oldStance)>.06)stanceHistory.push({at:args.eventTime,stance:newStance,reason:known?'đọc thêm / trải nghiệm mới':'ấn tượng ban đầu'});
    n.worldKnowledge[topic.id]={awareness:clamp((known?.awareness||0)+.32+.2*behavior.newsConsumption),understanding:clamp((known?.understanding||0)+.12+.2*behavior.curiosity),interest:worldImpulse,stance:newStance,discoveredAt:known?.discoveredAt||args.eventTime,lastDiscussedAt:args.eventTime,stanceHistory:stanceHistory.slice(-8)};
    const worldMemory:V21Memory={id:`m-${hash(`${args.npcId}|world_topic|${topic.id}`)}`,type:'world_topic',subject:topic.category,content:`${topic.title} | stance ${newStance.toFixed(2)}`,salience:clamp(.34+worldImpulse*.42),emotionalWeight:clamp(.18+topic.controversy*.35+topic.heat*.18),confidence:topic.confidence,createdAt:args.eventTime,lastRecalledAt:args.eventTime,recallCount:0,decayHalfLifeHours:96,sourceId:topic.id};
    const wm=n.memories.find(m=>m.id===worldMemory.id);if(wm){wm.content=worldMemory.content;wm.salience=clamp(Math.max(wm.salience,worldMemory.salience)+.03);wm.confidence=Math.max(wm.confidence,worldMemory.confidence);wm.lastRecalledAt=args.eventTime;}else n.memories.push(worldMemory);
    if(worldImpulse>.42&&rnd(args.seed+'world-private')<.38){const beat=`đang tìm hiểu “${topic.title.slice(0,90)}” vì nó chạm đúng mối quan tâm ${topic.category}`;n.privateLife.recentPrivateEvents=[...n.privateLife.recentPrivateEvents,beat].slice(-10);if(['ai','technology','gaming','education','psychology'].includes(topic.category)&&rnd(args.seed+'world-try')<.46)n.privateLife.currentActivity=`đang thử/đọc thêm về ${topic.title.slice(0,72)}`;}
  }
  let socialDrive=n.needs.social*.26+n.needs.validation*.12+n.needs.play*.12+n.needs.achievement*.08-worldImpulse*.02-n.needs.solitude*.28-n.needs.stress*.18;
  if(['relationship','banter','callback','user_signal','duel'].includes(kind))socialDrive+=.2;
  if(['milestone','comeback'].includes(kind))socialDrive+=.15;
  const silenceThreshold=args.source==='live'?.62:.5;
  const roll=rnd(args.seed+'visibility');
  let visibility:V21SocialVisibility='silent';
  if(socialDrive+roll*.36>silenceThreshold)visibility='timeline';
  if(socialDrive+roll*.22>.82)visibility='feed';
  if(kind==='milestone')visibility=roll<.82?'feed':'timeline';
  if(kind==='user_signal')visibility=roll<.62?'feed':'timeline';
  if(kind.startsWith('world_')){const sharePressure=worldImpulse+behavior.gossipAffinity*.18+behavior.trendSensitivity*.12;if(sharePressure<behavior.sharingThreshold-.15)visibility='silent';else if(visibility==='silent'&&roll>.72)visibility='timeline';}
  n.lastDecision=visibility==='silent'?'lived_privately':kind;
  if(visibility!=='silent'){n.needs.social=clamp(n.needs.social-.14);n.needs.validation=clamp(n.needs.validation-.05);n.privateLife.lastPublicActionAt=args.eventTime;}
  saveV21State(s);return{kind,visibility,topic};
};

export const worldAwareFallback=(npcId:string,kind:V21WorldEventKind,topic?:V21WorldTopic)=>{
  if(!topic)return'';
  const title=topic.title.replace(/\s+-\s+[^-]{2,50}$/,'').slice(0,110);
  const style=DEFENSE[npcId]||'mixed';
  const frame=kind==='world_debate'?'đang gây tranh luận':kind==='world_discovery'?'mới lọt vào mắt tôi':kind==='world_followup'?'lại có diễn biến':'đang nổi';
  if(style==='deadpan_care')return `Cái vụ “${title}” ${frame} thật. Tôi đọc xong và tiếc là não lại có thêm một tab.`;
  if(style==='question_before_judgment')return `“${title}” đang nóng. Tôi chưa chốt phe. Tôi còn muốn biết cái gì bị bỏ khỏi tiêu đề.`;
  if(style==='observe_then_one_sentence')return `Mấy hôm nay ai cũng nhắc “${title}”. Tôi đang để ý xem chuyện này thật sự đổi được gì.`;
  if(style==='tease_to_hide_care')return `Internet hôm nay chọn “${title}” làm món chính. Tôi xin ăn phần bình luận sau.`;
  if(style==='pattern_first')return `“${title}” đang lên nhanh. Tôi muốn xem ba ngày nữa người ta còn nói cùng một giọng không.`;
  return `Tôi vừa thấy chuyện “${title}”. Có vẻ hôm nay thế giới lại không chịu đứng yên.`;
};

export const updateRelationship=(fromId:string,toId:string,delta:Partial<Record<keyof V21Relationship,number>>,reason:string)=>mutate(s=>{
  const a=s.npc[fromId]||(s.npc[fromId]=makeNpc(fromId));const r=a.relationships[toId]||(a.relationships[toId]=baseRelationship(`${fromId}|${toId}`));
  for(const [k,v] of Object.entries(delta)){if(typeof v==='number'&&typeof (r as any)[k]==='number')(r as any)[k]=clamp((r as any)[k]+v);}
  r.lastReason=reason;r.updatedAt=now();
});

function decayMemory(m:V21Memory,at:number){const ageH=(at-m.createdAt)/3600000;return clamp(m.salience*Math.pow(.5,ageH/Math.max(12,m.decayHalfLifeHours))+.04*Math.min(4,m.recallCount));}
export const remember=(npcId:string,memory:Omit<V21Memory,'id'|'createdAt'|'lastRecalledAt'|'recallCount'>)=>mutate(s=>{
  const n=s.npc[npcId]||(s.npc[npcId]=makeNpc(npcId));const at=now();const id=`m-${hash(`${npcId}|${memory.type}|${memory.subject}|${memory.content}`)}`;
  const old=n.memories.find(x=>x.id===id);if(old){old.salience=clamp(Math.max(old.salience,memory.salience)+.08);old.emotionalWeight=clamp(Math.max(old.emotionalWeight,memory.emotionalWeight));old.confidence=clamp(Math.max(old.confidence,memory.confidence));old.lastRecalledAt=at;}else n.memories.push({...memory,id,createdAt:at,lastRecalledAt:at,recallCount:0});
  n.memories=n.memories.filter(x=>decayMemory(x,at)>.09).sort((a,b)=>decayMemory(b,at)-decayMemory(a,at)).slice(0,80);
});

export const memoriesFromUserText=(npcId:string,text:string,sourceId?:string)=>{
  const t=text.trim();if(!t)return[] as V21Memory[];const at=now();const out:V21Memory[]=[];const mk=(type:V21MemoryType,subject:string,content:string,salience:number,emotionalWeight:number,confidence=.72,half=240):V21Memory=>({id:`m-${hash(`${npcId}|${type}|${subject}|${content}`)}`,type,subject,content,salience,emotionalWeight,confidence,createdAt:at,lastRecalledAt:at,recallCount:0,decayHalfLifeHours:half,sourceId});
  const lower=t.toLocaleLowerCase('vi-VN');
  if(/học|n3|n2|n1|hsk|tiếng nhật|tiếng trung|tiếng anh|đọc sách/.test(lower))out.push(mk('fact','học tập',t.slice(0,160),.62,.38,.78,480));
  if(/gym|tập|chạy|thể dục|ngủ|nước/.test(lower))out.push(mk('fact','sức khỏe/thói quen',t.slice(0,160),.55,.32,.76,360));
  if(/mai|hứa|sẽ|nhất định|lần sau/.test(lower))out.push(mk('promise','lời hứa/kế hoạch',t.slice(0,180),.76,.52,.68,360));
  if(/mệt|nản|chán|buồn|không ổn|xấu hổ|thất vọng|vui|tự hào|cuối cùng|xong rồi/.test(lower))out.push(mk('emotion','cảm xúc user',t.slice(0,180),.72,.75,.76,240));
  out.push(mk('episode','một lần user chia sẻ',t.slice(0,200),Math.min(.82,.38+t.length/800),/!|mệt|nản|vui|xong|thất vọng/.test(lower)?.62:.32,.75,240));
  mutate(s=>{const n=s.npc[npcId]||(s.npc[npcId]=makeNpc(npcId));for(const m of out){const old=n.memories.find(x=>x.id===m.id);if(old){old.salience=clamp(old.salience+.08);old.lastRecalledAt=at;}else n.memories.push(m);}n.memories=n.memories.filter(x=>decayMemory(x,at)>.09).slice(-80);});
  return out;
};

export const recallRelevant=(npcId:string,text:string,limit=4)=>{
  const s=loadV21State();const n=s.npc[npcId]||(s.npc[npcId]=makeNpc(npcId));const at=now();const tokens=new Set(text.toLocaleLowerCase('vi-VN').split(/[^\p{L}\p{N}]+/u).filter(x=>x.length>2));
  const ranked=n.memories.map(m=>{const mt=m.content.toLocaleLowerCase('vi-VN');let overlap=0;tokens.forEach(tok=>{if(mt.includes(tok))overlap+=1});const score=decayMemory(m,at)*.52+Math.min(.35,overlap*.09)+m.emotionalWeight*.16;return{m,score}}).sort((a,b)=>b.score-a.score).slice(0,limit);
  for(const x of ranked){x.m.lastRecalledAt=at;x.m.recallCount+=1;}saveV21State(s);return ranked.map(x=>({...x.m,whyItMattersNow:x.score>.65?'liên quan trực tiếp đến điều vừa nói':x.m.emotionalWeight>.65?'ký ức có dư âm cảm xúc':'một mảnh lịch sử có thể làm sắc thái khác đi'}));
};

export const appraiseUserText=(text:string)=>{
  const t=text.trim();const l=t.toLocaleLowerCase('vi-VN');const ironic=/(:\)|=\)|haha|hehe|khá ổn|tuyệt vời thật|đỉnh quá).*(lại|không|0|fail)|lại.*(:\)|haha)/i.test(t);
  const socialCall=/^(?:alo+|ê+|hey)\b|mọi người(?: ơi| đâu)?|có ai(?: ở đây| online| còn thức| không| nghe)?|ai (?:ở đây|online|còn thức)|nhóm đâu rồi|cả nhà đâu/i.test(l) || /(?:có ai không|mọi người đâu|ai nghe không)/i.test(l);
  const exhausted=/mệt|đuối|kiệt|cạn pin|không muốn.*nữa/.test(l);const bored=/chán|mất hứng|không có hứng|trống rỗng|nhạt quá/.test(l);const ashamed=/xấu hổ|hết cứu|vô dụng|tệ thật|lại thất bại/.test(l);const proud=/xong rồi|làm được|vượt|thắng|cuối cùng|tự hào/.test(l);const angry=/bực|cáu|ức|khó chịu|điên/.test(l);
  const repeated=/lại|ngày thứ|mấy hôm|liên tiếp|như trước|vẫn thế|y như cũ/.test(l);const adviceForbidden=/không muốn nghe.*(?:khuyên|cách khắc phục|giải pháp)|đừng khuyên|không cần (?:cách khắc phục|giải pháp)/.test(l);const asksHumor=/làm tôi cười|kể.*vui|đùa.*đi|meme|haha|hehe|😂|🤣/.test(l)&&!ironic;
  const minimizingAchievement=/(?:chỉ|có mỗi|mới có)[^.!?\n]{0,32}\d+(?:[.,]\d+)?\s*(?:phút|giờ|ngày|trang|km|lần|bài|từ)?|\d+(?:[.,]\d+)?\s*(?:phút|giờ|ngày|trang|km|lần|bài|từ)\s*(?:thôi|có vậy)/.test(l);
  const maskedDistress=/(?:^|[,.!?\s])(ổn thôi|không sao|bình thường thôi|cũng được|kệ thôi)(?:$|[,.!?\s])/.test(l);
  const emotionalRisk=/(tuyệt vọng|không muốn sống|muốn chết|tự tử|tự hại|mất người|qua đời|tang|tai nạn|bạo lực|bị đánh|bị lạm dụng|hoảng loạn)/.test(l)?1:(/chia tay|sụp|không chịu nổi/.test(l)?.7:0);
  const correctionSignal=/(không phải|ý tôi là|tôi nói nghiêm túc|đừng đùa|hiểu sai|không đúng ý|không phải ý tôi)/.test(l);
  let surface=socialCall?'đang gọi mọi người':ironic?'tự giễu':exhausted?'mệt':bored?'chán':ashamed?'tự trách':proud?'tự hào':angry?'bực':asksHumor?'muốn nhẹ không khí':'trung tính';
  let underlying=socialCall?'muốn biết có người thật sự đang ở đó và sẵn sàng đáp lại':ironic?'thất vọng được che bằng đùa':repeated&&ashamed?'sợ lặp lại vòng cũ':exhausted?'quá tải, có thể không cần bị sửa ngay':bored?'tụt hứng hoặc cảm giác trống; chưa chắc là lười và chưa chắc cần lời khuyên':proud?'nhẹ nhõm + tự hào':angry?'bất lực hoặc bị cản trở':asksHumor?'muốn kết nối bằng chút vui thay vì phân tích':'chưa chắc; cần nghe kỹ';
  let need:V21ConversationNeed=socialCall?'COMPANY':proud?'CELEBRATION':adviceForbidden?'COMPANY':exhausted?'SPACE':bored?'COMPANY':ashamed||ironic?'VALIDATION':angry?'VENT':asksHumor?'HUMOR':'COMPANY';
  if(/tại sao|làm sao|nên làm gì|cách nào/.test(l)&&!adviceForbidden&&!socialCall)need='ADVICE';
  if(/cà khịa|khích|gáy|đấu|thách/.test(l))need='CHALLENGE';
  if(minimizingAchievement)need='VALIDATION';
  if(correctionSignal)need='VALIDATION';
  return{surfaceEmotion:surface,underlyingEmotion:minimizingAchievement?'có tiến bộ thật nhưng đang hụt so với kỳ vọng nên tự thu nhỏ công sức':maskedDistress?'có thể đang che một trạng thái khó nói bằng câu “ổn/không sao”':underlying,unmetNeed:need,hiddenFear:socialCall?'sợ gọi ra mà cả nhóm vẫn im như một giao diện':repeated?'sợ chuyện này lại thành một mẫu lặp':ashamed?'sợ thất bại nói lên điều xấu về bản thân':'chưa rõ',desiredRecognition:socialCall?'một phản hồi hiện diện, ngắn và thật':minimizingAchievement?'được nhìn thấy cả phần hụt kỳ vọng lẫn phần công sức có thật':proud?'công nhận nỗ lực cụ thể':ashamed?'được hiểu mà không bị giảng':exhausted?'được cho phép hạ nhịp':'được phản ứng đúng mức',selfBlame:ashamed?.78:.18,shame:ashamed?.68:.08,disappointment:(ashamed||ironic||minimizingAchievement)?.74:.22,relief:proud?.72:.1,pride:proud?.68:.1,emotionalCertainty:socialCall?.94:(exhausted||bored||ashamed||proud||angry||minimizingAchievement)?.76:.46,conversationNeed:need,adviceForbidden,socialCall,socialCallStrength:socialCall?(/mọi người|có ai|cả nhà|nhóm/.test(l)?.95:.78):0,repeatedFailure:repeated&&(ashamed||/fail|thất bại|trượt|bỏ/.test(l)),minimizingAchievement,maskedDistress,emotionalRisk,correctionSignal};
};

export const innerLifeContextForNpc=(npcId:string)=>{const n=ensureNpc(npcId);const strongest=Object.entries(n.needs).filter(([k])=>!['energy','stress'].includes(k)).sort((a,b)=>Number(b[1])-Number(a[1])).slice(0,3);const unfinished=n.privateLife.unfinishedBusiness.slice(-3);const project=activeLifeProject(npcId,now());const drive=driveProfileFor(npcId);return{currentProject:project.title,currentActivity:n.privateLife.currentActivity,recentPrivateEvents:n.privateLife.recentPrivateEvents.slice(-4),unfinishedBusiness:unfinished,currentProblem:n.privateLife.currentProblem,strongNeeds:strongest,energy:n.needs.energy,stress:n.needs.stress,defenseStyle:n.defenseStyle,socialRole:n.socialRole,lastDecision:n.lastDecision,humanDrive:drive.coreDrive,pressureMeaning:drive.pressure,failDefiance:drive.failDefiance,winHunger:drive.winHunger,characterConstitution:constitutionPromptBlock(npcId),witRule:'hài đến từ cơ chế hài riêng của đúng nhân vật; không được chỉ thay tên rồi dùng cùng một kiểu joke',rule:'personality changes perception, decision, relationship behavior and silence BEFORE wording; if another NPC could make the same choice and say nearly the same thing, the characterization failed'};};

export const soulPromptContext=(npcId:string,text:string,relationshipScore=30,humorFatigue=0)=>{
  const appraisal=appraiseUserText(text);const mem=recallRelevant(npcId,text,4);const n=ensureNpc(npcId);const userRel=n.relationships['local-user'];const effective=Math.max(relationshipScore/100,userRel?.closeness||0);const warmth=effective>.65?'đủ thân để nói ít mà hiểu nhau':effective>.35?'có lịch sử nhưng vẫn giữ ranh giới':'chưa đủ thân để nói như biết hết người ta';
  const defense=n.defenseStyle;let wont='không biến cảm xúc người kia thành bài học';if(defense==='tease_to_hide_care')wont='không nói thẳng kiểu sến rằng mình rất quan tâm; có thể che sự quan tâm bằng một câu cà khịa nhẹ';if(defense==='competitive_distance')wont='không an ủi kiểu coach; nếu quan tâm thì thể hiện bằng việc vẫn muốn người kia quay lại cuộc chơi';if(defense==='deadpan_care')wont='không phô cảm xúc; quan tâm lộ qua một chi tiết đúng chỗ';
  const connectionPull=clamp(n.needs.social*.55+n.needs.support*.25+n.needs.validation*.2);
  const distancePull=clamp(n.needs.solitude*.55+n.needs.stress*.35+(1-n.needs.energy)*.1);
  const innerConflict=connectionPull>distancePull+.12?'muốn tiến lại gần nhưng vẫn giữ đúng kiểu phòng vệ của mình':distancePull>connectionPull+.12?'có quan tâm nhưng bản thân đang cần khoảng cách/ít lời':'vừa muốn kết nối vừa muốn giữ khoảng cách; có thể chỉ nói một phần';
  const misreadRisk=clamp((1-appraisal.emotionalCertainty)*.55+(effective<.3?.22:.06)+(userRel?.awkwardness||0)*.08-(userRel?.emotionalSafety||0)*.08);
  const mixedFeelings={care:clamp((userRel?.affection||effective)*.65+(userRel?.protectiveness||0)*.35),irritation:userRel?.irritation||0,envy:userRel?.envy||0,awkwardness:userRel?.awkwardness||0,energyToEngage:n.needs.energy,needForDistance:n.needs.solitude};
  const perspectiveTaking=`Nếu mình là người này, với lịch sử đã nhớ và tín hiệu hiện tại, điều đáng chú ý có thể là: ${appraisal.underlyingEmotion}; nhưng độ chắc chỉ ${Math.round(appraisal.emotionalCertainty*100)}%, không được giả vờ đọc được suy nghĩ.`;
  const whatIWantToSay=appraisal.conversationNeed==='VALIDATION'?'một câu cho thấy mình thấy đúng chỗ đau, không biến nó thành bài học':appraisal.conversationNeed==='SPACE'?'ít lời, hạ áp lực, không kéo họ vào một kế hoạch mới':appraisal.conversationNeed==='CELEBRATION'?'công nhận chi tiết cụ thể thay vì hô “tuyệt vời”':appraisal.conversationNeed==='HUMOR'?'làm nhẹ không khí bằng kiểu hài đúng nhân vật, không dùng nỗi đau làm trò':appraisal.conversationNeed==='ADVICE'?'hỏi/đáp đúng phần họ cần, tránh thuyết giảng':'ở đúng nhịp của người kia trước khi cố sửa gì';
  const actionPreference=appraisal.adviceForbidden?'company_or_silence':appraisal.conversationNeed==='SPACE'?'give_space':appraisal.conversationNeed==='CELEBRATION'?'specific_recognition':appraisal.conversationNeed==='CHALLENGE'?'challenge_with_respect':'short_response_or_small_action';
  const expressionPlan=buildSoulExpressionPlanV237({npcId,userText:text,appraisal,closeness:effective,relationship:userRel,residue:n.emotionalResidue,humorFatigue,memoryHint:mem[0]?.content||'',seed:`${npcId}|${text}`});
  return{characterConstitution:constitutionPromptBlock(npcId),appraisal,relevantMemories:mem,defenseStyle:defense,relationshipMeaning:warmth,perspectiveTaking,mixedFeelings,humanDrive:driveProfileFor(npcId),witRule:'chỉ dùng humorMechanics trong characterConstitution; cùng một tình huống hai NPC phải nhận ra thứ khác nhau, muốn điều khác nhau và nói khác nhau',whatIWant:`đáp theo nhu cầu ${appraisal.conversationNeed} mà không cướp quyền tự quyết`,whatIWantToSay,actionPreference,whatIWontSay:wont,whyIWontSay:'ranh giới quan hệ + defense style + trạng thái hiện tại',innerConflict,misreadRisk,repairRule:misreadRisk>.32?'nếu người kia sửa lại ý hoặc phản ứng khó chịu, được thừa nhận hiểu sai/xin lỗi ngắn rồi điều chỉnh':'không giả vờ hiểu tuyệt đối; vẫn giữ chút bất định nếu câu nói mơ hồ',subtextRule:'đừng đọc nhãn cảm xúc ra; để nó lộ qua nhịp câu, điều được nhắc lại, mức gần gũi và điều nhân vật chọn không nói',desiredResponse:appraisal.conversationNeed,SOUL_EXPRESSION_V237:expressionPlan,emotionalResidue:n.emotionalResidue,empathyCalibration:n.empathyCalibration};
};


export const soulFallbackReply=(npcId:string,personaName:string,userText:string,relationshipScore=30,seed='')=>{
  const a=appraiseUserText(userText);
  const n=ensureNpc(npcId);
  const mem=recallRelevant(npcId,userText,3).filter((m:any)=>m?.content&&m.content.trim()!==userText.trim());
  const rel=n.relationships['local-user'];
  const closeness=Math.max(relationshipScore/100,rel?.closeness||0);
  const defense=n.defenseStyle;
  const lower=userText.toLocaleLowerCase('vi-VN');
  const callback=mem.find((m:any)=>m.salience>.48&&m.type!=='emotion');
  const memoryHint=callback?String(callback.content).replace(/\s+/g,' ').slice(0,72):'';
  const repeated=/lại|ngày thứ|mấy hôm|liên tiếp|như trước/.test(lower);
  const pickLine=(xs:string[])=>xs[hash(`${npcId}|${seed}|${userText}|${a.conversationNeed}`)%xs.length];

  const identitySituation = a.socialCall ? 'social_call' : (a.conversationNeed==='VALIDATION'||a.conversationNeed==='VENT'||a.conversationNeed==='SPACE') ? 'serious' : a.conversationNeed==='CELEBRATION' ? 'celebration' : a.conversationNeed==='CHALLENGE' ? 'challenge' : a.conversationNeed==='ADVICE' ? 'advice' : a.conversationNeed==='HUMOR' ? 'humor' : 'neutral';
  const identityReply=personaSituationReply(npcId,identitySituation as any,userText,seed);
  const expressionPlan=buildSoulExpressionPlanV237({npcId,userText,appraisal:a,closeness,relationship:rel,residue:n.emotionalResidue,humorFatigue:0,memoryHint,seed});
  const v237=soulExpressionFallbackV237({npcId,userText,appraisal:a,plan:expressionPlan,seed});

  if(a.socialCall)return identityReply;
  if(v237)return v237;

  // Empathy is expressed by what the character notices, not by "mình hiểu/không sao".
  if(a.surfaceEmotion==='chán'){
    if(!memoryHint)return identityReply;
    if(defense==='self_disclosure')return pickLine([
      `Chán kiểu nào? Kiểu hết pin, hay kiểu mọi thứ tự dưng nhạt đi?`,
      `Có kiểu chán không buồn hẳn, chỉ chẳng muốn chạm vào gì. Hôm nay của ông là kiểu đó à?`
    ]);
    if(defense==='tease_to_hide_care')return pickLine([
      `Tôi định bảo “chán thì đi làm”. Nhưng nghe ngu quá. Chán vì mệt, hay vì có chuyện gì?`,
      `Nay muối để sau. Ông chán cả ngày, hay chỉ chán đúng cái việc đang mắc?`
    ]);
    if(defense==='deadpan_care')return pickLine([
      `“Chán quá” ít dữ liệu thật. Cho tôi thêm một dòng: hết pin hay hết hứng?`,
      `Não đang báo “không có nội dung”. Có chuyện gì xảy ra trước đó không?`
    ]);
    if(defense==='warm_space')return pickLine([
      `Ừ. Không cần làm cái chán biến mất ngay. Nó đang giống mệt, buồn hay trống hơn?`,
      `Tôi ở đây. Chán kiểu muốn yên một lúc, hay muốn có người nói chuyện?`
    ]);
    return pickLine([`Chán kiểu nào? Hết pin, hết hứng, hay có chuyện cứ mắc ở đầu?`,`Có gì xảy ra trước câu “hôm nay chán quá” vậy?`]);
  }

  if(a.conversationNeed==='SPACE'){
    if(!memoryHint)return identityReply;
    if(defense==='tease_to_hide_care')return pickLine([
      `Tôi định cà khịa. Nhưng nghe câu này thì thôi. Chán kiểu hết pin, hay có chuyện cụ thể?`,
      `Nay tôi cất muối. Ông muốn yên một lúc, hay muốn có người ngồi đây nói nhảm?`
    ]);
    if(defense==='deadpan_care')return pickLine([
      `Nghe giống pin đỏ hơn là thiếu ý chí. Muốn yên hay muốn nói thêm một câu?`,
      `Ừ. Não hôm nay có vẻ xin nghỉ phép. Tôi không ép nó họp.`
    ]);
    if(defense==='self_disclosure')return pickLine([
      `Có kiểu chán mà càng cố càng ồn trong đầu. Chán vì hết pin, hay vì một chuyện cứ mắc ở đó?`,
      `Tôi từng có mấy ngày chẳng muốn gọi tên cảm giác gì cả. Nay ông muốn nói, hay chỉ muốn để nó yên?`
    ]);
    if(defense==='warm_space')return pickLine([
      `Nay không cần cứu cả ngày. Muốn yên một lúc thì cứ yên.`,
      `Tôi ở đây. Không cần biến câu “chán quá” thành một kế hoạch mới.`
    ]);
    return pickLine([`Chán kiểu hết pin, hay chán vì có chuyện gì đang mắc lại?`,`Ừ. Nay nói ít thôi cũng được.`]);
  }

  if(a.conversationNeed==='VALIDATION'){
    if(!memoryHint)return identityReply;
    if(repeated)return pickLine([
      `Cái khó chịu chắc không chỉ là hôm nay. Nó giống mấy lần trước quá, đúng không?`,
      `Nghe chữ “lại” là tôi hiểu phần nặng nằm ở đâu rồi. Chuyện hôm nay nhỏ, cái vòng lặp mới khó chịu.`
    ]);
    if(defense==='competitive_distance')return pickLine([
      `Tôi không tính một lần hụt là thua. Nhưng mai có mặt lại.`,
      `Tôi chưa gạch tên ông khỏi cuộc chơi vì một ngày xấu.`
    ]);
    if(defense==='tease_to_hide_care')return pickLine([
      `Tôi có câu cà khịa rồi. Nhưng thôi, câu này nghe không phải lúc để dùng.`,
      `Nay ông tự xử mình đủ rồi. Tôi không góp thêm một chân.`
    ]);
    return pickLine([`Đừng biến một ngày tệ thành bản án cho cả người mình.`,`Nghe như ông đang giận chính mình nhiều hơn giận chuyện vừa xảy ra.`]);
  }

  if(a.conversationNeed==='VENT'){
    if(!memoryHint)return identityReply;
    if(defense==='question_before_judgment')return `Cái làm ông bực nhất là chuyện xảy ra, hay cảm giác mình không điều khiển được nó?`;
    if(defense==='deadpan_care')return `Ừ, vụ này đáng bực thật. Tôi chưa vội chữa nó.`;
    return pickLine([`Kể tiếp đi. Tôi chưa chen giải pháp vào đâu.`,`Ừ. Cứ xả nốt cái phần khó chịu trước đã.`]);
  }

  if(a.conversationNeed==='CELEBRATION'){
    if(!memoryHint)return identityReply;
    if(memoryHint&&closeness>.32)return pickLine([
      `Lần trước còn vật nhau với “${memoryHint}”. Nay câu “xong rồi” nghe khác hẳn.`,
      `Tôi nhớ vụ “${memoryHint}”. Thế nên lần này đáng tính thật.`
    ]);
    const concrete=userText.match(/\b\d+(?:[.,]\d+)?\s*(?:phút|giờ|ngày|trang|km|lần)?\b/i)?.[0];
    if(defense==='competitive_distance')return concrete?`${concrete}. Được. Lần này tôi ghi nhận.`:`Được. Lần này có thứ thật để tính.`;
    if(defense==='tease_to_hide_care')return concrete?`${concrete} cơ à. Tôi đang cố không khen to đây.`:`Ờ… được đấy. Đừng bắt tôi nói lại.`;
    return concrete?`${concrete}. Nhìn nhỏ trên giấy, nhưng tôi biết để có con số này không nhỏ.`:`Ừ, cái “cuối cùng” này nghe có trọng lượng.`;
  }

  if(a.conversationNeed==='HUMOR')return identityReply;


  if(a.conversationNeed==='CHALLENGE')return identityReply;


  if(a.conversationNeed==='ADVICE')return identityReply;


  if(memoryHint&&closeness>.42){
    return pickLine([
      `Câu này làm tôi nhớ vụ “${memoryHint}”. Lần này nó giống hay khác hôm đó?`,
      `Tôi còn nhớ “${memoryHint}”. Nghe hôm nay có chút cùng một mùi.`
    ]);
  }

  if(identityReply)return identityReply;
  if(defense==='observe_then_one_sentence')return `Nghe câu này tôi chưa muốn kết luận gì cả. Có gì xảy ra trước đó?`;
  if(defense==='tease_to_hide_care')return `Tôi đang phân vân nên cà khịa hay hỏi thật. Thôi hỏi thật: có chuyện gì?`;
  if(defense==='deadpan_care')return `Đã đọc. Tôi cần thêm một dòng nữa trước khi giả vờ mình hiểu.`;
  return `Chuyện này với ông đang nặng ở chỗ nào nhất?`;
};

export const followUpReplyV237=(npcId:string,originalText:string,seed='')=>followUpLineV237(npcId,originalText,seed);

export const queueUserPostReactions=(post:{id:string;content:string;createdAt?:string;targetPostId?:string},personas:any[],npcRecord:Record<string,any>)=>mutate(s=>{
  if((s.queuedUserPostIds||[]).includes(post.id))return;
  s.queuedUserPostIds=[...(s.queuedUserPostIds||[]),post.id].slice(-200);
  const at=post.createdAt?new Date(post.createdAt).getTime():now();
  const appraisal=appraiseUserText(post.content);
  const serious=appraisal.conversationNeed==='SPACE'||appraisal.conversationNeed==='VALIDATION'||appraisal.conversationNeed==='VENT';
  const lowMood=appraisal.surfaceEmotion==='chán'||appraisal.surfaceEmotion==='mệt'||appraisal.surfaceEmotion==='tự trách'||appraisal.surfaceEmotion==='bực';
  const directCall=Boolean(appraisal.socialCall);
  const needsCare=serious||lowMood;
  const situation = directCall ? 'social_call' : serious||lowMood ? 'serious' : appraisal.conversationNeed==='CELEBRATION' ? 'celebration' : appraisal.conversationNeed==='CHALLENGE' ? 'challenge' : appraisal.conversationNeed==='ADVICE' ? 'advice' : appraisal.conversationNeed==='HUMOR' ? 'humor' : 'neutral';
  const commentCandidates:Array<{p:any;n:V21NpcRuntime;score:number;delay:number;prob:number}>=[];
  const likeCandidates:Array<{p:any;n:V21NpcRuntime;score:number;delay:number;prob:number}>=[];
  const rememberCandidates:Array<{p:any;n:V21NpcRuntime;score:number;delay:number;prob:number}>=[];

  for(const p of personas){
    const n=s.npc[p.id]||(s.npc[p.id]=makeNpc(p.id));const legacy=npcRecord[p.id]||{};tickNeeds(n,at,legacy);
    const identityBias=personaDecisionBias(p.id,situation as any);
    const relation=clamp(Math.max(Number(legacy.relationship||25)/100,n.relationships['local-user']?.closeness||0));
    const roleCare=/nghe kỹ|giữ không gian|hiểu comeback|thực tế/.test(n.socialRole)?.12:0;
    const presenceFit=clamp(n.needs.energy*.18+n.needs.social*.2+(1-n.needs.solitude)*.12);
    const careNotice=needsCare?(roleCare+.055):0;
    const callNotice=directCall?.55+.18*presenceFit:0;
    const sawChance=clamp(.08+relation*.26+n.needs.social*.1+n.needs.curiosity*.06+careNotice+callNotice+identityBias.notice*.22-n.needs.solitude*.1);
    if(rnd(`${post.id}|${p.id}|saw`)>sawChance){n.lastDecision='ignore_unseen';continue;}

    const supportFit=needsCare?clamp(n.needs.support*.25+roleCare+(lowMood?.035:0)):0;
    const celebrateFit=appraisal.conversationNeed==='CELEBRATION'?.14:0;
    const callFit=directCall?clamp(.48+relation*.18+presenceFit*.28):0;
    const commentP=clamp(.025+relation*.2+supportFit+celebrateFit+callFit+identityBias.notice*.16+(appraisal.conversationNeed==='ADVICE'?.04:0)-n.needs.solitude*(directCall?.07:.2)-n.needs.stress*(directCall?.06:.14));
    const likeP=post.targetPostId?0:clamp(.11+relation*.36+celebrateFit+(directCall?-.08:0)-n.needs.solitude*.11);
    const rememberP=clamp(.22+relation*.22+appraisal.emotionalCertainty*.16+(needsCare?.1:0)+(directCall?.08:0));
    const commentDesire=commentP*(.7+rnd(`${post.id}|${p.id}|comment-score`)*.62);
    const likeDesire=likeP*(.7+rnd(`${post.id}|${p.id}|like-score`)*.6);
    const rememberDesire=rememberP*(.7+rnd(`${post.id}|${p.id}|remember-score`)*.6);
    const closeFast=relation>.58||supportFit>.14;
    const minComment=directCall?5_000:needsCare&&closeFast?90_000:needsCare?3*60_000:2*60_000;
    const spreadComment=directCall?38_000:needsCare&&closeFast?12*60_000:needsCare?38*60_000:105*60_000;
    const commentDelay=minComment+rnd(`${post.id}|${p.id}|comment-delay`)*spreadComment;
    const likeDelay=45_000+rnd(`${post.id}|${p.id}|like-delay`)*28*60_000;
    const rememberDelay=20_000+rnd(`${post.id}|${p.id}|remember-delay`)*8*60_000;
    if(commentDesire>(directCall?.04:.105))commentCandidates.push({p,n,score:commentDesire,delay:commentDelay,prob:commentP});
    if(likeDesire>.12)likeCandidates.push({p,n,score:likeDesire,delay:likeDelay,prob:likeP});
    if(rememberDesire>.2)rememberCandidates.push({p,n,score:rememberDesire,delay:rememberDelay,prob:rememberP});
  }

  // A direct “có ai không?” is a social call, not an ordinary post. Ensure one believable person notices it,
  // while still avoiding the whole village answering in chorus.
  if(directCall&&commentCandidates.length===0&&personas.length){
    const ranked=personas.map((p:any)=>{const n=s.npc[p.id]||(s.npc[p.id]=makeNpc(p.id));const legacy=npcRecord[p.id]||{};const relation=clamp(Math.max(Number(legacy.relationship||25)/100,n.relationships['local-user']?.closeness||0));const identity=personaDecisionBias(p.id,'social_call');return{p,n,score:relation*.38+n.needs.energy*.18+n.needs.social*.13-n.needs.solitude*.12+identity.notice*.43};}).sort((a:any,b:any)=>b.score-a.score);
    const best=ranked[0];if(best)commentCandidates.push({...best,delay:8_000+rnd(`${post.id}|guaranteed-call`)*24_000,prob:.96});
  }

  commentCandidates.sort((a,b)=>b.score-a.score);likeCandidates.sort((a,b)=>b.score-a.score);rememberCandidates.sort((a,b)=>b.score-a.score);
  const maxComments=directCall?(rnd(`${post.id}|second-call-reply`)<.32?2:1):(appraisal.conversationNeed==='CELEBRATION'?2:1);
  const selectedComments=new Set(commentCandidates.slice(0,maxComments).map(x=>x.p.id));
  const selectedLikes=new Set(likeCandidates.slice(0,post.targetPostId?0:(directCall?2:4)).map(x=>x.p.id));
  const selectedRemember=new Set(rememberCandidates.slice(0,5).map(x=>x.p.id));

  for(const p of personas){
    const n=s.npc[p.id]||(s.npc[p.id]=makeNpc(p.id));const c=commentCandidates.find(x=>x.p.id===p.id);const l=likeCandidates.find(x=>x.p.id===p.id);const r=rememberCandidates.find(x=>x.p.id===p.id);
    const doComment=selectedComments.has(p.id)&&!!c;const doLike=selectedLikes.has(p.id)&&!!l;const doRemember=selectedRemember.has(p.id)&&!!r;
    if(!doComment&&!doLike&&!doRemember){if(n.lastDecision!=='ignore_unseen')n.lastDecision='ignore';continue;}
    n.lastDecision=doComment?(directCall?'answering_social_call':'comment_later'):doLike?'like_later':'remember_only';
    if(doLike&&l)s.pending.push({id:`pa-${hash(`${post.id}|${p.id}|like`)}`,postId:post.id,npcId:p.id,kind:'like',earliestAt:at+l.delay,expiresAt:at+24*3600000,motivation:'noticed the post',probability:l.prob,createdAt:at,stimulusText:post.content,stimulusId:post.id});
    if(doComment&&c)s.pending.push({id:`pa-${hash(`${post.id}|${p.id}|comment`)}`,postId:post.targetPostId||post.id,npcId:p.id,kind:'comment',earliestAt:at+c.delay,expiresAt:at+36*3600000,motivation:directCall?'social_call':`conversation_need:${appraisal.conversationNeed}`,probability:c.prob,createdAt:at,stimulusText:post.content,stimulusId:post.id});
    if(doRemember&&r)s.pending.push({id:`pa-${hash(`${post.id}|${p.id}|remember`)}`,postId:post.targetPostId||post.id,npcId:p.id,kind:'remember',earliestAt:at+r.delay,expiresAt:at+18*3600000,motivation:'salient memory',probability:r.prob,createdAt:at,stimulusText:post.content,stimulusId:post.id});
  }
  s.pending=s.pending.filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(-180);
});

export const queueNpcPostReactions=(event:{id:string;npcId:string;kind:string;tier:number;createdAt:string},postId:string,personas:any[],npcRecord:Record<string,any>)=>mutate(s=>{
  if((s.queuedNpcPostIds||[]).includes(postId))return;
  s.queuedNpcPostIds=[...(s.queuedNpcPostIds||[]),postId].slice(-220);
  const created=new Date(event.createdAt).getTime()||now();
  const author=s.npc[event.npcId]||(s.npc[event.npcId]=makeNpc(event.npcId));
  for(const p of personas){if(!p||p.id===event.npcId)continue;const actor=s.npc[p.id]||(s.npc[p.id]=makeNpc(p.id));const rel=actor.relationships[event.npcId]||(actor.relationships[event.npcId]=baseRelationship(`${p.id}|${event.npcId}`));const legacy=npcRecord[p.id]?.socialEmotions?.[event.npcId]||{};const affinity=clamp(rel.closeness*.22+rel.affection*.2+rel.respect*.13+rel.playfulness*.14-rel.irritation*.05+Number(legacy.affection||0)*.08+Number(legacy.respect||0)*.06);const identity=characterConstitutionFor(p.id);const sawP=clamp(.08+affinity*.42+(event.tier>=4?.14:0)+actor.needs.curiosity*.06+identity.publicity*.18-actor.needs.solitude*.1);const seed=`${event.id}|${p.id}|npc-post`;if(rnd(seed+'saw')>sawP){actor.lastDecision='ignore_unseen';continue;}const delay=(3+Math.floor(rnd(seed+'delay')*220))*60000;const likeP=clamp(.16+affinity*.58);const commentP=clamp(.035+affinity*.27+rel.playfulness*.08+(event.kind==='relationship'||event.kind==='banter' ? .1 : 0)-actor.needs.solitude*.14-actor.needs.stress*.1);const shouldLike=rnd(seed+'like')<likeP;const shouldComment=rnd(seed+'comment')<commentP;if(!shouldLike&&!shouldComment)actor.lastDecision='ignore';else if(shouldComment)actor.lastDecision='comment_later';else actor.lastDecision='like_later';if(shouldLike)s.pending.push({id:`pa-${hash(seed+'like')}`,postId,npcId:p.id,kind:'like',earliestAt:created+delay*.45,expiresAt:created+36*3600000,motivation:`saw ${event.npcId} post`,probability:likeP,createdAt:created});if(shouldComment)s.pending.push({id:`pa-${hash(seed+'comment')}`,postId,npcId:p.id,kind:'comment',earliestAt:created+delay,expiresAt:created+48*3600000,motivation:`relationship_to:${event.npcId}`,probability:commentP,createdAt:created});}
  author.privateLife.lastPublicActionAt=Math.max(author.privateLife.lastPublicActionAt,created);s.pending=s.pending.filter((x,i,a)=>a.findIndex(y=>y.id===x.id)===i).slice(-180);
});

export const drainDueUserReactions=(at=now())=>{const s=loadV21State();const due=s.pending.filter(a=>a.earliestAt<=at&&a.expiresAt>=at);s.pending=s.pending.filter(a=>a.earliestAt>at&&a.expiresAt>=at);saveV21State(s);return due;};

export const planEventReactions=(event:{id:string;npcId:string;kind:string;tier:number;createdAt:string},personas:any[],npcRecord:Record<string,any>,at:number)=>{
  const authorId=event.npcId;const created=new Date(event.createdAt).getTime();const commenters:string[]=[];const likers:string[]=[];
  for(const p of personas){if(p.id===authorId)continue;const s=loadV21State();const actor=s.npc[p.id]||(s.npc[p.id]=makeNpc(p.id));const rel=actor.relationships[authorId]||(actor.relationships[authorId]=baseRelationship(`${p.id}|${authorId}`));const legacy=npcRecord[p.id]?.socialEmotions?.[authorId]||{};const affinity=clamp(rel.affection*.24+rel.closeness*.2+rel.playfulness*.15+Number(legacy.affection||0)*.12+Number(legacy.respect||0)*.08);const visibility=clamp(.16+affinity*.46+(event.tier>=4?.18:0));const seed=`${event.id}|${p.id}`;
    if(rnd(seed+'seen')>visibility)continue;const delay=(3+Math.floor(rnd(seed+'delay')*210))*60000;if(created+delay>at)continue;
    if(rnd(seed+'like')<clamp(.22+affinity*.5))likers.push(p.id);
    if(rnd(seed+'comment')<clamp(.06+affinity*.24+(event.kind==='relationship'||event.kind==='banter' ? .12 : 0)-(actor.needs.solitude*.12)))commenters.push(p.id);
  }
  return{likers:likers.slice(0,8),commenters:commenters.slice(0,2)};
};

export const recordNpcInteraction=(npcId:string,userText:string,replyText:string,sourceId:string)=>{
  const appraisal=appraiseUserText(userText);memoriesFromUserText(npcId,userText,sourceId);remember(npcId,{type:'relationship',subject:'tương tác với user',content:`User nói: ${userText.slice(0,120)} | NPC đáp: ${replyText.slice(0,120)}`,salience:.5,emotionalWeight:appraisal.emotionalCertainty*.6,confidence:.78,decayHalfLifeHours:360,sourceId});
  updateRelationship(npcId,'local-user',{closeness:.012,trust:(appraisal.conversationNeed==='VALIDATION'||appraisal.conversationNeed==='VENT' ? .012 : .006),affection:.008,emotionalSafety:appraisal.adviceForbidden?.01:.004},'một tương tác thật với user');
  if(/haha|hehe|cà khịa|muối|gáy|:D|😂|🤣|đùa/i.test(`${userText} ${replyText}`))remember(npcId,{type:'inside_joke',subject:'mẩu đùa chung',content:`${userText.slice(0,80)} ↔ ${replyText.slice(0,90)}`,salience:.58,emotionalWeight:.46,confidence:.7,decayHalfLifeHours:480,sourceId});

  // V23.7: emotion has inertia. A caring/awkward/irritated residue survives the current comment
  // and becomes part of the next perception instead of resetting to a fresh mood tag.
  mutate(s=>{
    const n=s.npc[npcId]||(s.npc[npcId]=makeNpc(npcId));ensureV237Runtime(n);const r=n.emotionalResidue!;const at=now();
    const serious=['VALIDATION','VENT','SPACE'].includes(appraisal.conversationNeed)||Number(appraisal.emotionalRisk||0)>.55;
    if(serious){r.worry=clamp(r.worry+.18);r.tenderness=clamp(r.tenderness+.12);r.protectiveness=clamp(r.protectiveness+.1);r.warmth=clamp(r.warmth+.05);r.lastCause=`user từng nói “${userText.slice(0,70)}”`; }
    if(appraisal.surfaceEmotion==='bực'){r.worry=clamp(r.worry+.07);r.irritation=clamp(r.irritation+.04);r.lastCause=`user đang bực vì “${userText.slice(0,60)}”`; }
    if(appraisal.conversationNeed==='CELEBRATION'){r.admiration=clamp(r.admiration+.16);r.warmth=clamp(r.warmth+.1);r.lastCause=`user vừa có một tiến bộ: “${userText.slice(0,65)}”`; }
    if(appraisal.correctionSignal){r.guilt=clamp(r.guilt+.24);r.awkwardness=clamp(r.awkwardness+.16);r.worry=clamp(r.worry+.06);r.lastCause='vừa nhận ra mình có thể đã hiểu sai user';n.empathyCalibration!.misreadCount+=1;n.empathyCalibration!.lastMisreadAt=at;n.empathyCalibration!.note='user vừa sửa cách NPC hiểu câu chuyện; lần sau giảm certainty và hỏi trước';}
    if(appraisal.correctionSignal&&/(xin lỗi|lỗi tôi|hiểu sai|đọc sai|sai giả thuyết|reset)/i.test(replyText)){r.guilt=clamp(r.guilt-.12);r.awkwardness=clamp(r.awkwardness-.08);r.tenderness=clamp(r.tenderness+.05);n.empathyCalibration!.repairCount+=1;n.empathyCalibration!.lastRepairAt=at;n.empathyCalibration!.note='đã repair bằng cách nhận sai ngắn và điều chỉnh';}
    r.updatedAt=at;

    const rel=n.relationships['local-user'];const plan=buildSoulExpressionPlanV237({npcId,userText,appraisal,closeness:rel?.closeness||0,relationship:rel,residue:r,seed:`${sourceId}|followup-plan`});
    const followChance=Number(appraisal.emotionalRisk||0)>.72?.82:appraisal.repeatedFailure?.62:.46;
    if(plan.followUpCandidate && !appraisal.correctionSignal && rnd(`${sourceId}|${npcId}|v237-followup-chance`)<followChance){
      const [lo,hi]=plan.followUpDelayMinutes;const mins=lo+Math.floor(rnd(`${sourceId}|${npcId}|v237-followup`)*Math.max(1,hi-lo));
      const id=`pa-${hash(`${sourceId}|${npcId}|v237-check-in`)}`;
      if(!s.pending.some(x=>x.id===id))s.pending.push({id,postId:sourceId,npcId,kind:'comment',earliestAt:at+mins*60000,expiresAt:at+18*3600000,motivation:'v237_check_in',probability:.72,createdAt:at,stimulusText:userText,stimulusId:sourceId});
    }
    s.pending=s.pending.slice(-220);
  });
};

export const mergeWorldTopics=(topics:V21WorldTopic[])=>mutate(s=>{
  const by=new Map((s.topics||[]).filter(t=>looksVietnameseClientText(`${t.title} ${t.summary}`)&&Number(t.storyValue||0)>=.58).map(t=>[t.id,t]));for(const t of topics){if(!looksVietnameseClientText(`${t.title} ${t.summary}`)||Number(t.storyValue||0)<.58)continue;const old=by.get(t.id);by.set(t.id,old?{...old,...t,firstSeenAt:old.firstSeenAt||t.firstSeenAt,lastUpdatedAt:Math.max(old.lastUpdatedAt,t.lastUpdatedAt)}:t);}s.topics=[...by.values()].filter(t=>now()-t.lastUpdatedAt<5*86400000&&Number(t.storyValue||0)>=.58).sort((a,b)=>(Number(b.storyValue||0)*.5+b.importance*.2+b.heat*.12+b.confidence*.12+b.momentum*.06)-(Number(a.storyValue||0)*.5+a.importance*.2+a.heat*.12+a.confidence*.12+a.momentum*.06)).slice(0,24);s.lastWorldSyncAt=now();
});
export const getWorldTopics=()=>loadV21State().topics;
export const propagateWorldKnowledge=(fromId:string,toId:string,topicId:string,reason='nghe từ một người quen')=>mutate(s=>{
  const from=s.npc[fromId]||(s.npc[fromId]=makeNpc(fromId));const to=s.npc[toId]||(s.npc[toId]=makeNpc(toId));const source=from.worldKnowledge[topicId];if(!source)return;const old=to.worldKnowledge[topicId];const at=now();const transferredAwareness=clamp(Math.max(old?.awareness||0,source.awareness*.62));const transferredUnderstanding=clamp(Math.max(old?.understanding||0,source.understanding*.42));const prior=old?.stance??0;const influence=(source.stance-prior)*.18*(to.relationships[fromId]?.trust??.45);const stance=clamp(prior+influence,-1,1);to.worldKnowledge[topicId]={awareness:transferredAwareness,understanding:transferredUnderstanding,interest:Math.max(old?.interest||0,source.interest*.55),stance,discoveredAt:old?.discoveredAt||at,lastDiscussedAt:old?.lastDiscussedAt||0,stanceHistory:[...(old?.stanceHistory||[]),{at,stance,reason}].slice(-8)};
});

export const expertForTopic=(personas:any[],category:string)=>{let best=personas[0],score=-1;for(const p of personas){const interest=V21_INTERESTS[p.id]?.[category]||0;const behavior=V21_INFO_BEHAVIOR[p.id];const s=interest*.72+(behavior?.newsConsumption||.4)*.12+(behavior?.curiosity||.5)*.1+(behavior?.skepticism||.5)*.06;if(s>score){score=s;best=p;}}return best;};

export const getWorldContextForNpc=(npcId:string,limit=3)=>{const s=loadV21State();return [...s.topics].map(t=>({t,score:(V21_INTERESTS[npcId]?.[t.category]||.08)*.5+t.heat*.25+t.confidence*.2+t.momentum*.05})).sort((a,b)=>b.score-a.score).slice(0,limit).map(x=>`${x.t.title} — ${x.t.summary.slice(0,180)} [${x.t.category}; heat ${Math.round(x.t.heat*100)}%; verified=${x.t.verified}; sources=${x.t.sourceNames.join(', ')}]`).join(' | ');};

export const syncWorldAwareness=async(bridge:any)=>{
  const s=loadV21State();if(now()-s.lastWorldSyncAt<25*60000)return s.topics;if(!bridge?.requestApi)return s.topics;
  try{const result=await bridge.requestApi('/api/world-awareness',{locale:'vi-VN',maxTopics:24});const topics=Array.isArray(result?.body?.topics)?result.body.topics:[];const clean:V21WorldTopic[]=topics.filter((x:any)=>x&&x.id&&x.title&&looksVietnameseClientText(`${x.title} ${x.summary||''}`)&&Number(x.storyValue??0)>=.58).map((x:any)=>({id:String(x.id),title:String(x.title).slice(0,220),category:String(x.category||'culture'),summary:String(x.summary||'').slice(0,500),facts:Array.isArray(x.facts)?x.facts.map(String).filter(looksVietnameseClientText).slice(0,6):[],sourceNames:Array.isArray(x.sourceNames)?x.sourceNames.map(String).slice(0,5):[],sourceUrls:Array.isArray(x.sourceUrls)?x.sourceUrls.map(String).slice(0,5):[],firstSeenAt:Number(x.firstSeenAt||now()),lastUpdatedAt:Number(x.lastUpdatedAt||now()),heat:clamp(Number(x.heat||.5)),momentum:clamp(Number(x.momentum||.3),-1,1),importance:clamp(Number(x.importance||.5)),controversy:clamp(Number(x.controversy||.2)),confidence:clamp(Number(x.confidence||.5)),verified:Boolean(x.verified),storyValue:clamp(Number(x.storyValue||0)),curiosity:clamp(Number(x.curiosity||0)),consequence:clamp(Number(x.consequence||0)),whyItMatters:String(x.whyItMatters||'').slice(0,260),language:'vi'}));mergeWorldTopics(clean);return clean;}catch{return s.topics;}
};

export const openOrAdvanceThread=(actors:string[],title:string,beat:string,tensionDelta=.08)=>mutate(s=>{const key=[...actors].sort().join('|')+'|'+title.toLocaleLowerCase('vi-VN').slice(0,60);const id=`th-${hash(key)}`;let th=s.threads.find(x=>x.id===id);if(!th){th={id,title,actors:[...actors],tension:.2,state:'open',startedAt:now(),updatedAt:now(),beats:[]};s.threads.push(th);}th.beats=[...th.beats,beat].slice(-12);th.tension=clamp(th.tension+tensionDelta);th.updatedAt=now();if(th.tension<.12)th.state='resolved';else if(tensionDelta<0)th.state='repairing';s.threads=s.threads.filter(x=>x.state!=='resolved'||now()-x.updatedAt<3*86400000).slice(-40);});

export const getStoryContextForNpc=(npcId:string,limit=3)=>loadV21State().threads.filter(t=>t.actors.includes(npcId)&&t.state!=='resolved').sort((a,b)=>b.updatedAt-a.updatedAt).slice(0,limit).map(t=>`${t.title} [${t.state}; tension ${Math.round(t.tension*100)}%]: ${t.beats.slice(-3).join(' → ')}`).join(' | ');

const ambientTextFor=(n:V21NpcRuntime,persona:any,at:number,seed:string):V21AmbientMoment=>{
  const project=activeLifeProject(n.id,at);const drive=driveProfileFor(n.id);const roll=rnd(seed+'kind');const step=pick(project.steps,seed+'step');const fail=pick(project.fails,seed+'fail');const win=pick(project.wins,seed+'win');const name=String(persona?.name||'Người này');
  let kind:V21AmbientMoment['kind']='life';let text='';let signal=.42;let hook='việc riêng';
  if(roll<.30){
    kind='small_fail';signal=.74+rnd(seed+'signal')*.16;hook='vướng nhưng chưa buông';
    const choice=pick([`Vẫn quay lại gỡ vì ${drive.failDefiance}.`,`Đang đổi cách làm chứ chưa đổi mục tiêu; ${drive.pressure}.`,`Tạm lùi 10 phút cho bớt cay rồi quay lại. ${capVi(drive.failDefiance)}.`],seed+'choice');
    text=personaAmbientVoice(n.id,'small_fail',`${name} vừa ${fail}`,seed); text+=` ${choice}`;n.privateLife.currentProblem=fail;n.needs.stress=clamp(n.needs.stress+.055);n.needs.achievement=clamp(n.needs.achievement+.035);
  }else if(roll<.62){
    kind='small_win';signal=.72+rnd(seed+'signal')*.17;hook='có đà';
    const hunger=pick([`Chưa dừng ở đó; ${drive.winHunger}.`,`Cái đáng giá là đã phải lì qua đoạn mắc trước đó. ${capVi(drive.winHunger)}.`,`Không ăn mừng to. Đang tranh thủ đà này làm thêm một chút.`],seed+'hunger');
    text=personaAmbientVoice(n.id,'small_win',`${name} ${win}`,seed); text+=` ${hunger}`;n.needs.achievement=clamp(n.needs.achievement-.07);n.needs.play=clamp(n.needs.play+.025);
  }else{
    signal=.40+rnd(seed+'signal')*.14;hook='đang dồn sức';
    text=personaAmbientVoice(n.id,'life',`${name} đang ${step}`,seed);
  }
  n.privateLife.currentActivity=`${project.title}: ${step}`;n.privateLife.recentPrivateEvents=[...n.privateLife.recentPrivateEvents,`${project.title}: ${text}`].slice(-12);
  return{id:`am-${hash(`${n.id}|${Math.floor(at/60000)}|${text}`)}`,npcId:n.id,text,kind,at,signal,hook};
};

const v235WorldQuip=(npcId:string,seed:string)=>{
  const lines:Record<string,string[]>={
    'hm-hai':['Tiêu đề thì nóng. Hải đang xem phần nào thật sự đáng nóng.','Đọc xong vẫn chưa biết nên wow hay nên “ờ rồi sao”.'],
    'hm-tram':['Trâm chưa nói nhiều; đang tìm chi tiết khiến chuyện này thật sự đáng nhớ.','Nếu mai vẫn còn đáng nghĩ, Trâm mới coi đó là tin chứ không phải tiếng ồn.'],
    'hm-mai':['Mai bảo: “Trend mà sống qua cuối tuần rồi tính.”','Mai đang cố phân biệt tin nóng với tin được hâm nóng.'],
    'hm-phuc':['Phúc đã định share ngay, rồi nhớ mình từng share nhầm. Tiến bộ có thật.','Tin thì mới. Khả năng Phúc đọc hết trước khi bình luận cũng đang mới.'],
    'hm-son':['Sơn chỉ hỏi một câu: chuyện này thay đổi cuộc chơi ở đâu?','Ồn thì chưa tính điểm. Hệ quả mới tính.'],
    'hm-tu':['Tú đang mắc ở chữ “tại sao”, nên chưa chịu chốt.','Một câu trả lời vừa sinh thêm ba dấu hỏi. Đúng gu Tú.'],
    'hm-ken':['Tiêu đề nói “đột phá”. Ken nói “đưa test case đây”.','Ken đang tìm đoạn quảng cáo quên kể về giới hạn.'],
    'hm-maya':['Maya đang xem chuyện này ảnh hưởng người thật thế nào, không chỉ ảnh hưởng bảng tin.','Tin đủ lớn để bàn, chưa chắc đủ gần để hoảng.'],
    'hm-k':['K đang tách fact khỏi phần mọi người đang tự thêm gia vị.','Pattern có vẻ hay. Bằng chứng đang được gọi lên bàn.'],
    'hm-leo':['Leo nhìn hệ quả trước, tiêu đề sau.','Nếu không đổi được quyết định nào, với Leo nó chưa phải đòn.'],
    'hm-aiko':['Aiko đọc xong cười: “Internet lại có thêm một thứ phải theo kịp.”','Aiko đang xem tin này giúp mình tiến lên hay chỉ giúp mình bận thêm.'],
    'hm-nora':['Nora hỏi: “Rồi việc này làm mình đổi quyết định gì?”','Nếu chỉ khiến timeline dài hơn, Nora xin phép cắt.']
  };
  return pick(lines[npcId]||['Đang đọc thêm trước khi có ý kiến.'],`${npcId}|worldquip|${seed}`);
};

const worldMomentFor=(n:V21NpcRuntime,persona:any,topic:V21WorldTopic,at:number,seed:string):V21AmbientMoment=>{
  const name=String(persona?.name||'Một người trong nhóm');const why=String(topic.whyItMatters||topic.summary||'').replace(/\s+/g,' ').trim().slice(0,190);const category=topic.category==='ai'?'AI':topic.category==='technology'?'công nghệ':topic.category==='sports'?'thể thao':topic.category==='science'?'khoa học':topic.category==='gaming'?'game':topic.category==='finance'?'kinh tế':topic.category==='psychology'?'tâm lý':topic.category==='entertainment'?'giải trí':'chuyện đang nổi';
  const lead=pick([`${name} vừa dừng lại ở một tin ${category} đủ lớn để ngẩng đầu khỏi việc đang làm`,`${name} kéo một chuyện ${category} vào nhóm vì lần này nó có hệ quả thật`,`${name} đang đọc kỹ một tin ${category}; không phải vì nó hot, mà vì nó chạm đúng thứ mình quan tâm`],seed+'lead');
  const reaction=v235WorldQuip(n.id,seed);
  return{id:`am-${hash(seed+'world'+topic.id)}`,npcId:n.id,text:`${lead}: “${topic.title.slice(0,150)}”. ${why?`${why} `:''}${reaction}`,kind:'world',at,topicId:topic.id,signal:clamp(Number(topic.storyValue||.65)),hook:'tin đáng bàn'};
};

export const heartbeatLivingSociety=(personas:any[],npcRecord:Record<string,any>,at=now())=>mutate(s=>{
  const previous=Number(s.lastHeartbeatAt||0);const first=!previous||!(s.ambientMoments||[]).length;const elapsed=previous?Math.max(0,at-previous):2*3600000;
  const slots=first?3:Math.min(3,Math.floor(elapsed/(18*60_000)));if(slots<=0){s.lastHeartbeatAt=at;return;}
  const generated:V21AmbientMoment[]=[];let worldUsed=false;let relationUsed=false;
  for(let i=0;i<slots;i++){
    const momentAt=first?at-(10+i*24+Math.floor(rnd(`seed|${i}|${at}`)*10))*60_000:Math.min(at,(previous||at-elapsed)+(i+1)*(elapsed/(slots+1)));
    const ranked=personas.map((p:any)=>{const n=s.npc[p.id]||(s.npc[p.id]=makeNpc(p.id));tickNeeds(n,momentAt,npcRecord[p.id]||{});const gap=Math.min(1,(momentAt-(n.privateLife.lastPrivateTick||0))/(6*3600000));const identity=characterConstitutionFor(p.id);return{p,n,score:n.needs.achievement*.16+n.needs.curiosity*.13+n.needs.social*.08+n.needs.stress*.07+gap*.1+identity.publicity*.24+rnd(`${momentAt}|${p.id}|ambient`)*.28};}).sort((a:any,b:any)=>b.score-a.score);
    const chosen=ranked.find((x:any)=>!generated.some(m=>m.npcId===x.p.id))||ranked[0];if(!chosen)continue;const {p,n}=chosen;const seed=`${p.id}|${Math.floor(momentAt/600000)}|heartbeat`;
    let moment:V21AmbientMoment|undefined;const topic=weightedTopicFor(p.id,s.topics,seed);
    if(!worldUsed&&topic&&Number(topic.storyValue||0)>=.64&&rnd(seed+'world')<.24){moment=worldMomentFor(n,p,topic,momentAt,seed);worldUsed=true;n.privateLife.currentActivity=`đang đọc thêm về ${topic.title.slice(0,72)}`;}
    else if(!relationUsed&&rnd(seed+'relation')<.24&&personas.length>1){
      const others=personas.filter((x:any)=>x?.id&&x.id!==p.id);const partner=others[hash(seed+'partner')%Math.max(1,others.length)];const partnerName=String(partner?.name||'một người trong nhóm');const partnerN=s.npc[partner?.id]||(partner?.id?makeNpc(partner.id):undefined);const rel=partner?.id?(n.relationships[partner.id]||(n.relationships[partner.id]=baseRelationship(`${p.id}|${partner.id}`))):undefined;
      const chemistry=partner?.id&&rel&&rel.playfulness>.58?personaPairChemistryLine(p.id,partner.id,'banter',activeLifeProject(p.id,momentAt).title,seed):'';
      const lines=rel&&rel.irritation>.48?[`${p.name} thấy ${partnerName} online nhưng chưa nhắn. Chuyện hôm trước vẫn còn hơi cấn.`,`${p.name} gõ một câu cho ${partnerName}, rồi xóa đi. Chưa phải lúc nói chuyện.`]:chemistry?[chemistry]:rel&&rel.playfulness>.58?[`${p.name} thấy ${partnerName} đang vật với việc riêng nên thả đúng một câu cà khịa rồi biến mất.`,`${p.name} gửi ${partnerName} một câu chỉ hai người hiểu. ${partnerName} chỉ thả reaction.`]:[`${p.name} hỏi ${partnerName} một câu về chuyện đang làm dở. Hai người nói đúng vài dòng rồi ai về việc nấy.`,`${p.name} thấy ${partnerName} hơi im nên nhắn “ổn không?”. Chưa có câu trả lời.`];
      moment={id:`am-${hash(seed+'rel'+partner?.id)}`,npcId:p.id,text:pick(lines,seed+'relline'),kind:'relationship',at:momentAt,relatedNpcId:partner?.id,signal:.62+rnd(seed+'relsig')*.16,hook:'quan hệ'};relationUsed=true;
      if(partnerN&&rel)rel.updatedAt=momentAt;
    }else moment=ambientTextFor(n,p,momentAt,seed);
    if(moment&&Number(moment.signal||0)>=.58)generated.push(moment);
  }
  s.ambientMoments=[...generated,...(s.ambientMoments||[]).filter(m=>Number(m.signal||0)>=.58&&(!m.topicId||s.topics.some(t=>t.id===m.topicId)))].sort((a,b)=>b.at-a.at).filter((m,i,a)=>a.findIndex(x=>x.id===m.id)===i).filter(m=>at-m.at<72*3600000).slice(0,36);
  s.lastHeartbeatAt=at;s.qualityVersion=238;
});

export const getAmbientMoments=(limit=10)=>loadV21State().ambientMoments.filter(m=>Number(m.signal||0)>=.58).slice(0,limit);

const residueAsideFor=(npcId:string,r?:V237EmotionalResidue)=>{
  if(!r)return '';
  const worry:Record<string,string>={'hm-hai':'Vẫn nhớ chuyện ai đó mệt lúc nãy. Định hỏi, nhưng chưa muốn hỏi dồn.','hm-tram':'Có một câu lúc nãy vẫn còn nằm trong đầu. Chưa chắc cần nhắc lại ngay.','hm-mai':'Muối vẫn mở nắp, nhưng có một người trong nhóm hôm nay được miễn.','hm-phuc':'Một “hồ sơ” cảm xúc vẫn đang mở. Lần này Phúc không vội biện hộ hộ ai.','hm-son':'Có một người vừa mất nhịp. Sơn chưa gạch tên khỏi bảng.','hm-tu':'Một câu lúc nãy còn thiếu dữ kiện. Tú đang cố không hỏi dồn.','hm-ken':'Một signal xấu vẫn còn trong log. Ken chưa spam ping.','hm-maya':'Vẫn để ý một người đang cạn pin, nhưng không muốn biến quan tâm thành giám sát.','hm-k':'Một chi tiết trong câu chuyện lúc nãy vẫn chưa khớp. K chưa kết luận.','hm-leo':'Một đối thủ vừa hụt nhịp. Leo vẫn giữ chỗ trong trận.','hm-aiko':'Chữ “lại” của ai đó lúc nãy vẫn còn hơi ám. Aiko biết cảm giác đó.','hm-nora':'Một việc cảm xúc vẫn mở, nhưng Nora nhất quyết không biến nó thành thêm năm task.'};
  const irritated:Record<string,string>={'hm-hai':'Còn hơi quê/cay nên joke hôm nay chạy nhanh hơn bình thường.','hm-tram':'Còn hơi cấn. Vì thế câu nào cũng ngắn hơn một chút.','hm-mai':'Còn hơi cay. Hũ muối đang được dùng có kiểm soát.','hm-phuc':'Bộ phận bào chữa đang muốn lên tiếng; bộ phận kiểm toán chưa cho.','hm-son':'Còn khó chịu. Nên Sơn đang để con số nói thay.','hm-tu':'Có một giả định của người khác Tú chưa nuốt trôi.','hm-ken':'Một bug xã hội chưa đóng ticket.','hm-maya':'Còn hơi căng nên Maya đang giảm lịch trước khi giảm kiên nhẫn.','hm-k':'Một mảnh không khớp vẫn đang bị thẩm vấn.','hm-leo':'Còn cay một round. Lời nói vì thế ít đi.','hm-aiko':'Hơi bực chính mình, nên self-roast đang có nguy cơ quá liều.','hm-nora':'Một scope creep xã hội chưa được duyệt.'};
  const admiring:Record<string,string>={'hm-hai':'Đang hơi nể một người trong nhóm. Nhất quyết chưa khen cho tử tế.','hm-tram':'Có một tiến bộ nhỏ của ai đó Trâm vẫn nhớ rõ hơn chính người đó.','hm-mai':'Có người vừa làm tốt. Mai đang vật lộn với việc khen mà không bị sến.','hm-phuc':'Bằng chứng của ai đó vừa đủ mạnh để phòng bào chữa phải im.','hm-son':'Có một con số khiến Sơn nể. Khen sẽ rất ngắn.','hm-tu':'Một kết quả mới làm Tú phải sửa giả thuyết theo hướng tốt hơn.','hm-ken':'Có thứ vừa pass test thật. Ken đang cố không gọi nó “hay” quá sớm.','hm-maya':'Có người vừa thắng mà không tự đốt mình. Maya thích kiểu thắng đó.','hm-k':'Một pattern tốt vừa sống sót qua phản chứng.','hm-leo':'Một đối thủ vừa khiến Leo bắt đầu nhìn bảng kỹ hơn.','hm-aiko':'Một comeback của ai đó làm Aiko vui hộ hơi nhiều.','hm-nora':'Một người vừa làm ít hơn mà đúng hơn. Nora đánh giá cao việc đó.'};
  if((r.guilt||0)>.42)return 'Vẫn hơi ngượng vì một lần hiểu sai. Lần tới sẽ hỏi trước khi kết luận.';
  if((r.worry||0)>.46)return worry[npcId]||'Vẫn còn để ý một chuyện lúc nãy.';
  if((r.irritation||0)>.48)return irritated[npcId]||'Còn hơi cấn nên đang ít lời.';
  if((r.admiration||0)>.5)return admiring[npcId]||'Đang hơi nể một người trong nhóm.';
  return '';
};

export const getNpcPresenceCard=(npcId:string,_legacy:any={},at=now())=>{
  const s=loadV21State();const n=s.npc[npcId]||makeNpc(npcId);ensureV237Runtime(n);const project=activeLifeProject(npcId,at);const last=(s.ambientMoments||[]).find(m=>m.npcId===npcId&&Number(m.signal||0)>=.58);const min=last?Math.max(1,Math.round((at-last.at)/60000)):null;
  const drive=driveProfileFor(npcId);const mood=driveMoodFor(n,last);
  const presence=n.needs.energy<.30?'hơi cạn pin':n.needs.solitude>.78?'đang ít lời':mood;
  const fallbackBeat=pick(project.steps,`${npcId}|${Math.floor(at/3600000)}|presence-step`);
  const baseDetail=last?.text||`đang ${fallbackBeat}`;
  const voiced=presenceVoiceForPersona(npcId,project.title,baseDetail,last?.kind||'life',`${npcId}|${Math.floor(at/3600000)}|presence-v237`);
  const detail=voiced.detail;
  const aside=residueAsideFor(npcId,n.emotionalResidue)||voiced.inner;
  return{presence,lastSeenText:min===null?'có mặt rải rác':min<2?'vừa có động tĩnh':min<60?`${min} phút trước`:min<1440?`${Math.round(min/60)} giờ trước`:`${Math.round(min/1440)} ngày trước`,project:project.title,detail,currentActivity:n.privateLife.currentActivity,signal:Number(last?.signal||0),drive:voiced.status,aside,mood:voiced.mask};
};

export const getV21DebugSnapshot=()=>loadV21State();
