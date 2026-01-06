
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { ReciteResult, StudySection, SegmentRole } from "../types";

const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found");
  return new GoogleGenAI({ apiKey });
};

// Helper to clean Markdown code fences and find JSON substring
const cleanJsonOutput = (text: string) => {
  let cleaned = text.trim();
  
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '');
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```/, '').replace(/```$/, '');
  }

  const firstOpen = cleaned.search(/[\{\[]/);
  const lastClose = cleaned.search(/[\]\}][^\]\}]*$/);

  if (firstOpen !== -1 && lastClose !== -1 && lastClose >= firstOpen) {
    cleaned = cleaned.substring(firstOpen, lastClose + 1);
  }

  return cleaned.trim();
};

export const extractTextFromImage = async (base64Image: string, mimeType: string): Promise<string> => {
  const ai = getAiClient();
  const prompt = "Transcribe the text from this image exactly as it appears. Output ONLY the text content. Do not add any introductory phrases or markdown formatting.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          { inlineData: { mimeType, data: base64Image } },
          { text: prompt }
        ]
      }
    });
    return response.text || "";
  } catch (error) {
    console.error("OCR Failed:", error);
    throw new Error("Failed to extract text from image");
  }
};

// --- Task 1: Smart Segmentation & Grouping ---

interface RawSection {
  title: string;
  translation: string;
  phrases: Array<{
    text: string;
    translation: string;
    role: SegmentRole;
  }>;
}

export const segmentTextWithGemini = async (text: string): Promise<StudySection[]> => {
  const ai = getAiClient();
  
  const prompt = `
    Analyze the following English text for a student trying to memorize it using syntactic chunking.
    
    Step 1: Break the text into logical narrative sections (e.g., Introduction, The Event, Conclusion). 
    Step 2: Give each section a very short 1-3 word title AND a Chinese translation of the whole section.
    Step 3: Inside each section, split the text into meaningful semantic chunks/phrases.
    Step 4: For each chunk, provide its specific grammatical role and its Chinese translation (meaning).
    
    Roles:
    "SUBJECT", "VERB", "OBJECT", "PREP_PHRASE", "CLAUSE", "NON_FINITE", "PARENTHETICAL", "OTHER"

    Ensure every word and punctuation mark from the original text is preserved in the chunks.
    
    Return pure JSON.
    
    Text: "${text}"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { 
            type: Type.OBJECT,
            properties: {
                title: { type: Type.STRING },
                translation: { type: Type.STRING, description: "Chinese translation of the section" },
                phrases: { 
                    type: Type.ARRAY,
                    items: { 
                        type: Type.OBJECT,
                        properties: {
                            text: { type: Type.STRING },
                            translation: { type: Type.STRING, description: "Chinese translation of the phrase" },
                            role: { 
                                type: Type.STRING, 
                                enum: [
                                    'SUBJECT', 'VERB', 'OBJECT', 
                                    'PREP_PHRASE', 'CLAUSE', 'NON_FINITE', 
                                    'PARENTHETICAL', 'OTHER'
                                ] 
                            }
                        },
                        required: ['text', 'role', 'translation']
                    }
                }
            },
            required: ['title', 'phrases', 'translation']
          }
        }
      }
    });

    const cleanText = cleanJsonOutput(response.text || "[]");
    const rawSections = JSON.parse(cleanText) as RawSection[];
    
    const themes: Array<'blue' | 'emerald' | 'violet' | 'amber'> = ['blue', 'emerald', 'violet', 'amber'];
    
    return rawSections.map((section, index) => ({
      id: `section-${index}`,
      title: section.title,
      translation: section.translation || "",
      theme: themes[index % themes.length],
      segments: section.phrases.map((phrase, pIdx) => ({
        id: `s${index}-p${pIdx}`,
        text: phrase.text,
        translation: phrase.translation || "",
        isHidden: false,
        role: phrase.role || 'OTHER'
      }))
    }));

  } catch (error) {
    console.error("Segmentation error:", error);
    return [{
        id: 'fallback',
        title: 'Full Text',
        translation: '全文',
        theme: 'blue',
        segments: (text.match(/[^.!?]+[.!?]+/g) || [text]).map((t, i) => ({
            id: `fallback-${i}`,
            text: t,
            translation: '',
            isHidden: false,
            role: 'OTHER'
        }))
    }];
  }
};

// --- New Feature: Word Definition Lookup ---

export interface WordDefinition {
  word: string;
  ipa: string;
  definition: string;
  partOfSpeech: string;
}

export const lookupWordDefinition = async (word: string, contextSentence: string): Promise<WordDefinition> => {
    const ai = getAiClient();
    
    const prompt = `
      Provide the definition of the word "${word}" as it is used in this context: "${contextSentence}".
      Include the IPA pronunciation, the part of speech, and a concise Chinese definition.
    `;
    
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        word: { type: Type.STRING },
                        ipa: { type: Type.STRING },
                        definition: { type: Type.STRING, description: "Chinese definition" },
                        partOfSpeech: { type: Type.STRING }
                    },
                    required: ['word', 'ipa', 'definition', 'partOfSpeech']
                }
            }
        });

        const cleanText = cleanJsonOutput(response.text || "{}");
        return JSON.parse(cleanText) as WordDefinition;
    } catch (error) {
        console.error("Lookup error:", error);
        return {
            word: word,
            ipa: "",
            definition: "查询失败",
            partOfSpeech: ""
        };
    }
};

// --- Task 2: Audio Grading ---

export const gradeRecitationWithGemini = async (
  originalText: string,
  audioBase64: string,
  mimeType: string
): Promise<ReciteResult> => {
  const ai = getAiClient();

  const prompt = `
    You are a strict English teacher checking a student's recitation.
    Reference Text: "${originalText}"
    Identify missed words, extra words, or wrong pronunciations.
    Return pure JSON.
  `;

  try {
     const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
            { inlineData: { mimeType: mimeType, data: audioBase64 } },
            { text: prompt }
        ]
      },
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            feedback: { type: Type.STRING },
            detailedAnalysis: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  word: { type: Type.STRING },
                  status: { type: Type.STRING, enum: ['correct', 'missed', 'wrong', 'extra'] },
                  correctedWord: { type: Type.STRING }
                },
                required: ['word', 'status']
              }
            }
          },
          required: ['score', 'feedback', 'detailedAnalysis']
        }
      }
    });

    const cleanText = cleanJsonOutput(response.text || "{}");
    return JSON.parse(cleanText) as ReciteResult;

  } catch (error) {
    console.error("Grading error:", error);
    return {
      score: 0,
      feedback: "Failed to analyze audio. Please try again.",
      detailedAnalysis: []
    };
  }
};

// --- Task 3: Text to Speech (TTS) ---

export const convertTextToSpeech = async (text: string): Promise<Uint8Array> => {
    const ai = getAiClient();
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: {
            parts: [{ text: text }]
        },
        config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
                voiceConfig: {
                    prebuiltVoiceConfig: { voiceName: 'Kore' },
                },
            },
        },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("No audio data generated");

    const binaryString = atob(base64Audio);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};
