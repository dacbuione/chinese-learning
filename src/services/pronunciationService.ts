/**
 * Pronunciation Service for Chinese Learning
 * 
 * Handles tone recognition, pronunciation scoring, and audio feedback
 */

export interface ToneInfo {
  number: number;
  name: string;
  nameVi: string;
  nameZh: string;
  description: string;
  color: string;
  marker: string; // Tone mark character
  examples: string[]; // Example characters with this tone
}

export interface PronunciationResult {
  isCorrect: boolean;
  selectedTone: number;
  correctTone: number;
  accuracy: number; // 0-100 percentage
  feedback: string;
  suggestion?: string;
}

export interface PronunciationProgress {
  userId: string;
  totalAttempts: number;
  correctAttempts: number;
  toneAccuracy: Record<number, number>; // Accuracy for each tone (1-4)
  streakCount: number;
  averageResponseTime: number;
  weakTones: number[]; // Tones that need more practice
  lastPracticed: Date;
}

export class PronunciationService {
  private static readonly TONE_MARKS = {
    1: ['ā', 'ē', 'ī', 'ō', 'ū', 'ǖ'], // First tone - high level
    2: ['á', 'é', 'í', 'ó', 'ú', 'ǘ'], // Second tone - rising
    3: ['ǎ', 'ě', 'ǐ', 'ǒ', 'ǔ', 'ǚ'], // Third tone - falling-rising
    4: ['à', 'è', 'ì', 'ò', 'ù', 'ǜ'], // Fourth tone - falling
  };

  /**
   * Get all tone information
   */
  static getToneInfo(): ToneInfo[] {
    return [
      {
        number: 1,
        name: 'First Tone',
        nameVi: 'Thanh Ngang',
        nameZh: '一声',
        description: 'High level tone - Âm bằng cao, ổn định',
        color: '#DC2626', // Red
        marker: 'ā',
        examples: ['妈', '天', '高', '书'],
      },
      {
        number: 2,
        name: 'Second Tone',
        nameVi: 'Thanh Sắc',
        nameZh: '二声',
        description: 'Rising tone - Âm lên từ trung bình đến cao',
        color: '#F59E0B', // Yellow/Orange
        marker: 'á',
        examples: ['麻', '人', '来', '十'],
      },
      {
        number: 3,
        name: 'Third Tone',
        nameVi: 'Thanh Huyền',
        nameZh: '三声',
        description: 'Falling-rising tone - Âm xuống rồi lên',
        color: '#10B981', // Green
        marker: 'ǎ',
        examples: ['马', '好', '我', '水'],
      },
      {
        number: 4,
        name: 'Fourth Tone',
        nameVi: 'Thanh Nặng',
        nameZh: '四声',
        description: 'Falling tone - Âm xuống từ cao đến thấp',
        color: '#3B82F6', // Blue
        marker: 'à',
        examples: ['骂', '是', '爱', '大'],
      },
    ];
  }

  /**
   * Extract tone number from pinyin string
   */
  static extractTone(pinyin: string): number {
    const cleanPinyin = pinyin.toLowerCase().trim();
    
    // Check for tone marks
    for (const [tone, marks] of Object.entries(this.TONE_MARKS)) {
      for (const mark of marks) {
        if (cleanPinyin.includes(mark)) {
          return parseInt(tone);
        }
      }
    }
    
    // Check for tone numbers (backup method)
    const toneMatch = cleanPinyin.match(/(\d)$/);
    if (toneMatch) {
      const toneNum = parseInt(toneMatch[1]);
      return toneNum >= 1 && toneNum <= 4 ? toneNum : 1;
    }
    
    // Default to neutral/first tone if no marker found
    return 1;
  }

  /**
   * Check if pronunciation is correct
   */
  static checkPronunciation(
    userSelection: number,
    correctPinyin: string,
    responseTime: number
  ): PronunciationResult {
    const correctTone = this.extractTone(correctPinyin);
    const isCorrect = userSelection === correctTone;
    
    // Calculate accuracy based on correctness and response time
    let accuracy = isCorrect ? 100 : 0;
    
    if (isCorrect) {
      // Bonus for quick responses (under 3 seconds)
      if (responseTime < 3000) {
        accuracy = Math.min(100, accuracy + 10);
      }
      // Penalty for very slow responses (over 10 seconds)
      if (responseTime > 10000) {
        accuracy = Math.max(60, accuracy - 20);
      }
    } else {
      // Partial credit for close tones
      const toneDifference = Math.abs(userSelection - correctTone);
      if (toneDifference === 1) {
        accuracy = 25; // Close guess
      } else if (toneDifference === 2) {
        accuracy = 15; // Somewhat close
      } else {
        accuracy = 5; // Very wrong
      }
    }

    const feedback = this.generateFeedback(userSelection, correctTone, isCorrect);
    const suggestion = this.generateSuggestion(userSelection, correctTone);

    return {
      isCorrect,
      selectedTone: userSelection,
      correctTone,
      accuracy,
      feedback,
      suggestion: isCorrect ? undefined : suggestion,
    };
  }

  /**
   * Generate feedback message
   */
  private static generateFeedback(
    selected: number,
    correct: number,
    isCorrect: boolean
  ): string {
    if (isCorrect) {
      const encouragements = [
        'Xuất sắc! Bạn đã nhận biết đúng thanh điệu!',
        'Tuyệt vời! Giọng điệu chính xác!',
        'Chính xác! Bạn đang làm rất tốt!',
        'Hoàn hảo! Tiếp tục như vậy!',
        'Đúng rồi! Khả năng nhận biết thanh của bạn đang tiến bộ!',
      ];
      return encouragements[Math.floor(Math.random() * encouragements.length)];
    } else {
      const tones = this.getToneInfo();
      const selectedTone = tones.find(t => t.number === selected);
      const correctTone = tones.find(t => t.number === correct);
      
      return `Bạn đã chọn ${selectedTone?.nameVi} nhưng đáp án đúng là ${correctTone?.nameVi}. ${correctTone?.description}`;
    }
  }

  /**
   * Generate improvement suggestion
   */
  private static generateSuggestion(selected: number, correct: number): string {
    const suggestions: Record<string, string> = {
      '1-2': 'Thanh ngang (1) là âm bằng cao, còn thanh sắc (2) là âm lên. Hãy chú ý sự thay đổi cao độ.',
      '1-3': 'Thanh ngang (1) giữ cao độ ổn định, thanh huyền (3) có sự uốn lượn xuống rồi lên.',
      '1-4': 'Thanh ngang (1) là âm bằng, thanh nặng (4) là âm xuống mạnh và ngắn.',
      '2-1': 'Thanh sắc (2) có xu hướng lên cao, thanh ngang (1) giữ ổn định ở mức cao.',
      '2-3': 'Thanh sắc (2) lên thẳng, thanh huyền (3) có sự uốn cong xuống rồi lên.',
      '2-4': 'Thanh sắc (2) lên cao, thanh nặng (4) xuống thấp - hoàn toàn đối lập.',
      '3-1': 'Thanh huyền (3) có sự biến đổi phức tạp, thanh ngang (1) đơn giản và ổn định.',
      '3-2': 'Thanh huyền (3) uốn cong, thanh sắc (2) đi lên thẳng.',
      '3-4': 'Thanh huyền (3) xuống rồi lên, thanh nặng (4) chỉ xuống.',
      '4-1': 'Thanh nặng (4) giảm nhanh và mạnh, thanh ngang (1) giữ cao độ ổn định.',
      '4-2': 'Thanh nặng (4) xuống, thanh sắc (2) lên - ngược chiều nhau.',
      '4-3': 'Thanh nặng (4) xuống thẳng, thanh huyền (3) xuống rồi lên.',
    };

    const key = `${selected}-${correct}`;
    return suggestions[key] || 'Hãy lắng nghe kỹ và cảm nhận sự thay đổi cao độ của giọng nói.';
  }

  /**
   * Update pronunciation progress
   */
  static updateProgress(
    currentProgress: PronunciationProgress,
    result: PronunciationResult,
    responseTime: number
  ): PronunciationProgress {
    const updatedProgress = { ...currentProgress };
    
    // Update counters
    updatedProgress.totalAttempts += 1;
    if (result.isCorrect) {
      updatedProgress.correctAttempts += 1;
      updatedProgress.streakCount += 1;
    } else {
      updatedProgress.streakCount = 0;
    }
    
    // Update tone-specific accuracy
    const tone = result.correctTone;
    const currentAccuracy = updatedProgress.toneAccuracy[tone] || 0;
    const attempts = Math.floor(currentAccuracy / 10) || 1; // Rough estimate of attempts
    const newAccuracy = result.isCorrect ? 
      (currentAccuracy * attempts + 100) / (attempts + 1) :
      (currentAccuracy * attempts + 0) / (attempts + 1);
    
    updatedProgress.toneAccuracy[tone] = Math.round(newAccuracy);
    
    // Update average response time
    const totalTime = updatedProgress.averageResponseTime * (updatedProgress.totalAttempts - 1);
    updatedProgress.averageResponseTime = Math.round((totalTime + responseTime) / updatedProgress.totalAttempts);
    
    // Identify weak tones (accuracy < 70%)
    updatedProgress.weakTones = Object.entries(updatedProgress.toneAccuracy)
      .filter(([_, accuracy]) => accuracy < 70)
      .map(([tone, _]) => parseInt(tone));
    
    updatedProgress.lastPracticed = new Date();
    
    return updatedProgress;
  }

  /**
   * Get practice recommendations based on progress
   */
  static getPracticeRecommendations(progress: PronunciationProgress): {
    focusTones: number[];
    recommendedSessionLength: number;
    difficultyLevel: 'beginner' | 'intermediate' | 'advanced';
    tips: string[];
  } {
    const overallAccuracy = progress.totalAttempts > 0 ? 
      (progress.correctAttempts / progress.totalAttempts) * 100 : 0;
    
    let difficultyLevel: 'beginner' | 'intermediate' | 'advanced' = 'beginner';
    if (overallAccuracy >= 80) {
      difficultyLevel = 'advanced';
    } else if (overallAccuracy >= 60) {
      difficultyLevel = 'intermediate';
    }
    
    // Focus on weak tones, or all tones if no specific weaknesses
    const focusTones = progress.weakTones.length > 0 ? 
      progress.weakTones : [1, 2, 3, 4];
    
    // Recommend session length based on performance
    let recommendedSessionLength = 15; // minutes
    if (difficultyLevel === 'beginner') {
      recommendedSessionLength = 10;
    } else if (difficultyLevel === 'advanced') {
      recommendedSessionLength = 20;
    }
    
    // Generate tips based on weak areas
    const tips = this.generateTips(progress, difficultyLevel);
    
    return {
      focusTones,
      recommendedSessionLength,
      difficultyLevel,
      tips,
    };
  }

  /**
   * Generate personalized tips
   */
  private static generateTips(
    progress: PronunciationProgress,
    level: 'beginner' | 'intermediate' | 'advanced'
  ): string[] {
    const tips: string[] = [];
    
    // General tips based on level
    if (level === 'beginner') {
      tips.push('Bắt đầu bằng cách nghe và lặp lại từng thanh điệu một cách chậm rãi.');
      tips.push('Sử dụng tay để vẽ hình thanh điệu trong không khí khi luyện tập.');
    } else if (level === 'intermediate') {
      tips.push('Thử luyện tập với các từ có thanh điệu khó phân biệt.');
      tips.push('Chú ý đến ngữ cảnh và cách thanh điệu thay đổi trong câu.');
    } else {
      tips.push('Luyện tập với các câu phức tạp và thanh điệu liên tiếp.');
      tips.push('Thử thách bản thân với tốc độ nói nhanh hơn.');
    }
    
    // Specific tips for weak tones
    const toneNames = ['', 'thanh ngang', 'thanh sắc', 'thanh huyền', 'thanh nặng'];
    progress.weakTones.forEach(tone => {
      if (tone >= 1 && tone <= 4) {
        tips.push(`Tập trung luyện ${toneNames[tone]} - hãy nghe nhiều ví dụ và so sánh với các thanh khác.`);
      }
    });
    
    // Response time tips
    if (progress.averageResponseTime > 8000) {
      tips.push('Hãy cố gắng phản xạ nhanh hơn - việc nhận biết thanh điệu sẽ trở nên tự nhiên với thời gian.');
    } else if (progress.averageResponseTime < 2000) {
      tips.push('Bạn phản ứng rất nhanh! Hãy đảm bảo độ chính xác cao hơn tốc độ.');
    }
    
    return tips.slice(0, 3); // Return max 3 tips
  }

  /**
   * Generate practice session with recommended words
   */
  static generatePracticeSession(
    allWords: any[],
    progress: PronunciationProgress,
    sessionLength: number = 15
  ): {
    words: any[];
    focusTones: number[];
    estimatedTime: number;
  } {
    const recommendations = this.getPracticeRecommendations(progress);
    const wordsPerMinute = recommendations.difficultyLevel === 'beginner' ? 3 : 
                          recommendations.difficultyLevel === 'intermediate' ? 4 : 5;
    
    const targetWordCount = Math.floor(sessionLength * wordsPerMinute);
    
    // Filter words by focus tones
    const relevantWords = allWords.filter(word => {
      const tone = this.extractTone(word.pinyin);
      return recommendations.focusTones.includes(tone);
    });
    
    // Select words (prioritize weak tones)
    const selectedWords = this.selectWordsForPractice(
      relevantWords,
      progress,
      targetWordCount
    );
    
    return {
      words: selectedWords,
      focusTones: recommendations.focusTones,
      estimatedTime: Math.ceil(selectedWords.length / wordsPerMinute),
    };
  }

  /**
   * Select optimal words for practice based on user progress
   */
  private static selectWordsForPractice(
    words: any[],
    progress: PronunciationProgress,
    count: number
  ): any[] {
    // Sort words by priority (weak tones first, then random)
    const sortedWords = words.sort((a, b) => {
      const toneA = this.extractTone(a.pinyin);
      const toneB = this.extractTone(b.pinyin);
      
      const isWeakA = progress.weakTones.includes(toneA);
      const isWeakB = progress.weakTones.includes(toneB);
      
      if (isWeakA && !isWeakB) return -1;
      if (!isWeakA && isWeakB) return 1;
      
      return Math.random() - 0.5; // Random for same priority
    });
    
    return sortedWords.slice(0, count);
  }

  /**
   * Export pronunciation data for analytics
   */
  static exportProgressData(progress: PronunciationProgress): string {
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      progress,
      summary: {
        overallAccuracy: progress.totalAttempts > 0 ? 
          Math.round((progress.correctAttempts / progress.totalAttempts) * 100) : 0,
        strongestTone: this.getStrongestTone(progress),
        weakestTone: this.getWeakestTone(progress),
        improvementAreas: this.getPracticeRecommendations(progress).tips,
      },
    });
  }

  /**
   * Get user's strongest tone
   */
  private static getStrongestTone(progress: PronunciationProgress): number {
    let bestTone = 1;
    let bestAccuracy = 0;
    
    for (const [tone, accuracy] of Object.entries(progress.toneAccuracy)) {
      if (accuracy > bestAccuracy) {
        bestAccuracy = accuracy;
        bestTone = parseInt(tone);
      }
    }
    
    return bestTone;
  }

  /**
   * Get user's weakest tone
   */
  private static getWeakestTone(progress: PronunciationProgress): number {
    let worstTone = 1;
    let worstAccuracy = 100;
    
    for (const [tone, accuracy] of Object.entries(progress.toneAccuracy)) {
      if (accuracy < worstAccuracy) {
        worstAccuracy = accuracy;
        worstTone = parseInt(tone);
      }
    }
    
    return worstTone;
  }
} 