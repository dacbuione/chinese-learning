import React from 'react';
import { View } from 'react-native';
import { BaseText } from './BaseText';
import { ChineseTextProps } from './Text.types';
import { colors } from '@/theme';
import { responsiveTypography } from '@/theme/responsive';

export const ChineseText: React.FC<ChineseTextProps> = ({
  tone,
  showTone = false,
  size = '4xl',
  weight = 'normal',
  color = colors.neutral[900],
  children,
  style,
  ...props
}) => {
  const fontSize = responsiveTypography.getResponsiveFontSize(size);
  const lineHeight = responsiveTypography.getChineseLineHeight(fontSize);
  
  // Tone colors for Chinese characters
  const toneColors = {
    1: colors.tones?.tone1 || colors.primary[500],
    2: colors.tones?.tone2 || colors.secondary[500],
    3: colors.tones?.tone3 || colors.accent[500],
    4: colors.tones?.tone4 || colors.primary[600],
    0: colors.tones?.neutral || colors.neutral[500],
  };

  const textColor = tone && showTone ? toneColors[tone as keyof typeof toneColors] : color;

  return (
    <View style={{ alignItems: 'center' }}>
      <BaseText
        size={size}
        weight={weight}
        color={textColor}
        style={[
          {
            fontFamily: 'System', // Chinese font
            lineHeight,
            letterSpacing: 0.5, // Better spacing for Chinese characters
          },
          style,
        ]}
        {...props}
      >
        {children}
      </BaseText>
      {showTone && tone && (
        <View
          style={{
            width: 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: toneColors[tone as keyof typeof toneColors],
            marginTop: 4,
          }}
        />
      )}
    </View>
  );
}; 