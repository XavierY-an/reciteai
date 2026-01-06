
import React, { useState } from 'react';
import { User } from '../types';
import { ArrowLeft, Camera, Save, Flame, Trophy, Target, LogOut, RefreshCw, Crown, ChevronRight } from 'lucide-react';

interface UserProfileViewProps {
  user: User;
  onUpdate: (user: User) => void;
  onLogout: () => void;
  onBack: () => void;
  onNavigateToPay: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ user, onUpdate, onLogout, onBack, onNavigateToPay }) => {
  const [name, setName] = useState(user.name);
  const [avatarUrl, setAvatarUrl] = useState(user.avatar);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API delay
    setTimeout(() => {
      onUpdate({ ...user, name, avatar: avatarUrl });
      setIsSaving(false);
      onBack();
    }, 500);
  };

  const refreshAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setAvatarUrl(`https://api.dicebear.com/7.x/notionists/svg?seed=${randomSeed}&backgroundColor=ffdfbf`);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-slate-800 font-bold transition-colors">
          <ArrowLeft size={18} />
          <span>返回</span>
        </button>
        <h2 className="text-lg font-bold text-slate-800">个人主页</h2>
        <button 
          onClick={onLogout}
          className="text-rose-500 hover:bg-rose-50 p-2 rounded-full transition-colors"
          title="退出登录"
        >
          <LogOut size={20} />
        </button>
      </div>

      <div className="space-y-6 pb-20">
        
        {/* Profile Card */}
        <div className="bg-white rounded-[2rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-r from-slate-800 to-slate-900"></div>
          
          <div className="relative flex flex-col items-center mt-8">
            <div className="relative group">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg bg-white overflow-hidden relative">
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                {/* Pro Badge on Avatar */}
                {user.isPro && (
                   <div className="absolute bottom-0 right-0 bg-slate-900 text-yellow-400 p-1.5 rounded-full border-2 border-white" title="Pro Member">
                      <Crown size={14} className="fill-current" />
                   </div>
                )}
              </div>
              <button 
                onClick={refreshAvatar}
                className="absolute bottom-0 right-0 bg-slate-900 text-white p-2 rounded-full hover:bg-rose-500 transition-colors shadow-md z-10"
                title="随机头像"
              >
                <RefreshCw size={16} />
              </button>
            </div>

            <div className="w-full max-w-xs mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 ml-1">昵称</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-center font-bold text-lg rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all"
                />
              </div>
              
              {/* Membership Status Button */}
              {user.isPro ? (
                 <div className="flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 rounded-xl font-bold border border-amber-100">
                    <Crown size={18} className="fill-current" />
                    <span>尊贵的 Pro 会员</span>
                 </div>
              ) : (
                <button 
                    onClick={onNavigateToPay}
                    className="w-full py-3 bg-white border-2 border-rose-100 text-rose-500 hover:bg-rose-50 rounded-xl font-bold transition-all flex items-center justify-center gap-2 group"
                >
                    <Crown size={18} />
                    <span>升级到 Pro 会员</span>
                    <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
              )}

              <button 
                onClick={handleSave}
                disabled={isSaving}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-lg shadow-slate-900/10 flex items-center justify-center gap-2 active:scale-95"
              >
                {isSaving ? "保存中..." : (
                    <>
                        <Save size={18} />
                        <span>保存更改</span>
                    </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-500 flex items-center justify-center mb-2">
                    <Flame size={20} className="fill-current" />
                </div>
                <span className="text-2xl font-black text-slate-800">12</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">连续打卡</span>
            </div>
            
            <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mb-2">
                    <Trophy size={20} className="fill-current" />
                </div>
                <span className="text-2xl font-black text-slate-800">856</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">累计单词</span>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-50 shadow-sm flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-2">
                    <Target size={20} className="fill-current" />
                </div>
                <span className="text-2xl font-black text-slate-800">92%</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">平均准确率</span>
            </div>
        </div>

        {/* Recent Activity Mockup */}
        <div className="bg-white rounded-[2rem] p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-50">
            <h3 className="text-sm font-bold text-slate-800 mb-4">最近练习</h3>
            <div className="space-y-3">
                {[
                    { title: "New Concept English 3 - L24", score: 95, date: "Today" },
                    { title: "TOEFL Reading - Geology", score: 88, date: "Yesterday" },
                    { title: "The Great Gatsby - Intro", score: 92, date: "2 days ago" }
                ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                        <div>
                            <div className="font-bold text-slate-700 text-sm">{item.title}</div>
                            <div className="text-xs text-slate-400">{item.date}</div>
                        </div>
                        <div className={`
                            px-2 py-1 rounded text-xs font-bold
                            ${item.score >= 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}
                        `}>
                            {item.score}
                        </div>
                    </div>
                ))}
            </div>
        </div>

      </div>
    </div>
  );
};