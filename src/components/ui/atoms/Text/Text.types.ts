import { TextProps as RNTextProps } from 'react-native';

export type TextSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' | '5xl' | '6xl' | '7xl';
export type TextWeight = 'normal' | 'medium' | 'semibold' | 'bold';
export type TextAlign = 'left' | 'center' | 'right' | 'justify';

export interface BaseTextProps extends RNTextProps {
  size?: TextSize;
  weight?: TextWeight;
  align?: TextAlign;
  color?: string;
  children: React.ReactNode;
}

export interface ChineseTextProps extends BaseTextProps {
  tone?: number;
  showTone?: boolean;
}

export interface PinyinTextProps extends BaseTextProps {
  tone?: number;
  showToneMarks?: boolean;
}

export interface TranslationTextProps extends BaseTextProps {
  language?: 'vi' | 'en';
  secondary?: boolean;
} 