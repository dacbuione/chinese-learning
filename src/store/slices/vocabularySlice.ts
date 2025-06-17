import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  ChineseWord, 
  VocabularyProgress, 
  VocabularyService 
} from '@/services/vocabularyService';

export interface VocabularyState {
  allWords: ChineseWord[];
  progressRecords: VocabularyProgress[];
  categories: any[];
  isLoading: boolean;
  error: string | null;
  filters: {
    hskLevel: number | null;
    category: string | null;
    searchQuery: string;
  };
  stats: {
    totalWords: number;
    learnedWords: number;
    masteredWords: number;
    favoriteWords: number;
  };
}

const initialState: VocabularyState = {
  allWords: [],
  progressRecords: [],
  categories: [],
  isLoading: false,
  error: null,
  filters: {
    hskLevel: null,
    category: null,
    searchQuery: '',
  },
  stats: {
    totalWords: 0,
    learnedWords: 0,
    masteredWords: 0,
    favoriteWords: 0,
  },
};

export const loadVocabulary = createAsyncThunk(
  'vocabulary/loadVocabulary',
  async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      const words = VocabularyService.getHSK1Vocabulary();
      const categories = VocabularyService.getCategories();
      return { words, categories };
    } catch (error) {
      throw new Error('Failed to load vocabulary');
    }
  }
);

const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    setHSKLevelFilter: (state, action: PayloadAction<number | null>) => {
      state.filters.hskLevel = action.payload;
    },
    setCategoryFilter: (state, action: PayloadAction<string | null>) => {
      state.filters.category = action.payload;
    },
    setSearchQuery: (state, action: PayloadAction<string>) => {
      state.filters.searchQuery = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {
        hskLevel: null,
        category: null,
        searchQuery: '',
      };
    },
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const wordId = action.payload;
      const progressIndex = state.progressRecords.findIndex(p => p.wordId === wordId);
      
      if (progressIndex >= 0) {
        state.progressRecords[progressIndex].isFavorite = 
          !state.progressRecords[progressIndex].isFavorite;
      } else {
        const newProgress = VocabularyService.initializeProgress(wordId);
        newProgress.isFavorite = true;
        state.progressRecords.push(newProgress);
      }
      
      state.stats.favoriteWords = state.progressRecords.filter(p => p.isFavorite).length;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadVocabulary.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadVocabulary.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allWords = action.payload.words;
        state.categories = action.payload.categories;
        
        action.payload.words.forEach(word => {
          if (!state.progressRecords.find(p => p.wordId === word.id)) {
            state.progressRecords.push(VocabularyService.initializeProgress(word.id));
          }
        });
        
        state.stats = VocabularyService.getVocabularyStats(
          state.allWords,
          state.progressRecords
        );
      })
      .addCase(loadVocabulary.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to load vocabulary';
      });
  },
});

export const {
  setHSKLevelFilter,
  setCategoryFilter,
  setSearchQuery,
  clearFilters,
  toggleFavorite,
  clearError,
} = vocabularySlice.actions;

export const selectAllWords = (state: { vocabulary: VocabularyState }) => state.vocabulary.allWords;
export const selectFilteredWords = (state: { vocabulary: VocabularyState }) => {
  const { allWords, filters } = state.vocabulary;
  return VocabularyService.filterVocabulary(allWords, {
    hskLevel: filters.hskLevel || undefined,
    category: filters.category || undefined,
    searchQuery: filters.searchQuery || undefined,
  });
};
export const selectIsLoading = (state: { vocabulary: VocabularyState }) => state.vocabulary.isLoading;
export const selectError = (state: { vocabulary: VocabularyState }) => state.vocabulary.error;

export default vocabularySlice.reducer; 