import type { ViewStyle, TextStyle } from 'react-native';

// 🎯 Modal Component Types

/**
 * Modal variants for different use cases
 */
export type ModalVariant = 
  | 'default'     // Standard modal
  | 'fullscreen'  // Full screen modal
  | 'bottom'      // Bottom sheet modal
  | 'center'      // Center modal
  | 'side'        // Side drawer modal
  | 'alert'       // Alert dialog modal
  | 'confirm'     // Confirmation modal
  | 'loading';    // Loading modal

/**
 * Modal sizes
 */
export type ModalSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'full';

/**
 * Modal animation types
 */
export type ModalAnimation = 
  | 'fade'        // Fade in/out
  | 'slide'       // Slide from bottom
  | 'slideLeft'   // Slide from left
  | 'slideRight'  // Slide from right
  | 'slideTop'    // Slide from top
  | 'scale'       // Scale in/out
  | 'spring'      // Spring animation
  | 'none';       // No animation

/**
 * Modal backdrop configuration
 */
export interface ModalBackdropConfig {
  enabled?: boolean;
  color?: string;
  opacity?: number;
  blur?: boolean;
  blurIntensity?: number;
  dismissOnPress?: boolean;
}

/**
 * Modal header configuration
 */
export interface ModalHeaderConfig {
  title?: string;
  subtitle?: string;
  showCloseButton?: boolean;
  closeIcon?: string;
  leftAction?: {
    icon: string;
    onPress: () => void;
    label?: string;
  };
  rightAction?: {
    icon: string;
    onPress: () => void;
    label?: string;
  };
}

/**
 * Modal footer configuration
 */
export interface ModalFooterConfig {
  primaryButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
    loading?: boolean;
  };
  secondaryButton?: {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
  };
  customActions?: {
    id: string;
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'ghost';
    disabled?: boolean;
  }[];
}

/**
 * Modal state
 */
export interface ModalState {
  isVisible: boolean;
  isAnimating: boolean;
  animationProgress: number;
  backdropOpacity: number;
  contentScale: number;
  contentTranslateY: number;
  contentTranslateX: number;
}

/**
 * Modal styles interface
 */
export interface ModalStyles {
  overlay: ViewStyle;
  backdrop: ViewStyle;
  container: ViewStyle;
  content: ViewStyle;
  header: ViewStyle;
  headerTitle: TextStyle;
  headerSubtitle: TextStyle;
  headerActions: ViewStyle;
  headerAction: ViewStyle;
  headerActionIcon: TextStyle;
  closeButton: ViewStyle;
  closeIcon: TextStyle;
  body: ViewStyle;
  footer: ViewStyle;
  footerActions: ViewStyle;
  primaryButton: ViewStyle;
  secondaryButton: ViewStyle;
  buttonText: TextStyle;
  loadingContainer: ViewStyle;
  loadingText: TextStyle;
  alertContainer: ViewStyle;
  alertIcon: TextStyle;
  alertTitle: TextStyle;
  alertMessage: TextStyle;
  confirmContainer: ViewStyle;
  confirmIcon: TextStyle;
  confirmTitle: TextStyle;
  confirmMessage: TextStyle;
  bottomSheetContainer: ViewStyle;
  bottomSheetHandle: ViewStyle;
  sideDrawerContainer: ViewStyle;
  fullscreenContainer: ViewStyle;
}

/**
 * Alert modal configuration
 */
export interface AlertModalConfig {
  icon?: string;
  iconColor?: string;
  title: string;
  message?: string;
  buttonText?: string;
  onPress?: () => void;
}

/**
 * Confirm modal configuration
 */
export interface ConfirmModalConfig {
  icon?: string;
  iconColor?: string;
  title: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  destructive?: boolean;
}

/**
 * Loading modal configuration
 */
export interface LoadingModalConfig {
  title?: string;
  message?: string;
  showProgress?: boolean;
  progress?: number;
  cancelable?: boolean;
  onCancel?: () => void;
}

/**
 * Main Modal component props
 */
export interface ModalProps {
  // Basic props
  variant?: ModalVariant;
  size?: ModalSize;
  visible: boolean;
  onClose: () => void;
  
  // Animation props
  animation?: ModalAnimation;
  animationDuration?: number;
  
  // Backdrop props
  backdrop?: ModalBackdropConfig;
  
  // Content props
  header?: ModalHeaderConfig;
  footer?: ModalFooterConfig;
  children?: React.ReactNode;
  
  // Alert/Confirm specific props
  alert?: AlertModalConfig;
  confirm?: ConfirmModalConfig;
  loading?: LoadingModalConfig;
  
  // Styling props
  backgroundColor?: string;
  borderRadius?: number;
  showShadow?: boolean;
  
  // Behavior props
  dismissOnBackdropPress?: boolean;
  dismissOnBackButton?: boolean;
  preventBackgroundScroll?: boolean;
  
  // Accessibility props
  accessibilityLabel?: string;
  accessibilityHint?: string;
  
  // Style props
  containerStyle?: ViewStyle;
  contentStyle?: ViewStyle;
  headerStyle?: ViewStyle;
  bodyStyle?: ViewStyle;
  footerStyle?: ViewStyle;
  
  // Callback props
  onShow?: () => void;
  onHide?: () => void;
  onAnimationStart?: () => void;
  onAnimationEnd?: () => void;
  onBackdropPress?: () => void;
  onBackButton?: () => boolean;
}

/**
 * Modal component ref methods
 */
export interface ModalRef {
  show: () => void;
  hide: () => void;
  toggle: () => void;
  isVisible: () => boolean;
  getState: () => ModalState;
}

/**
 * Modal hook return type
 */
export interface UseModalReturn {
  state: ModalState;
  actions: {
    show: () => void;
    hide: () => void;
    toggle: () => void;
  };
  animations: {
    fadeIn: () => void;
    fadeOut: () => void;
    slideIn: () => void;
    slideOut: () => void;
    scaleIn: () => void;
    scaleOut: () => void;
  };
}

/**
 * Modal preset configurations
 */
export interface ModalPresets {
  alert: Partial<ModalProps>;
  confirm: Partial<ModalProps>;
  loading: Partial<ModalProps>;
  bottomSheet: Partial<ModalProps>;
  fullscreen: Partial<ModalProps>;
  sideDrawer: Partial<ModalProps>;
}

/**
 * Modal accessibility props
 */
export interface ModalA11yProps {
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: 'dialog' | 'alertdialog';
  headerAccessibilityLabel?: string;
  closeButtonAccessibilityLabel?: string;
  backdropAccessibilityLabel?: string;
}

/**
 * Extended props with accessibility
 */
export interface ModalPropsWithA11y extends ModalProps, ModalA11yProps {}

// All types are already exported inline above 