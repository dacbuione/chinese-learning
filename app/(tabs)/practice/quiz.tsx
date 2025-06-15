import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, getResponsiveSpacing, getResponsiveFontSize } from '../../../src/theme';

interface QuizQuestion {
  id: string;
  type: 'multiple-choice' | 'translation' | 'tone';
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

interface QuizData {
  lessonId: string;
  title: string;
  questions: QuizQuestion[];
}

const quizData: Record<string, QuizData> = {
  'chao-hoi': {
    lessonId: 'chao-hoi',
    title: 'Kiểm tra: Chào hỏi cơ bản',
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        question: '"你好" có nghĩa là gì?',
        options: ['Tạm biệt', 'Xin chào', 'Cảm ơn', 'Xin lỗi'],
        correctAnswer: 1,
        explanation: '你好 (nǐ hǎo) là cách chào hỏi phổ biến nhất trong tiếng Trung'
      },
      {
        id: '2',
        type: 'tone',
        question: '"好" trong "你好" có thanh điệu nào?',
        options: ['Thanh 1 (ngang)', 'Thanh 2 (sắc)', 'Thanh 3 (huyền)', 'Thanh 4 (nặng)'],
        correctAnswer: 2,
        explanation: '"好" đọc là "hǎo" với thanh 3 (huyền)'
      },
      {
        id: '3',
        type: 'translation',
        question: 'Dịch sang tiếng Trung: "Cảm ơn"',
        options: ['你好', '再见', '谢谢', '不客气'],
        correctAnswer: 2,
        explanation: '"Cảm ơn" trong tiếng Trung là "谢谢" (xiè xiè)'
      },
      {
        id: '4',
        type: 'multiple-choice',
        question: 'Khi ai đó nói "谢谢", bạn trả lời gì?',
        options: ['你好', '再见', '谢谢', '不客气'],
        correctAnswer: 3,
        explanation: '"不客气" (bù kè qì) có nghĩa là "không có gì" - cách đáp lại khi được cảm ơn'
      },
      {
        id: '5',
        type: 'tone',
        question: '"见" trong "再见" có thanh điệu nào?',
        options: ['Thanh 1 (ngang)', 'Thanh 2 (sắc)', 'Thanh 3 (huyền)', 'Thanh 4 (nặng)'],
        correctAnswer: 3,
        explanation: '"见" đọc là "jiàn" với thanh 4 (nặng)'
      }
    ]
  },
  'so-dem': {
    lessonId: 'so-dem',
    title: 'Kiểm tra: Số đếm 1-10',
    questions: [
      {
        id: '1',
        type: 'multiple-choice',
        question: 'Số "3" trong tiếng Trung là gì?',
        options: ['二', '三', '四', '五'],
        correctAnswer: 1,
        explanation: 'Số 3 trong tiếng Trung là "三" (sān)'
      },
      {
        id: '2',
        type: 'translation',
        question: 'Chọn số "5" trong tiếng Trung:',
        options: ['四', '五', '六', '七'],
        correctAnswer: 1,
        explanation: 'Số 5 trong tiếng Trung là "五" (wǔ)'
      },
      {
        id: '3',
        type: 'tone',
        question: '"一" có thanh điệu nào?',
        options: ['Thanh 1 (ngang)', 'Thanh 2 (sắc)', 'Thanh 3 (huyền)', 'Thanh 4 (nặng)'],
        correctAnswer: 0,
        explanation: '"一" đọc là "yī" với thanh 1 (ngang)'
      },
      {
        id: '4',
        type: 'multiple-choice',
        question: 'Số nào đây là "四"?',
        options: ['3', '4', '5', '6'],
        correctAnswer: 1,
        explanation: '"四" (sì) là số 4 trong tiếng Trung'
      },
      {
        id: '5',
        type: 'translation',
        question: 'Số "2" trong tiếng Trung là:',
        options: ['一', '二', '三', '四'],
        correctAnswer: 1,
        explanation: 'Số 2 trong tiếng Trung là "二" (èr)'
      }
    ]
  }
};

export default function QuizScreen() {
  const { lesson } = useLocalSearchParams<{ lesson: string }>();
  const router = useRouter();
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [quizStarted, setQuizStarted] = useState(false);

  const quiz = lesson ? quizData[lesson] : null;

  useEffect(() => {
    if (quizStarted && timeLeft > 0 && !showResult) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResult) {
      handleFinishQuiz();
    }
  }, [timeLeft, quizStarted, showResult]);

  if (!quiz) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy bài kiểm tra</Text>
          <TouchableOpacity style={styles.button} onPress={() => router.back()}>
            <Text style={styles.buttonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartQuiz = () => {
    setQuizStarted(true);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    setSelectedAnswer(answerIndex);
  };

  const handleNextQuestion = () => {
    if (selectedAnswer === null) return;

    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = selectedAnswer;
    setUserAnswers(newAnswers);

    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(null);
    } else {
      handleFinishQuiz(newAnswers);
    }
  };

  const handleFinishQuiz = (answers = userAnswers) => {
    const finalAnswers = [...answers];
    if (selectedAnswer !== null && finalAnswers.length === currentQuestion) {
      finalAnswers.push(selectedAnswer);
    }
    setUserAnswers(finalAnswers);
    setShowResult(true);
  };

  const calculateScore = () => {
    let correct = 0;
    quiz.questions.forEach((question, index) => {
      if (userAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / quiz.questions.length) * 100);
  };

  const getScoreMessage = (score: number) => {
    if (score >= 90) return 'Xuất sắc! 🎉';
    if (score >= 80) return 'Tốt lắm! 👏';
    if (score >= 70) return 'Khá tốt! 👍';
    if (score >= 60) return 'Cần cố gắng thêm! 💪';
    return 'Hãy ôn tập lại bài học! 📚';
  };

  if (!quizStarted) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.startContainer}>
          <Text style={styles.quizTitle}>{quiz.title}</Text>
          <Text style={styles.quizInfo}>
            • {quiz.questions.length} câu hỏi{'\n'}
            • Thời gian: 5 phút{'\n'}
            • Cần đạt 60% để qua bài
          </Text>
          <TouchableOpacity style={styles.startButton} onPress={handleStartQuiz}>
            <Text style={styles.startButtonText}>Bắt đầu kiểm tra</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  if (showResult) {
    const score = calculateScore();
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Kết quả kiểm tra</Text>
          <Text style={styles.scoreText}>{score}%</Text>
          <Text style={styles.scoreMessage}>{getScoreMessage(score)}</Text>
          
          <View style={styles.resultDetails}>
            <Text style={styles.resultDetailText}>
              Đúng: {userAnswers.filter((answer, index) => answer === quiz.questions[index].correctAnswer).length}/{quiz.questions.length}
            </Text>
            <Text style={styles.resultDetailText}>
              Thời gian còn lại: {formatTime(timeLeft)}
            </Text>
          </View>

          <View style={styles.resultActions}>
            <TouchableOpacity 
              style={styles.button}
              onPress={() => {
                setCurrentQuestion(0);
                setSelectedAnswer(null);
                setUserAnswers([]);
                setShowResult(false);
                setTimeLeft(300);
                setQuizStarted(false);
              }}
            >
              <Text style={styles.buttonText}>Làm lại</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.primaryButton]}
              onPress={() => {
                if (lesson) {
                  router.push(`/(tabs)/lessons/${lesson}`);
                } else {
                  router.back();
                }
              }}
            >
              <Text style={[styles.buttonText, styles.primaryButtonText]}>Quay lại bài học</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = quiz.questions[currentQuestion];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => {
          if (lesson) {
            router.push(`/(tabs)/lessons/${lesson}`);
          } else {
            router.back();
          }
        }}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <Text style={styles.progressText}>
          Câu hỏi {currentQuestion + 1}/{quiz.questions.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Question */}
      <ScrollView style={styles.content}>
        <View style={styles.questionContainer}>
          <Text style={styles.questionType}>
            {currentQ.type === 'multiple-choice' ? '📝 Trắc nghiệm' :
             currentQ.type === 'translation' ? '🔄 Dịch thuật' : '🎵 Thanh điệu'}
          </Text>
          <Text style={styles.questionText}>{currentQ.question}</Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQ.options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswer === index && styles.selectedOption
              ]}
              onPress={() => handleAnswerSelect(index)}
            >
              <Text style={[
                styles.optionText,
                selectedAnswer === index && styles.selectedOptionText
              ]}>
                {String.fromCharCode(65 + index)}. {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Next Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            selectedAnswer === null && styles.disabledButton
          ]}
          onPress={handleNextQuestion}
          disabled={selectedAnswer === null}
        >
          <Text style={[
            styles.nextButtonText,
            selectedAnswer === null && styles.disabledButtonText
          ]}>
            {currentQuestion === quiz.questions.length - 1 ? 'Hoàn thành' : 'Tiếp theo'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  startContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  quizTitle: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  quizInfo: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: getResponsiveSpacing('xl'),
  },
  startButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: getResponsiveSpacing('xl'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 12,
    marginBottom: getResponsiveSpacing('md'),
  },
  startButtonText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsiveSpacing('lg'),
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontWeight: '500',
  },
  timerText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.error[500],
  },
  progressContainer: {
    padding: getResponsiveSpacing('lg'),
  },
  progressText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('sm'),
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  content: {
    flex: 1,
    padding: getResponsiveSpacing('lg'),
  },
  questionContainer: {
    marginBottom: getResponsiveSpacing('xl'),
  },
  questionType: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('sm'),
  },
  questionText: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[900],
    lineHeight: 28,
  },
  optionsContainer: {
    gap: getResponsiveSpacing('md'),
  },
  optionButton: {
    backgroundColor: colors.neutral[100],
    padding: getResponsiveSpacing('lg'),
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    backgroundColor: colors.primary[50],
    borderColor: colors.primary[500],
  },
  optionText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
  },
  selectedOptionText: {
    color: colors.primary[700],
    fontWeight: '500',
  },
  footer: {
    padding: getResponsiveSpacing('lg'),
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  nextButton: {
    backgroundColor: colors.primary[500],
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 12,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
  disabledButton: {
    backgroundColor: colors.neutral[300],
  },
  disabledButtonText: {
    color: colors.neutral[500],
  },
  resultContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  resultTitle: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
  },
  scoreText: {
    fontSize: getResponsiveFontSize('6xl'),
    fontWeight: '700',
    color: colors.primary[500],
    marginBottom: getResponsiveSpacing('md'),
  },
  scoreMessage: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('xl'),
  },
  resultDetails: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  resultDetailText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('xs'),
  },
  resultActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
  },
  button: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 12,
  },
  buttonText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '500',
    color: colors.neutral[700],
  },
  primaryButton: {
    backgroundColor: colors.primary[500],
  },
  primaryButtonText: {
    color: colors.neutral[50],
  },
  backButton: {
    backgroundColor: colors.neutral[200],
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 12,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  errorText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('lg'),
  },
}); 