import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

// Components
import {
  LessonExercise,
  ExerciseData,
} from '../../../src/components/features/lessons/components/LessonExercise';
import { TranslationText } from '../../../src/components/ui/atoms/Text';
import { Button } from '../../../src/components/ui/atoms/Button';

// Theme
import {
  colors,
  getResponsiveSpacing,
  getResponsiveFontSize,
} from '../../../src/theme';

export default function LessonExerciseScreen() {
  const { lessonId, exerciseType } = useLocalSearchParams<{
    lessonId: string;
    exerciseType: string;
  }>();
  const router = useRouter();
  const [exercises, setExercises] = useState<ExerciseData[]>([]);

  // Sample exercise data based on lesson images
  const generateExercises = (): ExerciseData[] => {
    const baseExercises: ExerciseData[] = [
      // 1. Translation to Chinese - Dịch từ tiếng Việt sang tiếng Trung
      {
        id: 'trans-cn-1',
        type: 'translation-to-chinese',
        question: 'Chọn bản dịch tiếng Trung đúng:',
        vietnameseText: 'Xin chào',
        correctAnswer: 'option-1',
        options: [
          {
            id: 'option-1',
            text: '你好',
            chineseText: '你好',
            pinyin: 'nǐ hǎo',
            isCorrect: true,
          },
          {
            id: 'option-2',
            text: '再见',
            chineseText: '再见',
            pinyin: 'zài jiàn',
            isCorrect: false,
          },
          {
            id: 'option-3',
            text: '谢谢',
            chineseText: '谢谢',
            pinyin: 'xiè xiè',
            isCorrect: false,
          },
          {
            id: 'option-4',
            text: '对不起',
            chineseText: '对不起',
            pinyin: 'duì bu qǐ',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation:
          '你好 (nǐ hǎo) là cách nói "xin chào" phổ biến nhất trong tiếng Trung.',
      },

      // 2. Translation to Vietnamese - Dịch từ tiếng Trung sang tiếng Việt
      {
        id: 'trans-vn-1',
        type: 'translation-to-vietnamese',
        question: 'Chọn nghĩa tiếng Việt đúng:',
        chineseText: '谢谢',
        pinyin: 'xiè xiè',
        correctAnswer: 'vn-option-1',
        options: [
          {
            id: 'vn-option-1',
            text: 'Cảm ơn',
            vietnameseText: 'Cảm ơn',
            isCorrect: true,
          },
          {
            id: 'vn-option-2',
            text: 'Xin chào',
            vietnameseText: 'Xin chào',
            isCorrect: false,
          },
          {
            id: 'vn-option-3',
            text: 'Tạm biệt',
            vietnameseText: 'Tạm biệt',
            isCorrect: false,
          },
          {
            id: 'vn-option-4',
            text: 'Xin lỗi',
            vietnameseText: 'Xin lỗi',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation: '谢谢 (xiè xiè) có nghĩa là "cảm ơn" trong tiếng Việt.',
      },

      // 3. Audio Matching - Nghe và chọn chữ đúng
      {
        id: 'audio-1',
        type: 'audio-matching',
        question: 'Nghe và chọn chữ Hán đúng:',
        chineseText: '你好',
        pinyin: 'nǐ hǎo',
        correctAnswer: 'audio-option-1',
        options: [
          {
            id: 'audio-option-1',
            text: '你好',
            chineseText: '你好',
            pinyin: 'nǐ hǎo',
            isCorrect: true,
          },
          {
            id: 'audio-option-2',
            text: '再见',
            chineseText: '再见',
            pinyin: 'zài jiàn',
            isCorrect: false,
          },
          {
            id: 'audio-option-3',
            text: '谢谢',
            chineseText: '谢谢',
            pinyin: 'xiè xiè',
            isCorrect: false,
          },
          {
            id: 'audio-option-4',
            text: '您好',
            chineseText: '您好',
            pinyin: 'nín hǎo',
            isCorrect: false,
          },
        ],
        difficulty: 'medium',
        explanation:
          '你好 (nǐ hǎo) là cách chào hỏi thân thiết trong tiếng Trung.',
      },

      // 4. Tone Identification - Nhận biết thanh điệu
      {
        id: 'tone-1',
        type: 'tone-identification',
        question: 'Chọn thanh điệu đúng của từ này:',
        chineseText: '好',
        pinyin: 'hǎo',
        vietnameseText: 'tốt',
        correctAnswer: 'tone-option-3',
        tone: 3,
        options: [
          {
            id: 'tone-option-1',
            text: 'Thanh 1 (ngang)',
            tone: 1,
            isCorrect: false,
          },
          {
            id: 'tone-option-2',
            text: 'Thanh 2 (sắc)',
            tone: 2,
            isCorrect: false,
          },
          {
            id: 'tone-option-3',
            text: 'Thanh 3 (huyền)',
            tone: 3,
            isCorrect: true,
          },
          {
            id: 'tone-option-4',
            text: 'Thanh 4 (nặng)',
            tone: 4,
            isCorrect: false,
          },
        ],
        difficulty: 'medium',
        explanation:
          '好 (hǎo) được phát âm với thanh 3 (thanh huyền), âm xuống rồi lên.',
      },

      // 5. Pinyin Matching - Ghép chữ Hán với pinyin
      {
        id: 'pinyin-1',
        type: 'pinyin-matching',
        question: 'Chọn cách đọc pinyin đúng:',
        chineseText: '对不起',
        vietnameseText: 'xin lỗi',
        correctAnswer: 'pinyin-option-1',
        options: [
          {
            id: 'pinyin-option-1',
            text: 'duì bu qǐ',
            pinyin: 'duì bu qǐ',
            isCorrect: true,
          },
          {
            id: 'pinyin-option-2',
            text: 'duì bù qì',
            pinyin: 'duì bù qì',
            isCorrect: false,
          },
          {
            id: 'pinyin-option-3',
            text: 'dùi bu qí',
            pinyin: 'dùi bu qí',
            isCorrect: false,
          },
          {
            id: 'pinyin-option-4',
            text: 'duí bù qǐ',
            pinyin: 'duí bù qǐ',
            isCorrect: false,
          },
        ],
        difficulty: 'medium',
        explanation: '对不起 đọc là "duì bu qǐ" với các thanh điệu 4-0-3.',
      },

      // 6. Conversation Completion - Hoàn thành đoạn hội thoại
      {
        id: 'conversation-1',
        type: 'conversation-completion',
        question: 'A: 你好！ B: ___',
        vietnameseText: 'Chọn câu trả lời phù hợp:',
        correctAnswer: 'conv-option-1',
        options: [
          {
            id: 'conv-option-1',
            text: '你好！',
            chineseText: '你好！',
            pinyin: 'nǐ hǎo!',
            vietnameseText: 'Xin chào!',
            isCorrect: true,
          },
          {
            id: 'conv-option-2',
            text: '谢谢！',
            chineseText: '谢谢！',
            pinyin: 'xiè xiè!',
            vietnameseText: 'Cảm ơn!',
            isCorrect: false,
          },
          {
            id: 'conv-option-3',
            text: '对不起！',
            chineseText: '对不起！',
            pinyin: 'duì bu qǐ!',
            vietnameseText: 'Xin lỗi!',
            isCorrect: false,
          },
          {
            id: 'conv-option-4',
            text: '再见！',
            chineseText: '再见！',
            pinyin: 'zài jiàn!',
            vietnameseText: 'Tạm biệt!',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation:
          'Khi ai đó chào bằng "你好", ta thường đáp lại bằng "你好" như nhau.',
      },

      // 7. Multiple Choice - Chọn nghĩa đúng
      {
        id: 'choice-1',
        type: 'multiple-choice',
        question: 'Từ nào có nghĩa là "không có gì"?',
        correctAnswer: 'choice-option-2',
        options: [
          {
            id: 'choice-option-1',
            text: '谢谢',
            chineseText: '谢谢',
            pinyin: 'xiè xiè',
            vietnameseText: 'cảm ơn',
            isCorrect: false,
          },
          {
            id: 'choice-option-2',
            text: '不客气',
            chineseText: '不客气',
            pinyin: 'bù kè qì',
            vietnameseText: 'không có gì',
            isCorrect: true,
          },
          {
            id: 'choice-option-3',
            text: '对不起',
            chineseText: '对不起',
            pinyin: 'duì bu qǐ',
            vietnameseText: 'xin lỗi',
            isCorrect: false,
          },
          {
            id: 'choice-option-4',
            text: '没关系',
            chineseText: '没关系',
            pinyin: 'méi guān xi',
            vietnameseText: 'không sao',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation:
          '不客气 (bù kè qì) có nghĩa là "không có gì", dùng để đáp lại lời cảm ơn.',
      },

      // 8. Grammar Fill Blank - Điền vào chỗ trống
      {
        id: 'grammar-1',
        type: 'grammar-fill-blank',
        question: '____ 是学生。',
        vietnameseText: 'Tôi là học sinh',
        correctAnswer: 'grammar-option-1',
        options: [
          {
            id: 'grammar-option-1',
            text: '我',
            chineseText: '我',
            pinyin: 'wǒ',
            vietnameseText: 'tôi',
            isCorrect: true,
          },
          {
            id: 'grammar-option-2',
            text: '你',
            chineseText: '你',
            pinyin: 'nǐ',
            vietnameseText: 'bạn',
            isCorrect: false,
          },
          {
            id: 'grammar-option-3',
            text: '他',
            chineseText: '他',
            pinyin: 'tā',
            vietnameseText: 'anh ấy',
            isCorrect: false,
          },
          {
            id: 'grammar-option-4',
            text: '她',
            chineseText: '她',
            pinyin: 'tā',
            vietnameseText: 'cô ấy',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation: '我 (wǒ) có nghĩa là "tôi", là đại từ ngôi thứ nhất. Câu hoàn chỉnh: 我是学生 (wǒ shì xuéshēng) - Tôi là học sinh.',
      },

      // 8B. Grammar Fill Blank - Bài 2: Gọi tên
      {
        id: 'grammar-2',
        type: 'grammar-fill-blank',
        question: '我 ____ 李明。',
        vietnameseText: 'Tôi tên là Lý Minh',
        correctAnswer: 'grammar2-option-1',
        options: [
          {
            id: 'grammar2-option-1',
            text: '叫',
            chineseText: '叫',
            pinyin: 'jiào',
            vietnameseText: 'gọi/tên',
            isCorrect: true,
          },
          {
            id: 'grammar2-option-2',
            text: '是',
            chineseText: '是',
            pinyin: 'shì',
            vietnameseText: 'là',
            isCorrect: false,
          },
          {
            id: 'grammar2-option-3',
            text: '有',
            chineseText: '有',
            pinyin: 'yǒu',
            vietnameseText: 'có',
            isCorrect: false,
          },
          {
            id: 'grammar2-option-4',
            text: '说',
            chineseText: '说',
            pinyin: 'shuō',
            vietnameseText: 'nói',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation: '叫 (jiào) dùng để nói tên. Câu hoàn chỉnh: 我叫李明 (wǒ jiào Lǐ Míng) - Tôi tên là Lý Minh.',
      },

      // 8C. Grammar Fill Blank - Bài 3: Cảm ơn
      {
        id: 'grammar-3',
        type: 'grammar-fill-blank',
        question: '谢谢你！____！',
        vietnameseText: 'Cảm ơn bạn! Không có gì!',
        correctAnswer: 'grammar3-option-1',
        options: [
          {
            id: 'grammar3-option-1',
            text: '不客气',
            chineseText: '不客气',
            pinyin: 'bù kè qì',
            vietnameseText: 'không có gì',
            isCorrect: true,
          },
          {
            id: 'grammar3-option-2',
            text: '对不起',
            chineseText: '对不起',
            pinyin: 'duì bu qǐ',
            vietnameseText: 'xin lỗi',
            isCorrect: false,
          },
          {
            id: 'grammar3-option-3',
            text: '没关系',
            chineseText: '没关系',
            pinyin: 'méi guān xi',
            vietnameseText: 'không sao',
            isCorrect: false,
          },
          {
            id: 'grammar3-option-4',
            text: '再见',
            chineseText: '再见',
            pinyin: 'zài jiàn',
            vietnameseText: 'tạm biệt',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation: '不客气 (bù kè qì) là cách đáp lại khi ai đó cảm ơn bạn, có nghĩa là "không có gì".',
      },

      // 8D. Grammar Fill Blank - Bài 4: Xin lỗi
      {
        id: 'grammar-4',
        type: 'grammar-fill-blank',
        question: '对不起，我迟到了。____。',
        vietnameseText: 'Xin lỗi, tôi đến muộn. Không sao.',
        correctAnswer: 'grammar4-option-1',
        options: [
          {
            id: 'grammar4-option-1',
            text: '没关系',
            chineseText: '没关系',
            pinyin: 'méi guān xi',
            vietnameseText: 'không sao',
            isCorrect: true,
          },
          {
            id: 'grammar4-option-2',
            text: '不客气',
            chineseText: '不客气',
            pinyin: 'bù kè qì',
            vietnameseText: 'không có gì',
            isCorrect: false,
          },
          {
            id: 'grammar4-option-3',
            text: '谢谢',
            chineseText: '谢谢',
            pinyin: 'xiè xiè',
            vietnameseText: 'cảm ơn',
            isCorrect: false,
          },
          {
            id: 'grammar4-option-4',
            text: '再见',
            chineseText: '再见',
            pinyin: 'zài jiàn',
            vietnameseText: 'tạm biệt',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation: '没关系 (méi guān xi) dùng để đáp lại khi ai đó xin lỗi, có nghĩa là "không sao".',
      },

      // 9. Character Ordering - Sắp xếp ký tự
      {
        id: 'character-ordering-1',
        type: 'character-ordering',
        question: 'Sắp xếp các chữ Hán theo thứ tự đúng:',
        vietnameseText: '你好',
        correctAnswer: 'character-option-1',
        options: [
          {
            id: 'character-option-1',
            text: '你好',
            chineseText: '你好',
            pinyin: 'nǐ hǎo',
            vietnameseText: 'xin chào',
            isCorrect: true,
          },
          {
            id: 'character-option-2',
            text: '再见',
            chineseText: '再见',
            pinyin: 'zài jiàn',
            vietnameseText: 'tạm biệt',
            isCorrect: false,
          },
          {
            id: 'character-option-3',
            text: '谢谢',
            chineseText: '谢谢',
            pinyin: 'xiè xiè',
            vietnameseText: 'cảm ơn',
            isCorrect: false,
          },
          {
            id: 'character-option-4',
            text: '对不起',
            chineseText: '对不起',
            pinyin: 'duì bu qǐ',
            vietnameseText: 'xin lỗi',
            isCorrect: false,
          },
        ],
        difficulty: 'easy',
        explanation: '你好 (nǐ hǎo) được sắp xếp theo thứ tự 1-2-3-4.',
      },

      // 10. Listening Comprehension - Nghe hiểu
      {
        id: 'listening-1',
        type: 'listening-comprehension',
        question: 'Nghe và chọn câu trả lời đúng:',
        vietnameseText: 'Chọn câu trả lời phù hợp:',
        correctAnswer: 'listening-option-1',
        options: [
          {
            id: 'listening-option-1',
            text: 'A: 你好！ B: 你好！',
            chineseText: 'A: 你好！ B: 你好！',
            pinyin: 'A: nǐ hǎo! B: nǐ hǎo!',
            vietnameseText: 'A: Xin chào! B: Xin chào!',
            isCorrect: true,
          },
          {
            id: 'listening-option-2',
            text: 'A: 谢谢！ B: 谢谢！',
            chineseText: 'A: 谢谢！ B: 谢谢！',
            pinyin: 'A: xiè xiè! B: xiè xiè!',
            vietnameseText: 'A: Cảm ơn! B: Cảm ơn!',
            isCorrect: false,
          },
          {
            id: 'listening-option-3',
            text: 'A: 对不起！ B: 对不起！',
            chineseText: 'A: 对不起！ B: 对不起！',
            pinyin: 'A: duì bu qǐ! B: duì bu qǐ!',
            vietnameseText: 'A: Xin lỗi! B: Xin lỗi!',
            isCorrect: false,
          },
          {
            id: 'listening-option-4',
            text: 'A: 再见！ B: 再见！',
            chineseText: 'A: 再见！ B: 再见！',
            pinyin: 'A: zài jiàn! B: zài jiàn!',
            vietnameseText: 'A: Tạm biệt! B: Tạm biệt!',
            isCorrect: false,
          },
        ],
        difficulty: 'medium',
        explanation:
          'A: 你好！ B: 你好！ là cách chào hỏi thân thiết trong tiếng Trung.',
      },

      // 11. Sentence Building - Xây dựng câu từ các từ
      {
        id: 'sentence-building-1',
        type: 'sentence-building',
        question: 'Sắp xếp các từ để tạo thành câu hoàn chỉnh:',
        vietnameseText: 'Tôi là học sinh',
        correctAnswer: ['word-wo', 'word-shi', 'word-xuesheng'], // Thứ tự đúng
        options: [
          {
            id: 'word-wo',
            text: '我',
            chineseText: '我',
            pinyin: 'wǒ',
            vietnameseText: 'tôi',
            isCorrect: true,
          },
          {
            id: 'word-shi',
            text: '是',
            chineseText: '是',
            pinyin: 'shì',
            vietnameseText: 'là',
            isCorrect: true,
          },
          {
            id: 'word-xuesheng',
            text: '学生',
            chineseText: '学生',
            pinyin: 'xuéshēng',
            vietnameseText: 'học sinh',
            isCorrect: true,
          },
          {
            id: 'word-laoshi',
            text: '老师',
            chineseText: '老师',
            pinyin: 'lǎoshī',
            vietnameseText: 'giáo viên',
            isCorrect: false,
          },
        ],
        difficulty: 'medium',
        explanation: 'Câu đúng: 我是学生 (wǒ shì xuéshēng) - Tôi là học sinh. Thứ tự: Chủ ngữ + Động từ + Tân ngữ.',
      },

      // 11B. Sentence Building - Bài 2: Chào hỏi
      {
        id: 'sentence-building-2',
        type: 'sentence-building',
        question: 'Sắp xếp các từ để tạo thành câu chào hỏi:',
        vietnameseText: 'Bạn có khỏe không?',
        correctAnswer: ['word-ni', 'word-hao', 'word-ma'], // Thứ tự đúng
        options: [
          {
            id: 'word-ni',
            text: '你',
            chineseText: '你',
            pinyin: 'nǐ',
            vietnameseText: 'bạn',
            isCorrect: true,
          },
          {
            id: 'word-hao',
            text: '好',
            chineseText: '好',
            pinyin: 'hǎo',
            vietnameseText: 'khỏe',
            isCorrect: true,
          },
          {
            id: 'word-ma',
            text: '吗',
            chineseText: '吗',
            pinyin: 'ma',
            vietnameseText: '(từ nghi vấn)',
            isCorrect: true,
          },
          {
            id: 'word-bu',
            text: '不',
            chineseText: '不',
            pinyin: 'bù',
            vietnameseText: 'không',
            isCorrect: false,
          },
        ],
        difficulty: 'medium',
        explanation: 'Câu đúng: 你好吗？(nǐ hǎo ma?) - Bạn có khỏe không? "吗" là từ nghi vấn đặt cuối câu.',
      },

      // 11C. Sentence Building - Bài 3: Giới thiệu tên
      {
        id: 'sentence-building-3',
        type: 'sentence-building',
        question: 'Sắp xếp các từ để giới thiệu tên:',
        vietnameseText: 'Tôi tên là Lý Minh',
        correctAnswer: ['word-wo2', 'word-jiao', 'word-liming'], // Thứ tự đúng
        options: [
          {
            id: 'word-wo2',
            text: '我',
            chineseText: '我',
            pinyin: 'wǒ',
            vietnameseText: 'tôi',
            isCorrect: true,
          },
          {
            id: 'word-jiao',
            text: '叫',
            chineseText: '叫',
            pinyin: 'jiào',
            vietnameseText: 'gọi/tên',
            isCorrect: true,
          },
          {
            id: 'word-liming',
            text: '李明',
            chineseText: '李明',
            pinyin: 'Lǐ Míng',
            vietnameseText: 'Lý Minh',
            isCorrect: true,
          },
          {
            id: 'word-shi2',
            text: '是',
            chineseText: '是',
            pinyin: 'shì',
            vietnameseText: 'là',
            isCorrect: false,
          },
        ],
        difficulty: 'medium',
        explanation: 'Câu đúng: 我叫李明 (wǒ jiào Lǐ Míng) - Tôi tên là Lý Minh. "叫" dùng để nói tên.',
      },
    ];

    // Filter exercises based on exercise type if specified
    if (exerciseType && exerciseType !== 'all') {
      return baseExercises.filter((exercise) => exercise.type === exerciseType);
    }

    return baseExercises;
  };

  useEffect(() => {
    const exerciseData = generateExercises();
    setExercises(exerciseData);
  }, [lessonId, exerciseType]);

  const handleExerciseComplete = (score: number, totalQuestions: number) => {
    const percentage = Math.round((score / totalQuestions) * 100);
    const isPass = percentage >= 70; // Pass if 70% or higher

    Alert.alert(
      isPass ? '🎉 Chúc mừng!' : '📚 Cần luyện tập thêm',
      `Bạn đã trả lời đúng ${score}/${totalQuestions} câu hỏi (${percentage}%)\n\n${
        isPass
          ? 'Bạn đã hoàn thành bài tập xuất sắc!'
          : 'Hãy ôn tập lại và thử lần nữa nhé!'
      }`,
      [
        {
          text: 'Thử lại',
          style: 'cancel',
          onPress: () => {
            // Reset exercises
            const exerciseData = generateExercises();
            setExercises([...exerciseData]); // Force re-render
          },
        },
        {
          text: 'Quay lại bài học',
          onPress: () => router.back(),
        },
      ]
    );
  };

  const handleExerciseProgress = (exerciseId: string, isCorrect: boolean) => {
    console.log(
      `Exercise ${exerciseId}: ${isCorrect ? 'Correct' : 'Incorrect'}`
    );
    // You can track progress here
  };

  if (exercises.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <TranslationText size="lg" style={styles.emptyText}>
            Đang tải bài tập...
          </TranslationText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.neutral[700]} />
        </TouchableOpacity>

        <View style={styles.headerContent}>
          <TranslationText
            size="lg"
            weight="semibold"
            style={styles.headerTitle}
          >
            Bài tập thực hành
          </TranslationText>
          <TranslationText size="sm" style={styles.headerSubtitle}>
            {exercises.length} câu hỏi
          </TranslationText>
        </View>

        <TouchableOpacity
          style={styles.helpButton}
          onPress={() =>
            Alert.alert(
              'Hướng dẫn',
              'Hãy nghe âm thanh và chọn đáp án đúng. Mỗi bài tập sẽ có phản hồi ngay lập tức.'
            )
          }
        >
          <Ionicons
            name="help-circle-outline"
            size={24}
            color={colors.neutral[700]}
          />
        </TouchableOpacity>
      </View>

      {/* Exercise Component */}
      <LessonExercise
        exercises={exercises}
        onComplete={handleExerciseComplete}
        onExerciseComplete={handleExerciseProgress}
        showProgress={true}
        allowReview={true}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: colors.neutral[900],
  },
  headerSubtitle: {
    color: colors.neutral[600],
    marginTop: 2,
  },
  helpButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  emptyText: {
    color: colors.neutral[600],
    textAlign: 'center',
  },
});
