import React, { useState, useCallback, useEffect } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useSpeechRecognition, SpeechRecognitionConfig } from '../../../../../hooks/useSpeechRecognition';
import { PronunciationEvaluationService, PronunciationResult } from '../../../../../services/pronunciationEvaluationService';
import { Button } from '../../../../ui/atoms/Button';
import { Card } from '../../../../ui/atoms/Card';
import { ChineseText } from '../../../../ui/atoms/Text/ChineseText';
import { BaseText } from '../../../../ui/atoms/Text/BaseText';
import { Loading } from '../../../../ui/atoms/Loading';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';

export interface SpeechRecognitionProps {
  expectedText: string;
  language?: 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US' | 'vi-VN';
  onResult?: (result: PronunciationResult) => void;
  onError?: (error: string) => void;
  disabled?: boolean;
  autoStart?: boolean;
  maxDuration?: number; // in milliseconds
}

export const SpeechRecognitionComponent: React.FC<SpeechRecognitionProps> = ({
  expectedText,
  language = 'zh-CN',
  onResult,
  onError,
  disabled = false,
  autoStart = false,
  maxDuration = 10000 // 10 seconds default
}) => {
  const {
    transcript,
    interimTranscript,
    finalTranscript,
    listening,
    isSupported,
    hasPermission,
    error,
    startListening,
    stopListening,
    abortListening,
    resetTranscript,
    requestPermission
  } = useSpeechRecognition();

  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationResult, setEvaluationResult] = useState<PronunciationResult | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<number | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(maxDuration);

  // Auto-start if requested
  useEffect(() => {
    if (autoStart && isSupported && !disabled) {
      handleStartRecording();
    }
  }, [autoStart, isSupported, disabled]);

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

  // Handle errors
  useEffect(() => {
    if (error) {
      onError?.(error);
    }
  }, [error, onError]);

  // Auto-evaluate when final transcript is available
  useEffect(() => {
    if (finalTranscript && !listening && !isEvaluating) {
      handleEvaluate(finalTranscript);
    }
  }, [finalTranscript, listening, isEvaluating]);

  const handleStartRecording = useCallback(async () => {
    try {
      setEvaluationResult(null);
      setTimeRemaining(maxDuration);
      resetTranscript();

      if (!isSupported) {
        Alert.alert(
          'Không hỗ trợ',
          'Trình duyệt của bạn không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge.',
          [{ text: 'OK' }]
        );
        return;
      }

      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Cần quyền truy cập',
            'Ứng dụng cần quyền truy cập microphone để nhận diện giọng nói.',
            [{ text: 'OK' }]
          );
          return;
        }
      }

      const config: SpeechRecognitionConfig = {
        language,
        continuous: true,
        interimResults: true,
        maxAlternatives: 1
      };

      setRecordingStartTime(Date.now());
      await startListening(config);

    } catch (err) {
      console.error('Error starting recording:', err);
      onError?.('Không thể bắt đầu ghi âm. Vui lòng thử lại.');
    }
  }, [
    isSupported, 
    hasPermission, 
    language, 
    maxDuration,
    requestPermission,
    startListening,
    resetTranscript,
    onError
  ]);

  const handleStopRecording = useCallback(() => {
    try {
      stopListening();
      setRecordingStartTime(null);
      setTimeRemaining(maxDuration);
    } catch (err) {
      console.error('Error stopping recording:', err);
      onError?.('Lỗi khi dừng ghi âm.');
    }
  }, [stopListening, maxDuration, onError]);

  const handleAbortRecording = useCallback(() => {
    try {
      abortListening();
      setRecordingStartTime(null);
      setTimeRemaining(maxDuration);
      resetTranscript();
      setEvaluationResult(null);
    } catch (err) {
      console.error('Error aborting recording:', err);
      onError?.('Lỗi khi hủy ghi âm.');
    }
  }, [abortListening, maxDuration, resetTranscript, onError]);

  const handleEvaluate = useCallback(async (transcriptToEvaluate: string) => {
    if (!transcriptToEvaluate.trim()) {
      onError?.('Không phát hiện giọng nói. Vui lòng thử lại.');
      return;
    }

    try {
      setIsEvaluating(true);
      
      const result = await PronunciationEvaluationService.evaluatePronunciation(
        transcriptToEvaluate,
        expectedText,
        language as 'zh-CN' | 'zh-TW' | 'zh-HK' | 'en-US'
      );

      // Add timing information
      if (recordingStartTime) {
        result.details.timing = Date.now() - recordingStartTime;
      }

      setEvaluationResult(result);
      onResult?.(result);

    } catch (err) {
      console.error('Error evaluating pronunciation:', err);
      onError?.('Lỗi khi đánh giá phát âm. Vui lòng thử lại.');
    } finally {
      setIsEvaluating(false);
    }
  }, [expectedText, language, recordingStartTime, onResult, onError]);

  const handleRetry = useCallback(() => {
    setEvaluationResult(null);
    resetTranscript();
    handleStartRecording();
  }, [resetTranscript, handleStartRecording]);

  // Get status color based on current state
  const getStatusColor = () => {
    if (error) return colors.error[500];
    if (listening) return colors.primary[500];
    if (evaluationResult) {
      switch (evaluationResult.score) {
        case 'excellent': return colors.accent[500];
        case 'good': return colors.secondary[500];
        case 'fair': return colors.warning[500];
        case 'poor': return colors.error[500];
        default: return colors.neutral[500];
      }
    }
    return colors.neutral[500];
  };

  // Get status text
  const getStatusText = () => {
    if (error) return error;
    if (listening) return `Đang nghe... (${Math.ceil(timeRemaining / 1000)}s)`;
    if (isEvaluating) return 'Đang đánh giá...';
    if (evaluationResult) return evaluationResult.feedback;
    return 'Sẵn sàng ghi âm';
  };

  if (!isSupported) {
    return (
      <Card style={styles.container}>
        <BaseText style={styles.errorText}>
          Trình duyệt không hỗ trợ nhận diện giọng nói. Vui lòng sử dụng Chrome hoặc Edge.
        </BaseText>
      </Card>
    );
  }

  return (
    <Card style={styles.container}>
      {/* Expected Text Display */}
      <View style={styles.expectedTextContainer}>
        <BaseText style={styles.label}>Hãy đọc:</BaseText>
        <ChineseText style={styles.expectedText}>{expectedText}</ChineseText>
      </View>

      {/* Status Display */}
      <View style={[styles.statusContainer, { borderColor: getStatusColor() }]}>
        <BaseText style={[styles.statusText, { color: getStatusColor() }]}>
          {getStatusText()}
        </BaseText>
        
        {listening && (
          <View style={styles.recordingIndicator}>
            <View style={[styles.recordingDot, { backgroundColor: colors.error[500] }]} />
            <BaseText style={styles.recordingText}>REC</BaseText>
          </View>
        )}
      </View>

      {/* Transcript Display */}
      {(transcript || interimTranscript) && (
        <View style={styles.transcriptContainer}>
          <BaseText style={styles.label}>Bạn đã nói:</BaseText>
          <BaseText style={styles.transcript}>
            {finalTranscript}
            {interimTranscript && (
              <BaseText style={styles.interimTranscript}>{interimTranscript}</BaseText>
            )}
          </BaseText>
        </View>
      )}

      {/* Evaluation Result */}
      {evaluationResult && (
        <View style={styles.resultContainer}>
          <View style={styles.scoreContainer}>
            <BaseText style={styles.scoreLabel}>Điểm số:</BaseText>
            <BaseText style={[styles.scoreValue, { color: getStatusColor() }]}>
              {evaluationResult.accuracy}%
            </BaseText>
          </View>
          
          <View style={styles.detailsContainer}>
            <View style={styles.detailRow}>
              <BaseText style={styles.detailLabel}>Độ chính xác từ:</BaseText>
              <BaseText style={styles.detailValue}>{evaluationResult.details.characterAccuracy}%</BaseText>
            </View>
            <View style={styles.detailRow}>
              <BaseText style={styles.detailLabel}>Thanh điệu:</BaseText>
              <BaseText style={styles.detailValue}>{evaluationResult.details.toneAccuracy}%</BaseText>
            </View>
            <View style={styles.detailRow}>
              <BaseText style={styles.detailLabel}>Trôi chảy:</BaseText>
              <BaseText style={styles.detailValue}>{evaluationResult.details.fluency}%</BaseText>
            </View>
          </View>

          {evaluationResult.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <BaseText style={styles.suggestionsLabel}>Gợi ý cải thiện:</BaseText>
              {evaluationResult.suggestions.map((suggestion, index) => (
                <BaseText key={index} style={styles.suggestion}>
                  • {suggestion}
                </BaseText>
              ))}
            </View>
          )}
        </View>
      )}

      {/* Action Buttons */}
      <View style={styles.buttonContainer}>
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
              style={styles.stopButton}
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
          <Loading size="lg" />
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
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  
  label: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  
  expectedText: {
    fontSize: getResponsiveFontSize('4xl'),
    textAlign: 'center',
    color: colors.neutral[900],
  },
  
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('md'),
    borderWidth: 2,
    borderRadius: Layout.isMobile ? 8 : 12,
    backgroundColor: colors.neutral[50],
  },
  
  statusText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '500',
    flex: 1,
  },
  
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  
  recordingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  
  recordingText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.error[500],
    fontWeight: 'bold',
  },
  
  transcriptContainer: {
    gap: getResponsiveSpacing('sm'),
  },
  
  transcript: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[800],
    backgroundColor: colors.neutral[100],
    padding: getResponsiveSpacing('md'),
    borderRadius: Layout.isMobile ? 8 : 12,
    minHeight: 60,
  },
  
  interimTranscript: {
    color: colors.neutral[500],
    fontStyle: 'italic',
  },
  
  resultContainer: {
    gap: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[50],
    padding: getResponsiveSpacing('md'),
    borderRadius: Layout.isMobile ? 8 : 12,
  },
  
  scoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  
  scoreLabel: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[700],
  },
  
  scoreValue: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: 'bold',
  },
  
  detailsContainer: {
    gap: getResponsiveSpacing('sm'),
  },
  
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  
  detailLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  
  detailValue: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[800],
  },
  
  suggestionsContainer: {
    gap: getResponsiveSpacing('sm'),
  },
  
  suggestionsLabel: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[700],
  },
  
  suggestion: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    lineHeight: 20,
  },
  
  buttonContainer: {
    flexDirection: Layout.isMobile ? 'column' : 'row',
    gap: getResponsiveSpacing('md'),
    alignItems: 'center',
  },
  
  button: {
    flex: Layout.isMobile ? 0 : 1,
    minWidth: Layout.isMobile ? '100%' : undefined,
  },
  
  primaryButton: {
    backgroundColor: colors.primary[500],
  },
  
  stopButton: {
    backgroundColor: colors.error[500],
  },
  
  errorText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.error[500],
    textAlign: 'center',
    padding: getResponsiveSpacing('lg'),
  },
}); 