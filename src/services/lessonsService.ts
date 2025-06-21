import { ApiResponse } from './api/client';

export interface Lesson {
  id: string;
  title: string;
  titleEn: string;
  titleVi: string;
  description: string;
  descriptionEn: string;
  descriptionVi: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  type: 'vocabulary' | 'conversation' | 'grammar' | 'pronunciation' | 'writing';
  order: number;
  duration: number;
  xpReward: number;
  thumbnailUrl?: string;
  audioUrl?: string;
  isActive: boolean;
  isPremium: boolean;
  objectives: string[];
  tags: string[];
  content?: any;
  createdAt: string;
  updatedAt: string;
}

class LessonsService {
  private baseURL: string;

  constructor() {
    this.baseURL = 'http://localhost:3000/api/v1';
  }

  /**
   * Lấy danh sách tất cả lessons
   */
  async getAllLessons(): Promise<Lesson[]> {
    try {
      const response = await fetch(`${this.baseURL}/lessons`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching lessons:', error);
      throw error;
    }
  }

  /**
   * Lấy lessons theo độ khó
   */
  async getLessonsByDifficulty(difficulty: string): Promise<Lesson[]> {
    try {
      const response = await fetch(`${this.baseURL}/lessons?difficulty=${difficulty}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching lessons by difficulty:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết lesson theo ID
   */
  async getLessonById(id: string): Promise<Lesson> {
    try {
      const response = await fetch(`${this.baseURL}/lessons/${id}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching lesson by id:', error);
      throw error;
    }
  }

  /**
   * Seed lessons data (for development)
   */
  async seedLessons(): Promise<{ message: string }> {
    try {
      const response = await fetch(`${this.baseURL}/lessons/seed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error seeding lessons:', error);
      throw error;
    }
  }
}

export const lessonsService = new LessonsService(); 