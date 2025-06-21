import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../../../theme';

interface VocabularyCardProps {
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  tone: number;
  onPress: () => void;
  style?: any;
}

export const VocabularyCard: React.FC<VocabularyCardProps> = ({
  hanzi,
  pinyin,
  english,
  vietnamese,
  tone,
  onPress,
  style
}) => {
  const [isPressed, setIsPressed] = useState(false);

  const getToneColor = (tone: number) => {
    const toneColors = {
      1: colors.tones.tone1, // Thanh ngang - Red
      2: colors.tones.tone2, // Thanh sắc - Yellow
      3: colors.tones.tone3, // Thanh huyền - Green
      4: colors.tones.tone4, // Thanh nặng - Blue
      0: colors.tones.neutral, // Thanh nhẹ - Gray
    };
    return toneColors[tone as keyof typeof toneColors] || colors.tones.neutral;
  };

  const getToneName = (tone: number) => {
    const toneNames = {
      1: 'Thanh ngang',
      2: 'Thanh sắc',
      3: 'Thanh huyền', 
      4: 'Thanh nặng',
      0: 'Thanh nhẹ',
    };
    return toneNames[tone as keyof typeof toneNames] || 'Thanh nhẹ';
  };

  const handlePressIn = () => setIsPressed(true);
  const handlePressOut = () => setIsPressed(false);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        isPressed && styles.pressedContainer,
        style
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.9}
    >
      {/* Tone Indicator */}
      <View style={styles.toneRow}>
        <View style={[styles.toneIndicator, { backgroundColor: getToneColor(tone) }]} />
        <Text style={[styles.toneText, { color: getToneColor(tone) }]}>
          {getToneName(tone)}
        </Text>
        </View>
        
      {/* Chinese Character */}
      <Text style={styles.hanzi}>{hanzi}</Text>

      {/* Pinyin */}
      <Text style={[styles.pinyin, { color: getToneColor(tone) }]}>
        {pinyin}
      </Text>

      {/* Translations */}
        <View style={styles.translations}>
        <Text style={styles.vietnamese}>{vietnamese}</Text>
        <Text style={styles.english}>{english}</Text>
        </View>
      </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.neutral[50],
    borderRadius: Layout.isMobile ? 12 : 16,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    minHeight: Layout.isMobile ? 150 : 180,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },

  pressedContainer: {
    backgroundColor: colors.neutral[100],
    transform: [{ scale: 0.98 }],
  },

  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },

  toneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: getResponsiveSpacing('xs'),
  },

  toneText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '500',
  },

  hanzi: {
    fontSize: getResponsiveFontSize('5xl'),
    fontFamily: 'System',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
    fontWeight: '400',
  },

  pinyin: {
    fontSize: getResponsiveFontSize('lg'),
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
    fontStyle: 'italic',
    fontWeight: '500',
  },

  translations: {
    gap: getResponsiveSpacing('xs'),
  },

  vietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    textAlign: 'center',
    fontWeight: '600',
  },

  english: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    textAlign: 'center',
    fontWeight: '400',
  },
}); 