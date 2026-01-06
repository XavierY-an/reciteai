import { apiClient } from './apiClient';
import { StudySection } from '../types';

export interface Article {
  _id: string;
  userId: string;
  title: string;
  content: string;
  originalImage: string | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  wordCount: number;
  sections: StudySection[];
  createdAt: string;
  updatedAt: string;
}

export const articleService = {
  // 创建文章（会自动进行 AI 分析和拆分）
  async createArticle(content: string, title?: string): Promise<Article> {
    const response = await apiClient.post('/api/articles', {
      content,
      title,
    });
    return response.article;
  },

  // 获取用户的所有文章
  async getArticles(): Promise<Article[]> {
    const response = await apiClient.get('/api/articles');
    return response.articles;
  },

  // 获取单个文章详情
  async getArticleById(id: string): Promise<Article> {
    const response = await apiClient.get(`/api/articles/${id}`);
    return response.article;
  },

  // 删除文章
  async deleteArticle(id: string): Promise<void> {
    await apiClient.delete(`/api/articles/${id}`);
  },

  // OCR 图片识别
  async ocrImage(base64Image: string, mimeType: string): Promise<string> {
    const response = await apiClient.post('/api/articles/ocr', {
      image: base64Image,
      mimeType,
    });
    return response.text;
  },
};
