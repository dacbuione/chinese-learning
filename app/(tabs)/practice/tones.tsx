import React from 'react';
import { View, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';

// Components  
import { TonePractice } from '../../../src/components/features/pronunciation/components/TonePractice/TonePractice';
import { TranslationText } from '../../../src/components/ui/atoms/Text';
import { Button } from '../../../src/components/ui/atoms/Button';

// Theme
import { colors, getResponsiveSpacing } from '../../../src/theme';
import { ArrowLeft } from 'lucide-react-native';

export default function TonePracticeScreen() {
  const router = useRouter();
  
  // Sample tone examples - HSK1 vocabulary for practice
  const toneExamples = [
    {
      id: '1',
      character: '妈',
      pinyin: 'mā',
      tone: 1,
      vietnamese: 'mẹ',
      english: 'mother',
      audioUrl: '',
    },
    {
      id: '2',
      character: '麻',
      pinyin: 'má',
      tone: 2,
      vietnamese: 'cây gai',
      english: 'hemp',
      audioUrl: '',
    },
    {
      id: '3',
      character: '马',
      pinyin: 'mǎ',
      tone: 3,
      vietnamese: 'ngựa',
      english: 'horse',
      audioUrl: '',
    },
    {
      id: '4',
      character: '骂',
      pinyin: 'mà',
      tone: 4,
      vietnamese: 'chửi mắng',
      english: 'to scold',
      audioUrl: '',
    },
  ];

  const handleComplete = (score: number, timeSpent: number) => {
    console.log('Tone practice completed!', { score, timeSpent });
    // Show results or navigate back
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Button variant="ghost" size="sm" onPress={() => router.back()}>
          <ArrowLeft size={20} color={colors.neutral[700]} />
        </Button>
        
        <TranslationText size="lg" weight="bold" color={colors.neutral[900]}>
          Luyện thanh điệu
        </TranslationText>
        
        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <View style={styles.content}>
        <TonePractice
          examples={toneExamples}
          onComplete={handleComplete}
          showResults={true}
          autoAdvance={true}
          timeLimit={30}
          variant="default"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  content: {
    flex: 1,
    padding: getResponsiveSpacing('lg'),
  },
}); 