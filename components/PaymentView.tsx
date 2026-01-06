import React, { useState } from 'react';
import { Check, X, ArrowLeft, Loader2, Sparkles, Zap, Crown } from 'lucide-react';

interface PaymentViewProps {
  onBack: () => void;
  onUpgrade: () => void;
}

export const PaymentView: React.FC<PaymentViewProps> = ({ onBack, onUpgrade }) => {
  const [processing, setProcessing] = useState(false);

  const handlePay = () => {
    setProcessing(true);
    // Simulate payment processing delay
    setTimeout(() => {
      setProcessing(false);
      onUpgrade();
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
      
      {/* Header */}
      <div className="flex items-center mb-8">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-slate-800 font-bold transition-colors">
          <ArrowLeft size={18} />
          <span>返回</span>
        </button>
      </div>

      <div className="text-center mb-10 space-y-4">
        <h2 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight">
          解锁 <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-orange-500">ReciteAI Pro</span>
        </h2>
        <p className="text-slate-500 text-lg">通过 AI 深度赋能，让记忆效率提升 300%</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-start">
        
        {/* Free Plan */}
        <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm relative opacity-80 hover:opacity-100 transition-opacity">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-800">基础版</h3>
            <div className="mt-4 flex items-baseline text-slate-900">
              <span className="text-4xl font-black tracking-tight">Free</span>
            </div>
            <p className="mt-2 text-slate-400 text-sm">适合偶尔练习的轻度用户</p>
          </div>

          <ul className="space-y-4 mb-8">
            <li className="flex items-center gap-3 text-slate-600">
              <Check size={18} className="text-emerald-500" />
              <span>每日 3 次 AI 拆解</span>
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <Check size={18} className="text-emerald-500" />
              <span>基础单词朗读</span>
            </li>
            <li className="flex items-center gap-3 text-slate-600">
              <Check size={18} className="text-emerald-500" />
              <span>简单的背诵评分</span>
            </li>
             <li className="flex items-center gap-3 text-slate-400 line-through decoration-slate-300">
              <X size={18} />
              <span>无限次使用</span>
            </li>
            <li className="flex items-center gap-3 text-slate-400 line-through decoration-slate-300">
              <X size={18} />
              <span>Gemini 2.5 高级语音</span>
            </li>
          </ul>

          <button disabled className="w-full py-3 bg-slate-100 text-slate-400 rounded-xl font-bold cursor-not-allowed">
            当前方案
          </button>
        </div>

        {/* Pro Plan */}
        <div className="bg-white rounded-[2rem] p-1 border-2 border-rose-100 shadow-2xl shadow-rose-500/10 relative overflow-hidden group">
          {/* Badge */}
          <div className="absolute top-0 right-0 bg-rose-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl z-10">
            MOST POPULAR
          </div>
          <div className="absolute inset-0 bg-gradient-to-br from-rose-50 to-orange-50 opacity-50 pointer-events-none"></div>

          <div className="p-7 relative z-0">
             <div className="mb-6">
                <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-xl font-bold text-slate-900">Pro 会员</h3>
                    <Crown size={18} className="text-amber-500 fill-current" />
                </div>
                <div className="mt-4 flex items-baseline text-slate-900">
                <span className="text-4xl font-black tracking-tight">¥18</span>
                <span className="ml-1 text-slate-500 font-bold">/月</span>
                </div>
                <p className="mt-2 text-rose-500 text-sm font-medium">首月仅需 ¥9.9</p>
            </div>

            <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3 text-slate-800 font-medium">
                <div className="bg-rose-100 p-1 rounded-full"><Zap size={14} className="text-rose-600 fill-current" /></div>
                <span>无限次 AI 拆解与分析</span>
                </li>
                <li className="flex items-center gap-3 text-slate-800 font-medium">
                <div className="bg-rose-100 p-1 rounded-full"><Sparkles size={14} className="text-rose-600 fill-current" /></div>
                <span>Gemini 2.5 拟人化全朗读</span>
                </li>
                <li className="flex items-center gap-3 text-slate-800 font-medium">
                <div className="bg-rose-100 p-1 rounded-full"><Check size={14} className="text-rose-600" /></div>
                <span>精准的逐词纠音报告</span>
                </li>
                <li className="flex items-center gap-3 text-slate-800 font-medium">
                <div className="bg-rose-100 p-1 rounded-full"><Check size={14} className="text-rose-600" /></div>
                <span>专属记忆曲线复习计划</span>
                </li>
            </ul>

            <button 
                onClick={handlePay}
                disabled={processing}
                className="w-full py-4 bg-gradient-to-r from-slate-900 to-slate-800 hover:from-slate-800 hover:to-slate-700 text-white rounded-xl font-bold shadow-lg shadow-slate-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
                {processing ? (
                    <>
                        <Loader2 className="animate-spin" size={20} />
                        <span>处理中...</span>
                    </>
                ) : (
                    <>
                        <span>立即升级</span>
                        <Zap size={18} className="fill-current text-yellow-300" />
                    </>
                )}
            </button>
            <p className="text-center text-xs text-slate-400 mt-3">7天无理由退款 · 随时取消</p>
          </div>
        </div>
      </div>
    </div>
  );
};