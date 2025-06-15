/**
 * Vocabulary Service for Chinese Learning App
 * 
 * Manages vocabulary data, HSK levels, pronunciation, and integration with spaced repetition
 */

import { SpacedRepetitionService, ReviewRecord } from './spacedRepetition';

export interface ChineseWord {
  id: string;
  simplified: string;      // 简体中文
  traditional?: string;    // 繁體中文 (optional)
  pinyin: string;         // Romanization with tones (e.g., "nǐ hǎo")
  pinyinNumbers: string;  // Pinyin with tone numbers (e.g., "ni3 hao3")
  english: string[];      // English translations
  vietnamese: string[];   // Vietnamese translations
  hskLevel: number;      // HSK level (1-6)
  category: VocabularyCategory;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];        // Topic tags (e.g., ['family', 'daily', 'greetings'])
  example?: ExampleSentence;
  radical?: string;      // Main radical for character learning
  strokeCount?: number;  // Number of strokes for writing practice
  frequency: number;     // Usage frequency (1-1000, higher = more common)
  audioUrl?: string;     // URL to pronunciation audio
  createdAt: Date;
  updatedAt: Date;
}

export interface ExampleSentence {
  simplified: string;
  traditional?: string;
  pinyin: string;
  english: string;
  vietnamese: string;
}

export interface VocabularyCategory {
  id: string;
  name: string;
  nameVi: string;  // Vietnamese name
  nameZh: string;  // Chinese name
  icon: string;    // Icon name for UI
  color: string;   // Color code for category
}

export interface VocabularyProgress {
  wordId: string;
  reviewRecord: ReviewRecord;
  isFavorite: boolean;
  lastPracticed: Date;
  practiceCount: number;
  masteryLevel: 'new' | 'learning' | 'review' | 'mastered';
  userNotes?: string;
}

export interface StudySession {
  id: string;
  startTime: Date;
  endTime?: Date;
  wordsStudied: string[];
  correctAnswers: number;
  totalAnswers: number;
  sessionType: 'review' | 'new_words' | 'mixed';
  targetTime: number; // minutes
  actualTime?: number; // minutes
}

export class VocabularyService {
  private static readonly MASTERY_THRESHOLD = 3; // Number of successful reviews for mastery
  private static readonly NEW_WORDS_PER_SESSION = 5;
  
  /**
   * Get all vocabulary categories
   */
  static getCategories(): VocabularyCategory[] {
    return [
      {
        id: 'greetings',
        name: 'Greetings',
        nameVi: 'Chào hỏi',
        nameZh: '问候',
        icon: 'hand-wave',
        color: '#3B82F6',
      },
      {
        id: 'numbers',
        name: 'Numbers',
        nameVi: 'Số đếm',
        nameZh: '数字',
        icon: 'calculator',
        color: '#10B981',
      },
      {
        id: 'family',
        name: 'Family',
        nameVi: 'Gia đình',
        nameZh: '家庭',
        icon: 'people',
        color: '#F59E0B',
      },
      {
        id: 'time',
        name: 'Time & Dates',
        nameVi: 'Thời gian',
        nameZh: '时间',
        icon: 'time',
        color: '#8B5CF6',
      },
      {
        id: 'food',
        name: 'Food & Drink',
        nameVi: 'Đồ ăn & thức uống',
        nameZh: '饮食',
        icon: 'restaurant',
        color: '#EF4444',
      },
      {
        id: 'colors',
        name: 'Colors',
        nameVi: 'Màu sắc',
        nameZh: '颜色',
        icon: 'color-palette',
        color: '#EC4899',
      },
      {
        id: 'body',
        name: 'Body Parts',
        nameVi: 'Bộ phận cơ thể',
        nameZh: '身体',
        icon: 'body',
        color: '#06B6D4',
      },
      {
        id: 'animals',
        name: 'Animals',
        nameVi: 'Động vật',
        nameZh: '动物',
        icon: 'paw',
        color: '#84CC16',
      },
      {
        id: 'emotions',
        name: 'Emotions',
        nameVi: 'Cảm xúc',
        nameZh: '情感',
        icon: 'happy',
        color: '#F97316',
      },
      {
        id: 'weather',
        name: 'Weather',
        nameVi: 'Thời tiết',
        nameZh: '天气',
        icon: 'partly-sunny',
        color: '#64748B',
      },
    ];
  }

  /**
   * Get HSK Level 1 vocabulary (most basic words)
   */
  static getHSK1Vocabulary(): ChineseWord[] {
    const categories = this.getCategories();
    const greetings = categories.find(c => c.id === 'greetings')!;
    const numbers = categories.find(c => c.id === 'numbers')!;
    const family = categories.find(c => c.id === 'family')!;
    const time = categories.find(c => c.id === 'time')!;

    return [
      // Greetings
      {
        id: 'word_1',
        simplified: '你好',
        pinyin: 'nǐ hǎo',
        pinyinNumbers: 'ni3 hao3',
        english: ['hello', 'hi'],
        vietnamese: ['xin chào', 'chào bạn'],
        hskLevel: 1,
        category: greetings,
        difficulty: 'beginner',
        tags: ['greetings', 'daily', 'essential'],
        example: {
          simplified: '你好，我是小明。',
          pinyin: 'nǐ hǎo, wǒ shì xiǎo míng.',
          english: 'Hello, I am Xiaoming.',
          vietnamese: 'Xin chào, tôi là Tiểu Minh.',
        },
        frequency: 1000,
        strokeCount: 10,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'word_2',
        simplified: '再见',
        pinyin: 'zài jiàn',
        pinyinNumbers: 'zai4 jian4',
        english: ['goodbye', 'see you later'],
        vietnamese: ['tạm biệt', 'hẹn gặp lại'],
        hskLevel: 1,
        category: greetings,
        difficulty: 'beginner',
        tags: ['greetings', 'farewell'],
        example: {
          simplified: '再见，明天见！',
          pinyin: 'zài jiàn, míng tiān jiàn!',
          english: 'Goodbye, see you tomorrow!',
          vietnamese: 'Tạm biệt, hẹn gặp ngày mai!',
        },
        frequency: 950,
        strokeCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'word_3',
        simplified: '谢谢',
        pinyin: 'xiè xiè',
        pinyinNumbers: 'xie4 xie4',
        english: ['thank you', 'thanks'],
        vietnamese: ['cảm ơn', 'cám ơn'],
        hskLevel: 1,
        category: greetings,
        difficulty: 'beginner',
        tags: ['greetings', 'politeness', 'essential'],
        example: {
          simplified: '谢谢你的帮助。',
          pinyin: 'xiè xiè nǐ de bāng zhù.',
          english: 'Thank you for your help.',
          vietnamese: 'Cảm ơn sự giúp đỡ của bạn.',
        },
        frequency: 900,
        strokeCount: 24,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Numbers
      {
        id: 'word_4',
        simplified: '一',
        pinyin: 'yī',
        pinyinNumbers: 'yi1',
        english: ['one', '1'],
        vietnamese: ['một', 'số một'],
        hskLevel: 1,
        category: numbers,
        difficulty: 'beginner',
        tags: ['numbers', 'counting', 'basic'],
        frequency: 1000,
        strokeCount: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'word_5',
        simplified: '二',
        pinyin: 'èr',
        pinyinNumbers: 'er4',
        english: ['two', '2'],
        vietnamese: ['hai', 'số hai'],
        hskLevel: 1,
        category: numbers,
        difficulty: 'beginner',
        tags: ['numbers', 'counting', 'basic'],
        frequency: 950,
        strokeCount: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'word_6',
        simplified: '三',
        pinyin: 'sān',
        pinyinNumbers: 'san1',
        english: ['three', '3'],
        vietnamese: ['ba', 'số ba'],
        hskLevel: 1,
        category: numbers,
        difficulty: 'beginner',
        tags: ['numbers', 'counting', 'basic'],
        frequency: 900,
        strokeCount: 3,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Family
      {
        id: 'word_7',
        simplified: '爸爸',
        pinyin: 'bà ba',
        pinyinNumbers: 'ba4 ba',
        english: ['father', 'dad', 'papa'],
        vietnamese: ['bố', 'ba', 'cha'],
        hskLevel: 1,
        category: family,
        difficulty: 'beginner',
        tags: ['family', 'people', 'relationships'],
        example: {
          simplified: '我爸爸很高。',
          pinyin: 'wǒ bà ba hěn gāo.',
          english: 'My father is very tall.',
          vietnamese: 'Bố tôi rất cao.',
        },
        frequency: 800,
        strokeCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'word_8',
        simplified: '妈妈',
        pinyin: 'mā ma',
        pinyinNumbers: 'ma1 ma',
        english: ['mother', 'mom', 'mama'],
        vietnamese: ['mẹ', 'má', 'mẹ hiền'],
        hskLevel: 1,
        category: family,
        difficulty: 'beginner',
        tags: ['family', 'people', 'relationships'],
        example: {
          simplified: '妈妈做饭很好吃。',
          pinyin: 'mā ma zuò fàn hěn hǎo chī.',
          english: 'Mom cooks very delicious food.',
          vietnamese: 'Mẹ nấu ăn rất ngon.',
        },
        frequency: 850,
        strokeCount: 6,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      // Time
      {
        id: 'word_9',
        simplified: '今天',
        pinyin: 'jīn tiān',
        pinyinNumbers: 'jin1 tian1',
        english: ['today'],
        vietnamese: ['hôm nay', 'ngày hôm nay'],
        hskLevel: 1,
        category: time,
        difficulty: 'beginner',
        tags: ['time', 'daily', 'temporal'],
        example: {
          simplified: '今天天气很好。',
          pinyin: 'jīn tiān tiān qì hěn hǎo.',
          english: 'The weather is very good today.',
          vietnamese: 'Hôm nay thời tiết rất đẹp.',
        },
        frequency: 900,
        strokeCount: 8,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: 'word_10',
        simplified: '明天',
        pinyin: 'míng tiān',
        pinyinNumbers: 'ming2 tian1',
        english: ['tomorrow'],
        vietnamese: ['ngày mai', 'mai'],
        hskLevel: 1,
        category: time,
        difficulty: 'beginner',
        tags: ['time', 'future', 'temporal'],
        example: {
          simplified: '明天我要去学校。',
          pinyin: 'míng tiān wǒ yào qù xué xiào.',
          english: 'Tomorrow I will go to school.',
          vietnamese: 'Ngày mai tôi sẽ đi học.',
        },
        frequency: 850,
        strokeCount: 12,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];
  }

  /**
   * Filter vocabulary by various criteria
   */
  static filterVocabulary(
    words: ChineseWord[],
    filters: {
      hskLevel?: number;
      category?: string;
      difficulty?: string;
      tags?: string[];
      searchQuery?: string;
    }
  ): ChineseWord[] {
    let filtered = words;

    if (filters.hskLevel) {
      filtered = filtered.filter(word => word.hskLevel === filters.hskLevel);
    }

    if (filters.category) {
      filtered = filtered.filter(word => word.category.id === filters.category);
    }

    if (filters.difficulty) {
      filtered = filtered.filter(word => word.difficulty === filters.difficulty);
    }

    if (filters.tags && filters.tags.length > 0) {
      filtered = filtered.filter(word => 
        filters.tags!.some(tag => word.tags.includes(tag))
      );
    }

    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(word => 
        word.simplified.includes(query) ||
        word.pinyin.toLowerCase().includes(query) ||
        word.english.some(eng => eng.toLowerCase().includes(query)) ||
        word.vietnamese.some(vi => vi.toLowerCase().includes(query)) ||
        word.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }

  /**
   * Get recommended words for review based on spaced repetition
   */
  static getRecommendedWords(
    allWords: ChineseWord[],
    progressRecords: VocabularyProgress[],
    maxWords: number = 20
  ): ChineseWord[] {
    const progressMap = new Map(progressRecords.map(p => [p.wordId, p]));
    
    // Get due words from spaced repetition
    const reviewRecords = progressRecords.map(p => p.reviewRecord);
    const dueWords = SpacedRepetitionService.getDueWords(reviewRecords);
    const newWords = SpacedRepetitionService.getNewWords(reviewRecords, 5);
    
    // Combine due and new words
    const recommendedWordIds = [
      ...dueWords.slice(0, Math.floor(maxWords * 0.7)).map(r => r.wordId),
      ...newWords.slice(0, Math.floor(maxWords * 0.3)).map(r => r.wordId),
    ];
    
    return allWords.filter(word => recommendedWordIds.includes(word.id));
  }

  /**
   * Initialize progress for a new word
   */
  static initializeProgress(wordId: string): VocabularyProgress {
    return {
      wordId,
      reviewRecord: SpacedRepetitionService.initializeWord(wordId),
      isFavorite: false,
      lastPracticed: new Date(),
      practiceCount: 0,
      masteryLevel: 'new',
      userNotes: undefined,
    };
  }

  /**
   * Update progress after a practice session
   */
  static updateProgress(
    progress: VocabularyProgress,
    wasCorrect: boolean,
    responseTime: number,
    quality: number
  ): VocabularyProgress {
    const updatedProgress = { ...progress };
    
    // Update review record using spaced repetition
    updatedProgress.reviewRecord = SpacedRepetitionService.processReview(
      progress.reviewRecord,
      { quality, responseTime, wasCorrect }
    );
    
    // Update other progress fields
    updatedProgress.lastPracticed = new Date();
    updatedProgress.practiceCount += 1;
    
    // Update mastery level
    updatedProgress.masteryLevel = this.calculateMasteryLevel(updatedProgress.reviewRecord);
    
    return updatedProgress;
  }

  /**
   * Calculate mastery level based on review record
   */
  private static calculateMasteryLevel(
    record: ReviewRecord
  ): 'new' | 'learning' | 'review' | 'mastered' {
    if (record.repetitions === 0) {
      return 'new';
    } else if (record.repetitions < this.MASTERY_THRESHOLD) {
      return 'learning';
    } else if (record.easeFactor >= 2.0) {
      return 'mastered';
    } else {
      return 'review';
    }
  }

  /**
   * Get vocabulary statistics
   */
  static getVocabularyStats(
    allWords: ChineseWord[],
    progressRecords: VocabularyProgress[]
  ): {
    totalWords: number;
    learnedWords: number;
    masteredWords: number;
    dueForReview: number;
    favoriteWords: number;
    averageAccuracy: number;
    hskDistribution: Record<number, number>;
    categoryDistribution: Record<string, number>;
  } {
    const progressMap = new Map(progressRecords.map(p => [p.wordId, p]));
    const reviewRecords = progressRecords.map(p => p.reviewRecord);
    
    const reviewStats = SpacedRepetitionService.getReviewStats(reviewRecords);
    const learnedWords = progressRecords.filter(p => p.masteryLevel !== 'new').length;
    const masteredWords = progressRecords.filter(p => p.masteryLevel === 'mastered').length;
    const favoriteWords = progressRecords.filter(p => p.isFavorite).length;
    
    const hskDistribution = allWords.reduce((dist, word) => {
      dist[word.hskLevel] = (dist[word.hskLevel] || 0) + 1;
      return dist;
    }, {} as Record<number, number>);
    
    const categoryDistribution = allWords.reduce((dist, word) => {
      dist[word.category.name] = (dist[word.category.name] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
    
    return {
      totalWords: allWords.length,
      learnedWords,
      masteredWords,
      dueForReview: reviewStats.dueWords,
      favoriteWords,
      averageAccuracy: reviewStats.averageAccuracy,
      hskDistribution,
      categoryDistribution,
    };
  }

  /**
   * Generate study session plan
   */
  static generateStudySession(
    allWords: ChineseWord[],
    progressRecords: VocabularyProgress[],
    targetTime: number = 15, // minutes
    sessionType: 'review' | 'new_words' | 'mixed' = 'mixed'
  ): {
    words: ChineseWord[];
    estimatedTime: number;
    sessionType: string;
  } {
    const reviewRecords = progressRecords.map(p => p.reviewRecord);
    const optimalSize = SpacedRepetitionService.getOptimalSessionSize(reviewRecords, targetTime);
    
    let selectedWords: ChineseWord[] = [];
    
    switch (sessionType) {
      case 'review':
        selectedWords = this.getRecommendedWords(allWords, progressRecords, optimalSize)
          .filter(word => {
            const progress = progressRecords.find(p => p.wordId === word.id);
            return progress && progress.masteryLevel !== 'new';
          });
        break;
        
      case 'new_words':
        selectedWords = this.getRecommendedWords(allWords, progressRecords, optimalSize)
          .filter(word => {
            const progress = progressRecords.find(p => p.wordId === word.id);
            return !progress || progress.masteryLevel === 'new';
          });
        break;
        
      case 'mixed':
      default:
        selectedWords = this.getRecommendedWords(allWords, progressRecords, optimalSize);
        break;
    }
    
    const estimatedTime = Math.ceil(selectedWords.length * 0.75); // 45 seconds per word average
    
    return {
      words: selectedWords,
      estimatedTime,
      sessionType,
    };
  }
} 