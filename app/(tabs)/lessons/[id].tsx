import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../src/theme';
import { useVocabularyTTS } from '../../../src/hooks/useTTS';

const { width } = Dimensions.get('window');

interface VocabularyItem {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  tone: number;
  audio?: string;
}

interface GrammarPoint {
  id: string;
  title: string;
  explanation: string;
  example: string;
  translation: string;
}

interface LessonData {
  id: string;
  title: string;
  description: string;
  level: string;
  progress: number;
  vocabulary: VocabularyItem[];
  grammar: GrammarPoint[];
  totalItems: number;
  completedItems: number;
}

const lessonData: Record<string, LessonData> = {
  'chao-hoi': {
    id: 'chao-hoi',
    title: 'Chào hỏi cơ bản',
    description: 'Học cách chào hỏi và giới thiệu bản thân bằng tiếng Trung',
    level: 'HSK 1',
    progress: 100,
    totalItems: 8,
    completedItems: 8,
    vocabulary: [
      { id: 'ni-hao', hanzi: '你好', pinyin: 'nǐ hǎo', english: 'hello', vietnamese: 'xin chào', tone: 3 },
      { id: 'zai-jian', hanzi: '再见', pinyin: 'zài jiàn', english: 'goodbye', vietnamese: 'tạm biệt', tone: 4 },
      { id: 'xie-xie', hanzi: '谢谢', pinyin: 'xiè xiè', english: 'thank you', vietnamese: 'cảm ơn', tone: 4 },
      { id: 'bu-ke-qi', hanzi: '不客气', pinyin: 'bù kè qì', english: 'you\'re welcome', vietnamese: 'không có gì', tone: 4 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Cấu trúc chào hỏi cơ bản',
        explanation: 'Sử dụng 你好 (nǐ hǎo) để chào hỏi trong mọi tình huống',
        example: '你好！我是李明。',
        translation: 'Xin chào! Tôi là Lý Minh.'
      },
      {
        id: '2', 
        title: 'Cách cảm ơn và đáp lại',
        explanation: 'Dùng 谢谢 để cảm ơn và 不客气 để đáp lại',
        example: 'A: 谢谢！ B: 不客气！',
        translation: 'A: Cảm ơn! B: Không có gì!'
      }
    ]
  },
  'so-dem': {
    id: 'so-dem',
    title: 'Số đếm 1-10',
    description: 'Học cách đếm số từ 1 đến 10 bằng tiếng Trung',
    level: 'HSK 1',
    progress: 75,
    totalItems: 10,
    completedItems: 7,
    vocabulary: [
      { id: '1', hanzi: '一', pinyin: 'yī', english: 'one', vietnamese: 'một', tone: 1 },
      { id: '2', hanzi: '二', pinyin: 'èr', english: 'two', vietnamese: 'hai', tone: 4 },
      { id: '3', hanzi: '三', pinyin: 'sān', english: 'three', vietnamese: 'ba', tone: 1 },
      { id: '4', hanzi: '四', pinyin: 'sì', english: 'four', vietnamese: 'bốn', tone: 4 },
      { id: '5', hanzi: '五', pinyin: 'wǔ', english: 'five', vietnamese: 'năm', tone: 3 },
    ],
    grammar: [
      {
        id: '1',
        title: 'Cách đếm số cơ bản',
        explanation: 'Số đếm trong tiếng Trung có quy tắc đơn giản từ 1-10',
        example: '一、二、三、四、五',
        translation: 'Một, hai, ba, bốn, năm'
      }
    ]
  }
};

export default function LessonDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar' | 'practice'>('vocabulary');
  const [selectedVocab, setSelectedVocab] = useState<string | null>(null);

  // TTS Hook
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakVocabulary,
    stop: stopTTS,
  } = useVocabularyTTS();

  const lesson = id ? lessonData[id] : null;

  if (!lesson) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy bài học</Text>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Text style={styles.backButtonText}>Quay lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const getToneColor = (tone: number) => {
    const toneColors = {
      1: colors.error[500],    // Thanh ngang - đỏ
      2: colors.warning[500],  // Thanh sắc - vàng
      3: colors.accent[500],   // Thanh huyền - xanh lá
      4: colors.primary[500],  // Thanh nặng - xanh dương
    };
    return toneColors[tone as keyof typeof toneColors] || colors.neutral[500];
  };

  const handleVocabAudio = async (item: VocabularyItem) => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakVocabulary({
          simplified: item.hanzi,
          pinyin: item.pinyin,
          tone: item.tone,
        });
      }
    } catch (error) {
      console.error('Vocabulary TTS Error:', error);
      Alert.alert('Lỗi phát âm', 'Không thể phát âm từ vựng. Vui lòng thử lại.');
    }
  };

  const renderVocabularyTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Từ vựng ({lesson.vocabulary.length} từ)</Text>
      {lesson.vocabulary.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.vocabularyCard,
            selectedVocab === item.id && styles.selectedCard
          ]}
          onPress={() => {
            // Navigate to vocabulary detail screen
            router.push(`/vocabulary/${item.id}`);
          }}
        >
          <View style={styles.vocabularyHeader}>
            <View style={styles.toneRow}>
              <View style={[styles.toneIndicator, { backgroundColor: getToneColor(item.tone) }]} />
              <Text style={styles.toneText}>Thanh {item.tone}</Text>
            </View>
            <TouchableOpacity style={styles.audioButton} onPress={() => handleVocabAudio(item)}>
              <Text style={styles.audioButtonText}>🔊</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.hanzi}>{item.hanzi}</Text>
          <Text style={styles.pinyin}>{item.pinyin}</Text>
          
          <View style={styles.translations}>
            <Text style={styles.english}>{item.english}</Text>
            <Text style={styles.vietnamese}>{item.vietnamese}</Text>
          </View>

          {selectedVocab === item.id && (
            <View style={styles.expandedContent}>
              <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Luyện tập</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.actionButtonText}>Thêm vào yêu thích</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderGrammarTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Ngữ pháp ({lesson.grammar.length} điểm)</Text>
      {lesson.grammar.map((item) => (
        <View key={item.id} style={styles.grammarCard}>
          <Text style={styles.grammarTitle}>{item.title}</Text>
          <Text style={styles.grammarExplanation}>{item.explanation}</Text>
          
          <View style={styles.exampleContainer}>
            <Text style={styles.exampleLabel}>Ví dụ:</Text>
            <Text style={styles.exampleChinese}>{item.example}</Text>
            <Text style={styles.exampleTranslation}>{item.translation}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderPracticeTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Luyện tập</Text>
      
      <TouchableOpacity 
        style={styles.practiceCard}
        onPress={() => router.push(`/practice/vocabulary?lesson=${lesson.id}`)}
      >
        <Text style={styles.practiceTitle}>🎯 Luyện từ vựng</Text>
        <Text style={styles.practiceDescription}>Ôn tập {lesson.vocabulary.length} từ vựng trong bài</Text>
        <Text style={styles.practiceTime}>⏱️ 5-10 phút</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.practiceCard}
        onPress={() => router.push(`/practice/pronunciation?lesson=${lesson.id}`)}
      >
        <Text style={styles.practiceTitle}>🗣️ Luyện phát âm</Text>
        <Text style={styles.practiceDescription}>Thực hành phát âm các từ trong bài</Text>
        <Text style={styles.practiceTime}>⏱️ 10-15 phút</Text>
      </TouchableOpacity>

             <TouchableOpacity 
         style={styles.practiceCard}
         onPress={() => router.push(`/(tabs)/practice/quiz?lesson=${lesson.id}`)}
       >
         <Text style={styles.practiceTitle}>📝 Kiểm tra</Text>
         <Text style={styles.practiceDescription}>Kiểm tra hiểu biết về bài học</Text>
         <Text style={styles.practiceTime}>⏱️ 5 phút</Text>
       </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/lessons')}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.lessonTitle}>{lesson.title}</Text>
          <Text style={styles.lessonLevel}>{lesson.level}</Text>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <View style={styles.progressInfo}>
          <Text style={styles.progressText}>
            Tiến độ: {lesson.completedItems}/{lesson.totalItems} ({lesson.progress}%)
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${lesson.progress}%` }]} />
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'vocabulary' && styles.activeTab]}
          onPress={() => setActiveTab('vocabulary')}
        >
          <Text style={[styles.tabText, activeTab === 'vocabulary' && styles.activeTabText]}>
            Từ vựng
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'grammar' && styles.activeTab]}
          onPress={() => setActiveTab('grammar')}
        >
          <Text style={[styles.tabText, activeTab === 'grammar' && styles.activeTabText]}>
            Ngữ pháp
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'practice' && styles.activeTab]}
          onPress={() => setActiveTab('practice')}
        >
          <Text style={[styles.tabText, activeTab === 'practice' && styles.activeTabText]}>
            Luyện tập
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'vocabulary' && renderVocabularyTab()}
        {activeTab === 'grammar' && renderGrammarTab()}
        {activeTab === 'practice' && renderPracticeTab()}
      </ScrollView>
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
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    marginRight: getResponsiveSpacing('md'),
  },
  backButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontWeight: '500',
  },
  headerInfo: {
    flex: 1,
  },
  lessonTitle: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '600',
    color: colors.neutral[900],
  },
  lessonLevel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginTop: 2,
  },
  progressContainer: {
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
  },
  progressInfo: {
    marginBottom: getResponsiveSpacing('sm'),
  },
  progressText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[700],
  },
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
         backgroundColor: colors.accent[500],
    borderRadius: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: colors.neutral[100],
    marginHorizontal: getResponsiveSpacing('lg'),
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: getResponsiveSpacing('sm'),
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: colors.neutral[50],
  },
  tabText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  activeTabText: {
    color: colors.primary[600],
  },
  content: {
    flex: 1,
    padding: getResponsiveSpacing('lg'),
  },
  tabContent: {
    paddingBottom: getResponsiveSpacing('xl'),
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
  },
  vocabularyCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  selectedCard: {
    borderColor: colors.primary[500],
    backgroundColor: colors.primary[50],
  },
  vocabularyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  toneRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  toneIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: getResponsiveSpacing('xs'),
  },
  toneText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[600],
  },
  audioButton: {
    padding: getResponsiveSpacing('xs'),
  },
  audioButtonText: {
    fontSize: getResponsiveFontSize('lg'),
  },
  hanzi: {
    fontSize: getResponsiveFontSize('4xl'),
    fontFamily: 'System',
    color: colors.neutral[900],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  pinyin: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.primary[600],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('md'),
    fontStyle: 'italic',
  },
  translations: {
    gap: getResponsiveSpacing('xs'),
  },
  english: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    textAlign: 'center',
  },
  vietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    textAlign: 'center',
    fontWeight: '500',
  },
  expandedContent: {
    marginTop: getResponsiveSpacing('md'),
    paddingTop: getResponsiveSpacing('md'),
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  actionButtons: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 8,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[50],
    fontWeight: '500',
  },
  grammarCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  grammarTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },
  grammarExplanation: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    lineHeight: 24,
    marginBottom: getResponsiveSpacing('md'),
  },
  exampleContainer: {
    backgroundColor: colors.neutral[100],
    borderRadius: 8,
    padding: getResponsiveSpacing('md'),
  },
  exampleLabel: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
    marginBottom: getResponsiveSpacing('xs'),
  },
  exampleChinese: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[900],
    fontFamily: 'System',
    marginBottom: getResponsiveSpacing('xs'),
  },
  exampleTranslation: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontStyle: 'italic',
  },
  practiceCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  practiceTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },
  practiceDescription: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('sm'),
  },
  practiceTime: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  errorText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('lg'),
  },
}); 