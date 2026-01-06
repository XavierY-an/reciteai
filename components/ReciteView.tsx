
import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Loader2, CheckCircle, ArrowLeft } from 'lucide-react';
import { ReciteResult, WordResult } from '../types';
import { gradeRecitationWithGemini } from '../services/geminiService';

interface ReciteViewProps {
  originalText: string;
  onBack: () => void;
}

export const ReciteView: React.FC<ReciteViewProps> = ({ originalText, onBack }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<ReciteResult | null>(null);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = handleRecordingStop;
      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);
      setResult(null);
      setAudioUrl(null);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      alert("无法访问麦克风，请允许权限。");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
      mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  };

  const handleRecordingStop = async () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    const url = URL.createObjectURL(blob);
    setAudioUrl(url);

    setIsProcessing(true);
    try {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = reader.result as string;
        const base64Content = base64data.split(',')[1];
        const mimeType = base64data.split(';')[0].split(':')[1];
        const analysis = await gradeRecitationWithGemini(originalText, base64Content, mimeType);
        setResult(analysis);
        setIsProcessing(false);
      };
    } catch (error) {
      console.error("Analysis failed", error);
      alert("分析音频失败，请重试。");
      setIsProcessing(false);
    }
  };

  const renderWord = (item: WordResult, index: number) => {
    switch (item.status) {
      case 'correct':
        return <span key={index} className="text-slate-700 mx-0.5">{item.word}</span>;
      case 'missed':
        return (
          <span key={index} className="text-rose-300 line-through decoration-2 mx-0.5" title="漏读">
            {item.word}
          </span>
        );
      case 'wrong':
        return (
          <span key={index} className="inline-flex flex-col items-center mx-0.5 align-bottom group relative">
            <span className="text-rose-600 font-bold border-b-2 border-rose-200 cursor-help">{item.correctedWord || "???"}</span>
            {/* Tooltip for the original word */}
            <span className="absolute -top-6 bg-slate-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              原文: {item.word}
            </span>
          </span>
        );
      case 'extra':
        return (
          <span key={index} className="text-amber-600 bg-amber-50 px-1 rounded mx-0.5 text-sm" title="多读">
            {item.word}
          </span>
        );
      default:
        return <span key={index}>{item.word} </span>;
    }
  };

  return (
    <div className="flex flex-col h-full w-full max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-slate-800 font-bold transition-colors">
          <ArrowLeft size={18} />
          <span>返回</span>
        </button>
        <h2 className="text-lg font-bold text-slate-800 bg-white px-4 py-1 rounded-full shadow-sm border border-slate-100">背诵检查</h2>
        <div className="w-16"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-10">
        {/* Recording Interface */}
        <div className="bg-white rounded-[2rem] p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col items-center justify-center mb-8 relative overflow-hidden">
          
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 to-orange-400"></div>

          <div className={`
            relative flex items-center justify-center w-28 h-28 rounded-full transition-all duration-500
            ${isRecording ? 'bg-rose-50 ring-4 ring-rose-100' : 'bg-slate-50'}
          `}>
             {isRecording && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-20 animate-ping"></span>
             )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              disabled={isProcessing}
              className={`
                z-10 w-24 h-24 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-105 active:scale-95
                ${isRecording ? 'bg-gradient-to-br from-rose-500 to-red-600' : 'bg-gradient-to-br from-slate-700 to-slate-900'}
                ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {isProcessing ? (
                <Loader2 className="animate-spin" size={36} />
              ) : isRecording ? (
                <Square size={32} fill="currentColor" />
              ) : (
                <Mic size={36} />
              )}
            </button>
          </div>
          
          <p className="mt-6 text-slate-500 font-medium tracking-wide">
            {isProcessing ? "AI 正在评分..." : isRecording ? "点击按钮结束" : "点击按钮开始背诵"}
          </p>
        </div>

        {/* Results Area */}
        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 space-y-6">
            
            {/* Score Card */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex items-center gap-5">
                <div className={`
                  w-20 h-20 rounded-full flex items-center justify-center text-3xl font-black shadow-inner
                  ${result.score >= 90 ? 'bg-green-50 text-green-600' : 
                    result.score >= 70 ? 'bg-amber-50 text-amber-600' : 'bg-rose-50 text-rose-600'}
                `}>
                  {result.score}
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">本次得分</h3>
                  <p className="text-slate-800 font-bold text-lg">{result.score >= 90 ? "大神级表现！🎉" : result.score >= 70 ? "很稳，继续保持！👏" : "多练几次就好啦 💪"}</p>
                </div>
              </div>

              <div className="bg-white p-6 rounded-[1.5rem] border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-center">
                 <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">AI 建议</h3>
                 <p className="text-slate-600 text-sm font-medium leading-relaxed">"{result.feedback}"</p>
              </div>
            </div>

            {/* Detailed Analysis */}
            <div className="bg-white p-8 rounded-[1.5rem] border border-slate-50 shadow-[0_4px_20px_rgba(0,0,0,0.03)]">
              <h3 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle size={22} className="text-rose-500" />
                复盘分析
              </h3>
              <div className="leading-[2.5rem] text-lg text-slate-600">
                {result.detailedAnalysis.map((item, idx) => renderWord(item, idx))}
              </div>
              
              <div className="mt-8 flex flex-wrap gap-6 text-xs font-bold text-slate-400 border-t border-slate-100 pt-6 justify-center">
                 <div className="flex items-center gap-2"><span className="w-2 h-2 bg-slate-700 rounded-full"></span> 正确</div>
                 <div className="flex items-center gap-2"><span className="w-2 h-2 bg-rose-300 rounded-full"></span> 漏读</div>
                 <div className="flex items-center gap-2"><span className="w-2 h-2 bg-rose-600 rounded-full"></span> 读错</div>
                 <div className="flex items-center gap-2"><span className="w-2 h-2 bg-amber-400 rounded-full"></span> 多读</div>
              </div>
            </div>

            {/* Playback */}
            {audioUrl && (
              <div className="flex justify-center pt-2 opacity-80 hover:opacity-100 transition-opacity">
                 <audio controls src={audioUrl} className="w-full max-w-sm h-10 rounded-full" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
