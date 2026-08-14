export type RivalryStage='UNKNOWN'|'NOTICED'|'CHALLENGER'|'SERIOUS_RIVAL'|'RESPECTED_RIVAL'|'ARCHRIVAL';
export type MomentumState='CLOSING_IN'|'PULLING_AWAY'|'NECK_AND_NECK'|'COMEBACK'|'DOMINATING'|'UNDER_PRESSURE'|'LAST_STAND'|'EVEN';
export type RivalTrigger='match_open'|'habit_done'|'user_ahead_after_habit'|'legend_overtook'|'user_overtook'|'user_comeback'|'user_streak'|'user_slipping'|'late_nudge'|'new_round'|'user_chat'|'match_win'|'match_loss';

export interface RivalryMemoryItem{ id:string; kind:'promise'|'overtake'|'comeback'|'collapse'|'respect'|'taunt'|'repair'; text:string; at:string; salience:number; }
export interface RivalryPsychology{ stage:RivalryStage; respect:number; irritation:number; competitiveHeat:number; curiosity:number; reluctantAdmiration:number; protectiveness:number; lastBeat:string; memories:RivalryMemoryItem[]; }
export interface RivalryTimelineItem{ id:string; at:string; side:'user'|'legend'|'system'; label:string; delta?:number; detail?:string; }

const clamp=(v:number,min=0,max=1)=>Math.min(max,Math.max(min,v));
const hash=(v:string)=>{let h=2166136261;for(let i=0;i<v.length;i++){h^=v.charCodeAt(i);h=Math.imul(h,16777619);}return Math.abs(h>>>0)};
const rnd=(s:string)=>hash(s)/4294967295;

export const defaultRivalPsychology=():RivalryPsychology=>({stage:'UNKNOWN',respect:.12,irritation:.05,competitiveHeat:.35,curiosity:.25,reluctantAdmiration:.05,protectiveness:.03,lastBeat:'chưa biết đối thủ này có đáng để ý không',memories:[]});

export const rivalryStageFor=(p:RivalryPsychology,meetings:number,closeRounds:number):RivalryStage=>{
  if((meetings>=18||closeRounds>=9)&&p.respect>.74&&p.competitiveHeat>.72)return'ARCHRIVAL';
  if((meetings>=10||closeRounds>=5)&&p.respect>.62)return'RESPECTED_RIVAL';
  if((meetings>=6||closeRounds>=3)&&p.competitiveHeat>.6)return'SERIOUS_RIVAL';
  if(meetings>=3||p.respect>.38)return'CHALLENGER';
  if(meetings>=1||p.curiosity>.38)return'NOTICED';
  return'UNKNOWN';
};

export const updateRivalPsychology=(prev:RivalryPsychology,trigger:RivalTrigger,ctx:{gap:number;seriesUser:number;seriesLegend:number;habit?:string;userText?:string;at?:string})=>{
  const p:{[K in keyof RivalryPsychology]:RivalryPsychology[K]}={...prev,memories:[...(prev.memories||[])]};
  const add=(kind:RivalryMemoryItem['kind'],text:string,salience=.6)=>{p.memories=[...p.memories,{id:`rm-${hash(`${kind}|${text}|${ctx.at||Date.now()}`)}`,kind,text,at:ctx.at||new Date().toISOString(),salience}].slice(-40)};
  if(trigger==='habit_done'){p.respect=clamp(p.respect+.025);p.curiosity=clamp(p.curiosity+.02);p.competitiveHeat=clamp(p.competitiveHeat+.04);p.lastBeat='đối thủ vừa ghi điểm; trận đang nóng lên';}
  if(trigger==='user_ahead_after_habit'||trigger==='user_overtook'){p.irritation=clamp(p.irritation+.08);p.respect=clamp(p.respect+.055);p.reluctantAdmiration=clamp(p.reluctantAdmiration+.06);p.competitiveHeat=clamp(p.competitiveHeat+.1);p.lastBeat='vừa bị vượt; hơi cay nhưng không thể coi thường nữa';add('overtake',`User đã vượt với ${ctx.habit||'một hành động thật'}`,.82);}
  if(trigger==='legend_overtook'){p.competitiveHeat=clamp(p.competitiveHeat+.065);p.irritation=clamp(p.irritation-.02);p.lastBeat='vừa lấy lại thế dẫn; muốn ép đối thủ phải phản công';add('taunt','Rival đã vượt lại user',.62);}
  if(trigger==='user_comeback'){p.respect=clamp(p.respect+.08);p.reluctantAdmiration=clamp(p.reluctantAdmiration+.08);p.curiosity=clamp(p.curiosity+.05);p.competitiveHeat=clamp(p.competitiveHeat+.08);p.lastBeat='ngạc nhiên vì đối thủ quay lại đúng lúc tưởng đã nguội';add('comeback','User quay lại sau nhịp tụt',.86);}
  if(trigger==='user_slipping'){p.protectiveness=clamp(p.protectiveness+.04);p.competitiveHeat=clamp(p.competitiveHeat-.02);p.lastBeat='không muốn thắng vì đối thủ biến mất; muốn kéo trận quay lại';}
  if(trigger==='late_nudge'){p.protectiveness=clamp(p.protectiveness+.015);p.competitiveHeat=clamp(p.competitiveHeat+.015);p.lastBeat='cuối ngày; chỉ cần một câu đủ để biến áp lực thành lựa chọn';}
  if(trigger==='match_win'){p.respect=clamp(p.respect+.12);p.reluctantAdmiration=clamp(p.reluctantAdmiration+.1);p.competitiveHeat=clamp(p.competitiveHeat+.06);p.lastBeat='thua trận nhưng mức tôn trọng tăng mạnh';add('respect','User thắng cả series',.95);}
  if(trigger==='match_loss'){p.respect=clamp(p.respect+.025);p.lastBeat='đã thắng nhưng chưa coi đối thủ là xong';}
  if(trigger==='user_chat'&&ctx.userText){if(/mai|sẽ|nhất định|vượt|thắng|ăn|hạ|đè|lấy lại/.test(ctx.userText.toLocaleLowerCase('vi-VN')))add('promise',ctx.userText.slice(0,160),.78);p.competitiveHeat=clamp(p.competitiveHeat+.015);}
  const meetings=(p.memories?.length||0)+Math.round(p.respect*6);const closeRounds=Math.abs(ctx.seriesUser-ctx.seriesLegend)<=1?2:0;p.stage=rivalryStageFor(p,meetings,closeRounds);
  return p as RivalryPsychology;
};

export const momentumState=(args:{gap:number;previousGap?:number;seriesUser:number;seriesLegend:number;round:number;projectedGap?:number}):MomentumState=>{
  const pg=args.previousGap??args.gap;const improving=Math.abs(args.gap)<Math.abs(pg)||args.gap>pg;
  if(args.round>=6&&args.seriesUser<args.seriesLegend&&args.projectedGap!==undefined&&args.projectedGap>=0)return'LAST_STAND';
  if(Math.abs(args.gap)<=.12)return'NECK_AND_NECK';
  if(args.seriesUser<args.seriesLegend&&args.gap>-.35&&improving)return'COMEBACK';
  if(args.gap>1.2)return'DOMINATING';
  if(args.gap>.25)return'PULLING_AWAY';
  if(args.gap<-.9)return'UNDER_PRESSURE';
  if(args.gap<-.18&&improving)return'CLOSING_IN';
  return'EVEN';
};

export const momentumLabel=(m:MomentumState)=>({CLOSING_IN:'ĐANG ÁP SÁT',PULLING_AWAY:'ĐANG NỚI DẪN',NECK_AND_NECK:'SÁT NÚT',COMEBACK:'COMEBACK',DOMINATING:'ĐANG ÁP ĐẢO',UNDER_PRESSURE:'ĐANG BỊ DỒN',LAST_STAND:'LƯỢT SINH TỬ',EVEN:'GIẰNG CO'})[m];
export const stageLabel=(s:RivalryStage)=>({UNKNOWN:'Chưa để ý',NOTICED:'Đã để ý',CHALLENGER:'Kẻ thách đấu',SERIOUS_RIVAL:'Đối thủ thật sự',RESPECTED_RIVAL:'Đối thủ đáng nể',ARCHRIVAL:'Kỳ phùng địch thủ'})[s];

export type RivalFallbackContext={
  gap:number;habit?:string;stage:RivalryStage;memory?:RivalryMemoryItem;seed:string;
  seriesUser?:number;seriesLegend?:number;round?:number;userScore?:number;legendScore?:number;remaining?:number;nextHabit?:string;
};

export const situationalFallback=(legend:{id:string;name:string},trigger:RivalTrigger,ctx:RivalFallbackContext)=>{
  const close=Math.abs(ctx.gap)<.22;const h=ctx.habit||ctx.nextHabit||'việc đó';const su=ctx.seriesUser??0;const sl=ctx.seriesLegend??0;const round=ctx.round??1;const matchPointUser=su===3&&sl<3;const matchPointLegend=sl===3&&su<3;const finalRound=su===3&&sl===3;const rem=Math.max(0,ctx.remaining??Math.abs(Math.min(0,ctx.gap)));
  const stakes=finalRound?'Lượt bảy. Không còn lượt sau.':matchPointUser?`Cậu đang dẫn ${su}-${sl}. Thắng lượt này là đóng series.`:matchPointLegend?`Tôi đang dẫn ${sl}-${su}. Cậu thua lượt này là hết.`:`Series ${su}-${sl}, round ${round}.`;
  const variants:Record<RivalTrigger,string[]>={
    match_open:['Bảy lượt. Đừng giới thiệu bản thân. Để bảng điểm làm việc.','Kèo khóa rồi. Tôi không cần kế hoạch của cậu — tôi cần ngày đầu.'],
    habit_done:[`“${h}” xong. Tôi thấy. Còn ${rem.toFixed(2)} nữa mới lấy lượt này.`,`Một đòn thật. Tốt. Nhưng bảng vẫn chưa đổi chủ.`,`Được. ${h} tính điểm. Giờ xem cậu có nối được đòn thứ hai không.`],
    user_ahead_after_habit:['...Được. Cậu đang đứng trên tôi. Giữ nổi đến hết ngày không?','Ghế đổi chủ rồi. Tôi chưa rời sân.','Tận hưởng mấy phút này đi. Tôi vẫn còn lượt của mình.'],
    legend_overtook:[`Tôi lấy lại rồi. ${stakes}`,`Bảng vừa quay về phía tôi. Đến lượt cậu phản công.`],
    user_overtook:[`Ồ. Cậu vừa kéo tên mình lên trên tôi. ${stakes}`,'Được. Lần này bảng điểm đứng về phía cậu. Tôi muốn xem cậu giữ được bao lâu.'],
    user_comeback:['Tôi tưởng cậu nguội rồi. Hóa ra cậu chỉ đang lấy đà.','Ờ. Quay lại thật. Vậy trận này mới đáng nhìn.'],
    user_streak:['Chuỗi này đủ dài để tôi thôi gọi là hên.','Tôi bắt đầu phải tính đến cậu trong mỗi lượt rồi đấy.'],
    user_slipping:[`Cậu đang để tôi đi xa đấy. Còn ${rem.toFixed(2)} để kéo lượt về.`,`Tôi không cần thắng vì cậu biến mất. Phản công đi.`],
    late_nudge:[`Ngày sắp khóa. ${h} vẫn còn trên bàn. Cậu cần ${rem.toFixed(2)} để kéo lượt này.`,`Tôi đang giữ lượt. Đồng hồ thì không đứng về phía cậu.`],
    new_round:[`${stakes} Bảng hôm nay trắng lại.`,`Round ${round}. Hôm qua cất đi. Lượt này mới tính.`],
    user_chat:[`Nói nghe được đấy. Nhưng hiện tại bảng là ${Number(ctx.userScore??0).toFixed(2)}–${Number(ctx.legendScore??0).toFixed(2)}.`,`Tôi nghe. Giờ biến câu đó thành điểm đi.`,`Gáy xong chưa? Còn ${rem.toFixed(2)} nữa mới chạm tôi.`],
    match_win:['Được. Series này của cậu. Tôi công nhận — một lần thôi.','Cậu chốt được. Lần sau tôi sẽ nhớ cái cách cậu kéo trận này về.'],
    match_loss:['Tôi lấy series. Đừng biến trận thua này thành lý do biến mất.','Hết lượt. Tôi hơn. Phục thù thì cứ mở lại.']
  };
  let pool=variants[trigger]||variants.user_chat;
  if(close&&trigger==='habit_done')pool=['Sát rồi đấy. Một đòn nữa là bảng đổi màu.','Tôi thấy cậu ở ngay sau lưng rồi.'];
  if(matchPointUser&&ctx.gap<0&&(trigger==='late_nudge'||trigger==='habit_done'||trigger==='user_chat'||trigger==='user_slipping'))pool=[`Ba–${sl}. Cậu chỉ cần lấy hôm nay là kết thúc. Nhưng hiện tại lượt này vẫn là của tôi.`,`Match point của cậu, nhưng bảng hôm nay đang nghiêng về tôi. Đừng nhầm series với round.`];
  if(matchPointLegend&&ctx.gap<0&&(trigger==='late_nudge'||trigger==='user_slipping'||trigger==='user_chat'))pool=[`Lượt sinh tử. Tôi đang giữ lợi thế. Cậu muốn còn series thì phải lấy nó.`,`Thua hôm nay là hết. Tôi sẽ không nhắc lần hai.`];
  if(ctx.memory?.kind==='promise'&&(trigger==='user_overtook'||trigger==='match_win'))pool=[`Lần này cậu giữ lời thật.`,`Hóa ra câu “${ctx.memory.text.slice(0,45)}” không phải gáy suông.`];
  return pool[hash(`${legend.id}|${ctx.seed}|${trigger}|${su}-${sl}|${round}`)%pool.length];
};

export const isWeakRivalLine=(text:string)=>{
  const t=String(text||'').trim();const low=t.toLocaleLowerCase('vi-VN');
  if(!t||t.length>240)return true;
  if(/cố lên|đừng bỏ cuộc|hãy tin|kỷ luật là chìa khóa|hỏi hay thì cứ hỏi|làm thật mới tài|giữ cho bền|phát triển.*làm thật/.test(low))return true;
  if((low.match(/\b(hỏi|thật|bền)\b/g)||[]).length>=3&&t.length>80)return true;
  return false;
};

export const rivalPromptPayload=(args:{psychology:RivalryPsychology;momentum:MomentumState;gap:number;previousGap:number;projectedGap:number;remaining:number;memory?:RivalryMemoryItem;seriesUser?:number;seriesLegend?:number;round?:number;nextHabit?:string})=>({
  rivalryStage:args.psychology.stage,
  relationshipState:{respect:args.psychology.respect,irritation:args.psychology.irritation,competitiveHeat:args.psychology.competitiveHeat,reluctantAdmiration:args.psychology.reluctantAdmiration,protectiveness:args.psychology.protectiveness},
  momentum:args.momentum,gap:args.gap,previousGap:args.previousGap,projectedGap:args.projectedGap,remainingPoints:args.remaining,
  seriesUser:args.seriesUser??0,seriesLegend:args.seriesLegend??0,roundNumber:args.round??1,nextHabit:args.nextHabit||'',
  matchPoint:(args.seriesUser===3&&Number(args.seriesLegend)<3)?'USER_MATCH_POINT':(args.seriesLegend===3&&Number(args.seriesUser)<3)?'RIVAL_MATCH_POINT':(args.seriesLegend===3&&args.seriesUser===3)?'FINAL_ROUND':'NONE',
  callbackMemory:args.memory?`${args.memory.kind}: ${args.memory.text}`:'không có callback đủ mạnh',
  subtextRule:'Đối thủ phải có điều không nói thẳng: nể nhưng không muốn sến, hơi cay nhưng vẫn muốn trận hay, hoặc quan tâm nhưng thể hiện bằng việc kéo người kia quay lại. Không dùng motivational quote. Mỗi câu phải tạo cảm giác đây là một cuộc đấu có điểm, lượt và hậu quả.'
});

export const simulatedLegendActivity=(legendId:string,round:number,target:number,at=new Date())=>{
  const h=at.getHours();const day=at.toISOString().slice(0,10);const r=rnd(`${legendId}|${day}|${round}|activity`);const progress=h<7?.08:h<10?.32:h<14?.55:h<18?.72:h<22?.9:1;const offDay=r<.18;const achieved=Math.max(0,target*progress*(offDay?.72:.92+r*.12));
  const state=h<7?'chưa vào lượt':h<12?'đang làm block đầu':h<18?'đã vào nhịp':h<22?'đang chốt lượt':'đã đóng lượt';
  return{state,progress:Math.min(1,progress),simulatedScore:Number(achieved.toFixed(2)),offDay,note:offDay?'Hôm nay benchmark cũng không ở phong độ đẹp.':'Benchmark đang bám đúng phương pháp của đối thủ.'};
};
