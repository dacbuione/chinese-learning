import { Platform } from 'react-native';

// API Configuration
const API_CONFIG = {
  // Use localhost for iOS Simulator, 10.0.2.2 for Android Emulator
  BASE_URL: Platform.select({
    ios: 'http://localhost:3000/api/v1',
    android: 'http://10.0.2.2:3000/api/v1',
    web: 'http://localhost:3000/api/v1',
    default: 'http://localhost:3000/api/v1',
  }),
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    fullName: string;
    level: string;
    preferredLanguage: string;
    totalXp: number;
    currentStreak: number;
  };
  accessToken: string;
}

export interface Lesson {
  id: string;
  title: string;
  titleEn: string;
  titleVi: string;
  description: string;
  descriptionEn: string;
  descriptionVi: string;
  difficulty: 'beginner' | 'elementary' | 'intermediate' | 'advanced';
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'writing' | 'conversation';
  order: number;
  duration: number;
  xpReward: number;
  thumbnailUrl?: string;
  audioUrl?: string;
  isActive: boolean;
  isPremium: boolean;
  objectives: string[];
  tags: string[];
  content?: {
    introduction?: string;
    mainContent?: any[];
    exercises?: any[];
    summary?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LessonFilters {
  difficulty?: string;
  type?: string;
  search?: string;
}

export interface LessonsStats {
  total: number;
  byType: {
    vocabulary: number;
    grammar: number;
    pronunciation: number;
    writing: number;
    conversation: number;
  };
  byDifficulty: {
    beginner: number;
    elementary: number;
    intermediate: number;
    advanced: number;
  };
  averageDuration: number;
  totalXP: number;
}

export interface Vocabulary {
  id: string;
  hanzi: string;
  pinyin: string;
  englishTranslation: string;
  vietnameseTranslation: string;
  tone: 1 | 2 | 3 | 4 | 5;
  difficulty: 'hsk1' | 'hsk2' | 'hsk3' | 'hsk4' | 'hsk5' | 'hsk6';
  audioUrl?: string;
  imageUrl?: string;
  exampleSentence?: string;
  exampleSentenceVi?: string;
  lessonId?: string;
}

// API Client Class
class ApiClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;
  private token: string | null = null;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
    this.timeout = API_CONFIG.TIMEOUT;
    this.headers = { ...API_CONFIG.HEADERS };
  }

  // Set authentication token
  setToken(token: string) {
    this.token = token;
    this.headers['Authorization'] = `Bearer ${token}`;
  }

  // Clear authentication token
  clearToken() {
    this.token = null;
    delete this.headers['Authorization'];
  }

  // Generic request method
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const config: RequestInit = {
        ...options,
        headers: {
          ...this.headers,
          ...options.headers,
        },
      };

      // AbortController for timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.timeout);
      config.signal = controller.signal;

      console.log(`🌐 API Request: ${config.method || 'GET'} ${url}`);

      const response = await fetch(url, config);
      clearTimeout(timeoutId);
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || `HTTP ${response.status}`);
      }

      console.log(`✅ API Success: ${url}`, data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      console.error(`❌ API Error: ${endpoint}`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network error',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(userData: {
    email: string;
    password: string;
    fullName: string;
    level?: string;
    preferredLanguage?: string;
  }): Promise<ApiResponse<LoginResponse>> {
    return this.request<LoginResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async getProfile(): Promise<ApiResponse<{ user: any }>> {
    return this.request('/auth/profile');
  }

  // Lessons endpoints
  async getLessons(difficulty?: string): Promise<ApiResponse<Lesson[]>> {
    const query = difficulty ? `?difficulty=${difficulty}` : '';
    return this.request<Lesson[]>(`/lessons${query}`);
  }

  async getLesson(id: string): Promise<ApiResponse<Lesson>> {
    return this.request<Lesson>(`/lessons/${id}`);
  }

  // Vocabulary endpoints
  async getVocabulary(lessonId?: string): Promise<ApiResponse<Vocabulary[]>> {
    const query = lessonId ? `?lessonId=${lessonId}` : '';
    return this.request<Vocabulary[]>(`/vocabulary${query}`);
  }

  async getVocabularyById(id: string): Promise<ApiResponse<Vocabulary>> {
    return this.request<Vocabulary>(`/vocabulary/${id}`);
  }

  async getWritingPracticeVocabulary(): Promise<ApiResponse<Vocabulary[]>> {
    return this.request<Vocabulary[]>('/vocabulary/writing-practice');
  }

  async getPronunciationPracticeVocabulary(difficulty?: string): Promise<ApiResponse<Vocabulary[]>> {
    const query = difficulty ? `?difficulty=${difficulty}` : '';
    return this.request<Vocabulary[]>(`/vocabulary/pronunciation-practice${query}`);
  }

  // Progress endpoints
  async getWeeklyProgress(userId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/progress/weekly?userId=${userId}`);
  }

  async getSkillsProgress(userId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/progress/skills?userId=${userId}`);
  }

  async getAchievements(userId: string): Promise<ApiResponse<any[]>> {
    return this.request<any[]>(`/progress/achievements?userId=${userId}`);
  }

  async getOverallStats(userId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/progress/stats?userId=${userId}`);
  }

  // Quiz endpoints
  async generateQuiz(lessonId: string, questionCount?: number, difficulty?: string): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    query.append('lessonId', lessonId);
    if (questionCount) query.append('questionCount', questionCount.toString());
    if (difficulty) query.append('difficulty', difficulty);
    return this.request<any>(`/quiz/generate?${query.toString()}`);
  }

  async getQuizByLesson(lessonId: string): Promise<ApiResponse<any>> {
    return this.request<any>(`/quiz/lesson?lessonId=${lessonId}`);
  }

  async getRandomQuiz(difficulty?: string, questionCount?: number): Promise<ApiResponse<any>> {
    const query = new URLSearchParams();
    if (difficulty) query.append('difficulty', difficulty);
    if (questionCount) query.append('questionCount', questionCount.toString());
    return this.request<any>(`/quiz/random?${query.toString()}`);
  }

  // Health check
  async healthCheck(): Promise<ApiResponse<{ status: string }>> {
    return this.request('/health');
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Utility functions for common API operations
export const api = {
  // Authentication
  auth: {
    login: (email: string, password: string) => apiClient.login(email, password),
    register: (userData: any) => apiClient.register(userData),
    getProfile: () => apiClient.getProfile(),
    setToken: (token: string) => apiClient.setToken(token),
    clearToken: () => apiClient.clearToken(),
  },

  // Lessons
  lessons: {
    getAll: (difficulty?: string) => apiClient.getLessons(difficulty),
    getById: (id: string) => apiClient.getLesson(id),
  },

  // Vocabulary
  vocabulary: {
    getAll: (lessonId?: string) => apiClient.getVocabulary(lessonId),
    getById: (id: string) => apiClient.getVocabularyById(id),
    getForWritingPractice: () => apiClient.getWritingPracticeVocabulary(),
    getForPronunciationPractice: (difficulty?: string) => apiClient.getPronunciationPracticeVocabulary(difficulty),
  },

  // Progress
  progress: {
    getWeeklyProgress: (userId: string) => apiClient.getWeeklyProgress(userId),
    getSkillsProgress: (userId: string) => apiClient.getSkillsProgress(userId),
    getAchievements: (userId: string) => apiClient.getAchievements(userId),
    getOverallStats: (userId: string) => apiClient.getOverallStats(userId),
  },

  // Quiz
  quiz: {
    generateQuiz: (lessonId: string, questionCount?: number, difficulty?: string) => 
      apiClient.generateQuiz(lessonId, questionCount, difficulty),
    getByLesson: (lessonId: string) => apiClient.getQuizByLesson(lessonId),
    getRandom: (difficulty?: string, questionCount?: number) => 
      apiClient.getRandomQuiz(difficulty, questionCount),
  },

  // Utility
  healthCheck: () => apiClient.healthCheck(),
};

// Enhanced Lessons API extending existing functionality
export const enhancedLessonsApi = {
  // Get all lessons with optional filtering
  getLessons: async (filters?: LessonFilters): Promise<ApiResponse<Lesson[]>> => {
    try {
      if (filters && (filters.difficulty || filters.type || filters.search)) {
        // Use existing getLessons but extend with custom filtering
        const allLessons = await apiClient.getLessons();
        if (!allLessons.success || !allLessons.data) {
          throw new Error(allLessons.error || 'Failed to fetch lessons');
        }
        
        let filteredLessons = allLessons.data;
        
        if (filters.difficulty) {
          filteredLessons = filteredLessons.filter(lesson => lesson.difficulty === filters.difficulty);
        }
        
        if (filters.type) {
          filteredLessons = filteredLessons.filter(lesson => lesson.type === filters.type);
        }
        
        if (filters.search) {
          const searchLower = filters.search.toLowerCase();
          filteredLessons = filteredLessons.filter(lesson => 
            lesson.titleVi.toLowerCase().includes(searchLower) ||
            lesson.title.toLowerCase().includes(searchLower) ||
            lesson.descriptionVi.toLowerCase().includes(searchLower)
          );
        }
        
        return {
          success: true,
          data: filteredLessons,
          message: `Đã tìm thấy ${filteredLessons.length} bài học`
        };
      }
      
      // Use existing API method for simple requests
      return await apiClient.getLessons();
    } catch (error) {
      console.error('Error fetching lessons:', error);
      return {
        data: [],
        message: 'Không thể tải danh sách bài học. Vui lòng thử lại sau.',
        success: false
      };
    }
  },

  // Get lessons by type
  getLessonsByType: async (type: string): Promise<ApiResponse<Lesson[]>> => {
    return enhancedLessonsApi.getLessons({ type });
  },

  // Get lessons by difficulty  
  getLessonsByDifficulty: async (difficulty: string): Promise<ApiResponse<Lesson[]>> => {
    return await apiClient.getLessons(difficulty);
  },

  // Get lesson by ID
  getLessonById: async (id: string): Promise<ApiResponse<Lesson>> => {
    return await apiClient.getLesson(id);
  },

  // Get lessons statistics
  getLessonsStats: async (): Promise<ApiResponse<LessonsStats>> => {
    try {
      const allLessons = await apiClient.getLessons();
      if (!allLessons.success || !allLessons.data) {
        throw new Error('Failed to fetch lessons for stats');
      }
      
      const lessons = allLessons.data;
      const stats: LessonsStats = {
        total: lessons.length,
        byType: {
          vocabulary: lessons.filter(l => l.type === 'vocabulary').length,
          grammar: lessons.filter(l => l.type === 'grammar').length,
          pronunciation: lessons.filter(l => l.type === 'pronunciation').length,
          writing: lessons.filter(l => l.type === 'writing').length,
          conversation: lessons.filter(l => l.type === 'conversation').length,
        },
        byDifficulty: {
          beginner: lessons.filter(l => l.difficulty === 'beginner').length,
          elementary: lessons.filter(l => l.difficulty === 'elementary').length,
          intermediate: lessons.filter(l => l.difficulty === 'intermediate').length,
          advanced: lessons.filter(l => l.difficulty === 'advanced').length,
        },
        averageDuration: lessons.length > 0 
          ? Math.round(lessons.reduce((sum, lesson) => sum + lesson.duration, 0) / lessons.length)
          : 0,
        totalXP: lessons.reduce((sum, lesson) => sum + lesson.xpReward, 0),
      };
      
      return {
        success: true,
        data: stats,
        message: 'Thống kê bài học được tải thành công'
      };
    } catch (error) {
      console.error('Error fetching lessons stats:', error);
      return {
        data: {
          total: 0,
          byType: { vocabulary: 0, grammar: 0, pronunciation: 0, writing: 0, conversation: 0 },
          byDifficulty: { beginner: 0, elementary: 0, intermediate: 0, advanced: 0 },
          averageDuration: 0,
          totalXP: 0
        },
        message: 'Không thể tải thống kê bài học.',
        success: false
      };
    }
  },

  // Search lessons
  searchLessons: async (query: string): Promise<ApiResponse<Lesson[]>> => {
    return enhancedLessonsApi.getLessons({ search: query });
  },

  // Get recommended lessons (could be enhanced based on user progress)
  getRecommendedLessons: async (userLevel: string = 'beginner'): Promise<ApiResponse<Lesson[]>> => {
    return enhancedLessonsApi.getLessons({ difficulty: userLevel });
  }
};

export default api; 