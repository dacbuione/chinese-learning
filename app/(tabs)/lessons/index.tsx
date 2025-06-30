import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, getResponsiveSpacing, getResponsiveFontSize } from '../../../src/theme';
import { EnhancedLessonList } from '../../../src/components/features/lessons/components/EnhancedLessonList';

export default function LessonsScreen() {
  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <View style={styles.header}>
        <Text style={styles.title}>Tất cả bài học</Text>
        <Text style={styles.subtitle}>
          Hành trình chinh phục tiếng Trung của bạn
        </Text>
      </View>
      <EnhancedLessonList />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingTop: getResponsiveSpacing('md'),
    paddingBottom: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  title: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    marginTop: getResponsiveSpacing('xs'),
  },
});