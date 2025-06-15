import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../src/theme';
import { useTranslation } from '../../src/hooks/useTranslation';
import { Button } from '../../src/components/common/Button';
import { PronunciationAudioButton, InlineAudioButton } from '../../src/components/common/AudioButton';
import { usePronunciationTTS } from '../../src/hooks/useTTS';

/**
 * 🎵 Pronunciation Practice Screen với AI TTS
 * 
 * Tính năng:
 * - Hiển thị chữ Hán với pinyin và thanh điệu
 * - Play audio với Google Cloud TTS
 * - Luyện tập từng thanh điệu
 * - Visual feedback khi play audio
 * - Tốc độ phát âm có thể điều chỉnh
 */

interface PronunciationExample {
  id: string;
  hanzi: string;
  pinyin: string;
  tone: number;
  vietnamese: string;
  english: string;
  category: string;
}

const pronunciationExamples: PronunciationExample[] = [
  {
    id: '1',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    tone: 3,
    vietnamese: 'Xin chào',
    english: 'Hello',
    category: 'Greetings'
  },
  {
    id: '2',
    hanzi: '谢谢',
    pinyin: 'xiè xiè',
    tone: 4,
    vietnamese: 'Cảm ơn',
    english: 'Thank you',
    category: 'Greetings'
  },
  {
    id: '3',
    hanzi: '妈妈',
    pinyin: 'mā ma',
    tone: 1,
    vietnamese: 'Mẹ',
    english: 'Mother',
    category: 'Family'
  },
  {
    id: '4',
    hanzi: '爸爸',
    pinyin: 'bà ba',
    tone: 4,
    vietnamese: 'Bố',
    english: 'Father',
    category: 'Family'
  },
  {
    id: '5',
    hanzi: '学习',
    pinyin: 'xué xí',
    tone: 2,
    vietnamese: 'Học tập',
    english: 'Study',
    category: 'Education'
  },
];

export default function PronunciationPractice() {
  const { t } = useTranslation();
  const [selectedExample, setSelectedExample] = useState<PronunciationExample>(pronunciationExamples[0]);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.8);
  
  const {
    isLoading,
    isPlaying,
    error,
    speakForPractice,
    speakExample,
    stop,
    clearError,
  } = usePronunciationTTS();

  const handlePlayPronunciation = async () => {
    try {
      await speakForPractice(
        selectedExample.hanzi,
        selectedExample.pinyin,
        selectedExample.tone,
        playbackSpeed
      );
    } catch (err) {
      console.error('Pronunciation playback error:', err);
    }
  };

  const handlePlayExample = async (text: string) => {
    try {
      await speakExample(text, playbackSpeed);
    } catch (err) {
      console.error('Example playback error:', err);
    }
  };

  const getToneColor = (tone: number) => {
    const toneColors = {
      1: colors.tones.tone1,
      2: colors.tones.tone2,
      3: colors.tones.tone3,
      4: colors.tones.tone4,
      0: colors.tones.neutral,
    };
    return toneColors[tone as keyof typeof toneColors] || colors.neutral[500];
  };

  const getToneName = (tone: number) => {
    const toneNames = {
      1: 'Thanh ngang',
      2: 'Thanh sắc',
      3: 'Thanh huyền',
      4: 'Thanh nặng',
      0: 'Thanh nhẹ',
    };
    return toneNames[tone as keyof typeof toneNames] || 'Không xác định';
  };

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen 
        options={{ 
          title: t('practice.pronunciation'),
          headerShown: true,
        }} 
      />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.title}>🎵 {t('practice.pronunciation')}</Text>
          <Text style={styles.subtitle}>
            Luyện tập phát âm tiếng Trung với AI Text-to-Speech
          </Text>
        </View>

        {/* Main Practice Card */}
        <View style={styles.practiceCard}>
          {/* Character Display */}
          <View style={styles.characterSection}>
            <Text style={styles.hanzi}>{selectedExample.hanzi}</Text>
            <Text style={styles.pinyin}>{selectedExample.pinyin}</Text>
            
            {/* Tone Indicator */}
            <View style={styles.toneRow}>
              <View 
                style={[
                  styles.toneIndicator, 
                  { backgroundColor: getToneColor(selectedExample.tone) }
                ]} 
              />
              <Text style={styles.toneText}>
                {getToneName(selectedExample.tone)}
              </Text>
            </View>
          </View>

          {/* Audio Controls */}
          <View style={styles.audioControls}>
            <PronunciationAudioButton
              hanzi={selectedExample.hanzi}
              pinyin={selectedExample.pinyin}
              tone={selectedExample.tone}
              size="large"
            />
            
            <View style={styles.audioInfo}>
              <Text style={styles.audioLabel}>
                {isLoading ? 'Đang tải...' : isPlaying ? 'Đang phát' : 'Nhấn để nghe'}
              </Text>
              <Text style={styles.speedLabel}>
                Tốc độ: {playbackSpeed}x
              </Text>
            </View>
          </View>

          {/* Translations */}
          <View style={styles.translations}>
            <Text style={styles.vietnamese}>{selectedExample.vietnamese}</Text>
            <Text style={styles.english}>{selectedExample.english}</Text>
          </View>

          {/* Error Display */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>❌ {error}</Text>
              <Button
                title="Thử lại"
                onPress={clearError}
                variant="outline"
                size="small"
              />
            </View>
          )}
        </View>

        {/* Speed Control */}
        <View style={styles.speedControl}>
          <Text style={styles.sectionTitle}>⚡ Tốc độ phát âm</Text>
          <View style={styles.speedButtons}>
            {[0.5, 0.8, 1.0, 1.2].map((speed) => (
              <Button
                key={speed}
                title={`${speed}x`}
                onPress={() => setPlaybackSpeed(speed)}
                variant={playbackSpeed === speed ? 'primary' : 'outline'}
                size="small"
              />
            ))}
          </View>
        </View>

        {/* Example List */}
        <View style={styles.examplesList}>
          <Text style={styles.sectionTitle}>📚 Ví dụ luyện tập</Text>
          
          {pronunciationExamples.map((example) => (
            <View 
              key={example.id} 
              style={[
                styles.exampleCard,
                selectedExample.id === example.id && styles.exampleCardSelected
              ]}
            >
              <View style={styles.exampleContent}>
                <View style={styles.exampleText}>
                  <Text style={styles.exampleHanzi}>{example.hanzi}</Text>
                  <Text style={styles.examplePinyin}>{example.pinyin}</Text>
                  <Text style={styles.exampleTranslation}>{example.vietnamese}</Text>
                </View>
                
                <View style={styles.exampleControls}>
                  <InlineAudioButton
                    hanzi={example.hanzi}
                    pinyin={example.pinyin}
                    tone={example.tone}
                  />
                  
                  <Button
                    title="Chọn"
                    onPress={() => setSelectedExample(example)}
                    variant={selectedExample.id === example.id ? 'primary' : 'outline'}
                    size="small"
                  />
                </View>
              </View>
              
              {/* Tone indicator */}
              <View 
                style={[
                  styles.exampleToneBar,
                  { backgroundColor: getToneColor(example.tone) }
                ]}
              />
            </View>
          ))}
        </View>

        {/* Practice Tips */}
        <View style={styles.tipsSection}>
          <Text style={styles.sectionTitle}>💡 Mẹo luyện tập</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tipItem}>
              • Nghe kỹ thanh điệu và cố gắng bắt chước
            </Text>
            <Text style={styles.tipItem}>
              • Bắt đầu với tốc độ chậm (0.5x-0.8x)
            </Text>
            <Text style={styles.tipItem}>
              • Lặp lại nhiều lần để ghi nhớ
            </Text>
            <Text style={styles.tipItem}>
              • Chú ý đến hình dạng miệng khi phát âm
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  content: {
    flex: 1,
    padding: getResponsiveSpacing('lg'),
  },
  header: {
    marginBottom: getResponsiveSpacing('xl'),
    alignItems: 'center',
  },
  title: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
    textAlign: 'center',
  },
  subtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  practiceCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: Layout.isMobile ? 16 : 20,
    padding: getResponsiveSpacing('xl'),
    marginBottom: getResponsiveSpacing('lg'),
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  characterSection: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('xl'),
  },
  hanzi: {
    fontSize: getResponsiveFontSize('7xl'),
    fontFamily: 'System',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
    textAlign: 'center',
  },
  pinyin: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.primary[600],
    fontStyle: 'italic',
    marginBottom: getResponsiveSpacing('md'),
    textAlign: 'center',
  },
  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  toneIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  toneText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  audioInfo: {
    alignItems: 'center',
  },
  audioLabel: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    fontWeight: '500',
  },
  speedLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[500],
    marginTop: getResponsiveSpacing('xs'),
  },
  translations: {
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  vietnamese: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[800],
    fontWeight: '600',
    textAlign: 'center',
  },
  english: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
  },
  errorContainer: {
    marginTop: getResponsiveSpacing('lg'),
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.error[50],
    borderRadius: 8,
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  errorText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.error[700],
    textAlign: 'center',
  },
  speedControl: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },
  speedButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
    justifyContent: 'center',
  },
  examplesList: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  exampleCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    marginBottom: getResponsiveSpacing('md'),
    overflow: 'hidden',
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  exampleCardSelected: {
    borderWidth: 2,
    borderColor: colors.primary[500],
  },
  exampleContent: {
    flexDirection: 'row',
    padding: getResponsiveSpacing('md'),
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exampleText: {
    flex: 1,
  },
  exampleHanzi: {
    fontSize: getResponsiveFontSize('xl'),
    fontFamily: 'System',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  examplePinyin: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.primary[600],
    fontStyle: 'italic',
    marginBottom: getResponsiveSpacing('xs'),
  },
  exampleTranslation: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  exampleControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  exampleToneBar: {
    height: 3,
    width: '100%',
  },
  tipsSection: {
    marginBottom: getResponsiveSpacing('xl'),
  },
  tipsList: {
    gap: getResponsiveSpacing('sm'),
  },
  tipItem: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    lineHeight: 24,
  },
}); 