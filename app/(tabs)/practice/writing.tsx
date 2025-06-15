import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';

// Components  
import { StrokeOrderAnimation } from '../../../src/components/features/writing/components/StrokeOrderAnimation/StrokeOrderAnimation';
import { TranslationText } from '../../../src/components/ui/atoms/Text';
import { Button } from '../../../src/components/ui/atoms/Button';

// Theme
import { colors, getResponsiveSpacing } from '../../../src/theme';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight } from 'lucide-react-native';

export default function WritingPracticeScreen() {
  const router = useRouter();
  
  // Sample character data with stroke order
  const characterData = [
    {
      character: '人',
      pinyin: 'rén',
      vietnamese: 'người',
      strokes: [
        {
          id: 'stroke1',
          path: 'M50 50 L100 150',
          startPoint: { x: 50, y: 50 },
          endPoint: { x: 100, y: 150 },
          direction: 'diagonal' as const,
          order: 1,
        },
        {
          id: 'stroke2', 
          path: 'M150 50 L100 150',
          startPoint: { x: 150, y: 50 },
          endPoint: { x: 100, y: 150 },
          direction: 'diagonal' as const,
          order: 2,
        },
      ]
    },
    {
      character: '大',
      pinyin: 'dà',
      vietnamese: 'lớn',
      strokes: [
        {
          id: 'stroke1',
          path: 'M100 30 L100 150',
          startPoint: { x: 100, y: 30 },
          endPoint: { x: 100, y: 150 },
          direction: 'vertical' as const,
          order: 1,
        },
        {
          id: 'stroke2',
          path: 'M50 80 L150 80',
          startPoint: { x: 50, y: 80 },
          endPoint: { x: 150, y: 80 },
          direction: 'horizontal' as const,
          order: 2,
        },
        {
          id: 'stroke3',
          path: 'M70 120 L130 120',
          startPoint: { x: 70, y: 120 },
          endPoint: { x: 130, y: 120 },
          direction: 'horizontal' as const,
          order: 3,
        },
      ]
    },
    {
      character: '小',
      pinyin: 'xiǎo', 
      vietnamese: 'nhỏ',
      strokes: [
        {
          id: 'stroke1',
          path: 'M100 30 L100 80',
          startPoint: { x: 100, y: 30 },
          endPoint: { x: 100, y: 80 },
          direction: 'vertical' as const,
          order: 1,
        },
        {
          id: 'stroke2',
          path: 'M60 100 L90 130',
          startPoint: { x: 60, y: 100 },
          endPoint: { x: 90, y: 130 },
          direction: 'diagonal' as const,
          order: 2,
        },
        {
          id: 'stroke3',
          path: 'M140 100 L110 130',
          startPoint: { x: 140, y: 100 },
          endPoint: { x: 110, y: 130 },
          direction: 'diagonal' as const,
          order: 3,
        },
      ]
    },
  ];

  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const currentCharacter = characterData[currentCharacterIndex];

  const handleAnimationComplete = () => {
    console.log('Animation completed for character:', currentCharacter.character);
  };

  const handleStrokeComplete = (strokeIndex: number) => {
    console.log('Stroke completed:', strokeIndex + 1);
  };

  const nextCharacter = () => {
    if (currentCharacterIndex < characterData.length - 1) {
      setCurrentCharacterIndex(prev => prev + 1);
    }
  };

  const previousCharacter = () => {
    if (currentCharacterIndex > 0) {
      setCurrentCharacterIndex(prev => prev - 1);
    }
  };

  const resetAnimation = () => {
    // Force re-render by updating key
    setCurrentCharacterIndex(currentCharacterIndex);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.neutral[700]} />
        </Button>
        
        <View style={styles.headerTitle}>
          <TranslationText size="lg" weight="bold" color={colors.neutral[900]}>
            Luyện viết chữ Hán
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            {currentCharacterIndex + 1}/{characterData.length}
          </TranslationText>
        </View>
        
        <Button variant="ghost" size="sm" onPress={resetAnimation}>
          <RotateCcw size={20} color={colors.neutral[700]} />
        </Button>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        <StrokeOrderAnimation
          key={`${currentCharacter.character}-${currentCharacterIndex}`}
          character={currentCharacter.character}
          strokes={currentCharacter.strokes}
          pinyin={currentCharacter.pinyin}
          vietnamese={currentCharacter.vietnamese}
          autoPlay={true}
          playbackSpeed={1500}
          canvasSize={280}
          showStrokeNumbers={true}
          showDirection={true}
          onAnimationComplete={handleAnimationComplete}
          onStrokeComplete={handleStrokeComplete}
        />

        {/* Character Info */}
        <View style={styles.characterInfo}>
          <TranslationText size="base" color={colors.neutral[700]}>
            Ý nghĩa: {currentCharacter.vietnamese}
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            Phát âm: {currentCharacter.pinyin}
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            Số nét: {currentCharacter.strokes.length}
          </TranslationText>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <TranslationText size="sm" weight="medium" color={colors.primary[600]}>
            💡 Mẹo luyện tập:
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            • Viết từ trên xuống dưới, từ trái sang phải
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            • Hoàn thành nét ngang trước nét dọc
          </TranslationText>
          <TranslationText size="sm" color={colors.neutral[600]}>
            • Viết phần bên ngoài trước phần bên trong
          </TranslationText>
        </View>
      </ScrollView>

      {/* Navigation Footer */}
      <View style={styles.footer}>
        <Button 
          variant="outline" 
          size="sm" 
          onPress={previousCharacter}
          disabled={currentCharacterIndex === 0}
        >
          <ChevronLeft size={16} color={colors.neutral[600]} />
          <TranslationText size="sm" color={colors.neutral[600]}>
            Trước
          </TranslationText>
        </Button>
        
        <View style={styles.progressIndicator}>
          {characterData.map((_, index) => (
            <View
              key={index}
              style={[
                styles.progressDot,
                {
                  backgroundColor: index === currentCharacterIndex 
                    ? colors.primary[500] 
                    : colors.neutral[300]
                }
              ]}
            />
          ))}
        </View>
        
        <Button 
          variant="outline" 
          size="sm" 
          onPress={nextCharacter}
          disabled={currentCharacterIndex === characterData.length - 1}
        >
          <TranslationText size="sm" color={colors.neutral[600]}>
            Tiếp
          </TranslationText>
          <ChevronRight size={16} color={colors.neutral[600]} />
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('xl'),
  },
  characterInfo: {
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    gap: getResponsiveSpacing('sm'),
  },
  tipsContainer: {
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.primary[50],
    borderRadius: 12,
    gap: getResponsiveSpacing('sm'),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xs'),
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 