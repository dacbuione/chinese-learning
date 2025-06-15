import React from 'react';
import { BaseText } from './BaseText';
import { PinyinTextProps } from './Text.types';
import { colors } from '../../../../theme';

export const PinyinText: React.FC<PinyinTextProps> = ({
  tone,
  showToneMarks = true,
  size = 'lg',
  weight = 'normal',
  color = colors.primary[600],
  children,
  style,
  ...props
}) => {
  return (
    <BaseText
      size={size}
      weight={weight}
      color={color}
      align="center"
      style={[
        {
          fontStyle: 'italic',
          letterSpacing: 0.3,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </BaseText>
  );
}; 