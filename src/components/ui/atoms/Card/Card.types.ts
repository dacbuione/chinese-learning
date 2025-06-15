import { ViewStyle } from 'react-native';

export type CardVariant = 'default' | 'elevated' | 'outlined' | 'filled' | 'glass';
export type CardSize = 'sm' | 'md' | 'lg' | 'xl';
export type CardBorderRadius = 'none' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

export interface CardProps {
  children: React.ReactNode;
  variant?: CardVariant;
  size?: CardSize;
  borderRadius?: CardBorderRadius;
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
} 