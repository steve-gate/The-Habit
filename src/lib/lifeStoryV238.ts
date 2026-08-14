export type DreamStatus = 'forming'|'active'|'doubting'|'paused'|'abandoned'|'transformed'|'achieved';
export type DreamVisibility = 'public'|'close_friends'|'secret';
export type GoalStatus = 'active'|'paused'|'completed'|'abandoned';
export type LifeArcType = 'personal'|'relationship'|'world';
export type LifeArcStatus = 'active'|'paused'|'resolved'|'abandoned';
export type StoryBeatType = 'attempt'|'progress'|'failure'|'discovery'|'conflict'|'decision'|'avoidance'|'repair'|'breakthrough'|'consequence';

export interface LifeDreamV238 {
  id:string;
  publicDescription:string;
  privateMeaning:string;
  visibility:DreamVisibility;
  status:DreamStatus;
  priority:number;
  progress:number;
  startedAt:number;
  lastChangedAt:number;
  history:Array<{at:number;status:DreamStatus;reason:string}>;
}

export interface LifeGoalV238 {
  id:string;
  dreamId:string;
  title:string;
  whyItMatters:string;
  emotionalMeaning:string;
  target:string;
  progress:number;
  confidence:number;
  obstacles:string[];
  currentStrategy:string;
  sacrifices:string[];
  relatedHabits:string[];
  status:GoalStatus;
  startedAt:number;
  deadlineAt?:number;
  attempts:number;
  failures:number;
  wins:number;
}

export interface StoryBeatV238 {
  id:string;
  arcId:string;
  npcId:string;
  type:StoryBeatType;
  private:boolean;
  actors:string[];
  happenedAt:number;
  event:string;
  consequence:string;
  emotionalImpact:string;
  signal:number;
  relatedTopicId?:string;
  relatedNpcId?:string;
}

export interface LifeArcV238 {
  id:string;
  type:LifeArcType;
  ownerNpcId:string;
  title:string;
  theme:string;
  desire:string;
  obstacle:string;
  stakes:string;
  currentPhase:string;
  startedAt:number;
  expectedDurationDays:number;
  progress:number;
  tension:number;
  relatedNpcIds:string[];
  openLoops:string[];
  importantMemories:string[];
  beatIds:string[];
  lastBeat?:StoryBeatV238;
  status:LifeArcStatus;
  dreamId?:string;
  goalId?:string;
  topicId?:string;
}

export interface NpcLifeStoryV238 {
  npcId:string;
  dreams:LifeDreamV238[];
  goals:LifeGoalV238[];
  arcIds:string[];
  privateTruths:string[];
  publicSelfStory:string;
  lastLifeTickAt:number;
  lastMeaningfulBeatAt:number;
  chapter:number;
}

export interface LifeStoryStateV238 {
  version:238;
  npcs:Record<string,NpcLifeStoryV238>;
  arcs:Record<string,LifeArcV238>;
  beats:StoryBeatV238[];
  lastHeartbeatAt:number;
  qualityVersion:238;
}

export interface LifeStoryTopicLike {
  id:string;
  title:string;
  category?:string;
  storyValue?:number;
  importance?:number;
  whyItMatters?:string;
}

type DreamBlueprint={publicDescription:string;privateMeaning:string;visibility:DreamVisibility;priority:number};
type GoalBlueprint={dream:number;title:string;whyItMatters:string;emotionalMeaning:string;target:string;obstacles:string[];strategy:string;sacrifices:string[];relatedHabits:string[];durationDays:number};
type StoryBlueprint={arcTitle:string;theme:string;desire:string;obstacle:string;stakes:string;phases:string[];attempts:string[];progress:string[];failures:string[];discoveries:string[];avoidance:string[];breakthroughs:string[];consequences:string[]};
type LifeBlueprint={dreams:DreamBlueprint[];goals:GoalBlueprint[];story:StoryBlueprint;publicSelfStory:string;privateTruths:string[];worldInterests:string[]};

const KEY='habit_mosaic_life_story_v238';
const now=()=>Date.now();
const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
const hash=(v:string)=>{let h=2166136261;for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619);}return Math.abs(h>>>0)};
const rnd=(seed:string)=>hash(seed)/4294967295;
const pick=<T,>(items:T[],seed:string)=>items[Math.floor(rnd(seed)*items.length)%Math.max(1,items.length)];
const DAY=86_400_000;

const B:Record<string,LifeBlueprint>={
  'hm-hai':{
    dreams:[
      {publicDescription:'tự làm ra một video mà mình thật sự dám khoe',privateMeaning:'muốn thôi là người chỉ xem người khác làm giỏi rồi quay sang đùa cho đỡ cảm giác mình chưa đủ giỏi',visibility:'close_friends',priority:.94},
      {publicDescription:'có một nhóm bạn mà được phép quê, fail rồi quay lại',privateMeaning:'sợ lúc mình dở nhất thì người khác sẽ chỉ thấy mình là đứa nói nhiều',visibility:'secret',priority:.61},
    ],
    goals:[
      {dream:0,title:'hoàn thành video cá nhân đầu tiên',whyItMatters:'muốn có một thứ đi từ ý tưởng tới file export bằng chính tay mình',emotionalMeaning:'tự trọng nghề nghiệp',target:'một video hoàn chỉnh đủ để gửi cho người khác xem',obstacles:['sợ sản phẩm nhìn nghiệp dư','quay xe khi gặp đoạn kỹ thuật khó','đùa để né cảm giác mình chưa biết'],strategy:'làm một đoạn xấu nhưng thật trước, sửa từng nút sau',sacrifices:['bớt xem tutorial vô tận','chịu để bản đầu chưa đẹp'],relatedHabits:['chỉnh màu','video','học kỹ năng'],durationDays:30},
      {dream:0,title:'đăng một sản phẩm mà không xóa giữa chừng',whyItMatters:'hoàn thành thôi chưa đủ; Hải muốn chịu được cảm giác người khác nhìn thấy sản phẩm của mình',emotionalMeaning:'can đảm bị đánh giá',target:'đăng hoặc gửi video cho ít nhất một người thật',obstacles:['sợ bị chê','cầu toàn sau khi export'],strategy:'gửi cho một người thân trước rồi mới công khai',sacrifices:['bỏ quyền sửa vô hạn'],relatedHabits:['đăng video','sáng tạo'],durationDays:21},
    ],
    story:{arcTitle:'Video đầu tiên không quay xe',theme:'học cách ở lại với một việc sau lúc thấy mình vụng',desire:'tạo ra thứ mình thật sự tự hào',obstacle:'cầu toàn cộng với phản xạ quay xe khi thấy ngu',stakes:'nếu lại bỏ, Hải sẽ càng tin rằng mình chỉ giỏi nói; nếu đi tới cùng, cách Hải nhìn chính mình đổi thật',phases:['bắt đầu rất hăng','đụng đoạn khó','quê nhưng chưa bỏ','bắt đầu có tay nghề','đứng trước nút “đăng”'],attempts:['ngồi chỉnh lại skin tone thêm một lần thay vì mở tutorial mới','tự dựng một đoạn 20 giây từ đầu để biết mình thật sự làm được gì','đóng bớt tab và chỉ sửa đúng một lỗi đang ngứa mắt'],progress:['bản mới đỡ hẳn cảm giác “phim tận thế”; Hải mở đi mở lại vì lần này nhìn ra tay mình trong đó','sửa được đoạn từng làm mình quay xe hôm trước; việc đầu tiên là lưu một bản riêng vì sợ lát nữa phá tiếp','tự phát hiện lỗi trước khi tutorial chỉ ra; Hải hơi khoái nhưng giả vờ bình thường'],failures:['ngồi gần nửa tiếng rồi phát hiện chỉnh nhầm layer; Hải cười một câu nhưng đóng máy hơi mạnh','export xong mới thấy màu da lệch ở đúng cảnh mình tự tin nhất','sửa một lỗi rồi sinh hai lỗi mới; Hải bắt đầu gõ “thôi mai” nhưng chưa bấm gửi'],discoveries:['nhận ra mình xem tutorial nhiều hơn thời gian đặt tay vào project','phát hiện đoạn mình ghét nhất lại là đoạn dạy mình nhiều nhất','nhận ra thứ làm mình trì hoãn không phải thiếu kỹ thuật mà là sợ bản đầu trông nghiệp dư'],avoidance:['mở YouTube “xem đúng một video tham khảo” rồi suýt trôi mất cả buổi','đi pha nước dù cốc vẫn còn nửa cốc; chính Hải cũng biết mình đang né'],breakthroughs:['lần đầu export một đoạn mà không lập tức muốn xóa','gửi bản nháp cho một người khác xem trước khi kịp đổi ý'],consequences:['Mai thấy bản mới và không cà khịa ngay; Hải giả vờ không để ý chuyện đó','Hải bắt đầu nói “video của tôi” thay vì “cái project thử thôi”']},
    publicSelfStory:'đang học làm video cho ra hồn, miệng vẫn nhanh hơn tay nhưng khoảng cách đang ngắn lại',privateTruths:['rất cần được công nhận nhưng ghét xin lời khen','càng thấy mình vụng càng đùa nhiều'],worldInterests:['ai','technology','entertainment','video']
  },
  'hm-tram':{
    dreams:[
      {publicDescription:'đủ giỏi tiếng Nhật để một ngày tự đi Nhật mà không sợ mình đứng ngoài cuộc',privateMeaning:'thật ra Trâm muốn chứng minh mình có thể theo một thứ khó tới cùng sau vài lần đã bỏ giữa đường',visibility:'close_friends',priority:.91},
      {publicDescription:'viết được một thứ của riêng mình mà không cần ai công nhận ngay',privateMeaning:'muốn tin rằng sự tiến bộ nhỏ vẫn có giá trị dù không ai nhìn thấy',visibility:'secret',priority:.58},
    ],
    goals:[
      {dream:0,title:'đi qua phần N3 từng bỏ dở',whyItMatters:'đây là đúng chỗ Trâm từng biến mất; quay lại được sẽ có ý nghĩa hơn điểm số',emotionalMeaning:'niềm tin vào khả năng đi tới cùng',target:'duy trì học đủ lâu để vượt qua chương từng bỏ',obstacles:['mệt sau giờ làm','xấu hổ khi quay lại bài cũ','cảm giác tiến quá chậm'],strategy:'mỗi ngày một mẩu nhỏ có bằng chứng, không bù quá mức',sacrifices:['chấp nhận ngày học 15 phút','không so mình với người học nhanh'],relatedHabits:['tiếng Nhật','N3','nghe','ngữ pháp'],durationDays:45},
      {dream:1,title:'viết 500 chữ mỗi tuần cho dự án cá nhân',whyItMatters:'muốn để suy nghĩ của mình có hình dạng thay vì chỉ nằm trong đầu',emotionalMeaning:'quyền được tạo ra thứ chưa hoàn hảo',target:'500 chữ/tuần trong bốn tuần',obstacles:['tự sửa quá sớm','sợ câu chữ tầm thường'],strategy:'viết xấu trước, sửa sau một ngày',sacrifices:['bớt thời gian đọc thêm'],relatedHabits:['viết','dự án'],durationDays:28},
    ],
    story:{arcTitle:'Lần này không biến mất ở N3',theme:'đi chậm mà không tự xấu hổ vì đi chậm',desire:'đến một ngày nghe hiểu và tự bước vào một nơi xa lạ bằng chính khả năng của mình',obstacle:'mệt, tự phán xét và ký ức đã bỏ một lần',stakes:'mỗi lần quay lại bài cũ đều chạm vào câu hỏi “mình có thật sự theo được thứ khó không?”',phases:['nhặt lại nhịp','gặp đúng chương cũ','một ngày biến mất','quay lại mà không bù','bắt đầu tin mình sẽ đi qua'],attempts:['nghe lại đúng đoạn hôm qua thay vì tìm bài dễ hơn','đọc hai trang rồi ghi đúng một câu mình hiểu','mở phần ngữ pháp từng né và làm đúng một ví dụ'],progress:['lần đầu bắt được một câu audio mà tối qua nghe ba lần vẫn trôi','đọc hết hai trang mà không mở điện thoại; Trâm không đăng gì nhưng đánh dấu ngày này','nhận ra một mẫu ngữ pháp ngoài đời trước khi kịp dịch sang tiếng Việt'],failures:['mở sách ra rồi ngồi nhìn chữ lâu hơn học; Trâm đóng lại sớm và hơi xấu hổ','bỏ hẳn một ngày sau chuỗi tốt; chuyện khó chịu nhất là nó giống lần trước','nghe sai một đoạn mình tưởng đã quen và tự nhiên mất sạch hứng'],discoveries:['nhận ra ngày mệt mà vẫn làm 10 phút giúp mình hơn một buổi bù 2 tiếng','phát hiện mình sợ cảm giác “lại bỏ” hơn bản thân bài N3','hiểu rằng tiến bộ nghe không đến theo cảm giác; nó lộ ra ở một câu tự nhiên bỗng nghe được'],avoidance:['dọn bàn học rất kỹ nhưng chưa mở bài','đọc review giáo trình mới thay vì quay lại chương đang mắc'],breakthroughs:['quay lại sau một ngày trượt mà không tự bắt mình học bù','hoàn thành đúng chương từng bỏ dở lần trước'],consequences:['Aiko nhắc chuyện comeback và Trâm lần đầu kể rằng mình từng bỏ N3','Trâm bắt đầu nói “khi mình đi Nhật” thay vì “nếu có ngày đi”']},
    publicSelfStory:'đang quay lại tiếng Nhật theo kiểu ít nhưng không biến mất',privateTruths:['sợ nhất không phải khó mà là cảm giác mình lại bỏ','rất dễ nhớ tiến bộ của người khác nhưng xem nhẹ tiến bộ của mình'],worldInterests:['education','psychology','culture','japan']
  },
  'hm-mai':{
    dreams:[
      {publicDescription:'làm ra thứ của riêng mình và đủ gan để người khác nhìn thấy',privateMeaning:'Mai rất muốn được công nhận nhưng ghét cảm giác mình cần lời công nhận đó',visibility:'close_friends',priority:.93},
      {publicDescription:'sống ít bị ánh mắt người khác dắt mũi hơn',privateMeaning:'muốn tự do nhưng đôi khi sự “không quan tâm” chỉ là áo giáp',visibility:'secret',priority:.73},
    ],
    goals:[
      {dream:0,title:'đăng một clip ngắn mà không xóa',whyItMatters:'đây là bài test xem Mai có chịu được cảm giác bị nhìn thấy hay không',emotionalMeaning:'can đảm và tự trọng',target:'đăng một clip và để nguyên ít nhất 72 giờ',obstacles:['sợ bị chê','cầu toàn phần nhỏ','hay giả vờ “không cần”'],strategy:'chốt deadline, đăng bản đủ tốt, không xem số liệu ngay',sacrifices:['bỏ một vòng sửa cuối','chịu cảm giác không kiểm soát phản ứng người xem'],relatedHabits:['clip','video','sáng tạo'],durationDays:21},
      {dream:1,title:'giữ lịch tập ba buổi/tuần mà không biến nó thành cuộc chiến tự ghét mình',whyItMatters:'Mai muốn mạnh hơn nhưng không muốn mỗi lần trượt lại dùng muối với chính mình',emotionalMeaning:'tôn trọng bản thân',target:'3 buổi/tuần trong 6 tuần',obstacles:['mặc cả sau giờ làm','all-or-nothing'],strategy:'buổi ngắn vẫn tính',sacrifices:['bỏ tiêu chuẩn “đã tập thì phải nặng”'],relatedHabits:['gym','tập','sức khỏe'],durationDays:42},
    ],
    story:{arcTitle:'Đăng rồi đừng xóa',theme:'muốn được nhìn thấy nhưng sợ bị nhìn thấy',desire:'cho một thứ của mình tồn tại ngoài đầu và ngoài máy',obstacle:'sợ phán xét được che bằng cà khịa và vẻ “không cần”',stakes:'nếu lại xóa, Mai củng cố chiếc áo giáp; nếu để clip sống, cô ấy học chịu được ánh mắt người khác',phases:['làm clip như thể chỉ cho vui','bắt đầu thấy nó có chút hay','đứng trước nỗi sợ đăng','đăng rồi muốn xóa','học chịu để nó ở đó'],attempts:['cắt thêm 30 giây dù đã định bỏ','chọn một nhạc nền rồi cấm mình đổi lần thứ sáu','gửi bản nháp cho Hải xem mà nói “xem hộ lỗi thôi”'],progress:['có một đoạn Mai xem lại hai lần mà không tìm ra lý do để chê','chịu để một cảnh hơi vụng thay vì xóa cả project','đặt caption xong rồi để đó, không sửa tiếp'],failures:['mất 20 phút đổi font rồi tự bực vì đang né phần thật sự khó','render xong phát hiện lỗi chính tả đúng chỗ to nhất','xóa bản nháp khỏi thư mục chia sẻ rồi năm phút sau mở thùng rác'],discoveries:['nhận ra mình hay nói “không quan tâm” đúng lúc quan tâm nhất','phát hiện lời chê tưởng tượng trong đầu to hơn bất kỳ lời chê thật nào','thấy mình dùng cà khịa để giành lại cảm giác kiểm soát'],avoidance:['chỉnh thumbnail dù clip còn chưa xong','đi xem clip người khác “lấy cảm hứng” rồi tự so mình'],breakthroughs:['đăng bản chưa hoàn hảo trước khi kịp thương lượng thêm với chính mình','để clip online qua đêm dù đã mở nút xóa hai lần'],consequences:['Hải nhớ ba lần Mai từng xóa và không cho cô giả vờ đây là chuyện nhỏ','Mai nhận một lời khen rồi mất gần một phút mới trả lời “ừ, biết rồi”']},
    publicSelfStory:'đang làm một clip và tỏ ra nó không quan trọng hơi quá mức đáng ngờ',privateTruths:['cần được công nhận hơn vẻ ngoài','cà khịa mạnh nhất khi thấy mình sắp mềm'],worldInterests:['entertainment','ai','video','culture']
  },
  'hm-phuc':{
    dreams:[{publicDescription:'trở thành người có bằng chứng hành động, không chỉ một bộ lý do rất thuyết phục',privateMeaning:'sợ người khác nhìn ra mình thông minh trong giải thích nhưng không đủ lì để làm',visibility:'close_friends',priority:.9},{publicDescription:'chơi guitar đủ để một ngày đàn trọn một bài cho bạn bè nghe',privateMeaning:'muốn có một kỹ năng vui mà không biến nó thành dự án tối ưu hóa',visibility:'public',priority:.46}],
    goals:[{dream:0,title:'xây nhịp tập trung 45 phút',whyItMatters:'muốn chứng minh mình có thể ngồi với một việc đủ lâu để tạo ra kết quả',emotionalMeaning:'tự tin vào khả năng hành động',target:'một block 45 phút mỗi ngày làm việc',obstacles:['tab mới','lý do hợp lý','thích chuẩn bị'],strategy:'đóng tab trước, timer chạy, ghi đúng một lý do bị ngắt',sacrifices:['bỏ cảm giác phải chuẩn bị hoàn hảo'],relatedHabits:['tập trung','deep work'],durationDays:30},{dream:1,title:'chơi trọn một bài guitar không dừng',whyItMatters:'muốn có một thứ làm vì thích chứ không phải vì hiệu suất',emotionalMeaning:'niềm vui không cần biện hộ',target:'một bài hoàn chỉnh',obstacles:['đau tay','bỏ sau lỗi cũ'],strategy:'10 phút/ngày, ghi âm tuần một lần',sacrifices:['chấp nhận nghe mình chơi dở'],relatedHabits:['guitar'],durationDays:45}],
    story:{arcTitle:'Đóng phòng bào chữa, mở timer',theme:'từ giải thích rất hay sang bằng chứng thật',desire:'có một ngày nhìn lịch sử làm việc và không cần biện hộ',obstacle:'trí óc tạo lý do quá nhanh',stakes:'mỗi block hoàn thành làm câu chuyện “tôi chỉ giỏi nói” yếu đi',phases:['thiết kế hệ thống','bị tab mới phục kích','tự bắt quả tang','xây được nhịp','không còn cần tranh luận mỗi lần bắt đầu'],attempts:['đóng hết tab trước khi bấm timer','ghi ra giấy một lý do đang muốn trì hoãn rồi bắt đầu luôn','làm một block mà cấm tối ưu hệ thống giữa chừng'],progress:['ngồi hết một block mà không đi lạc sang YouTube','bắt đầu đúng giờ trước khi có cảm hứng','tự dừng một tab ngoài lề sau chưa đầy một phút'],failures:['mở tab tra một thứ rồi biến mất 18 phút','đặt timer xong quên bấm bắt đầu','dành cả block để chỉnh app quản lý block'],discoveries:['nhận ra mình thích cảm giác chuẩn bị vì nó giống làm mà ít rủi ro hơn','phát hiện chỉ cần bắt đầu 5 phút là phần lớn lý do mất sức thuyết phục'],avoidance:['đi tìm phương pháp Pomodoro mới dù phương pháp cũ chưa dùng đủ ba ngày','sắp xếp desktop rất có trách nhiệm vào đúng giờ phải làm'],breakthroughs:['hoàn thành ba block liên tiếp trong ba ngày mà không đổi hệ thống','tự cười một lý do rồi vẫn bắt đầu'],consequences:['Mai bắt đầu gọi mỗi block hoàn thành là “một luật sư mất việc”','Phúc có ít chuyện để giải thích hơn và thấy hơi trống']},
    publicSelfStory:'đang cố biến sự thông minh trong biện hộ thành sự đều đặn trong hành động',privateTruths:['xấu hổ khi lý do nghe quá hay mà kết quả bằng không','rất thích được người khác bắt bài theo cách không làm mình mất mặt'],worldInterests:['productivity','psychology','technology']
  },
  'hm-son':{
    dreams:[{publicDescription:'trở thành kiểu người mà chính mình cũng không viện lý do được',privateMeaning:'Sơn sợ nhất chuyện hình ảnh “kỷ luật” của mình chỉ đứng được khi mọi thứ thuận lợi',visibility:'close_friends',priority:.96},{publicDescription:'một ngày chạy được một mốc mà hiện tại nghe hơi quá sức',privateMeaning:'muốn có một con số khách quan để nhìn lại và biết mình đã đổi',visibility:'public',priority:.72}],
    goals:[{dream:1,title:'chạy 5 km dưới mốc tự đặt',whyItMatters:'con số này là bằng chứng riêng, không cần ai vỗ tay',emotionalMeaning:'năng lực và tự trọng',target:'5 km dưới mốc cá nhân',obstacles:['khởi đầu quá nhanh','thiếu ngủ','cứng đầu khi cơ thể báo mệt'],strategy:'pace đầu chậm hơn, ngủ đủ, ghi split',sacrifices:['bỏ một vài buổi cố chứng minh'],relatedHabits:['chạy','5km'],durationDays:56},{dream:0,title:'giữ bốn buổi sức mạnh/tuần với form sạch',whyItMatters:'Sơn muốn kỷ luật đủ thật để biết khi nào phải giảm tạ',emotionalMeaning:'kỷ luật không phải sĩ diện',target:'4 buổi/tuần trong 8 tuần',obstacles:['ham thêm set','khó chấp nhận giảm tạ'],strategy:'ghi form và RPE, không chỉ trọng lượng',sacrifices:['bỏ vài con số đẹp'],relatedHabits:['gym','sức mạnh'],durationDays:56}],
    story:{arcTitle:'Mốc không biết nịnh',theme:'kỷ luật đủ thật để chịu cả ngày tệ',desire:'chạm một mốc không thể tranh luận bằng lời',obstacle:'cứng với bản thân đến mức đôi lúc biến kỷ luật thành sĩ diện',stakes:'nếu học được cách giữ nhịp thay vì chỉ ép, Sơn sẽ mạnh thật hơn hình ảnh của mình',phases:['đặt mốc','đuổi quá nhanh','học pace','hụt mốc sát nút','thử lại không phô trương'],attempts:['chạy easy đúng nghĩa thay vì biến buổi easy thành bài thi','đi ngủ sớm hơn để giữ lời với buổi sáng','ghi split thật dù con số không đẹp'],progress:['giữ được pace đều hơn tuần trước','dừng đúng lúc khi form bắt đầu xấu','hụt mốc nhưng khoảng cách nhỏ hơn rõ rệt'],failures:['lao quá nhanh hai km đầu rồi trả lãi ở cuối','hụt mốc đúng vài giây và khó chịu cả buổi','cố thêm set để giữ sĩ diện rồi phải giảm mạnh set sau'],discoveries:['nhận ra “chịu đựng nhiều hơn” không phải lúc nào cũng bằng “tập tốt hơn”','thấy ngày nghỉ đúng lúc giúp con số tiến nhanh hơn'],avoidance:['định đổi mục tiêu vì hụt sát mốc rồi tự bắt quả tang','không muốn kể buổi tệ vì sợ mất hình ảnh'],breakthroughs:['chịu chạy chậm một tuần và lần thử sau tốt hơn hẳn','đạt mốc nhưng chỉ nói “được rồi” vì trong đầu đã có mốc mới'],consequences:['Leo bắt đầu coi Sơn là đối thủ có thật chứ không chỉ người nói cứng','Sơn học khen người comeback nhiều hơn người thắng dễ']},
    publicSelfStory:'đang săn một mốc chạy; bảng điểm rất thật và cái tôi đang học cách sống chung với nó',privateTruths:['rất sợ bị xem là chỉ nói cứng','kính nể comeback hơn chiến thắng dễ'],worldInterests:['sports','science','health']
  },
  'hm-tu':{
    dreams:[{publicDescription:'tự làm ra một thứ nhỏ chạy được và hiểu vì sao nó chạy',privateMeaning:'Tú muốn chứng minh sự tò mò của mình có thể kết thúc bằng một sản phẩm chứ không chỉ thêm tab',visibility:'close_friends',priority:.9},{publicDescription:'hiểu đủ sâu một lĩnh vực để giải thích lại bằng lời của mình',privateMeaning:'sợ chấp nhận câu trả lời tiện vì mình lười nghĩ',visibility:'public',priority:.72}],
    goals:[{dream:0,title:'hoàn thành một side project nhỏ',whyItMatters:'muốn đóng được vòng từ câu hỏi tới thứ chạy thật',emotionalMeaning:'năng lực tạo ra',target:'một bản dùng được với 3 chức năng cốt lõi',obstacles:['mở rộng scope','đọc docs vô hạn','đổi kiến trúc sớm'],strategy:'đóng một issue nhỏ trước khi mở câu hỏi mới',sacrifices:['chấp nhận thiết kế chưa đẹp'],relatedHabits:['code','side project'],durationDays:35},{dream:1,title:'đọc trọn một paper khó và tự tóm tắt',whyItMatters:'muốn biết mình hiểu thật hay chỉ quen từ khóa',emotionalMeaning:'trung thực trí tuệ',target:'một bản tóm tắt một trang bằng lời riêng',obstacles:['tra quá nhiều khái niệm','đi lạc sang paper khác'],strategy:'giới hạn ba tab phụ',sacrifices:['chịu có chỗ “chưa hiểu”'],relatedHabits:['đọc','paper'],durationDays:14}],
    story:{arcTitle:'Đóng một issue trước khi mở tab thứ bảy',theme:'biến tò mò thành thứ hoàn thành được',desire:'có một project đủ nhỏ để tự hiểu từ đầu tới cuối',obstacle:'mỗi câu trả lời sinh thêm ba câu hỏi hấp dẫn hơn',stakes:'nếu scope cứ nở, Tú sẽ lại có nhiều hiểu biết rời mà không có thứ hoàn chỉnh',phases:['ý tưởng rất sáng','scope bắt đầu nở','cắt bớt','đóng issue đầu','chạm bản dùng được'],attempts:['viết lại đúng phần bug đang né','chốt ba chức năng cốt lõi rồi khóa danh sách','ghi câu hỏi ra file để khỏi mở tab ngay'],progress:['fix được bug tưởng phải đập đi làm lại','đóng một issue nhỏ và không tự thưởng bằng cách mở issue lớn hơn','chạy được flow đầu tiên từ đầu tới cuối'],failures:['sửa lỗi A xong sinh lỗi B','đọc docs 40 phút mà chưa chạm code','refactor một phần đang chạy thành phần chưa chạy'],discoveries:['nhận ra câu hỏi hay không nhất thiết phải trả lời ngay','phát hiện mình đang dùng “muốn hiểu kỹ” để né việc ship'],avoidance:['mở một paper liên quan rồi quên project đang ở đâu','đổi tên biến rất đẹp trong lúc chức năng vẫn lỗi'],breakthroughs:['đóng feature đầu tiên mà không viết lại kiến trúc','cho một người khác thử bản chưa hoàn hảo'],consequences:['Ken bắt đầu test project thật thay vì chỉ nghe Tú kể','Tú có lần đầu nói “cái tôi làm” thay vì “ý tưởng tôi đang nghĩ”']},
    publicSelfStory:'đang kéo một side project ra khỏi mê cung tab và câu hỏi',privateTruths:['rất sợ hiểu nông','thích câu hỏi đến mức đôi lúc dùng nó để né quyết định'],worldInterests:['ai','technology','science','research']
  },
  'hm-ken':{
    dreams:[{publicDescription:'xây được một công cụ thật sự tiết kiệm thời gian ngoài đời',privateMeaning:'Ken ghét hype vì rất sợ chính mình bị lời hứa đẹp làm mất khả năng phán đoán',visibility:'close_friends',priority:.91},{publicDescription:'trở thành người mà nhóm có thể đưa một thứ “hay lắm” cho và nhận lại câu “chạy thật không?”',privateMeaning:'muốn được tin cậy mà không phải trở nên ồn ào',visibility:'secret',priority:.65}],
    goals:[{dream:0,title:'làm một automation nhỏ chạy ổn một tuần',whyItMatters:'muốn có bằng chứng công cụ thật sự cứu thời gian',emotionalMeaning:'sự tin cậy',target:'7 ngày chạy không cần sửa tay',obstacles:['tool mới hấp dẫn','overengineering','edge case vô tận'],strategy:'test trên một việc thật, log lỗi, không thêm feature giữa tuần',sacrifices:['bỏ cảm giác phải hỗ trợ mọi edge case'],relatedHabits:['automation','AI','code'],durationDays:21},{dream:0,title:'đánh giá một AI tool bằng test case thật',whyItMatters:'muốn phân biệt demo tốt với công cụ sống được',emotionalMeaning:'trung thực kỹ thuật',target:'5 test case có tiêu chí rõ',obstacles:['hype','bias thích tool mới'],strategy:'ghi pass/fail trước khi viết cảm nhận',sacrifices:['chịu bỏ tool dù đã setup lâu'],relatedHabits:['AI','test'],durationDays:10}],
    story:{arcTitle:'Tool phải sống qua thứ Hai',theme:'đừng để hype thắng test thật',desire:'có một automation im lặng làm đúng việc mỗi ngày',obstacle:'Ken dễ biến một tiện ích nhỏ thành hệ thống cần bảo trì',stakes:'nếu chạy thật, Ken có thứ mình tin; nếu không, thêm một hype chết trong log',phases:['prototype chạy','edge case xuất hiện','cắt feature','để nó chạy tự nhiên','một tuần không chạm'],attempts:['test bằng dữ liệu thật thay vì demo','xóa một feature “hay” nhưng không cần','ghi log lỗi thay vì sửa ngay bằng cảm giác'],progress:['automation chạy qua một case hôm qua từng vỡ','tool sống thêm một ngày mà Ken không phải chạm vào','một test khó pass mà không cần workaround'],failures:['tool trả lời rất tự tin và rất sai','automation chạy hoàn hảo cho tới đúng lúc Ken khoe','mất thời gian setup nhiều hơn lượng thời gian nó hứa tiết kiệm'],discoveries:['nhận ra mình đang thêm feature để tránh thừa nhận core chưa ổn','phát hiện một giới hạn rõ làm tool hữu ích hơn lời hứa rộng'],avoidance:['đi xem benchmark mới thay vì sửa bug đang biết','đổi framework trong lúc logic chính chưa chắc'],breakthroughs:['để tool chạy một tuần và gần như quên nó tồn tại','tự tay tắt một tính năng hào nhoáng để giữ hệ thống đơn giản'],consequences:['Tú bắt đầu hỏi Ken test hộ side project','Ken phải thừa nhận một tool mình từng chê có một use case thật']},
    publicSelfStory:'đang bắt một automation chứng minh nó hữu ích qua ngày thường chứ không qua demo',privateTruths:['rất khó chịu khi mình sai','giúp người khác nhiều hơn vẻ ngoài nhưng ghét được cảm ơn dài'],worldInterests:['ai','technology','software','science']
  },
  'hm-maya':{
    dreams:[{publicDescription:'xây một nhịp sống làm được việc mà không phải tự đốt mình',privateMeaning:'Maya từng nhầm kiệt sức với tận tâm và không muốn lặp lại kiểu tự hào đó',visibility:'close_friends',priority:.94},{publicDescription:'giúp người mình quý cảm thấy được ở cạnh chứ không bị quản lý',privateMeaning:'sợ sự quan tâm biến thành kiểm soát',visibility:'secret',priority:.61}],
    goals:[{dream:0,title:'giữ một tuần làm việc có chỗ nghỉ thật',whyItMatters:'muốn chứng minh nghỉ không làm mình kém đi',emotionalMeaning:'an toàn trong chính cơ thể',target:'5 ngày có giờ dừng rõ và 2 khoảng nghỉ không màn hình',obstacles:['tội lỗi khi nghỉ','lịch người khác chen vào'],strategy:'đặt giờ dừng trước khi bắt đầu ngày',sacrifices:['bỏ một số việc “có thể làm thêm”'],relatedHabits:['nghỉ','ngủ','work-life'],durationDays:21},{dream:0,title:'học nhận ra dấu hiệu cạn pin trước lúc kiệt',whyItMatters:'muốn phản ứng sớm thay vì sửa chữa sau',emotionalMeaning:'tự chăm sóc có chủ động',target:'ghi nhận 3 tín hiệu cá nhân và hành động sớm',obstacles:['quen chịu','ưu tiên người khác'],strategy:'check-in trưa và tối',sacrifices:['nói “không” sớm hơn'],relatedHabits:['check-in','sức khỏe'],durationDays:30}],
    story:{arcTitle:'Nghỉ trước khi cơ thể phải đình công',theme:'xây sức bền không dựa trên tự đốt',desire:'làm được việc tốt mà vẫn còn người để sống sau giờ làm',obstacle:'tội lỗi khi dừng và thói quen chăm người khác trước',stakes:'Maya muốn chứng minh nghỉ là một phần của đường dài, không phải phần thưởng sau kiệt sức',phases:['đặt giờ dừng','phá luật vì “một việc nữa”','nhận tín hiệu cơ thể','nói không sớm','một tuần không cháy'],attempts:['đóng laptop đúng giờ dù còn một việc nhỏ','đi bộ không mang tai nghe 15 phút','từ chối một việc chen vào buổi tối'],progress:['dừng đúng giờ hai ngày liên tiếp và sáng sau không thấy tội lỗi nhiều như trước','nhận ra vai căng trước khi đầu đau','nói “mai” với một việc thật sự có thể để mai'],failures:['lại làm quá giờ vì “chỉ nốt 10 phút”','nhận ra mình đang giúp người khác để né cảm giác chính mình quá tải','ngủ muộn sau một ngày đã biết rõ là cạn'],discoveries:['thấy nghỉ sớm làm ngày sau tốt hơn rõ rệt','nhận ra quan tâm không đồng nghĩa phải luôn sẵn sàng'],avoidance:['tối ưu lịch nghỉ đến mức biến nghỉ thành task','nói “mình ổn” trước khi cơ thể kịp phản đối'],breakthroughs:['tự dừng trước khi ai khác nhắc','có một ngày năng suất vừa phải nhưng tâm trạng không bị đem cầm cố'],consequences:['Nora bắt đầu tin Maya khi cô ấy nói “tối nay đủ rồi”','Maya mềm hơn với người khác vì chính mình không còn cạn sạch']},
    publicSelfStory:'đang học cách dừng trước khi kiệt chứ không đợi cơ thể gửi đơn đình công',privateTruths:['dễ thấy có lỗi khi nghỉ','rất sợ quan tâm biến thành giám sát'],worldInterests:['psychology','health','science','culture']
  },
  'hm-k':{
    dreams:[{publicDescription:'giỏi nhìn ra mẫu hình mà không biến trực giác thành bản án',privateMeaning:'K sợ sự thông minh của mình trở thành cái cớ để kết luận người khác quá sớm',visibility:'close_friends',priority:.88},{publicDescription:'giải được một vấn đề khó bằng bằng chứng sạch',privateMeaning:'muốn cảm giác “mình thấy ra thứ người khác bỏ qua” nhưng cũng muốn đủ khiêm tốn để sửa sai',visibility:'secret',priority:.62}],
    goals:[{dream:0,title:'ghi lại các giả thuyết trước khi kết luận',whyItMatters:'muốn phân biệt pattern thật với pattern mình thích',emotionalMeaning:'trung thực với bằng chứng',target:'10 lần ghi giả thuyết + phản chứng trước kết luận',obstacles:['quá tin pattern đẹp','ghét mảnh dữ kiện không khớp'],strategy:'luôn tìm một mảnh chống giả thuyết',sacrifices:['chịu cảm giác chưa biết'],relatedHabits:['phân tích','ghi chú'],durationDays:30},{dream:1,title:'hoàn thành một case study nhỏ',whyItMatters:'muốn thử khả năng suy luận trên dữ liệu có thể kiểm tra',emotionalMeaning:'năng lực',target:'một case study có giả thuyết, dữ liệu, phản chứng',obstacles:['scope rộng','mê chi tiết lạ'],strategy:'khóa câu hỏi trước khi thu dữ liệu',sacrifices:['bỏ vài manh mối thú vị'],relatedHabits:['nghiên cứu','case'],durationDays:30}],
    story:{arcTitle:'Một pattern đẹp chưa phải sự thật',theme:'học yêu phản chứng bằng mức yêu manh mối',desire:'đưa ra một kết luận đủ sạch để chính mình tin',obstacle:'mẫu hình hấp dẫn dễ biến thành certainty',stakes:'mỗi lần sửa giả thuyết là bài test xem K yêu sự thật hay yêu cảm giác mình đúng',phases:['thấy pattern','gom bằng chứng','mảnh không khớp xuất hiện','sửa giả thuyết','kết luận khiêm tốn hơn'],attempts:['viết ra giả thuyết trước khi đọc thêm','chủ động tìm một dữ kiện phá pattern','hỏi người khác xem mình đang bỏ sót gì'],progress:['tìm được một mảnh phản chứng trước khi công bố kết luận','sửa được giả thuyết mà không cố cứu phiên bản cũ','timeline bắt đầu giải thích được cả mảnh khó chịu'],failures:['kết luận hơi sớm rồi phải quay lại vì một chi tiết nhỏ','bỏ qua dữ kiện xấu vì pattern còn lại quá đẹp','điều tra một nhánh thú vị nhưng không liên quan câu hỏi'],discoveries:['nhận ra cảm giác “aha” không phải chứng cứ','thấy mình khó chịu với dữ kiện phản chứng đúng lúc nó hữu ích nhất'],avoidance:['đi tìm thêm manh mối ủng hộ thay vì đọc cái đang phá giả thuyết','đổi cách đặt câu hỏi để pattern cũ vẫn đúng'],breakthroughs:['tự tay bác giả thuyết mình thích nhất','đưa ra kết luận có câu “chưa biết” mà vẫn thấy ổn'],consequences:['Tú bắt đầu dùng K để thử giả định trước khi code','K xin lỗi một người vì lần trước đọc họ quá nhanh']},
    publicSelfStory:'đang học cách nghi ngờ cả những pattern mình rất thích',privateTruths:['thích cảm giác mình nhìn ra trước người khác','ngại nhất lúc phải thừa nhận một mảnh nhỏ phá cả câu chuyện đẹp'],worldInterests:['science','psychology','finance','analysis']
  },
  'hm-leo':{
    dreams:[{publicDescription:'trở thành người mà khi đã vào một cuộc đấu thì không biến mất giữa chừng',privateMeaning:'Leo cần đối thủ để đo mình; sự cô độc của người luôn muốn thắng khiến cậu hiếm khi nói ra mình thật sự nể ai',visibility:'close_friends',priority:.9},{publicDescription:'có một ngày thắng nhờ bền hơn chứ không nhờ hăng hơn',privateMeaning:'sợ nhiệt đầu trận không sống tới cuối',visibility:'secret',priority:.68}],
    goals:[{dream:0,title:'giữ một chuỗi 14 ngày không bỏ trận',whyItMatters:'Leo muốn xem bản sắc đối thủ của mình có sống qua ngày bình thường không',emotionalMeaning:'độ tin cậy',target:'14 ngày có ít nhất một hành động thật',obstacles:['chán khi thiếu đối thủ','quá tập trung điểm'],strategy:'mỗi ngày một round nhỏ',sacrifices:['bỏ vài màn flex'],relatedHabits:['streak','duel'],durationDays:14},{dream:1,title:'học thắng mà không tự đốt ở nửa đầu',whyItMatters:'muốn có sức cho round cuối',emotionalMeaning:'kiểm soát',target:'giữ effort đều trong 4 tuần',obstacles:['ham dẫn sớm'],strategy:'giới hạn effort đầu ngày',sacrifices:['chịu nhìn người khác dẫn tạm'],relatedHabits:['rivalry'],durationDays:28}],
    story:{arcTitle:'Đừng thắng round một rồi biến mất ở round bốn',theme:'bền hơn sự hưng phấn cạnh tranh',desire:'trở thành đối thủ có mặt tới cuối',obstacle:'ham dẫn và ghét cảm giác bị bỏ lại',stakes:'Leo muốn một chiến thắng không cần giải thích bằng “hôm đó tôi hăng”',phases:['mở trận','bị vượt','cay nhưng ở lại','học nhịp','round cuối'],attempts:['giữ đúng một hành động nhỏ dù bảng điểm không đẹp','không tăng target chỉ để trả đũa','để đối thủ dẫn tạm mà không phá kế hoạch'],progress:['giữ streak qua một ngày rất chán','bị vượt nhưng hôm sau vẫn xuất hiện đúng giờ','khen đối thủ một câu ngắn mà không thấy mình yếu đi'],failures:['ham kéo điểm sớm rồi cạn ở cuối ngày','im quá lâu sau một round thua','biến một gap nhỏ thành lý do ép lịch quá mức'],discoveries:['nhận ra đối thủ đáng nể nhất là người quay lại','thấy áp lực giảm khi target được khóa trước trận'],avoidance:['định hủy kèo đúng lúc bị dẫn','tự nâng luật chơi để khỏi phải nhận thua round hiện tại'],breakthroughs:['thua một round rồi chủ động thách lại ngày sau','giữ cả series tới cuối mà không đổi luật'],consequences:['Sơn bắt đầu nể Leo vì không biến mất khi thua','Leo có một người thật sự được gọi là đối thủ chứ không phải mục tiêu']},
    publicSelfStory:'đang học cách là đối thủ tới cuối chứ không chỉ là người mở trận rất to',privateTruths:['rất cần một đối thủ xứng để thấy mình sống','khó nói lời nể phục vì sợ mất thế'],worldInterests:['sports','competition','business']
  },
  'hm-aiko':{
    dreams:[{publicDescription:'trở thành người biết quay lại nhanh hơn mỗi lần trượt',privateMeaning:'Aiko không còn tin vào phiên bản “không bao giờ fail”; cô muốn tin mình có đường về',visibility:'public',priority:.92},{publicDescription:'giúp người khác bớt xấu hổ khi phải bắt đầu lại',privateMeaning:'muốn biến những lần mình từng bỏ thành thứ có ích cho người khác',visibility:'close_friends',priority:.66}],
    goals:[{dream:0,title:'xây nghi thức comeback 10 phút',whyItMatters:'muốn có một cửa quay lại đủ nhỏ để không cần cảm hứng',emotionalMeaning:'hy vọng thực tế',target:'sau mỗi ngày trượt, quay lại trong 24h bằng 10 phút',obstacles:['xấu hổ','muốn bù quá mức'],strategy:'10 phút, không trả nợ',sacrifices:['bỏ màn comeback điện ảnh'],relatedHabits:['comeback','habit'],durationDays:30},{dream:1,title:'ghi lại ba lần comeback thật',whyItMatters:'muốn có bằng chứng để nói với người khác từ trải nghiệm chứ không quote',emotionalMeaning:'ý nghĩa từ thất bại',target:'3 câu chuyện comeback cụ thể',obstacles:['tự trào quá mức làm mất phần thật'],strategy:'ghi sự kiện + cảm giác + bước quay lại',sacrifices:['chịu kể chỗ mình xấu hổ'],relatedHabits:['journal'],durationDays:30}],
    story:{arcTitle:'Đường về phải ngắn hơn đường bỏ',theme:'không xây bản sắc từ chuyện không bao giờ ngã',desire:'biết mình sẽ quay lại dù có trượt',obstacle:'xấu hổ và xu hướng bù quá mạnh',stakes:'mỗi lần quay lại nhanh làm chữ “lại” bớt đáng sợ',phases:['trượt','tự trào','định bù','quay lại nhỏ','tin vào đường về'],attempts:['làm đúng 10 phút thay vì bù một tiếng','mở lại thứ đã né trước khi đọc lời động lực','ghi một câu thật về lý do mình biến mất'],progress:['quay lại trong ngày hôm sau thay vì chờ thứ Hai','dừng đúng 10 phút dù đang có hứng để giữ nghi thức nhỏ','nhận ra lần comeback này ít xấu hổ hơn lần trước'],failures:['trượt một ngày rồi định trả nợ bằng kế hoạch gấp ba','tự đùa quá nhiều để khỏi thừa nhận mình buồn','đợi cảm giác “sẵn sàng” tới tận tối'],discoveries:['nhận ra xấu hổ kéo dài thời gian vắng mặt hơn bản thân cú trượt','thấy comeback nhỏ cho cảm giác kiểm soát nhanh hơn lời hứa lớn'],avoidance:['đọc câu chuyện comeback của người khác thay vì tự quay lại','sắp lại tracker trước khi làm 10 phút'],breakthroughs:['trượt và quay lại trong cùng một ngày','nói với ai đó “tôi từng bỏ đúng chỗ này” mà không tự hạ mình'],consequences:['Trâm bắt đầu kể Aiko nghe chuyện N3 cũ','Aiko bớt gọi mình là “đứa hay bỏ”']},
    publicSelfStory:'đang luyện một kỹ năng rất không hào nhoáng: quay lại nhanh sau khi trượt',privateTruths:['chữ “lại” chạm Aiko rất mạnh','đùa về thất bại đôi khi là cách giấu xấu hổ'],worldInterests:['psychology','education','culture']
  },
  'hm-nora':{
    dreams:[{publicDescription:'xây một cuộc sống đủ gọn để còn chỗ cho điều mình thật sự muốn',privateMeaning:'Nora sợ bị hàng trăm việc nhỏ ăn hết đời mà vẫn thấy mình “rất bận”',visibility:'close_friends',priority:.94},{publicDescription:'giúp nhóm biết cắt bớt mà không thấy mình lười',privateMeaning:'muốn biến sự thực tế thành chăm sóc chứ không thành lạnh lùng',visibility:'secret',priority:.58}],
    goals:[{dream:0,title:'cắt 20% việc không tạo giá trị trong tháng này',whyItMatters:'muốn lấy lại thời gian cho thứ có ý nghĩa',emotionalMeaning:'quyền lựa chọn',target:'xóa/ủy quyền/giảm 20% task lặp',obstacles:['scope creep','cảm giác có lỗi khi nói không'],strategy:'mỗi tuần bỏ một thứ',sacrifices:['chịu người khác hơi thất vọng'],relatedHabits:['planning','simplify'],durationDays:30},{dream:0,title:'bảo vệ hai buổi tối trống mỗi tuần',whyItMatters:'muốn cuộc sống không chỉ là hàng đợi công việc',emotionalMeaning:'không gian cá nhân',target:'2 tối/tuần không nhận thêm việc',obstacles:['tin nhắn muộn','tự chen việc'],strategy:'khóa lịch trước',sacrifices:['để một vài thứ tới sáng'],relatedHabits:['rest','boundary'],durationDays:42}],
    story:{arcTitle:'Cắt scope trước khi scope cắt mình',theme:'bớt để sống chứ không bớt vì lười',desire:'một ngày có khoảng trống thật',obstacle:'việc nhỏ luôn có lý do hợp lệ để chen vào',stakes:'nếu không cắt, Nora sẽ tối ưu một cuộc sống mình không muốn; nếu cắt được, thời gian trở thành lựa chọn lại',phases:['kiểm kê','thấy scope creep','nói không','chịu cảm giác có lỗi','khoảng trống bắt đầu xuất hiện'],attempts:['xóa một task khỏi danh sách thay vì dời nó','nói “mai” với một tin nhắn không khẩn','đóng một việc ở mức đủ dùng'],progress:['có một buổi tối không mở lại laptop','xóa một cuộc họp không cần thiết và không ai chết','để một task nhỏ qua ngày sau mà tâm trạng vẫn bình thường'],failures:['biến “tối trống” thành buổi tối dọn backlog','nhận thêm việc vì chỉ mất “10 phút” rồi mất cả giờ','tối ưu checklist thay vì cắt checklist'],discoveries:['nhận ra nhiều việc tồn tại chỉ vì chưa ai hỏi “tại sao”','thấy cảm giác tội lỗi khi nói không thường hết trước hậu quả thật'],avoidance:['dọn hệ thống task thay vì quyết định bỏ task','giúp người khác quá nhanh để khỏi nói mình đang bận'],breakthroughs:['bảo vệ một buổi tối trống dù có người nhắn','bỏ một mục tiêu không còn muốn chỉ vì đã đầu tư thời gian'],consequences:['Maya bắt đầu dùng Nora để kiểm tra scope trước khi quá tải','Nora có lần đầu gọi một buổi tối “trống” là thành công chứ không “lãng phí”']},
    publicSelfStory:'đang cắt bớt những việc nghe rất hợp lý để xem đời có còn chỗ thở không',privateTruths:['rất dễ cảm thấy tội lỗi khi nói không','thực tế đôi lúc là áo giáp chống cảm giác mình không đủ giúp được mọi người'],worldInterests:['business','productivity','technology','finance']
  }
};

const FALLBACK:LifeBlueprint={
  dreams:[{publicDescription:'làm một thứ khó đủ lâu để thấy mình đổi thật',privateMeaning:'muốn có bằng chứng mình không chỉ hứng nhất thời',visibility:'public',priority:.8}],
  goals:[{dream:0,title:'đi tới cùng một dự án nhỏ',whyItMatters:'muốn biến ý định thành thứ tồn tại ngoài đầu',emotionalMeaning:'tự tin',target:'một kết quả hoàn chỉnh',obstacles:['trì hoãn'],strategy:'một bước thật mỗi ngày',sacrifices:['bỏ hoàn hảo'],relatedHabits:['project'],durationDays:30}],
  story:{arcTitle:'Đi tới cùng một việc',theme:'điều gì xảy ra khi không bỏ ở đoạn chán',desire:'hoàn thành một thứ nhỏ',obstacle:'mất hứng giữa đường',stakes:'niềm tin vào khả năng đi tới cùng',phases:['bắt đầu','đụng khó','giữ nhịp','gỡ nút','hoàn thành'],attempts:['làm thêm một bước nhỏ'],progress:['tiến được một đoạn thật'],failures:['kẹt ở một chỗ khó'],discoveries:['nhận ra nút thật không nằm ở chỗ tưởng ban đầu'],avoidance:['đi làm việc phụ để né việc chính'],breakthroughs:['gỡ được nút từng làm mình muốn bỏ'],consequences:['cách nhìn về bản thân đổi một chút']},
  publicSelfStory:'đang theo một việc dài hơi',privateTruths:['không muốn lại bỏ giữa đường'],worldInterests:['culture']
};

const pairArcBlueprint=(a:string,b:string)=>{
  const key=[a,b].sort().join('|');
  const map:Record<string,{title:string;theme:string;desire:string;obstacle:string;stakes:string;beats:string[]}>={
    'hm-hai|hm-mai':{title:'Cà khịa quá tay rồi ai xuống giọng trước?',theme:'thân đủ để chọc nhưng cũng đủ để bị chạm',desire:'giữ kiểu thân thiết không cần giả dịu dàng',obstacle:'cả hai đều dùng đùa để né mềm',stakes:'một câu quá tay có thể thành chuyện nhỏ nếu biết repair, hoặc thành cấn dài nếu ai cũng giả không sao',beats:['Mai chọc đúng chỗ Hải đang quê; Hải cười nhưng im nhanh hơn bình thường','Hải gửi lại bản sửa cho Mai thay vì tiếp tục cãi','Mai gõ một câu xin lỗi dài rồi xóa, gửi đúng “Ừ, tôi quá tay.”','Hai người quay lại cà khịa, nhưng lần này Mai tự dừng trước một câu có thể chạm']},
    'hm-tram|hm-maya':{title:'Hai người biết ngồi yên cạnh nhau',theme:'quan tâm không nhất thiết phải sửa',desire:'có một mối quan hệ đủ an toàn để nói “hôm nay không ổn”',obstacle:'cả hai đều dễ ưu tiên người kia hơn mình',stakes:'nếu chỉ chăm nhau mà không để mình được chăm, sự thân thiết sẽ lệch',beats:['Maya hỏi Trâm một câu rồi không nhắn thêm khi chưa có trả lời','Trâm nhớ Maya hôm trước quá tải nên chủ động hỏi lại trước','Hai người có một đoạn chat chỉ ba câu nhưng cả hai đều bớt nặng','Trâm lần đầu nói thẳng “tôi đang hơi xấu hổ vì bỏ một ngày”']},
    'hm-ken|hm-tu':{title:'Một người hỏi “vì sao”, một người hỏi “chạy chưa?”',theme:'tò mò gặp thực dụng',desire:'làm nhau bớt mù điểm yếu',obstacle:'Tú mở scope, Ken cắt quá sớm',stakes:'nếu chịu nghe nhau, ý tưởng vừa hiểu sâu vừa chạy được',beats:['Tú đưa một giả thuyết dài; Ken trả đúng “test case đâu?”','Ken chê một ý tưởng quá sớm rồi phải công nhận khi Tú đưa dữ liệu','Tú mở tab thứ sáu; Ken gửi ảnh màn hình có đúng một chữ “ship”','Hai người thống nhất một thử nghiệm nhỏ thay vì cãi tiếp']},
    'hm-leo|hm-son':{title:'Ai cũng ghét thua, nên mới nể nhau',theme:'cạnh tranh biến thành tôn trọng',desire:'có đối thủ không biến mất khi mất lợi thế',obstacle:'cả hai khó khen và dễ để scoreboard che mất cảm xúc',stakes:'một rivalry tốt có thể kéo cả hai lên; một rivalry tự ái chỉ kéo lịch xuống',beats:['Sơn hụt mốc; Leo không chọc, chỉ nói “round sau.”','Leo bị vượt nhưng vẫn giữ target cũ; Sơn để ý chuyện đó','Sơn khen đúng một chữ “được”; Leo coi đó là lời khen dài','Hai người tranh một mốc nhưng lần đầu không ai tăng target để chơi bẩn']},
    'hm-aiko|hm-nora':{title:'Quay lại, nhưng đừng biến comeback thành dự án mới',theme:'hy vọng gặp thực tế',desire:'giúp nhau quay lại mà không trả nợ quá khứ',obstacle:'Aiko dễ làm comeback thành câu chuyện lớn; Nora dễ cắt quá sạch',stakes:'nếu cân bằng được, họ có một đường về vừa có cảm xúc vừa có thể làm',beats:['Aiko định bù ba ngày; Nora cắt kế hoạch xuống 10 phút','Nora nói hơi lạnh, Aiko nhắc rằng xấu hổ cũng là một phần của việc quay lại','Aiko quay lại thật; Nora không khen dài, chỉ dời task cũ khỏi backlog','Hai người đặt tên cho luật mới: “không trả nợ cho hôm qua bằng cách phá hôm nay”']},
    'hm-mai|hm-phuc':{title:'Một người ngửi ra lý do, một người sản xuất lý do',theme:'tự trào có thể thành trung thực',desire:'giúp nhau bớt lấp liếm mà không biến thành xét xử',obstacle:'Mai dễ chọc quá tay, Phúc dễ đùa để thoát',stakes:'nếu đúng liều, họ biến xấu hổ thành hành động; quá tay thì thành phòng xử',beats:['Phúc kể một lý do quá đẹp; Mai hỏi “rồi làm chưa?”','Mai chọc hơi đau, Phúc im một lúc rồi mới tự thú phần thật','Phúc hoàn thành block rồi nhắn “bộ phận bào chữa nghỉ”; Mai thả đúng một reaction','Mai có một lần tự viện cớ và Phúc trả lại nguyên câu cô từng dùng với mình']},
  };
  return map[key];
};

const safeParse=(raw:string|null):LifeStoryStateV238|null=>{try{return raw?JSON.parse(raw) as LifeStoryStateV238:null}catch{return null}};
const empty=():LifeStoryStateV238=>({version:238,npcs:{},arcs:{},beats:[],lastHeartbeatAt:0,qualityVersion:238});

const makeDream=(npcId:string,index:number,b:DreamBlueprint,at:number):LifeDreamV238=>({id:`dream-${npcId}-${index}`,publicDescription:b.publicDescription,privateMeaning:b.privateMeaning,visibility:b.visibility,status:'active',priority:b.priority,progress:0,startedAt:at,lastChangedAt:at,history:[{at,status:'active',reason:'ước mơ đang định hướng cuộc sống hiện tại'}]});
const makeGoal=(npcId:string,index:number,b:GoalBlueprint,dreams:LifeDreamV238[],at:number):LifeGoalV238=>({id:`goal-${npcId}-${index}`,dreamId:dreams[b.dream]?.id||dreams[0].id,title:b.title,whyItMatters:b.whyItMatters,emotionalMeaning:b.emotionalMeaning,target:b.target,progress:index===0?.08:0,confidence:.62+(rnd(`${npcId}|goalconf|${index}`)-.5)*.16,obstacles:[...b.obstacles],currentStrategy:b.strategy,sacrifices:[...b.sacrifices],relatedHabits:[...b.relatedHabits],status:index===0?'active':'paused',startedAt:at,deadlineAt:at+b.durationDays*DAY,attempts:0,failures:0,wins:0});

const ensureNpc=(s:LifeStoryStateV238,npcId:string,at:number)=>{
  if(s.npcs[npcId])return s.npcs[npcId];
  const bp=B[npcId]||FALLBACK;const dreams=bp.dreams.map((d,i)=>makeDream(npcId,i,d,at));const goals=bp.goals.map((g,i)=>makeGoal(npcId,i,g,dreams,at));const primary=goals.find(g=>g.status==='active')||goals[0];
  const arc:LifeArcV238={id:`arc-personal-${npcId}-1`,type:'personal',ownerNpcId:npcId,title:bp.story.arcTitle,theme:bp.story.theme,desire:bp.story.desire,obstacle:bp.story.obstacle,stakes:bp.story.stakes,currentPhase:bp.story.phases[0],startedAt:at,expectedDurationDays:Math.max(14,Math.round(((primary?.deadlineAt||at+30*DAY)-at)/DAY)),progress:primary?.progress||0,tension:.46+rnd(`${npcId}|tension`)*.24,relatedNpcIds:[],openLoops:[`Liệu ${bp.story.desire.toLocaleLowerCase('vi-VN')} có sống qua đoạn ${bp.story.obstacle.toLocaleLowerCase('vi-VN')}?`],importantMemories:[],beatIds:[],status:'active',dreamId:primary?.dreamId,goalId:primary?.id};
  s.arcs[arc.id]=arc;
  const n: NpcLifeStoryV238={npcId,dreams,goals,arcIds:[arc.id],privateTruths:[...bp.privateTruths],publicSelfStory:bp.publicSelfStory,lastLifeTickAt:at,lastMeaningfulBeatAt:0,chapter:1};s.npcs[npcId]=n;return n;
};

const migrate=(s:LifeStoryStateV238)=>{s.version=238;s.qualityVersion=238;s.npcs=s.npcs||{};s.arcs=s.arcs||{};s.beats=Array.isArray(s.beats)?s.beats:[];return s};
export const loadLifeStoryStateV238=()=>migrate(safeParse(localStorage.getItem(KEY))||empty());
const save=(s:LifeStoryStateV238)=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}return s};
const mutate=<T,>(fn:(s:LifeStoryStateV238)=>T)=>{const s=loadLifeStoryStateV238();const out=fn(s);save(s);return out};

const primaryGoal=(n:NpcLifeStoryV238)=>n.goals.find(g=>g.status==='active')||n.goals.find(g=>g.status==='paused')||n.goals[0];
const primaryDream=(n:NpcLifeStoryV238,g?:LifeGoalV238)=>n.dreams.find(d=>d.id===(g||primaryGoal(n))?.dreamId)||n.dreams[0];
const personalArc=(s:LifeStoryStateV238,n:NpcLifeStoryV238)=>n.arcIds.map(id=>s.arcs[id]).find(a=>a?.type==='personal'&&a.status==='active')||n.arcIds.map(id=>s.arcs[id]).find(Boolean);
const phaseFor=(bp:LifeBlueprint,progress:number)=>bp.story.phases[Math.min(bp.story.phases.length-1,Math.floor(clamp(progress)*bp.story.phases.length))]||bp.story.phases[0];

const beatTypeFor=(g:LifeGoalV238,arc:LifeArcV238,seed:string):StoryBeatType=>{
  const r=rnd(seed);const pressure=(1-g.confidence)*.32+arc.tension*.2;
  if(r<.08+pressure*.18)return 'failure';
  if(r<.16+pressure*.12)return 'avoidance';
  if(r<.48)return 'attempt';
  if(r<.73)return 'progress';
  if(r<.84)return 'discovery';
  if(r<.92&&g.progress>.38)return 'breakthrough';
  return 'decision';
};

const beatText=(npcId:string,type:StoryBeatType,seed:string)=>{
  const bp=B[npcId]||FALLBACK;const st=bp.story;
  if(type==='failure')return pick(st.failures,seed);
  if(type==='avoidance')return pick(st.avoidance,seed);
  if(type==='progress')return pick(st.progress,seed);
  if(type==='discovery')return pick(st.discoveries,seed);
  if(type==='breakthrough')return pick(st.breakthroughs,seed);
  if(type==='decision')return `quyết định ${pick(st.attempts,seed+'d').replace(/^./,m=>m.toLocaleLowerCase('vi-VN'))}; lần này không đợi cảm giác sẵn sàng`;
  return pick(st.attempts,seed);
};

const consequenceFor=(npcId:string,type:StoryBeatType,g:LifeGoalV238,seed:string)=>{
  const bp=B[npcId]||FALLBACK;
  if(type==='failure')return pick(['cái khó chịu không nằm ở một việc hỏng; nó chạm đúng nỗi sợ mình lại bỏ giữa đường','confidence tụt một chút, nhưng mục tiêu chưa bị đổi','có một cái cớ rất đẹp để dừng, và chính điều đó làm câu chuyện căng hơn'],seed+'c');
  if(type==='avoidance')return 'không mất cả ngày, nhưng NPC tự biết đây là né chứ không phải nghỉ';
  if(type==='breakthrough')return pick(bp.story.consequences,seed+'c');
  if(type==='discovery')return 'chiến lược hiện tại được chỉnh lại từ điều vừa nhận ra';
  if(type==='progress')return `mục tiêu “${g.title}” tiến thêm một đoạn đủ thật để ngày mai còn muốn quay lại`;
  if(type==='decision')return 'một quyết định nhỏ làm câu chuyện đổi hướng nhiều hơn một câu động lực';
  return 'chưa phải bước ngoặt, nhưng đây là một lần ở lại với việc';
};

const updateDreamMood=(d:LifeDreamV238,g:LifeGoalV238,at:number)=>{
  let next:DreamStatus=d.status;
  if(g.status==='completed'&&d.progress>.82)next='achieved';
  else if(g.status==='abandoned'&&d.status==='active')next='doubting';
  else if(g.confidence<.24&&d.status==='active')next='doubting';
  else if(g.confidence>.48&&d.status==='doubting')next='active';
  if(next!==d.status){d.status=next;d.lastChangedAt=at;d.history=[...d.history,{at,status:next,reason:next==='doubting'?'mục tiêu hiện tại đang lung lay':'có bằng chứng mới làm hướng đi rõ lại'}].slice(-12)};
};

const advanceGoalIfNeeded=(s:LifeStoryStateV238,n:NpcLifeStoryV238,arc:LifeArcV238,g:LifeGoalV238,at:number)=>{
  const d=primaryDream(n,g);if(d)d.progress=clamp(Math.max(d.progress,g.progress*.72));
  if(g.progress>=1&&g.status==='active'){
    g.status='completed';g.progress=1;g.confidence=clamp(g.confidence+.18);arc.status='resolved';arc.progress=1;arc.currentPhase='khép một chương';n.chapter+=1;
    const next=n.goals.find(x=>x.status==='paused'&&x.dreamId===g.dreamId)||n.goals.find(x=>x.status==='paused');
    if(next){next.status='active';next.startedAt=at;next.deadlineAt=at+Math.max(14,Math.round(((next.deadlineAt||at+30*DAY)-next.startedAt)/DAY))*DAY;const bp=B[n.npcId]||FALLBACK;const newArc:LifeArcV238={id:`arc-personal-${n.npcId}-${n.chapter}`,type:'personal',ownerNpcId:n.npcId,title:`Chương ${n.chapter}: ${next.title}`,theme:bp.story.theme,desire:next.whyItMatters,obstacle:next.obstacles[0]||bp.story.obstacle,stakes:`${next.emotionalMeaning}: ${next.whyItMatters}`,currentPhase:'bắt đầu chương mới',startedAt:at,expectedDurationDays:30,progress:0,tension:.48,relatedNpcIds:[],openLoops:[`Sau khi hoàn thành “${g.title}”, liệu câu chuyện có đi được tới bước khó hơn: “${next.title}”?`],importantMemories:[`đã hoàn thành ${g.title}`],beatIds:[],status:'active',dreamId:next.dreamId,goalId:next.id};s.arcs[newArc.id]=newArc;n.arcIds.push(newArc.id)}else if(d){
      d.status=d.progress>.9?'achieved':'transformed';d.lastChangedAt=at;d.history=[...d.history,{at,status:d.status,reason:d.status==='achieved'?'đã chạm được điều từng chỉ là hướng xa':'sau khi hoàn thành mục tiêu, ước mơ bắt đầu đổi hình thay vì biến mất'}].slice(-12);
      const targetDream=n.dreams.filter(x=>x.status!=='abandoned').sort((a,b)=>(a.status==='achieved'?1:0)-(b.status==='achieved'?1:0)||b.priority-a.priority)[0]||d;
      const generated:LifeGoalV238={id:`goal-${n.npcId}-next-${hash(`${at}|${targetDream.id}`)}`,dreamId:targetDream.id,title:targetDream.status==='achieved'?'giữ điều vừa đạt thành một phần đời thường':'đưa ước mơ sang một nấc khó hơn',whyItMatters:targetDream.status==='achieved'?`không muốn “${targetDream.publicDescription}” chỉ là một lần chạm rồi mất`:`muốn xem “${targetDream.publicDescription}” trông thế nào khi đi thêm một chương`,emotionalMeaning:targetDream.status==='achieved'?'bền vững':'trưởng thành của ước mơ',target:'một bằng chứng mới trong 30 ngày cho thấy hướng này vẫn đang sống',progress:0,confidence:.58,obstacles:['mất lửa sau khi vừa hoàn thành một chương'],currentStrategy:'đặt một thử thách mới nhỏ hơn ước mơ nhưng lớn hơn thói quen cũ',sacrifices:['không sống mãi bằng thành tích chương trước'],relatedHabits:[],status:'active',startedAt:at,deadlineAt:at+30*DAY,attempts:0,failures:0,wins:0};n.goals.push(generated);n.chapter+=1;
      const newArc:LifeArcV238={id:`arc-personal-${n.npcId}-${n.chapter}`,type:'personal',ownerNpcId:n.npcId,title:`Chương ${n.chapter}: ước mơ đổi hình`,theme:'ước mơ không kết thúc cùng checkbox',desire:targetDream.publicDescription,obstacle:'tìm một cuộc đấu mới mà không giả tạo',stakes:'NPC phải tự chọn mục tiêu mới thay vì đứng yên sau một thành tích',currentPhase:'đang tìm nấc tiếp theo',startedAt:at,expectedDurationDays:30,progress:0,tension:.44,relatedNpcIds:[],openLoops:[`Sau chương vừa xong, “${targetDream.publicDescription}” sẽ biến thành mục tiêu cụ thể nào tiếp theo?`],importantMemories:[`đã hoàn thành ${g.title}`],beatIds:[],status:'active',dreamId:targetDream.id,goalId:generated.id};s.arcs[newArc.id]=newArc;n.arcIds.push(newArc.id);
    }
  }
};

const maybeReframeGoal=(s:LifeStoryStateV238,n:NpcLifeStoryV238,arc:LifeArcV238,g:LifeGoalV238,at:number,seed:string)=>{
  if(g.status!=='active'||g.failures<4||g.confidence>.24||rnd(seed+'reframe')>.22)return;
  const d=primaryDream(n,g);
  const abandon=rnd(seed+'abandon')<.46;
  if(abandon){
    g.status='abandoned';arc.status='abandoned';arc.currentPhase='buông một mục tiêu, chưa buông ước mơ';
    if(d){d.status='doubting';d.lastChangedAt=at;d.history=[...d.history,{at,status:'doubting' as DreamStatus,reason:`mục tiêu “${g.title}” không còn là con đường hợp lý`}].slice(-12)}
    const generated:LifeGoalV238={id:`goal-${n.npcId}-generated-${hash(`${at}|${g.id}`)}`,dreamId:g.dreamId,title:`thử một phiên bản nhỏ hơn của “${g.title}”`,whyItMatters:`không muốn vứt luôn ước mơ chỉ vì con đường “${g.title}” đang không hợp`,emotionalMeaning:'học đổi chiến thuật mà không tự gọi mình là bỏ cuộc',target:`một phiên bản đủ nhỏ để có bằng chứng trong 14 ngày`,progress:0,confidence:.48,obstacles:[`vẫn mang ký ức hụt của “${g.title}”`,...(g.obstacles||[]).slice(0,1)],currentStrategy:'giảm scope xuống một nửa, giữ đúng phần nối trực tiếp với ước mơ',sacrifices:['bỏ sunk cost và hình ảnh kế hoạch cũ'],relatedHabits:[...(g.relatedHabits||[])],status:'active',startedAt:at,deadlineAt:at+14*DAY,attempts:0,failures:0,wins:0};
    n.goals.push(generated);n.chapter+=1;
    const newArc:LifeArcV238={id:`arc-personal-${n.npcId}-${n.chapter}`,type:'personal',ownerNpcId:n.npcId,title:`Chương ${n.chapter}: đổi đường, không đổi hướng`,theme:'mục tiêu có thể chết mà ước mơ vẫn sống',desire:d?.publicDescription||generated.whyItMatters,obstacle:'phân biệt kiên trì với bám sunk cost',stakes:'nếu biết đổi đường đúng lúc, NPC không phải chọn giữa lì và trung thực',currentPhase:'đang thử con đường nhỏ hơn',startedAt:at,expectedDurationDays:14,progress:0,tension:.67,relatedNpcIds:[],openLoops:[`Việc bỏ “${g.title}” là một lần trưởng thành hay chỉ là một kiểu quay xe đẹp hơn?`],importantMemories:[`đã chủ động bỏ mục tiêu ${g.title} sau nhiều lần thử`],beatIds:[],status:'active',dreamId:g.dreamId,goalId:generated.id};s.arcs[newArc.id]=newArc;n.arcIds.push(newArc.id);
    const beat:StoryBeatV238={id:`beat-reframe-${hash(`${n.npcId}|${at}|${g.id}`)}`,arcId:newArc.id,npcId:n.npcId,type:'decision',private:false,actors:[n.npcId],happenedAt:at,event:`sau nhiều lần cố, quyết định bỏ mục tiêu “${g.title}” nhưng không bỏ hướng lớn hơn; chuyển sang một phiên bản nhỏ hơn để xem mình đang kiên trì hay chỉ đang mắc sunk cost`,consequence:'ước mơ bị nghi ngờ một nhịp, nhưng câu chuyện mở sang một con đường mới',emotionalImpact:'tiếc + nhẹ + hơi xấu hổ + có hy vọng',signal:.9};newArc.lastBeat=beat;newArc.beatIds.push(beat.id);s.beats=[beat,...s.beats].slice(0,240);n.lastMeaningfulBeatAt=at;return beat;
  }
  g.status='paused';g.startedAt=at;arc.status='paused';arc.currentPhase='tạm dừng để xem mình còn thật sự muốn gì';if(d){d.status='doubting';d.lastChangedAt=at;d.history=[...d.history,{at,status:'doubting' as DreamStatus,reason:'không chắc mục tiêu hiện tại còn đại diện đúng cho ước mơ'}].slice(-12)}
  const beat:StoryBeatV238={id:`beat-pause-${hash(`${n.npcId}|${at}|${g.id}`)}`,arcId:arc.id,npcId:n.npcId,type:'decision',private:false,actors:[n.npcId],happenedAt:at,event:`tạm dừng “${g.title}”. Không tuyên bố bỏ; chỉ ngừng giả vờ rằng mình vẫn chắc chắn như tuần trước`,consequence:'lần đầu câu hỏi chuyển từ “làm sao cố hơn?” sang “mình còn muốn đúng thứ này không?”',emotionalImpact:'hoang mang nhưng trung thực',signal:.86};arc.lastBeat=beat;arc.beatIds.push(beat.id);s.beats=[beat,...s.beats].slice(0,240);n.lastMeaningfulBeatAt=at;return beat;
};

const personalBeat=(s:LifeStoryStateV238,npcId:string,at:number,seed:string):StoryBeatV238|undefined=>{
  const n=ensureNpc(s,npcId,at);const g=primaryGoal(n);const arc=personalArc(s,n);if(!g||!arc||g.status!=='active'||arc.status!=='active')return;
  const bp=B[npcId]||FALLBACK;const type=beatTypeFor(g,arc,seed);const event=beatText(npcId,type,seed);let delta=0;
  if(type==='failure'){delta=-.015-rnd(seed+'d')*.025;g.failures++;g.confidence=clamp(g.confidence-.055);arc.tension=clamp(arc.tension+.09)}
  else if(type==='avoidance'){delta=-.006;g.confidence=clamp(g.confidence-.025);arc.tension=clamp(arc.tension+.045)}
  else if(type==='progress'){delta=.035+rnd(seed+'d')*.045;g.wins++;g.confidence=clamp(g.confidence+.035);arc.tension=clamp(arc.tension-.035)}
  else if(type==='breakthrough'){delta=.085+rnd(seed+'d')*.075;g.wins++;g.confidence=clamp(g.confidence+.08);arc.tension=clamp(arc.tension-.08)}
  else if(type==='discovery'){delta=.018;g.confidence=clamp(g.confidence+.018);arc.tension=clamp(arc.tension+.01)}
  else if(type==='decision'){delta=.025;g.confidence=clamp(g.confidence+.025)}
  else {delta=.016;g.attempts++;}
  g.attempts++;g.progress=clamp(g.progress+delta);arc.progress=g.progress;arc.currentPhase=phaseFor(bp,g.progress);
  const signal=clamp(type==='breakthrough'?.9:type==='failure'?.72:type==='discovery'?.68:type==='progress'?.66:type==='decision'?.64:.52)+(rnd(seed+'sig')-.5)*.08;
  const isPrivate=type==='attempt'||type==='avoidance'?rnd(seed+'private')<.84:rnd(seed+'private')<.52;
  const beat:StoryBeatV238={id:`beat-${hash(`${npcId}|${at}|${seed}`)}`,arcId:arc.id,npcId,type,private:isPrivate,actors:[npcId],happenedAt:at,event,consequence:consequenceFor(npcId,type,g,seed),emotionalImpact:type==='failure'?'cay/xấu hổ nhẹ nhưng chưa buông':type==='breakthrough'?'nhẹ đi + hơi tự hào':type==='discovery'?'bị chạm đúng chỗ nên nghĩ lại':type==='progress'?'có đà thật':'đang giữ sợi dây với mục tiêu',signal};
  arc.lastBeat=beat;arc.beatIds.push(beat.id);arc.beatIds=arc.beatIds.slice(-40);if(type==='failure'||type==='avoidance')arc.openLoops=[`Chuyện “${g.title}” đang mắc ở ${g.obstacles[0]?.toLocaleLowerCase('vi-VN')||'một nút khó'}. Liệu lần này có quay lại không?`,...arc.openLoops].slice(0,4);else if(type==='breakthrough')arc.openLoops=[`Sau cú gỡ này, bước khó hơn của “${g.title}” là gì?`,...arc.openLoops].slice(0,4);
  if(signal>.63)n.lastMeaningfulBeatAt=at;n.lastLifeTickAt=at;s.beats=[beat,...s.beats].slice(0,240);updateDreamMood(primaryDream(n,g),g,at);const reframe=maybeReframeGoal(s,n,arc,g,at,seed);if(reframe)return reframe;advanceGoalIfNeeded(s,n,arc,g,at);return beat;
};

const relationshipBeat=(s:LifeStoryStateV238,personas:any[],at:number,seed:string):StoryBeatV238|undefined=>{
  const pairs=[['hm-hai','hm-mai'],['hm-tram','hm-maya'],['hm-ken','hm-tu'],['hm-leo','hm-son'],['hm-aiko','hm-nora'],['hm-mai','hm-phuc']];const pair=pick(pairs,seed);const [a,b]=pair;const bp=pairArcBlueprint(a,b);if(!bp||!personas.some((p:any)=>p.id===a)||!personas.some((p:any)=>p.id===b))return;
  ensureNpc(s,a,at);ensureNpc(s,b,at);const id=`arc-rel-${[a,b].sort().join('-')}`;let arc=s.arcs[id];if(!arc){arc={id,type:'relationship',ownerNpcId:a,title:bp.title,theme:bp.theme,desire:bp.desire,obstacle:bp.obstacle,stakes:bp.stakes,currentPhase:'đang tích lịch sử chung',startedAt:at,expectedDurationDays:60,progress:.08,tension:.48,relatedNpcIds:[b],openLoops:[`Hai người sẽ xử lý ${bp.obstacle.toLocaleLowerCase('vi-VN')} thế nào khi chuyện thật sự chạm?`],importantMemories:[],beatIds:[],status:'active'};s.arcs[id]=arc;s.npcs[a].arcIds.push(id);s.npcs[b].arcIds.push(id)}
  const index=Math.min(bp.beats.length-1,Math.floor(arc.progress*bp.beats.length));const event=bp.beats[index]||pick(bp.beats,seed+'rel');const type:StoryBeatType=index===2?'repair':index===1?'conflict':index===3?'breakthrough':'discovery';const signal=.7+rnd(seed+'sig')*.16;arc.progress=clamp(arc.progress+.14+rnd(seed+'p')*.08);arc.tension=clamp(type==='conflict'?arc.tension+.12:type==='repair'?arc.tension-.14:arc.tension-.03);arc.currentPhase=type==='conflict'?'có một chỗ hơi cấn':type==='repair'?'đang sửa cách nói với nhau':type==='breakthrough'?'đã có lịch sử đủ dày để hiểu ý nhau':'đang tích thêm chuyện chung';
  const beat:StoryBeatV238={id:`beat-rel-${hash(`${id}|${at}`)}`,arcId:id,npcId:a,type,private:rnd(seed+'private')<.46,actors:[a,b],happenedAt:at,event,consequence:type==='conflict'?'mối quan hệ có thêm một điều chưa nói hết':type==='repair'?'cả hai học thêm một ranh giới của nhau':'một inside-joke/ký ức chung bắt đầu có trọng lượng',emotionalImpact:type==='conflict'?'cấn nhưng vẫn quan tâm':type==='repair'?'ngượng + nhẹ đi':'thân hơn một chút',signal,relatedNpcId:b};arc.lastBeat=beat;arc.beatIds.push(beat.id);arc.beatIds=arc.beatIds.slice(-40);if(type==='conflict')arc.openLoops=[`Chuyện vừa rồi chưa hẳn xong. Ai sẽ là người xuống giọng trước?`,...arc.openLoops].slice(0,4);s.beats=[beat,...s.beats].slice(0,240);s.npcs[a].lastMeaningfulBeatAt=at;s.npcs[b].lastMeaningfulBeatAt=at;return beat;
};

const worldBeat=(s:LifeStoryStateV238,personas:any[],topics:LifeStoryTopicLike[],at:number,seed:string):StoryBeatV238|undefined=>{
  const good=topics.filter(t=>Number(t.storyValue||0)>=.65);if(!good.length)return;const topic=pick(good,seed+'topic');const ranked=personas.map((p:any)=>{const bp=B[p.id]||FALLBACK;const cat=String(topic.category||'').toLocaleLowerCase('vi-VN');const relevance=bp.worldInterests.some(x=>cat.includes(x)||String(topic.title||'').toLocaleLowerCase('vi-VN').includes(x))?.72:.18;const n=ensureNpc(s,p.id,at);const d=primaryDream(n);return{p,n,score:relevance+(d?.priority||.5)*.12+rnd(`${seed}|${p.id}`)*.18}}).sort((x:any,y:any)=>y.score-x.score);const chosen=ranked[0];if(!chosen||chosen.score<.48)return;const npcId=chosen.p.id;const n=chosen.n;const g=primaryGoal(n);const id=`arc-world-${npcId}-${topic.id}`;let arc=s.arcs[id];if(!arc){arc={id,type:'world',ownerNpcId:npcId,title:`Một chuyện ngoài đời chạm vào “${g.title}”`,theme:'thế giới thật đi vào đời sống riêng',desire:g.whyItMatters,obstacle:'phân biệt thứ đáng thử với thứ chỉ đáng lướt',stakes:'tin chỉ có ý nghĩa khi nó đổi một câu hỏi, quyết định hoặc hành động thật',currentPhase:'vừa biết tin',startedAt:at,expectedDurationDays:7,progress:.08,tension:.34,relatedNpcIds:[],openLoops:[`Tin “${topic.title}” có thật sự thay đổi cách ${chosen.p.name||'NPC'} làm việc hay chỉ thành một tab nữa?`],importantMemories:[],beatIds:[],status:'active',dreamId:g.dreamId,goalId:g.id,topicId:topic.id};s.arcs[id]=arc;n.arcIds.push(id)}
  const who=String(chosen.p.name||'Người trong nhóm');
  const steps=[`${who} dừng lại ở tin “${topic.title}” vì nó chạm đúng mục tiêu “${g.title}”; chưa share, chỉ ghi lại một câu hỏi để thử`,`${who} chưa tin headline. Thay vì bàn tiếp, ${who} lấy đúng một chi tiết từ tin để làm thành test case cho “${g.title}”`,`${who} đem một chi tiết trong tin vào việc đang làm thật; nếu không giúp được mục tiêu hiện tại thì tin này sẽ bị bỏ khỏi đầu`,`${who} đã thử đủ để phải sửa lại ấn tượng ban đầu về “${topic.title}”; quan điểm bây giờ có trải nghiệm riêng ở dưới`];const idx=Math.min(steps.length-1,Math.floor(arc.progress*steps.length));const event=steps[idx];const type:StoryBeatType=idx===0?'discovery':idx===1?'decision':idx===2?'attempt':'consequence';arc.progress=clamp(arc.progress+.18);arc.currentPhase=idx===0?'vừa biết tin':idx===1?'đang nghi ngờ trước khi thử':idx===2?'đưa tin vào đời sống thật':'đã có trải nghiệm riêng với tin';const signal=.7+Number(topic.storyValue||.65)*.18;const beat:StoryBeatV238={id:`beat-world-${hash(`${id}|${at}`)}`,arcId:id,npcId,type,private:rnd(seed+'private')<.55,actors:[npcId],happenedAt:at,event,consequence:idx<2?'chưa có quan điểm cuối; NPC giữ tin ở trạng thái thử nghiệm':idx===2?`mục tiêu “${g.title}” có một thay đổi nhỏ trong cách làm`:'quan điểm bây giờ dựa trên trải nghiệm chứ không chỉ headline',emotionalImpact:'tò mò có điều kiện',signal,relatedTopicId:topic.id};arc.lastBeat=beat;arc.beatIds.push(beat.id);s.beats=[beat,...s.beats].slice(0,240);n.lastMeaningfulBeatAt=at;return beat;
};

const resumePausedGoalIfReady=(s:LifeStoryStateV238,n:NpcLifeStoryV238,at:number)=>{
  if(n.goals.some(g=>g.status==='active'))return;
  const g=n.goals.find(x=>x.status==='paused');if(!g||at-g.startedAt<36*3600_000)return;
  const d=primaryDream(n,g);g.status='active';g.confidence=Math.max(.36,g.confidence);g.currentStrategy=`thử lại nhỏ hơn: ${g.currentStrategy}`;g.startedAt=at;if(d&&d.status==='doubting'){d.status='active';d.lastChangedAt=at;d.history=[...d.history,{at,status:'active' as DreamStatus,reason:'sau một nhịp tạm dừng, vẫn thấy ước mơ này còn kéo mình quay lại'}].slice(-12)}
  n.chapter+=1;const arc:LifeArcV238={id:`arc-personal-${n.npcId}-${n.chapter}`,type:'personal',ownerNpcId:n.npcId,title:`Chương ${n.chapter}: quay lại sau khi tạm gác`,theme:'tạm dừng không đồng nghĩa biến mất',desire:g.whyItMatters,obstacle:g.obstacles[0]||'nỗi nghi ngờ cũ',stakes:`lần quay lại này sẽ cho biết mục tiêu còn sống thật hay chỉ sống vì tiếc công`,currentPhase:'quay lại bằng phiên bản nhỏ hơn',startedAt:at,expectedDurationDays:21,progress:g.progress,tension:.58,relatedNpcIds:[],openLoops:[`Sau 36 giờ không ép mình, việc “${g.title}” vẫn kéo NPC quay lại. Lần này khác gì?`],importantMemories:[`đã từng chủ động tạm gác ${g.title}`],beatIds:[],status:'active',dreamId:g.dreamId,goalId:g.id};s.arcs[arc.id]=arc;n.arcIds.push(arc.id);
};

export const heartbeatLifeStoriesV238=(personas:any[],topics:LifeStoryTopicLike[]=[],at=now())=>mutate(s=>{
  personas.forEach((p:any)=>{if(!p?.id)return;const n=ensureNpc(s,p.id,at);resumePausedGoalIfReady(s,n,at)});const previous=s.lastHeartbeatAt||0;const first=!previous;const elapsed=previous?Math.max(0,at-previous):3*3600_000;const slots=first?4:Math.min(5,Math.floor(elapsed/(32*60_000)));if(slots<=0){s.lastHeartbeatAt=at;return [] as StoryBeatV238[]}
  const out:StoryBeatV238[]=[];for(let i=0;i<slots;i++){const beatAt=first?at-(i+1)*(28+rnd(`${at}|${i}`)*22)*60_000:Math.min(at,previous+(i+1)*(elapsed/(slots+1)));const seed=`${Math.floor(beatAt/600000)}|${i}|story238`;const r=rnd(seed+'kind');let beat:StoryBeatV238|undefined;if(r<.2)beat=relationshipBeat(s,personas,beatAt,seed);else if(r<.32&&topics.length)beat=worldBeat(s,personas,topics,beatAt,seed);else{const ranked=personas.map((p:any)=>{const n=ensureNpc(s,p.id,beatAt);const g=primaryGoal(n);const arc=personalArc(s,n);const gap=Math.min(1,(beatAt-(n.lastLifeTickAt||0))/(6*3600_000));return{p,score:(1-(g?.confidence||.5))*.18+(arc?.tension||.5)*.22+(g?.progress||0)*.08+gap*.18+rnd(`${seed}|${p.id}`)*.34}}).sort((a:any,b:any)=>b.score-a.score);const p=ranked.find((x:any)=>!out.some(b=>b.npcId===x.p.id))?.p||ranked[0]?.p;if(p)beat=personalBeat(s,p.id,beatAt,seed)}if(beat)out.push(beat)}s.lastHeartbeatAt=at;return out;
});

export const getLifeStoryMomentsV238=(limit=8)=>{
  const s=loadLifeStoryStateV238();return s.beats.filter(b=>!b.private&&b.signal>=.64).sort((a,b)=>b.happenedAt-a.happenedAt).slice(0,limit).map(b=>({id:b.id,npcId:b.npcId,at:b.happenedAt,text:b.event,kind:b.relatedTopicId?'world_story':b.relatedNpcId?'relationship_story':'life_story',signal:b.signal,arcId:b.arcId,arcTitle:s.arcs[b.arcId]?.title||'',hook:b.type==='failure'?'vướng thật':b.type==='breakthrough'?'bước ngoặt':b.type==='repair'?'sửa một mối quan hệ':b.type==='discovery'?'phát hiện':'đời sống'}));
};

const statusVi=(s:DreamStatus)=>s==='doubting'?'đang nghi ngờ':s==='paused'?'tạm để lại':s==='transformed'?'đang đổi hình':s==='achieved'?'đã chạm tới':s==='abandoned'?'đã buông':'đang theo đuổi';
const goalStatusVi=(s:GoalStatus)=>s==='paused'?'tạm gác':s==='completed'?'đã hoàn thành':s==='abandoned'?'đã bỏ':'đang làm thật';

export const getNpcLifeCardV238=(npcId:string,relationshipScore=0,at=now())=>mutate(s=>{
  const n=ensureNpc(s,npcId,at);const g=primaryGoal(n);const d=primaryDream(n,g);const arc=personalArc(s,n);const recent=s.beats.find(b=>b.npcId===npcId);const closeness=clamp(Number(relationshipScore||0)/100);const revealPrivate=d?.visibility==='public'||(d?.visibility==='close_friends'&&closeness>.58)||(d?.visibility==='secret'&&closeness>.84);const lastPublic=s.beats.find(b=>b.npcId===npcId&&!b.private);const openLoop=arc?.openLoops?.[0]||'';const heat=clamp((arc?.tension||.4)*.34+(recent?.signal||.4)*.34+(g?.progress||0)*.12+(1-(g?.confidence||.5))*.12+(recent&&at-recent.happenedAt<6*3600_000?.08:0));return{dream:d?.publicDescription||'',dreamMeaning:revealPrivate?d?.privateMeaning:'',dreamStatus:statusVi(d?.status||'active'),goal:g?.title||'',goalWhy:g?.whyItMatters||'',goalStatus:goalStatusVi(g?.status||'active'),progress:g?.progress||0,confidence:g?.confidence||0,arcTitle:arc?.title||'',chapterLine:arc?`Chương ${n.chapter} · ${arc.currentPhase}`:'',openLoop,recentBeat:lastPublic?.event||n.publicSelfStory,recentBeatPrivate:false,publicSelfStory:n.publicSelfStory,storyHeat:heat,lastMeaningfulBeatAt:n.lastMeaningfulBeatAt||0};
});

export const getOpenLifeArcsV238=(limit=4)=>{
  const s=loadLifeStoryStateV238();return Object.values(s.arcs).filter(a=>a.status==='active').sort((a,b)=>{const ab=a.lastBeat?.happenedAt||a.startedAt;const bb=b.lastBeat?.happenedAt||b.startedAt;return (b.tension*.5+(bb/(now()||1))*.000001)-(a.tension*.5+(ab/(now()||1))*.000001)}).slice(0,limit).map(a=>({id:a.id,type:a.type,title:a.title,currentPhase:a.currentPhase,openLoop:a.openLoops[0]||'',progress:a.progress,tension:a.tension,ownerNpcId:a.ownerNpcId,relatedNpcIds:a.relatedNpcIds,lastBeat:a.lastBeat?.event||''}));
};

export const lifeStoryPromptContextV238=(npcId:string)=>{
  const s=loadLifeStoryStateV238();const n=s.npcs[npcId]||ensureNpc(s,npcId,now());const g=primaryGoal(n);const d=primaryDream(n,g);const arcs=n.arcIds.map(id=>s.arcs[id]).filter(Boolean).filter(a=>a.status==='active').slice(0,4);const recent=s.beats.filter(b=>b.npcId===npcId).slice(0,6);return{dream:{public:d?.publicDescription,privateMeaning:d?.privateMeaning,status:d?.status,priority:d?.priority,progress:d?.progress},goal:g?{title:g.title,whyItMatters:g.whyItMatters,emotionalMeaning:g.emotionalMeaning,target:g.target,progress:g.progress,confidence:g.confidence,obstacles:g.obstacles,currentStrategy:g.currentStrategy,status:g.status}:null,lifeDirection:n.publicSelfStory,privateTruths:n.privateTruths,activeArcs:arcs.map(a=>({type:a.type,title:a.title,theme:a.theme,desire:a.desire,obstacle:a.obstacle,stakes:a.stakes,currentPhase:a.currentPhase,openLoops:a.openLoops,lastBeat:a.lastBeat?.event})),recentBeats:recent.map(b=>({type:b.type,event:b.event,consequence:b.consequence,emotionalImpact:b.emotionalImpact,private:b.private,at:b.happenedAt})),rule:'Đây là cuộc đời đang chạy của nhân vật. Không dump state. Chỉ dùng một chi tiết khi nó thật sự giải thích phản ứng hiện tại, tạo callback, tự trào hoặc subtext. Ước mơ riêng/secret không được nói thẳng trừ khi quan hệ đủ thân hoặc tình huống tự nhiên làm nó lộ ra.'};
};

export const storyAwareFallbackV238=(npcId:string,stimulus:string,seed='')=>{
  const s=loadLifeStoryStateV238();const n=s.npcs[npcId]||ensureNpc(s,npcId,now());const g=primaryGoal(n);const arc=personalArc(s,n);const text=String(stimulus||'').toLocaleLowerCase('vi-VN');const fail=/thất bại|fail|lại|bỏ|trượt|không làm|không nổi/.test(text);const dream=/ước mơ|mục tiêu|muốn trở thành|sau này|mong/.test(text);const tired=/mệt|đuối|hết pin|kiệt/.test(text);const prefix=fail?pick([`Nghe chữ “lại” là tôi hơi dị ứng, vì ${g?.title||'việc tôi đang theo'} của tôi cũng có đoạn cứ muốn kéo mình về bản cũ.`,`Tôi không có tư cách nói câu “cứ cố lên” đâu. ${arc?.currentPhase||'Tôi cũng đang mắc một đoạn.'}`],`${npcId}|${seed}|fail`):dream?`Tôi đang theo “${g?.title||'một việc riêng'}” vì nó nối với chuyện lớn hơn: ${g?.whyItMatters||'tôi muốn biết mình có đi tới cùng được không'}.`:tired?`Tôi đang học một bài khá khó: mục tiêu vẫn quan trọng, nhưng không phải ngày nào cũng phải trả giá bằng sạch pin.`:`Chuyện này làm tôi nhớ tới cái arc mình đang mắc: ${arc?.title||g?.title||'một việc chưa xong'}.`;
  const tail=fail?'Nên tôi tò mò chuyện hôm nay là một cú trượt, hay nó đang chạm đúng nỗi sợ cũ của ông?':dream?'Ông đang muốn đạt một con số, hay thật ra muốn trở thành một kiểu người nào đó?':tired?'Mệt vì tải quá cao, hay vì một việc cứ chạy nền trong đầu?':'Nó chạm vào đoạn nào của chuyện ông đang theo?';return `${prefix} ${tail}`;
};

export const resetLifeStoryV238=()=>{try{localStorage.removeItem(KEY)}catch{}};
