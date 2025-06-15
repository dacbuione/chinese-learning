/**
 * Spaced Repetition Service using SM-2 Algorithm
 * 
 * This service implements the SuperMemo SM-2 algorithm for efficient vocabulary review.
 * It calculates optimal intervals between reviews based on recall difficulty.
 */

export interface ReviewRecord {
  wordId: string;
  easeFactor: number;      // Difficulty multiplier (1.3 - 2.5)
  interval: number;        // Days until next review
  repetitions: number;     // Number of successful reviews
  dueDate: Date;          // When the word should be reviewed
  lastReviewed: Date;     // Last review date
  totalReviews: number;   // Total number of reviews (including failed)
  correctReviews: number; // Number of correct reviews
  streak: number;         // Current correct streak
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
}

export interface ReviewResponse {
  quality: number; // 0-5 scale (0: complete blackout, 5: perfect response)
  responseTime: number; // Time taken to respond in milliseconds
  wasCorrect: boolean;
}

export class SpacedRepetitionService {
  private static readonly MIN_EASE_FACTOR = 1.3;
  private static readonly DEFAULT_EASE_FACTOR = 2.5;
  private static readonly EASE_FACTOR_MODIFIER = 0.1;
  private static readonly MIN_INTERVAL = 1;
  
  /**
   * Initialize a new review record for a word
   */
  static initializeWord(wordId: string): ReviewRecord {
    return {
      wordId,
      easeFactor: this.DEFAULT_EASE_FACTOR,
      interval: 1,
      repetitions: 0,
      dueDate: new Date(), // Due immediately for first review
      lastReviewed: new Date(),
      totalReviews: 0,
      correctReviews: 0,
      streak: 0,
      difficulty: 'medium',
    };
  }

  /**
   * Process a review response and update the review record using SM-2 algorithm
   */
  static processReview(
    record: ReviewRecord, 
    response: ReviewResponse
  ): ReviewRecord {
    const { quality, wasCorrect } = response;
    const newRecord = { ...record };
    
    // Update review counts
    newRecord.totalReviews += 1;
    newRecord.lastReviewed = new Date();
    
    if (wasCorrect) {
      newRecord.correctReviews += 1;
      newRecord.streak += 1;
    } else {
      newRecord.streak = 0;
      // Reset repetitions on failure
      newRecord.repetitions = 0;
    }

    // SM-2 Algorithm implementation
    if (quality >= 3) {
      // Correct response
      if (newRecord.repetitions === 0) {
        newRecord.interval = 1;
      } else if (newRecord.repetitions === 1) {
        newRecord.interval = 6;
      } else {
        newRecord.interval = Math.round(newRecord.interval * newRecord.easeFactor);
      }
      newRecord.repetitions += 1;
    } else {
      // Incorrect response - reset interval
      newRecord.repetitions = 0;
      newRecord.interval = 1;
    }

    // Update ease factor based on quality
    const newEaseFactor = newRecord.easeFactor + 
      (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    
    newRecord.easeFactor = Math.max(newEaseFactor, this.MIN_EASE_FACTOR);

    // Calculate next due date
    newRecord.dueDate = new Date();
    newRecord.dueDate.setDate(newRecord.dueDate.getDate() + newRecord.interval);

    // Update difficulty based on ease factor and streak
    newRecord.difficulty = this.calculateDifficulty(newRecord);

    return newRecord;
  }

  /**
   * Get words that are due for review
   */
  static getDueWords(records: ReviewRecord[]): ReviewRecord[] {
    const now = new Date();
    return records
      .filter(record => record.dueDate <= now)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  /**
   * Get words that need initial learning (never reviewed successfully)
   */
  static getNewWords(records: ReviewRecord[], limit: number = 5): ReviewRecord[] {
    return records
      .filter(record => record.repetitions === 0)
      .slice(0, limit);
  }

  /**
   * Calculate optimal review session size based on user performance
   */
  static getOptimalSessionSize(
    records: ReviewRecord[], 
    targetTime: number = 15 // minutes
  ): number {
    const avgTimePerWord = this.calculateAverageReviewTime(records);
    const maxWords = Math.floor((targetTime * 60 * 1000) / avgTimePerWord);
    
    // Ensure reasonable limits
    return Math.max(5, Math.min(maxWords, 30));
  }

  /**
   * Get review statistics for progress tracking
   */
  static getReviewStats(records: ReviewRecord[]): {
    totalWords: number;
    dueWords: number;
    masteredWords: number;
    averageAccuracy: number;
    averageEaseFactor: number;
    difficultyDistribution: Record<string, number>;
  } {
    const now = new Date();
    const dueWords = records.filter(r => r.dueDate <= now).length;
    const masteredWords = records.filter(r => r.repetitions >= 3 && r.easeFactor >= 2.0).length;
    
    const totalReviews = records.reduce((sum, r) => sum + r.totalReviews, 0);
    const correctReviews = records.reduce((sum, r) => sum + r.correctReviews, 0);
    const averageAccuracy = totalReviews > 0 ? (correctReviews / totalReviews) * 100 : 0;
    
    const averageEaseFactor = records.length > 0 
      ? records.reduce((sum, r) => sum + r.easeFactor, 0) / records.length 
      : this.DEFAULT_EASE_FACTOR;

    const difficultyDistribution = records.reduce((dist, record) => {
      dist[record.difficulty] = (dist[record.difficulty] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);

    return {
      totalWords: records.length,
      dueWords,
      masteredWords,
      averageAccuracy,
      averageEaseFactor,
      difficultyDistribution,
    };
  }

  /**
   * Predict when user will master a word (reach repetitions >= 3)
   */
  static predictMasteryDate(record: ReviewRecord): Date {
    let predictedRecord = { ...record };
    let iterations = 0;
    const maxIterations = 50; // Prevent infinite loops
    
    while (predictedRecord.repetitions < 3 && iterations < maxIterations) {
      // Simulate successful review (quality 4)
      predictedRecord = this.processReview(predictedRecord, {
        quality: 4,
        responseTime: 3000,
        wasCorrect: true,
      });
      iterations++;
    }
    
    return predictedRecord.dueDate;
  }

  /**
   * Calculate word difficulty based on ease factor and performance
   */
  private static calculateDifficulty(record: ReviewRecord): 'easy' | 'medium' | 'hard' | 'very_hard' {
    const { easeFactor, streak, totalReviews, correctReviews } = record;
    const accuracy = totalReviews > 0 ? correctReviews / totalReviews : 1;
    
    // High ease factor and good streak = easy
    if (easeFactor >= 2.2 && streak >= 3 && accuracy >= 0.8) {
      return 'easy';
    }
    
    // Very low ease factor or poor performance = very hard
    if (easeFactor <= 1.5 || (accuracy < 0.4 && totalReviews >= 3)) {
      return 'very_hard';
    }
    
    // Low ease factor or poor recent performance = hard
    if (easeFactor <= 1.8 || streak === 0 || accuracy < 0.6) {
      return 'hard';
    }
    
    return 'medium';
  }

  /**
   * Calculate average time per review for session planning
   */
  private static calculateAverageReviewTime(records: ReviewRecord[]): number {
    // Default to 5 seconds per word if no data
    const defaultTime = 5000;
    
    if (records.length === 0) return defaultTime;
    
    // Estimate based on difficulty distribution
    const diffDistribution = records.reduce((dist, record) => {
      dist[record.difficulty] = (dist[record.difficulty] || 0) + 1;
      return dist;
    }, {} as Record<string, number>);
    
    const total = records.length;
    const timeEstimates = {
      easy: 3000,      // 3 seconds
      medium: 5000,    // 5 seconds  
      hard: 8000,      // 8 seconds
      very_hard: 12000 // 12 seconds
    };
    
    const averageTime = Object.entries(diffDistribution).reduce((avgTime, [difficulty, count]) => {
      const timeForDifficulty = timeEstimates[difficulty as keyof typeof timeEstimates] || defaultTime;
      return avgTime + (timeForDifficulty * count / total);
    }, 0);
    
    return averageTime || defaultTime;
  }

  /**
   * Export review data for backup/sync
   */
  static exportReviewData(records: ReviewRecord[]): string {
    return JSON.stringify({
      version: '1.0',
      exportDate: new Date().toISOString(),
      records: records,
    });
  }

  /**
   * Import review data from backup/sync
   */
  static importReviewData(data: string): ReviewRecord[] {
    try {
      const parsed = JSON.parse(data);
      if (parsed.version && parsed.records) {
        // Convert date strings back to Date objects
        return parsed.records.map((record: any) => ({
          ...record,
          dueDate: new Date(record.dueDate),
          lastReviewed: new Date(record.lastReviewed),
        }));
      }
    } catch (error) {
      console.error('Failed to import review data:', error);
    }
    return [];
  }
} 