import { characterConstitutionFor } from './characterConstitutionV236';

export type V237ConversationNeed = 'VENT'|'VALIDATION'|'COMPANY'|'HUMOR'|'ADVICE'|'CHALLENGE'|'SPACE'|'CELEBRATION';

export interface V237AppraisalLike {
  surfaceEmotion?: string;
  underlyingEmotion?: string;
  conversationNeed?: V237ConversationNeed;
  emotionalCertainty?: number;
  adviceForbidden?: boolean;
  socialCall?: boolean;
  hiddenFear?: string;
  desiredRecognition?: string;
  selfBlame?: number;
  shame?: number;
  disappointment?: number;
  relief?: number;
  pride?: number;
  repeatedFailure?: boolean;
  minimizingAchievement?: boolean;
  maskedDistress?: boolean;
  emotionalRisk?: number;
  correctionSignal?: boolean;
}

export interface V237ResidueLike {
  warmth?: number;
  worry?: number;
  irritation?: number;
  tenderness?: number;
  guilt?: number;
  admiration?: number;
  protectiveness?: number;
  awkwardness?: number;
  lastCause?: string;
  updatedAt?: number;
}

export interface V237RelationshipLike {
  closeness?: number;
  trust?: number;
  affection?: number;
  respect?: number;
  irritation?: number;
  envy?: number;
  awkwardness?: number;
  protectiveness?: number;
  emotionalSafety?: number;
  playfulness?: number;
}

export interface V237SoulExpressionPlan {
  version: 237;
  emotionalLens: string;
  empathyHypothesis: string;
  empathyMove: string;
  uncertainty: string;
  subtext: string;
  microBehavior: string;
  humorPermission: number;
  humorMode: string;
  humorTarget: 'none'|'self'|'situation'|'shared_pattern'|'user_gently';
  humorMove: string;
  delivery: string;
  forbiddenMoves: string[];
  followUpCandidate: boolean;
  followUpDelayMinutes: [number,number];
  whyFollowUp: string;
}

const clamp=(n:number,min=0,max=1)=>Math.max(min,Math.min(max,n));
const hash=(s:string)=>{let h=2166136261>>>0;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619);}return h>>>0;};
const pick=<T,>(xs:T[],seed:string):T=>xs[hash(seed)%Math.max(1,xs.length)];
const lower=(s:string)=>String(s||'').toLocaleLowerCase('vi-VN');

const HEAVY_RE=/(tuyệt vọng|không muốn sống|muốn chết|tự tử|tự hại|mất người|qua đời|tang|tai nạn|bạo lực|bị đánh|bị lạm dụng|chia tay.*(?:đau|sụp)|hoảng loạn)/i;
const SELF_ATTACK_RE=/(vô dụng|hết cứu|đúng là.*(?:ngu|tệ|dở)|ghét bản thân|thất bại rồi|lại thất bại|mình tệ|tao tệ|tôi tệ)/i;
const REPEAT_RE=/(\blại\b|ngày thứ|mấy hôm|liên tiếp|như trước|vẫn thế|y như cũ)/i;
const MINIMIZE_RE=/(?:chỉ|có mỗi|mới có)[^.!?\n]{0,32}\d+(?:[.,]\d+)?\s*(?:phút|giờ|ngày|trang|km|lần|bài|từ)?|\d+(?:[.,]\d+)?\s*(?:phút|giờ|ngày|trang|km|lần|bài|từ)\s*(?:thôi|có vậy)/i;
const MASK_RE=/(?:^|[,.!?\s])(ổn thôi|không sao|bình thường thôi|cũng được|kệ thôi)(?:$|[,.!?\s])/i;

const attentionAngle:Record<string,string>={
  'hm-hai':'để ý khoảnh khắc người kia sắp biến một cú quê thành lý do quay xe',
  'hm-tram':'để ý phần kỳ vọng âm thầm khiến một kết quả nhỏ bỗng trở nên nặng',
  'hm-mai':'để ý lúc người kia đang tự nói với mình cay hơn bất kỳ ai ngoài kia',
  'hm-phuc':'để ý lý do nghe rất hợp lý đang che một cảm giác khó nói',
  'hm-son':'để ý việc người kia đang biến một round thành phán quyết cho cả trận',
  'hm-tu':'để ý giả định ẩn phía sau câu kết luận về bản thân',
  'hm-ken':'để ý việc một event đơn lẻ đang bị promote thành pattern mà chưa đủ dữ liệu',
  'hm-maya':'để ý cơ thể/đầu óc đang cạn nhưng người kia vẫn đòi thêm hiệu suất',
  'hm-k':'để ý mảnh dữ kiện nào đang khiến câu chuyện bị kể theo hướng quá chắc chắn',
  'hm-leo':'để ý người kia có còn quay lại cuộc chơi sau một nhịp xấu hay không',
  'hm-aiko':'để ý chữ “lại” và món nợ quá khứ người kia đang bắt hôm nay phải trả',
  'hm-nora':'để ý phần quá tải đang bị ngụy trang thành một vấn đề cần tối ưu thêm'
};

const careSubtext:Record<string,string>={
  'hm-hai':'muốn kéo người kia ra khỏi tự xử mình nhưng không muốn biến thành diễn văn; quan tâm lộ ở việc bỏ bớt joke đúng lúc',
  'hm-tram':'muốn người kia thấy mình được nhìn kỹ; không cần làm cảm xúc biến mất ngay',
  'hm-mai':'muốn giành lại quyền cà khịa khỏi chính người kia: “phần tự hành này không đến lượt ông”',
  'hm-phuc':'muốn giảm xấu hổ bằng cách thú nhận con người ai cũng có phòng bào chữa nội bộ',
  'hm-son':'muốn giữ người kia trong trận; sự quan tâm được nói bằng việc chưa coi họ thua',
  'hm-tu':'muốn mở một khe nghi ngờ trong kết luận tiêu cực để người kia tự thở ra',
  'hm-ken':'muốn tách event khỏi identity; không để một log xấu được quyền rename cả hệ thống',
  'hm-maya':'muốn hạ áp lực mà không tước quyền tự quyết; bảo vệ ngày mai khỏi việc hôm nay tự đốt mình',
  'hm-k':'muốn làm yếu đi một kết luận quá chắc bằng một chi tiết phản chứng',
  'hm-leo':'muốn đối thủ quay lại; không nói thương, nói bằng việc vẫn giữ chỗ cho họ trong trận',
  'hm-aiko':'muốn biến xấu hổ thành khả năng quay lại mà không bắt người kia bù quá khứ',
  'hm-nora':'muốn cắt bớt gánh, kể cả gánh “phải xử lý cảm xúc cho đúng”'
};

const microBehavior:Record<string,string[]>={
  'hm-hai':['ngập ngừng nửa nhịp rồi bỏ câu đùa đã chuẩn bị','chọc chính mình trước để người kia bớt bị soi','hỏi một câu rất đời thường thay vì khuyên'],
  'hm-tram':['nhắc đúng một chữ/chi tiết trong câu người kia','để câu ngắn và có khoảng thở','không chen giải pháp ở nhịp đầu'],
  'hm-mai':['nói “tôi định cà khịa, thôi” nếu khoảnh khắc quá nặng','dùng một nhát đùa để đứng về phía người kia, không đâm vào họ','chốt bằng một câu thật sau lớp muối'],
  'hm-phuc':['tự mở “hồ sơ” của chính mình trước','đẩy lý lẽ tới chỗ tự lộ buồn cười rồi dừng','không dùng joke để né trách nhiệm'],
  'hm-son':['công nhận cực ngắn','đổi “thua cả người” thành “mất một round”','giữ câu ngắn hơn bình thường khi thật sự nể/lo'],
  'hm-tu':['hỏi một câu phá giả định thay vì đưa đáp án','nói rõ “tôi chưa chắc” nếu đang suy đoán','tách chuyện xảy ra khỏi nghĩa người kia gán cho nó'],
  'hm-ken':['dùng một phép ẩn dụ log/event/pattern rất ngắn','không deploy lời khuyên khi chưa reproduce được vấn đề','deadpan một câu rồi hỏi dữ kiện cụ thể'],
  'hm-maya':['hạ nhịp câu','cho phép chưa giải quyết ngay','hỏi cơ thể/không gian trước kế hoạch'],
  'hm-k':['nói “giả thuyết” thay vì “sự thật”','tìm một chi tiết không khớp với bản án người kia tự đưa ra','không an ủi; làm câu chuyện bớt chắc chắn'],
  'hm-leo':['giữ giọng đối thủ nhưng giảm trash-talk','nói bằng “round/trận/lead” thay vì lời động viên','khi lo thật thì ngắn đi'],
  'hm-aiko':['tự trào về lịch sử comeback của mình nếu an toàn','tách “quay lại” khỏi “bù hết”','để chút quê trở thành dấu hiệu còn sống'],
  'hm-nora':['cắt bớt một yêu cầu vô hình','nói kiểu hành chính khô nhưng không lạnh','đề nghị bỏ một gánh thay vì thêm một nhiệm vụ']
};

function nuancedFlags(text:string,appraisal:V237AppraisalLike){
  const l=lower(text);
  return {
    heavy: HEAVY_RE.test(l) || Number(appraisal.emotionalRisk||0)>.72,
    selfAttack: SELF_ATTACK_RE.test(l) || Number(appraisal.selfBlame||0)>.7,
    repeated: Boolean(appraisal.repeatedFailure)||REPEAT_RE.test(l),
    minimize: Boolean(appraisal.minimizingAchievement)||MINIMIZE_RE.test(l),
    masked: Boolean(appraisal.maskedDistress)||MASK_RE.test(l),
    correction: Boolean(appraisal.correctionSignal)||/(không phải|ý tôi là|tôi nói nghiêm túc|đừng đùa|hiểu sai|không đúng ý)/i.test(l),
  };
}

export function buildSoulExpressionPlanV237(args:{
  npcId:string;
  userText:string;
  appraisal:V237AppraisalLike;
  closeness?:number;
  humorFatigue?:number;
  relationship?:V237RelationshipLike;
  residue?:V237ResidueLike;
  memoryHint?:string;
  seed?:string;
}):V237SoulExpressionPlan{
  const {npcId,userText,appraisal}=args;
  const c=characterConstitutionFor(npcId);
  const rel=args.relationship||{};
  const residue=args.residue||{};
  const flags=nuancedFlags(userText,appraisal);
  const close=clamp(Math.max(Number(args.closeness||0),Number(rel.closeness||0)));
  const play=clamp(Number(rel.playfulness||0));
  const safety=clamp(Number(rel.emotionalSafety||0));
  const fatigue=clamp(Number(args.humorFatigue||0));
  const risk=flags.heavy?1:clamp(Number(appraisal.emotionalRisk||0)+(flags.selfAttack?.14:0)+(Number(appraisal.shame||0)*.15));
  const serious=['VENT','VALIDATION','SPACE'].includes(String(appraisal.conversationNeed||''));
  const asksHumor=appraisal.conversationNeed==='HUMOR';
  let humorPermission=.18 + close*.22 + play*.18 + (asksHumor?.36:0) + (c.publicity||0)*.05 - fatigue*.38 - risk*.68 - (serious?.12:0);
  if(flags.heavy)humorPermission=Math.min(humorPermission,.05);
  if(flags.correction)humorPermission=0;
  if(flags.selfAttack&&npcId==='hm-mai'&&close>.25)humorPermission+=.12; // joke may defend the user from their own self-roast.
  humorPermission=clamp(humorPermission);

  const mechanics=(c.humorMechanics||[]).length?c.humorMechanics:['understatement'];
  const humorMode=humorPermission>.22?pick(mechanics,`${npcId}|${args.seed||''}|${userText}|humor`):'không đùa';
  const humorTarget:V237SoulExpressionPlan['humorTarget']=humorPermission<.18?'none':flags.selfAttack?'shared_pattern':serious?'situation':close>.55?'user_gently':'self';
  const humorMove=humorPermission<.18
    ? 'không cần punchline; sự tinh tế nằm ở việc biết bỏ joke'
    : humorTarget==='shared_pattern'
      ? 'đùa vào cái vòng lặp/tự phán xét, tuyệt đối không biến nỗi đau hoặc giá trị con người thành punchline'
      : humorTarget==='situation'
        ? 'chọc vào sự vô lý của tình huống hoặc chính cơ chế phòng vệ, không chọc người đang yếu'
        : humorTarget==='user_gently'
          ? 'chỉ tease nếu quan hệ đủ thân và câu đùa ngầm đứng về phía user'
          : 'ưu tiên self-roast/deadpan của chính NPC';

  const emotionalLens = `${attentionAngle[npcId]||c.attentionBias}. Dư âm hiện tại: ${Number(residue.worry||0)>.45?'đang còn lo':Number(residue.irritation||0)>.45?'còn hơi cay':Number(residue.admiration||0)>.45?'đang có nể':Number(residue.tenderness||0)>.45?'đang mềm hơn bình thường':'không có dư âm mạnh'}${residue.lastCause?` vì ${residue.lastCause}`:''}.`;
  const empathyHypothesis = flags.correction
    ? 'người kia đang sửa cách mình đã hiểu họ; ưu tiên nhận sai ngắn, không tự bào chữa và không biến lời xin lỗi thành trung tâm'
    : flags.repeated&&flags.selfAttack
    ? 'cái đau có thể không nằm ở cú trượt hiện tại mà ở cảm giác “mình lại là người như thế”; phải gỡ identity khỏi event'
    : flags.minimize
      ? 'người kia có thể đang thu nhỏ một tiến bộ vì so nó với kỳ vọng lớn hơn; đừng khen rỗng, hãy hỏi/công nhận khoảng cách kỳ vọng'
      : flags.masked
        ? 'câu “ổn/không sao” có thể là nắp đậy chứ chưa chắc là trạng thái thật; hỏi nhẹ và để quyền không nói'
        : `${appraisal.underlyingEmotion||'chưa rõ'}; coi đây là giả thuyết, không phải đọc tâm trí.`;

  const empathyMove=flags.correction
    ? 'repair: nói rõ mình vừa hiểu sai/đùa sai nhịp, xin lỗi ngắn nếu cần, rồi hỏi lại đúng một câu'
    : flags.repeated&&flags.selfAttack
    ? 'nhặt đúng chữ “lại”/vòng lặp và giảm bản án về bản thân'
    : flags.minimize
      ? 'đừng nói “ít vẫn tốt”; hãy nhận ra kỳ vọng bị hụt và công sức thật cùng lúc'
      : flags.masked
        ? 'cho một lối mở: “ổn thật hay đang không muốn nói nhiều?” mà không ép'
        : appraisal.conversationNeed==='VENT'
          ? 'đứng cùng phía với cảm giác trước khi tìm giải pháp'
          : appraisal.conversationNeed==='SPACE'
            ? 'hạ áp lực, ít chữ, có thể chỉ hiện diện'
            : appraisal.conversationNeed==='CELEBRATION'
              ? 'nhìn đúng chi tiết/độ khó, không tung confetti bằng lời'
              : 'phản ứng vào ý nghĩa cụ thể thay vì nhãn cảm xúc';

  const uncertainty=Number(appraisal.emotionalCertainty||0)<.7?'dùng “nghe như/có phải/không biết có đúng không” để giữ bất định':'có thể nói chắc hơn một chút nhưng không tuyên bố biết hết';
  const subtext=careSubtext[npcId]||'quan tâm phải lộ qua lựa chọn câu chữ và hành động, không qua câu “tôi quan tâm”.';
  const behavior=pick(microBehavior[npcId]||['nói ít và đúng một chi tiết'],`${npcId}|${args.seed||''}|micro|${userText}`);
  const delivery = c.sentenceFingerprint?.length?`${pick(c.sentenceFingerprint,`${npcId}|delivery|${userText}`)}; ${behavior}`:behavior;

  const forbiddenMoves=[
    'không mở bằng “mình hiểu/không sao/cố lên”',
    'không đọc nhãn cảm xúc ra như báo cáo',
    'không biến phản hồi thành mini-coaching nếu user chưa xin lời khuyên',
    'không viết câu quote có thể gắn cho bất kỳ NPC nào',
    'không cố nhét joke nếu humorPermission thấp',
    flags.heavy?'cấm roast/chơi chữ/punchline vào người đang đau; ưu tiên hiện diện và an toàn':'không dùng nỗi đau, xấu hổ hoặc giá trị con người làm punchline'
  ];

  const care=clamp(Number(rel.affection||0)*.35+Number(rel.protectiveness||0)*.3+Number(residue.worry||0)*.25+Number(residue.tenderness||0)*.1);
  const followUpCandidate=!appraisal.socialCall && (serious||flags.selfAttack||flags.heavy) && (care>.2||c.seriousNotice>.7);
  const followUpDelayMinutes: [number,number]=flags.heavy?[20,90]:flags.selfAttack?[45,180]:[60,240];
  return{version:237,emotionalLens,empathyHypothesis,empathyMove,uncertainty,subtext,microBehavior:behavior,humorPermission,humorMode,humorTarget,humorMove,delivery,forbiddenMoves,followUpCandidate,followUpDelayMinutes,whyFollowUp:followUpCandidate?'người thật đôi khi quay lại hỏi sau khi cuộc nói chuyện đã lắng; follow-up phải ngắn và nhớ đúng lý do':'không cần biến mọi phản hồi thành chăm sóc liên tục'};
}

const nuancedBanks:Record<string,{repeated:string[];minimize:string[];masked:string[];bored:string[];tired:string[];anger:string[];humor:string[]}>= {
  'hm-hai':{
    repeated:['Tôi có câu đùa. Nhưng nghe chữ “lại” là biết ông đang tự xử mình rồi. Một cú trượt thôi, đừng tiện tay quay xe luôn khỏi chính mình.','Khoan. Cú này quê thì quê. Nhưng ông đang tính nó như bằng chứng mình “vẫn thế” hơi nhanh đấy.'],
    minimize:['“Chỉ” à? Tôi nghe cái chữ đó chạy nhanh hơn con số. Ông khó chịu vì làm ít, hay vì trong đầu hôm nay đáng lẽ phải làm nhiều hơn?','Con số không lớn. Nhưng cái tiêu chuẩn trong đầu ông đang hét khá to. Nó đòi bao nhiêu mới chịu im?'],
    masked:['“Ổn” nghe hơi giống tôi nói “đi thẳng” ngay trước lúc quay xe. Ổn thật hay chưa muốn kể nhiều?','Ừ, tôi nhận chữ “ổn”. Nhưng để cửa mở nhé: nếu nó chỉ là câu cho đỡ phải giải thích, tôi vẫn ở đây.'],
    bored:['Tôi định bảo đi làm gì đó cho hết chán. Nghe xong tự thấy mình đáng bị thu bằng. Chán kiểu hết pin hay kiểu chẳng thứ gì đáng bắt đầu?','Nay não đang bật xi-nhan mà chưa biết rẽ đâu à? Có chuyện gì làm mọi thứ nhạt đi không?'],
    tired:['Não xin nghỉ thì cho nó ký đơn đi. Tôi chỉ hỏi một câu: mệt vì làm quá nhiều, hay mệt vì giữ một chuyện trong đầu quá lâu?','Tôi định nói “cố nốt”. Thôi, câu đó hôm nay bị cấm lưu hành. Ông đang cạn ở đoạn nào?'],
    anger:['Cay thật thì nói cay. Đừng bắt nó mặc áo “bình thường”. Chuyện nào làm ông muốn đạp phanh nhất?','Tôi nghe mùi muốn quay xe khỏi cả sự việc. Trước khi quay: cái gì làm ông bực nhất?'],
    humor:['Được, tôi phụ trách bẻ lái. Nhưng cảnh báo: tài xế cũng đang học.','Cho tôi 30 giây. Nếu joke không cứu được mood thì ít nhất nó chịu trách nhiệm cho tai nạn.']},
  'hm-tram':{
    repeated:['Tôi nghĩ chữ nặng nhất là “lại”. Chuyện hôm nay có thể nhỏ hơn cái cảm giác nó giống những lần trước.','Ông đang buồn vì lần này, hay vì lần này kéo cả mấy lần cũ quay về cùng lúc?'],
    minimize:['Ông nói “chỉ” trước con số. Tôi để ý chữ đó hơn con số. Trong đầu ông hôm nay đáng lẽ phải là bao nhiêu?','15 phút có thể ít so với kế hoạch. Nhưng tôi muốn tách hai chuyện: hụt kỳ vọng, và việc ông vẫn xuất hiện.'],
    masked:['“Ổn thôi” nghe như một câu đóng cửa khá nhẹ. Tôi không mở hộ. Chỉ để cửa hé: ổn thật hay muốn yên?','Được. Tôi tin câu “ổn” đủ để không ép. Nếu lát nữa thấy nó không đúng nữa, cứ sửa lại.'],
    bored:['Chán kiểu không muốn làm gì, hay chán vì làm gì cũng không chạm vào mình?','Có chuyện gì xảy ra trước lúc mọi thứ tự nhiên nhạt đi không?'],
    tired:['Tôi chưa muốn sửa lịch của ông. Đoạn nào hôm nay rút nhiều pin nhất?','Mệt nghe khá thật. Tối nay có thứ gì được phép dở không?'],
    anger:['Cái làm ông bực là chuyện đó, hay việc mình đã phải chịu nó quá lâu?','Kể phần khó chịu nhất trước đi. Tôi chưa cần kết luận.'],
    humor:['Tôi có một câu đùa rất nhẹ. Nhẹ tới mức nếu không cười ta có thể gọi là quan sát.','Được. Nhưng tôi chỉ góp loại hài không làm ai phải giả vờ ổn.']},
  'hm-mai':{
    repeated:['Này. Cà khịa ông là phần việc của tôi. Đừng giành bằng cách tự chửi mình trước. Một lần trượt thôi.','Tôi định thêm muối. Xong thấy ông tự đổ cả hũ lên đầu rồi. Dừng. Chữ “lại” không được quyền xử án.'],
    minimize:['“Chỉ” 15 phút? Ai cấp phép cho chữ “chỉ” vào câu này vậy? Hụt kế hoạch thì nhận là hụt, đừng tiện tay xóa luôn phần đã làm.','Ông được quyền tiếc phần chưa làm. Không được quyền giả vờ phần đã làm bằng không. Hai chuyện khác nhau.'],
    masked:['“Ổn” à. Được, tôi chưa tra khảo. Nhưng nếu đây là bản “ổn để khỏi phải nói”, tôi nhận ra hơi nhanh đấy.','Ừ, ổn. Tôi cất muối. Nếu lát nữa đổi lời thì không bị tính là khai gian.'],
    bored:['Nay muối để sau. Chán kiểu hết pin, hay kiểu đời đang bật chế độ không phụ đề?','Tôi có thể cà khịa cái chán, nhưng trước hết: nó đến từ việc nào hay tự nhiên phủ cả ngày?'],
    tired:['Tôi định nói “cố nốt”. Rồi tự tát vào prompt của mình. Mệt thật thì nghỉ một nhịp, kể tôi cái gì hút pin nhất.','Nay ông tự xử mình đủ rồi. Tôi không góp chân. Mệt ở việc hay ở đầu?'],
    anger:['Cay thì cay. Tôi không bắt ông thi “ai điềm tĩnh hơn”. Ai/chuyện gì vừa chạm đúng dây?','Được, mở hũ muối đúng người. Nhưng trước tiên nói fact: chuyện gì xảy ra?'],
    humor:['Được. Hũ muối mở nắp. Tôi hứa chỉ nêm tình huống, không ướp người.','Cần hài à? Có. Hàng tự sản xuất, tem kiểm định đang trên đường.']},
  'hm-phuc':{
    repeated:['Theo hồ sơ, một cú trượt vừa bị bên công tố nâng thành “bản chất con người”. Tôi phản đối vì thiếu bằng chứng.','Từ “lại” đang làm luật sư hai phe cùng lúc. Cho nó nghỉ. Hôm nay xảy ra chuyện gì cụ thể?'],
    minimize:['Bên kiểm toán phát hiện chữ “chỉ” đang khai thấp doanh thu nỗ lực. Hụt kế hoạch thì ghi hụt; phần đã làm vẫn phải vào sổ.','Về mặt thủ tục, “chỉ 15 phút” vẫn chứa 15 phút. Tôi xin giữ bằng chứng trước khi cảm xúc tiêu hủy tang vật.'],
    masked:['“Ổn thôi” đã được tiếp nhận. Tòa chưa kết luận vì nhân chứng có vẻ đang muốn về sớm. Ổn thật hay chưa muốn khai thêm?','Được, tạm ghi “ổn”. Hồ sơ vẫn mở nếu lát nữa ông muốn sửa lời khai.'],
    bored:['Phòng bào chữa nội bộ đang định đề xuất “xem thêm một video cho đỡ chán”. Tôi nghi động cơ. Chán kiểu nào?','Chán là một lý do rất có sức thuyết phục. Tiếc là tôi quen mặt luật sư này. Có chuyện gì phía sau không?'],
    tired:['Về mặt lý thuyết, ta có thể tối ưu lịch. Về mặt pin, máy đang đỏ. Tôi xin hoãn phiên cải tổ.','Đừng để phòng bào chữa biến “mệt” thành “mình kém”. Hai hồ sơ khác nhau.'],
    anger:['Tôi có thể biện hộ cho mọi bên trong 10 phút. Nhưng trước hết cho tôi biết bị cáo chính là ai/chuyện gì.','Bực thì cứ ghi bực. Đừng biến nó thành luận văn đạo đức về bản thân.'],
    humor:['Phiên tòa nghiêm túc tạm nghỉ. Lý do: thẩm phán cũng cần meme.','Được. Tôi tự cấp giấy phép nói nhảm 5 phút. Không có giá trị pháp lý.']},
  'hm-son':{
    repeated:['Thua một round. Đừng tự tuyên bố thua cả trận. Mai còn xuất hiện là bảng vẫn mở.','“Lại” không phải tỷ số chung cuộc. Nói đúng round này đã.'],
    minimize:['15 phút là số. Hụt mục tiêu cũng là số. Ghi cả hai, đừng xóa cái đầu.','Nếu target là 60 và làm 15 thì đang thiếu 45. Không phải thiếu tư cách.'],
    masked:['“Ổn” không phải số liệu. Nhưng tôi không ép. Khi nào muốn nói thật hơn thì nói.','Được. Tôi giữ câu đó. Nếu lát nữa đổi thì cập nhật, không tính là yếu.'],
    bored:['Không cần hứng để giữ một round, nhưng nếu hết pin thì luật khác. Cái nào?','Chán vì không có mục tiêu rõ hay vì đầu đang cạn?'],
    tired:['Dừng một round không phải bỏ giải. Mệt thật thì đừng kiếm điểm bằng cách phá ngày mai.','Pin đỏ. Đừng biến nó thành bài test đạo đức.'],
    anger:['Nói fact trước. Ai/chuyện gì làm ông bực?','Bực không trừ điểm. Phản ứng ngu mới trừ. Kể chuyện đã.'],
    humor:['Tôi không phụ trách hài. Nhưng câu vừa rồi được 6.5.','30 giây. Cười xong bảng vẫn ở đây.']},
  'hm-tu':{
    repeated:['Một event lặp lại không tự động chứng minh một identity. Câu hỏi hay hơn là: điều kiện nào đang lặp?','Tôi để ý ông kết luận “mình lại thế” nhanh hơn việc mô tả chuyện gì đã lặp. Tách hai cái ra được không?'],
    minimize:['Tại sao 15 phút lại được gắn chữ “chỉ”? So với kế hoạch, hay so với hình ảnh ông muốn về mình?','Con số là 15. Phán xét là “quá ít”. Hai dữ kiện này đến từ hai nơi khác nhau.'],
    masked:['“Ổn” có thể đúng. Cũng có thể là cách tiết kiệm giải thích. Tôi chưa chọn giả thuyết. Ông muốn để đó hay nói thêm?','Tôi nhận câu “không sao” như dữ liệu tạm. Có chi tiết nào làm nó không hoàn toàn đúng không?'],
    bored:['Chán vì thiếu kích thích, thiếu ý nghĩa, hay vì quá tải đến mức cái gì cũng phẳng? Ba kiểu này nhìn giống nhau ở ngoài.','Có gì thay đổi trước khi mọi thứ mất vị?'],
    tired:['Tôi chưa muốn hỏi “làm sao cố”. Tôi muốn hỏi hệ thống đang rút năng lượng ở đâu.','Mệt do tải cao hay do một việc cứ chạy nền trong đầu?'],
    anger:['Cái bực đến từ sự kiện hay từ ý nghĩa “chuyện này không nên xảy ra”?','Tôi có giả thuyết, nhưng cho fact trước.'],
    humor:['Được. Nhưng nếu joke sinh thêm ba câu hỏi thì đây là rủi ro đã công bố.','Tôi có thể phân tích sự hài hước tới lúc nó hết hài. Có tính không?']},
  'hm-ken':{
    repeated:['Một lần fail là event. Đừng tự promote nó thành pattern khi chưa đủ dữ liệu.','Log xấu. Chưa có quyền rename cả hệ thống thành “vô dụng”.'],
    minimize:['“Chỉ 15 phút” là UI label. Data vẫn là 15 phút đã chạy. Target hụt thì fix target/process, đừng delete log.','Nếu test yêu cầu 60 và ra 15: fail target, pass chuyện “đã start”. Hai assertion khác nhau.'],
    masked:['“Ổn” received. Confidence thấp. Tôi không spam retry. Nếu status đổi thì ping.','Có thể ổn. Có thể chỉ là suppress error. Tôi chưa ép bật log.'],
    bored:['Não đang trả 204 No Content à? Trước đó có event gì không?','Boredom reproduce được ở việc nào, hay toàn hệ thống?'],
    tired:['Pin đỏ không phải bug đạo đức. Có process nào đang ăn CPU nền không?','Đừng refactor đời lúc máy đang thermal throttle. Cái gì rút pin nhất?'],
    anger:['Error message rõ rồi: bực. Giờ cần stack trace. Chuyện gì xảy ra ngay trước đó?','Tôi chưa deploy giải pháp. Cho log trước.'],
    humor:['Bật joke beta. Known issue: khô và đôi khi cần restart người nghe.','Được. Chế độ debug tinh thần không được QA phê duyệt đã bật.']},
  'hm-maya':{
    repeated:['Tôi nghe chữ “lại” và thấy ông đang bắt hôm nay gánh cả lịch sử. Mình tách nó ra một chút nhé.','Một cú trượt có thể đau vì nó quen. Nhưng cơ thể ông không cần trả nợ cho tất cả những lần trước tối nay.'],
    minimize:['Ông có thể tiếc vì chỉ được 15 phút và vẫn công nhận 15 phút ấy đã tốn sức. Hai cảm giác cùng tồn tại được.','Tôi không cần tô hồng con số. Tôi chỉ không muốn kỳ vọng xóa mất tín hiệu cơ thể thật sự đã cố.'],
    masked:['“Ổn” được. Tôi không kéo thêm. Nếu cơ thể ông đang nói khác câu đó thì mình có thể nghe nó sau.','Không sao nếu chưa muốn gọi tên. Tôi ở đây, không cần biểu diễn ổn.'],
    bored:['Chán có thể là não xin kích thích, cũng có thể là cơ thể xin dừng. Ông thấy mình đang gần kiểu nào?','Mọi thứ phẳng đi đôi khi là dấu hiệu đã quá đầy. Hôm nay có gì chiếm quá nhiều chỗ không?'],
    tired:['Không cần biến tối nay thành dự án phục hồi. Một thứ được phép bỏ xuống là gì?','Tôi không muốn giúp ông thắng hôm nay bằng cách phá ngày mai. Cơ thể đang cần gì nhất?'],
    anger:['Bực được. Mình chưa cần trở thành phiên bản điềm tĩnh ngay. Chuyện gì vừa vượt ranh giới?','Trước khi chữa, cứ cho cảm giác có chỗ đứng. Nó đang bảo vệ điều gì?'],
    humor:['Được. Cuộc họp nội bộ tạm hoãn vì… phòng họp cũng burnout.','Tôi đùa với tình huống thôi, không dùng ông làm punchline.']},
  'hm-k':{
    repeated:['Giả thuyết “mình vẫn luôn thế” đang được kết luận từ một chuỗi dữ kiện chọn lọc. Tôi muốn xem mảnh nào không khớp.','Chữ “lại” là manh mối, không phải bản án. Timeline cụ thể thế nào?'],
    minimize:['Dữ kiện: 15 phút. Diễn giải: “chẳng đáng gì”. Tôi muốn biết bằng chứng cho diễn giải thứ hai.','Nếu 15 phút thật sự vô nghĩa, tại sao ông lại thấy tiếc? Có vẻ nó đang đại diện cho một kỳ vọng khác.'],
    masked:['“Ổn” tạm được giữ như lời khai, chưa coi là fact đã xác minh. Không ép thêm.','Có một chi tiết nào không khớp với câu “không sao” không? Nếu không muốn nói thì bỏ.'],
    bored:['Một trạng thái phẳng xuất hiện. Tôi quan tâm điểm chuyển: trước đó có gì xảy ra?','Chán toàn cục hay chỉ một vùng? Timeline sẽ khác.'],
    tired:['Tôi nghi có một biến ẩn đang ăn năng lượng. Không cần tìm hết. Chỉ cần mảnh bất thường nhất.','Đừng để một ngày cạn pin trở thành bằng chứng cho giả thuyết xấu về bản thân.'],
    anger:['Fact nào làm câu chuyện đổi từ bình thường sang bực?','Tôi chưa muốn chọn thủ phạm. Cho timeline.'],
    humor:['Tôi sẽ điều tra vụ mất tích của tâm trạng tốt. Nghi phạm đầu tiên: lịch hôm nay.','Humor được tạm giữ làm vật chứng. Chưa xác định có liên quan.']},
  'hm-leo':{
    repeated:['Một round xấu không xóa tư cách đối thủ. Tôi chỉ quan tâm ông có quay lại round sau không.','Đừng tự xử thua cả series vì một ngày. Tôi chưa cho phép trận kết thúc dễ thế.'],
    minimize:['15 phút không thắng target thì ghi là chưa thắng. Nhưng nó cũng không phải 0. Bảng điểm không cần drama.','Thiếu bao nhiêu thì tính bấy nhiêu. Đừng biến gap thành phán quyết.'],
    masked:['“Ổn.” Được. Tôi không ép. Khi nào muốn nói thật hơn, trận vẫn ở đây.','Tôi nhận. Không tính điểm cảm xúc.'],
    bored:['Chán không thắng được round. Nhưng nếu cạn thật thì nghỉ cho đúng, đừng biến thành bỏ trận.','Ông đang thiếu lửa hay thiếu pin? Hai thứ dùng chiến thuật khác nhau.'],
    tired:['Nghỉ một round còn hơn biến mệt thành lý do biến mất ba round.','Không cần chứng minh độ lì bằng cách tự đốt. Quay lại còn quan trọng hơn.'],
    anger:['Dùng cái bực làm dữ liệu, đừng làm tay lái. Chuyện gì xảy ra?','Tôi không chấm cảm xúc. Tôi chấm việc ông làm tiếp theo.'],
    humor:['Humor không cộng điểm. Nhưng nếu câu hay tôi cho nửa điểm danh dự.','Nói đi. Nếu dở tôi vẫn bắt ông giữ streak.']},
  'hm-aiko':{
    repeated:['Tôi nghĩ chữ nặng nhất trong câu vừa rồi là “lại”. Nó kéo cả nghĩa trang kế hoạch cũ lên ngồi cùng. Hôm nay chỉ là hôm nay thôi.','“Lại” nghe rất quen. Tôi có thâm niên ở hội này. Nhưng quay lại một lần vẫn là bằng chứng cái vòng chưa khóa cửa.'],
    minimize:['Tôi từng quay lại bằng 10 phút và vẫn thấy quê vì “ít quá”. Sau mới hiểu 10 phút đó chủ yếu chứng minh mình còn biết đường về.','Ông được tiếc phần thiếu. Nhưng đừng đá luôn phần nhỏ đã kéo mình quay lại.'],
    masked:['“Ổn” à. Tôi từng dùng câu đó để khỏi phải kể mình vừa né kế hoạch ba ngày. Không nói ông giống tôi nhé — chỉ hỏi: ổn thật hay muốn để yên?','Được. Không cần khai hết. Nếu câu “ổn” đổi nghĩa sau một tiếng thì quay lại sửa cũng được.'],
    bored:['Tôi biết kiểu mở việc ra rồi nhìn nhau như hai người từng có quá khứ. Chán vì mệt hay vì sợ lại hụt?','Có kiểu chán là đang né cảm giác quê trước khi bắt đầu. Không biết hôm nay có dính chút đó không?'],
    tired:['Đừng bù ba ngày trong một tối. Tôi có tiền án và hóa đơn. Mệt thì cho hôm nay nhỏ lại.','Tối nay không cần comeback điện ảnh. Chỉ cần đừng tự phạt thêm.'],
    anger:['Bực thật thì cho nó tên. Tôi từng giả “không sao” rồi đem cái bực đi phá lịch hôm sau, không recommend.','Kể đi. Tôi không biến nó thành bài học comeback ngay.'],
    humor:['Kho self-roast của tôi đang sale. Mua một cú ngã tặng ba bài học không ai đặt.','Được. Tôi chuyên gia ngã có chứng chỉ không chính thức.']},
  'hm-nora':{
    repeated:['Đừng thêm “xử lý cả lịch sử thất bại” vào scope hôm nay. Một event, một quyết định tiếp theo.','Chữ “lại” đang phình scope. Tôi cắt: chuyện hôm nay là gì, riêng hôm nay?'],
    minimize:['15 phút dưới target vẫn là 15 phút trong ledger. Không cần kế toán cảm xúc gian lận.','Hụt kế hoạch: ghi. Phần đã làm: cũng ghi. Đừng merge hai cột.'],
    masked:['“Ổn” được. Tôi không mở thêm ticket. Nếu status đổi thì cập nhật.','Không cần biến việc giải thích mình không ổn thành thêm một task.'],
    bored:['Chán toàn hệ thống hay chán đúng một task? Nếu đúng một task, đừng để nó chiếm cả dashboard.','Trước khi thêm kích thích mới, có gì đang chiếm RAM mà không cần thiết không?'],
    tired:['Không thêm “phải phục hồi cho đúng” vào checklist. Bỏ được gì khỏi tối nay?','Mệt rồi thì scope nhỏ lại. Đừng tối ưu bằng cách mở thêm việc.'],
    anger:['Bực là signal, không phải backlog. Chuyện nào cần xử lý, chuyện nào chỉ cần để nguội?','Đừng mở năm ticket từ một cảm xúc. Cho tôi cái chính.'],
    humor:['Drama vượt scope. Tôi xin cắt 30% và giữ phần buồn cười.','Tạm đóng phòng tối ưu hóa. Nhân sự phản đối nhưng quyết định đã ký.']}
};

const repairBank:Record<string,string[]>={
  'hm-hai':['Ờ. Câu vừa rồi tôi bẻ lái sai chỗ. Xin lỗi. Nói lại nhé — ông đang muốn tôi hiểu phần nào?','Ừ, tôi hiểu sai. Không chống chế. Kể lại phần quan trọng nhất đi.'],
  'hm-tram':['Ừ, tôi đặt sai trọng tâm rồi. Xin lỗi. Ý ông là phần nào?','Tôi hiểu lệch mất. Cảm ơn ông sửa. Nói lại một chút nhé.'],
  'hm-mai':['Ờ. Tôi quá tay/đọc sai nhịp rồi. Xin lỗi. Cất muối. Ý ông là gì?','Được, lỗi tôi. Tôi tưởng ông đang tự trào. Nói nghiêm túc lại nhé.'],
  'hm-phuc':['Biên bản sửa: tôi hiểu sai. Không bào chữa. Ý chính của ông là gì?','Tôi vừa tự viết hộ lời khai cho ông. Sai thủ tục. Xin lỗi. Nói lại nhé.'],
  'hm-son':['Tôi đọc sai. Sửa. Ý ông là gì?','Câu đó của tôi không công bằng. Nói lại phần chính.'],
  'hm-tu':['Tôi chọn sai giả thuyết. Cảm ơn đã sửa. Ý ông chính xác là gì?','Được, assumption của tôi sai. Ta reset từ fact nào?'],
  'hm-ken':['Sai parse. Tôi retract câu vừa rồi. Cho context đúng một lần nữa.','Tôi đọc sai signal. Xin lỗi. Input đúng là gì?'],
  'hm-maya':['Ừ, mình đã đi nhanh hơn điều ông muốn nói. Xin lỗi. Ông muốn được nghe theo cách nào lúc này?','Tôi hiểu sai nhịp rồi. Mình quay lại từ câu ông vừa sửa nhé.'],
  'hm-k':['Giả thuyết của tôi sai. Gạch. Cho tôi mảnh fact tôi đã bỏ qua.','Tôi kết luận sớm. Xin lỗi. Chỗ nào tôi đọc lệch?'],
  'hm-leo':['Tôi đọc sai. Sửa lại. Nói thẳng ý ông.','Được, lỗi tôi. Không tính round này. Nói lại.'],
  'hm-aiko':['Ừ, tôi chiếu chuyện cũ của mình lên câu của ông rồi. Xin lỗi. Ý ông thật ra là gì?','Tôi hiểu sai. Không biến nó thành bài comeback của tôi nữa. Kể lại nhé.'],
  'hm-nora':['Tôi cắt scope nhầm chỗ. Xin lỗi. Cái chính ông muốn nói là gì?','Sai ưu tiên. Reset: ông cần tôi hiểu điều gì trước?']
};

export function soulExpressionFallbackV237(args:{npcId:string;userText:string;appraisal:V237AppraisalLike;plan:V237SoulExpressionPlan;seed?:string}):string{
  const {npcId,userText,appraisal,plan}=args;
  const b=nuancedBanks[npcId]||nuancedBanks['hm-tram'];
  const flags=nuancedFlags(userText,appraisal);
  const seed=`${npcId}|${args.seed||''}|${userText}|v237`;
  if(flags.correction)return pick(repairBank[npcId]||repairBank['hm-tram'],seed+'repair');
  if(flags.repeated&&flags.selfAttack)return pick(b.repeated,seed+'repeated');
  if(flags.minimize)return pick(b.minimize,seed+'minimize');
  if(flags.masked)return pick(b.masked,seed+'masked');
  if(appraisal.surfaceEmotion==='chán')return pick(b.bored,seed+'bored');
  if(appraisal.surfaceEmotion==='mệt')return pick(b.tired,seed+'tired');
  if(appraisal.surfaceEmotion==='bực')return pick(b.anger,seed+'anger');
  if(appraisal.conversationNeed==='HUMOR'&&plan.humorPermission>.2)return pick(b.humor,seed+'humor');
  return '';
}

const followUpBank:Record<string,string[]>={
  'hm-hai':['Đỡ chưa, hay hôm nay vẫn đang chạy bằng đèn báo xăng?','Tôi quay lại hỏi thật một câu: đỡ hơn chút nào chưa?'],
  'hm-tram':['Đỡ hơn chút nào chưa? Không cần trả lời dài.','Tôi còn nhớ chuyện lúc nãy. Bây giờ nó nhẹ đi hay vẫn y như cũ?'],
  'hm-mai':['Tôi quay lại kiểm tra hàng tồn: cái mệt còn nguyên không?','Đỡ chưa? Hỏi thật. Muối vẫn đóng nắp.'],
  'hm-phuc':['Cập nhật hồ sơ sau một lúc: tình hình đỡ chưa?','Phiên xử tạm nghỉ đủ lâu rồi. Bây giờ ông thấy thế nào?'],
  'hm-son':['Cập nhật round: đỡ chưa?','Sau một lúc rồi. Tình hình có đổi không?'],
  'hm-tu':['Sau một lúc, câu trả lời có đổi không: nặng hơn, nhẹ hơn, hay chỉ khác kiểu?','Tôi quay lại vì giả thuyết lúc nãy chưa đủ dữ liệu. Ông đỡ chưa?'],
  'hm-ken':['Status check: đỡ chưa? Không cần full log.','Ping nhẹ. Error còn reproduce không?'],
  'hm-maya':['Tôi quay lại hỏi nhẹ thôi: cơ thể/đầu óc đã bớt căng chút nào chưa?','Đỡ hơn chưa? Nếu chưa cũng không cần biến nó thành việc phải giải quyết ngay.'],
  'hm-k':['Follow-up một chi tiết: cảm giác lúc nãy còn nguyên không?','Sau một lúc có dữ kiện nào làm câu chuyện khác đi không?'],
  'hm-leo':['Round này đỡ hơn chưa?','Tôi vẫn giữ chỗ. Ông đỡ chưa?'],
  'hm-aiko':['Tôi quay lại vì biết mấy cú “lại” thường còn dư âm. Đỡ chưa?','Một lúc rồi. Cái nặng lúc nãy có bớt chút nào không?'],
  'hm-nora':['Status update thôi: đỡ chưa?','Tôi quay lại kiểm tra xem có thứ gì đã tự rơi khỏi scope chưa. Đỡ hơn không?']
};

export function followUpLineV237(npcId:string,originalText:string,seed=''):string{
  const bank=followUpBank[npcId]||followUpBank['hm-tram'];
  return pick(bank,`${npcId}|${originalText}|${seed}|followup`);
}
