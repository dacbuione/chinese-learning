import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors, getResponsiveSpacing, getResponsiveFontSize } from '@/theme';
import { AlertTriangle, RotateCcw } from 'lucide-react-native';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <View style={styles.content}>
            <AlertTriangle size={48} color={colors.error[500]} />
            <Text style={styles.title}>Đã xảy ra lỗi</Text>
            <Text style={styles.message}>
              Ứng dụng gặp sự cố không mong muốn. Vui lòng thử lại.
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Chi tiết lỗi (Dev Mode):</Text>
                <Text style={styles.errorText}>{this.state.error.message}</Text>
              </View>
            )}
            
            <TouchableOpacity style={styles.retryButton} onPress={this.handleReset}>
              <RotateCcw size={20} color={colors.neutral[50]} />
              <Text style={styles.retryButtonText}>Thử lại</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  content: {
    alignItems: 'center',
    maxWidth: 300,
    gap: getResponsiveSpacing('lg'),
  },
  title: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  message: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    lineHeight: 24,
  },
  errorDetails: {
    marginTop: getResponsiveSpacing('md'),
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.error[50],
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.error[200],
  },
  errorTitle: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.error[800],
    marginBottom: getResponsiveSpacing('xs'),
  },
  errorText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.error[700],
    fontFamily: 'monospace',
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary[500],
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 8,
    gap: getResponsiveSpacing('sm'),
  },
  retryButtonText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '500',
    color: colors.neutral[50],
  },
}); 