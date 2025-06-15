import { ViewStyle, TextStyle } from 'react-native';
import { InputProps } from '../../atoms/Input/Input.types';

/**
 * Search result item structure
 */
export interface SearchResultItem {
  /** Unique identifier */
  id: string;
  /** Display text */
  text: string;
  /** Chinese character (if applicable) */
  character?: string;
  /** Pinyin pronunciation */
  pinyin?: string;
  /** Tone number (1-4, 0 for neutral) */
  tone?: number;
  /** English translation */
  english?: string;
  /** Vietnamese translation */
  vietnamese?: string;
  /** HSK level (1-6) */
  hskLevel?: number;
  /** Search result type */
  type: 'vocabulary' | 'lesson' | 'grammar' | 'character' | 'phrase' | 'user';
  /** Relevance score (0-1) */
  relevance?: number;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Search suggestion configuration
 */
export interface SearchSuggestionConfig {
  /** Enable search suggestions */
  enabled?: boolean;
  /** Maximum number of suggestions */
  maxSuggestions?: number;
  /** Minimum characters to trigger suggestions */
  minCharacters?: number;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
  /** Show recent searches */
  showRecent?: boolean;
  /** Show popular searches */
  showPopular?: boolean;
  /** Show HSK level in suggestions */
  showHSKLevel?: boolean;
  /** Show tone indicators */
  showTones?: boolean;
}

/**
 * Chinese input method configuration
 */
export interface ChineseSearchConfig {
  /** Enable pinyin to character conversion */
  pinyinConversion?: boolean;
  /** Enable fuzzy pinyin matching */
  fuzzyPinyin?: boolean;
  /** Enable tone-aware search */
  toneAware?: boolean;
  /** Enable radical search */
  radicalSearch?: boolean;
  /** Enable stroke count search */
  strokeSearch?: boolean;
  /** Character recognition confidence threshold */
  recognitionThreshold?: number;
}

/**
 * Voice search configuration
 */
export interface VoiceSearchConfig {
  /** Enable voice search */
  enabled?: boolean;
  /** Voice recognition language */
  language?: 'zh-CN' | 'en-US' | 'vi-VN';
  /** Recognition timeout in milliseconds */
  timeout?: number;
  /** Continuous listening mode */
  continuous?: boolean;
  /** Show voice animation */
  showAnimation?: boolean;
  /** Voice feedback */
  voiceFeedback?: boolean;
}

/**
 * Search filter options
 */
export interface SearchFilters {
  /** Filter by HSK level */
  hskLevels?: number[];
  /** Filter by content type */
  contentTypes?: SearchResultItem['type'][];
  /** Filter by difficulty */
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  /** Filter by lesson progress */
  progress?: 'not-started' | 'in-progress' | 'completed';
  /** Custom filters */
  custom?: Record<string, any>;
}

/**
 * Search analytics data
 */
export interface SearchAnalytics {
  /** Search query */
  query: string;
  /** Search timestamp */
  timestamp: Date;
  /** Results count */
  resultsCount: number;
  /** Selected result (if any) */
  selectedResult?: SearchResultItem;
  /** Search duration in milliseconds */
  duration: number;
  /** Search method used */
  method: 'text' | 'voice' | 'suggestion';
}

/**
 * Enhanced SearchBar component props
 */
export interface SearchBarProps extends Omit<InputProps, 'variant' | 'onChangeText'> {
  /**
   * Search placeholder text
   * @default "Tìm kiếm từ vựng, bài học..."
   */
  placeholder?: string;

  /**
   * Search value
   */
  value?: string;

  /**
   * Auto focus on mount
   * @default false
   */
  autoFocus?: boolean;

  /**
   * Show search icon
   * @default true
   */
  showSearchIcon?: boolean;

  /**
   * Show voice search button
   * @default true
   */
  showVoiceSearch?: boolean;

  /**
   * Show filter button
   * @default false
   */
  showFilters?: boolean;

  /**
   * Show clear button when typing
   * @default true
   */
  showClearButton?: boolean;

  /**
   * Search suggestions configuration
   */
  suggestions?: SearchSuggestionConfig;

  /**
   * Chinese input configuration
   */
  chineseConfig?: ChineseSearchConfig;

  /**
   * Voice search configuration
   */
  voiceConfig?: VoiceSearchConfig;

  /**
   * Current search filters
   */
  filters?: SearchFilters;

  /**
   * Search results data
   */
  results?: SearchResultItem[];

  /**
   * Loading state for search
   */
  searching?: boolean;

  /**
   * Show search results dropdown
   * @default true
   */
  showResults?: boolean;

  /**
   * Maximum height for results dropdown
   */
  maxResultsHeight?: number;

  /**
   * Enable search analytics
   * @default false
   */
  enableAnalytics?: boolean;

  /**
   * Custom container style
   */
  containerStyle?: ViewStyle;

  /**
   * Custom results container style
   */
  resultsContainerStyle?: ViewStyle;

  /**
   * Custom result item style
   */
  resultItemStyle?: ViewStyle;

  /**
   * Custom suggestion style
   */
  suggestionStyle?: ViewStyle;

  /**
   * Search change handler
   */
  onSearch?: (query: string) => void;

  /**
   * Search submit handler (when user presses search)
   */
  onSearchSubmit?: (query: string) => void;

  /**
   * Result selection handler
   */
  onResultSelect?: (result: SearchResultItem) => void;

  /**
   * Suggestion selection handler
   */
  onSuggestionSelect?: (suggestion: string) => void;

  /**
   * Voice search start handler
   */
  onVoiceSearchStart?: () => void;

  /**
   * Voice search result handler
   */
  onVoiceSearchResult?: (transcript: string, confidence: number) => void;

  /**
   * Voice search error handler
   */
  onVoiceSearchError?: (error: string) => void;

  /**
   * Filter change handler
   */
  onFiltersChange?: (filters: SearchFilters) => void;

  /**
   * Search analytics handler
   */
  onAnalytics?: (analytics: SearchAnalytics) => void;

  /**
   * Focus handler
   */
  onFocus?: () => void;

  /**
   * Blur handler
   */
  onBlur?: () => void;

  /**
   * Clear handler
   */
  onClear?: () => void;
}

/**
 * Internal SearchBar styles interface
 */
export interface SearchBarStyles {
  container: ViewStyle;
  searchContainer: ViewStyle;
  inputContainer: ViewStyle;
  searchIcon: ViewStyle;
  voiceButton: ViewStyle;
  filterButton: ViewStyle;
  clearButton: ViewStyle;
  resultsContainer: ViewStyle;
  resultsList: ViewStyle;
  resultItem: ViewStyle;
  resultText: TextStyle;
  resultMeta: TextStyle;
  suggestionItem: ViewStyle;
  suggestionText: TextStyle;
  noResults: ViewStyle;
  noResultsText: TextStyle;
  loadingContainer: ViewStyle;
  voiceAnimation: ViewStyle;
  filterBadge: ViewStyle;
  filterBadgeText: TextStyle;
  chineseCharacter: TextStyle;
  pinyinText: TextStyle;
  toneIndicator: ViewStyle;
  hskBadge: ViewStyle;
  hskBadgeText: TextStyle;
} 