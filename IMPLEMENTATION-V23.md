# The Habit Mosaic V23.8 — Life Story + Dreams + Goals + Soul Expression

## 1. Character DNA vẫn là nền
V23.7 giữ toàn bộ Character Constitution V23.6: core want/fear, contradiction, attention bias, care language, conflict/apology style, humor mechanics và pair chemistry. Personality tiếp tục ảnh hưởng cả việc NPC có để ý/phản ứng hay không, không chỉ câu chữ.

## 2. Soul Expression Engine V23.7
File mới: `src/lib/soulExpressionV237.ts`.

Trước khi câu thoại được sinh, runtime tạo `SOUL_EXPRESSION_V237` gồm:
- `emotionalLens`: đúng NPC này nhìn thấy điều gì trước.
- `empathyHypothesis`: giả thuyết về điều nằm dưới câu nói, luôn có bất định.
- `empathyMove`: động tác tâm lý chính (validation / give space / repair / tách event khỏi identity...).
- `subtext`: điều nhân vật thật sự muốn truyền nhưng không nói thẳng.
- `microBehavior` + `delivery`: nhịp câu, sự ngập ngừng, câu hỏi, mức giảm giọng.
- `humorPermission`, `humorMode`, `humorTarget`, `humorMove`: cổng hài hước theo tình huống.
- `forbiddenMoves`: cấm coach, cấm empathy syntax, cấm joke sai chỗ.

## 3. Hài hước có ngữ cảnh
Không còn “NPC vui tính => lấy joke”. Humor được chấm quyền dựa trên:
- mức nghiêm trọng của chuyện;
- độ thân/playfulness;
- humor fatigue;
- kiểu hài riêng của Character DNA;
- punchline đang nhắm vào ai.

Tình huống nặng => có thể bỏ joke hoàn toàn. Khi user tự hành mình, Mai có thể roast cái vòng tự chửi để đứng về phía user; Ken dùng deadpan event/pattern; Phúc dùng ngôn ngữ luật sư; Hải bẻ lái/tự bóc. Nỗi đau/xấu hổ/giá trị con người không được làm punchline.

## 4. Thấu cảm tinh tế hơn
`appraiseUserText()` nhận thêm:
- `repeatedFailure`: đặc biệt chú ý chữ “lại”.
- `minimizingAchievement`: “chỉ học được 15 phút”, “30 phút thôi” — nhận ra user đang thu nhỏ nỗ lực vì hụt kỳ vọng.
- `maskedDistress`: “ổn thôi / không sao / bình thường thôi” có thể là lớp che, không mặc định kết luận.
- `correctionSignal`: “không phải / ý tôi là / tôi nói nghiêm túc / hiểu sai”.
- `emotionalRisk`: giảm mạnh/cấm humor trong tình huống nặng.

Fallback cũng đã có câu riêng theo từng NPC cho các tình huống trên, nên ngay cả khi AI API lỗi vẫn không rơi về một câu empathy chung.

## 5. Cảm xúc có quán tính
Mỗi NPC có `emotionalResidue`:
- warmth
- worry
- irritation
- tenderness
- guilt
- admiration
- protectiveness
- awkwardness

Dư âm decay theo thời gian (không reset mỗi post) và đi vào Soul prompt lần sau. Sidebar/presence cũng có thể lộ dư âm gián tiếp, ví dụ “còn hơi cay nên ít lời”, “vẫn nhớ chuyện lúc nãy nhưng chưa muốn hỏi dồn”.

## 6. Hiểu sai và repair
Nếu user nói NPC hiểu sai/đùa sai nhịp:
- humorPermission = 0;
- NPC nhận đúng phần hiểu sai;
- không chống chế;
- xin lỗi ngắn nếu cần;
- hỏi lại đúng một câu.

`empathyCalibration` ghi số lần misread/repair để lần sau giảm certainty thay vì NPC luôn “thấu cảm hoàn hảo”.

## 7. Human follow-up
Sau một số tương tác nặng, NPC đủ quan tâm có xác suất quay lại sau 20 phút–4 giờ bằng một check-in ngắn như “Đỡ chưa?”. Không phải mọi lần đều follow-up. Pending action được persist nên có thể tới sau khi app đã đóng/mở lại.

## 8. NPC↔NPC cũng dí dỏm hơn
Heartbeat relationship dùng `personaPairChemistryLine()` khi cặp NPC có chemistry/playfulness cao, thay vì mọi tương tác đều là câu generic “hỏi một câu rồi ai về việc nấy”.

## 9. World Awareness
Giữ nguyên luật cứng:
- Tin/trend phải được chuẩn hóa sang tiếng Việt tự nhiên trước khi NPC nhìn thấy/nhắc tới/UI hiển thị.
- Được giữ tên riêng/thương hiệu cần thiết.
- Nguồn ngoại ngữ không chuyển ngữ fact-locked được => loại.
- Editorial gate vẫn loại tin filler/rác.

## 10. Rivalry
Giữ V23 Arena: Match Point / Elimination Point / Final Round, momentum, gap, counterattack, callbacks, first-to-4.

## Verification
`node VERIFY-CLEAN-V23.cjs` kiểm tra 36 cơ chế V23.8 trước TypeScript/build Electron.


## V23.8 — LIFE STORY / DREAMS / GOALS
- src/lib/lifeStoryV238.ts: dream engine, goal engine, personal/relationship/world arcs, story beats, open loops, private beats, story-aware prompt context.
- CommunityWorld.tsx: heartbeatLifeStoriesV238, story moments, dream/goal cards, open arc UI, lifeStoryContext into AI.
- desktop/main.cjs: Life Story is a causal layer before Soul Expression; no state dump, no secret leakage, story continuity required.
