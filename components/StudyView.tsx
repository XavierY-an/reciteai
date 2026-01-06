
import React, { useState, useRef, useEffect } from 'react';
import { StudySection, SegmentRole, Segment } from '../types';
import { ChevronRight, Layers, Lightbulb, ArrowLeft, Volume2, Eye, EyeOff, Loader2, Headphones, Languages, GripHorizontal, ArrowRightLeft, BookOpenText, X, Filter, Bone, MoveRight } from 'lucide-react';
import { convertTextToSpeech, lookupWordDefinition, WordDefinition } from '../services/geminiService';

interface StudyViewProps {
  sections: StudySection[];
  onFinish: () => void;
  onBack: () => void;
}

// Utility to decode raw PCM from Gemini (1 channel, 24kHz)
async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const StudyView: React.FC<StudyViewProps> = ({ sections: initialSections, onFinish, onBack }) => {
  const [sections, setSections] = useState<StudySection[]>(initialSections);
  const [allHidden, setAllHidden] = useState(false);
  const [nonCoreHidden, setNonCoreHidden] = useState(false);
  
  // Modes
  const [hintMode, setHintMode] = useState(false); // If true, hidden blocks show First Letter Hint
  const [reorderMode, setReorderMode] = useState(false); // If true, enable drag and drop
  const [dictionaryMode, setDictionaryMode] = useState(false); // If true, clicking shows definition
  const [showTranslations, setShowTranslations] = useState<Record<string, boolean>>({}); // Toggle full translation per section

  // Playback State
  const [playingId, setPlayingId] = useState<string | null>(null); // 'full', or sectionId
  
  // DnD State
  const [draggedItem, setDraggedItem] = useState<{sIdx: number, pIdx: number} | null>(null);
  const [dropTarget, setDropTarget] = useState<{ sIdx: number, pIdx: number, partIdx: number, position: 'left' | 'right' } | null>(null);
  
  // Definition State (Dictionary Mode)
  const [activeDefinition, setActiveDefinition] = useState<WordDefinition | null>(null);
  const [isLoadingDefinition, setIsLoadingDefinition] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      stopAudio();
    };
  }, []);

  // --- AUDIO LOGIC ---

  const stopAudio = () => {
    if (sourceNodeRef.current) {
      sourceNodeRef.current.stop();
      sourceNodeRef.current = null;
    }
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }
    setPlayingId(null);
  };

  const playGeminiAudio = async (text: string, id: string) => {
    try {
      stopAudio();
      setPlayingId(id);

      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      const rawPcmBytes = await convertTextToSpeech(text);
      const audioBuffer = await decodeAudioData(rawPcmBytes, ctx, 24000, 1);
      
      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(ctx.destination);
      source.onended = () => setPlayingId(null);
      source.start();
      sourceNodeRef.current = source;

    } catch (error) {
      console.error("Audio playback error:", error);
      alert("播放音频失败，请稍后重试");
      setPlayingId(null);
    }
  };

  const playBrowserAudio = (text: string, style: 'standard' | 'soft-female' = 'standard') => {
      if (!window.speechSynthesis) return;
      window.speechSynthesis.cancel();
      
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'en-US';
      
      if (style === 'soft-female') {
          const voices = window.speechSynthesis.getVoices();
          const femaleVoice = voices.find(v => 
             v.name.includes('Google US English') || 
             v.name.includes('Samantha') || 
             v.name.includes('Zira') || 
             v.name.toLowerCase().includes('female')
          );
          
          if (femaleVoice) {
              utterance.voice = femaleVoice;
          }
          utterance.pitch = 1.1; 
          utterance.rate = 0.85; 
      } else {
          utterance.rate = 0.9;
      }

      window.speechSynthesis.speak(utterance);
  };

  const handlePlayFull = () => {
      if (playingId === 'full') {
          stopAudio();
      } else {
          const fullText = sections.map(s => s.segments.map(seg => seg.text).join(' ')).join(' ');
          playGeminiAudio(fullText, 'full');
      }
  };

  const handlePlaySection = (sectionId: string, text: string) => {
      if (playingId === sectionId) {
          stopAudio();
      } else {
          playGeminiAudio(text, sectionId);
      }
  };

  // --- INTERACTION LOGIC ---

  const handleTouchStart = (text: string) => {
    if (reorderMode || dictionaryMode) return; // Disable audio long press in special modes
    longPressTimerRef.current = setTimeout(() => {
        playBrowserAudio(text, 'standard');
        if (navigator.vibrate) navigator.vibrate(50);
    }, 600); // 600ms long press
  };

  const handleTouchEnd = () => {
    if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
    }
  };

  const handleWordClick = async (e: React.MouseEvent, word: string, fullSegment: string) => {
      if (dictionaryMode) {
          e.stopPropagation(); // Prevent bubbling to segment toggle
          
          setIsLoadingDefinition(true);
          setActiveDefinition({ word, ipa: '', definition: '查询中...', partOfSpeech: '' });
          
          playBrowserAudio(word, 'soft-female');

          const result = await lookupWordDefinition(word, fullSegment);
          setActiveDefinition(result);
          setIsLoadingDefinition(false);
      }
  };

  const handleSegmentClick = (sectionIdx: number, segmentIdx: number) => {
    if (reorderMode || dictionaryMode) return;

    setSections(prev => prev.map((section, sIdx) => {
        if (sIdx !== sectionIdx) return section;
        return {
            ...section,
            segments: section.segments.map((seg, pIdx) => 
                pIdx === segmentIdx ? { ...seg, isHidden: !seg.isHidden } : seg
            )
        };
    }));
  };

  // --- DRAG AND DROP LOGIC (Advanced Split-Insertion) ---

  const handleDragStart = (e: React.DragEvent, sIdx: number, pIdx: number) => {
      setDraggedItem({ sIdx, pIdx });
      // Important: Allow dragging
      e.dataTransfer.effectAllowed = "move";
  };

  const handleSegmentDragOver = (e: React.DragEvent) => {
      // Prevent default to allow drop, but word handler usually takes precedence
      e.preventDefault();
      e.dataTransfer.dropEffect = "move";
  };

  const handleWordDragOver = (e: React.DragEvent, sIdx: number, pIdx: number, partIdx: number) => {
      e.preventDefault();
      e.stopPropagation(); // Stop segment from handling it
      
      if (!draggedItem) return;
      // Prevent dropping on self
      if (draggedItem.sIdx === sIdx && draggedItem.pIdx === pIdx) {
          setDropTarget(null);
          return;
      }

      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      const mid = rect.left + rect.width / 2;
      const position = e.clientX < mid ? 'left' : 'right';
      
      setDropTarget({ sIdx, pIdx, partIdx, position });
  };

  const handleWordDrop = (e: React.DragEvent, targetSIdx: number, targetPIdx: number, partIdx: number) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (!draggedItem || !dropTarget) return;

      const { sIdx: srcSIdx, pIdx: srcPIdx } = draggedItem;
      const { position } = dropTarget;

      // Reset DnD state
      setDropTarget(null);
      setDraggedItem(null);

      // Restriction: Only allow reordering within same section for this iteration
      if (srcSIdx !== targetSIdx) return;
      // Don't drop on self
      if (srcSIdx === targetSIdx && srcPIdx === targetPIdx) return;

      setSections(prev => {
          const newSections = [...prev];
          const section = { ...newSections[targetSIdx] };
          const segmentsWithoutMoved = [...section.segments];
          
          // 1. Extract the moved segment
          const movedSegment = segmentsWithoutMoved[srcPIdx];
          
          // 2. Remove moved segment from the list
          segmentsWithoutMoved.splice(srcPIdx, 1);

          // 3. Find the *adjusted* target index
          // If source was before target, target index shifts down by 1
          let adjustedTargetIdx = targetPIdx;
          if (srcPIdx < targetPIdx) {
              adjustedTargetIdx -= 1;
          }

          const targetSegment = segmentsWithoutMoved[adjustedTargetIdx];
          
          // 4. Split logic
          const parts = targetSegment.text.split(/(\s+)/);
          // Determine split index in the parts array
          // If position left, split at partIdx. If right, split at partIdx + 1
          const splitIdx = position === 'left' ? partIdx : partIdx + 1;
          
          const leftText = parts.slice(0, splitIdx).join('');
          const rightText = parts.slice(splitIdx).join('');
          
          const newSegmentList: Segment[] = [];

          // Rebuild list
          segmentsWithoutMoved.forEach((seg, idx) => {
              if (idx === adjustedTargetIdx) {
                  // Insert [LeftPart, MovedSegment, RightPart]
                  if (leftText) {
                      newSegmentList.push({
                          ...targetSegment,
                          id: `${targetSegment.id}_L_${Date.now()}`,
                          text: leftText,
                      });
                  }
                  
                  newSegmentList.push(movedSegment);
                  
                  if (rightText) {
                      newSegmentList.push({
                          ...targetSegment,
                          id: `${targetSegment.id}_R_${Date.now()}`,
                          text: rightText,
                      });
                  }
              } else {
                  newSegmentList.push(seg);
              }
          });
          
          section.segments = newSegmentList;
          newSections[targetSIdx] = section;
          return newSections;
      });
  };

  const toggleSectionVisibility = (sectionId: string) => {
    setSections(prev => {
        const section = prev.find(s => s.id === sectionId);
        if (!section) return prev;
        const hasVisible = section.segments.some(s => !s.isHidden);
        return prev.map(s => {
            if (s.id !== sectionId) return s;
            return {
                ...s,
                segments: s.segments.map(seg => ({ ...seg, isHidden: hasVisible }))
            };
        });
    });
  };

  const toggleSectionTranslation = (sectionId: string) => {
      setShowTranslations(prev => ({ ...prev, [sectionId]: !prev[sectionId] }));
  };

  const toggleAll = () => {
    const newState = !allHidden;
    setAllHidden(newState);
    setNonCoreHidden(false); 
    setSections(prev => prev.map(section => ({
      ...section,
      segments: section.segments.map(seg => ({ ...seg, isHidden: newState }))
    })));
  };

  const toggleNonCore = () => {
    const newState = !nonCoreHidden;
    setNonCoreHidden(newState);
    setAllHidden(false);
    const coreRoles = ['SUBJECT', 'VERB', 'OBJECT'];
    setSections(prev => prev.map(section => ({
      ...section,
      segments: section.segments.map(seg => {
        const isCore = coreRoles.includes(seg.role);
        return { ...seg, isHidden: isCore ? false : newState };
      })
    })));
  };

  // --- RENDER HELPERS ---

  const getFirstLetterHint = (text: string) => {
      if (!text) return "";
      const words = text.split(' ');
      return words.map(word => {
          if (word.length <= 1) return word;
          return `${word.charAt(0)}${'.'.repeat(word.length - 1)}`;
      }).join(' ');
  };

  const getSegmentClasses = (role: SegmentRole, isHidden: boolean, isDragging: boolean) => {
    const base = "relative cursor-pointer select-none transition-all duration-300 ease-out px-3 py-1.5 rounded-xl text-lg md:text-xl leading-relaxed mb-3 mx-1 inline-block align-middle border-b-4 active:scale-95 touch-manipulation";
    
    if (isDragging) {
        return `${base} opacity-40 scale-95 border-dashed border-slate-400 bg-slate-200`;
    }

    if (isHidden) {
       return hintMode 
         ? `${base} bg-slate-100 border-slate-200 text-slate-400 font-mono tracking-widest min-w-[3rem] text-center text-sm`
         : `${base} bg-slate-100 border-slate-200 text-slate-200 min-w-[3rem] text-center border-b-transparent`;
    }

    switch (role) {
      case 'SUBJECT': case 'VERB': case 'OBJECT':
        return `${base} bg-slate-800 text-white border-slate-900 font-bold shadow-md hover:bg-slate-700`;
      case 'PREP_PHRASE':
        return `${base} bg-amber-100 text-amber-900 border-amber-200 font-medium hover:bg-amber-200`;
      case 'CLAUSE':
        return `${base} bg-indigo-100 text-indigo-900 border-indigo-200 font-medium hover:bg-indigo-200`;
      case 'NON_FINITE':
        return `${base} bg-fuchsia-100 text-fuchsia-900 border-fuchsia-200 font-medium hover:bg-fuchsia-200`;
      case 'PARENTHETICAL':
        return `${base} bg-teal-100 text-teal-900 border-teal-200 italic hover:bg-teal-200`;
      default:
        return `${base} bg-white text-slate-700 border-slate-200 hover:bg-slate-50`;
    }
  };

  const renderSegmentContent = (text: string, sIdx: number, pIdx: number) => {
     // Split by whitespace but capture it so we can reconstruct or index correctly
     return text.split(/(\s+)/).map((part, partIdx) => {
         if (part.match(/^\s+$/)) return <span key={partIdx}>{part}</span>;
         
         // Interaction Handlers for Word
         const isDropTarget = dropTarget && dropTarget.sIdx === sIdx && dropTarget.pIdx === pIdx && dropTarget.partIdx === partIdx;
         const dropStyle = isDropTarget 
            ? (dropTarget.position === 'left' ? 'border-l-4 border-l-rose-500 pl-1' : 'border-r-4 border-r-rose-500 pr-1')
            : '';

         return (
             <span 
                key={partIdx} 
                className={`
                    ${dictionaryMode ? "hover:text-yellow-300 hover:underline cursor-help" : ""}
                    ${dropStyle} transition-all
                `}
                onClick={(e) => handleWordClick(e, part, text)}
                // Drag Events for Split Insertion
                onDragOver={(e) => reorderMode && handleWordDragOver(e, sIdx, pIdx, partIdx)}
                onDrop={(e) => reorderMode && handleWordDrop(e, sIdx, pIdx, partIdx)}
             >
                 {part}
             </span>
         );
     });
  };

  return (
    <div className="flex flex-col h-full w-full relative">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center justify-between px-2">
            <button onClick={onBack} className="flex items-center gap-1 text-slate-400 hover:text-slate-800 font-bold transition-colors">
            <ArrowLeft size={18} />
            <span>调整原文</span>
            </button>
        </div>
        
        {/* Legend */}
        <div className="flex flex-wrap gap-2 px-2">
           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-800 text-white rounded-lg text-[10px] shadow-sm font-bold">
             <span>主干(SVO)</span>
           </div>
           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-indigo-100 text-indigo-900 border border-indigo-200 rounded-lg text-[10px] font-bold">
             <span>从句</span>
           </div>
           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-fuchsia-100 text-fuchsia-900 border border-fuchsia-200 rounded-lg text-[10px] font-bold">
             <span>非谓语</span>
           </div>
           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold">
             <span>介词短语</span>
           </div>
           <div className="flex items-center gap-1.5 px-2.5 py-1 bg-teal-100 text-teal-900 border border-teal-200 rounded-lg text-[10px] font-bold">
             <span>插入语</span>
           </div>
        </div>
      </div>

      {/* Content Area */}
      <div 
        className={`flex-1 overflow-y-auto pb-44 pr-2 space-y-8 no-scrollbar ${dictionaryMode ? 'cursor-help' : ''}`}
        // Clear drag state if clicking away or leaving area
        onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = "none"; }}
      >
        {sections.map((section, sIdx) => {
            const sectionText = section.segments.map(s => s.text).join(' ');
            const allSegmentsHidden = section.segments.every(s => s.isHidden);
            const isPlayingThis = playingId === section.id;
            const isTranslationVisible = showTranslations[section.id];

            return (
              <div key={section.id} className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300 border border-slate-50 overflow-hidden group">
                
                {/* Section Header */}
                <div className="px-6 py-4 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <span className="bg-rose-100 text-rose-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {section.title}
                        </span>
                    </div>

                    <div className="flex items-center gap-1">
                         <button 
                            onClick={() => toggleSectionTranslation(section.id)}
                            className={`p-2 rounded-full transition-all ${
                                isTranslationVisible 
                                ? 'bg-indigo-100 text-indigo-600' 
                                : 'text-slate-400 hover:text-slate-700 hover:bg-white'
                            }`}
                         >
                            <Languages size={18} />
                         </button>
                         <div className="w-px h-4 bg-slate-200 mx-1"></div>
                         <button 
                            onClick={() => handlePlaySection(section.id, sectionText)}
                            className={`p-2 rounded-full transition-all ${
                                isPlayingThis 
                                ? 'bg-rose-500 text-white shadow-lg shadow-rose-200' 
                                : 'text-slate-400 hover:text-slate-700 hover:bg-white'
                            }`}
                         >
                            {isPlayingThis ? <Loader2 size={18} className="animate-spin" /> : <Volume2 size={18} />}
                         </button>
                         <button 
                            onClick={() => toggleSectionVisibility(section.id)}
                            disabled={reorderMode}
                            className={`p-2 rounded-full transition-all ${
                                allSegmentsHidden 
                                ? 'bg-slate-200 text-slate-500' 
                                : 'text-slate-400 hover:text-slate-700 hover:bg-white'
                            } ${reorderMode ? 'opacity-30 cursor-not-allowed' : ''}`}
                         >
                            {allSegmentsHidden ? <EyeOff size={18} /> : <Eye size={18} />}
                         </button>
                    </div>
                </div>

                {/* Translation Panel */}
                {isTranslationVisible && (
                    <div className="px-8 py-4 bg-indigo-50/50 text-indigo-800 text-sm font-medium leading-relaxed border-b border-indigo-50 animate-in slide-in-from-top-2">
                        <span className="font-bold mr-2">译文:</span>
                        {section.translation}
                    </div>
                )}
                
                {/* Segments Area */}
                <div className="p-6 md:p-8 leading-[3.5rem]">
                    {section.segments.map((segment, pIdx) => {
                        const isDragging = draggedItem?.sIdx === sIdx && draggedItem?.pIdx === pIdx;
                        
                        return (
                            <span
                                key={segment.id}
                                draggable={reorderMode}
                                onDragStart={(e) => handleDragStart(e, sIdx, pIdx)}
                                onDragOver={handleSegmentDragOver}
                                // Default drop on segment (optional fallback)
                                onClick={() => handleSegmentClick(sIdx, pIdx)}
                                onMouseDown={() => handleTouchStart(segment.text)}
                                onMouseUp={handleTouchEnd}
                                onMouseLeave={handleTouchEnd}
                                onTouchStart={() => handleTouchStart(segment.text)}
                                onTouchEnd={handleTouchEnd}
                                onContextMenu={(e) => e.preventDefault()}
                                className={getSegmentClasses(segment.role, segment.isHidden, isDragging)}
                            >
                                {segment.isHidden 
                                ? (hintMode ? getFirstLetterHint(segment.text) : ".....") 
                                : renderSegmentContent(segment.text, sIdx, pIdx)}
                            </span>
                        );
                    })}
                </div>
              </div>
            );
        })}
      </div>

      {/* Definition Popover */}
      {activeDefinition && dictionaryMode && (
          <div className="fixed bottom-36 left-4 right-4 z-40 animate-in slide-in-from-bottom-5 fade-in duration-200">
              <div className="bg-slate-900/95 backdrop-blur-xl text-white p-6 rounded-3xl shadow-2xl border border-white/10 relative max-w-2xl mx-auto">
                  <button 
                    onClick={() => setActiveDefinition(null)}
                    className="absolute top-4 right-4 text-slate-400 hover:text-white"
                  >
                      <X size={20} />
                  </button>
                  <div className="pr-8">
                      {isLoadingDefinition && activeDefinition.definition === '查询中...' ? (
                           <div className="flex items-center gap-2 text-rose-300">
                               <Loader2 className="animate-spin" size={16} />
                               <span>正在查询 Gemini...</span>
                           </div>
                      ) : (
                          <>
                            <div className="flex items-baseline gap-2 mb-1">
                                <div className="text-sm font-bold text-amber-400 uppercase tracking-wider">{activeDefinition.partOfSpeech}</div>
                                <div className="text-xs text-slate-400 font-mono">/{activeDefinition.ipa}/</div>
                            </div>
                            <h3 className="text-2xl font-bold mb-2 text-white">{activeDefinition.word}</h3>
                            <p className="text-lg text-slate-200 font-medium">{activeDefinition.definition}</p>
                            <div className="mt-3 flex items-center gap-2 text-xs text-slate-400">
                                <Volume2 size={12} />
                                <span>柔美发音</span>
                            </div>
                          </>
                      )}
                  </div>
              </div>
          </div>
      )}

      {/* Footer Controls */}
      <div className="fixed bottom-8 left-0 right-0 z-20 px-4 pointer-events-none">
         <div className="max-w-3xl mx-auto bg-slate-900/90 backdrop-blur-xl text-white p-2.5 pl-5 rounded-full shadow-2xl flex items-center justify-between pointer-events-auto ring-1 ring-white/10 overflow-x-auto no-scrollbar">
            
            <div className="flex items-center gap-2 md:gap-4 flex-shrink-0">
              <button 
                onClick={toggleAll}
                disabled={reorderMode || dictionaryMode}
                className={`flex flex-col items-center justify-center w-12 h-12 min-w-[3rem] md:w-14 md:h-14 rounded-full transition-colors ${(reorderMode || dictionaryMode) ? 'opacity-30' : 'hover:bg-white/10'}`}
              >
                <Layers size={20} />
                <span className="text-[10px] mt-0.5 font-medium">{allHidden ? "显" : "隐"}</span>
              </button>

              <button 
                onClick={toggleNonCore}
                disabled={reorderMode || dictionaryMode}
                className={`flex flex-col items-center justify-center w-12 h-12 min-w-[3rem] md:w-14 md:h-14 rounded-full transition-colors ${nonCoreHidden ? 'text-amber-300 bg-white/10' : 'hover:bg-white/10'} ${(reorderMode || dictionaryMode) ? 'opacity-30' : ''}`}
              >
                <Bone size={20} className={nonCoreHidden ? "fill-current" : ""} />
                <span className="text-[10px] mt-0.5 font-medium">{nonCoreHidden ? "主干" : "隐修饰"}</span>
              </button>

              <button 
                onClick={() => setHintMode(!hintMode)}
                disabled={reorderMode || dictionaryMode || (!allHidden && !nonCoreHidden && !sections.some(s => s.segments.some(seg => seg.isHidden)))}
                className={`flex flex-col items-center justify-center w-12 h-12 min-w-[3rem] md:w-14 md:h-14 rounded-full transition-colors ${hintMode ? 'text-yellow-300 bg-white/10' : 'hover:bg-white/10'} ${(reorderMode || dictionaryMode) ? 'opacity-30' : ''}`}
              >
                <Lightbulb size={20} className={hintMode ? "fill-current" : ""} />
                <span className="text-[10px] mt-0.5 font-medium">首字母</span>
              </button>

              <div className="w-px h-8 bg-white/10 mx-1"></div>

               <button 
                onClick={() => {
                    setDictionaryMode(!dictionaryMode);
                    setReorderMode(false);
                    setActiveDefinition(null);
                    setDraggedItem(null);
                    setDropTarget(null);
                }}
                className={`flex flex-col items-center justify-center w-12 h-12 min-w-[3rem] md:w-14 md:h-14 rounded-full transition-colors ${dictionaryMode ? 'text-emerald-400 bg-white/10 ring-1 ring-emerald-400/50' : 'hover:bg-white/10'}`}
              >
                <BookOpenText size={20} />
                <span className="text-[10px] mt-0.5 font-medium">{dictionaryMode ? "查词中" : "查词"}</span>
              </button>

               <button 
                onClick={() => {
                    setReorderMode(!reorderMode);
                    setDictionaryMode(false);
                    setDraggedItem(null);
                    setDropTarget(null);
                    if (!reorderMode) {
                        setAllHidden(false);
                        setNonCoreHidden(false);
                        setSections(prev => prev.map(s => ({...s, segments: s.segments.map(seg => ({...seg, isHidden: false}))})));
                    }
                }}
                className={`flex flex-col items-center justify-center w-12 h-12 min-w-[3rem] md:w-14 md:h-14 rounded-full transition-colors ${reorderMode ? 'text-cyan-400 bg-white/10 ring-1 ring-cyan-400/50' : 'hover:bg-white/10'}`}
              >
                <ArrowRightLeft size={20} />
                <span className="text-[10px] mt-0.5 font-medium">{reorderMode ? "调整" : "调整"}</span>
              </button>
            </div>

            <div className="flex items-center gap-2 pl-2 flex-shrink-0">
                <button 
                    onClick={handlePlayFull}
                    className={`flex flex-col items-center justify-center w-10 h-10 min-w-[2.5rem] rounded-full transition-colors ${playingId === 'full' ? 'text-rose-400' : 'text-slate-400 hover:text-white'}`}
                >
                    {playingId === 'full' ? <Loader2 size={20} className="animate-spin" /> : <Headphones size={20} />}
                </button>

                <button 
                onClick={onFinish}
                className="flex items-center gap-1 pl-4 pr-4 py-3 md:py-4 bg-rose-500 hover:bg-rose-600 text-white rounded-full font-bold shadow-lg shadow-rose-900/20 transition-transform active:scale-95 ml-1 whitespace-nowrap"
                >
                <span>背诵</span>
                <ChevronRight size={18} />
                </button>
            </div>
         </div>
      </div>
      
      {reorderMode && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-cyan-950 text-cyan-200 px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in slide-in-from-bottom-2 border border-cyan-800 pointer-events-none z-30 flex items-center gap-2 whitespace-nowrap">
              <MoveRight size={14} />
              拖拽语块到任意单词前后即可插入
          </div>
      )}
      {dictionaryMode && (
          <div className="fixed bottom-28 left-1/2 -translate-x-1/2 bg-emerald-950 text-emerald-200 px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in slide-in-from-bottom-2 border border-emerald-800 pointer-events-none z-30">
              点击任意单词查看 AI 解析
          </div>
      )}
    </div>
  );
};
