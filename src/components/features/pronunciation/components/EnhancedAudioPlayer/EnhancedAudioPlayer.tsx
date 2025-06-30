import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Audio Services
import chineseTTS from '../../../../../services/tts/ChineseTTSService';
import chineseSTT, { PronunciationAnalysis } from '../../../../../services/stt/ChineseSTTService';

// Components
import { Card } from '../../../../ui/atoms/Card/Card';
import { TranslationText } from '../../../../ui/atoms/Text';

// Theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';

export interface AudioPlayerProps {
  // Content props
  hanzi: string;
  pinyin: string;
  translation: string;
  meaning?: string;
  
  // Practice mode
  mode?: 'listen' | 'practice' | 'test';
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  
  // Callbacks
  onPracticeComplete?: (analysis: PronunciationAnalysis) => void;
  onScoreUpdate?: (score: number) => void;
  
  // Appearance
  variant?: 'compact' | 'detailed' | 'full';
  showPinyin?: boolean;
  showTranslation?: boolean;
  
  // Practice settings
  enableRecording?: boolean;
  enableFeedback?: boolean;
  maxRecordingTime?: number;
}

export const EnhancedAudioPlayer: React.FC<AudioPlayerProps> = ({
  hanzi,
  pinyin,
  translation,
  meaning,
  mode = 'listen',
  difficulty = 'beginner',
  onPracticeComplete,
  onScoreUpdate,
  variant = 'detailed',
  showPinyin = true,
  showTranslation = true,
  enableRecording = true,
  enableFeedback = true,
  maxRecordingTime = 10,
}) => {
  // State
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [lastAnalysis, setLastAnalysis] = useState<PronunciationAnalysis | null>(null);
  const [practiceScore, setPracticeScore] = useState<number | null>(null);
  const [currentMode, setCurrentMode] = useState(mode);
  const [showResults, setShowResults] = useState(false);

  // Animation values
  const [scaleAnim] = useState(new Animated.Value(1));
  const [rotateAnim] = useState(new Animated.Value(0));
  const [progressAnim] = useState(new Animated.Value(0));
  const [recordingAnim] = useState(new Animated.Value(0));

  // Initialize services
  useEffect(() => {
    const initializeServices = async () => {
      try {
        await Promise.all([
          chineseTTS.initialize(),
          chineseSTT.initialize()
        ]);
      } catch (error) {
        console.error('Audio services initialization failed:', error);
      }
    };

    initializeServices();
  }, []);

  // Start recording animation
  useEffect(() => {
    if (isRecording) {
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnim, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulse.start();
    } else {
      recordingAnim.setValue(1);
    }
  }, [isRecording]);

  const handlePlay = async () => {
    try {
      setIsPlaying(true);
      
      // Scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true,
        }),
      ]).start();

      // Different playback based on mode
      switch (currentMode) {
        case 'listen':
          await chineseTTS.speak(hanzi, { 
            rate: difficulty === 'beginner' ? 0.7 : 0.8 
          });
          break;
          
        case 'practice':
          await chineseTTS.practiceWord(hanzi, pinyin, translation);
          break;
          
        case 'test':
          await chineseTTS.speak(hanzi, { rate: 0.8 });
          // Auto-switch to recording mode for testing
          setTimeout(() => handleRecord(), 1000);
          break;
      }
    } catch (error) {
      console.error('Playback error:', error);
      Alert.alert('Lỗi', 'Không thể phát âm thanh. Vui lòng thử lại.');
    } finally {
      setIsPlaying(false);
    }
  };

  const handleRecord = async () => {
    if (!enableRecording) return;

    try {
      setIsRecording(true);
      setIsAnalyzing(false);
      setShowResults(false);

      console.log(`🎤 Recording pronunciation for: ${hanzi}`);

      // Start recording and analysis
      const analysis = await chineseSTT.recordAndAnalyzePronunciation(
        hanzi,
        pinyin,
        maxRecordingTime
      );

      setIsRecording(false);
      setIsAnalyzing(true);

      // Simulate analysis time for UI feedback
      await new Promise(resolve => setTimeout(resolve, 1500));

      setIsAnalyzing(false);
      setLastAnalysis(analysis);
      setPracticeScore(analysis.accuracy);
      setShowResults(true);

      // Callbacks
      onPracticeComplete?.(analysis);
      onScoreUpdate?.(analysis.accuracy);

      // Auto feedback if enabled
      if (enableFeedback) {
        setTimeout(() => {
          Alert.alert(
            'Kết quả phát âm',
            `Độ chính xác: ${analysis.accuracy}%\n${analysis.overallFeedback}`,
            [
              { text: 'Thử lại', onPress: () => setShowResults(false) },
              { text: 'Tiếp tục', style: 'default' }
            ]
          );
        }, 500);
      }

    } catch (error) {
      console.error('Recording error:', error);
      setIsRecording(false);
      setIsAnalyzing(false);
      Alert.alert('Lỗi', 'Không thể ghi âm. Vui lòng kiểm tra microphone.');
    }
  };

  const handleModeSwitch = (newMode: 'listen' | 'practice' | 'test') => {
    setCurrentMode(newMode);
    setShowResults(false);
    setLastAnalysis(null);
    setPracticeScore(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return colors.success[500];
    if (score >= 75) return colors.secondary[500];
    if (score >= 60) return colors.warning[500];
    return colors.error[500];
  };

  const renderCompactView = () => (
    <View style={styles.compactContainer}>
      <TouchableOpacity
        style={[styles.playButton, styles.compactButton]}
        onPress={handlePlay}
        disabled={isPlaying}
      >
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          {isPlaying ? (
            <ActivityIndicator size="small" color={colors.neutral[50]} />
          ) : (
            <Ionicons name="play" size={20} color={colors.neutral[50]} />
          )}
        </Animated.View>
      </TouchableOpacity>
      
      <View style={styles.compactContent}>
        <Text style={styles.compactHanzi}>{hanzi}</Text>
        {showPinyin && <Text style={styles.compactPinyin}>{pinyin}</Text>}
      </View>

      {enableRecording && (
        <TouchableOpacity
          style={[styles.recordButton, styles.compactButton]}
          onPress={handleRecord}
          disabled={isRecording || isAnalyzing}
        >
          <Animated.View style={{ transform: [{ scale: recordingAnim }] }}>
            {isRecording ? (
              <ActivityIndicator size="small" color={colors.neutral[50]} />
            ) : (
              <Ionicons 
                name="mic" 
                size={20} 
                color={isRecording ? colors.error[500] : colors.neutral[50]} 
              />
            )}
          </Animated.View>
        </TouchableOpacity>
      )}
    </View>
  );

  const renderDetailedView = () => (
    <Card style={styles.detailedContainer}>
      {/* Chinese Character Display */}
      <View style={styles.characterSection}>
        <Text style={styles.hanziText}>{hanzi}</Text>
        {showPinyin && (
          <Text style={styles.pinyinText}>{pinyin}</Text>
        )}
        {showTranslation && (
          <Text style={styles.translationText}>
            {translation}
            {meaning && ` (${meaning})`}
          </Text>
        )}
      </View>

      {/* Mode Selector */}
      <View style={styles.modeSelector}>
        {['listen', 'practice', 'test'].map((modeOption) => (
          <TouchableOpacity
            key={modeOption}
            style={[
              styles.modeButton,
              currentMode === modeOption && styles.activeModeButton
            ]}
            onPress={() => handleModeSwitch(modeOption as any)}
          >
                         <Text style={[
               styles.modeButtonText,
               currentMode === modeOption && styles.activeModeButtonText
             ]}>
               {modeOption === 'listen' ? 'Nghe' : 
                modeOption === 'practice' ? 'Luyện tập' : 
                'Kiểm tra'}
             </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Control Buttons */}
      <View style={styles.controlsSection}>
        <TouchableOpacity
          style={[styles.mainButton, styles.playButton]}
          onPress={handlePlay}
          disabled={isPlaying}
        >
          <LinearGradient
            colors={[colors.primary[400], colors.primary[600]]}
            style={styles.buttonGradient}
          >
            <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
              {isPlaying ? (
                <ActivityIndicator size="large" color={colors.neutral[50]} />
              ) : (
                <Ionicons name="play" size={32} color={colors.neutral[50]} />
              )}
            </Animated.View>
            <Text style={styles.buttonText}>
              {isPlaying ? 'Đang phát...' : 'Phát âm'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>

        {enableRecording && (
          <TouchableOpacity
            style={[styles.mainButton, styles.recordButton]}
            onPress={handleRecord}
            disabled={isRecording || isAnalyzing}
          >
            <LinearGradient
              colors={isRecording ? 
                [colors.error[400], colors.error[600]] : 
                [colors.secondary[400], colors.secondary[600]]
              }
              style={styles.buttonGradient}
            >
              <Animated.View style={{ transform: [{ scale: recordingAnim }] }}>
                {isRecording ? (
                  <ActivityIndicator size="large" color={colors.neutral[50]} />
                ) : isAnalyzing ? (
                  <ActivityIndicator size="large" color={colors.neutral[50]} />
                ) : (
                  <Ionicons name="mic" size={32} color={colors.neutral[50]} />
                )}
              </Animated.View>
              <Text style={styles.buttonText}>
                {isRecording ? 'Đang ghi âm...' : 
                 isAnalyzing ? 'Đang phân tích...' : 
                 'Luyện phát âm'}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>

      {/* Results Section */}
      {showResults && lastAnalysis && (
        <View style={styles.resultsSection}>
          <View style={styles.scoreHeader}>
            <Text style={styles.scoreLabel}>Kết quả phát âm</Text>
            <Text style={[
              styles.scoreValue,
              { color: getScoreColor(lastAnalysis.accuracy) }
            ]}>
              {lastAnalysis.accuracy}%
            </Text>
          </View>

          <View style={styles.detailsRow}>
            <View style={styles.detailItem}>
              <Text style={styles.detailLabel}>Thanh điệu</Text>
              <Text style={[
                styles.detailValue,
                { color: getScoreColor(lastAnalysis.toneAccuracy) }
              ]}>
                {lastAnalysis.toneAccuracy}%
              </Text>
            </View>
          </View>

          <Text style={styles.feedbackText}>
            {lastAnalysis.overallFeedback}
          </Text>

          {lastAnalysis.suggestions.length > 0 && (
            <View style={styles.suggestionsSection}>
              <Text style={styles.suggestionsTitle}>Gợi ý cải thiện:</Text>
              {lastAnalysis.suggestions.map((suggestion, index) => (
                <Text key={index} style={styles.suggestionText}>
                  • {suggestion}
                </Text>
              ))}
            </View>
          )}
        </View>
      )}
    </Card>
  );

  const renderFullView = () => (
    <View style={styles.fullContainer}>
      {renderDetailedView()}
      
      {/* Additional full view features */}
      <View style={styles.advancedControls}>
        <TouchableOpacity style={styles.advancedButton}>
          <Ionicons name="settings-outline" size={24} color={colors.neutral[600]} />
          <Text style={styles.advancedButtonText}>Cài đặt</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.advancedButton}>
          <Ionicons name="analytics-outline" size={24} color={colors.neutral[600]} />
          <Text style={styles.advancedButtonText}>Thống kê</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.advancedButton}>
          <Ionicons name="help-circle-outline" size={24} color={colors.neutral[600]} />
          <Text style={styles.advancedButtonText}>Hướng dẫn</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  // Render based on variant
  switch (variant) {
    case 'compact':
      return renderCompactView();
    case 'full':
      return renderFullView();
    case 'detailed':
    default:
      return renderDetailedView();
  }
};

const styles = StyleSheet.create({
  // Compact view
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('sm'),
    gap: getResponsiveSpacing('sm'),
  },

  compactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },

  compactContent: {
    flex: 1,
  },

  compactHanzi: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
  },

  compactPinyin: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    fontStyle: 'italic',
  },

  // Detailed view
  detailedContainer: {
    gap: getResponsiveSpacing('lg'),
  },

  characterSection: {
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },

  hanziText: {
    fontSize: getResponsiveFontSize('6xl'),
    fontFamily: 'System',
    color: colors.neutral[900],
    textAlign: 'center',
  },

  pinyinText: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.primary[600],
    textAlign: 'center',
    fontStyle: 'italic',
  },

  translationText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[700],
    textAlign: 'center',
    fontWeight: '500',
  },

  // Mode selector
  modeSelector: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: 4,
    gap: 4,
  },

  modeButton: {
    flex: 1,
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 8,
    alignItems: 'center',
  },

  activeModeButton: {
    backgroundColor: colors.primary[500],
  },

  modeButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[600],
  },

  activeModeButtonText: {
    color: colors.neutral[50],
  },

  // Controls
  controlsSection: {
    gap: getResponsiveSpacing('md'),
  },

  mainButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },

  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('lg'),
    paddingHorizontal: getResponsiveSpacing('xl'),
    gap: getResponsiveSpacing('md'),
  },

  buttonText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[50],
  },

  playButton: {
    // Additional styling if needed
  },

  recordButton: {
    // Additional styling if needed
  },

  // Results
  resultsSection: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('md'),
  },

  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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

  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },

  detailItem: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },

  detailLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },

  detailValue: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
  },

  feedbackText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    textAlign: 'center',
    fontStyle: 'italic',
  },

  suggestionsSection: {
    gap: getResponsiveSpacing('xs'),
  },

  suggestionsTitle: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[700],
  },

  suggestionText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    paddingLeft: getResponsiveSpacing('sm'),
  },

  // Full view
  fullContainer: {
    gap: getResponsiveSpacing('lg'),
  },

  advancedControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: getResponsiveSpacing('lg'),
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },

  advancedButton: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },

  advancedButtonText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
  },
});

export default EnhancedAudioPlayer; 