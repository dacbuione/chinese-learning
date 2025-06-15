import React from 'react';
import { Text } from 'react-native';
import { BaseTextProps } from './Text.types';
import { colors, typography } from '../../../../theme';
import { responsiveTypography } from '../../../../theme/responsive';

export const BaseText: React.FC<BaseTextProps> = ({
  size = 'base',
  weight = 'normal',
  align = 'left',
  color = colors.neutral[900],
  children,
  style,
  ...props
}) => {
  const fontSize = responsiveTypography.getResponsiveFontSize(size);
  const fontWeight = typography.weights[weight];

  return (
    <Text
      style={[
        {
          fontSize,
          fontWeight,
          textAlign: align,
          color,
          fontFamily: typography.fonts.regular,
        },
        style,
      ]}
      {...props}
    >
      {children}
    </Text>
  );
}; 