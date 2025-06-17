import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useExpoGoSpeechRecognition } from '../../../../../hooks/useExpoGoSpeechRecognition';
import { PronunciationEvaluationService, PronunciationResult } from '../../../../../services/pronunciationEvaluationService';
import { Button } from '../../../../ui/atoms/Button';
import { Card } from '../../../../ui/atoms/Card';
import { ChineseText } from '../../../../ui/atoms/Text/ChineseText';
import { BaseText } from '../../../../ui/atoms/Text/BaseText';
import { Loading } from '../../../../ui/atoms/Loading';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';

export interface ExpoGoSpeechRecognitionProps {
  expectedText: string;
  language?: 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'vi-VN';
  onResult?: (result: PronunciationResult) => void;
  onError?: (error: string) => void;
  maxDuration?: number; // milliseconds
  disabled?: boolean;
  showExpectedText?: boolean;
  autoEvaluate?: boolean;
}

export const ExpoGoSpeechRecognitionComponent: React.FC<ExpoGoSpeechRecognitionProps> = ({
  expectedText,
  language = 'zh-CN',
  onResult,
  onError,
  maxDuration = 30000,
  disabled = false,
  showExpectedText = true,
  autoEvaluate = true,
}) => {
  // Expo Go speech recognition hook
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    error: speechError,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
  } = useExpoGoSpeechRecognition();

  // Local states
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PronunciationResult | null>(null);

  const handleStartRecording = useCallback(async () => {
    try {
      resetTranscript();
      setEvaluationResult(null);

      await startListening({
        language,
        maxDuration,
      });

    } catch (err: any) {
      console.error('Error starting recording:', err);
      onError?.(err.message || 'Không thể bắt đầu ghi âm');
    }
  }, [language, maxDuration, startListening, resetTranscript, onError]);

  const handleStopRecording = useCallback(async () => {
    try {
      await stopListening();
    } catch (err: any) {
      console.error('Error stopping recording:', err);
      onError?.(err.message || 'Không thể dừng ghi âm');
    }
  }, [stopListening, onError]);

  const handleAbortRecording = useCallback(async () => {
    try {
      await abortListening();
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

    } catch (err: any) {
      console.error('Error evaluating pronunciation:', err);
      onError?.(err.message || 'Không thể đánh giá phát âm');
    } finally {
      setIsEvaluating(false);
    }
  }, [expectedText, language, onResult, onError]);

  const handleRetry = useCallback(() => {
    resetTranscript();
    setEvaluationResult(null);
  }, [resetTranscript]);

  // Auto-evaluate when final transcript is available
  React.useEffect(() => {
    if (autoEvaluate && finalTranscript && !listening && !isEvaluating) {
      handleEvaluatePronunciation(finalTranscript);
    }
  }, [finalTranscript, listening, isEvaluating, autoEvaluate, handleEvaluatePronunciation]);

  // Handle speech recognition errors
  React.useEffect(() => {
    if (speechError) {
      onError?.(speechError);
    }
  }, [speechError, onError]);

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
      {/* Development Notice */}
      <View style={styles.devNotice}>
        <BaseText style={styles.devNoticeText}>
          🚧 Chế độ phát triển - Speech Recognition được mô phỏng
        </BaseText>
        <BaseText style={styles.devNoticeSubtext}>
          Để test thật: npx expo run:ios hoặc npx expo run:android
        </BaseText>
      </View>

      {/* Expected Text */}
      {showExpectedText && (
        <View style={styles.expectedTextContainer}>
          <BaseText style={styles.expectedLabel}>Văn bản cần đọc:</BaseText>
          <ChineseText style={styles.expectedText}>{expectedText}</ChineseText>
        </View>
      )}

      {/* Live Transcript */}
      {(transcript || interimTranscript) && (
        <View style={styles.transcriptContainer}>
          <BaseText style={styles.transcriptLabel}>Bạn đã nói (mô phỏng):</BaseText>
          <View style={styles.transcriptContent}>
            <ChineseText style={styles.transcriptText}>
              {finalTranscript || interimTranscript}
            </ChineseText>
            {interimTranscript && !finalTranscript && (
              <BaseText style={styles.interimIndicator}>(đang mô phỏng...)</BaseText>
            )}
          </View>
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
            {evaluationResult ? 'Thử lại' : 'Mô phỏng ghi âm'}
          </Button>
        )}
        
        {listening && (
          <>
            <Button
              onPress={handleStopRecording}
              style={StyleSheet.flatten([styles.button, styles.stopButton])}
            >
              Dừng mô phỏng
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
  devNotice: {
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.warning[50],
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.warning[500],
    marginBottom: getResponsiveSpacing('md'),
  },
  devNoticeText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.warning[700],
    fontWeight: '600',
    marginBottom: getResponsiveSpacing('xs'),
  },
  devNoticeSubtext: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.warning[600],
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
  transcriptContainer: {
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.primary[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  transcriptLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[700],
    marginBottom: getResponsiveSpacing('xs'),
    fontWeight: '600',
  },
  transcriptContent: {
    gap: getResponsiveSpacing('xs'),
  },
  transcriptText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.primary[900],
    lineHeight: getResponsiveFontSize('lg') * 1.4,
  },
  interimIndicator: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.primary[600],
    fontStyle: 'italic',
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