import { apiClient } from './apiClient';
import { ReciteResult } from '../types';

export interface StudyRecord {
  _id: string;
  userId: string;
  articleId: string;
  currentSection: number;
  completedSections: number[];
  progress: number;
  reciteHistory: Array<{
    score: number;
    feedback: string;
    detailedAnalysis: any[];
    timestamp: string;
  }>;
  lastStudiedAt: string;
  createdAt: string;
  updatedAt: string;
}

export const studyService = {
  // 获取或创建学习记录
  async getStudyRecord(articleId: string): Promise<StudyRecord> {
    const response = await apiClient.get(`/api/study/${articleId}`);
    return response.record;
  },

  // 更新学习进度
  async updateProgress(
    articleId: string,
    currentSection: number,
    completedSections: number[]
  ): Promise<StudyRecord> {
    const response = await apiClient.put(`/api/study/${articleId}/progress`, {
      currentSection,
      completedSections,
    });
    return response.record;
  },

  // 提交背诵结果
  async submitRecitation(
    articleId: string,
    recitedText: string
  ): Promise<{ evaluation: ReciteResult; record: StudyRecord }> {
    const response = await apiClient.post(`/api/study/${articleId}/recite`, {
      recitedText,
    });
    return response;
  },

  // 获取学习历史
  async getStudyHistory(): Promise<StudyRecord[]> {
    const response = await apiClient.get('/api/study/history');
    return response.records;
  },
};
