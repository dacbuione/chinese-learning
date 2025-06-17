export interface PronunciationResult {
  accuracy: number;          // 0-100 (percentage)
  confidence: number;        // 0-1 (confidence score)
  detectedText: string;      // What was actually heard
  expectedText: string;      // What should have been said
  feedback: string;          // User-friendly feedback message
  suggestions: string[];     // Improvement suggestions
  score: 'excellent' | 'good' | 'fair' | 'poor'; // Overall score
  details: {
    characterAccuracy: number;  // Character-level accuracy
    toneAccuracy: number;       // Tone accuracy (for Chinese)
    fluency: number;           // Speaking fluency
    timing: number;            // Response time in ms
  };
}

export interface ChineseCharacterMatch {
  expected: string;
  detected: string;
  similarity: number;
  isCorrect: boolean;
}

export class PronunciationEvaluationService {
  
  /**
   * Main evaluation function for pronunciation
   */
  static async evaluatePronunciation(
    transcript: string,
    expected: string,
    language: 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' = 'zh-CN'
  ): Promise<PronunciationResult> {
    
    // Clean and normalize input
    const cleanTranscript = this.cleanText(transcript);
    const cleanExpected = this.cleanText(expected);
    
    // Calculate various accuracy metrics
    const characterAccuracy = this.calculateCharacterAccuracy(cleanTranscript, cleanExpected);
    const overallSimilarity = this.calculateLevenshteinSimilarity(cleanTranscript, cleanExpected);
    const toneAccuracy = language.startsWith('zh') 
      ? this.estimateToneAccuracy(cleanTranscript, cleanExpected)
      : 1.0;
    
    // Calculate fluency based on length and content
    const fluency = this.calculateFluency(cleanTranscript, cleanExpected);
    
    // Generate overall accuracy score
    const accuracy = this.calculateOverallAccuracy({
      characterAccuracy,
      similarity: overallSimilarity,
      toneAccuracy,
      fluency
    });
    
    // Determine confidence based on transcript quality
    const confidence = this.calculateConfidence(cleanTranscript, cleanExpected);
    
    // Generate feedback and suggestions
    const feedback = this.generateFeedback(accuracy, characterAccuracy, toneAccuracy);
    const suggestions = this.generateSuggestions(cleanTranscript, cleanExpected, accuracy);
    const score = this.getScoreLevel(accuracy);
    
    return {
      accuracy: Math.round(accuracy * 100),
      confidence,
      detectedText: cleanTranscript,
      expectedText: cleanExpected,
      feedback,
      suggestions,
      score,
      details: {
        characterAccuracy: Math.round(characterAccuracy * 100),
        toneAccuracy: Math.round(toneAccuracy * 100),
        fluency: Math.round(fluency * 100),
        timing: 0 // Will be set by caller
      }
    };
  }
  
  /**
   * Clean and normalize text for comparison
   */
  private static cleanText(text: string): string {
    return text
      .trim()
      .toLowerCase()
      .replace(/[^\u4e00-\u9fff\u3400-\u4dbf\w\s]/g, '') // Keep Chinese characters, letters, numbers, spaces
      .replace(/\s+/g, ' '); // Normalize whitespace
  }
  
  /**
   * Calculate character-level accuracy for Chinese text
   */
  private static calculateCharacterAccuracy(transcript: string, expected: string): number {
    if (!expected || expected.length === 0) return 0;
    if (!transcript || transcript.length === 0) return 0;
    
    const expectedChars = Array.from(expected);
    const transcriptChars = Array.from(transcript);
    
    let correctChars = 0;
    let totalChars = expectedChars.length;
    
    // Use dynamic programming for optimal character matching
    const matches = this.findOptimalCharacterMatches(transcriptChars, expectedChars);
    
    matches.forEach(match => {
      if (match.isCorrect) {
        correctChars++;
      }
    });
    
    return correctChars / totalChars;
  }
  
  /**
   * Find optimal character matches using dynamic programming
   */
  private static findOptimalCharacterMatches(
    transcript: string[], 
    expected: string[]
  ): ChineseCharacterMatch[] {
    const matches: ChineseCharacterMatch[] = [];
    
    // Simple approach: compare each expected character with closest match in transcript
    for (let i = 0; i < expected.length; i++) {
      const expectedChar = expected[i];
      let bestMatch = '';
      let bestSimilarity = 0;
      
      // Find best matching character in transcript
      for (const transcriptChar of transcript) {
        const similarity = this.calculateCharacterSimilarity(transcriptChar, expectedChar);
        if (similarity > bestSimilarity) {
          bestSimilarity = similarity;
          bestMatch = transcriptChar;
        }
      }
      
      matches.push({
        expected: expectedChar,
        detected: bestMatch,
        similarity: bestSimilarity,
        isCorrect: bestSimilarity > 0.8 // Threshold for correctness
      });
    }
    
    return matches;
  }
  
  /**
   * Calculate similarity between two Chinese characters
   */
  private static calculateCharacterSimilarity(char1: string, char2: string): number {
    if (char1 === char2) return 1.0;
    
    // For Chinese characters, we can implement more sophisticated comparison
    // For now, use exact match or common character confusions
    const commonConfusions: { [key: string]: string[] } = {
      '他': ['她', '它'],
      '的': ['得', '地'],
      '在': ['再'],
      '做': ['作'],
      '那': ['哪'],
      '这': ['者']
    };
    
    if (commonConfusions[char1]?.includes(char2) || 
        commonConfusions[char2]?.includes(char1)) {
      return 0.7; // Partial credit for common confusions
    }
    
    return 0.0;
  }
  
  /**
   * Calculate Levenshtein similarity between two strings
   */
  private static calculateLevenshteinSimilarity(str1: string, str2: string): number {
    const longer = str1.length > str2.length ? str1 : str2;
    const shorter = str1.length > str2.length ? str2 : str1;
    
    if (longer.length === 0) return 1.0;
    
    const distance = this.levenshteinDistance(longer, shorter);
    return (longer.length - distance) / longer.length;
  }
  
  /**
   * Calculate Levenshtein distance between two strings
   */
  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
    
    for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= str2.length; j++) {
      for (let i = 1; i <= str1.length; i++) {
        const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,     // deletion
          matrix[j - 1][i] + 1,     // insertion
          matrix[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    
    return matrix[str2.length][str1.length];
  }
  
  /**
   * Estimate tone accuracy for Chinese pronunciation
   */
  private static estimateToneAccuracy(transcript: string, expected: string): number {
    // This is a simplified estimation since we don't have audio analysis
    // In a real implementation, you would analyze pitch patterns
    
    // For now, use character accuracy as a proxy
    const charAccuracy = this.calculateCharacterAccuracy(transcript, expected);
    
    // Apply some penalty for tone-sensitive characters
    const toneSensitiveChars = ['妈', '麻', '马', '骂', '吗']; // ma with different tones
    let tonePenalty = 0;
    
    for (const char of toneSensitiveChars) {
      if (expected.includes(char) && !transcript.includes(char)) {
        tonePenalty += 0.1;
      }
    }
    
    return Math.max(0, charAccuracy - tonePenalty);
  }
  
  /**
   * Calculate fluency score based on speech characteristics
   */
  private static calculateFluency(transcript: string, expected: string): number {
    if (!transcript || transcript.length === 0) return 0;
    
    // Length ratio - penalize too short or too long responses
    const lengthRatio = transcript.length / expected.length;
    const lengthScore = lengthRatio > 0.5 && lengthRatio < 2.0 ? 1.0 : 0.7;
    
    // Word completeness - check if words are complete
    const expectedWords = expected.split(' ');
    const transcriptWords = transcript.split(' ');
    const wordCompletenessScore = transcriptWords.length / expectedWords.length;
    
    return Math.min(1.0, (lengthScore + Math.min(1.0, wordCompletenessScore)) / 2);
  }
  
  /**
   * Calculate overall accuracy from component scores
   */
  private static calculateOverallAccuracy(scores: {
    characterAccuracy: number;
    similarity: number;
    toneAccuracy: number;
    fluency: number;
  }): number {
    // Weighted average of different accuracy components
    const weights = {
      characterAccuracy: 0.4,  // Most important for Chinese
      similarity: 0.3,         // Overall similarity
      toneAccuracy: 0.2,       // Tone accuracy for Chinese
      fluency: 0.1            // Speech fluency
    };
    
    return (
      scores.characterAccuracy * weights.characterAccuracy +
      scores.similarity * weights.similarity +
      scores.toneAccuracy * weights.toneAccuracy +
      scores.fluency * weights.fluency
    );
  }
  
  /**
   * Calculate confidence score based on transcript quality
   */
  private static calculateConfidence(transcript: string, expected: string): number {
    if (!transcript || transcript.length === 0) return 0;
    
    // Higher confidence for longer, more complete transcripts
    const lengthFactor = Math.min(1.0, transcript.length / expected.length);
    const contentFactor = transcript.trim().length > 0 ? 1.0 : 0.5;
    
    return lengthFactor * contentFactor;
  }
  
  /**
   * Generate user-friendly feedback message
   */
  private static generateFeedback(accuracy: number, charAccuracy: number, toneAccuracy: number): string {
    if (accuracy >= 0.9) {
      return '🎉 Xuất sắc! Phát âm của bạn rất chính xác.';
    } else if (accuracy >= 0.8) {
      return '👍 Tốt lắm! Phát âm của bạn khá chính xác.';
    } else if (accuracy >= 0.6) {
      return '👌 Khá tốt! Hãy luyện tập thêm để cải thiện.';
    } else if (accuracy >= 0.4) {
      return '💪 Cần cải thiện. Hãy nghe và lặp lại nhiều lần.';
    } else {
      return '🔄 Hãy thử lại. Nói chậm và rõ ràng hơn.';
    }
  }
  
  /**
   * Generate improvement suggestions
   */
  private static generateSuggestions(transcript: string, expected: string, accuracy: number): string[] {
    const suggestions: string[] = [];
    
    if (accuracy < 0.5) {
      suggestions.push('Nói chậm hơn và rõ ràng hơn');
      suggestions.push('Đảm bảo microphone hoạt động tốt');
    }
    
    if (transcript.length < expected.length * 0.5) {
      suggestions.push('Nói đầy đủ các từ trong câu');
    }
    
    if (accuracy < 0.8) {
      suggestions.push('Luyện tập thanh điệu tiếng Trung');
      suggestions.push('Nghe và bắt chước người bản xứ');
    }
    
    if (suggestions.length === 0) {
      suggestions.push('Tiếp tục luyện tập để duy trì trình độ');
    }
    
    return suggestions;
  }
  
  /**
   * Get score level based on accuracy
   */
  private static getScoreLevel(accuracy: number): 'excellent' | 'good' | 'fair' | 'poor' {
    if (accuracy >= 0.9) return 'excellent';
    if (accuracy >= 0.75) return 'good';
    if (accuracy >= 0.5) return 'fair';
    return 'poor';
  }
} 