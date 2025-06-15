import { WritingCharacter, WritingSession, WritingProgress, StrokePath, CharacterStroke } from '../components/features/writing/types/writing.types';

/**
 * Writing Service - Quản lý hệ thống viết chữ Trung Quốc
 */
export class WritingService {
  // Sample stroke order data for basic characters
  private static readonly SAMPLE_CHARACTERS: WritingCharacter[] = [
    {
      character: '人',
      pinyin: 'rén',
      vietnamese: 'người',
      english: 'person',
      strokeCount: 2,
      difficulty: 'beginner',
      hskLevel: 1,
      radical: '人',
      strokes: [
        {
          id: 'stroke-1',
          path: 'M100,50 L150,120',
          order: 1,
          direction: 'diagonal',
          startPoint: { x: 100, y: 50 },
          endPoint: { x: 150, y: 120 },
        },
        {
          id: 'stroke-2', 
          path: 'M200,50 L150,120',
          order: 2,
          direction: 'diagonal',
          startPoint: { x: 200, y: 50 },
          endPoint: { x: 150, y: 120 },
        },
      ],
    },
    {
      character: '大',
      pinyin: 'dà',
      vietnamese: 'lớn',
      english: 'big',
      strokeCount: 3,
      difficulty: 'beginner',
      hskLevel: 1,
      radical: '大',
      strokes: [
        {
          id: 'stroke-1',
          path: 'M150,60 L150,160',
          order: 1,
          direction: 'vertical',
          startPoint: { x: 150, y: 60 },
          endPoint: { x: 150, y: 160 },
        },
        {
          id: 'stroke-2',
          path: 'M120,90 L180,90',
          order: 2,
          direction: 'horizontal',
          startPoint: { x: 120, y: 90 },
          endPoint: { x: 180, y: 90 },
        },
        {
          id: 'stroke-3',
          path: 'M80,140 L220,140',
          order: 3,
          direction: 'horizontal',
          startPoint: { x: 80, y: 140 },
          endPoint: { x: 220, y: 140 },
        },
      ],
    },
    {
      character: '小',
      pinyin: 'xiǎo',
      vietnamese: 'nhỏ',
      english: 'small',
      strokeCount: 3,
      difficulty: 'beginner',
      hskLevel: 1,
      radical: '小',
      strokes: [
        {
          id: 'stroke-1',
          path: 'M150,80 L150,140',
          order: 1,
          direction: 'vertical',
          startPoint: { x: 150, y: 80 },
          endPoint: { x: 150, y: 140 },
        },
        {
          id: 'stroke-2',
          path: 'M100,100 L130,130',
          order: 2,
          direction: 'diagonal',
          startPoint: { x: 100, y: 100 },
          endPoint: { x: 130, y: 130 },
        },
        {
          id: 'stroke-3',
          path: 'M200,100 L170,130',
          order: 3,
          direction: 'diagonal',
          startPoint: { x: 200, y: 100 },
          endPoint: { x: 170, y: 130 },
        },
      ],
    },
    {
      character: '口',
      pinyin: 'kǒu',
      vietnamese: 'miệng',
      english: 'mouth',
      strokeCount: 3,
      difficulty: 'beginner',
      hskLevel: 1,
      radical: '口',
      strokes: [
        {
          id: 'stroke-1',
          path: 'M100,80 L200,80',
          order: 1,
          direction: 'horizontal',
          startPoint: { x: 100, y: 80 },
          endPoint: { x: 200, y: 80 },
        },
        {
          id: 'stroke-2',
          path: 'M100,80 L100,160',
          order: 2,
          direction: 'vertical',
          startPoint: { x: 100, y: 80 },
          endPoint: { x: 100, y: 160 },
        },
        {
          id: 'stroke-3',
          path: 'M100,160 L200,160 L200,80',
          order: 3,
          direction: 'hook',
          startPoint: { x: 100, y: 160 },
          endPoint: { x: 200, y: 80 },
        },
      ],
    },
    {
      character: '山',
      pinyin: 'shān',
      vietnamese: 'núi',
      english: 'mountain',
      strokeCount: 3,
      difficulty: 'beginner',
      hskLevel: 1,
      radical: '山',
      strokes: [
        {
          id: 'stroke-1',
          path: 'M150,70 L150,130',
          order: 1,
          direction: 'vertical',
          startPoint: { x: 150, y: 70 },
          endPoint: { x: 150, y: 130 },
        },
        {
          id: 'stroke-2',
          path: 'M110,90 L110,150',
          order: 2,
          direction: 'vertical',
          startPoint: { x: 110, y: 90 },
          endPoint: { x: 110, y: 150 },
        },
        {
          id: 'stroke-3',
          path: 'M190,90 L190,150',
          order: 3,
          direction: 'vertical',
          startPoint: { x: 190, y: 90 },
          endPoint: { x: 190, y: 150 },
        },
      ],
    },
    {
      character: '水',
      pinyin: 'shuǐ',
      vietnamese: 'nước',
      english: 'water',
      strokeCount: 4,
      difficulty: 'intermediate',
      hskLevel: 1,
      radical: '水',
      strokes: [
        {
          id: 'stroke-1',
          path: 'M150,60 L150,100',
          order: 1,
          direction: 'vertical',
          startPoint: { x: 150, y: 60 },
          endPoint: { x: 150, y: 100 },
        },
        {
          id: 'stroke-2',
          path: 'M110,80 L130,110 L170,110 L190,80',
          order: 2,
          direction: 'curve',
          startPoint: { x: 110, y: 80 },
          endPoint: { x: 190, y: 80 },
        },
        {
          id: 'stroke-3',
          path: 'M100,130 L120,150',
          order: 3,
          direction: 'diagonal',
          startPoint: { x: 100, y: 130 },
          endPoint: { x: 120, y: 150 },
        },
        {
          id: 'stroke-4',
          path: 'M180,130 L200,150',
          order: 4,
          direction: 'diagonal',
          startPoint: { x: 180, y: 130 },
          endPoint: { x: 200, y: 150 },
        },
      ],
    },
  ];

  /**
   * Lấy tất cả ký tự có sẵn
   */
  static getAllCharacters(): WritingCharacter[] {
    return [...this.SAMPLE_CHARACTERS];
  }

  /**
   * Lấy ký tự theo ID
   */
  static getCharacterById(character: string): WritingCharacter | null {
    return this.SAMPLE_CHARACTERS.find(c => c.character === character) || null;
  }

  /**
   * Lọc ký tự theo HSK level
   */
  static getCharactersByHSKLevel(level: 1 | 2 | 3 | 4 | 5 | 6): WritingCharacter[] {
    return this.SAMPLE_CHARACTERS.filter(c => c.hskLevel === level);
  }

  /**
   * Lọc ký tự theo độ khó
   */
  static getCharactersByDifficulty(difficulty: 'beginner' | 'intermediate' | 'advanced'): WritingCharacter[] {
    return this.SAMPLE_CHARACTERS.filter(c => c.difficulty === difficulty);
  }

  /**
   * Lọc ký tự theo số nét
   */
  static getCharactersByStrokeCount(min: number, max: number): WritingCharacter[] {
    return this.SAMPLE_CHARACTERS.filter(c => c.strokeCount >= min && c.strokeCount <= max);
  }

  /**
   * Tìm kiếm ký tự theo pinyin hoặc nghĩa tiếng Việt
   */
  static searchCharacters(query: string): WritingCharacter[] {
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return this.getAllCharacters();

    return this.SAMPLE_CHARACTERS.filter(c => 
      c.character.includes(searchTerm) ||
      c.pinyin.toLowerCase().includes(searchTerm) ||
      c.vietnamese.toLowerCase().includes(searchTerm) ||
      c.english.toLowerCase().includes(searchTerm)
    );
  }

  /**
   * Đánh giá độ chính xác của nét vẽ
   */
  static evaluateStrokeAccuracy(
    userStroke: StrokePath, 
    targetStroke: CharacterStroke
  ): number {
    if (!userStroke.points || userStroke.points.length === 0) return 0;

    // Tính toán độ chính xác dựa trên:
    // 1. Điểm bắt đầu và kết thúc
    // 2. Hướng vẽ
    // 3. Tốc độ vẽ
    // 4. Độ mượt của nét

    const startAccuracy = this.calculatePointAccuracy(
      userStroke.points[0], 
      targetStroke.startPoint
    );
    
    const endAccuracy = this.calculatePointAccuracy(
      userStroke.points[userStroke.points.length - 1], 
      targetStroke.endPoint
    );

    const directionAccuracy = this.calculateDirectionAccuracy(
      userStroke.points,
      targetStroke
    );

    const smoothnessScore = this.calculateSmoothness(userStroke.points);

    // Tính điểm tổng (weighted average)
    const overallScore = (
      startAccuracy * 0.3 +
      endAccuracy * 0.3 +
      directionAccuracy * 0.25 +
      smoothnessScore * 0.15
    );

    return Math.round(Math.max(0, Math.min(100, overallScore)));
  }

  /**
   * Tính độ chính xác giữa hai điểm
   */
  private static calculatePointAccuracy(
    userPoint: { x: number; y: number },
    targetPoint: { x: number; y: number }
  ): number {
    const distance = Math.sqrt(
      Math.pow(userPoint.x - targetPoint.x, 2) + 
      Math.pow(userPoint.y - targetPoint.y, 2)
    );
    
    // Cho phép sai lệch 30px, sau đó giảm điểm
    const tolerance = 30;
    const accuracy = Math.max(0, 100 - (distance / tolerance) * 100);
    return Math.min(100, accuracy);
  }

  /**
   * Tính độ chính xác hướng vẽ
   */
  private static calculateDirectionAccuracy(
    userPoints: { x: number; y: number }[],
    targetStroke: CharacterStroke
  ): number {
    if (userPoints.length < 2) return 0;

    const userDirection = this.calculateStrokeDirection(userPoints);
    const targetDirection = targetStroke.direction;

    // Mapping direction similarity
    const directionMap: Record<string, string[]> = {
      horizontal: ['horizontal'],
      vertical: ['vertical'],
      diagonal: ['diagonal'],
      curve: ['curve', 'hook'],
      hook: ['hook', 'curve'],
      dot: ['dot'],
    };

    const compatibleDirections = directionMap[targetDirection] || [targetDirection];
    return compatibleDirections.includes(userDirection) ? 100 : 50;
  }

  /**
   * Xác định hướng vẽ từ các điểm
   */
  private static calculateStrokeDirection(
    points: { x: number; y: number }[]
  ): string {
    if (points.length < 2) return 'dot';

    const start = points[0];
    const end = points[points.length - 1];
    
    const deltaX = Math.abs(end.x - start.x);
    const deltaY = Math.abs(end.y - start.y);

    if (deltaX < 10 && deltaY < 10) return 'dot';
    if (deltaX > deltaY * 2) return 'horizontal';
    if (deltaY > deltaX * 2) return 'vertical';
    
    // Check for curves by analyzing path curvature
    const curvature = this.calculateCurvature(points);
    if (curvature > 0.3) return 'curve';
    
    return 'diagonal';
  }

  /**
   * Tính độ cong của nét vẽ
   */
  private static calculateCurvature(points: { x: number; y: number }[]): number {
    if (points.length < 3) return 0;

    let totalCurvature = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // Calculate angle change
      const angle1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const angle2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const angleDiff = Math.abs(angle2 - angle1);
      
      totalCurvature += Math.min(angleDiff, 2 * Math.PI - angleDiff);
    }

    return totalCurvature / (points.length - 2);
  }

  /**
   * Tính độ mượt của nét vẽ
   */
  private static calculateSmoothness(points: { x: number; y: number }[]): number {
    if (points.length < 3) return 100;

    let totalVariation = 0;
    for (let i = 1; i < points.length - 1; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const next = points[i + 1];

      // Calculate direction change
      const dir1 = Math.atan2(curr.y - prev.y, curr.x - prev.x);
      const dir2 = Math.atan2(next.y - curr.y, next.x - curr.x);
      const variation = Math.abs(dir2 - dir1);
      
      totalVariation += Math.min(variation, 2 * Math.PI - variation);
    }

    const avgVariation = totalVariation / (points.length - 2);
    const smoothness = Math.max(0, 100 - (avgVariation * 50));
    return Math.min(100, smoothness);
  }

  /**
   * Đánh giá toàn bộ ký tự
   */
  static evaluateCharacterWriting(
    character: string,
    userStrokes: StrokePath[]
  ): {
    overallScore: number;
    strokeScores: number[];
    feedback: string[];
    suggestions: string[];
  } {
    const targetCharacter = this.getCharacterById(character);
    if (!targetCharacter) {
      return {
        overallScore: 0,
        strokeScores: [],
        feedback: ['Không tìm thấy ký tự này.'],
        suggestions: ['Vui lòng chọn ký tự khác.'],
      };
    }

    const strokeScores: number[] = [];
    const feedback: string[] = [];
    const suggestions: string[] = [];

    // Đánh giá từng nét
    const minStrokes = Math.min(userStrokes.length, targetCharacter.strokes.length);
    for (let i = 0; i < minStrokes; i++) {
      const score = this.evaluateStrokeAccuracy(userStrokes[i], targetCharacter.strokes[i]);
      strokeScores.push(score);

      if (score < 70) {
        feedback.push(`Nét ${i + 1}: Cần cải thiện độ chính xác`);
        suggestions.push(`Nét ${i + 1}: Chú ý điểm bắt đầu và hướng vẽ`);
      } else if (score < 85) {
        feedback.push(`Nét ${i + 1}: Tạm được, có thể cải thiện`);
        suggestions.push(`Nét ${i + 1}: Vẽ chậm hơn để tăng độ chính xác`);
      } else {
        feedback.push(`Nét ${i + 1}: Rất tốt!`);
      }
    }

    // Kiểm tra số lượng nét
    if (userStrokes.length < targetCharacter.strokes.length) {
      feedback.push(`Thiếu ${targetCharacter.strokes.length - userStrokes.length} nét`);
      suggestions.push('Hãy vẽ đủ số nét theo thứ tự');
    } else if (userStrokes.length > targetCharacter.strokes.length) {
      feedback.push(`Thừa ${userStrokes.length - targetCharacter.strokes.length} nét`);
      suggestions.push('Kiểm tra lại số nét chuẩn của ký tự');
    }

    // Tính điểm tổng
    const strokeCountPenalty = Math.abs(userStrokes.length - targetCharacter.strokes.length) * 10;
    const avgStrokeScore = strokeScores.length > 0 ? 
      strokeScores.reduce((sum, score) => sum + score, 0) / strokeScores.length : 0;
    const overallScore = Math.max(0, avgStrokeScore - strokeCountPenalty);

    return {
      overallScore: Math.round(overallScore),
      strokeScores,
      feedback,
      suggestions,
    };
  }

  /**
   * Tạo session luyện viết mới
   */
  static createWritingSession(characterId: string): WritingSession {
    return {
      id: `session-${Date.now()}`,
      characterId,
      startTime: Date.now(),
      userStrokes: [],
      accuracy: 0,
      completionTime: 0,
      attempts: 0,
      isCompleted: false,
    };
  }

  /**
   * Cập nhật session với kết quả mới
   */
  static updateWritingSession(
    session: WritingSession,
    userStrokes: StrokePath[],
    score: number
  ): WritingSession {
    return {
      ...session,
      userStrokes,
      accuracy: score,
      completionTime: Date.now() - session.startTime,
      attempts: session.attempts + 1,
      isCompleted: score >= 70, // Coi như hoàn thành nếu đạt 70% trở lên
      endTime: Date.now(),
    };
  }

  /**
   * Lấy gợi ý luyện tập cá nhân hóa
   */
  static getPersonalizedRecommendations(
    userProgress: WritingProgress[]
  ): {
    recommendedCharacters: string[];
    focusAreas: string[];
    tips: string[];
  } {
    // Phân tích điểm yếu từ lịch sử
    const weakStrokes = this.analyzeWeaknesses(userProgress);
    
    return {
      recommendedCharacters: this.getRecommendedCharacters(userProgress),
      focusAreas: this.getFocusAreas(weakStrokes),
      tips: this.getPersonalizedTips(weakStrokes),
    };
  }

  private static analyzeWeaknesses(progress: WritingProgress[]): string[] {
    // Simplified analysis - would be more sophisticated in real app
    const weaknesses: string[] = [];
    
         progress.forEach(p => {
       if (p.averageAccuracy < 70) {
         weaknesses.push('overall_accuracy');
       }
       if (p.fastestTime > 5000) { // Too slow
         weaknesses.push('speed');
       }
     });

    return [...new Set(weaknesses)];
  }

  private static getRecommendedCharacters(progress: WritingProgress[]): string[] {
    // Return characters user should practice more
    const strugglingCharacters = progress
      .filter(p => p.averageAccuracy < 80)
      .map(p => p.characterId)
      .slice(0, 5);

    return strugglingCharacters.length > 0 ? strugglingCharacters : ['人', '大', '小'];
  }

  private static getFocusAreas(weaknesses: string[]): string[] {
    const areas: string[] = [];
    
    if (weaknesses.includes('overall_accuracy')) {
      areas.push('Độ chính xác nét vẽ');
    }
    if (weaknesses.includes('speed')) {
      areas.push('Tốc độ viết');
    }
    if (areas.length === 0) {
      areas.push('Luyện tập thêm ký tự mới');
    }

    return areas;
  }

  private static getPersonalizedTips(weaknesses: string[]): string[] {
    const tips: string[] = [];
    
    if (weaknesses.includes('overall_accuracy')) {
      tips.push('Vẽ chậm hơn và chú ý điểm bắt đầu của mỗi nét');
      tips.push('Sử dụng lưới hướng dẫn để căn chỉnh vị trí');
    }
    if (weaknesses.includes('speed')) {
      tips.push('Luyện tập nhiều lần để tăng tốc độ tự nhiên');
      tips.push('Không ép buộc vẽ nhanh, hãy để kỹ năng phát triển dần');
    }
    if (tips.length === 0) {
      tips.push('Tuyệt vời! Hãy thử thách bản thân với ký tự khó hơn');
      tips.push('Luyện tập đều đặn mỗi ngày để duy trì kỹ năng');
    }

    return tips;
  }
} 