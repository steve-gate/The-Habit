/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini
  const genAI = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || "",
    httpOptions: { headers: { 'User-Agent': 'aistudio-build' } }
  });

  // API Route for personalized reminders
  app.post("/api/reminders", async (req, res) => {
    try {
      const { streak, habits, theme, bookTitle } = req.body;
      
      let prompt = '';
      const mindsetInstruction = "Áp dụng tư duy phát triển (Growth Mindset): nếu chuỗi bị đứt, đừng trách móc, hãy coi đó là dữ liệu để tối ưu hóa hệ thống. Nếu chuỗi cao, hãy tôn vinh nỗ lực bền bỉ thay vì tài năng bẩm sinh.";
      
      if (theme === 'custom' && bookTitle) {
        prompt = `Bạn là một người cố vấn tri thức, bạn đồng hành tâm huyết khích lệ người rèn luyện thói quen và đọc/nghiên cứu sâu tác phẩm "${bookTitle}".
        Người dùng đang thực hiện các thói quen nhằm thẩm thấu cuốn sách/dự án này và đạt chuỗi thành tựu (streak) liên tiếp là ${streak} ngày.
        Danh xưng/Công việc của họ: ${habits.length > 0 ? habits.join(', ') : 'Rèn luyện bản thân'}.
        ${mindsetInstruction}
        Hãy viết một câu lời dặn đôn đốc tinh thần, ngắn gọn (dưới 30 từ), đầy tri thức, cảm hứng triết học và đúc kết tinh tế để nhắc họ hoàn thành thói quen hôm nay để tiếp tục hành trình bồi đắp tri thức của cuốn sách "${bookTitle}".
        Ngôn ngữ: Tiếng Việt.`;
      } else {
        const style = theme === 'wuxia' ? 'võ hiệp (Wuxia)' : 'thám tử Sherlock Holmes';
        prompt = `Bạn là một người hướng dẫn thói quen theo phong cách ${style}.
          Người dùng đang có chuỗi ngày (streak) là ${streak}.
          Danh xưng: ${habits.length > 0 ? habits.join(', ') : 'Chưa có thói quen'}.
          ${mindsetInstruction}
          Hãy viết một câu nhắc nhở cá nhân hóa, ngắn gọn (dưới 30 từ), hài hước, dí dỏm, đầy động lực và đúng phong cách nhân vật để nhắc họ hoàn thành mảnh ghép thói quen hôm nay. Đừng ngại "cà khịa" nhẹ nhàng nếu người dùng đang lười biếng.
          Ngôn ngữ: Tiếng Việt.`;
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ message: response.text ? response.text.trim() : "" });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate reminder" });
    }
  });

  // API Route for Side Quests
  app.post("/api/side-quest", async (req, res) => {
    try {
      const { theme, habits, bookTitle } = req.body;
      
      let prompt = '';
      const atomicHabitInstruction = "Áp dụng quy tắc 'Thói quen 2 phút' (Atomic Habits): nhiệm vụ phải cực kỳ nhỏ, dễ thực hiện ngay lập tức để tạo đà (momentum).";
      
      if (theme === 'custom' && bookTitle) {
        prompt = `Bạn là một người dẫn đường tri thức thúc đẩy hành động thực tiễn dựa trên cuốn sách "${bookTitle}".
        Người dùng đang thực hiện thói quen: ${habits.join(', ')}.
        ${atomicHabitInstruction}
        Hãy tạo DUY NHẤT 1 "Nhiệm vụ phụ" (Side Quest) ĐỂ NGƯỜI DÙNG THỰC HIỆN NGAY, lấy cảm hứng từ sách "${bookTitle}".
        TUYỆT ĐỐI NGẮN GỌN (DƯỚI 20 TỪ). KHÔNG GIẢI THÍCH. KHÔNG DÀI DÒNG. TRỰC TIẾP GIAO NHIỆM VỤ.
        Ngôn ngữ: Tiếng Việt.`;
      } else {
        const style = theme === 'wuxia' ? 'võ hiệp' : 'Sherlock Holmes';
        const context = theme === 'sherlock' ? "Rèn luyện khả năng quan sát chi tiết." : "Rèn luyện trực giác và sự tĩnh lặng.";
        
        prompt = `Bạn là một hệ thống giao nhiệm vụ phong cách ${style}.
          Người dùng tập các thói quen: ${habits.join(', ')}.
          ${atomicHabitInstruction}
          ${context}
          Hãy tạo DUY NHẤT 1 "Nhiệm vụ phụ" (Side Quest) dưới 20 từ.
          TUYỆT ĐỐI KHÔNG GIẢI THÍCH, KHÔNG CHÀO HỎI, KHÔNG PHÂN TÍCH THÓI QUEN. CHỈ GHI RA CÂU NHIỆM VỤ CẦN LÀM.
          Ngôn ngữ: Tiếng Việt.`;
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ quest: response.text ? response.text.trim() : "" });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate quest" });
    }
  });

  // API Route for Persona Comments (Deep understanding of books)
  app.post("/api/generate-persona-comment", async (req, res) => {
    try {
      const { personaName, personaRole, bookTitle, postContent, category, bookContent } = req.body;
      
      const contextInfo = bookTitle 
        ? `- Tác phẩm đang thảo luận: "${bookTitle}"\n        - Nội dung trích đoạn từ sách: "${bookContent ? bookContent : "Không có dữ liệu bài viết"}"\n        - Nội dung bài đăng của người dùng: "${postContent}"` 
        : `- Chủ đề: "${category}"\n        - Nội dung bài đăng của người dùng: "${postContent}"`;

      const prompt = `Bạn là ${personaName}, có vai trò là "${personaRole}". 
      Bạn đang tham gia một mạng xã hội của cộng đồng những người đam mê tri thức và rèn luyện.
      Người dùng vừa chia sẻ: "${postContent}".
      
      Nhiệm vụ: Viết một lời bình luận (comment) súc tích (khoảng 30-60 từ).
      
      Bối cảnh kiến thức (Context): 
      ${contextInfo}
      
      Yêu cầu để bình luận GIỐNG NGƯỜI THẬT nhất:
      1. GIỌNG ĐIỆU CÁ NHÂN HÓA CAO: Đừng nói như một cái máy hay AI trả lời câu hỏi. Hãy dùng các thán từ mộc mạc (Ví dụ: "Trời ơi", "Wow", "Haha", "Ơ kìa"...).
      2. TÍCH CỰC, HÀI HƯỚC & DÍ DỎM: Bình luận phải mang năng lượng tích cực, hài hước, mặn mà, tinh tế và duyên dáng (kiểu vô tri đáng yêu hoặc sắc sảo một cách buồn cười, tùy persona của bạn). Hãy tham khảo cách nói chuyện của những GenZ hoặc những người vui tính trên mạng xã hội.
      3. ĐỌC VÀ PHÂN TÍCH SÂU THỰC SỰ: 
         - Nếu có "Nội dung trích đoạn từ sách": LỰA CHỌN MỘT Ý TƯỞNG HAY NHẤT, sâu sắc nhất từ phần trích đoạn đó để bình luận về BÀI ĐĂNG CỦA NGƯỜI DÙNG. Phân tích nội dung chia sẻ đó theo một góc nhìn mới lạ, sắc sảo dưới hệ quy chiếu của ${personaName}. Tuyệt đối không bình luận chung chung, máy móc. Hãy mượn ý trong sách để ví von một cách hài hước, NHƯNG CHỦ ĐỀ CHÍNH VẪN PHẢI LÀ NỘI DUNG NGƯỜI DÙNG CHIA SẺ, KHÔNG PHẢI CUỐN SÁCH.
         - Nếu KHÔNG có sách: Đưa ra một góc nhìn độc đáo, dí dỏm bằng cách BÌNH LUẬN TRỰC TIẾP vào "Nội dung bài đăng của người dùng" dựa vào chất giọng của ${personaName}.
      4. NGÔN NGỮ TỰ NHIÊN: Tiếng Việt đời thường, phong phú, đôi khi là những câu "cà khịa" hài hước để người ta bàn luận thêm. Bỏ những từ sáo rỗng như "Cố lên", "Tuyệt vời". Mọi thứ phải "mặn chát" nhưng duyên!
      
      Ngôn ngữ: Tiếng Việt.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ comment: response.text ? response.text.trim() : "" });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate comment" });
    }
  });

  // API Route for Story Unlocks
  app.post("/api/story-unlock", async (req, res) => {
    try {
      const { theme, progress, bookTitle } = req.body;
      
      let prompt = '';
      if (theme === 'custom' && bookTitle) {
        prompt = `Bạn là một nhà văn và chuyên gia đúc kết tinh túy tri thức. Người dùng đang thực hiện thói quen để đọc học và khai mở cuốn sách "${bookTitle}".
        Tiến độ mảnh ghép thói quen tích lũy của họ trong tháng hiện đã đạt ${progress}%.
        Hãy viết một đoạn trích dẫn đúc kết, một bài học thực hành uyên bác hoặc một chương thông điệp thức tỉnh sâu sắc (chỉ khoảng 2-3 câu ngắn gọn) liên kết mật thiết với tư duy nội hàm của tác phẩm "${bookTitle}" tương ứng với mốc tiến độ vững vàng này:
        - Mốc 25%: Khơi dòng tri thức, những phát kiến ban sơ thức tỉnh tầm nhìn mới của sách.
        - Mốc 50%: Chiếm lĩnh tư duy, ứng dụng thành công bài học cốt lõi lớn đầu tiên vào cuộc sống thực tế.
        - Mốc 75%: Kiến tạo thói quen tốt vượt trội, triết lý thấm nhuần vào tâm thức sâu sắc của người bền bỉ.
        - Mốc 100%: Thành tựu trọn vẹn, giải mã hoàn toàn quyển sách, khẳng định bước tiến ngoạn mục vượt bậc của bản thân.
        Ngôn ngữ: Tiếng Việt. Hãy viết bằng giọng văn uyên bác, trang trọng, lôi cuốn và đầy năng lượng thúc đẩy đổi thay tinh nhuệ.`;
      } else {
        prompt = `Bạn là một nhà văn viết truyện ${theme === 'wuxia' ? 'võ hiệp' : 'trinh thám Sherlock Holmes'}.
          Bức tranh mosaic của người dùng đã hoàn thành ${progress}%.
          Hãy viết một đoạn "Manh mối" (Clue) hoặc "Chương truyện" cực ngắn (khoảng 2-3 câu) tiếp nối nội dung tương ứng với mức độ hoàn thành này.
          - Mức 25%: Khởi đầu bí ẩn.
          - Mức 50%: Manh mối quan trọng/Cuộc chạm trán đầu tiên.
          - Mức 75%: Cao trào/Bí mật dần hé lộ.
          - Mốc 100%: Kết thúc/Phá án thành công/Đắc đạo thành tiên.
          Ngôn ngữ: Tiếng Việt.`;
      }

      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ story: response.text ? response.text.trim() : "" });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate story" });
    }
  });

  // API Route for Virtual Persona Posts (Insights from Ebooks)
  app.post("/api/generate-persona-post", async (req, res) => {
    try {
      const { personaName, personaRole, bookTitle, bookDescription } = req.body;
      
      const prompt = `Bạn là ${personaName}, có vai trò là "${personaRole}". 
      Bạn đang tham gia một mạng xã hội của cộng đồng những người đam mê tri thức và rèn luyện.
      Bạn vừa đọc xong hoặc đang nghiên cứu cuốn sách "${bookTitle}".
      
      Nhiệm vụ: Viết một bài đăng (post) ngắn gọn (dưới 60 từ) để chia sẻ một "tri thức thú vị", một "bí kíp" hoặc một "góc nhìn độc đáo" từ cuốn sách này.
      
      Yêu cầu về phong cách:
      1. GIỌNG ĐIỆU CÁ NHÂN HÓA: Phải cực kỳ giống tính cách của ${personaName}. 
         - Nếu là nhân vật có tính cách "cà khịa", "vui vẻ", "thích chơi chữ": Hãy dùng ngôn ngữ dí dỏm, chơi chữ, hoặc "cà khịa" nhẹ nhàng sự lười biếng của người khác trong khi ca ngợi tri thức này.
         - Nếu là nhân vật nghiêm túc: Hãy nói như một vĩ nhân hoặc một cố vấn thực thụ.
      2. NỘI DUNG LIÊN QUAN ĐẾN SÁCH: Nhắc đến tên cuốn sách "${bookTitle}" và một ý tưởng cốt lõi của nó một cách sáng tạo để khích lệ mọi người rèn luyện.
      3. CHÈN HASHTAG: Sử dụng các hashtag như #TriThuc #RènLuyện #[TênSáchKhôngDấu] #HabitMosaic.
      4. NGÔN NGỮ TỰ NHIÊN: Tiếng Việt đời thường, phong cách mạng xã hội (Social Media style).
      
      Ngôn ngữ: Tiếng Việt.`;

      const response = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      res.json({ content: response.text ? response.text.trim() : "" });
    } catch (error) {
      res.status(500).json({ error: "Failed to generate post" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
