import React from 'react';
import { BaseText } from './BaseText';
import { TranslationTextProps } from './Text.types';
import { colors } from '../../../../theme';

export const TranslationText: React.FC<TranslationTextProps> = ({
  language = 'vi',
  secondary = false,
  size = 'base',
  weight = 'normal',
  color,
  children,
  align = 'center',
  style,
  ...props
}) => {
  const defaultColor = secondary 
    ? colors.neutral[600] 
    : colors.neutral[700];
  
  const textColor = color || defaultColor;
  const textWeight = language === 'vi' ? 'medium' : weight;

  return (
    <BaseText
      size={size}
      weight={textWeight}
      color={textColor}
      align={align}
      style={[
        {
          letterSpacing: 0.2,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </BaseText>
  );
}; 