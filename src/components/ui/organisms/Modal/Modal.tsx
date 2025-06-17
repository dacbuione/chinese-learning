import React, { useState, useCallback, useMemo, forwardRef, useImperativeHandle } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal as RNModal,
  Dimensions,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
} from 'react-native-reanimated';

// Internal imports
import { Button } from '../../atoms/Button';
import type {
  ModalProps,
  ModalRef,
  ModalState,
  ModalStyles,
} from './Modal.types';
import {
  colors,
  getResponsiveSpacing,
  getResponsiveFontSize,
  Layout,
  typography,
} from '@/theme';

/**
 * Modern Modal Component for Chinese Learning App
 * 
 * Features:
 * - Multiple variants (alert, confirm, loading, bottom sheet)
 * - Smooth animations
 * - Blur backdrop effects
 * - Responsive design
 * - Vietnamese-first approach
 */
export const Modal = forwardRef<ModalRef, ModalProps>(({
  variant = 'default',
  size = 'md',
  visible,
  onClose,
  animation = 'fade',
  animationDuration = 300,
  backdrop = { enabled: true, dismissOnPress: true },
  header,
  footer,
  children,
  alert,
  confirm,
  loading,
  backgroundColor,
  borderRadius = 16,
  showShadow = true,
  dismissOnBackdropPress = true,
  containerStyle,
  contentStyle,
  onShow,
  onHide,
}, ref) => {
  // Component state
  const [state, setState] = useState<ModalState>({
    isVisible: visible,
    isAnimating: false,
    animationProgress: 0,
    backdropOpacity: 0,
    contentScale: 1,
    contentTranslateY: 0,
    contentTranslateX: 0,
  });

  // Animation values
  const backdropOpacity = useSharedValue(0);
  const contentScale = useSharedValue(0.8);
  const contentTranslateY = useSharedValue(50);

  // Ref methods
  useImperativeHandle(ref, () => ({
    show: () => {
      setState(prev => ({ ...prev, isVisible: true }));
      onShow?.();
    },
    hide: () => {
      setState(prev => ({ ...prev, isVisible: false }));
      onHide?.();
    },
    toggle: () => {
      if (state.isVisible) {
        setState(prev => ({ ...prev, isVisible: false }));
        onHide?.();
      } else {
        setState(prev => ({ ...prev, isVisible: true }));
        onShow?.();
      }
    },
    isVisible: () => state.isVisible,
    getState: () => state,
  }), [state, onShow, onHide]);

  // Event handlers
  const handleBackdropPress = useCallback(() => {
    if (dismissOnBackdropPress && backdrop?.dismissOnPress !== false) {
      onClose();
    }
  }, [dismissOnBackdropPress, backdrop, onClose]);

  // Animated styles
  const backdropAnimatedStyle = useAnimatedStyle(() => ({
    opacity: backdropOpacity.value,
  }));

  const contentAnimatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: contentScale.value },
      { translateY: contentTranslateY.value },
    ],
  }));

  // Styles
  const styles = useMemo((): ModalStyles => StyleSheet.create({
    overlay: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    backdrop: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: backdrop?.color || 'rgba(0,0,0,0.5)',
    },
    container: {
      backgroundColor: backgroundColor || colors.neutral[50],
      borderRadius,
      margin: getResponsiveSpacing('lg'),
      maxWidth: Layout.isMobile ? '90%' : '80%',
      maxHeight: '80%',
      ...(showShadow && {
        shadowColor: colors.neutral[900],
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 8,
      }),
    },
    content: {
      padding: getResponsiveSpacing('lg'),
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: getResponsiveSpacing('md'),
      paddingBottom: getResponsiveSpacing('md'),
      borderBottomWidth: 1,
      borderBottomColor: colors.neutral[200],
    },
    headerTitle: {
      fontSize: getResponsiveFontSize('xl'),
      fontWeight: typography.weights.bold,
      color: colors.neutral[900],
      flex: 1,
    },
    headerSubtitle: {
      fontSize: getResponsiveFontSize('sm'),
      color: colors.neutral[600],
      marginTop: 4,
    },
    headerActions: {
      flexDirection: 'row',
      gap: getResponsiveSpacing('sm'),
    },
    headerAction: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerActionIcon: {
      fontSize: getResponsiveFontSize('lg'),
      color: colors.neutral[700],
    },
    closeButton: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.neutral[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeIcon: {
      fontSize: getResponsiveFontSize('lg'),
      color: colors.neutral[700],
    },
    body: {
      marginBottom: getResponsiveSpacing('lg'),
    },
    footer: {
      flexDirection: Layout.isMobile ? 'column' : 'row',
      gap: getResponsiveSpacing('md'),
      paddingTop: getResponsiveSpacing('md'),
      borderTopWidth: 1,
      borderTopColor: colors.neutral[200],
    },
    footerActions: {
      flexDirection: 'row',
      gap: getResponsiveSpacing('md'),
      flex: 1,
    },
    primaryButton: {
      flex: 1,
    },
    secondaryButton: {
      flex: 1,
    },
    buttonText: {
      fontSize: getResponsiveFontSize('base'),
      fontWeight: typography.weights.medium,
    },
    loadingContainer: {
      alignItems: 'center',
      padding: getResponsiveSpacing('xl'),
    },
    loadingText: {
      fontSize: getResponsiveFontSize('lg'),
      fontWeight: typography.weights.medium,
      color: colors.neutral[900],
      marginTop: getResponsiveSpacing('md'),
    },
    alertContainer: {
      alignItems: 'center',
      padding: getResponsiveSpacing('lg'),
    },
    alertIcon: {
      fontSize: getResponsiveFontSize('4xl'),
      marginBottom: getResponsiveSpacing('md'),
    },
    alertTitle: {
      fontSize: getResponsiveFontSize('xl'),
      fontWeight: typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: getResponsiveSpacing('sm'),
    },
    alertMessage: {
      fontSize: getResponsiveFontSize('base'),
      color: colors.neutral[600],
      textAlign: 'center',
      lineHeight: typography.lineHeights.relaxed,
      marginBottom: getResponsiveSpacing('lg'),
    },
    confirmContainer: {
      alignItems: 'center',
      padding: getResponsiveSpacing('lg'),
    },
    confirmIcon: {
      fontSize: getResponsiveFontSize('4xl'),
      marginBottom: getResponsiveSpacing('md'),
    },
    confirmTitle: {
      fontSize: getResponsiveFontSize('xl'),
      fontWeight: typography.weights.bold,
      color: colors.neutral[900],
      textAlign: 'center',
      marginBottom: getResponsiveSpacing('sm'),
    },
    confirmMessage: {
      fontSize: getResponsiveFontSize('base'),
      color: colors.neutral[600],
      textAlign: 'center',
      lineHeight: typography.lineHeights.relaxed,
      marginBottom: getResponsiveSpacing('lg'),
    },
    bottomSheetContainer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: colors.neutral[50],
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      paddingTop: getResponsiveSpacing('md'),
    },
    bottomSheetHandle: {
      width: 40,
      height: 4,
      backgroundColor: colors.neutral[300],
      borderRadius: 2,
      alignSelf: 'center',
      marginBottom: getResponsiveSpacing('md'),
    },
    sideDrawerContainer: {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      width: '80%',
      backgroundColor: colors.neutral[50],
    },
    fullscreenContainer: {
      flex: 1,
      backgroundColor: colors.neutral[50],
    },
  }), [backgroundColor, borderRadius, showShadow, backdrop]);

  // Render header
  const renderHeader = () => {
    if (!header) return null;

    return (
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          {header.title && (
            <Text style={styles.headerTitle}>{header.title}</Text>
          )}
          {header.subtitle && (
            <Text style={styles.headerSubtitle}>{header.subtitle}</Text>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {header.leftAction && (
            <TouchableOpacity
              style={styles.headerAction}
              onPress={header.leftAction.onPress}
            >
              <Text style={styles.headerActionIcon}>
                {header.leftAction.icon}
              </Text>
            </TouchableOpacity>
          )}
          
          {header.rightAction && (
            <TouchableOpacity
              style={styles.headerAction}
              onPress={header.rightAction.onPress}
            >
              <Text style={styles.headerActionIcon}>
                {header.rightAction.icon}
              </Text>
            </TouchableOpacity>
          )}
          
          {header.showCloseButton !== false && (
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Text style={styles.closeIcon}>
                {header.closeIcon || '✕'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Render footer
  const renderFooter = () => {
    if (!footer) return null;

    return (
      <View style={styles.footer}>
        <View style={styles.footerActions}>
          {footer.secondaryButton && (
            <Button
              variant={footer.secondaryButton.variant || 'secondary'}
              onPress={footer.secondaryButton.onPress}
              disabled={footer.secondaryButton.disabled}
              style={styles.secondaryButton}
            >
              {footer.secondaryButton.title}
            </Button>
          )}
          
          {footer.primaryButton && (
            <Button
              variant={footer.primaryButton.variant || 'primary'}
              onPress={footer.primaryButton.onPress}
              disabled={footer.primaryButton.disabled}
              state={footer.primaryButton.loading ? 'loading' : 'default'}
              style={styles.primaryButton}
            >
              {footer.primaryButton.title}
            </Button>
          )}
        </View>
      </View>
    );
  };

  // Render alert content
  const renderAlertContent = () => {
    if (!alert) return null;

    return (
      <View style={styles.alertContainer}>
        {alert.icon && (
          <Text style={[styles.alertIcon, { color: alert.iconColor || colors.warning[500] }]}>
            {alert.icon}
          </Text>
        )}
        <Text style={styles.alertTitle}>{alert.title}</Text>
        {alert.message && (
          <Text style={styles.alertMessage}>{alert.message}</Text>
        )}
        <Button
          variant="primary"
          onPress={() => {
            alert.onPress?.();
            onClose();
          }}
        >
          {alert.buttonText || 'OK'}
        </Button>
      </View>
    );
  };

  // Render confirm content
  const renderConfirmContent = () => {
    if (!confirm) return null;

    return (
      <View style={styles.confirmContainer}>
        {confirm.icon && (
          <Text style={[styles.confirmIcon, { color: confirm.iconColor || colors.error[500] }]}>
            {confirm.icon}
          </Text>
        )}
        <Text style={styles.confirmTitle}>{confirm.title}</Text>
        {confirm.message && (
          <Text style={styles.confirmMessage}>{confirm.message}</Text>
        )}
        <View style={styles.footerActions}>
          <Button
            variant="secondary"
            onPress={() => {
              confirm.onCancel?.();
              onClose();
            }}
            style={styles.secondaryButton}
          >
            {confirm.cancelText || 'Hủy'}
          </Button>
          <Button
            variant={confirm.destructive ? 'primary' : 'primary'}
            onPress={() => {
              confirm.onConfirm();
              onClose();
            }}
            style={styles.primaryButton}
          >
            {confirm.confirmText || 'Xác nhận'}
          </Button>
        </View>
      </View>
    );
  };

  // Render loading content
  const renderLoadingContent = () => {
    if (!loading) return null;

    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>⏳</Text>
        {loading.title && (
          <Text style={styles.loadingText}>{loading.title}</Text>
        )}
        {loading.message && (
          <Text style={styles.alertMessage}>{loading.message}</Text>
        )}
      </View>
    );
  };

  // Render content based on variant
  const renderContent = () => {
    switch (variant) {
      case 'alert':
        return renderAlertContent();
      case 'confirm':
        return renderConfirmContent();
      case 'loading':
        return renderLoadingContent();
      default:
        return (
          <>
            {renderHeader()}
            <View style={styles.body}>
              {children}
            </View>
            {renderFooter()}
          </>
        );
    }
  };

  return (
    <RNModal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[styles.backdrop, backdropAnimatedStyle]}
        />
        
        <TouchableOpacity
          style={StyleSheet.absoluteFill}
          activeOpacity={1}
          onPress={handleBackdropPress}
        />
        
        <Animated.View
          style={[
            styles.container,
            containerStyle,
            contentAnimatedStyle,
          ]}
        >
          <View style={[styles.content, contentStyle]}>
            {renderContent()}
          </View>
        </Animated.View>
      </View>
    </RNModal>
  );
});

Modal.displayName = 'Modal';

export default Modal; 