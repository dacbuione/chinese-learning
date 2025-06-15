import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../src/theme';

const { width } = Dimensions.get('window');

interface VocabularyDetail {
  id: string;
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
  tone: number;
  strokeOrder: string[];
  examples: {
    chinese: string;
    pinyin: string;
    english: string;
    vietnamese: string;
  }[];
  relatedWords: {
    hanzi: string;
    pinyin: string;
    vietnamese: string;
  }[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  hskLevel: number;
  frequency: 'high' | 'medium' | 'low';
}

const vocabularyData: Record<string, VocabularyDetail> = {
  'ni-hao': {
    id: 'ni-hao',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    english: 'hello',
    vietnamese: 'xin chào',
    tone: 3,
    strokeOrder: ['丿', '亻', '小', '亅', '女', '子'],
    examples: [
      {
        chinese: '你好！我是李明。',
        pinyin: 'Nǐ hǎo! Wǒ shì Lǐ Míng.',
        english: 'Hello! I am Li Ming.',
        vietnamese: 'Xin chào! Tôi là Lý Minh.'
      },
      {
        chinese: '你好吗？',
        pinyin: 'Nǐ hǎo ma?',
        english: 'How are you?',
        vietnamese: 'Bạn có khỏe không?'
      },
      {
        chinese: '老师，你好！',
        pinyin: 'Lǎoshī, nǐ hǎo!',
        english: 'Hello, teacher!',
        vietnamese: 'Xin chào thầy/cô!'
      }
    ],
    relatedWords: [
      { hanzi: '您好', pinyin: 'nín hǎo', vietnamese: 'xin chào (lịch sự)' },
      { hanzi: '大家好', pinyin: 'dàjiā hǎo', vietnamese: 'xin chào mọi người' },
      { hanzi: '早上好', pinyin: 'zǎoshang hǎo', vietnamese: 'chào buổi sáng' }
    ],
    difficulty: 'beginner',
    hskLevel: 1,
    frequency: 'high'
  },
  'zai-jian': {
    id: 'zai-jian',
    hanzi: '再见',
    pinyin: 'zài jiàn',
    english: 'goodbye',
    vietnamese: 'tạm biệt',
    tone: 4,
    strokeOrder: ['一', '冂', '土', '见'],
    examples: [
      {
        chinese: '再见！明天见。',
        pinyin: 'Zàijiàn! Míngtiān jiàn.',
        english: 'Goodbye! See you tomorrow.',
        vietnamese: 'Tạm biệt! Hẹn gặp lại ngày mai.'
      },
      {
        chinese: '老师再见！',
        pinyin: 'Lǎoshī zàijiàn!',
        english: 'Goodbye, teacher!',
        vietnamese: 'Tạm biệt thầy/cô!'
      }
    ],
    relatedWords: [
      { hanzi: '拜拜', pinyin: 'bàibài', vietnamese: 'bye bye' },
      { hanzi: '回头见', pinyin: 'huítóu jiàn', vietnamese: 'hẹn gặp lại' },
      { hanzi: '明天见', pinyin: 'míngtiān jiàn', vietnamese: 'hẹn gặp ngày mai' }
    ],
    difficulty: 'beginner',
    hskLevel: 1,
    frequency: 'high'
  },
  'xie-xie': {
    id: 'xie-xie',
    hanzi: '谢谢',
    pinyin: 'xiè xiè',
    english: 'thank you',
    vietnamese: 'cảm ơn',
    tone: 4,
    strokeOrder: ['言', '身', '寸'],
    examples: [
      {
        chinese: '谢谢你！',
        pinyin: 'Xiè xiè nǐ!',
        english: 'Thank you!',
        vietnamese: 'Cảm ơn bạn!'
      },
      {
        chinese: '谢谢老师。',
        pinyin: 'Xiè xiè lǎoshī.',
        english: 'Thank you, teacher.',
        vietnamese: 'Cảm ơn thầy/cô.'
      }
    ],
    relatedWords: [
      { hanzi: '感谢', pinyin: 'gǎnxiè', vietnamese: 'cảm ơn (trang trọng)' },
      { hanzi: '多谢', pinyin: 'duōxiè', vietnamese: 'cảm ơn nhiều' },
      { hanzi: '谢谢你', pinyin: 'xiè xiè nǐ', vietnamese: 'cảm ơn bạn' }
    ],
    difficulty: 'beginner',
    hskLevel: 1,
    frequency: 'high'
  },
  'bu-ke-qi': {
    id: 'bu-ke-qi',
    hanzi: '不客气',
    pinyin: 'bù kè qì',
    english: 'you\'re welcome',
    vietnamese: 'không có gì',
    tone: 4,
    strokeOrder: ['一', '丿', '宀', '夂', '气'],
    examples: [
      {
        chinese: 'A: 谢谢！ B: 不客气！',
        pinyin: 'A: Xiè xiè! B: Bù kè qì!',
        english: 'A: Thank you! B: You\'re welcome!',
        vietnamese: 'A: Cảm ơn! B: Không có gì!'
      },
      {
        chinese: '不客气，这是我应该做的。',
        pinyin: 'Bù kè qì, zhè shì wǒ yīnggāi zuò de.',
        english: 'You\'re welcome, this is what I should do.',
        vietnamese: 'Không có gì, đây là điều tôi nên làm.'
      }
    ],
    relatedWords: [
      { hanzi: '不用谢', pinyin: 'bù yòng xiè', vietnamese: 'không cần cảm ơn' },
      { hanzi: '没关系', pinyin: 'méi guānxi', vietnamese: 'không sao' },
      { hanzi: '别客气', pinyin: 'bié kèqi', vietnamese: 'đừng khách sáo' }
    ],
    difficulty: 'beginner',
    hskLevel: 1,
    frequency: 'high'
  }
};

export default function VocabularyDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'info' | 'examples' | 'related'>('info');

  const vocabulary = id ? vocabularyData[id] : null;

  if (!vocabulary) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không tìm thấy từ vựng</Text>
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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return colors.accent[500];
      case 'intermediate': return colors.warning[500];
      case 'advanced': return colors.error[500];
      default: return colors.neutral[500];
    }
  };

  const getFrequencyText = (frequency: string) => {
    switch (frequency) {
      case 'high': return 'Thường dùng';
      case 'medium': return 'Trung bình';
      case 'low': return 'Ít dùng';
      default: return 'Không xác định';
    }
  };

  const renderInfoTab = () => (
    <View style={styles.tabContent}>
      {/* Main Word Display */}
      <View style={styles.mainWordCard}>
        <View style={styles.toneIndicator}>
          <View style={[styles.toneDot, { backgroundColor: getToneColor(vocabulary.tone) }]} />
          <Text style={styles.toneText}>Thanh {vocabulary.tone}</Text>
        </View>
        
        <Text style={styles.hanziLarge}>{vocabulary.hanzi}</Text>
        <Text style={styles.pinyinLarge}>{vocabulary.pinyin}</Text>
        
        <View style={styles.translations}>
          <Text style={styles.englishText}>{vocabulary.english}</Text>
          <Text style={styles.vietnameseText}>{vocabulary.vietnamese}</Text>
        </View>

        <TouchableOpacity style={styles.audioButton}>
          <Text style={styles.audioButtonText}>🔊 Phát âm</Text>
        </TouchableOpacity>
      </View>

      {/* Word Info */}
      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Thông tin từ vựng</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Cấp độ HSK:</Text>
          <Text style={styles.infoValue}>HSK {vocabulary.hskLevel}</Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Độ khó:</Text>
          <Text style={[styles.infoValue, { color: getDifficultyColor(vocabulary.difficulty) }]}>
            {vocabulary.difficulty === 'beginner' ? 'Cơ bản' : 
             vocabulary.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Tần suất:</Text>
          <Text style={styles.infoValue}>{getFrequencyText(vocabulary.frequency)}</Text>
        </View>
      </View>

      {/* Stroke Order */}
      <View style={styles.strokeCard}>
        <Text style={styles.strokeTitle}>Thứ tự nét viết</Text>
        <View style={styles.strokeContainer}>
          {vocabulary.strokeOrder.map((stroke, index) => (
            <View key={index} style={styles.strokeItem}>
              <Text style={styles.strokeNumber}>{index + 1}</Text>
              <Text style={styles.strokeCharacter}>{stroke}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={styles.practiceButton}>
          <Text style={styles.practiceButtonText}>✏️ Luyện viết</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderExamplesTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Ví dụ ({vocabulary.examples.length})</Text>
      
      {vocabulary.examples.map((example, index) => (
        <View key={index} style={styles.exampleCard}>
          <View style={styles.exampleHeader}>
            <Text style={styles.exampleNumber}>Ví dụ {index + 1}</Text>
            <TouchableOpacity style={styles.exampleAudio}>
              <Text style={styles.exampleAudioText}>🔊</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={styles.exampleChinese}>{example.chinese}</Text>
          <Text style={styles.examplePinyin}>{example.pinyin}</Text>
          
          <View style={styles.exampleTranslations}>
            <Text style={styles.exampleEnglish}>{example.english}</Text>
            <Text style={styles.exampleVietnamese}>{example.vietnamese}</Text>
          </View>
        </View>
      ))}
    </View>
  );

  const renderRelatedTab = () => (
    <View style={styles.tabContent}>
      <Text style={styles.sectionTitle}>Từ liên quan ({vocabulary.relatedWords.length})</Text>
      
      {vocabulary.relatedWords.map((word, index) => (
        <TouchableOpacity key={index} style={styles.relatedCard}>
          <Text style={styles.relatedHanzi}>{word.hanzi}</Text>
          <Text style={styles.relatedPinyin}>{word.pinyin}</Text>
          <Text style={styles.relatedVietnamese}>{word.vietnamese}</Text>
          <Text style={styles.relatedArrow}>→</Text>
        </TouchableOpacity>
      ))}
      
      <TouchableOpacity style={styles.moreWordsButton}>
        <Text style={styles.moreWordsText}>Xem thêm từ liên quan</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.backButtonText}>← Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi tiết từ vựng</Text>
        <TouchableOpacity style={styles.favoriteButton}>
          <Text style={styles.favoriteText}>⭐</Text>
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'info' && styles.activeTab]}
          onPress={() => setActiveTab('info')}
        >
          <Text style={[styles.tabText, activeTab === 'info' && styles.activeTabText]}>
            Thông tin
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'examples' && styles.activeTab]}
          onPress={() => setActiveTab('examples')}
        >
          <Text style={[styles.tabText, activeTab === 'examples' && styles.activeTabText]}>
            Ví dụ
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'related' && styles.activeTab]}
          onPress={() => setActiveTab('related')}
        >
          <Text style={[styles.tabText, activeTab === 'related' && styles.activeTabText]}>
            Liên quan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'info' && renderInfoTab()}
        {activeTab === 'examples' && renderExamplesTab()}
        {activeTab === 'related' && renderRelatedTab()}
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
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral[200],
  },
  backButton: {
    padding: getResponsiveSpacing('xs'),
  },
  backButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontWeight: '500',
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
  },
  favoriteButton: {
    padding: getResponsiveSpacing('xs'),
  },
  favoriteText: {
    fontSize: getResponsiveFontSize('lg'),
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
  mainWordCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 16,
    padding: getResponsiveSpacing('xl'),
    marginBottom: getResponsiveSpacing('lg'),
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  toneIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  toneDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: getResponsiveSpacing('xs'),
  },
  toneText: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  hanziLarge: {
    fontSize: getResponsiveFontSize('6xl'),
    fontFamily: 'System',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },
  pinyinLarge: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.primary[600],
    fontStyle: 'italic',
    marginBottom: getResponsiveSpacing('lg'),
  },
  translations: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  englishText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('xs'),
  },
  vietnameseText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[900],
    fontWeight: '600',
  },
  audioButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 8,
  },
  audioButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[50],
    fontWeight: '500',
  },
  infoCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('lg'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  infoTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  infoLabel: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },
  infoValue: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    fontWeight: '500',
  },
  strokeCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  strokeTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('md'),
  },
  strokeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('lg'),
  },
  strokeItem: {
    alignItems: 'center',
    minWidth: 50,
  },
  strokeNumber: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[500],
    marginBottom: getResponsiveSpacing('xs'),
  },
  strokeCharacter: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.neutral[900],
  },
  practiceButton: {
    backgroundColor: colors.accent[500],
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 8,
    alignSelf: 'center',
  },
  practiceButtonText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[50],
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('lg'),
  },
  exampleCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
  },
  exampleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  exampleNumber: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    fontWeight: '500',
  },
  exampleAudio: {
    padding: getResponsiveSpacing('xs'),
  },
  exampleAudioText: {
    fontSize: getResponsiveFontSize('base'),
  },
  exampleChinese: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  examplePinyin: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontStyle: 'italic',
    marginBottom: getResponsiveSpacing('md'),
  },
  exampleTranslations: {
    gap: getResponsiveSpacing('xs'),
  },
  exampleEnglish: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
  },
  exampleVietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    fontWeight: '500',
  },
  relatedCard: {
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
    flexDirection: 'row',
    alignItems: 'center',
  },
  relatedHanzi: {
    fontSize: getResponsiveFontSize('xl'),
    color: colors.neutral[900],
    marginRight: getResponsiveSpacing('md'),
    minWidth: 60,
  },
  relatedPinyin: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontStyle: 'italic',
    flex: 1,
  },
  relatedVietnamese: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    flex: 2,
  },
  relatedArrow: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[400],
    marginLeft: getResponsiveSpacing('sm'),
  },
  moreWordsButton: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: getResponsiveSpacing('md'),
  },
  moreWordsText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.primary[600],
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  errorText: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('lg'),
  },
}); 