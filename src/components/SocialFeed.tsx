/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, Heart, MessageCircle, Send, Plus, Sparkles, Image as ImageIcon } from 'lucide-react';
import { SocialPost, SocialComment, Ebook } from '../types';
import { VIRTUAL_MENTORS, VIRTUAL_PEERS } from '../lib/personas';
import { Newspaper, TrendingUp, Zap } from 'lucide-react';

interface SocialFeedProps {
  userName: string;
  userAvatar: string;
  posts: SocialPost[];
  setPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  onPostCreated: (post: SocialPost) => void;
  library: Ebook[];
}


export const SocialFeed: React.FC<SocialFeedProps> = ({ userName, userAvatar, posts, setPosts, onPostCreated, library }) => {
  const [trendingNews, setTrendingNews] = useState<any[]>([]);

  // Function to generate dynamic trending news from personas
  useEffect(() => {
    const allPersonas = [...VIRTUAL_MENTORS, ...VIRTUAL_PEERS];
    
    // Shuffle and pick 6 random updates to act as news
    const generateNews = () => {
      const shuffled = [...allPersonas].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, 6).map((persona, idx) => {
        const update = persona.dailyStatusUpdates[Math.floor(Math.random() * persona.dailyStatusUpdates.length)];
        const engagement = (Math.random() * 15 + 1).toFixed(1) + 'k';
        const topics = ['Kỷ luật', 'Cộng đồng', 'Khoa học', 'Năng suất', 'Công nghệ', 'Vui vẻ', 'Sáng tạo', 'Đời sống'];
        
        return {
          id: `news-${idx}-${Date.now()}`,
          topic: topics[Math.floor(Math.random() * topics.length)],
          title: `[Trực tiếp] ${persona.name}: "${update}"`,
          engagement
        };
      });
      setTrendingNews(selected);
    };

    generateNews();
    const interval = setInterval(generateNews, 300000); // Refresh every 5 mins
    return () => clearInterval(interval);
  }, []);

  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [commentInputs, setCommentInputs] = useState<{[postId: string]: string}>({});
  
  const [expandedComments, setExpandedComments] = useState<{[postId: string]: boolean}>(() => {
    const initial: {[postId: string]: boolean} = {};
    posts.forEach(p => {
      if (p.comments && p.comments.length > 0) {
        initial[p.id] = true;
      }
    });
    return initial;
  });

  const [likedPosts, setLikedPosts] = useState<{[postId: string]: boolean}>(() => {
    try {
      const saved = localStorage.getItem('habit_mosaic_liked_posts');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  useEffect(() => {
    localStorage.setItem('habit_mosaic_liked_posts', JSON.stringify(likedPosts));
  }, [likedPosts]);

  const handleLikePost = (postId: string) => {
    const wasLiked = !!likedPosts[postId];
    setLikedPosts(prev => ({ ...prev, [postId]: !wasLiked }));
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          likes: wasLiked ? Math.max(0, p.likes - 1) : p.likes + 1
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInputs[postId]?.trim();
    if (!text) return;

    const newComment: SocialComment = {
      id: `c-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorId: 'local-user',
      authorName: userName || 'Bạn',
      authorAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
      content: text,
      createdAt: new Date().toISOString()
    };

    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: [...(p.comments || []), newComment]
        };
      }
      return p;
    }));

    setCommentInputs(prev => ({ ...prev, [postId]: '' }));

    // Generate a funny reply from virtual mentors like Stephen Chow (Châu Tinh Trì) after a brief delay
    setTimeout(() => {
      const randomMentor = VIRTUAL_MENTORS[Math.floor(Math.random() * VIRTUAL_MENTORS.length)];
      
      let replyContent = '';
      if (randomMentor.id === 'm10') {
        const chowReplies = [
          "Dữ dội sao ta! Quả là hảo hữu, comment mượt như dùng Như Lai Thần Chưởng vậy!",
          "Nghe chí lý, cốt cách tinh anh như cưng mà kiên trì bớt lười là xuất sắc rồi!",
          "Ồ, đỉnh của chóp! Hôm nay ráng rèn luyện đi, mai mốt tôi truyền cho bí kíp đổi đời!",
          "Chu cha mạ ơi, bái phục bái phục! Đội bóng Thiếu Lâm cũng không khéo bằng cái mỏ lanh lợi này!"
        ];
        replyContent = chowReplies[Math.floor(Math.random() * chowReplies.length)];
      } else {
        const commentsPool = [
          ...randomMentor.commentStyles,
          ...randomMentor.contextualComments.motivation,
          ...randomMentor.contextualComments.productivity
        ];
        replyContent = commentsPool[Math.floor(Math.random() * commentsPool.length)];
      }

      const mentorComment: SocialComment = {
        id: `c-reply-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        authorId: randomMentor.id,
        authorName: randomMentor.name,
        authorAvatar: randomMentor.avatar,
        content: `Hảo bằng hữu ${userName || 'Bạn'} ơi: ${replyContent}`,
        createdAt: new Date().toISOString()
      };

      setPosts(prev => prev.map(p => {
        if (p.id === postId) {
          return {
            ...p,
            comments: [...(p.comments || []), mentorComment]
          };
        }
        return p;
      }));
    }, 1200);
  };

  const handleCreatePost = () => {
    if (!newPostContent.trim()) return;

    const newPost: SocialPost = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorName: userName || 'Bạn',
      authorAvatar: userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`,
      content: newPostContent,
      type: 'habit',
      createdAt: new Date().toISOString(),
      likes: 0,
      comments: []
    };

    setPosts(prev => [newPost, ...prev]);
    setNewPostContent('');
    setIsPosting(false);
    onPostCreated(newPost);
  };

  // Auto-generate some initial posts if empty (simulating daily life)
  useEffect(() => {
    if (posts.length === 0) {
      const mentorsForFeed = [...VIRTUAL_MENTORS].sort(() => 0.5 - Math.random()).slice(0, 5);
      
      const initialPosts: SocialPost[] = mentorsForFeed.map((mentor, idx) => {
        let content = '';
        let type: SocialPost['type'] = 'habit';

        // 40% chance to post about a book if library exists
        if (library.length > 0 && Math.random() > 0.6) {
          const book = library[Math.floor(Math.random() * library.length)];
          const bookComments = [
            `Tôi vừa đọc lại vài chương trong "${book.title}". Những kiến thức này thực sự là một kho báu vô tận.`,
            `Bạn có đang nghiền ngẫm cuốn "${book.title}" không? Tôi thấy những ý tưởng trong đó rất phù hợp với hành trình của chúng ta.`,
            `Một buổi sáng tuyệt vời để suy ngẫm về những triết lý trong "${book.title}". Hy vọng bạn cũng tìm thấy cảm hứng từ nó.`,
            `Kết nối tri thức từ "${book.title}" với thực tế cuộc sống là cách nhanh nhất để trưởng thành.`,
            `Trong "${book.title}", tác giả ${book.author} đã nhắc đến một điểm mà tôi cực kỳ tâm đắc về kỷ luật bản thân.`
          ];
          content = bookComments[Math.floor(Math.random() * bookComments.length)];
          type = 'ebook';
        } else {
          content = idx % 2 === 0 
            ? mentor.dailyStatusUpdates[Math.floor(Math.random() * mentor.dailyStatusUpdates.length)]
            : mentor.quote;
          type = idx % 2 === 0 ? 'habit' : 'achievement';
        }
          
        return {
          id: `p-${idx}-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          authorName: mentor.name,
          authorAvatar: mentor.avatar,
          content,
          type,
          createdAt: new Date(Date.now() - (idx + 1) * 7200000).toISOString(),
          likes: Math.floor(Math.random() * 25) + 5,
          comments: [
            {
              id: `c-${idx}-init-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
              authorId: VIRTUAL_MENTORS[(idx + 1) % VIRTUAL_MENTORS.length].id,
              authorName: VIRTUAL_MENTORS[(idx + 1) % VIRTUAL_MENTORS.length].name,
              authorAvatar: VIRTUAL_MENTORS[(idx + 1) % VIRTUAL_MENTORS.length].avatar,
              content: mentor.commentStyles[0],
              createdAt: new Date(Date.now() - (idx + 1) * 3600000).toISOString(),
            }
          ]
        };
      });
      setPosts(initialPosts);
    }
  }, [posts.length, setPosts, library]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-6xl mx-auto px-4 pb-20">
      {/* Left Column: Feed */}
      <div className="lg:col-span-8 space-y-6">
        {/* Create Post Card */}
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-4 shadow-xl">
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden flex-shrink-0">
               <img src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="avatar" />
            </div>
            <div className="flex-1">
              <textarea
                placeholder="Bạn đang thấy thế nào về tiến trình hôm nay?"
                className="w-full bg-transparent border-none text-slate-200 placeholder:text-slate-500 focus:ring-0 resize-none py-2 text-sm min-h-[80px]"
                value={newPostContent}
                onChange={(e) => setNewPostContent(e.target.value)}
              />
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50">
                <div className="flex gap-2">
                  <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all">
                    <ImageIcon size={18} />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 rounded-xl transition-all">
                    <Sparkles size={18} />
                  </button>
                </div>
                <button
                  onClick={handleCreatePost}
                  disabled={!newPostContent.trim()}
                  className="bg-amber-500 disabled:opacity-50 disabled:bg-slate-700 text-slate-950 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 hover:bg-amber-400 transition-all active:scale-95"
                >
                  Chia sẻ <Send size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Feed */}
        <AnimatePresence>
          {posts.map((post, idx) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-3xl overflow-hidden shadow-lg"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-800 overflow-hidden border border-slate-700">
                    <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-sm font-bold text-white leading-none">{post.authorName}</h4>
                      {VIRTUAL_MENTORS.some(m => m.name === post.authorName) && (
                        <div className="px-1 py-0.5 bg-amber-500/20 rounded-md">
                          <Zap size={8} className="fill-amber-500 text-amber-500" />
                        </div>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-black">
                      {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="ml-auto">
                     <span className="px-2 py-0.5 bg-slate-800 rounded-lg text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                       {post.type === 'achievement' ? 'Thành tựu' : 
                        post.type === 'habit' ? 'Thói quen' : 
                        post.type === 'ebook' ? 'Sách' : 'Bức tranh'}
                     </span>
                  </div>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed mb-4">
                  {post.content}
                </p>

                <div className="flex items-center gap-6 pt-4 border-t border-slate-800/30">
                  <button 
                    onClick={() => handleLikePost(post.id)}
                    className={`flex items-center gap-2 transition-all ${likedPosts[post.id] ? 'text-rose-500 hover:text-rose-400 font-black' : 'text-slate-400 hover:text-rose-500'}`}
                  >
                    <Heart size={18} className={likedPosts[post.id] ? "fill-rose-500 text-rose-500 scale-110" : "transition-transform hover:scale-110"} />
                    <span className="text-xs font-bold">{post.likes}</span>
                  </button>
                  <button 
                    onClick={() => setExpandedComments(prev => ({ ...prev, [post.id]: !prev[post.id] }))}
                    className={`flex items-center gap-2 transition-colors ${expandedComments[post.id] ? 'text-amber-500' : 'text-slate-400 hover:text-amber-500'}`}
                  >
                    <MessageCircle size={18} />
                    <span className="text-xs font-bold">{(post.comments || []).length}</span>
                  </button>
                  <button className="flex items-center gap-2 text-slate-400 ml-auto hover:text-blue-500 transition-colors">
                    <Share2 size={18} />
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {(((post.comments || []).length > 0) || expandedComments[post.id]) && (
                <div className="bg-slate-950/30 border-t border-slate-800/30 p-4 space-y-4">
                  {/* List of comments */}
                  <AnimatePresence>
                    {(post.comments || []).map((comment) => (
                      <motion.div
                        key={comment.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3"
                      >
                        <div className="w-8 h-8 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex-shrink-0">
                          <img src={comment.authorAvatar} alt={comment.authorName} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 bg-slate-800/40 rounded-2xl rounded-tl-none p-3 border border-slate-700/30">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-black text-amber-500">{comment.authorName}</span>
                              {VIRTUAL_MENTORS.some(m => m.name === comment.authorName) && (
                                <Zap size={10} className="fill-amber-500 text-amber-500" />
                              )}
                            </div>
                            <span className="text-[9px] text-slate-600 font-bold uppercase">
                              {(() => {
                                const diff = Date.now() - new Date(comment.createdAt).getTime();
                                const mins = Math.floor(diff / 60000);
                                if (mins < 1) return 'vừa xong';
                                if (mins < 60) return `${mins} phút trước`;
                                return `${Math.floor(mins / 60)} giờ trước`;
                              })()}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300">{comment.content}</p>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>

                  {/* Add Comment Input Form */}
                  <div className="flex gap-3 pt-2 border-t border-slate-500/10">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 overflow-hidden border border-slate-700 flex-shrink-0">
                      <img src={userAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userName}`} alt="user avatar" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 relative flex items-center bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all rounded-xl px-3 py-1.5 focus-within:border-amber-500/50">
                      <input
                        type="text"
                        placeholder="Hỏi han hoặc phản pháo phong cách Châu Tinh Trì..."
                        className="w-full bg-transparent border-none text-xs text-slate-200 placeholder:text-slate-600 focus:ring-0 focus:outline-none p-0 pr-8"
                        value={commentInputs[post.id] || ''}
                        onChange={(e) => setCommentInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleAddComment(post.id);
                          }
                        }}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!(commentInputs[post.id] || '').trim()}
                        className="absolute right-2 text-slate-500 hover:text-amber-500 disabled:opacity-30 disabled:hover:text-slate-500 transition-all"
                      >
                        <Send size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Right Column: Trending News */}
      <div className="lg:col-span-4 space-y-6 sticky top-6 self-start">
        <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div className="flex items-center gap-2 mb-6 text-amber-500">
             <TrendingUp size={20} />
             <h3 className="font-bold text-sm uppercase tracking-widest text-white">Xu hướng cộng đồng</h3>
          </div>
          
          <div className="space-y-6">
            {trendingNews.map((news) => (
              <div key={news.id} className="group cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                   <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest group-hover:text-amber-500 transition-colors">#{news.topic}</span>
                   <div className="flex items-center gap-1 text-[10px] text-slate-600 font-bold ml-auto">
                      <Zap size={10} className="fill-amber-500/20 text-amber-500" />
                      {news.engagement}
                   </div>
                </div>
                <h4 className="text-sm font-medium text-slate-300 group-hover:text-white transition-colors leading-snug">
                  {news.title}
                </h4>
              </div>
            ))}
          </div>

          <button className="w-full mt-6 py-3 rounded-xl bg-slate-800/50 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-white transition-all border border-slate-700/50">
            Xem tất cả tin tức
          </button>
        </div>

        <div className="bg-gradient-to-br from-amber-500/10 to-rose-500/10 border border-amber-500/20 rounded-3xl p-6">
           <div className="flex items-center gap-2 mb-3 text-amber-500">
              <Sparkles size={18} />
              <h3 className="font-bold text-xs uppercase tracking-widest">Gợi ý thói quen</h3>
           </div>
           <p className="text-xs text-slate-400 italic leading-relaxed">
             "Bí mật của tương lai nằm trong thói quen hàng ngày của bạn." - Hãy thử thêm một thói quen đọc sách vào tối nay!
           </p>
        </div>
      </div>
    </div>
  );
};
