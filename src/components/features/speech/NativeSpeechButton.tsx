import React, { useState, useEffect } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated, Text, Alert } from 'react-native';
import { useEnhancedNativeSpeech, NativeSpeechConfig, SpeechResult } from '../../../hooks/useEnhancedNativeSpeech';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../theme';

interface NativeSpeechButtonProps {
  expectedText: string;
  onResult: (result: SpeechResult & { accuracy: number }) => void;
  onError: (error: string) => void;
  disabled?: boolean;
  language?: 'zh-CN' | 'zh-TW' | 'en-US';
}

export const NativeSpeechButton: React.FC<NativeSpeechButtonProps> = ({
  expectedText,
  onResult,
  onError,
  disabled = false,
  language = 'zh-CN'
}) => {
  const {
    transcript,
    partialTranscript,
    isListening,
    error,
    hasPermission,
    isAvailable,
    isExpoGo,
    recognizeForDuration,
    checkAvailability
  } = useEnhancedNativeSpeech();

  const [animation] = useState(new Animated.Value(1));
  const [recordingProgress, setRecordingProgress] = useState(0);

  useEffect(() => {
    if (isListening) {
      // Pulse animation while recording
      Animated.loop(
        Animated.sequence([
          Animated.timing(animation, { 
            toValue: 1.3, 
            duration: 800, 
            useNativeDriver: true 
          }),
          Animated.timing(animation, { 
            toValue: 1, 
            duration: 800, 
            useNativeDriver: true 
          }),
        ])
      ).start();

      // Progress animation (5 seconds)
      const progressInterval = setInterval(() => {
        setRecordingProgress(prev => {
          const newProgress = prev + 2; // 2% every 100ms = 5 seconds total
          if (newProgress >= 100) {
            clearInterval(progressInterval);
            return 100;
          }
          return newProgress;
        });
      }, 100);

      return () => {
        clearInterval(progressInterval);
      };
    } else {
      animation.setValue(1);
      setRecordingProgress(0);
    }
  }, [isListening, animation]);

  useEffect(() => {
    if (error) {
      onError(error);
    }
  }, [error, onError]);

  const handlePress = async () => {
    if (disabled || isListening) return;

    if (isExpoGo) {
      Alert.alert(
        '🚫 Expo Go Limitation',
        'Speech recognition cần development build để hoạt động.\n\nVui lòng chạy:\n• npx expo run:ios\n• npx expo run:android\n\nhoặc build thành APK/IPA',
        [{ text: 'Hiểu rồi' }]
      );
      return;
    }

    if (!isAvailable) {
      Alert.alert(
        'Không hỗ trợ',
        'Thiết bị này không hỗ trợ nhận diện giọng nói',
        [{ text: 'OK' }]
      );
      return;
    }

    if (!hasPermission) {
      Alert.alert(
        'Cần quyền truy cập',
        'Ứng dụng cần quyền microphone để nhận diện giọng nói',
        [
          { text: 'Hủy', style: 'cancel' },
          { text: 'Cài đặt', onPress: checkAvailability }
        ]
      );
      return;
    }

    try {
      const config: NativeSpeechConfig = {
        language,
        maxResults: 5,
        continuous: false,
        partialResults: true
      };

      console.log('🎯 Expected text:', expectedText);
      const result = await recognizeForDuration(config, 5000);
      console.log('🎙️ Recognition result:', result);

      // Calculate accuracy
      const accuracy = calculateChineseAccuracy(result.transcript, expectedText);
      
      onResult({
        ...result,
        accuracy
      });

    } catch (err: any) {
      console.error('❌ Speech recognition failed:', err);
      onError(err.message || 'Nhận diện giọng nói thất bại');
    }
  };

  const calculateChineseAccuracy = (spoken: string, expected: string): number => {
    if (!spoken || !expected) return 0;

    // Remove spaces and normalize
    const normalizeText = (text: string) => text.replace(/\s+/g, '').toLowerCase();
    const spokenNorm = normalizeText(spoken);
    const expectedNorm = normalizeText(expected);

    console.log('📊 Accuracy calculation:', { spoken: spokenNorm, expected: expectedNorm });

    // Character-level comparison for Chinese
    const spokenChars = Array.from(spokenNorm);
    const expectedChars = Array.from(expectedNorm);
    
    let matches = 0;
    const maxLength = Math.max(spokenChars.length, expectedChars.length);
    
    // Count exact character matches
    for (let i = 0; i < Math.min(spokenChars.length, expectedChars.length); i++) {
      if (spokenChars[i] === expectedChars[i]) {
        matches++;
      }
    }
    
    // Calculate accuracy with length penalty
    const accuracy = maxLength > 0 ? matches / maxLength : 0;
    console.log(`🎯 Accuracy: ${(accuracy * 100).toFixed(1)}% (${matches}/${maxLength} chars)`);
    
    return accuracy;
  };

  const getButtonStyle = () => {
    if (disabled) return [styles.button, styles.disabled];
    if (isExpoGo) return [styles.button, styles.expoGo];
    if (isListening) return [styles.button, styles.recording];
    return [styles.button, styles.ready];
  };

  const getButtonText = () => {
    if (disabled) return '🚫 Không khả dụng';
    if (isExpoGo) return '⚠️ Cần Development Build';
    if (isListening) return '🎙️ Đang nghe...';
    if (!hasPermission) return '🔒 Cần quyền truy cập';
    if (!isAvailable) return '❌ Không hỗ trợ';
    return '🎤 Nhấn để nói';
  };

  const getStatusMessage = () => {
    if (isExpoGo) {
      return {
        title: '⚠️ Development Build Required',
        message: 'Speech recognition cần development build để hoạt động. Không thể test trong Expo Go.',
        color: colors.secondary[500]
      };
    }
    if (!isAvailable) {
      return {
        title: '❌ Không khả dụng',
        message: 'Speech recognition không được hỗ trợ trên thiết bị này.',
        color: colors.error[500]
      };
    }
    if (!hasPermission) {
      return {
        title: '🔒 Cần quyền truy cập',
        message: 'Vui lòng cấp quyền microphone và speech recognition.',
        color: colors.secondary[500]
      };
    }
    return null;
  };

  const statusMessage = getStatusMessage();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.buttonContainer, { transform: [{ scale: animation }] }]}>
        <TouchableOpacity
          style={getButtonStyle()}
          onPress={handlePress}
          disabled={disabled || isListening || !hasPermission || !isAvailable}
        >
          <Text style={styles.buttonText}>
            {getButtonText()}
          </Text>
          
          {isListening && (
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, { width: `${recordingProgress}%` }]} />
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>
      
      {/* Status message for Expo Go or other issues */}
      {statusMessage && (
        <View style={[styles.statusMessageContainer, { borderLeftColor: statusMessage.color }]}>
          <Text style={[styles.statusTitle, { color: statusMessage.color }]}>
            {statusMessage.title}
          </Text>
          <Text style={styles.statusMessage}>
            {statusMessage.message}
          </Text>
          {isExpoGo && (
            <Text style={styles.statusInstructions}>
              Để test chức năng này:{'\n'}
              • npx expo run:ios{'\n'}
              • npx expo run:android
            </Text>
          )}
        </View>
      )}
      
      {/* Expected text display */}
      <View style={styles.expectedTextContainer}>
        <Text style={styles.expectedLabel}>Hãy nói:</Text>
        <Text style={styles.expectedText}>{expectedText}</Text>
      </View>
      
      {/* Partial results display */}
      {(partialTranscript || transcript) && !isExpoGo && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>
            {isListening ? 'Đang nhận diện...' : 'Kết quả:'}
          </Text>
          <Text style={styles.resultText}>
            {transcript || partialTranscript || '...'}
          </Text>
        </View>
      )}
      
      {/* Status indicators */}
      <View style={styles.statusContainer}>
        <StatusIndicator 
          label="Microphone" 
          status={hasPermission && !isExpoGo ? 'success' : 'error'} 
        />
        <StatusIndicator 
          label="Speech API" 
          status={isAvailable && !isExpoGo ? 'success' : 'error'} 
        />
        <StatusIndicator 
          label="Environment" 
          status={isExpoGo ? 'warning' : 'success'}
          value={isExpoGo ? 'Expo Go' : 'Dev Build'} 
        />
        <StatusIndicator 
          label="Language" 
          status="info" 
          value={language} 
        />
      </View>
    </View>
  );
};

// Status indicator component
const StatusIndicator: React.FC<{
  label: string;
  status: 'success' | 'error' | 'info' | 'warning';
  value?: string;
}> = ({ label, status, value }) => {
  const getStatusColor = () => {
    switch (status) {
      case 'success': return colors.accent[500];
      case 'error': return colors.error[500];
      case 'warning': return colors.secondary[500];
      case 'info': return colors.primary[500];
      default: return colors.neutral[400];
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return '⚪';
    }
  };

  return (
    <View style={styles.statusItem}>
      <Text style={styles.statusIcon}>{getStatusIcon()}</Text>
      <Text style={styles.statusLabel}>{label}</Text>
      {value && <Text style={[styles.statusValue, { color: getStatusColor() }]}>{value}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('md'),
  },
  
  buttonContainer: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  button: {
    paddingVertical: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('xl'),
    borderRadius: Layout.isMobile ? 25 : 30,
    minWidth: Layout.isMobile ? 200 : 250,
    minHeight: Layout.isMobile ? 60 : 70,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 6,
  },
  
  ready: {
    backgroundColor: colors.primary[500],
  },
  
  recording: {
    backgroundColor: colors.error[500],
  },
  
  disabled: {
    backgroundColor: colors.neutral[400],
  },

  expoGo: {
    backgroundColor: colors.secondary[500],
  },
  
  buttonText: {
    color: colors.neutral[50],
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    textAlign: 'center',
  },
  
  progressContainer: {
    width: '100%',
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    marginTop: getResponsiveSpacing('sm'),
    overflow: 'hidden',
  },
  
  progressBar: {
    height: '100%',
    backgroundColor: colors.neutral[50],
    borderRadius: 2,
  },

  statusMessageContainer: {
    backgroundColor: colors.neutral[50],
    padding: getResponsiveSpacing('lg'),
    borderRadius: Layout.isMobile ? 12 : 16,
    marginBottom: getResponsiveSpacing('md'),
    width: '100%',
    borderLeftWidth: 4,
  },

  statusTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    marginBottom: getResponsiveSpacing('xs'),
  },

  statusMessage: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('xs'),
  },

  statusInstructions: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontFamily: 'monospace',
    backgroundColor: colors.neutral[100],
    padding: getResponsiveSpacing('sm'),
    borderRadius: 8,
  },
  
  expectedTextContainer: {
    backgroundColor: colors.neutral[100],
    padding: getResponsiveSpacing('md'),
    borderRadius: Layout.isMobile ? 12 : 16,
    marginBottom: getResponsiveSpacing('md'),
    width: '100%',
    alignItems: 'center',
  },
  
  expectedLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('xs'),
  },
  
  expectedText: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.neutral[900],
    fontWeight: '600',
    textAlign: 'center',
  },
  
  resultContainer: {
    backgroundColor: colors.accent[50],
    padding: getResponsiveSpacing('md'),
    borderRadius: Layout.isMobile ? 12 : 16,
    marginBottom: getResponsiveSpacing('md'),
    width: '100%',
    alignItems: 'center',
    borderLeftWidth: 4,
    borderLeftColor: colors.accent[500],
  },
  
  resultLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.accent[700],
    marginBottom: getResponsiveSpacing('xs'),
  },
  
  resultText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.accent[900],
    fontWeight: '500',
    textAlign: 'center',
  },
  
  statusContainer: {
    flexDirection: Layout.isMobile ? 'column' : 'row',
    gap: getResponsiveSpacing('sm'),
    width: '100%',
    justifyContent: 'center',
  },
  
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
    paddingVertical: getResponsiveSpacing('xs'),
    paddingHorizontal: getResponsiveSpacing('sm'),
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    flex: Layout.isMobile ? 0 : 1,
  },
  
  statusIcon: {
    fontSize: 12,
  },
  
  statusLabel: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
    flex: 1,
  },
  
  statusValue: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
  },
});

export default NativeSpeechButton; 