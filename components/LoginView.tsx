
import React, { useState } from 'react';
import { User } from '../types';
import { authService as authServiceNew } from '../services/authServiceNew';
import { Sparkles, ArrowRight, ShieldCheck, Mail, Lock, Loader2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
  onGuest: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || (!isLogin && !name)) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      let user: User;
      if (isLogin) {
        user = await authServiceNew.login(email, password);
      } else {
        user = await authServiceNew.register(name, email, password);
      }
      onLogin(user);
    } catch (err: any) {
      setErrorMsg(err.message || (isLogin ? '登录失败' : '注册失败'));
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setErrorMsg('');
  };

  return (
    <div className="h-full flex flex-col items-center justify-center p-4 animate-in fade-in zoom-in-95 duration-500">
      {/* Card */}
      <div className="bg-white rounded-[2.5rem] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-slate-100 max-w-md w-full text-center space-y-8 relative overflow-hidden">
        
        {/* Decorative background blur */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-400"></div>
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-50 rounded-full blur-3xl opacity-50 pointer-events-none"></div>

        <div className="space-y-4 relative">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 text-white mb-2 shadow-xl shadow-slate-200 transform rotate-3 hover:rotate-6 transition-transform">
                <Sparkles size={36} className="text-emerald-400" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">欢迎回来</h2>
              <p className="text-slate-400 font-medium mt-2">登录以同步您的记忆卡片</p>
            </div>
        </div>

        {/* Login Form */}
        <div className="space-y-4 pt-2">
            {/* Error Message */}
            {errorMsg && (
                <div className="bg-rose-50 text-rose-500 text-xs py-2 rounded-lg font-bold animate-in slide-in-from-top-2">
                    {errorMsg}
                </div>
            )}

            {/* Email/Password Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
                {!isLogin && (
                  <div className="relative">
                      <div className="absolute left-4 top-3.5 text-slate-400">
                          <Sparkles size={18} />
                      </div>
                      <input
                          type="text"
                          placeholder="用户名"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                      />
                  </div>
                )}
                <div className="relative">
                    <div className="absolute left-4 top-3.5 text-slate-400">
                        <Mail size={18} />
                    </div>
                    <input
                        type="email"
                        placeholder="邮箱"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                </div>
                <div className="relative">
                    <div className="absolute left-4 top-3.5 text-slate-400">
                        <Lock size={18} />
                    </div>
                    <input
                        type="password"
                        placeholder="密码"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-100 rounded-xl py-3 pl-11 pr-4 font-bold text-slate-800 placeholder:text-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                </div>

                 <button
                    type="submit"
                    disabled={isLoading || !email || !password || (!isLogin && !name)}
                    className="w-full py-3.5 px-6 bg-slate-900 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl font-bold transition-all flex items-center justify-center gap-3 shadow-lg shadow-slate-200"
                >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : (isLogin ? '登录' : '注册')}
                </button>
            </form>

            <div className="text-center">
                <button
                    type="button"
                    onClick={toggleMode}
                    className="text-sm text-slate-500 hover:text-slate-700 font-medium"
                >
                    {isLogin ? '还没有账号？立即注册' : '已有账号？返回登录'}
                </button>
            </div>

             <button
                type="button"
                onClick={onGuest}
                className="w-full py-3 px-6 text-slate-400 hover:text-slate-600 text-sm font-bold transition-all flex items-center justify-center gap-1"
            >
                <span>暂不登录，直接试用</span>
                <ArrowRight size={14} />
            </button>
        </div>
        
        <div className="flex items-center justify-center gap-2 text-[10px] text-slate-300 pt-2">
            <ShieldCheck size={12} />
            <span>已通过工信部安全认证</span>
        </div>
      </div>
    </div>
  );
};
