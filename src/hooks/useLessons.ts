import { useState, useEffect, useCallback } from 'react';
import { enhancedLessonsApi } from '../services/api/client';
import type { Lesson, LessonFilters, LessonsStats, ApiResponse } from '../services/api/client';

// Hook state interface
interface UseLessonsState {
  lessons: Lesson[];
  filteredLessons: Lesson[];
  currentLesson: Lesson | null;
  stats: LessonsStats | null;
  isLoading: boolean;
  isLoadingLesson: boolean;
  isLoadingStats: boolean;
  error: string | null;
  hasError: boolean;
}

// Hook return interface
interface UseLessonsReturn extends UseLessonsState {
  // Data fetching
  fetchLessons: (filters?: LessonFilters) => Promise<void>;
  fetchLessonById: (id: string) => Promise<Lesson | null>;
  fetchStats: () => Promise<void>;
  searchLessons: (query: string) => Promise<void>;
  
  // Filtering & sorting
  filterLessonsByType: (type: string) => void;
  filterLessonsByDifficulty: (difficulty: string) => void;
  getRecommendedLessons: (userLevel?: string) => Promise<void>;
  sortLessons: (sortBy: 'duration' | 'xp' | 'title' | 'order') => void;
  
  // Utilities
  clearFilters: () => void;
  clearError: () => void;
  refresh: () => Promise<void>;
  
  // Quick access helpers
  getVocabularyLessons: () => Lesson[];
  getGrammarLessons: () => Lesson[];
  getPronunciationLessons: () => Lesson[];
  getWritingLessons: () => Lesson[];
  getConversationLessons: () => Lesson[];
  getBeginnerLessons: () => Lesson[];
  getElementaryLessons: () => Lesson[];
  getIntermediateLessons: () => Lesson[];
  getAdvancedLessons: () => Lesson[];
}

export const useLessons = (): UseLessonsReturn => {
  // State management
  const [state, setState] = useState<UseLessonsState>({
    lessons: [],
    filteredLessons: [],
    currentLesson: null,
    stats: null,
    isLoading: false,
    isLoadingLesson: false,
    isLoadingStats: false,
    error: null,
    hasError: false,
  });

  // Update state helper
  const updateState = useCallback((updates: Partial<UseLessonsState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // Error handling helper
  const handleError = useCallback((error: string, context: string = '') => {
    console.error(`[useLessons] ${context}:`, error);
    updateState({
      error: error || 'Đã xảy ra lỗi không xác định',
      hasError: true,
      isLoading: false,
      isLoadingLesson: false,
      isLoadingStats: false,
    });
  }, [updateState]);

  // Clear error
  const clearError = useCallback(() => {
    updateState({ error: null, hasError: false });
  }, [updateState]);

  // Fetch all lessons with optional filtering
  const fetchLessons = useCallback(async (filters?: LessonFilters) => {
    try {
      updateState({ isLoading: true, error: null, hasError: false });
      
      const response: ApiResponse<Lesson[]> = await enhancedLessonsApi.getLessons(filters);
      
      if (response.success && response.data) {
        updateState({
          lessons: response.data,
          filteredLessons: response.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Không thể tải danh sách bài học');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to fetch lessons', 'fetchLessons');
    }
  }, [updateState, handleError]);

  // Fetch single lesson by ID
  const fetchLessonById = useCallback(async (id: string): Promise<Lesson | null> => {
    try {
      updateState({ isLoadingLesson: true, error: null });
      
      const response = await enhancedLessonsApi.getLessonById(id);
      
      if (response.success && response.data) {
        updateState({
          currentLesson: response.data,
          isLoadingLesson: false,
        });
        return response.data;
      } else {
        throw new Error(response.message || 'Không thể tải chi tiết bài học');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to fetch lesson', 'fetchLessonById');
      return null;
    }
  }, [updateState, handleError]);

  // Fetch lessons statistics
  const fetchStats = useCallback(async () => {
    try {
      updateState({ isLoadingStats: true, error: null });
      
      const response = await enhancedLessonsApi.getLessonsStats();
      
      if (response.success && response.data) {
        updateState({
          stats: response.data,
          isLoadingStats: false,
        });
      } else {
        throw new Error(response.message || 'Không thể tải thống kê bài học');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to fetch stats', 'fetchStats');
    }
  }, [updateState, handleError]);

  // Search lessons
  const searchLessons = useCallback(async (query: string) => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await enhancedLessonsApi.searchLessons(query);
      
      if (response.success && response.data) {
        updateState({
          filteredLessons: response.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Không thể tìm kiếm bài học');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to search lessons', 'searchLessons');
    }
  }, [updateState, handleError]);

  // Filter lessons by type
  const filterLessonsByType = useCallback((type: string) => {
    const filtered = state.lessons.filter(lesson => lesson.type === type);
    updateState({ filteredLessons: filtered });
  }, [state.lessons, updateState]);

  // Filter lessons by difficulty
  const filterLessonsByDifficulty = useCallback((difficulty: string) => {
    const filtered = state.lessons.filter(lesson => lesson.difficulty === difficulty);
    updateState({ filteredLessons: filtered });
  }, [state.lessons, updateState]);

  // Get recommended lessons
  const getRecommendedLessons = useCallback(async (userLevel: string = 'beginner') => {
    try {
      updateState({ isLoading: true, error: null });
      
      const response = await enhancedLessonsApi.getRecommendedLessons(userLevel);
      
      if (response.success && response.data) {
        updateState({
          filteredLessons: response.data,
          isLoading: false,
        });
      } else {
        throw new Error(response.message || 'Không thể tải bài học gợi ý');
      }
    } catch (error) {
      handleError(error instanceof Error ? error.message : 'Failed to get recommendations', 'getRecommendedLessons');
    }
  }, [updateState, handleError]);

  // Sort lessons
  const sortLessons = useCallback((sortBy: 'duration' | 'xp' | 'title' | 'order') => {
    const sorted = [...state.filteredLessons].sort((a, b) => {
      switch (sortBy) {
        case 'duration':
          return a.duration - b.duration;
        case 'xp':
          return b.xpReward - a.xpReward;
        case 'title':
          return a.titleVi.localeCompare(b.titleVi);
        case 'order':
        default:
          return a.order - b.order;
      }
    });
    updateState({ filteredLessons: sorted });
  }, [state.filteredLessons, updateState]);

  // Clear filters
  const clearFilters = useCallback(() => {
    updateState({ filteredLessons: state.lessons });
  }, [state.lessons, updateState]);

  // Refresh data
  const refresh = useCallback(async () => {
    await Promise.all([
      fetchLessons(),
      fetchStats(),
    ]);
  }, [fetchLessons, fetchStats]);

  // Quick access helpers
  const getVocabularyLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.type === 'vocabulary');
  }, [state.lessons]);

  const getGrammarLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.type === 'grammar');
  }, [state.lessons]);

  const getPronunciationLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.type === 'pronunciation');
  }, [state.lessons]);

  const getWritingLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.type === 'writing');
  }, [state.lessons]);

  const getConversationLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.type === 'conversation');
  }, [state.lessons]);

  const getBeginnerLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.difficulty === 'beginner');
  }, [state.lessons]);

  const getElementaryLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.difficulty === 'elementary');
  }, [state.lessons]);

  const getIntermediateLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.difficulty === 'intermediate');
  }, [state.lessons]);

  const getAdvancedLessons = useCallback((): Lesson[] => {
    return state.lessons.filter(lesson => lesson.difficulty === 'advanced');
  }, [state.lessons]);

  // Initialize data on mount
  useEffect(() => {
    fetchLessons();
  }, [fetchLessons]);

  // Return hook interface
  return {
    // State
    ...state,
    
    // Actions
    fetchLessons,
    fetchLessonById,
    fetchStats,
    searchLessons,
    filterLessonsByType,
    filterLessonsByDifficulty,
    getRecommendedLessons,
    sortLessons,
    clearFilters,
    clearError,
    refresh,
    
    // Quick access helpers
    getVocabularyLessons,
    getGrammarLessons,
    getPronunciationLessons,
    getWritingLessons,
    getConversationLessons,
    getBeginnerLessons,
    getElementaryLessons,
    getIntermediateLessons,
    getAdvancedLessons,
  };
};

export default useLessons; 