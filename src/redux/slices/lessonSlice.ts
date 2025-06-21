import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { api, Lesson } from '../../services/api/client';

interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  audioUrl?: string;
  strokeOrder?: string[];
  tone: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category: string;
}

interface GrammarRule {
  id: string;
  title: string;
  explanation: string;
  examples: {
    chinese: string;
    pinyin: string;
    english: string;
  }[];
}

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'fill-blank' | 'sentence-builder' | 'tone-recognition' | 'stroke-order';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  audioUrl?: string;
}

interface Lesson {
  id: string;
  title: string;
  description: string;
  courseId: string;
  type: string;
  difficulty: string;
  estimatedTime: number;
  vocabulary: VocabularyItem[];
  grammar: GrammarRule[];
  quiz: QuizQuestion[];
  completed: boolean;
  score?: number;
}

interface Course {
  id: string;
  title: string;
  description: string;
  level: string;
  totalLessons: number;
  completedLessons: number;
  progress: number;
  color: string;
  image?: string;
}

// Types
export interface LessonProgress {
  lessonId: string;
  progress: number;
  completed: boolean;
  score?: number;
  lastAccessed?: Date;
}

export interface LessonState {
  lessons: Lesson[];
  currentLesson: Lesson | null;
  progress: Record<string, LessonProgress>;
  favorites: string[];
  isLoading: boolean;
  error: string | null;
  filters: {
    difficulty?: string;
    type?: string;
    search?: string;
  };
}

// Initial state
const initialState: LessonState = {
  lessons: [],
  currentLesson: null,
  progress: {},
  favorites: [],
  isLoading: false,
  error: null,
  filters: {},
};

// Async thunks
export const fetchLessons = createAsyncThunk(
  'lessons/fetchLessons',
  async (difficulty?: string, { rejectWithValue }) => {
    try {
      const response = await api.lessons.getAll(difficulty);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Không thể tải bài học');
      }

      return response.data || [];
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi không xác định');
    }
  }
);

export const fetchLessonById = createAsyncThunk(
  'lessons/fetchLessonById',
  async (lessonId: string, { rejectWithValue }) => {
    try {
      const response = await api.lessons.getById(lessonId);
      
      if (!response.success) {
        return rejectWithValue(response.error || 'Không thể tải bài học');
      }

      return response.data;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi không xác định');
    }
  }
);

// Slice
const lessonSlice = createSlice({
  name: 'lessons',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentLesson: (state, action: PayloadAction<Lesson | null>) => {
      state.currentLesson = action.payload;
    },
    updateProgress: (state, action: PayloadAction<LessonProgress>) => {
      const { lessonId } = action.payload;
      state.progress[lessonId] = {
        ...state.progress[lessonId],
        ...action.payload,
        lastAccessed: new Date(),
      };
    },
    markLessonComplete: (state, action: PayloadAction<string>) => {
      const lessonId = action.payload;
      if (state.progress[lessonId]) {
        state.progress[lessonId].completed = true;
        state.progress[lessonId].progress = 100;
      } else {
        state.progress[lessonId] = {
          lessonId,
          progress: 100,
          completed: true,
          lastAccessed: new Date(),
        };
      }
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const lessonId = action.payload;
      const index = state.favorites.indexOf(lessonId);
      if (index > -1) {
        state.favorites.splice(index, 1);
      } else {
        state.favorites.push(lessonId);
      }
    },
    setFilters: (state, action: PayloadAction<Partial<LessonState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    resetLessonState: (state) => {
      state.lessons = [];
      state.currentLesson = null;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Fetch lessons
    builder
      .addCase(fetchLessons.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLessons.fulfilled, (state, action) => {
        state.isLoading = false;
        state.lessons = action.payload;
        state.error = null;
      })
      .addCase(fetchLessons.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Fetch lesson by ID
    builder
      .addCase(fetchLessonById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchLessonById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentLesson = action.payload;
        state.error = null;

        // Update lessons array if lesson exists
        const existingIndex = state.lessons.findIndex(l => l.id === action.payload.id);
        if (existingIndex > -1) {
          state.lessons[existingIndex] = action.payload;
        }
      })
      .addCase(fetchLessonById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  clearError,
  setCurrentLesson,
  updateProgress,
  markLessonComplete,
  toggleFavorite,
  setFilters,
  clearFilters,
  resetLessonState,
} = lessonSlice.actions;

// Selectors
export const selectLessons = (state: { lessons: LessonState }) => state.lessons.lessons;
export const selectCurrentLesson = (state: { lessons: LessonState }) => state.lessons.currentLesson;
export const selectLessonProgress = (state: { lessons: LessonState }) => state.lessons.progress;
export const selectFavoriteLessons = (state: { lessons: LessonState }) => state.lessons.favorites;
export const selectLessonIsLoading = (state: { lessons: LessonState }) => state.lessons.isLoading;
export const selectLessonError = (state: { lessons: LessonState }) => state.lessons.error;
export const selectLessonFilters = (state: { lessons: LessonState }) => state.lessons.filters;

// Computed selectors
export const selectFilteredLessons = (state: { lessons: LessonState }) => {
  const { lessons, filters } = state.lessons;
  let filtered = [...lessons];

  if (filters.difficulty) {
    filtered = filtered.filter(lesson => lesson.difficulty === filters.difficulty);
  }

  if (filters.type) {
    filtered = filtered.filter(lesson => lesson.type === filters.type);
  }

  if (filters.search) {
    const searchTerm = filters.search.toLowerCase();
    filtered = filtered.filter(lesson => 
      lesson.title.toLowerCase().includes(searchTerm) ||
      lesson.titleVi.toLowerCase().includes(searchTerm) ||
      lesson.description.toLowerCase().includes(searchTerm) ||
      lesson.descriptionVi.toLowerCase().includes(searchTerm)
    );
  }

  return filtered.sort((a, b) => a.order - b.order);
};

export const selectLessonById = (lessonId: string) => (state: { lessons: LessonState }) => {
  return state.lessons.lessons.find(lesson => lesson.id === lessonId);
};

export const selectLessonProgressById = (lessonId: string) => (state: { lessons: LessonState }) => {
  return state.lessons.progress[lessonId] || {
    lessonId,
    progress: 0,
    completed: false,
  };
};

export const selectCompletedLessons = (state: { lessons: LessonState }) => {
  return Object.values(state.lessons.progress).filter(p => p.completed);
};

export const selectTotalXp = (state: { lessons: LessonState }) => {
  const completedLessons = selectCompletedLessons(state);
  return completedLessons.reduce((total, progress) => {
    const lesson = state.lessons.lessons.find(l => l.id === progress.lessonId);
    return total + (lesson?.xpReward || 0);
  }, 0);
};

export default lessonSlice.reducer;