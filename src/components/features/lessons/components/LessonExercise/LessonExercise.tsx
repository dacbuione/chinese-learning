import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

// Components
import { Card } from '../../../../ui/atoms/Card/Card';
import { Button } from '../../../../ui/atoms/Button/Button';
import { ChineseText, PinyinText, TranslationText } from '../../../../ui/atoms/Text';

// Hooks
import { useVocabularyTTS } from '../../../../../hooks/useTTS';

// Theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';

const { width: screenWidth } = Dimensions.get('window');

// Exercise Types
export type ExerciseType = 
  | 'translation-to-chinese'    // Dịch từ tiếng Việt sang tiếng Trung
  | 'translation-to-vietnamese' // Dịch từ tiếng Trung sang tiếng Việt
  | 'audio-matching'            // Nghe và chọn chữ đúng
  | 'multiple-choice'           // Chọn nghĩa đúng
  | 'character-ordering'        // Sắp xếp ký tự
  | 'tone-identification'       // Nhận biết thanh điệu
  | 'listening-comprehension'   // Nghe hiểu
  | 'pinyin-matching'           // Ghép chữ Hán với pinyin
  | 'conversation-completion'   // Hoàn thành đoạn hội thoại
  | 'grammar-fill-blank'        // Điền vào chỗ trống
  | 'sentence-building'         // Xây dựng câu
  | 'synonym-antonym';         // Từ đồng nghĩa/trái nghĩa

export interface ExerciseData {
  id: string;
  type: ExerciseType;
  question: string;
  chineseText?: string;
  pinyin?: string;
  vietnameseText?: string;
  englishText?: string;
  correctAnswer: string | string[];
  options: ExerciseOption[];
  audio?: string;
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  tone?: number;
}

export interface ExerciseOption {
  id: string;
  text: string;
  chineseText?: string;
  pinyin?: string;
  vietnameseText?: string;
  isCorrect: boolean;
  tone?: number;
}

export interface LessonExerciseProps {
  exercises: ExerciseData[];
  onComplete: (score: number, totalQuestions: number) => void;
  onExerciseComplete?: (exerciseId: string, isCorrect: boolean) => void;
  showProgress?: boolean;
  allowReview?: boolean;
}

export const LessonExercise: React.FC<LessonExerciseProps> = ({
  exercises,
  onComplete,
  onExerciseComplete,
  showProgress = true,
  allowReview = true,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [showExplanation, setShowExplanation] = useState(false);
  const [progress] = useState(new Animated.Value(0));
  const [feedbackAnimation] = useState(new Animated.Value(0));
  
  // Refs for auto scroll
  const scrollViewRef = useRef<ScrollView>(null);
  const feedbackRef = useRef<View>(null);
  
  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakVocabulary,
    stop: stopTTS,
  } = useVocabularyTTS();

  const currentExercise = exercises[currentIndex];
  const progressPercentage = ((currentIndex + 1) / exercises.length) * 100;

  // Update progress animation
  useEffect(() => {
    Animated.timing(progress, {
      toValue: progressPercentage,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [currentIndex, progressPercentage]);

  // Auto-play audio for audio exercises
  useEffect(() => {
    if (currentExercise?.type === 'audio-matching' && currentExercise.chineseText) {
      playExerciseAudio();
    }
  }, [currentIndex]);

  const playExerciseAudio = useCallback(async () => {
    if (!currentExercise?.chineseText) return;
    
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakVocabulary({
          simplified: currentExercise.chineseText,
          pinyin: currentExercise.pinyin || '',
          tone: currentExercise.tone,
        });
      }
    } catch (error) {
      console.error('Exercise audio error:', error);
    }
  }, [currentExercise, isTTSPlaying, speakVocabulary, stopTTS]);

  const handleOptionSelect = async (optionId: string) => {
    if (isAnswered) return;

    const option = currentExercise.options.find(opt => opt.id === optionId);
    if (!option) return;

    // Phát âm thanh khi bấm vào option
    if (option.chineseText) {
      try {
        await speakVocabulary({
          simplified: option.chineseText,
          pinyin: option.pinyin || '',
          tone: option.tone,
        });
      } catch (error) {
        console.error('Option audio error:', error);
      }
    }

    let newSelectedOptions: string[];
    
    // Handle multiple selection for character ordering
    if (currentExercise.type === 'character-ordering') {
      if (selectedOptions.includes(optionId)) {
        newSelectedOptions = selectedOptions.filter(id => id !== optionId);
      } else {
        newSelectedOptions = [...selectedOptions, optionId];
      }
      setSelectedOptions(newSelectedOptions);
    } else {
      // Single selection for other types - KHÔNG TỰ ĐỘNG KIỂM TRA
      newSelectedOptions = [optionId];
      setSelectedOptions(newSelectedOptions);
    }
  };

  const checkAnswer = (selected: string[]) => {
    const correctAnswer = Array.isArray(currentExercise.correctAnswer) 
      ? currentExercise.correctAnswer 
      : [currentExercise.correctAnswer];
    
    let correct = false;
    
    if (currentExercise.type === 'character-ordering' || currentExercise.type === 'sentence-building') {
      // Check if order is correct for both character ordering and sentence building
      correct = JSON.stringify(selected) === JSON.stringify(correctAnswer);
    } else {
      // Check if any selected option is correct
      correct = selected.some(id => 
        currentExercise.options.find(opt => opt.id === id)?.isCorrect
      );
    }
    
    setIsCorrect(correct);
    setIsAnswered(true);
    
    if (correct) {
      setScore(prev => prev + 1);
    }
    
    if (onExerciseComplete) {
      onExerciseComplete(currentExercise.id, correct);
    }
    
    // Show explanation if available
    if (currentExercise.explanation) {
      setShowExplanation(true);
    }
  };

  const handleCheckAnswer = () => {
    if (selectedOptions.length === 0) return;
    
    checkAnswer(selectedOptions);
  };

  const handleNextQuestion = () => {
    if (currentIndex < exercises.length - 1) {
      setCurrentIndex(prev => prev + 1);
      resetExerciseState();
    } else {
      // Hoàn thành tất cả bài tập
      onComplete(score, exercises.length);
    }
  };

  const resetExerciseState = () => {
    setSelectedOptions([]);
    setIsAnswered(false);
    setIsCorrect(false);
    setShowExplanation(false);
  };

  const getToneColor = (tone?: number) => {
    const toneColors = {
      1: colors.error[500],    // Thanh ngang - đỏ
      2: colors.warning[500],  // Thanh sắc - vàng
      3: colors.accent[500],   // Thanh huyền - xanh lá
      4: colors.primary[500],  // Thanh nặng - xanh dương
    };
    return toneColors[tone as keyof typeof toneColors] || colors.neutral[500];
  };

  const renderProgressBar = () => (
    <View style={styles.progressContainer}>
      <View style={styles.progressBackground}>
        <Animated.View 
          style={[
            styles.progressFill,
            {
              width: progress.interpolate({
                inputRange: [0, 100],
                outputRange: ['0%', '100%'],
                extrapolate: 'clamp',
              }),
            }
          ]} 
        />
      </View>
      <Text style={styles.progressText}>
        {currentIndex + 1}/{exercises.length}
      </Text>
    </View>
  );

  const renderTranslationExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        Dịch sang tiếng Trung:
      </TranslationText>
      
      <View style={styles.questionCard}>
        <Text style={styles.targetVietnamese}>
          {currentExercise.vietnameseText}
        </Text>
        {currentExercise.pinyin && (
          <Text style={styles.questionPinyin}>
            [{currentExercise.pinyin}]
          </Text>
        )}
      </View>
      
      <View style={styles.optionsContainer}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.translationOption,
              selectedOptions.includes(option.id) && styles.selectedOption,
              isAnswered && option.isCorrect && styles.correctOption,
              isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <Text style={styles.optionChinese}>
              {option.chineseText || option.text}
            </Text>
            {option.pinyin && (
              <Text style={styles.optionPinyin}>
                {option.pinyin}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderTranslationToVietnameseExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        Dịch sang tiếng Việt:
      </TranslationText>
      
      <View style={styles.questionCard}>
        <Text style={styles.targetChinese}>
          {currentExercise.chineseText || currentExercise.question}
        </Text>
        {currentExercise.pinyin && (
          <Text style={styles.questionPinyin}>
            [{currentExercise.pinyin}]
          </Text>
        )}
      </View>
      
      <View style={styles.optionsContainer}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.translationOption,
              selectedOptions.includes(option.id) && styles.selectedOption,
              isAnswered && option.isCorrect && styles.correctOption,
              isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <Text style={styles.optionVietnamese}>
              {option.vietnameseText || option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderAudioMatchingExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        {currentExercise.question}
      </TranslationText>
      
      {/* Audio Player with Panda Mascot */}
      <TouchableOpacity style={styles.audioPlayer} onPress={playExerciseAudio}>
        <LinearGradient
          colors={[colors.secondary[100], colors.secondary[200]]}
          style={styles.audioPlayerGradient}
        >
          <View style={styles.pandaMascot}>
            <Text style={styles.pandaEmoji}>🐼</Text>
            <View style={styles.headphones}>
              <Ionicons name="headset" size={24} color={colors.secondary[600]} />
            </View>
          </View>
          
          {/* Audio Wave Animation */}
          <View style={styles.audioWave}>
            {[1, 2, 3, 4, 5].map((_, index) => (
              <View
                key={index}
                style={[
                  styles.wavebar,
                  { 
                    height: isTTSPlaying ? Math.random() * 30 + 10 : 10,
                    backgroundColor: isTTSPlaying ? colors.secondary[500] : colors.neutral[300]
                  }
                ]}
              />
            ))}
          </View>
          
          <TouchableOpacity style={styles.replayButton} onPress={playExerciseAudio}>
            <Ionicons 
              name={isTTSPlaying ? "pause" : "play"} 
              size={20} 
              color={colors.secondary[600]} 
            />
          </TouchableOpacity>
        </LinearGradient>
      </TouchableOpacity>
      
      {/* Character Options */}
      <View style={styles.characterGrid}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.characterOption,
              selectedOptions.includes(option.id) && styles.selectedCharacter,
              isAnswered && !selectedOptions.includes(option.id) && styles.dimmedCharacter,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <ChineseText size="3xl" style={styles.characterText}>
              {option.chineseText}
            </ChineseText>
            <PinyinText size="sm" style={styles.characterPinyin}>
              {option.pinyin}
            </PinyinText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderMultipleChoiceExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        {currentExercise.question}
      </TranslationText>
      
      <Text style={styles.targetWord}>
        {currentExercise.vietnameseText}
      </Text>
      
      <View style={styles.choiceGrid}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.choiceOption,
              selectedOptions.includes(option.id) && styles.selectedChoice,
              isAnswered && option.isCorrect && styles.correctChoice,
              isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectChoice,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <View style={styles.choiceContent}>
              {option.pinyin && (
                <PinyinText size="base" style={styles.choicePinyin}>
                  {option.pinyin}
                </PinyinText>
              )}
              <ChineseText size="2xl" style={styles.choiceChinese}>
                {option.chineseText}
              </ChineseText>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderCharacterOrderingExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        {currentExercise.question}
      </TranslationText>
      
      {currentExercise.vietnameseText && (
        <Text style={styles.targetVietnamese}>
          {currentExercise.vietnameseText}
        </Text>
      )}
      
      <View style={styles.choiceGrid}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.choiceOption,
              selectedOptions.includes(option.id) && styles.selectedChoice,
              isAnswered && option.isCorrect && styles.correctChoice,
              isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectChoice,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <View style={styles.choiceContent}>
              <Text style={styles.choiceChinese}>
                {option.chineseText || option.text}
              </Text>
              {option.pinyin && (
                <Text style={styles.choicePinyin}>
                  {option.pinyin}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderToneIdentificationExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        {currentExercise.question}
      </TranslationText>
      
      <Text style={styles.targetText}>
        {currentExercise.chineseText}
      </Text>
      
      {currentExercise.vietnameseText && (
        <Text style={styles.targetVietnamese}>
          {currentExercise.vietnameseText}
        </Text>
      )}
      
      <View style={styles.optionsContainer}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.toneOption,
              selectedOptions.includes(option.id) && styles.selectedOption,
              isAnswered && option.isCorrect && styles.correctOption,
              isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <View style={[styles.toneIndicator, { backgroundColor: getToneColor(option.tone) }]} />
            <Text style={styles.optionText}>
              {option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderPinyinMatchingExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        {currentExercise.question}
      </TranslationText>
      
      <Text style={styles.targetText}>
        {currentExercise.chineseText}
      </Text>
      
      {currentExercise.vietnameseText && (
        <Text style={styles.targetVietnamese}>
          {currentExercise.vietnameseText}
        </Text>
      )}
      
      <View style={styles.optionsContainer}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.translationOption,
              selectedOptions.includes(option.id) && styles.selectedOption,
              isAnswered && option.isCorrect && styles.correctOption,
              isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <Text style={styles.optionPinyin}>
              {option.pinyin || option.text}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderConversationExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        {currentExercise.question}
      </TranslationText>
      
      {currentExercise.vietnameseText && (
        <Text style={styles.targetVietnamese}>
          {currentExercise.vietnameseText}
        </Text>
      )}
      
      <View style={styles.optionsContainer}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.conversationOption,
              selectedOptions.includes(option.id) && styles.selectedOption,
              isAnswered && option.isCorrect && styles.correctOption,
              isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <Text style={styles.optionChinese}>
              {option.chineseText || option.text}
            </Text>
            {option.pinyin && (
              <Text style={styles.optionPinyin}>
                {option.pinyin}
              </Text>
            )}
            {option.vietnameseText && (
              <Text style={styles.optionVietnamese}>
                {option.vietnameseText}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderGrammarFillBlankExercise = () => {
    // Tách question thành phần trước và sau chỗ trống
    const questionParts = currentExercise.question.split('____');
    const beforeBlank = questionParts[0] || '';
    const afterBlank = questionParts[1] || '';
    
    return (
      <View style={styles.exerciseContainer}>
        <TranslationText size="xl" weight="medium" style={styles.questionText}>
          Điền từ phù hợp vào chỗ trống:
        </TranslationText>
        
        {/* Câu có chỗ trống */}
        <View style={styles.fillBlankContainer}>
          <Text style={styles.sentencePart}>{beforeBlank}</Text>
          <View style={styles.blankSpace}>
            {selectedOptions.length > 0 ? (
              <Text style={styles.filledText}>
                {currentExercise.options.find(opt => opt.id === selectedOptions[0])?.chineseText || '____'}
              </Text>
            ) : (
              <Text style={styles.blankText}>____</Text>
            )}
          </View>
          <Text style={styles.sentencePart}>{afterBlank}</Text>
        </View>
        
        {/* Nghĩa tiếng Việt */}
        {currentExercise.vietnameseText && (
          <Text style={styles.translationHint}>
            {currentExercise.vietnameseText}
          </Text>
        )}
        
        {/* Options */}
        <View style={styles.grammarOptionsGrid}>
          {currentExercise.options.map((option) => (
            <TouchableOpacity
              key={option.id}
              style={[
                styles.grammarOptionCard,
                selectedOptions.includes(option.id) && styles.selectedChoice,
                isAnswered && option.isCorrect && styles.correctChoice,
                isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectChoice,
              ]}
              onPress={() => handleOptionSelect(option.id)}
              disabled={isAnswered}
            >
              <Text style={styles.grammarOptionChinese}>
                {option.chineseText || option.text}
              </Text>
              {option.pinyin && (
                <Text style={styles.grammarOptionPinyin}>
                  {option.pinyin}
                </Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderSentenceBuildingExercise = () => {
    return (
      <View style={styles.exerciseContainer}>
        <TranslationText size="xl" weight="medium" style={styles.questionText}>
          {currentExercise.question}
        </TranslationText>
        
        {/* Câu mục tiêu */}
        <View style={styles.questionCard}>
          <Text style={styles.targetVietnamese}>
            {currentExercise.vietnameseText}
          </Text>
        </View>
        
        {/* Khu vực xây dựng câu */}
        <View style={styles.sentenceBuilder}>
          <Text style={styles.builderLabel}>Câu của bạn:</Text>
          <View style={styles.sentenceArea}>
            {selectedOptions.length > 0 ? (
              <View style={styles.builtSentence}>
                {selectedOptions.map((optionId, index) => {
                  const option = currentExercise.options.find(opt => opt.id === optionId);
                  return (
                    <TouchableOpacity
                      key={`${optionId}-${index}`}
                      style={styles.selectedWord}
                      onPress={() => {
                        // Cho phép bỏ chọn từ đã chọn
                        if (!isAnswered) {
                          setSelectedOptions(prev => prev.filter((_, i) => i !== index));
                        }
                      }}
                      disabled={isAnswered}
                    >
                      <Text style={styles.selectedWordText}>
                        {option?.chineseText || option?.text}
                      </Text>
                      {option?.pinyin && (
                        <Text style={styles.selectedWordPinyin}>
                          {option.pinyin}
                        </Text>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : (
              <View style={styles.emptySentence}>
                <Text style={styles.emptySentenceText}>
                  Chọn các từ bên dưới để tạo câu
                </Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Các từ để chọn */}
        <View style={styles.wordBank}>
          <Text style={styles.wordBankLabel}>Chọn từ:</Text>
          <View style={styles.wordOptions}>
            {currentExercise.options.map((option) => {
              const isSelected = selectedOptions.includes(option.id);
              const isUsed = selectedOptions.includes(option.id);
              
              return (
                <TouchableOpacity
                  key={option.id}
                  style={[
                    styles.wordOption,
                    isUsed && styles.usedWord,
                    isAnswered && option.isCorrect && styles.correctChoice,
                    isAnswered && isUsed && !option.isCorrect && styles.incorrectChoice,
                  ]}
                  onPress={() => {
                    if (!isAnswered && !isUsed) {
                      setSelectedOptions(prev => [...prev, option.id]);
                    }
                  }}
                  disabled={isAnswered || isUsed}
                >
                  <Text style={[
                    styles.wordOptionText,
                    isUsed && { color: colors.neutral[500] }
                  ]}>
                    {option.chineseText || option.text}
                  </Text>
                  {option.pinyin && (
                    <Text style={[
                      styles.wordOptionPinyin,
                      isUsed && { color: colors.neutral[400] }
                    ]}>
                      {option.pinyin}
                    </Text>
                  )}
                  {option.vietnameseText && (
                    <Text style={[
                      styles.wordOptionVietnamese,
                      isUsed && { color: colors.neutral[500] }
                    ]}>
                      {option.vietnameseText}
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    );
  };

  const renderSynonymAntonymExercise = () => (
    <View style={styles.exerciseContainer}>
      <TranslationText size="xl" weight="medium" style={styles.questionText}>
        {currentExercise.question}
      </TranslationText>
      
      {currentExercise.vietnameseText && (
        <Text style={styles.targetVietnamese}>
          {currentExercise.vietnameseText}
        </Text>
      )}
      
      <View style={styles.optionsContainer}>
        {currentExercise.options.map((option) => (
          <TouchableOpacity
            key={option.id}
            style={[
              styles.translationOption,
              selectedOptions.includes(option.id) && styles.selectedOption,
              isAnswered && option.isCorrect && styles.correctOption,
              isAnswered && selectedOptions.includes(option.id) && !option.isCorrect && styles.incorrectOption,
            ]}
            onPress={() => handleOptionSelect(option.id)}
            disabled={isAnswered}
          >
            <Text style={styles.optionChinese}>
              {option.chineseText || option.text}
            </Text>
            {option.pinyin && (
              <Text style={styles.optionPinyin}>
                {option.pinyin}
              </Text>
            )}
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  const renderExerciseContent = () => {
    switch (currentExercise.type) {
      case 'translation-to-chinese':
        return renderTranslationExercise();
      case 'translation-to-vietnamese':
        return renderTranslationToVietnameseExercise();
      case 'audio-matching':
        return renderAudioMatchingExercise();
      case 'multiple-choice':
        return renderMultipleChoiceExercise();
      case 'character-ordering':
        return renderCharacterOrderingExercise();
      case 'tone-identification':
        return renderToneIdentificationExercise();
      case 'pinyin-matching':
        return renderPinyinMatchingExercise();
      case 'conversation-completion':
        return renderConversationExercise();
      case 'grammar-fill-blank':
        return renderGrammarFillBlankExercise();
      case 'sentence-building':
        return renderSentenceBuildingExercise();
      case 'synonym-antonym':
        return renderSynonymAntonymExercise();
      case 'listening-comprehension':
        return renderConversationExercise();
      default:
        return renderTranslationExercise();
    }
  };

  const renderFeedback = () => {
    if (!isAnswered) return null;

    return (
      <Animated.View style={[
        styles.feedbackContainer,
        isCorrect ? styles.correctFeedback : styles.incorrectFeedback,
        {
          opacity: feedbackAnimation,
          transform: [
            {
              translateY: feedbackAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [30, 0],
              }),
            },
            {
              scale: feedbackAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0.9, 1],
              }),
            },
          ],
        },
      ]}>
        <View style={styles.feedbackContent}>
          <View style={styles.feedbackHeader}>
            <Ionicons
              name={isCorrect ? 'checkmark-circle' : 'close-circle'}
              size={24}
              color={isCorrect ? colors.accent[500] : colors.error[500]}
            />
            <Text style={[
              styles.feedbackTitle,
              { color: isCorrect ? colors.accent[600] : colors.error[600] }
            ]}>
              {isCorrect ? '🎉 Chính xác!' : '❌ Chưa đúng'}
            </Text>
          </View>

          {currentExercise.explanation && showExplanation && (
            <View style={styles.explanationContainer}>
              <Text style={styles.explanationTitle}>💡 Giải thích:</Text>
              <Text style={styles.explanationText}>
                {currentExercise.explanation}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>
    );
  };

  const renderActionButtons = () => (
    <View style={styles.actionButtonsContainer}>
      {!isAnswered ? (
        // Show check button for character ordering and sentence building, or when user has made selection
        (currentExercise.type === 'character-ordering' || 
         currentExercise.type === 'sentence-building' || 
         selectedOptions.length > 0) && (
          <Button
            variant="primary"
            onPress={handleCheckAnswer}
            style={styles.checkButton}
            disabled={selectedOptions.length === 0}
          >
            Kiểm tra
          </Button>
        )
      ) : (
        <Button
          variant="primary"
          onPress={handleNextQuestion}
          style={styles.continueButton}
        >
          {currentIndex < exercises.length - 1 ? 'Tiếp tục' : 'Hoàn thành'}
        </Button>
      )}
    </View>
  );

  // Auto scroll to feedback when answered
  useEffect(() => {
    if (isAnswered) {
      // Animate feedback appearance
      Animated.spring(feedbackAnimation, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }).start();

      // Auto scroll to feedback
      if (feedbackRef.current && scrollViewRef.current) {
        setTimeout(() => {
          feedbackRef.current?.measureLayout(
            scrollViewRef.current as any,
            (x, y) => {
              scrollViewRef.current?.scrollTo({
                y: y - 50, // Scroll một chút lên trên feedback
                animated: true,
              });
            },
            () => {} // onFail callback
          );
        }, 400); // Delay để animation feedback hoàn thành trước
      }
    } else {
      // Reset animation khi chuyển câu mới
      feedbackAnimation.setValue(0);
    }
  }, [isAnswered]);

  return (
    <View style={styles.container}>
      {showProgress && renderProgressBar()}
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        ref={scrollViewRef}
      >
        <View style={styles.exerciseContainer}>
          {renderExerciseContent()}
        </View>
        
        {/* Feedback hiển thị ngay sau exercise content */}
        <View ref={feedbackRef}>
          {renderFeedback()}
        </View>
      </ScrollView>
      
      {renderActionButtons()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('md'),
  },
  progressBackground: {
    flex: 1,
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.accent[500],
    borderRadius: 4,
  },
  progressText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[600],
    minWidth: 40,
  },
  
  // Exercise Card
  exerciseCard: {
    flex: 1,
    padding: getResponsiveSpacing('xl'),
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: getResponsiveSpacing('lg'),
    paddingBottom: getResponsiveSpacing('2xl'),
  },
  exerciseContainer: {
    flex: 1,
    minHeight: 400, // Đảm bảo có chiều cao tối thiểu
  },
  questionText: {
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('xl'),
    color: colors.neutral[800],
  },
  targetText: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('2xl'),
  },
  targetWord: {
    fontSize: getResponsiveFontSize('3xl'),
    fontWeight: '700',
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('2xl'),
  },
  targetPinyin: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('2xl'),
  },
  
  // Translation Exercise
  optionsContainer: {
    width: '100%',
    gap: getResponsiveSpacing('md'),
  },
  translationOption: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
  },
  selectedOption: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  correctOption: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  incorrectOption: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  optionVietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    textAlign: 'center',
    fontWeight: '500',
  },
  optionPinyin: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: getResponsiveSpacing('xs'),
  },
  optionChinese: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[900],
    textAlign: 'center',
    fontWeight: '600',
  },
  
  // Audio Matching Exercise
  audioPlayer: {
    width: screenWidth * 0.8,
    height: 150,
    marginBottom: getResponsiveSpacing('2xl'),
  },
  audioPlayerGradient: {
    flex: 1,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: getResponsiveSpacing('lg'),
  },
  pandaMascot: {
    alignItems: 'center',
    position: 'relative',
  },
  pandaEmoji: {
    fontSize: 48,
  },
  headphones: {
    position: 'absolute',
    top: -5,
    right: -10,
  },
  audioWave: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  wavebar: {
    width: 4,
    borderRadius: 2,
    backgroundColor: colors.neutral[300],
  },
  replayButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  // Character Grid
  characterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: getResponsiveSpacing('md'),
    width: '100%',
  },
  characterOption: {
    width: Layout.isMobile ? '45%' : '30%',
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.neutral[200],
  },
  selectedCharacter: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  dimmedCharacter: {
    opacity: 0.5,
  },
  characterText: {
    color: colors.neutral[900],
  },
  characterPinyin: {
    color: colors.primary[600],
    marginTop: getResponsiveSpacing('xs'),
  },
  
  // Multiple Choice
  choiceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
    width: '100%',
  },
  choiceOption: {
    width: Layout.isMobile ? '45%' : '40%',
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: getResponsiveSpacing('lg'),
    borderWidth: 2,
    borderColor: colors.neutral[200],
    minHeight: 100,
  },
  selectedChoice: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  correctChoice: {
    borderColor: colors.accent[500],
    backgroundColor: colors.accent[50],
  },
  incorrectChoice: {
    borderColor: colors.error[500],
    backgroundColor: colors.error[50],
  },
  choiceContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  choicePinyin: {
    color: colors.primary[600],
    marginBottom: getResponsiveSpacing('xs'),
  },
  choiceChinese: {
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  
  // Feedback
  feedbackContainer: {
    marginTop: getResponsiveSpacing('xl'),
    padding: getResponsiveSpacing('lg'),
    borderRadius: 12,
  },
  correctFeedback: {
    backgroundColor: colors.accent[50],
  },
  incorrectFeedback: {
    backgroundColor: colors.error[50],
  },
  feedbackContent: {
    padding: getResponsiveSpacing('lg'),
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  feedbackTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
  },
  explanationContainer: {
    marginTop: getResponsiveSpacing('sm'),
  },
  explanationTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  explanationText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    lineHeight: 22,
  },
  
  // Action Buttons
  actionButtonsContainer: {
    backgroundColor: colors.neutral[50],
    padding: getResponsiveSpacing('lg'),
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  checkButton: {
    backgroundColor: colors.primary[500],
    borderRadius: 12,
  },
  continueButton: {
    backgroundColor: colors.accent[500],
    borderRadius: 12,
  },
  autoAdvanceContainer: {
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[200],
    borderRadius: 12,
    alignItems: 'center',
  },
  autoAdvanceText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[600],
  },
  
  // Tone Identification Exercise
  toneOption: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    borderWidth: 2,
    borderColor: colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toneIndicator: {
    width: 16,
    height: 16,
    borderRadius: 8,
    marginRight: getResponsiveSpacing('sm'),
  },
  optionText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    fontWeight: '500',
    marginLeft: getResponsiveSpacing('sm'),
  },
  
  // Conversation Exercise
  conversationOption: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    borderWidth: 2,
    borderColor: colors.neutral[200],
    alignItems: 'center',
    minHeight: 80,
    justifyContent: 'center',
  },
  
  // Grammar Fill Blank Exercise
  fillBlankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  sentencePart: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '600',
    color: colors.neutral[900],
  },
  blankSpace: {
    minWidth: 60,
    minHeight: 40,
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.neutral[300],
    borderStyle: 'dashed',
    marginHorizontal: getResponsiveSpacing('sm'),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('sm'),
  },
  filledText: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '700',
    color: colors.primary[600],
    textAlign: 'center',
  },
  blankText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '400',
    color: colors.neutral[400],
    textAlign: 'center',
  },
  translationHint: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    marginTop: getResponsiveSpacing('sm'),
  },
  grammarOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
    width: '100%',
    marginTop: getResponsiveSpacing('md'),
  },
  grammarOptionCard: {
    width: Layout.isMobile ? '45%' : '40%', 
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: getResponsiveSpacing('lg'),
    borderWidth: 2,
    borderColor: colors.neutral[200],
    minHeight: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  grammarOptionChinese: {
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  grammarOptionPinyin: {
    color: colors.primary[600],
    marginBottom: getResponsiveSpacing('xs'),
  },
  grammarOptionVietnamese: {
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  
  // Question Card
  questionCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: getResponsiveSpacing('xl'),
    marginBottom: getResponsiveSpacing('xl'),
    alignItems: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  questionPinyin: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    textAlign: 'center',
    marginTop: getResponsiveSpacing('sm'),
    fontStyle: 'italic',
  },
  targetChinese: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  targetVietnamese: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[800],
    textAlign: 'center',
  },
  
  // Sentence Building Exercise
  sentenceBuilder: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  builderLabel: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginRight: getResponsiveSpacing('md'),
  },
  sentenceArea: {
    flex: 1,
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
  },
  builtSentence: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
  },
  selectedWord: {
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    padding: getResponsiveSpacing('md'),
  },
  selectedWordText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
  },
  selectedWordPinyin: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    marginTop: getResponsiveSpacing('xs'),
  },
  emptySentence: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptySentenceText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[400],
  },
  
  // Word Bank
  wordBank: {
    marginTop: getResponsiveSpacing('xl'),
  },
  wordBankLabel: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },
  wordOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('md'),
  },
  wordOption: {
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: getResponsiveSpacing('md'),
  },
  usedWord: {
    backgroundColor: colors.primary[50],
  },
  wordOptionText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
  },
  wordOptionPinyin: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    marginTop: getResponsiveSpacing('xs'),
  },
  wordOptionVietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
  },
}); 