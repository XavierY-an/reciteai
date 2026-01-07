const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// 获取token
const getToken = () => {
  return localStorage.getItem('token');
};

// 查询单词定义（通过后端使用智谱AI）
export const lookupWordDefinition = async (word: string, contextSentence: string) => {
  try {
    const token = getToken();

    const response = await fetch(`${API_URL}/api/study/lookup-word`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ word, context: contextSentence }),
    });

    if (!response.ok) {
      throw new Error('查询单词失败');
    }

    const data = await response.json();
    return data.definition;
  } catch (error) {
    console.error('单词查询错误:', error);
    throw error;
  }
};

// 导出类型
export interface WordDefinition {
  word: string;
  ipa: string;
  partOfSpeech: string;
  definition: string;
}
