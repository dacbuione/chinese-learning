import React from 'react';
import {
  View,
  StyleSheet,
  SafeAreaView,
} from 'react-native';
import { colors, getResponsiveSpacing } from '../../../src/theme';
import { EnhancedLessonList } from '../../../src/components/features/lessons/components/EnhancedLessonList';

const LessonsScreen: React.FC = () => {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <EnhancedLessonList 
          showLockedLessons={true}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  content: {
    flex: 1,
  },
});

export default LessonsScreen;