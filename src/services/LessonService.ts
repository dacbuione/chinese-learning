import { Audio } from 'expo-av';

export interface ChineseCharacter {
  hanzi: string;
  pinyin: string;
  tone: number;
  english: string;
  vietnamese: string;
  strokeOrder: string[];
  audioUrl?: string;
  examples: {
    hanzi: string;
    pinyin: string;
    english: string;
    vietnamese: string;
  }[];
}

export interface Lesson {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  level: 'HSK1' | 'HSK2' | 'HSK3' | 'HSK4' | 'HSK5' | 'HSK6';
  category: 'vocabulary' | 'grammar' | 'pronunciation' | 'writing' | 'listening';
  characters: ChineseCharacter[];
  grammarPoints?: {
    pattern: string;
    explanation: string;
    examples: string[];
  }[];
  exercises: Exercise[];
  estimatedTime: number; // minutes
  xpReward: number;
  prerequisites: string[];
  completed: boolean;
  progress: number;
  totalSteps: number;
}

export interface Exercise {
  id: string;
  type: 'multiple_choice' | 'tone_recognition' | 'character_writing' | 'translation' | 'listening';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  audioUrl?: string;
  character?: ChineseCharacter;
}

export interface UserProgress {
  userId: string;
  totalXP: number;
  currentLevel: number;
  dailyStreak: number;
  completedLessons: string[];
  currentLesson?: string;
  weakAreas: string[];
  strengths: string[];
  studyTime: number; // minutes
  lastStudyDate: Date;
}

class LessonService {
  private lessons: Lesson[] = [];
  private userProgress: UserProgress | null = null;

  constructor() {
    this.initializeLessons();
  }

  private initializeLessons() {
    // HSK1 Level Lessons
    this.lessons = [
      {
        id: 'hsk1-greetings',
        title: 'Xin chào',
        subtitle: 'Lời chào cơ bản',
        description: 'Học cách chào hỏi trong tiếng Trung',
        level: 'HSK1',
        category: 'vocabulary',
        characters: [
          {
            hanzi: '你',
            pinyin: 'nǐ',
            tone: 3,
            english: 'you',
            vietnamese: 'bạn',
            strokeOrder: ['丿', '亻', '小'],
            examples: [
              {
                hanzi: '你好',
                pinyin: 'nǐ hǎo',
                english: 'hello',
                vietnamese: 'xin chào'
              }
            ]
          },
          {
            hanzi: '好',
            pinyin: 'hǎo',
            tone: 3,
            english: 'good',
            vietnamese: 'tốt',
            strokeOrder: ['女', '子'],
            examples: [
              {
                hanzi: '很好',
                pinyin: 'hěn hǎo',
                english: 'very good',
                vietnamese: 'rất tốt'
              }
            ]
          },
          {
            hanzi: '我',
            pinyin: 'wǒ',
            tone: 3,
            english: 'I/me',
            vietnamese: 'tôi',
            strokeOrder: ['手', '戈'],
            examples: [
              {
                hanzi: '我是',
                pinyin: 'wǒ shì',
                english: 'I am',
                vietnamese: 'tôi là'
              }
            ]
          }
        ],
        exercises: [
          {
            id: 'greeting-1',
            type: 'multiple_choice',
            question: '"你好" có nghĩa là gì?',
            options: ['Tạm biệt', 'Xin chào', 'Cảm ơn', 'Xin lỗi'],
            correctAnswer: 1,
            explanation: '"你好" (nǐ hǎo) là cách chào hỏi phổ biến nhất trong tiếng Trung'
          },
          {
            id: 'greeting-2',
            type: 'tone_recognition',
            question: 'Chọn thanh điệu đúng cho "你"',
            options: ['Thanh 1', 'Thanh 2', 'Thanh 3', 'Thanh 4'],
            correctAnswer: 2,
            explanation: '"你" được phát âm với thanh 3 (thanh huyền)',
            character: {
              hanzi: '你',
              pinyin: 'nǐ',
              tone: 3,
              english: 'you',
              vietnamese: 'bạn',
              strokeOrder: [],
              examples: []
            }
          }
        ],
        estimatedTime: 15,
        xpReward: 120,
        prerequisites: [],
        completed: false,
        progress: 0,
        totalSteps: 5
      },
      {
        id: 'hsk1-family',
        title: 'Gia đình tôi',
        subtitle: 'Thành viên gia đình',
        description: 'Học từ vựng về các thành viên trong gia đình',
        level: 'HSK1',
        category: 'vocabulary',
        characters: [
          {
            hanzi: '爸爸',
            pinyin: 'bàba',
            tone: 4,
            english: 'father',
            vietnamese: 'bố',
            strokeOrder: ['父', '父'],
            examples: [
              {
                hanzi: '我爸爸',
                pinyin: 'wǒ bàba',
                english: 'my father',
                vietnamese: 'bố tôi'
              }
            ]
          },
          {
            hanzi: '妈妈',
            pinyin: 'māma',
            tone: 1,
            english: 'mother',
            vietnamese: 'mẹ',
            strokeOrder: ['女', '马'],
            examples: [
              {
                hanzi: '我妈妈',
                pinyin: 'wǒ māma',
                english: 'my mother',
                vietnamese: 'mẹ tôi'
              }
            ]
          }
        ],
        exercises: [
          {
            id: 'family-1',
            type: 'translation',
            question: 'Dịch sang tiếng Trung: "Bố tôi"',
            correctAnswer: '我爸爸',
            explanation: '"我" (wǒ) = tôi, "爸爸" (bàba) = bố'
          }
        ],
        estimatedTime: 20,
        xpReward: 150,
        prerequisites: ['hsk1-greetings'],
        completed: false,
        progress: 0,
        totalSteps: 6
      }
    ];
  }

  // Get all lessons
  getAllLessons(): Lesson[] {
    return this.lessons;
  }

  // Get lesson by ID
  getLessonById(id: string): Lesson | undefined {
    return this.lessons.find(lesson => lesson.id === id);
  }

  // Get lessons by level
  getLessonsByLevel(level: string): Lesson[] {
    return this.lessons.filter(lesson => lesson.level === level);
  }

  // Get lessons by category
  getLessonsByCategory(category: string): Lesson[] {
    return this.lessons.filter(lesson => lesson.category === category);
  }

  // Start a lesson
  async startLesson(lessonId: string): Promise<boolean> {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) return false;

    // Check prerequisites
    if (lesson.prerequisites.length > 0) {
      const completedLessons = this.userProgress?.completedLessons || [];
      const hasPrerequisites = lesson.prerequisites.every(prereq => 
        completedLessons.includes(prereq)
      );
      if (!hasPrerequisites) return false;
    }

    // Update user progress
    if (this.userProgress) {
      this.userProgress.currentLesson = lessonId;
    }

    return true;
  }

  // Complete a lesson
  async completeLesson(lessonId: string): Promise<boolean> {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) return false;

    lesson.completed = true;
    lesson.progress = lesson.totalSteps;

    // Update user progress
    if (this.userProgress) {
      if (!this.userProgress.completedLessons.includes(lessonId)) {
        this.userProgress.completedLessons.push(lessonId);
        this.userProgress.totalXP += lesson.xpReward;
        this.userProgress.currentLevel = Math.floor(this.userProgress.totalXP / 1000) + 1;
      }
    }

    return true;
  }

  // Update lesson progress
  updateLessonProgress(lessonId: string, progress: number): boolean {
    const lesson = this.getLessonById(lessonId);
    if (!lesson) return false;

    lesson.progress = Math.min(progress, lesson.totalSteps);
    return true;
  }

  // Get user progress
  getUserProgress(): UserProgress | null {
    return this.userProgress;
  }

  // Initialize user progress
  initializeUserProgress(userId: string): UserProgress {
    this.userProgress = {
      userId,
      totalXP: 0,
      currentLevel: 1,
      dailyStreak: 0,
      completedLessons: [],
      weakAreas: [],
      strengths: [],
      studyTime: 0,
      lastStudyDate: new Date()
    };
    return this.userProgress;
  }

  // Play audio for character
  async playCharacterAudio(character: ChineseCharacter): Promise<boolean> {
    try {
      // In a real app, this would play actual audio files
      console.log(`Playing audio for: ${character.hanzi} (${character.pinyin})`);
      
      // Mock audio playback
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve(true);
        }, 1000);
      });
    } catch (error) {
      console.error('Error playing audio:', error);
      return false;
    }
  }

  // Get daily challenges
  getDailyChallenges(): Exercise[] {
    const challenges: Exercise[] = [
      {
        id: 'daily-vocab',
        type: 'multiple_choice',
        question: '"谢谢" có nghĩa là gì?',
        options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi'],
        correctAnswer: 2,
        explanation: '"谢谢" (xiè xie) có nghĩa là "cảm ơn"'
      },
      {
        id: 'daily-tone',
        type: 'tone_recognition',
        question: 'Chọn thanh điệu đúng cho "妈"',
        options: ['Thanh 1', 'Thanh 2', 'Thanh 3', 'Thanh 4'],
        correctAnswer: 0,
        explanation: '"妈" (mā) được phát âm với thanh 1 (thanh ngang)',
        character: {
          hanzi: '妈',
          pinyin: 'mā',
          tone: 1,
          english: 'mother',
          vietnamese: 'mẹ',
          strokeOrder: [],
          examples: []
        }
      }
    ];

    return challenges;
  }

  // Check answer for exercise
  checkAnswer(exerciseId: string, userAnswer: string | number): {
    correct: boolean;
    explanation: string;
    xpEarned: number;
  } {
    // Find exercise in all lessons
    let exercise: Exercise | undefined;
    
    for (const lesson of this.lessons) {
      exercise = lesson.exercises.find(ex => ex.id === exerciseId);
      if (exercise) break;
    }

    if (!exercise) {
      return {
        correct: false,
        explanation: 'Không tìm thấy bài tập',
        xpEarned: 0
      };
    }

    const isCorrect = exercise.correctAnswer === userAnswer;
    const xpEarned = isCorrect ? 10 : 5; // Bonus XP for correct answers

    if (this.userProgress && isCorrect) {
      this.userProgress.totalXP += xpEarned;
    }

    return {
      correct: isCorrect,
      explanation: exercise.explanation,
      xpEarned
    };
  }

  // Get recommended lessons based on user progress
  getRecommendedLessons(): Lesson[] {
    if (!this.userProgress) return this.lessons.slice(0, 3);

    const completedLessons = this.userProgress.completedLessons;
    const availableLessons = this.lessons.filter(lesson => {
      // Check if lesson is not completed
      if (completedLessons.includes(lesson.id)) return false;
      
      // Check prerequisites
      if (lesson.prerequisites.length > 0) {
        return lesson.prerequisites.every(prereq => 
          completedLessons.includes(prereq)
        );
      }
      
      return true;
    });

    return availableLessons.slice(0, 5);
  }

  // Update daily streak
  updateDailyStreak(): void {
    if (!this.userProgress) return;

    const today = new Date();
    const lastStudy = this.userProgress.lastStudyDate;
    const daysDiff = Math.floor((today.getTime() - lastStudy.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff === 1) {
      // Consecutive day
      this.userProgress.dailyStreak += 1;
    } else if (daysDiff > 1) {
      // Streak broken
      this.userProgress.dailyStreak = 1;
    }
    // If daysDiff === 0, same day, no change needed

    this.userProgress.lastStudyDate = today;
  }
}

export const lessonService = new LessonService(); 