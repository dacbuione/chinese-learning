import { useState, useEffect, useCallback } from 'react';

// Types for sequential learning
export enum LessonStatus {
  LOCKED = 'locked',
  AVAILABLE = 'available',
  IN_PROGRESS = 'in-progress', 
  COMPLETED = 'completed',
  MASTERED = 'mastered'
}

export interface UnlockRequirements {
  prerequisites: string[];
  minimumScore: number;
  requiredXP: number;
  missingXP?: number;
}

export interface LearningPathItem {
  lesson: {
    id: string;
    title: string;
    titleVi: string;
    description: string;
    descriptionVi: string;
    difficulty: string;
    type: string;
    order: number;
    duration: number;
    xpReward: number;
    objectives: string[];
    tags: string[];
  };
  status: LessonStatus;
  progress: number;
  score?: number;
  unlockRequirements?: UnlockRequirements;
}

export interface ProgressStats {
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  currentStreak: number;
  averageScore: number;
  timeSpent: number;
  weeklyProgress: number;
}

interface UseSequentialLearningReturn {
  learningPath: LearningPathItem[];
  availableLessons: LearningPathItem[];
  nextLesson: LearningPathItem | null;
  progressStats: ProgressStats | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  checkLessonUnlock: (lessonId: string) => Promise<{ status: LessonStatus; canAccess: boolean }>;
  updateLessonProgress: (lessonId: string, progress: number, score?: number, timeSpent?: number) => Promise<void>;
  completeExercise: (lessonId: string, exerciseId: string, score: number, timeSpent?: number) => Promise<void>;
  refreshLearningPath: () => Promise<void>;
  
  // Utilities
  canAccessLesson: (lessonId: string) => boolean;
  getLessonStatus: (lessonId: string) => LessonStatus;
  getProgressPercentage: () => number;
  getUnlockMessage: (lessonId: string) => string | null;
}

const BASE_URL = 'http://localhost:3000/api/v1';
const USER_ID = '17748c5a-4858-4505-8088-693f88bbfa43'; // Hardcoded for now

export const useSequentialLearning = (): UseSequentialLearningReturn => {
  const [learningPath, setLearningPath] = useState<LearningPathItem[]>([]);
  const [availableLessons, setAvailableLessons] = useState<LearningPathItem[]>([]);
  const [nextLesson, setNextLesson] = useState<LearningPathItem | null>(null);
  const [progressStats, setProgressStats] = useState<ProgressStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch learning path
  const fetchLearningPath = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`${BASE_URL}/progress/learning-path/${USER_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setLearningPath(data);

      // Filter available lessons
      const available = data.filter((item: LearningPathItem) => 
        item.status === LessonStatus.AVAILABLE ||
        item.status === LessonStatus.IN_PROGRESS ||
        item.status === LessonStatus.COMPLETED ||
        item.status === LessonStatus.MASTERED
      );
      setAvailableLessons(available);

      // Find next lesson
      const next = data.find((item: LearningPathItem) => 
        item.status === LessonStatus.AVAILABLE ||
        item.status === LessonStatus.IN_PROGRESS
      );
      setNextLesson(next || null);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load learning path');
      console.error('Error fetching learning path:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Fetch progress statistics
  const fetchProgressStats = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/progress/stats/${USER_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const stats = await response.json();
      setProgressStats(stats);
    } catch (err) {
      console.error('Error fetching progress stats:', err);
    }
  }, []);

  // Check if specific lesson can be unlocked
  const checkLessonUnlock = useCallback(async (lessonId: string) => {
    try {
      const response = await fetch(`${BASE_URL}/progress/lesson/${lessonId}/unlock-status/${USER_ID}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } catch (err) {
      console.error('Error checking lesson unlock:', err);
      return { status: LessonStatus.LOCKED, canAccess: false };
    }
  }, []);

  // Update lesson progress
  const updateLessonProgress = useCallback(async (
    lessonId: string, 
    progress: number, 
    score?: number, 
    timeSpent?: number
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/progress/lesson/${lessonId}/user/${USER_ID}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          progress,
          score,
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Refresh learning path after progress update
      await fetchLearningPath();
      await fetchProgressStats();
    } catch (err) {
      console.error('Error updating lesson progress:', err);
      throw err;
    }
  }, [fetchLearningPath, fetchProgressStats]);

  // Complete exercise
  const completeExercise = useCallback(async (
    lessonId: string,
    exerciseId: string,
    score: number,
    timeSpent?: number
  ) => {
    try {
      const response = await fetch(`${BASE_URL}/progress/exercise/complete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lessonId,
          exerciseId,
          score,
          timeSpent,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Refresh learning path after exercise completion
      await fetchLearningPath();
      await fetchProgressStats();
    } catch (err) {
      console.error('Error completing exercise:', err);
      throw err;
    }
  }, [fetchLearningPath, fetchProgressStats]);

  // Refresh learning path
  const refreshLearningPath = useCallback(async () => {
    await Promise.all([fetchLearningPath(), fetchProgressStats()]);
  }, [fetchLearningPath, fetchProgressStats]);

  // Utility functions
  const canAccessLesson = useCallback((lessonId: string): boolean => {
    const lesson = learningPath.find(item => item.lesson.id === lessonId);
    return lesson ? [
      LessonStatus.AVAILABLE,
      LessonStatus.IN_PROGRESS,
      LessonStatus.COMPLETED,
      LessonStatus.MASTERED
    ].includes(lesson.status) : false;
  }, [learningPath]);

  const getLessonStatus = useCallback((lessonId: string): LessonStatus => {
    const lesson = learningPath.find(item => item.lesson.id === lessonId);
    return lesson?.status || LessonStatus.LOCKED;
  }, [learningPath]);

  const getProgressPercentage = useCallback((): number => {
    if (!progressStats) return 0;
    return progressStats.totalLessons > 0 ? 
      (progressStats.completedLessons / progressStats.totalLessons) * 100 : 0;
  }, [progressStats]);

  const getUnlockMessage = useCallback((lessonId: string): string | null => {
    const lesson = learningPath.find(item => item.lesson.id === lessonId);
    
    if (!lesson || lesson.status !== LessonStatus.LOCKED || !lesson.unlockRequirements) {
      return null;
    }

    const { prerequisites, minimumScore, missingXP } = lesson.unlockRequirements;
    
    if (prerequisites.length > 0) {
      const incompletePrereqs = prerequisites.filter(prereqId => {
        const prereqLesson = learningPath.find(item => item.lesson.id === prereqId);
        return !prereqLesson || 
               prereqLesson.status !== LessonStatus.COMPLETED && prereqLesson.status !== LessonStatus.MASTERED ||
               (prereqLesson.score || 0) < minimumScore;
      });

      if (incompletePrereqs.length > 0) {
        return `Hoàn thành ${incompletePrereqs.length} bài học trước đó với điểm số tối thiểu ${minimumScore}%`;
      }
    }

    if (missingXP && missingXP > 0) {
      return `Cần thêm ${missingXP} XP để mở khóa`;
    }

    return 'Bài học đã sẵn sàng để học';
  }, [learningPath]);

  // Load data on mount
  useEffect(() => {
    refreshLearningPath();
  }, [refreshLearningPath]);

  return {
    learningPath,
    availableLessons,
    nextLesson,
    progressStats,
    isLoading,
    error,
    
    // Actions
    checkLessonUnlock,
    updateLessonProgress,
    completeExercise,
    refreshLearningPath,
    
    // Utilities
    canAccessLesson,
    getLessonStatus,
    getProgressPercentage,
    getUnlockMessage,
  };
}; 