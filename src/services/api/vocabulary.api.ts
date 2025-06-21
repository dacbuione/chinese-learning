import { apiClient } from './client';
import type { ApiResponse } from './client';

export interface VocabularyItemAPI {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  tone: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  category: string;
  audioUrl?: string;
  strokeOrder?: string[];
  lessonId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VocabularyListResponse {
  data: VocabularyItemAPI[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class VocabularyAPI {
  /**
   * Lấy danh sách từ vựng theo lesson ID từ API hiện tại
   */
  async getVocabularyByLesson(lessonId: string): Promise<VocabularyItemAPI[]> {
    try {
      // Sử dụng method đã có trong apiClient
      const response = await apiClient.getVocabulary(lessonId);
      
      if (!response.success || !response.data) {
        throw new Error('Không thể tải dữ liệu từ vựng');
      }

      // Convert từ định dạng API hiện tại sang định dạng mới
      const convertedData: VocabularyItemAPI[] = response.data.map((item: any) => ({
        id: item.id,
        hanzi: item.hanzi,
        pinyin: item.pinyin,
        english: item.englishTranslation || item.english || '',
        vietnamese: item.vietnameseTranslation || item.vietnamese || '',
        tone: item.tone,
        difficulty: this.mapDifficulty(item.difficulty),
        category: item.lessonId ? 'lesson' : 'general',
        audioUrl: item.audioUrl,
        strokeOrder: [],
        lessonId: item.lessonId || lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return convertedData;
    } catch (error) {
      console.error('Error fetching vocabulary by lesson:', error);
      
      // Fallback to mock data if API fails
      return this.getMockVocabulary(lessonId);
    }
  }

  /**
   * Lấy chi tiết một từ vựng
   */
  async getVocabularyById(id: string): Promise<VocabularyItemAPI> {
    try {
      const response = await apiClient.getVocabularyById(id);
      
      if (!response.success || !response.data) {
        throw new Error('Không thể tải chi tiết từ vựng');
      }

      const item = response.data;
      return {
        id: item.id,
        hanzi: item.hanzi,
        pinyin: item.pinyin,
        english: item.englishTranslation || '',
        vietnamese: item.vietnameseTranslation || '',
        tone: item.tone,
        difficulty: this.mapDifficulty(item.difficulty),
        category: item.lessonId ? 'lesson' : 'general',
        audioUrl: item.audioUrl,
        strokeOrder: [],
        lessonId: item.lessonId || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error fetching vocabulary:', error);
      throw new Error('Không thể tải chi tiết từ vựng');
    }
  }

  /**
   * Map difficulty từ HSK level sang format mới
   */
  private mapDifficulty(hskLevel: string): 'beginner' | 'intermediate' | 'advanced' {
    switch (hskLevel) {
      case 'hsk1':
      case 'hsk2':
        return 'beginner';
      case 'hsk3':
      case 'hsk4':
        return 'intermediate';
      case 'hsk5':
      case 'hsk6':
        return 'advanced';
      default:
        return 'beginner';
    }
  }

  /**
   * Mock data fallback
   */
  private getMockVocabulary(lessonId: string): VocabularyItemAPI[] {
    return [
      {
        id: '1',
        hanzi: '你好',
        pinyin: 'nǐ hǎo',
        english: 'Hello',
        vietnamese: 'Xin chào',
        tone: 3,
        difficulty: 'beginner',
        category: 'greetings',
        lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '2',
        hanzi: '谢谢',
        pinyin: 'xiè xiè',
        english: 'Thank you',
        vietnamese: 'Cảm ơn',
        tone: 4,
        difficulty: 'beginner',
        category: 'greetings',
        lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '3',
        hanzi: '再见',
        pinyin: 'zài jiàn',
        english: 'Goodbye',
        vietnamese: 'Tạm biệt',
        tone: 4,
        difficulty: 'beginner',
        category: 'greetings',
        lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '4',
        hanzi: '对不起',
        pinyin: 'duì bu qǐ',
        english: 'Sorry',
        vietnamese: 'Xin lỗi',
        tone: 4,
        difficulty: 'beginner',
        category: 'greetings',
        lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '5',
        hanzi: '请',
        pinyin: 'qǐng',
        english: 'Please',
        vietnamese: 'Xin mời/Làm ơn',
        tone: 3,
        difficulty: 'beginner',
        category: 'greetings',
        lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: '6',
        hanzi: '是',
        pinyin: 'shì',
        english: 'Yes/To be',
        vietnamese: 'Có/Là',
        tone: 4,
        difficulty: 'beginner',
        category: 'basic',
        lessonId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];
  }


}

export const vocabularyAPI = new VocabularyAPI(); 