import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { WritingCharacter, WritingSession, WritingProgress, StrokePath } from '../../components/features/writing/types/writing.types';
import { WritingService } from '@/services/writingService';

// State interface
interface WritingState {
  // Characters data
  characters: WritingCharacter[];
  selectedCharacter: WritingCharacter | null;
  
  // Current session
  currentSession: WritingSession | null;
  
  // User progress
  progress: WritingProgress[];
  
  // UI state
  isLoading: boolean;
  error: string | null;
  
  // Filters and search
  searchQuery: string;
  difficultyFilter: 'all' | 'beginner' | 'intermediate' | 'advanced';
  hskLevelFilter: 'all' | '1' | '2' | '3' | '4' | '5' | '6';
  strokeCountFilter: { min: number; max: number };
  
  // Practice state
  isAnimating: boolean;
  showStrokeOrder: boolean;
  showGuidelines: boolean;
  autoPlay: boolean;
  playbackSpeed: number;
}

const initialState: WritingState = {
  // Data
  characters: [],
  selectedCharacter: null,
  currentSession: null,
  progress: [],
  
  // UI
  isLoading: false,
  error: null,
  
  // Filters
  searchQuery: '',
  difficultyFilter: 'all',
  hskLevelFilter: 'all',
  strokeCountFilter: { min: 1, max: 10 },
  
  // Practice
  isAnimating: false,
  showStrokeOrder: true,
  showGuidelines: true,
  autoPlay: false,
  playbackSpeed: 1000,
};

// Async Thunks

/**
 * Load all writing characters
 */
export const loadWritingCharacters = createAsyncThunk(
  'writing/loadCharacters',
  async (_, { rejectWithValue }) => {
    try {
      const characters = WritingService.getAllCharacters();
      return characters;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi tải dữ liệu ký tự');
    }
  }
);

/**
 * Load character by ID
 */
export const loadCharacterById = createAsyncThunk(
  'writing/loadCharacterById',
  async (characterId: string, { rejectWithValue }) => {
    try {
      const character = WritingService.getCharacterById(characterId);
      if (!character) {
        throw new Error('Không tìm thấy ký tự');
      }
      return character;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi tải ký tự');
    }
  }
);

/**
 * Start new writing session
 */
export const startWritingSession = createAsyncThunk(
  'writing/startSession',
  async (characterId: string, { rejectWithValue }) => {
    try {
      const session = WritingService.createWritingSession(characterId);
      return session;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi tạo phiên luyện tập');
    }
  }
);

/**
 * Complete writing session
 */
export const completeWritingSession = createAsyncThunk(
  'writing/completeSession',
  async (
    { session, userStrokes, score }: {
      session: WritingSession;
      userStrokes: StrokePath[];
      score: number;
    },
    { rejectWithValue }
  ) => {
    try {
      const updatedSession = WritingService.updateWritingSession(session, userStrokes, score);
      return updatedSession;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi hoàn thành phiên luyện tập');
    }
  }
);

/**
 * Evaluate character writing
 */
export const evaluateCharacterWriting = createAsyncThunk(
  'writing/evaluateCharacter',
  async (
    { characterId, userStrokes }: {
      characterId: string;
      userStrokes: StrokePath[];
    },
    { rejectWithValue }
  ) => {
    try {
      const evaluation = WritingService.evaluateCharacterWriting(characterId, userStrokes);
      return evaluation;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi đánh giá bài viết');
    }
  }
);

/**
 * Search characters
 */
export const searchCharacters = createAsyncThunk(
  'writing/searchCharacters',
  async (query: string, { rejectWithValue }) => {
    try {
      const results = WritingService.searchCharacters(query);
      return results;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Lỗi tìm kiếm');
    }
  }
);

// Writing Slice
const writingSlice = createSlice({
  name: 'writing',
  initialState,
  reducers: {
    // Character selection
    selectCharacter: (state, action: PayloadAction<WritingCharacter>) => {
      state.selectedCharacter = action.payload;
      state.error = null;
    },

    clearSelectedCharacter: (state) => {
      state.selectedCharacter = null;
      state.currentSession = null;
    },

    // Session management
    updateSession: (state, action: PayloadAction<Partial<WritingSession>>) => {
      if (state.currentSession) {
        state.currentSession = { ...state.currentSession, ...action.payload };
      }
    },

    clearSession: (state) => {
      state.currentSession = null;
    },

    // Filters
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
    },

    setDifficultyFilter: (state, action: PayloadAction<WritingState['difficultyFilter']>) => {
      state.difficultyFilter = action.payload;
    },

    setHSKLevelFilter: (state, action: PayloadAction<WritingState['hskLevelFilter']>) => {
      state.hskLevelFilter = action.payload;
    },

    setStrokeCountFilter: (state, action: PayloadAction<{ min: number; max: number }>) => {
      state.strokeCountFilter = action.payload;
    },

    clearFilters: (state) => {
      state.searchQuery = '';
      state.difficultyFilter = 'all';
      state.hskLevelFilter = 'all';
      state.strokeCountFilter = { min: 1, max: 10 };
    },

    // Practice settings
    setAnimating: (state, action: PayloadAction<boolean>) => {
      state.isAnimating = action.payload;
    },

    toggleStrokeOrder: (state) => {
      state.showStrokeOrder = !state.showStrokeOrder;
    },

    toggleGuidelines: (state) => {
      state.showGuidelines = !state.showGuidelines;
    },

    toggleAutoPlay: (state) => {
      state.autoPlay = !state.autoPlay;
    },

    setPlaybackSpeed: (state, action: PayloadAction<number>) => {
      state.playbackSpeed = action.payload;
    },

    // Progress management
    updateProgress: (state, action: PayloadAction<WritingProgress>) => {
      const existingIndex = state.progress.findIndex(p => p.characterId === action.payload.characterId);
      if (existingIndex >= 0) {
        state.progress[existingIndex] = action.payload;
      } else {
        state.progress.push(action.payload);
      }
    },

    // Error handling
    clearError: (state) => {
      state.error = null;
    },

    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
    },
  },

  extraReducers: (builder) => {
    // Load characters
    builder
      .addCase(loadWritingCharacters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadWritingCharacters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.characters = action.payload;
        state.error = null;
      })
      .addCase(loadWritingCharacters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Load character by ID
    builder
      .addCase(loadCharacterById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadCharacterById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedCharacter = action.payload;
        state.error = null;
      })
      .addCase(loadCharacterById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Start session
    builder
      .addCase(startWritingSession.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startWritingSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
        state.error = null;
      })
      .addCase(startWritingSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Complete session
    builder
      .addCase(completeWritingSession.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(completeWritingSession.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentSession = action.payload;
        
        // Update progress
        const characterId = action.payload.characterId;
        const existingProgress = state.progress.find(p => p.characterId === characterId);
        
        if (existingProgress) {
          existingProgress.totalAttempts += 1;
          existingProgress.lastPracticed = Date.now();
          if (action.payload.accuracy > existingProgress.bestAccuracy) {
            existingProgress.bestAccuracy = action.payload.accuracy;
          }
          
          // Update average accuracy
          existingProgress.averageAccuracy = (
            (existingProgress.averageAccuracy * (existingProgress.totalAttempts - 1) + action.payload.accuracy) /
            existingProgress.totalAttempts
          );
          
          // Update mastery level
          if (existingProgress.averageAccuracy >= 90) {
            existingProgress.masteryLevel = 'mastered';
          } else if (existingProgress.averageAccuracy >= 70) {
            existingProgress.masteryLevel = 'practicing';
          } else {
            existingProgress.masteryLevel = 'learning';
          }
        } else {
          // Create new progress entry
          const newProgress: WritingProgress = {
            characterId,
            totalAttempts: 1,
            bestAccuracy: action.payload.accuracy,
            averageAccuracy: action.payload.accuracy,
            fastestTime: action.payload.completionTime,
            lastPracticed: Date.now(),
            masteryLevel: action.payload.accuracy >= 90 ? 'mastered' : 
                         action.payload.accuracy >= 70 ? 'practicing' : 'learning',
            streakDays: 1,
          };
          state.progress.push(newProgress);
        }
        
        state.error = null;
      })
      .addCase(completeWritingSession.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // Search characters
    builder
      .addCase(searchCharacters.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(searchCharacters.fulfilled, (state, action) => {
        state.isLoading = false;
        state.characters = action.payload;
        state.error = null;
      })
      .addCase(searchCharacters.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

// Export actions
export const {
  selectCharacter,
  clearSelectedCharacter,
  updateSession,
  clearSession,
  setSearchQuery,
  setDifficultyFilter,
  setHSKLevelFilter,
  setStrokeCountFilter,
  clearFilters,
  setAnimating,
  toggleStrokeOrder,
  toggleGuidelines,
  toggleAutoPlay,
  setPlaybackSpeed,
  updateProgress,
  clearError,
  setError,
} = writingSlice.actions;

// Selectors
export const selectWritingState = (state: { writing: WritingState }) => state.writing;
export const selectWritingCharacters = (state: { writing: WritingState }) => state.writing.characters;
export const selectSelectedCharacter = (state: { writing: WritingState }) => state.writing.selectedCharacter;
export const selectCurrentSession = (state: { writing: WritingState }) => state.writing.currentSession;
export const selectWritingProgress = (state: { writing: WritingState }) => state.writing.progress;
export const selectWritingIsLoading = (state: { writing: WritingState }) => state.writing.isLoading;
export const selectWritingError = (state: { writing: WritingState }) => state.writing.error;

// Filtered characters selector
export const selectFilteredCharacters = (state: { writing: WritingState }) => {
  const { characters, searchQuery, difficultyFilter, hskLevelFilter, strokeCountFilter } = state.writing;
  
  return characters.filter(character => {
    // Search filter
    const matchesSearch = !searchQuery || 
      character.character.includes(searchQuery) ||
      character.pinyin.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.vietnamese.toLowerCase().includes(searchQuery.toLowerCase()) ||
      character.english.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Difficulty filter
    const matchesDifficulty = difficultyFilter === 'all' || character.difficulty === difficultyFilter;
    
    // HSK level filter
    const matchesHSK = hskLevelFilter === 'all' || 
      (character.hskLevel && character.hskLevel.toString() === hskLevelFilter);
    
    // Stroke count filter
    const matchesStrokeCount = character.strokeCount >= strokeCountFilter.min && 
      character.strokeCount <= strokeCountFilter.max;
    
    return matchesSearch && matchesDifficulty && matchesHSK && matchesStrokeCount;
  });
};

// Progress selectors
export const selectCharacterProgress = (characterId: string) => 
  (state: { writing: WritingState }) => 
    state.writing.progress.find(p => p.characterId === characterId);

export const selectMasteredCharacters = (state: { writing: WritingState }) =>
  state.writing.progress.filter(p => p.masteryLevel === 'mastered');

export const selectLearningCharacters = (state: { writing: WritingState }) =>
  state.writing.progress.filter(p => p.masteryLevel === 'learning');

export const selectPracticingCharacters = (state: { writing: WritingState }) =>
  state.writing.progress.filter(p => p.masteryLevel === 'practicing');

// Statistics selectors
export const selectWritingStats = (state: { writing: WritingState }) => {
  const progress = state.writing.progress;
  
  const totalCharacters = progress.length;
  const masteredCount = progress.filter(p => p.masteryLevel === 'mastered').length;
  const practicingCount = progress.filter(p => p.masteryLevel === 'practicing').length;
  const learningCount = progress.filter(p => p.masteryLevel === 'learning').length;
  
  const averageAccuracy = progress.length > 0 ? 
    progress.reduce((sum, p) => sum + p.averageAccuracy, 0) / progress.length : 0;
  
  const totalAttempts = progress.reduce((sum, p) => sum + p.totalAttempts, 0);
  
  return {
    totalCharacters,
    masteredCount,
    practicingCount,
    learningCount,
    averageAccuracy: Math.round(averageAccuracy),
    totalAttempts,
    masteryRate: totalCharacters > 0 ? Math.round((masteredCount / totalCharacters) * 100) : 0,
  };
};

export default writingSlice.reducer; 