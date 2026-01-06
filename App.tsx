
import React, { useState, useEffect, useRef } from 'react';
import { AppMode, StudySection, User } from './types';
import { authService as authServiceNew } from './services/authServiceNew';
import { articleService, Article } from './services/articleService';
import { studyService } from './services/studyService';
import { StudyView } from './components/StudyView';
import { ReciteView } from './components/ReciteView';
import { LoginView } from './components/LoginView';
import { UserProfileView } from './components/UserProfileView';
import { PaymentView } from './components/PaymentView';
import { ArticleListView } from './components/ArticleListView';
import { DEMO_TEXT } from './constants';
import { Sparkles, Loader2, BookOpen, LogIn, Crown, Camera, Library } from 'lucide-react';

export default function App() {
  const [mode, setMode] = useState<AppMode>(AppMode.INPUT);
  const [inputText, setInputText] = useState('');
  const [sections, setSections] = useState<StudySection[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentArticle, setCurrentArticle] = useState<Article | null>(null);

  // OCR State
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // User State
  const [user, setUser] = useState<User | null>(null);

  // Initialize App
  useEffect(() => {
    const initAuth = async () => {
        const currentUser = await authServiceNew.getCurrentUser();
        if (currentUser) {
            setUser(currentUser);
        }
    };
    initAuth();
  }, []);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    setMode(AppMode.INPUT);
  };

  const handleUpdateUser = async (updatedUser: User) => {
    try {
      const resultUser = await authServiceNew.updateProfile(updatedUser);
      setUser(resultUser);
    } catch (error) {
      console.error('更新用户失败:', error);
      alert('更新失败，请重试');
    }
  };

  const handleUpgradeToPro = async () => {
    if (!user) return;
    try {
      const upgradedUser = await authServiceNew.upgradePro();
      setUser(upgradedUser);
      setMode(AppMode.PROFILE);
      alert('🎉 恭喜！您已成功升级为 Pro 会员！');
    } catch (e) {
      alert('支付处理失败，请重试');
    }
  };

  const handleLogout = async () => {
    authServiceNew.logout();
    setUser(null);
    setMode(AppMode.LOGIN);
  };

  const handleAnalyze = async () => {
    if (!inputText.trim()) return;

    setLoading(true);
    try {
      // 使用后端 API 创建文章（自动进行 AI 分析）
      const article = await articleService.createArticle(inputText);
      setCurrentArticle(article);
      setSections(article.sections);
      setMode(AppMode.STUDY);
    } catch (error: any) {
      alert(error.message || '分析文本失败，请检查网络或后端服务。');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectArticle = async (article: Article) => {
    setCurrentArticle(article);
    setSections(article.sections);
    setInputText(article.content);
    setMode(AppMode.STUDY);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onloadend = async () => {
        const base64Data = reader.result as string;
        // base64Data is like "data:image/jpeg;base64,....."
        const base64Content = base64Data.split(',')[1];
        const mimeType = base64Data.split(';')[0].split(':')[1];

        try {
          const text = await articleService.ocrImage(base64Content, mimeType);
          if (text) {
            setInputText((prev) => (prev ? prev + '\n\n' + text : text));
          } else {
            alert('未能识别出文字，请重试。');
          }
        } catch (error) {
          console.error('OCR Error', error);
          alert('图片识别失败，请检查网络。');
        }
      };
    } catch (err) {
      console.error('OCR Error', err);
      alert('图片识别失败，请检查网络。');
    } finally {
      setIsOcrLoading(false);
      // Reset file input to allow selecting the same file again
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    // XHS Style: Use bg-[#FBFBFB] for a very clean, slightly warm white background
    <div className="min-h-screen bg-[#FBFBFB] text-slate-800 font-sans selection:bg-rose-100 selection:text-rose-600 flex flex-col">
      
      {/* App Header */}
      <header className="bg-white/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-100 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setMode(AppMode.INPUT)}>
            <div className="p-2 bg-rose-50 rounded-full group-hover:bg-rose-100 transition-colors">
               <BookOpen size={24} className="text-rose-500" />
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 hidden sm:block">ReciteAI</h1>
          </div>

          {/* Article Library Button (only show when logged in) */}
          {user && mode === AppMode.INPUT && (
             <button
               onClick={() => setMode(AppMode.ARTICLE_LIST)}
               className="hidden md:flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-sm font-bold transition-colors"
             >
               <Library size={16} />
               <span>文章库</span>
             </button>
          )}
          
          {/* Nav Stepper (Only show when NOT in login or profile mode) */}
          {mode !== AppMode.LOGIN && mode !== AppMode.PROFILE && mode !== AppMode.PAYMENT && (
            <div className="hidden md:flex gap-1 absolute left-1/2 transform -translate-x-1/2">
               {[
                 { m: AppMode.INPUT, label: "输入", idx: 1 },
                 { m: AppMode.STUDY, label: "拆解", idx: 2 },
                 { m: AppMode.RECITE, label: "背诵", idx: 3 }
               ].map((step) => (
                 <div key={step.m} className={`
                   px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2
                   ${mode === step.m 
                     ? "bg-slate-900 text-white shadow-md" 
                     : "text-slate-400 bg-transparent"}
                 `}>
                   <span className={`flex items-center justify-center w-4 h-4 rounded-full text-[9px] ${mode === step.m ? 'bg-white text-slate-900' : 'bg-slate-200 text-slate-500'}`}>
                     {step.idx}
                   </span>
                   {step.label}
                 </div>
               ))}
            </div>
          )}

          {/* User Profile / Login Button */}
          <div className="flex items-center gap-3">
             {user ? (
               <button 
                 onClick={() => setMode(AppMode.PROFILE)}
                 className={`flex items-center gap-3 pl-2 pr-1 py-1 bg-white border rounded-full shadow-sm hover:shadow-md transition-all group ${user.isPro ? 'border-amber-200' : 'border-slate-100'}`}
               >
                  <div className="hidden sm:flex flex-col items-end mr-1 group-hover:translate-x-[-2px] transition-transform">
                     <span className="text-xs font-bold text-slate-800 leading-none flex items-center gap-1">
                        {user.name}
                        {user.isPro && <Crown size={10} className="text-amber-500 fill-current" />}
                     </span>
                     <span className="text-[10px] text-slate-400 font-medium leading-none mt-0.5">{user.isPro ? 'Pro Member' : '个人中心'}</span>
                  </div>
                  <img 
                    src={user.avatar} 
                    alt={user.name} 
                    className="w-8 h-8 rounded-full bg-slate-100 border border-white shadow-sm object-cover" 
                  />
               </button>
             ) : (
               mode !== AppMode.LOGIN && (
                 <button 
                   onClick={() => setMode(AppMode.LOGIN)}
                   className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-full text-sm font-bold transition-colors shadow-lg shadow-slate-900/10"
                 >
                   <LogIn size={16} />
                   <span>登录</span>
                 </button>
               )
             )}
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full relative">
        
        {/* VIEW: LOGIN */}
        {mode === AppMode.LOGIN && (
          <LoginView 
            onLogin={handleLogin} 
            onGuest={() => setMode(AppMode.INPUT)} 
          />
        )}

        {/* VIEW: PROFILE */}
        {mode === AppMode.PROFILE && user && (
          <UserProfileView
            user={user}
            onUpdate={handleUpdateUser}
            onLogout={handleLogout}
            onBack={() => setMode(AppMode.INPUT)}
            onNavigateToPay={() => setMode(AppMode.PAYMENT)}
          />
        )}

        {/* VIEW: PAYMENT */}
        {mode === AppMode.PAYMENT && (
          <PaymentView 
            onBack={() => setMode(AppMode.PROFILE)}
            onUpgrade={handleUpgradeToPro}
          />
        )}

        {/* VIEW: ARTICLE LIST */}
        {mode === AppMode.ARTICLE_LIST && user && (
          <ArticleListView
            onSelectArticle={handleSelectArticle}
            onBack={() => setMode(AppMode.INPUT)}
          />
        )}

        {/* VIEW: INPUT */}
        {mode === AppMode.INPUT && (
          <div className="h-full flex flex-col items-center justify-center animate-in fade-in duration-500 pb-10 mt-4 md:mt-10">
            <div className="max-w-2xl w-full space-y-8">
              <div className="text-center space-y-4 mb-6">
                <h2 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight leading-tight">
                  <span className="text-rose-500">科学背诵</span><br/>由此开始
                </h2>
                <p className="text-slate-400 text-lg font-medium max-w-md mx-auto">
                  AI 智能拆解长难句，一键生成“色彩记忆卡片”，让背书像刷帖一样轻松。
                </p>
              </div>

              <div className="relative group z-10">
                {/* Decoration Blob */}
                <div className="absolute -inset-1 bg-gradient-to-r from-rose-400 to-orange-300 rounded-[2rem] blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
                
                <div className="relative bg-white p-2 rounded-[2rem] shadow-xl shadow-rose-500/5 border border-slate-50">
                   {/* OCR Processing Overlay */}
                   {isOcrLoading && (
                      <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-20 rounded-[2rem] flex flex-col items-center justify-center">
                          <Loader2 size={40} className="animate-spin text-rose-500 mb-2" />
                          <p className="text-slate-600 font-bold">正在识别图片文字...</p>
                      </div>
                   )}
                   
                  <textarea
                    className="w-full h-64 md:h-72 p-6 md:p-8 text-lg resize-none outline-none text-slate-700 bg-transparent rounded-xl placeholder:text-slate-300 leading-relaxed"
                    placeholder="请在此粘贴文本，或者点击下方按钮拍照识别..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  
                  {/* Bottom Actions inside Textarea */}
                  <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                    
                    {/* Camera Button */}
                    <div className="flex gap-2">
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            accept="image/*" 
                            onChange={handleImageUpload}
                        />
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isOcrLoading}
                            className="text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 px-3 py-2 rounded-full transition-colors flex items-center gap-1.5"
                            title="上传图片或拍照识别文字"
                        >
                            {isOcrLoading ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
                            <span>拍照识别</span>
                        </button>
                    </div>

                    {/* Demo Button */}
                    <button 
                      onClick={() => setInputText(DEMO_TEXT)}
                      className="text-xs font-bold text-slate-400 hover:text-rose-500 hover:bg-rose-50 px-3 py-2 rounded-full transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles size={12} />
                      <span>试一试例句</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex justify-center pt-6">
                 <button
                  onClick={handleAnalyze}
                  disabled={loading || !inputText.trim()}
                  className="px-12 py-4 bg-rose-500 hover:bg-rose-600 disabled:opacity-70 disabled:cursor-not-allowed text-white rounded-full font-bold text-lg shadow-lg shadow-rose-500/30 transition-all transform hover:-translate-y-1 active:translate-y-0 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Sparkles size={20} className="fill-current" />}
                  <span>生成记忆卡片</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* VIEW: STUDY */}
        {mode === AppMode.STUDY && (
          <StudyView 
            sections={sections} 
            onFinish={() => setMode(AppMode.RECITE)} 
            onBack={() => setMode(AppMode.INPUT)}
          />
        )}

        {/* VIEW: RECITE */}
        {mode === AppMode.RECITE && (
          <ReciteView 
            originalText={inputText}
            onBack={() => setMode(AppMode.STUDY)}
          />
        )}

      </main>
    </div>
  );
}
