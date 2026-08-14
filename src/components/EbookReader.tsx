import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  Upload, 
  Plus, 
  Trash2, 
  Check, 
  Bookmark, 
  FileText, 
  Moon, 
  Sun, 
  Type, 
  ArrowLeft, 
  ChevronRight, 
  ChevronLeft, 
  CheckCircle2,
  Sparkles,
  BookMarked,
  Lock
} from 'lucide-react';
import { Ebook, EbookChapter } from '../types';
import { storePdfFile, getPdfFile, deletePdfFile, getAllStoredKeys } from '../lib/pdfStorage';

// Predefined default books to populate the library immediately
export const DEFAULT_EBOOKS: Ebook[] = [
  {
    id: 'atomic-habits',
    title: 'Atomic Habits (Thay đổi tí hon, Hiệu quả phi thường)',
    author: 'James Clear',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400',
    currentChapterIndex: 0,
    readChapters: [],
    chapters: [
      {
        id: 'ch1',
        title: 'Chương 1: Sức mạnh bất ngờ của sự thay đổi 1% mỗi ngày',
        content: `Mỗi ngày chỉ cần bạn cải thiện 1% năng lực bản thân, sau 365 ngày ròng rã, bạn sẽ thấy mình tiến bộ lớn mạnh gấp 37 lần cơ bản. Ngược lại, nếu cứ tồi đi 1% mỗi ngày, bạn sẽ gần như tụt dốc về con số 0 tròn trĩnh.

Thành công chính là kết tinh của những thói quen vun đắp từng ngày chứ không phải đột biến chỉ đến một lần trong đời. Những gì bạn nhận được hôm nay chính là tấm gương phản chiếu chính xác nhất những thói quen mà bạn gieo xuống từ hôm trước. 

Ý chí của con người thường bị lung lay bởi họ không nhìn thấy kết quả ngay trước mắt. Thói quen cũng giống như việc làm đông một khối băng. Bạn gia nhiệt từ -10 độ C lên -1 độ C, dường như chẳng có gì thay đổi. Nhưng đột nhiên bước qua ranh giới 0 độ C, băng bắt đầu tan thành dòng nước. Sự kiên trì thầm lặng của bạn cũng đang chịu ảnh hưởng bởi mốc nhiệt độ vô hình này!`
      },
      {
        id: 'ch2',
        title: 'Chương 2: Xây dựng hệ thống vận hành thay vì mục tiêu đơn thuần',
        content: `Người chiến thắng hay kẻ bại trận đều cùng chung một mục đích. Nhưng điều tạo nên sự phân cấp ngoạn mục giữa họ không nằm ở khát khao, mà nằm ở hệ thống vận hành thói quen mỗi ngày.

Mục tiêu thiết kế ra cột mốc để bạn đi tới, nhưng hệ thống mới chính là đoàn tàu đưa bạn dịch chuyển liên tục về phía trước. Nếu bạn muốn viết một quyển sách vĩ đại, mục tiêu của bạn là 10.000 từ, nhưng hệ thống của bạn là viết 200 từ đều đặn mỗi sáng trước khi đi làm.

Hãy tập trung tối đa vào việc cải thiện hệ thống rèn luyện, giảm bớt áp lực hướng về kết quả cuối cùng. Khi hệ thống thói quen của bạn hoạt động vững chãi, thành công tự khắc sẽ gõ cửa tầm nhìn tương lai của bạn một cách nhẹ nhàng nhất.`
      },
      {
        id: 'ch3',
        title: 'Chương 3: Thiết lập môi trường và 4 quy luật kiến tạo thói quen tốt',
        content: `Để một hạt mầm nảy lộc, môi trường đất đai và dưỡng chất phải hoàn hảo. Thói quen cũng vậy. James Clear đưa ra 4 quy luật then chốt để xây dựng bất kỳ thói quen mạnh mẽ nào:

1. Khiến nó thật rõ ràng (Make it obvious): Đặt cuốn sách ngay trên gối nằm để bạn luôn thấy nó trước khi đi ngủ.
2. Khiến nó thật hấp dẫn (Make it attractive): Hòa quyện thói quen cần làm với hoạt động yêu thích (vừa đạp xe vừa nghe truyện sách).
3. Khiến nó thật dễ dàng (Make it easy): Hãy nén thói quen về mức tối thiểu ban đầu (Quy tắc 2 phút đọc sách).
4. Khiến nó thật thỏa mãn (Make it satisfying): Ghi nhận thành quả bằng cách tích mảnh ghép bức tranh thói quen ngay sau khi hoàn thành!

Sức mạnh thực sự nằm ở việc bạn điều phối môi trường sống xung quanh để nó hợp tác, nâng đỡ tiến trình phát triển tự nhiên của bạn.`
      },
      {
        id: 'ch4',
        title: 'Chương 4: Bí quyết duy trì thói quen không đứt đoạn mỗi ngày',
        content: `Sự đứt gãy thói quen chính là yếu tố tàn phá mọi chuỗi ngày tích lũy. Triết lý của thói quen nguyên tử ghi khắc: "Đừng bao giờ bỏ lỡ thói quen quá 2 lần liên tiếp".

Nếu hôm nay bạn mệt mỏi và không thể hoàn thành xuất sắc, hãy làm nó ở mức tối giản (ví dụ chống đẩy 1 cái thay vì 50 cái, đọc 1 trang sách thay vì cả chương). Việc giữ lửa thói quen quan trọng hơn nhiều việc hoàn thành nó một cách hoàn hảo nhưng thất thường.

Chuỗi ngày tích lũy (Streak) tạo ra endorphin hạnh phúc trong tâm trí bạn. Mức độ hoàn thiện bức tranh Mosaic chính là minh chứng trực quan nhất cho thấy sự kiên trì tuyệt đỉnh không bao giờ lung lay của một người mưu cầu sự hoàn mỹ.`
      }
    ]
  },
  {
    id: 'dac-nhan-tam',
    title: 'Đắc Nhân Tâm (Bản tóm tắt chuyển hóa đời thường)',
    author: 'Dale Carnegie',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400',
    currentChapterIndex: 0,
    readChapters: [],
    chapters: [
      {
        id: 'dnt_ch1',
        title: 'Chương 1: Thuật ứng xử căn bản - Không chỉ trích, oán trách',
        content: `Muốn lấy mật thì đừng phá tổ ong. Con người vốn dĩ hành động theo sự tác động mãnh liệt của cảm xúc cá nhân chứ không thuần túy là lý trí logic. Mọi sự chỉ trích, lên án chỉ khơi dậy lòng tự phụ và dồn họ vào thế phòng thủ tự vệ, triệt tiêu mọi khả năng thấu hiểu chân thành.

Thay vì kết án người khác hay buông lời cay đắng khi thói quen của họ xung đột với bạn, hãy cố gắng đặt mình vào lăng kính trải nghiệm của họ để hiểu tại sao họ lại cư xử như thế. Đó chính là nguồn gốc sản sinh ra sự bao dung, tình yêu thương và sự đồng cảm sâu rộng.`
      },
      {
        id: 'dnt_ch2',
        title: 'Chương 2: Sáu cách tạo thiện cảm và thắp sáng trái tim đối phương',
        content: `Làm sao để người khác yêu mến bạn ngay từ cái nhìn đầu tiên? Hãy thực hành 6 nguyên tắc vàng chuyển hóa giao tiếp:
1. Thật lòng quan tâm đến người đối diện.
2. Hãy nở một nụ cười rạng rỡ và ấm áp khi tiếp xúc.
3. Luôn nhớ rằng tên một người là âm thanh êm đềm và quan trọng nhất đối với họ.
4. Biết lắng nghe và khuyến khích họ chia sẻ về bản thân.
5. Nói về những đề tài mà họ đang say mê hứng thú.
6. Thành thật làm cho đối phương cảm thấy họ quan trọng và được trân quý sâu sắc.`
      }
    ]
  }
];

// Live Dynamic PDF Canvas Viewer Component to prevent Iframe Blocks
interface PdfCanvasViewerProps {
  pdfUrl: string;
  pageNumber: number;
  onTotalPagesDetected: (total: number) => void;
}

const PdfCanvasViewer: React.FC<PdfCanvasViewerProps> = ({
  pdfUrl,
  pageNumber,
  onTotalPagesDetected,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [libLoaded, setLibLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [scale, setScale] = useState<number>(1.2);
  const currentRenderTaskRef = useRef<any>(null);

  // Load PDF.js script dynamically
  useEffect(() => {
    if ((window as any).pdfjsLib) {
      setLibLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.min.js';
    script.async = true;
    script.onload = () => {
      const pdfjsLib = (window as any).pdfjsLib;
      if (pdfjsLib) {
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
        setLibLoaded(true);
      } else {
        setErrorMsg('Không thể khởi tạo thư viện PDF.js');
      }
    };
    script.onerror = () => {
      setErrorMsg('Lỗi tải thư viện hỗ trợ đọc PDF (Vui lòng kiểm tra mạng)');
    };
    document.body.appendChild(script);
  }, []);

  // Load the PDF document
  useEffect(() => {
    if (!libLoaded || !pdfUrl) return;

    let isSubscribed = true;
    setLoading(true);
    setErrorMsg(null);

    const pdfjsLib = (window as any).pdfjsLib;
    
    const loadPdf = async () => {
      try {
        const response = await fetch(pdfUrl);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.arrayBuffer();
        
        const loadingTask = pdfjsLib.getDocument({
          data: data,
          disableRange: true,
          disableStream: true
        });
        
        const pdf = await loadingTask.promise;
        if (!isSubscribed) return;
        setPdfDoc(pdf);
        onTotalPagesDetected(pdf.numPages);
        setLoading(false);
      } catch (err: any) {
        console.error('PDF Fetch/Load Error:', err);
        if (isSubscribed) {
          const isBlobError = pdfUrl.startsWith('blob:');
          const isFailedToFetch = err.message?.includes('fetch') || err.name === 'TypeError';
          
          if (isBlobError) {
            setErrorMsg('Kênh tệp PDF tạm thời đã hết hạn (do tải lại trang/f5). Hãy chọn lại tệp PDF gốc để tiếp tục.');
          } else if (isFailedToFetch) {
            setErrorMsg('Không thể truy cập tệp PDF. Điều này thường do lỗi mạng hoặc chính sách bảo mật (CORS) của máy chủ chứa tệp.');
          } else {
            setErrorMsg('Lỗi phân tích tệp PDF. Tệp có thể bị hỏng, có mật khẩu bảo vệ hoặc định dạng không hợp lệ.');
          }
          setLoading(false);
        }
      }
    };

    loadPdf();

    return () => {
      isSubscribed = false;
    };
  }, [libLoaded, pdfUrl]);

  // Render the specific page
  useEffect(() => {
    if (!pdfDoc) return;

    let isSubscribed = true;
    const renderPage = async () => {
      try {
        // Cancel any pending render task to prevent race conditions during page flipping
        if (currentRenderTaskRef.current) {
          currentRenderTaskRef.current.cancel();
        }

        const page = await pdfDoc.getPage(pageNumber);
        if (!isSubscribed) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        if (!context) return;

        const dpr = window.devicePixelRatio || 1;
        const viewport = page.getViewport({ scale: scale });

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        context.scale(dpr, dpr);

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };

        const renderTask = page.render(renderContext);
        currentRenderTaskRef.current = renderTask;

        await renderTask.promise;
      } catch (err: any) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Render PDF page error:', err);
        }
      }
    };

    renderPage();

    return () => {
      isSubscribed = false;
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <div className="flex flex-col items-center bg-slate-950 p-4 rounded-2xl border border-slate-800 relative shadow-inner overflow-hidden min-h-[480px] w-full">
      {/* Zoom / Scale bar control */}
      {pdfDoc && !loading && !errorMsg && (
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 p-1 bg-slate-900/90 border border-slate-800 rounded-lg shadow-lg">
          <button
            onClick={() => setScale(prev => Math.max(0.6, prev - 0.2))}
            type="button"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Thu nhỏ"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[10px] font-mono font-bold text-slate-300 w-11 text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(prev => Math.min(2.5, prev + 0.2))}
            type="button"
            className="p-1.5 hover:bg-slate-800 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="Phóng to"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      )}

      {loading && (
        <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center bg-slate-950/80 gap-3 z-20">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-serif italic animate-pulse">
            Đang phân giải sóng tri thức PDF...
          </p>
        </div>
      )}

      {errorMsg ? (
        <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center p-6 text-center gap-3 z-20">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 flex items-center justify-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.75h-.152c-3.196 0-6.1-1.249-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
            </svg>
          </div>
          <h4 className="text-sm font-serif italic text-white font-bold">{errorMsg}</h4>
          <p className="text-[11px] text-slate-400 max-w-sm leading-relaxed">
            Bạn có thể thử tải lại tệp PDF của cuốn sách này hoặc đổi sang sách khác để tiếp tục đọc.
          </p>
        </div>
      ) : (
        <div className="w-full max-h-[520px] overflow-auto scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent flex justify-center py-2 z-10">
          <canvas ref={canvasRef} className="rounded-xl shadow-2xl transition-all duration-300 transform" />
        </div>
      )}
    </div>
  );
};

interface EbookReaderProps {
  onSetActiveBook: (title: string, imageUrl: string | null) => void;
  activeBookTitle: string;
  onAddXp: (amount: number) => void;
  ebooks: Ebook[];
  onUpdateEbooks: (updated: Ebook[]) => void;
  habits: { id: string; title: string }[];
  completedHabitIds: string[];
  onToggleHabit: (id: string) => void;
}

export const EbookReader: React.FC<EbookReaderProps> = ({ 
  onSetActiveBook, 
  activeBookTitle,
  onAddXp,
  ebooks,
  onUpdateEbooks,
  habits,
  completedHabitIds,
  onToggleHabit
}) => {

  const [selectedBookId, setSelectedBookId] = useState<string | null>(() => {
    // Priority 1: Saved ID in localStorage
    const savedId = localStorage.getItem('habit_mosaic_selected_book_id');
    if (savedId && ebooks.some(b => b.id === savedId)) {
      return savedId;
    }
    
    // Priority 2: Matching active book title
    if (ebooks.length > 0) {
      const match = ebooks.find(b => b.title === activeBookTitle);
      return match ? match.id : ebooks[0].id;
    }
    return null;
  });

  // Persist selected book ID
  useEffect(() => {
    if (selectedBookId) {
      localStorage.setItem('habit_mosaic_selected_book_id', selectedBookId);
    }
  }, [selectedBookId]);

  // State for creating a new custom book
  const [isAddingBook, setIsAddingBook] = useState(false);
  const [newBookFormat, setNewBookFormat] = useState<'txt' | 'pdf'>('txt');
  const [newBookTitle, setNewBookTitle] = useState('');
  const [newBookAuthor, setNewBookAuthor] = useState('');
  const [newBookCover, setNewBookCover] = useState<string | null>(null);
  const [newBookText, setNewBookText] = useState('');
  const [newBookFile, setNewBookFile] = useState<File | null>(null);
  const [newBookPdfUrl, setNewBookPdfUrl] = useState<string>('');
  const [newBookTotalPages, setNewBookTotalPages] = useState<number>(50);

  // Re-binder file input for expired Local Object URLs after hard refresh
  const [rebindBookId, setRebindBookId] = useState<string | null>(null);

  // Local object URLs mapping cache (keeps blobs alive for active session)
  const [activePdfBlobs, setActivePdfBlobs] = useState<Record<string, string>>({});
  const [loadingStoredPdfs, setLoadingStoredPdfs] = useState(true);

  // Initialize: Load all stored PDFs from IndexedDB on mount
  useEffect(() => {
    let isMounted = true;
    const currentBlobs: Record<string, string> = {};

    const loadStoredPdfs = async () => {
      try {
        setLoadingStoredPdfs(true);
        const keys = await getAllStoredKeys();
        
        for (const key of keys) {
          if (!isMounted) break;
          const data = await getPdfFile(key);
          if (data && isMounted) {
            const blob = data instanceof Blob ? data : new Blob([data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            currentBlobs[key] = url;
          }
        }
        
        if (isMounted) {
          setActivePdfBlobs(currentBlobs);
        }
      } catch (err) {
        console.error('Failed to load stored PDFs from IndexedDB:', err);
      } finally {
        if (isMounted) {
          setLoadingStoredPdfs(false);
        }
      }
    };
    
    loadStoredPdfs();
    
    return () => {
      isMounted = false;
      // Revoke all created URLs for this session
      Object.values(currentBlobs).forEach(url => URL.revokeObjectURL(url));
    };
  }, []);

  // Reader Preferences
  const [readingTheme, setReadingTheme] = useState<'sepia' | 'dark' | 'light'>('sepia');
  const [textSize, setTextSize] = useState<'sm' | 'md' | 'lg' | 'xl'>('md');
  const [isReadingPopupOpen, setIsReadingPopupOpen] = useState(false);

  // Animation trigger for XP stars
  const [showXpCelebration, setShowXpCelebration] = useState(false);

  // Sync ebooks state to parent state
  const saveEbooks = (updatedBooks: Ebook[]) => {
    onUpdateEbooks(updatedBooks);
  };

  const selectedBook = ebooks.find(b => b.id === selectedBookId) || null;

  // Handle Book cover upload for adding book form
  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setNewBookCover(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Parse TXT or PDF file
  const handleTxtFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewBookFile(file);
      if (newBookFormat === 'txt') {
        const reader = new FileReader();
        reader.onload = (event) => {
          const text = event.target?.result as string;
          setNewBookText(text);
        };
        reader.readAsText(file, 'UTF-8');
      } else {
        // For PDF, generate local blob URL
        const blobUrl = URL.createObjectURL(file);
        setNewBookPdfUrl(blobUrl);
      }
    }
  };

  // Rebind an expired PDF object URL from local storage metadata
  const handleRebindPdf = async (bookId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const blobUrl = URL.createObjectURL(file);
        
        // Save to IndexedDB for persistence
        await storePdfFile(bookId, file);
        
        setActivePdfBlobs(prev => ({ ...prev, [bookId]: blobUrl }));
        
        const updated = ebooks.map(b => {
          if (b.id === bookId) {
            // We store the flag that it's a persistent PDF
            return { ...b, pdfUrl: blobUrl };
          }
          return b;
        });
        saveEbooks(updated);
        setRebindBookId(null);
      } catch (err) {
        console.error('Failed to rebind and store PDF:', err);
        alert('Không thể lưu tệp PDF vào bộ nhớ trình duyệt!');
      }
    }
  };

  const handleAddNewBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBookTitle.trim()) return;

    let chaptersList: EbookChapter[] = [];
    const newBookId = `custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    let finalPdfUrl = '';

    // Specific logic for PDF storage in IndexedDB
    if (newBookFormat === 'pdf' && newBookFile) {
      try {
        // Store the original file in IndexedDB
        await storePdfFile(newBookId, newBookFile);
        
        // Create an object URL for immediate use
        finalPdfUrl = URL.createObjectURL(newBookFile);
        
        // Update active blobs cache
        setActivePdfBlobs(prev => ({ ...prev, [newBookId]: finalPdfUrl }));
      } catch (err) {
        console.error('Failed to store PDF in IndexedDB:', err);
        alert('Lỗi khi lưu tệp PDF vào bộ nhớ trình duyệt. Tệp có thể quá lớn (giới hạn thường là 2GB) hoặc trình duyệt không cho phép lưu trữ IndexedDB.');
        return;
      }
    }

    if (newBookFormat === 'txt') {
      if (newBookText.trim()) {
        // Intelligently split by chapter markers or just group by length
        const rawText = newBookText.trim();
        const delimiter = /Chương\s+\d+|Chapter\s+\d+|Phần\s+\d+/i;
        const parts = rawText.split(delimiter);
        const matches = rawText.match(delimiter);

        if (parts.length > 1 && matches) {
          // First part might be introduction if it's empty or has content before Chapter 1
          const introContent = parts[0].trim();
          if (introContent) {
            chaptersList.push({
              id: 'intro_' + Math.random().toString(),
              title: 'Lời giới thiệu / Mở đầu',
              content: introContent
            });
          }

          for (let i = 0; i < matches.length; i++) {
            const content = parts[i + 1] ? parts[i + 1].trim() : '';
            chaptersList.push({
              id: 'chapter_' + i + '_' + Math.random().toString(),
              title: matches[i],
              content: content || 'Nội dung chương này trống hoặc đang cập nhật.'
            });
          }
        } else {
          // Split text evenly into paragraphs/chapters of length ~ 400 chars
          const paragraphs = rawText.split('\n').filter(p => p.trim().length > 0);
          if (paragraphs.length <= 3) {
            chaptersList.push({
              id: 'chapter_single',
              title: 'Chương 1: Tiếp thu tri thức mới',
              content: rawText
            });
          } else {
            // Group paragraphs to make 3-4 chapters
            const groupSize = Math.max(1, Math.ceil(paragraphs.length / 4));
            for (let i = 0; i < 4; i++) {
              const slice = paragraphs.slice(i * groupSize, (i + 1) * groupSize);
              if (slice.length > 0) {
                chaptersList.push({
                  id: 'chapter_g_' + i,
                  title: `Phần ${i + 1}: Tìm hiểu bản thân (Mục ${i + 1})`,
                  content: slice.join('\n\n')
                });
              }
            }
          }
        }
      } else {
        // Placeholder chapters
        chaptersList = [
          {
            id: 'custom_placeholder_1',
            title: 'Ý nghĩa của việc rèn thói quen',
            content: 'Thói quen là cách bạn tự định vị bản sắc của mình. Khi bạn lặp đi lặp lại một hành động, bạn đang viết tiếp một dòng trong cuốn nhật ký cuộc đời của bản thân.'
          },
          {
            id: 'custom_placeholder_2',
            title: 'Vượt qua sức ỳ ban đầu',
            content: 'Sức ỳ giống như gia tốc lực kéo trái đất. Bạn cần lực đẩy mạnh nhất ở những giây phút đầu tiên. Khi thói quen đã vào quỹ đạo ổn định, bạn sẽ di chuyển trơn tru.'
          }
        ];
      }
    }

    const newBook: Ebook = {
      id: newBookId,
      title: newBookTitle,
      author: newBookAuthor || 'Tác giả ẩn danh',
      coverImage: newBookCover || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=400',
      currentChapterIndex: 0,
      readChapters: [],
      chapters: chaptersList,
      format: newBookFormat,
      pdfUrl: newBookFormat === 'pdf' ? finalPdfUrl : undefined,
      currentPdfPage: newBookFormat === 'pdf' ? 1 : undefined,
      totalPdfPages: newBookFormat === 'pdf' ? newBookTotalPages : undefined,
      unlockedChaptersCount: newBookFormat === 'txt' ? 1 : undefined,
      unlockedPagesCount: newBookFormat === 'pdf' ? 3 : undefined
    };

    const updated = [newBook, ...ebooks];
    saveEbooks(updated);
    setSelectedBookId(newBook.id);
    setIsAddingBook(false);

    // Reset fields
    setNewBookTitle('');
    setNewBookAuthor('');
    setNewBookCover(null);
    setNewBookText('');
    setNewBookFile(null);
    setNewBookPdfUrl('');
    setNewBookTotalPages(50);
  };

  const handleDeleteBook = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Clean up IndexedDB if it was a PDF
    try {
      await deletePdfFile(id);
      
      // Revoke object URL if exists
      if (activePdfBlobs[id]) {
        URL.revokeObjectURL(activePdfBlobs[id]);
        setActivePdfBlobs(prev => {
          const next = { ...prev };
          delete next[id];
          return next;
        });
      }
    } catch (err) {
      console.error('Error deleting PDF from storage:', err);
    }

    const updated = ebooks.filter(b => b.id !== id);
    saveEbooks(updated);
    
    // If we deleted the currently selected book, switch to the first available one
    if (selectedBookId === id) {
      if (updated.length > 0) {
        setSelectedBookId(updated[0].id);
      } else {
        setSelectedBookId(null);
      }
      localStorage.removeItem('habit_mosaic_selected_book_id');
    }
  };

  const handleToggleReadChapter = (chapterId: string) => {
    if (!selectedBook) return;

    const isRead = selectedBook.readChapters.includes(chapterId);
    let newReadChapters = [...selectedBook.readChapters];

    if (isRead) {
      newReadChapters = newReadChapters.filter(cid => cid !== chapterId);
    } else {
      newReadChapters.push(chapterId);
      // Give XP reward!
      onAddXp(30);
      setShowXpCelebration(true);
      setTimeout(() => setShowXpCelebration(false), 2000);
    }

    const updated = ebooks.map(b => {
      if (b.id === selectedBook.id) {
        return { ...b, readChapters: newReadChapters };
      }
      return b;
    });

    saveEbooks(updated);
  };

  const handleChangeChapterIndex = (index: number) => {
    if (!selectedBook) return;
    if (index >= 0 && index < selectedBook.chapters.length) {
      const updated = ebooks.map(b => {
        if (b.id === selectedBook.id) {
          return { ...b, currentChapterIndex: index };
        }
        return b;
      });
      saveEbooks(updated);
    }
  };

  const handleSyncToMosaic = () => {
    if (!selectedBook) return;
    onSetActiveBook(selectedBook.title, selectedBook.coverImage);
    alert(`Đã đặt tác phẩm "${selectedBook.title}" làm Sách mục tiêu đại diện trên Bức tranh thói quen! Hãy chuyển qua tab Bức tranh để chiêm ngưỡng.`);
  };

  return (
    <div className="space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800">
        <div>
          <h2 className="text-2xl font-serif italic text-white flex items-center gap-2">
            <BookOpen className="text-amber-500" />
            Tủ Sách Trí Tuệ & Ebook Cá Nhân
          </h2>
          <p className="text-xs text-slate-400 mt-1">Đọc và đính kèm sách eBook (.txt hoặc dán văn bản) của riêng bạn. Đồng bộ tiến trình thói quen để nâng tầm tư duy.</p>
        </div>
        <button
          onClick={() => setIsAddingBook(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-[0_4px_12px_rgba(245,158,11,0.2)]"
        >
          <Plus size={16} /> Thêm Sách mới
        </button>
      </div>

      {/* Adding book form modal overlay */}
      <AnimatePresence>
        {isAddingBook && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto space-y-6 scrollbar-thin scrollbar-thumb-slate-800"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-serif italic text-white flex items-center gap-2">
                  <BookMarked size={22} className="text-amber-500" /> Nạp Cuốn Sách Cá Nhân Mới
                </h3>
                <button 
                  onClick={() => setIsAddingBook(false)}
                  className="text-slate-400 hover:text-white font-bold text-sm"
                >
                  Đóng
                </button>
              </div>

              <form onSubmit={handleAddNewBook} className="space-y-4 text-left">
                {/* Format selector */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Định dạng sách muốn nạp</label>
                  <div className="flex gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
                    <button
                      type="button"
                      onClick={() => setNewBookFormat('txt')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${newBookFormat === 'txt' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      Bản Tóm Tắt Co Rút (.txt / Nhập tay)
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewBookFormat('pdf')}
                      className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${newBookFormat === 'pdf' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'}`}
                    >
                      Tài liệu hoàn chỉnh (.pdf)
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tên Sách (Bắt buộc)</label>
                    <input 
                      type="text" 
                      required
                      value={newBookTitle}
                      onChange={e => setNewBookTitle(e.target.value)}
                      placeholder="Ví dụ: Nghĩ Giàu Làm Giàu, Giáo trình Triết..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Tác Giả</label>
                    <input 
                      type="text" 
                      value={newBookAuthor}
                      onChange={e => setNewBookAuthor(e.target.value)}
                      placeholder="Ví dụ: Napoleon Hill..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Photo upload path */}
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center items-center space-y-3">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold self-start">Ảnh bìa cuốn sách (Upload/Tùy chọn)</span>
                    <div className="w-16 h-20 bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center border border-slate-800">
                      {newBookCover ? (
                        <img src={newBookCover} alt="Cover upload" className="w-full h-full object-cover" />
                      ) : (
                        <BookOpen size={20} className="text-slate-600" />
                      )}
                    </div>
                    <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                      Chọn ảnh bìa
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleCoverUpload}
                        className="hidden" 
                      />
                    </label>
                  </div>

                  {/* File upload depending on format */}
                  {newBookFormat === 'txt' ? (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center items-center space-y-3">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold self-start font-sans">Chọn file Tinh Gọn (.txt)</span>
                      <FileText size={24} className={newBookFile ? "text-amber-500" : "text-slate-600"} />
                      <p className="text-[10px] text-slate-500 text-center leading-tight">Gợi ý: Tải file văn bản hoặc sách tóm tắt cực kỳ dễ rèn luyện thói quen đọc.</p>
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        {newBookFile ? `Đã chọn: ${newBookFile.name.substring(0, 15)}...` : 'Tải file ebook .txt lên'}
                        <input 
                          type="file" 
                          accept=".txt" 
                          onChange={handleTxtFileUpload}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 flex flex-col justify-center items-center space-y-3">
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold self-start font-sans">Chọn tài liệu PDF (.pdf)</span>
                      <Upload size={24} className={newBookPdfUrl ? "text-amber-500" : "text-slate-600"} />
                      <p className="text-[10px] text-slate-500 text-center leading-tight">Gợi ý: Tài liệu nghiên cứu, sách PDF đầy đủ để trải nghiệm bộ đọc chuyên sâu.</p>
                      <label className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold rounded-lg cursor-pointer transition-colors">
                        {newBookPdfUrl ? `Đã nạp PDF thành công` : 'Tải file tài liệu .pdf lên'}
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={handleTxtFileUpload}
                          className="hidden" 
                        />
                      </label>
                    </div>
                  )}
                </div>

                {newBookFormat === 'txt' ? (
                  <div className="space-y-1.5">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Nội dung văn bản / Nhập tay hoặc dán văn bản sách trực tiếp</label>
                      <span className="text-[10px] text-slate-500">Tự động nhận diện mốc "Chương X" để chia thư mục chương đọc!</span>
                    </div>
                    <textarea
                      rows={6}
                      value={newBookText}
                      onChange={e => setNewBookText(e.target.value)}
                      placeholder="Dán các chương cốt lõi vào đây. Ví dụ:
Chương 1: Khởi đầu mới
Cuốn sách này dạy chúng ta cách...

Chương 2: Đột phá tư tưởng
Áp chế thói quen xấu cần có ý chí..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl p-4 text-slate-300 text-sm focus:outline-none font-serif resize-none"
                    />
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Ước tính tổng số trang PDF</label>
                    <input 
                      type="number" 
                      min={1}
                      max={10000}
                      value={newBookTotalPages}
                      onChange={e => setNewBookTotalPages(Math.max(1, Number(e.target.value)))}
                      placeholder="Ví dụ: 120 trang..."
                      className="w-full bg-slate-950 border border-slate-800 focus:border-amber-500/50 rounded-xl px-4 py-2.5 text-slate-300 text-sm focus:outline-none"
                    />
                    <p className="text-[9px] text-slate-500">Chúng tôi sẽ thiết lập hệ thống chấm điểm và trang thanh tiến trình thói quen dựa trên tổng số trang này.</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingBook(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Hủy bỏ
                  </button>
                  <button 
                    type="submit" 
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
                  >
                    Hoàn tất lưu sách
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Star XP Celebration */}
      <AnimatePresence>
        {showXpCelebration && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: -80, scale: 1.2 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-24 right-1/4 bg-gradient-to-r from-amber-600 to-amber-400 text-slate-950 px-4 py-2 rounded-full font-bold shadow-2xl flex items-center gap-1.5 z-50 pointer-events-none"
          >
            <Sparkles size={16} />
            Đã đọc chương! +30 XP Kinh nghiệm trí óc!
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ebook UI Split Shelf & Reading View */}
      {ebooks.length === 0 ? (
        <div className="text-center p-12 bg-slate-900/30 rounded-3xl border border-slate-800">
          <BookOpen className="mx-auto text-slate-600 mb-4" size={48} />
          <h3 className="text-lg font-serif text-slate-300 italic">Thư viện trống rỗng</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">Vui lòng bấm nút Thêm Sách mới ở bên trên để tải lên sách riêng hoặc khôi phục danh sách.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Interactive Book Shelf (3 columns or 4 columns) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500 font-sans">Kệ Sách Đang Đọc ({ebooks.length})</h3>
            <div className="grid grid-cols-1 gap-3 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {ebooks.map(book => {
                const isActive = book.id === selectedBookId;
                const isPdf = book.format === 'pdf';
                
                const totalChapters = isPdf ? (book.totalPdfPages || 1) : book.chapters.length;
                const completedCount = isPdf ? (book.currentPdfPage || 1) : book.readChapters.length;
                const percentRead = totalChapters > 0 ? Math.min(100, Math.round((completedCount / totalChapters) * 100)) : 0;
                
                const isCurrentActiveGlobal = book.title === activeBookTitle;

                return (
                  <div
                    key={book.id}
                    onClick={() => setSelectedBookId(book.id)}
                    className={`p-4 rounded-xl border text-left cursor-pointer transition-all flex gap-4 relative group ${
                      isActive 
                        ? 'bg-slate-900 border-amber-500/40 shadow-lg shadow-amber-500/5' 
                        : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/20'
                    }`}
                  >
                    {/* Small cover image */}
                    <div className="w-12 h-16 bg-slate-900 rounded border border-slate-800 overflow-hidden flex-shrink-0 relative">
                      {book.coverImage ? (
                        <img src={book.coverImage} alt={book.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-slate-950 text-slate-600">
                          <BookOpen size={18} />
                        </div>
                      )}
                      
                      {/* Format label badge */}
                      <div className="absolute bottom-0 left-0 right-0 bg-slate-950/80 text-[6px] text-center font-bold font-sans py-0.5 text-slate-400">
                        {isPdf ? 'PDF' : 'EBOOK'}
                      </div>

                      {/* Active project highlight label */}
                      {isCurrentActiveGlobal && (
                        <div className="absolute top-0 right-0 bg-amber-500 text-[6px] text-slate-950 font-black px-1 rounded-bl">
                          TRANG
                        </div>
                      )}
                    </div>

                    {/* Book text details */}
                    <div className="flex-1 min-w-0 pr-4">
                      <h4 className="text-sm font-serif italic font-semibold text-white truncate leading-snug">{book.title}</h4>
                      <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{book.author}</p>
                      
                      {/* Reading Progress Indicator */}
                      <div className="mt-2.5 space-y-1">
                        <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tight">
                          <span>Đã thẩm thấu</span>
                          <span>{isPdf ? `Trang ${completedCount}/${totalChapters}` : `${completedCount}/${totalChapters} Chương`} ({percentRead}%)</span>
                        </div>
                        <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className="bg-amber-500 h-full transition-all duration-300" 
                            style={{ width: `${percentRead}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Delete book button - enabled for all books to allow library management */}
                    <button
                      onClick={(e) => handleDeleteBook(book.id, e)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-slate-500 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 opacity-0 group-hover:opacity-100 transition-all z-20"
                      title="Xóa sách này khỏi thư viện"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right: Immersive Book Reading View (8 columns) */}
          <div className="lg:col-span-8 space-y-6">
            {selectedBook ? (
              <div className="space-y-6">
                <div className="bg-slate-900/30 rounded-3xl border border-slate-800 p-6 md:p-8 shadow-2xl relative overflow-hidden group">
                  {/* Decorative background lights */}
                  <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl group-hover:bg-amber-500/10 transition-all duration-700 pointer-events-none" />
                  
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start relative z-10">
                    {/* Column 1: Book Cover Art */}
                    <div className="md:col-span-5 flex flex-col items-center">
                      <div className="w-48 h-68 bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden shadow-[0_15px_35px_rgba(0,0,0,0.5)] transform hover:scale-[1.02] hover:rotate-1 transition-all duration-300 relative group/cover">
                        {selectedBook.coverImage ? (
                          <img 
                            src={selectedBook.coverImage} 
                            alt={selectedBook.title} 
                            className="w-full h-full object-cover" 
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-950 text-slate-600 gap-2">
                            <BookOpen size={36} className="text-slate-700 animate-pulse" />
                            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500">No Cover</span>
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-60" />
                        <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center bg-slate-950/80 backdrop-blur-sm border border-slate-800 rounded-lg px-2 py-1">
                          <span className="text-[9px] font-mono font-bold text-amber-500 uppercase tracking-widest">
                            {selectedBook.format === 'pdf' ? 'Tài liệu PDF' : 'Sách điện tử'}
                          </span>
                        </div>
                      </div>

                      {(() => {
                        const isPdf = selectedBook.format === 'pdf';
                        const hasActiveBlob = activePdfBlobs[selectedBook.id];
                        const hasStoredUrl = !!selectedBook.pdfUrl;
                        const isExpired = hasStoredUrl && !hasActiveBlob && selectedBook.pdfUrl?.startsWith('blob:');
                        
                        if (isPdf && isExpired) {
                          return (
                            <div className="mt-4 w-full">
                              <label className="w-full flex flex-col items-center justify-center p-3 bg-red-500/10 border border-dashed border-red-500/30 hover:bg-red-500/15 rounded-xl cursor-pointer transition-all gap-1.5 group/rebind">
                                <Upload className="text-red-400 group-hover/rebind:scale-110 transition-transform" size={16} />
                                <span className="text-[11px] font-bold text-red-400">Chọn lại tệp PDF gốc</span>
                                <span className="text-[9px] text-slate-500 text-center px-4">Tệp tạm thời đã hết hạn sau khi tải lại trang</span>
                                <input 
                                  type="file" 
                                  accept=".pdf" 
                                  onChange={(e) => handleRebindPdf(selectedBook.id, e)}
                                  className="hidden" 
                                />
                              </label>
                            </div>
                          );
                        }
                        return null;
                      })()}
                    </div>

                    {/* Column 2: Book Details & Stats & Play Action */}
                    <div className="md:col-span-7 space-y-6 text-left">
                      <div>
                        <h3 className="text-2xl font-serif text-white font-bold leading-tight tracking-tight">
                          {selectedBook.title}
                        </h3>
                        <p className="text-sm text-amber-500 mt-1 font-medium font-sans flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          {selectedBook.author || 'Tác giả ẩn danh'}
                        </p>
                      </div>

                      {/* Progress Stats Section */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Tiến trình đọc</span>
                          {selectedBook.format === 'pdf' ? (
                            <div className="mt-2 text-left">
                              <p className="text-base font-bold text-white font-mono">
                                Trang {selectedBook.currentPdfPage || 1} <span className="text-xs text-slate-500">/ {selectedBook.totalPdfPages || 100}</span>
                              </p>
                              <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                <div 
                                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.round(((selectedBook.currentPdfPage || 1) / (selectedBook.totalPdfPages || 100)) * 100))}%` }}
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="mt-2 text-left">
                              <p className="text-base font-bold text-white font-mono">
                                Chương {selectedBook.currentChapterIndex + 1} <span className="text-xs text-slate-500">/ {selectedBook.chapters.length}</span>
                              </p>
                              <div className="w-full bg-slate-800 h-1 rounded-full mt-2 overflow-hidden">
                                <div 
                                  className="bg-amber-500 h-full rounded-full transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.round(((selectedBook.currentChapterIndex + 1) / (selectedBook.chapters.length || 1)) * 100))}%` }}
                                />
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="p-3 bg-slate-950/50 border border-slate-800/80 rounded-2xl flex flex-col justify-between">
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Khai Sáng Hiện Tại</span>
                          {selectedBook.format === 'pdf' ? (
                            <div className="mt-2 text-left">
                              <p className="text-base font-bold text-amber-500 font-mono">
                                Đã mở {selectedBook.unlockedPagesCount ?? 3} <span className="text-xs text-slate-500">Trang</span>
                              </p>
                              <p className="text-[9px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
                                <Sparkles size={10} /> Đạt thói quen mở thêm
                              </p>
                            </div>
                          ) : (
                            <div className="mt-2 text-left">
                              <p className="text-base font-bold text-amber-500 font-mono">
                                Đã mở {selectedBook.unlockedChaptersCount ?? 1} <span className="text-xs text-slate-500">Chương</span>
                              </p>
                              <p className="text-[9px] text-emerald-400 mt-2 font-medium flex items-center gap-1">
                                <Sparkles size={10} /> Đạt thói quen mở thêm
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Giant Action Button to trigger Popup Reader */}
                      <div className="pt-2">
                        <button
                          onClick={() => setIsReadingPopupOpen(true)}
                          className="w-full py-4 px-6 bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-[0.98] text-slate-950 font-bold text-sm uppercase tracking-wider rounded-2xl transition-all shadow-lg flex items-center justify-center gap-2.5 cursor-pointer font-sans"
                        >
                          <BookOpen size={18} strokeWidth={2.5} />
                          Bắt đầu nghiền ngẫm ngay
                        </button>
                      </div>

                      {/* Sync to Mosaic Grid option */}
                      <div className="flex items-center justify-between p-3 bg-slate-950/20 border border-slate-800/40 rounded-2xl text-xs">
                        <span className="text-slate-400">Tranh nền ghép mảnh:</span>
                        <button
                          onClick={handleSyncToMosaic}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                            selectedBook.title === activeBookTitle
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400 cursor-default'
                              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:text-amber-400 active:scale-95 cursor-pointer shadow-md'
                          }`}
                        >
                          {selectedBook.title === activeBookTitle ? (
                            <>
                              <Check size={12} /> Đang làm tranh ghép
                            </>
                          ) : (
                            <>
                              <BookMarked size={12} /> Đặt làm Sách tranh ghép
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Table of Contents Preview */}
                <div className="bg-slate-900/10 rounded-2xl border border-slate-800/60 p-5 space-y-4 text-left">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen size={12} /> Sơ đồ nội dung sách
                  </h4>
                  {selectedBook.format === 'pdf' ? (
                    <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800 text-xs text-slate-400 leading-relaxed font-sans">
                      Tệp tài liệu PDF chứa khoảng <strong>{selectedBook.totalPdfPages || 100} trang</strong> tinh hoa. Hãy lật mở từng trang bằng cách bấm nút "Mở trình đọc sách". Rèn luyện và duy trì tích cực thói quen hàng ngày để dũng cảm kích mở từng cột mốc trang sách thần bí tiếp theo!
                    </div>
                  ) : selectedBook.chapters.length > 0 ? (
                    <div className="max-h-52 overflow-y-auto space-y-1.5 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
                      {selectedBook.chapters.map((ch, idx) => {
                        const isUnlocked = idx < (selectedBook.unlockedChaptersCount ?? 1);
                        const isRead = selectedBook.readChapters.includes(ch.id);
                        return (
                          <div 
                            key={ch.id} 
                            className={`flex items-center justify-between p-2.5 rounded-xl text-xs transition-colors ${
                              isUnlocked 
                                ? 'bg-slate-900/40 text-slate-300 border border-slate-800/40' 
                                : 'bg-slate-950/20 text-slate-600 border border-slate-900/40'
                            }`}
                          >
                            <span className="truncate pr-4 font-serif italic text-slate-300 font-medium">
                              Chương {idx + 1}: {ch.title}
                            </span>
                            <div className="flex items-center gap-2.5 flex-shrink-0">
                              {isRead && (
                                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-1.5 py-0.5 rounded font-bold uppercase tracking-tight">
                                  Đã đọc
                                </span>
                              )}
                              {!isUnlocked && (
                                <Lock size={12} className="text-amber-500/60" />
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">Sách hiện chưa có chương đọc nào.</p>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center p-12 bg-slate-900/30 rounded-3xl border border-slate-800 py-24">
                <p className="text-sm text-slate-500 font-serif italic mb-2">Chưa có cuốn sách nào được chọn trên kệ.</p>
                <p className="text-xs text-slate-600">Vui lòng nhấp chọn các đầu sách tri thức bên tay trái hoặc tải lên sách mới để sải bước rèn luyện!</p>
              </div>
            )}
          </div>

        </div>
      )}

      {/* Reading Immersive Fullscreen Popup Modal */}
      <AnimatePresence>
        {isReadingPopupOpen && selectedBook && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-950/98 backdrop-blur-xl z-50 flex flex-col justify-between text-slate-200"
          >
            {/* Top Toolbar / Header */}
            <div className="border-b border-slate-900 bg-slate-950/90 py-3.5 px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-30">
              <div className="flex items-center gap-3 truncate text-left">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-xl hidden sm:flex">
                  <BookOpen size={16} />
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-serif font-bold text-white truncate max-w-xs md:max-w-md">{selectedBook.title}</h4>
                  <p className="text-[10px] text-amber-500 font-sans tracking-wide">Đọc nghiền ngẫm • Tác giả {selectedBook.author || 'ẩn danh'}</p>
                </div>
              </div>

              {/* Center status for Page/Chapter */}
              <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 font-mono bg-slate-900/50 px-3 py-1.5 rounded-xl border border-slate-800">
                {selectedBook.format === 'pdf' ? (
                  <span>Trang {selectedBook.currentPdfPage || 1} / {selectedBook.totalPdfPages || 100}</span>
                ) : (
                  <span>Chương {selectedBook.currentChapterIndex + 1} / {selectedBook.chapters.length}</span>
                )}
              </div>

              {/* Close Button */}
              <button 
                onClick={() => setIsReadingPopupOpen(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 hover:text-white border border-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 text-slate-300"
              >
                <span>Xong</span>
                <span className="text-[10px] font-mono opacity-80 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">Esc</span>
              </button>
            </div>

            {/* Central Reader Canvas Content Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 md:py-10 flex flex-col items-center">
              <div className="w-full max-w-4xl mx-auto space-y-6">
                {selectedBook.format === 'pdf' ? (
                  <div className="space-y-6">
                    {/* Embedded canvas PDF reader view */}
                    {(() => {
                      if (loadingStoredPdfs) {
                        return (
                          <div className="flex flex-col items-center justify-center p-12 bg-slate-950/30 rounded-2xl border border-slate-800 text-center gap-3">
                            <div className="w-8 h-8 border-3 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-xs text-slate-500 font-serif italic">Đang đồng bộ kho tệp PDF...</p>
                          </div>
                        );
                      }

                      const sessionBlob = activePdfBlobs[selectedBook.id];
                      const storedPdfUrl = selectedBook.pdfUrl;
                      
                      // If it's a blob from storage but not in active session blobs, it's likely expired
                      const isExpiredBlob = storedPdfUrl?.startsWith('blob:') && !sessionBlob;
                      const activePdfUrl = sessionBlob || (isExpiredBlob ? null : storedPdfUrl);
                      
                      if (!activePdfUrl) {
                        return (
                          <div className="p-8 text-center bg-slate-900/20 rounded-2xl border border-slate-800/80 space-y-4 max-w-md mx-auto mt-12">
                            <Upload className="mx-auto text-amber-500 animate-pulse" size={36} />
                            <h4 className="text-sm font-serif italic text-white font-bold">Kênh tệp PDF hết hạn (Tải lại tệp)</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">
                              Khi f5 hoặc tải lại trang, trình duyệt giải phóng bộ nhớ file tạm thời. Hãy vui lòng chọn lại tệp PDF gốc <strong>"{selectedBook.title}"</strong> để tiếp tục đọc!
                            </p>
                            <label className="inline-block px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold uppercase rounded-xl cursor-pointer transition-all">
                              Chọn lại file PDF gốc
                              <input 
                                type="file" 
                                accept=".pdf" 
                                onChange={(e) => handleRebindPdf(selectedBook.id, e)}
                                className="hidden" 
                              />
                            </label>
                          </div>
                        );
                      }

                      return (
                        <div className="space-y-6">
                          <div className="w-full bg-slate-950 rounded-3xl border border-slate-900 overflow-hidden relative shadow-[0_20px_50px_rgba(0,0,0,0.6)] min-h-[480px]">
                            <PdfCanvasViewer
                              pdfUrl={activePdfUrl || ''}
                              pageNumber={selectedBook.currentPdfPage || 1}
                              onTotalPagesDetected={(total) => {
                                if (selectedBook.totalPdfPages !== total) {
                                  const updated = ebooks.map(b => {
                                    if (b.id === selectedBook.id) {
                                      return { ...b, totalPdfPages: total };
                                    }
                                    return b;
                                  });
                                  saveEbooks(updated);
                                }
                              }}
                            />
                            
                            {/* Lock Overlay for PDF inside popup */}
                            {(selectedBook.currentPdfPage || 1) > (selectedBook.unlockedPagesCount ?? 3) && (
                              <div className="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20 overflow-y-auto">
                                <div className="w-16 h-16 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center mb-4 animate-bounce">
                                  <Lock size={28} />
                                </div>
                                <h4 className="text-base font-serif italic text-white font-bold mb-2">Trang tài liệu này đang bị Khóa Tri thức!</h4>
                                <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed mb-6">
                                  Bạn đã chăm chỉ rèn luyện và mở khóa tới trang <strong>{selectedBook.unlockedPagesCount ?? 3}</strong>. Hãy tích cực rèn luyện thói quen rực rỡ bên dưới để lập tức phá giải rào chắn Tri thức nhé!
                                </p>
                                
                                <div className="w-full max-w-md text-left font-sans bg-slate-900/60 p-5 rounded-2xl border border-slate-800">
                                  <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest text-center mb-4">Ghi chép nhanh các thói quen rèn luyện hôm nay:</p>
                                  {habits.length === 0 ? (
                                    <div className="p-4 bg-slate-950/40 rounded-xl text-center text-[11px] text-slate-500 italic border border-slate-800/50 font-sans">
                                      Bạn chưa tạo thói quen nào. Vui lòng trở lại tab "Ghi chép thói quen" trên giao diện chính để tạo thói quen!
                                    </div>
                                  ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                      {habits.map(habit => {
                                        const isDone = completedHabitIds.includes(habit.id);
                                        return (
                                          <button
                                            key={habit.id}
                                            onClick={() => onToggleHabit(habit.id)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                              isDone 
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                                : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                                            }`}
                                          >
                                            <span className="truncate pr-2">{habit.title}</span>
                                            <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                                              isDone 
                                                ? 'bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold' 
                                                : 'border-slate-700 bg-slate-950'
                                            }`}>
                                              {isDone && <Check size={10} strokeWidth={4} />}
                                            </div>
                                          </button>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Quick Manual flipping actions */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-900/40 p-5 rounded-2xl border border-slate-900">
                            <div className="text-left">
                              <p className="text-xs font-bold text-slate-300">Tiến trình nghiền ngẫm PDF</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">Tiến qua trang mới dũng mãnh cộng +30 XP trí lực thói quen!</p>
                            </div>
                            
                            <div className="flex items-center justify-end gap-3 flex-wrap">
                              <button
                                disabled={(selectedBook.currentPdfPage || 1) <= 1}
                                onClick={() => {
                                  const curr = selectedBook.currentPdfPage || 1;
                                  if (curr > 1) {
                                    const updated = ebooks.map(b => {
                                      if (b.id === selectedBook.id) return { ...b, currentPdfPage: curr - 1 };
                                      return b;
                                    });
                                    saveEbooks(updated);
                                  }
                                }}
                                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-20 rounded-xl text-slate-300 text-xs font-bold transition-all cursor-pointer"
                              >
                                Lùi 1 Trang
                              </button>
                              <button
                                onClick={() => {
                                  const curr = selectedBook.currentPdfPage || 1;
                                  const total = selectedBook.totalPdfPages || 100;
                                  if (curr < total) {
                                    const updated = ebooks.map(b => {
                                      if (b.id === selectedBook.id) return { ...b, currentPdfPage: curr + 1 };
                                      return b;
                                    });
                                    saveEbooks(updated);
                                    onAddXp(30);
                                    setShowXpCelebration(true);
                                    setTimeout(() => setShowXpCelebration(false), 2000);
                                  } else {
                                    alert('Chúc mừng bạn đã xuất sắc thẩm thấu hoàn thành toàn bộ tài liệu PDF tinh hoa này!');
                                  }
                                }}
                                className="px-4 py-2 bg-amber-500 hover:bg-amber-400 active:scale-95 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                              >
                                + Ghi nhận đọc trang này (+30 XP)
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                ) : selectedBook.chapters.length > 0 ? (
                  <div className="space-y-6">
                    {/* Preferences toolbar for TXT style reader */}
                    <div className="flex flex-wrap gap-4 items-center justify-between bg-slate-900/30 p-3 rounded-2xl border border-slate-800 text-xs">
                      {/* Themes sepia, dark, light */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Giao diện:</span>
                        <button 
                          onClick={() => setReadingTheme('sepia')}
                          className={`w-6 h-6 rounded-full border bg-[#F4ECD8] transition-all flex items-center justify-center cursor-pointer ${readingTheme === 'sepia' ? 'ring-2 ring-amber-500 scale-105 border-white' : 'border-black/20'}`}
                          title="Chế độ cổ kính ấm áp"
                        />
                        <button 
                          onClick={() => setReadingTheme('dark')}
                          className={`w-6 h-6 rounded-full border bg-slate-900 transition-all flex items-center justify-center cursor-pointer ${readingTheme === 'dark' ? 'ring-2 ring-amber-500 scale-105 border-white' : 'border-slate-700'}`}
                          title="Chế độ vũ trụ huyền bí"
                        >
                          <Moon size={10} className="text-slate-400" />
                        </button>
                        <button 
                          onClick={() => setReadingTheme('light')}
                          className={`w-6 h-6 rounded-full border bg-white transition-all flex items-center justify-center cursor-pointer ${readingTheme === 'light' ? 'ring-2 ring-amber-500 scale-105 border-slate-800/20' : 'border-slate-300'}`}
                          title="Chế độ lăng kính tri thức sáng"
                        >
                          <Sun size={10} className="text-amber-600" />
                        </button>
                      </div>

                      {/* Dropdown fast chapter choice selector */}
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">Chương hiển thị:</span>
                        <select 
                          value={selectedBook.currentChapterIndex}
                          onChange={(e) => handleChangeChapterIndex(Number(e.target.value))}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-slate-200 text-xs italic font-serif cursor-pointer focus:outline-none focus:border-amber-500/50"
                        >
                          {selectedBook.chapters.map((ch, idx) => (
                            <option key={ch.id} value={idx}>
                              {selectedBook.readChapters.includes(ch.id) ? '✓ ' : '• '} {ch.title}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Font scaling control */}
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mr-1">Cỡ chữ:</span>
                        <button 
                          onClick={() => setTextSize(prev => prev === 'xl' ? 'lg' : prev === 'lg' ? 'md' : 'sm')}
                          className="p-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-905 text-slate-400 hover:text-white transition-colors cursor-pointer"
                        >
                          A-
                        </button>
                        <button 
                          onClick={() => setTextSize(prev => prev === 'sm' ? 'md' : prev === 'md' ? 'lg' : 'xl')}
                          className="p-1 px-2.5 rounded-lg bg-slate-950 hover:bg-slate-905 text-slate-405 hover:text-white transition-colors cursor-pointer"
                        >
                          A+
                        </button>
                      </div>
                    </div>

                    {/* Book Text Area Body */}
                    {selectedBook.chapters[selectedBook.currentChapterIndex] ? (
                      <div className="space-y-6">
                        <div 
                          className={`rounded-3xl p-6 md:p-10 max-h-[500px] overflow-y-auto font-serif shadow-inner transition-colors duration-500 leading-loose border relative ${
                            readingTheme === 'sepia' 
                              ? 'bg-[#FAF3E0] text-[#2F241F] shadow-[inset_0_2px_12px_rgba(47,36,31,0.06)] border-[#EAE0C7]' 
                              : readingTheme === 'dark' 
                                ? 'bg-slate-950 text-slate-300 shadow-[inset_0_2px_12px_rgba(0,0,0,0.6)] border-slate-900' 
                                : 'bg-white text-slate-900 shadow-[inset_0_2px_12px_rgba(0,0,0,0.04)] border border-slate-200'
                          }`}
                          style={{
                            fontSize: textSize === 'sm' ? '14px' : textSize === 'md' ? '16px' : textSize === 'lg' ? '19px' : '22px'
                          }}
                        >
                          {/* Locked Status Overlay on TXT Chapter */}
                          {selectedBook.currentChapterIndex >= (selectedBook.unlockedChaptersCount ?? 1) ? (
                            <div className="py-12 px-4 text-center space-y-4 font-sans max-w-md mx-auto">
                              <div className="mx-auto w-14 h-14 bg-amber-500/10 border border-amber-500/20 text-amber-500 rounded-full flex items-center justify-center animate-bounce">
                                <Lock size={24} />
                              </div>
                              <h4 className="text-lg font-serif italic text-amber-500 font-bold tracking-tight">Chương đọc Tri thức đang bị Khóa!</h4>
                              <p className="text-xs text-slate-400 leading-relaxed font-sans mt-2">
                                Bạn đã mở khóa xuất sắc đến Chương {selectedBook.unlockedChaptersCount ?? 1}. Rèn luyện các thói quen ngày hôm nay để tích điểm mở rộng chương đọc mới kì diệu tiếp theo nhé!
                              </p>
                              
                              <div className="pt-4 text-left font-sans">
                                <p className="text-[10px] text-amber-500 font-bold uppercase tracking-widest text-center mb-3">Tích thói quen hôm nay để mở khóa chương:</p>
                                {habits.length === 0 ? (
                                  <div className="p-3 bg-slate-950/50 rounded-xl text-center text-[11px] text-slate-500 italic border border-slate-800/50 font-sans">
                                    Bạn chưa tạo thói quen nào. Vui lòng trở lại tab "Ghi chép thói quen" trên giao diện để tạo thói quen đầu tiên nhé!
                                  </div>
                                ) : (
                                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                                    {habits.map(habit => {
                                      const isDone = completedHabitIds.includes(habit.id);
                                      return (
                                        <button
                                          key={habit.id}
                                          onClick={() => onToggleHabit(habit.id)}
                                          className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                                            isDone 
                                              ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                                              : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                                          }`}
                                        >
                                          <span className="truncate pr-2">{habit.title}</span>
                                          <div className={`w-4.5 h-4.5 rounded-md flex items-center justify-center border transition-all flex-shrink-0 ${
                                            isDone 
                                              ? 'bg-emerald-500 border-emerald-400 text-slate-950' 
                                              : 'border-slate-700 bg-slate-950'
                                          }`}>
                                            {isDone && <Check size={10} strokeWidth={4} />}
                                          </div>
                                        </button>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="leading-loose">
                              <h4 className="text-xl md:text-2xl font-bold font-serif mb-6 pb-3 border-b border-black/10 text-center tracking-tight text-amber-600">
                                {selectedBook.chapters[selectedBook.currentChapterIndex].title}
                              </h4>
                              
                              <div className="whitespace-pre-wrap text-justify font-serif">
                                {selectedBook.chapters[selectedBook.currentChapterIndex].content}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Chapter Status Footer Action bar inside popup */}
                        <div className="p-4 bg-slate-900/30 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => handleToggleReadChapter(selectedBook.chapters[selectedBook.currentChapterIndex].id)}
                              className={`p-2.5 rounded-xl border flex items-center justify-center transition-all cursor-pointer ${
                                selectedBook.readChapters.includes(selectedBook.chapters[selectedBook.currentChapterIndex].id)
                                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                                  : 'bg-slate-950 border-slate-800 text-slate-500 hover:text-white hover:border-slate-700'
                              }`}
                              title={selectedBook.readChapters.includes(selectedBook.chapters[selectedBook.currentChapterIndex].id) ? "Bỏ đánh dấu là đã đọc" : "Đánh dấu là đã thấu suốt chương này!"}
                            >
                              <CheckCircle2 size={18} />
                            </button>
                            <div>
                              <p className="text-xs font-bold text-slate-300 leading-none">
                                {selectedBook.readChapters.includes(selectedBook.chapters[selectedBook.currentChapterIndex].id)
                                  ? 'Đã thấu suốt chương này!'
                                  : 'Chưa thấu suốt chương hiện tại'}
                              </p>
                              <p className="text-[10px] text-slate-500 mt-1">Đánh dấu đã đọc sẽ lập tức hồi phục thêm +30 XP tinh túy!</p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2.5">
                            <button
                              disabled={selectedBook.currentChapterIndex === 0}
                              onClick={() => handleChangeChapterIndex(selectedBook.currentChapterIndex - 1)}
                              className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                              title="Chương trước"
                            >
                              <ChevronLeft size={16} />
                            </button>
                            <span className="text-xs text-slate-400 font-mono">
                              Chương {selectedBook.currentChapterIndex + 1} / {selectedBook.chapters.length}
                            </span>
                            <button
                              disabled={selectedBook.currentChapterIndex === selectedBook.chapters.length - 1}
                              onClick={() => handleChangeChapterIndex(selectedBook.currentChapterIndex + 1)}
                              className="p-2.5 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-white rounded-xl disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
                              title="Chương sau"
                            >
                              <ChevronRight size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-slate-900/20 text-slate-500 font-serif italic border border-slate-800 rounded-2xl">
                        Nội dung chương không tìm thấy hoặc đang được lập sơ đồ...
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center p-12 bg-slate-900/20 rounded-2xl border border-slate-800 text-slate-500 font-serif italic">
                    Cuốn sách này hiện chưa có nội dung văn bản. Vui lòng thêm chương mới tại danh sách kệ sách!
                  </div>
                )}
              </div>
            </div>

            {/* Bottom mini footer decor representing Zen read */}
            <div className="py-2 bg-slate-950 text-center border-t border-slate-900 text-[10px] text-slate-600 font-mono select-none tracking-widest uppercase text-center">
              Không gian nghiền ngẫm tri thức tĩnh lặng • Vững tâm thói quen hàng ngày
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
