import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert, Platform } from 'react-native';
import { useNativeSpeechRecognition, NativeSpeechConfig } from '../../../../../hooks/useNativeSpeechRecognition';
import { PronunciationEvaluationService, PronunciationResult } from '../../../../../services/pronunciationEvaluationService';
import { Button } from '../../../../ui/atoms/Button';
import { Card } from '../../../../ui/atoms/Card';
import { ChineseText } from '../../../../ui/atoms/Text/ChineseText';
import { BaseText } from '../../../../ui/atoms/Text/BaseText';
import { Loading } from '../../../../ui/atoms/Loading';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';

// Word accuracy interface for highlighting
export interface WordAccuracy {
  word: string;
  isCorrect: boolean;
  confidence: number;
  expectedWord?: string;
}

export interface NativeSpeechRecognitionProps {
  expectedText: string;
  language?: 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'vi-VN';
  onResult?: (result: PronunciationResult) => void;
  onError?: (error: string) => void;
  onWordAccuracy?: (wordAccuracies: WordAccuracy[]) => void;
  maxDuration?: number; // milliseconds
  disabled?: boolean;
  showExpectedText?: boolean;
  autoEvaluate?: boolean;
}

export const NativeSpeechRecognitionComponent: React.FC<NativeSpeechRecognitionProps> = ({
  expectedText,
  language = 'zh-CN',
  onResult,
  onError,
  onWordAccuracy,
  maxDuration = 30000,
  disabled = false,
  showExpectedText = true,
  autoEvaluate = true,
}) => {
  // Native speech recognition hook
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    isSupported,
    hasPermission,
    error: speechError,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  } = useNativeSpeechRecognition();

  // Local states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PronunciationResult | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(maxDuration);

  // Handle recording timeout
  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;
    let intervalId: ReturnType<typeof setInterval>;

    if (listening && recordingStartTime) {
      // Update countdown every second
      intervalId = setInterval(() => {
        const elapsed = Date.now() - recordingStartTime;
        const remaining = Math.max(0, maxDuration - elapsed);
        setTimeRemaining(remaining);

        if (remaining <= 0) {
          handleStopRecording();
        }
      }, 100);

      // Auto-stop after maxDuration
      timeoutId = setTimeout(() => {
        handleStopRecording();
      }, maxDuration);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [listening, recordingStartTime, maxDuration]);

  // Handle speech recognition errors
  useEffect(() => {
    if (speechError) {
      onError?.(speechError);
    }
  }, [speechError, onError]);

  // Auto-evaluate when final transcript is available
  useEffect(() => {
    if (autoEvaluate && finalTranscript && !listening && !isEvaluating) {
      handleEvaluatePronunciation(finalTranscript);
    }
  }, [finalTranscript, listening, isEvaluating, autoEvaluate]);

  const handleStartRecording = useCallback(async () => {
    try {
      if (!isSupported) {
        Alert.alert(
          'Không hỗ trợ',
          'Thiết bị này không hỗ trợ nhận diện giọng nói.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!hasPermission) {
        Alert.alert(
          'Cần quyền truy cập',
          'Ứng dụng cần quyền truy cập microphone để nhận diện giọng nói.',
          [
            { text: 'Hủy', style: 'cancel' },
            { text: 'Cài đặt', onPress: () => {
              // On iOS/Android, user needs to go to Settings manually
              Alert.alert(
                'Hướng dẫn',
                Platform.OS === 'ios' 
                  ? 'Vào Settings > Privacy & Security > Microphone > Chinese Learning App và bật quyền.'
                  : 'Vào Settings > Apps > Chinese Learning App > Permissions > Microphone và bật quyền.',
                [{ text: 'OK' }]
              );
            }}
          ]
        );
        return;
      }

      // Reset states
      resetTranscript();
      setEvaluationResult(null);
      setRecordingStartTime(Date.now());
      setTimeRemaining(maxDuration);

      // Start listening
      const config: NativeSpeechConfig = {
        language,
        continuous: false,
        interimResults: true,
        maxAlternatives: 5,
        timeout: maxDuration,
      };

      await startListening(config);

    } catch (err: any) {
      console.error('Error starting recording:', err);
      onError?.(err.message || 'Không thể bắt đầu ghi âm');
    }
  }, [
    isSupported, 
    hasPermission, 
    language, 
    maxDuration, 
    startListening, 
    resetTranscript, 
    onError
  ]);

  const handleStopRecording = useCallback(async () => {
    try {
      await stopListening();
      setRecordingStartTime(null);
    } catch (err: any) {
      console.error('Error stopping recording:', err);
      onError?.(err.message || 'Không thể dừng ghi âm');
    }
  }, [stopListening, onError]);

  const handleAbortRecording = useCallback(async () => {
    try {
      await abortListening();
      setRecordingStartTime(null);
      setEvaluationResult(null);
    } catch (err: any) {
      console.error('Error aborting recording:', err);
      onError?.(err.message || 'Không thể hủy ghi âm');
    }
  }, [abortListening, onError]);

  const handleEvaluatePronunciation = useCallback(async (transcriptToEvaluate: string) => {
    if (!transcriptToEvaluate.trim()) {
      onError?.('Không có văn bản để đánh giá');
      return;
    }

    try {
      setIsEvaluating(true);
      
      const result = await PronunciationEvaluationService.evaluatePronunciation(
        transcriptToEvaluate,
        expectedText,
        language as 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US'
      );

      setEvaluationResult(result);
      onResult?.(result);

      // Generate word-level accuracy for highlighting
      const wordAccuracies = generateWordAccuracies(transcriptToEvaluate, expectedText);
      onWordAccuracy?.(wordAccuracies);

    } catch (err: any) {
      console.error('Error evaluating pronunciation:', err);
      onError?.(err.message || 'Không thể đánh giá phát âm');
    } finally {
      setIsEvaluating(false);
    }
  }, [expectedText, language, onResult, onError, onWordAccuracy]);

  const generateWordAccuracies = (spoken: string, expected: string): WordAccuracy[] => {
    // Simple word-level comparison for Chinese characters
    const spokenChars = spoken.replace(/[，。！？\s]/g, '').split('');
    const expectedChars = expected.replace(/[，。！？\s]/g, '').split('');
    
    const wordAccuracies: WordAccuracy[] = [];
    
    expectedChars.forEach((expectedChar, index) => {
      const spokenChar = spokenChars[index];
      const isCorrect = spokenChar === expectedChar;
      
      wordAccuracies.push({
        word: expectedChar,
        isCorrect,
        confidence: isCorrect ? 0.95 : 0.3,
        expectedWord: expectedChar,
      });
    });
    
    return wordAccuracies;
  };

  const handleRetry = useCallback(() => {
    resetTranscript();
    setEvaluationResult(null);
    setRecordingStartTime(null);
    // Clear word highlighting
    onWordAccuracy?.([]);
  }, [resetTranscript, onWordAccuracy]);

  const formatTime = (milliseconds: number): string => {
    const seconds = Math.ceil(milliseconds / 1000);
    return `${seconds}s`;
  };

  const getScoreColor = (score: number): string => {
    if (score >= 90) return colors.accent[500];
    if (score >= 75) return colors.secondary[500];
    if (score >= 50) return colors.warning[500];
    return colors.error[500];
  };

  const getScoreText = (score: number): string => {
    if (score >= 90) return 'Xuất sắc!';
    if (score >= 75) return 'Tốt!';
    if (score >= 50) return 'Khá!';
    return 'Cần cải thiện';
  };

  return (
    <Card variant="elevated" style={styles.container}>
      {/* Expected Text */}
      {showExpectedText && (
        <View style={styles.expectedTextContainer}>
          <BaseText style={styles.expectedLabel}>Văn bản cần đọc:</BaseText>
          <ChineseText style={styles.expectedText}>{expectedText}</ChineseText>
        </View>
      )}

      {/* Recording Status */}
      {listening && (
        <View style={styles.recordingStatus}>
          <View style={styles.recordingIndicator} />
          <BaseText style={styles.recordingText}>
            Đang ghi âm... {formatTime(timeRemaining)}
          </BaseText>
        </View>
      )}

      {/* Evaluation Results */}
      {evaluationResult && (
        <View style={styles.resultsContainer}>
          <View style={styles.scoreHeader}>
            <BaseText style={styles.scoreLabel}>Kết quả đánh giá:</BaseText>
            <View style={[
              styles.scoreBadge,
              { backgroundColor: getScoreColor(evaluationResult.accuracy) }
            ]}>
              <BaseText style={styles.scoreValue}>
                {evaluationResult.accuracy.toFixed(0)}%
              </BaseText>
            </View>
          </View>

          <BaseText style={[
            styles.scoreText,
            { color: getScoreColor(evaluationResult.accuracy) }
          ]}>
            {getScoreText(evaluationResult.accuracy)}
          </BaseText>

          <BaseText style={styles.feedback}>
            {evaluationResult.feedback}
          </BaseText>

          {/* Detailed Metrics */}
          <View style={styles.metricsContainer}>
            <View style={styles.metricItem}>
              <BaseText style={styles.metricLabel}>Độ chính xác từ:</BaseText>
              <BaseText style={styles.metricValue}>
                {evaluationResult.details.characterAccuracy.toFixed(0)}%
              </BaseText>
            </View>
            <View style={styles.metricItem}>
              <BaseText style={styles.metricLabel}>Thanh điệu:</BaseText>
              <BaseText style={styles.metricValue}>
                {evaluationResult.details.toneAccuracy.toFixed(0)}%
              </BaseText>
            </View>
            <View style={styles.metricItem}>
              <BaseText style={styles.metricLabel}>Trôi chảy:</BaseText>
              <BaseText style={styles.metricValue}>
                {evaluationResult.details.fluency.toFixed(0)}%
              </BaseText>
            </View>
          </View>

          {/* Suggestions */}
          {evaluationResult.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <BaseText style={styles.suggestionsLabel}>Gợi ý cải thiện:</BaseText>
              {evaluationResult.suggestions.map((suggestion, index) => (
                <BaseText key={index} style={styles.suggestionItem}>
                  • {suggestion}
                </BaseText>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Error Display */}
      {speechError && (
        <View style={styles.errorContainer}>
          <BaseText style={styles.errorText}>{speechError}</BaseText>
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.actionsContainer}>
        {!listening && !isEvaluating && (
          <Button
            onPress={evaluationResult ? handleRetry : handleStartRecording}
            disabled={disabled}
            style={styles.primaryButton}
          >
            {evaluationResult ? 'Thử lại' : 'Bắt đầu ghi âm'}
          </Button>
        )}
        
        {listening && (
          <>
            <Button
              onPress={handleStopRecording}
              style={StyleSheet.flatten([styles.button, styles.stopButton])}
            >
              Dừng ghi âm
            </Button>
            <Button
              onPress={handleAbortRecording}
              variant="outline"
              style={styles.button}
            >
              Hủy
            </Button>
          </>
        )}
        
        {isEvaluating && (
          <Loading />
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('md'),
  },
  expectedTextContainer: {
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.primary[500],
  },
  expectedLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('xs'),
    fontWeight: '600',
  },
  expectedText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[900],
    lineHeight: getResponsiveFontSize('lg') * 1.4,
  },
  recordingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.error[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  recordingIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.error[500],
  },
  recordingText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.error[700],
    fontWeight: '600',
  },
  resultsContainer: {
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.accent[50],
    borderRadius: 8,
    gap: getResponsiveSpacing('sm'),
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    fontWeight: '600',
  },
  scoreBadge: {
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    borderRadius: 16,
  },
  scoreValue: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[50],
    fontWeight: 'bold',
  },
  scoreText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  feedback: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    textAlign: 'center',
    lineHeight: getResponsiveFontSize('base') * 1.4,
  },
  metricsContainer: {
    flexDirection: Layout.isMobile ? 'column' : 'row',
    gap: getResponsiveSpacing('md'),
    marginTop: getResponsiveSpacing('sm'),
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: getResponsiveSpacing('sm'),
    backgroundColor: colors.neutral[50],
    borderRadius: 6,
  },
  metricLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  metricValue: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[900],
    fontWeight: '600',
  },
  suggestionsContainer: {
    marginTop: getResponsiveSpacing('sm'),
    padding: getResponsiveSpacing('sm'),
    backgroundColor: colors.warning[50],
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.warning[500],
  },
  suggestionsLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.warning[700],
    fontWeight: '600',
    marginBottom: getResponsiveSpacing('xs'),
  },
  suggestionItem: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.warning[700],
    lineHeight: getResponsiveFontSize('sm') * 1.4,
    marginBottom: 2,
  },
  errorContainer: {
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.error[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  errorText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.error[700],
    textAlign: 'center',
  },
  actionsContainer: {
    flexDirection: Layout.isMobile ? 'column' : 'row',
    gap: getResponsiveSpacing('md'),
    marginTop: getResponsiveSpacing('md'),
  },
  button: {
    flex: Layout.isMobile ? 0 : 1,
  },
  primaryButton: {
    flex: 1,
  },
  stopButton: {
    backgroundColor: colors.error[500],
  },
}); 