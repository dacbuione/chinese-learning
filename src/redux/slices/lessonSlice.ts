import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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

interface LessonState {
  courses: Course[];
  currentLesson: Lesson | null;
  lessonProgress: { [lessonId: string]: number };
  favorites: string[];
}

const initialState: LessonState = {
  courses: [
    {
      id: 'hsk1',
      title: 'HSK Level 1',
      description: '150 từ cơ bản và cấu trúc câu đơn giản',
      level: 'Beginner',
      totalLessons: 15,
      completedLessons: 3,
      progress: 20,
      color: '#DC2626',
    },
    {
      id: 'hsk2',
      title: 'HSK Level 2',
      description: '300 từ và cấu trúc ngữ pháp cơ bản',
      level: 'Beginner',
      totalLessons: 20,
      completedLessons: 0,
      progress: 0,
      color: '#F59E0B',
    },
    {
      id: 'conversation',
      title: 'Hội thoại hàng ngày',
      description: 'Các cụm từ thực tế cho các tình huống hàng ngày',
      level: 'Intermediate',
      totalLessons: 12,
      completedLessons: 1,
      progress: 8,
      color: '#1E40AF',
    },
    {
      id: 'tones',
      title: 'Luyện thanh điệu',
      description: 'Thực hành 4 thanh điệu cơ bản trong tiếng Trung',
      level: 'Beginner',
      totalLessons: 8,
      completedLessons: 0,
      progress: 0,
      color: '#7C3AED',
    },
  ],
  currentLesson: {
    id: 'hsk1-lesson-1',
    title: 'Chào hỏi và Giới thiệu',
    description: 'Học cách chào hỏi cơ bản và giới thiệu bản thân',
    courseId: 'hsk1',
    type: 'vocabulary',
    difficulty: 'beginner',
    estimatedTime: 20,
    completed: false,
    vocabulary: [
      {
        id: 'v1',
        hanzi: '你好',
        pinyin: 'nǐ hǎo',
        english: 'xin chào',
        tone: 3,
        difficulty: 'easy',
        category: 'greetings',
        strokeOrder: ['丿', '亻', '一', '乚', '丿', '一', '丨'],
      },
      {
        id: 'v2',
        hanzi: '再见',
        pinyin: 'zài jiàn',
        english: 'tạm biệt',
        tone: 4,
        difficulty: 'easy',
        category: 'greetings',
        strokeOrder: ['一', '丨', '一', '丨', '一', '乚'],
      },
      {
        id: 'v3',
        hanzi: '谢谢',
        pinyin: 'xiè xie',
        english: 'cảm ơn',
        tone: 4,
        difficulty: 'easy',
        category: 'greetings',
        strokeOrder: ['丶', '一', '丨', '一', '丿', '乚', '丨'],
      },
      {
        id: 'v4',
        hanzi: '我',
        pinyin: 'wǒ',
        english: 'tôi',
        tone: 3,
        difficulty: 'easy',
        category: 'pronouns',
        strokeOrder: ['丿', '一', '丨', '一', '丨', '丿', '丶'],
      },
      {
        id: 'v5',
        hanzi: '你',
        pinyin: 'nǐ',
        english: 'bạn',
        tone: 3,
        difficulty: 'easy',
        category: 'pronouns',
        strokeOrder: ['丿', '亻', '一', '乚', '丿'],
      },
      {
        id: 'v6',
        hanzi: '是',
        pinyin: 'shì',
        english: 'là',
        tone: 4,
        difficulty: 'easy',
        category: 'verbs',
        strokeOrder: ['丨', '一', '一', '一', '一', '丨', '一', '丨', '一'],
      },
      {
        id: 'v7',
        hanzi: '不是',
        pinyin: 'bù shì',
        english: 'không phải là',
        tone: 4,
        difficulty: 'medium',
        category: 'verbs',
        strokeOrder: ['一', '丿', '丨', '丶'],
      },
    ],
    grammar: [
      {
        id: 'g1',
        title: 'Cấu trúc Chủ ngữ-Động từ cơ bản',
        explanation: 'Tiếng Trung theo thứ tự từ Chủ ngữ-Động từ-Tân ngữ (SVO), tương tự như tiếng Anh.',
        examples: [
          {
            chinese: '我是学生',
            pinyin: 'wǒ shì xuéshēng',
            english: 'Tôi là học sinh',
          },
          {
            chinese: '你好吗？',
            pinyin: 'nǐ hǎo ma?',
            english: 'Bạn có khỏe không?',
          },
        ],
      },
      {
        id: 'g2',
        title: 'Phủ định với 不 (bù)',
        explanation: '不 (bù) được sử dụng để phủ định động từ và tính từ.',
        examples: [
          {
            chinese: '我不是老师',
            pinyin: 'wǒ bù shì lǎoshī',
            english: 'Tôi không phải là giáo viên',
          },
          {
            chinese: '他不好',
            pinyin: 'tā bù hǎo',
            english: 'Anh ấy không ổn',
          },
        ],
      },
    ],
    quiz: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Cách nói "xin chào" trong tiếng Trung là gì?',
        options: ['你好', '再见', '谢谢', '对不起'],
        correctAnswer: '你好',
        explanation: '你好 (nǐ hǎo) là cách phổ biến nhất để nói xin chào trong tiếng Trung.',
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: '"谢谢" có nghĩa là gì?',
        options: ['Xin chào', 'Tạm biệt', 'Cảm ơn', 'Xin lỗi'],
        correctAnswer: 'Cảm ơn',
        explanation: '谢谢 (xiè xie) có nghĩa là cảm ơn trong tiếng Trung.',
      },
      {
        id: 'q3',
        type: 'tone-recognition',
        question: 'Chọn thanh điệu đúng cho từ "你"',
        options: ['第一声', '第二声', '第三声', '第四声'],
        correctAnswer: '第三声',
        explanation: '"你" (nǐ) được phát âm với thanh điệu thứ 3.',
      },
      {
        id: 'q4',
        type: 'stroke-order',
        question: 'Sắp xếp thứ tự nét cho chữ "我"',
        options: ['丿一丨一丨丿丶', '一丿丨一丨丿丶', '丿丨一一丨丿丶'],
        correctAnswer: '丿一丨一丨丿丶',
        explanation: 'Thứ tự nét đúng cho "我" là từ trái sang phải, từ trên xuống dưới.',
      },
    ],
  },
  lessonProgress: {},
  favorites: [],
};

const lessonSlice = createSlice({
  name: 'lesson',
  initialState,
  reducers: {
    setCurrentLesson: (state, action: PayloadAction<Lesson>) => {
      state.currentLesson = action.payload;
    },
    updateLessonProgress: (state, action: PayloadAction<{ lessonId: string; progress: number }>) => {
      state.lessonProgress[action.payload.lessonId] = action.payload.progress;
    },
    markLessonComplete: (state, action: PayloadAction<{ lessonId: string; score: number }>) => {
      if (state.currentLesson && state.currentLesson.id === action.payload.lessonId) {
        state.currentLesson.completed = true;
        state.currentLesson.score = action.payload.score;
      }
      // Update course progress
      const courseId = state.currentLesson?.courseId;
      if (courseId) {
        const course = state.courses.find(c => c.id === courseId);
        if (course) {
          course.completedLessons += 1;
          course.progress = (course.completedLessons / course.totalLessons) * 100;
        }
      }
    },
    addToFavorites: (state, action: PayloadAction<string>) => {
      if (!state.favorites.includes(action.payload)) {
        state.favorites.push(action.payload);
      }
    },
    removeFromFavorites: (state, action: PayloadAction<string>) => {
      state.favorites = state.favorites.filter(id => id !== action.payload);
    },
    resetProgress: (state) => {
      state.lessonProgress = {};
      state.courses.forEach(course => {
        course.completedLessons = 0;
        course.progress = 0;
      });
    },
  },
});

export const {
  setCurrentLesson,
  updateLessonProgress,
  markLessonComplete,
  addToFavorites,
  removeFromFavorites,
  resetProgress,
} = lessonSlice.actions;

export default lessonSlice.reducer;