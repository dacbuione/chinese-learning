import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  colors,
  getResponsiveSpacing,
  getResponsiveFontSize,
} from '../../../../theme';
import { AudioButton } from '../../../common/AudioButton';
import { WordAccuracy } from '../../../features/pronunciation/components/NativeSpeechRecognition/NativeSpeechRecognition';

// Word definition interface
interface WordDefinition {
  hanzi: string;
  pinyin: string;
  english: string;
  vietnamese: string;
}

// Mock dictionary data
const mockDictionary: Record<string, WordDefinition> = {
  我: { hanzi: '我', pinyin: 'wǒ', english: 'I, me', vietnamese: 'tôi' },
  叫: {
    hanzi: '叫',
    pinyin: 'jiào',
    english: 'to call, to be called',
    vietnamese: 'gọi, tên là',
  },
  李: {
    hanzi: '李',
    pinyin: 'lǐ',
    english: 'Li (surname)',
    vietnamese: 'họ Lý',
  },
  明: {
    hanzi: '明',
    pinyin: 'míng',
    english: 'bright, clear',
    vietnamese: 'sáng, rõ',
  },
  今: {
    hanzi: '今',
    pinyin: 'jīn',
    english: 'today, now',
    vietnamese: 'hôm nay',
  },
  年: { hanzi: '年', pinyin: 'nián', english: 'year', vietnamese: 'năm' },
  二: { hanzi: '二', pinyin: 'èr', english: 'two', vietnamese: 'hai' },
  十: { hanzi: '十', pinyin: 'shí', english: 'ten', vietnamese: 'mười' },
  岁: { hanzi: '岁', pinyin: 'suì', english: 'years old', vietnamese: 'tuổi' },
  是: { hanzi: '是', pinyin: 'shì', english: 'to be', vietnamese: 'là' },
  学: {
    hanzi: '学',
    pinyin: 'xué',
    english: 'to study, to learn',
    vietnamese: 'học',
  },
  生: {
    hanzi: '生',
    pinyin: 'shēng',
    english: 'to be born, student',
    vietnamese: 'sinh, học sinh',
  },
  习: {
    hanzi: '习',
    pinyin: 'xí',
    english: 'to practice, to study',
    vietnamese: 'tập, học',
  },
  中: {
    hanzi: '中',
    pinyin: 'zhōng',
    english: 'middle, China',
    vietnamese: 'giữa, Trung',
  },
  文: {
    hanzi: '文',
    pinyin: 'wén',
    english: 'language, culture',
    vietnamese: 'văn, ngôn ngữ',
  },
  喜: {
    hanzi: '喜',
    pinyin: 'xǐ',
    english: 'to like, happy',
    vietnamese: 'thích, vui',
  },
  欢: {
    hanzi: '欢',
    pinyin: 'huān',
    english: 'joyful, to welcome',
    vietnamese: 'hoan ngh영',
  },
  看: {
    hanzi: '看',
    pinyin: 'kàn',
    english: 'to look, to see',
    vietnamese: 'xem, nhìn',
  },
  书: { hanzi: '书', pinyin: 'shū', english: 'book', vietnamese: 'sách' },
  和: { hanzi: '和', pinyin: 'hé', english: 'and, with', vietnamese: 'và' },
  听: { hanzi: '听', pinyin: 'tīng', english: 'to listen', vietnamese: 'nghe' },
  音: {
    hanzi: '音',
    pinyin: 'yīn',
    english: 'sound, music',
    vietnamese: 'âm, nhạc',
  },
  乐: {
    hanzi: '乐',
    pinyin: 'yuè',
    english: 'music, happy',
    vietnamese: 'nhạc, vui',
  },
  的: {
    hanzi: '的',
    pinyin: 'de',
    english: 'possessive particle',
    vietnamese: 'của',
  },
  家: {
    hanzi: '家',
    pinyin: 'jiā',
    english: 'home, family',
    vietnamese: 'nhà, gia đình',
  },
  在: {
    hanzi: '在',
    pinyin: 'zài',
    english: 'at, in, to be at',
    vietnamese: 'ở, tại',
  },
  北: { hanzi: '北', pinyin: 'běi', english: 'north', vietnamese: 'bắc' },
  京: {
    hanzi: '京',
    pinyin: 'jīng',
    english: 'capital',
    vietnamese: 'kinh đô',
  },
  有: { hanzi: '有', pinyin: 'yǒu', english: 'to have', vietnamese: 'có' },
  一: { hanzi: '一', pinyin: 'yī', english: 'one', vietnamese: 'một' },
  个: { hanzi: '个', pinyin: 'gè', english: 'measure word', vietnamese: 'cái' },
  妹: {
    hanzi: '妹',
    pinyin: 'mèi',
    english: 'younger sister',
    vietnamese: 'em gái',
  },
  她: { hanzi: '她', pinyin: 'tā', english: 'she, her', vietnamese: 'cô ấy' },
  也: { hanzi: '也', pinyin: 'yě', english: 'also, too', vietnamese: 'cũng' },
  // Add more words for family passage
  四: { hanzi: '四', pinyin: 'sì', english: 'four', vietnamese: 'bốn' },
  口: {
    hanzi: '口',
    pinyin: 'kǒu',
    english: 'mouth, person (measure)',
    vietnamese: 'miệng, người',
  },
  人: {
    hanzi: '人',
    pinyin: 'rén',
    english: 'person, people',
    vietnamese: 'người',
  },
  爸: { hanzi: '爸', pinyin: 'bà', english: 'dad, father', vietnamese: 'bố' },
  妈: { hanzi: '妈', pinyin: 'mā', english: 'mom, mother', vietnamese: 'mẹ' },
  弟: {
    hanzi: '弟',
    pinyin: 'dì',
    english: 'younger brother',
    vietnamese: 'em trai',
  },
  医: {
    hanzi: '医',
    pinyin: 'yī',
    english: 'doctor, medicine',
    vietnamese: 'y, bác sĩ',
  },
  五: { hanzi: '五', pinyin: 'wǔ', english: 'five', vietnamese: 'năm' },
  老: {
    hanzi: '老',
    pinyin: 'lǎo',
    english: 'old, teacher',
    vietnamese: 'già, thầy',
  },
  师: {
    hanzi: '师',
    pinyin: 'shī',
    english: 'teacher, master',
    vietnamese: 'thầy',
  },
  六: { hanzi: '六', pinyin: 'liù', english: 'six', vietnamese: 'sáu' },
  还: { hanzi: '还', pinyin: 'hái', english: 'still, yet', vietnamese: 'vẫn' },
  上: {
    hanzi: '上',
    pinyin: 'shàng',
    english: 'up, above, to go to',
    vietnamese: 'lên, trên',
  },
  高: { hanzi: '高', pinyin: 'gāo', english: 'high, tall', vietnamese: 'cao' },
  们: {
    hanzi: '们',
    pinyin: 'men',
    english: 'plural marker',
    vietnamese: 'các',
  },
  都: { hanzi: '都', pinyin: 'dōu', english: 'all, both', vietnamese: 'đều' },
  很: { hanzi: '很', pinyin: 'hěn', english: 'very', vietnamese: 'rất' },
  健: {
    hanzi: '健',
    pinyin: 'jiàn',
    english: 'healthy, strong',
    vietnamese: 'khỏe',
  },
  康: {
    hanzi: '康',
    pinyin: 'kāng',
    english: 'healthy, well-being',
    vietnamese: 'khỏe mạnh',
  },
  幸: {
    hanzi: '幸',
    pinyin: 'xìng',
    english: 'fortunate, lucky',
    vietnamese: 'may mắn',
  },
  福: {
    hanzi: '福',
    pinyin: 'fú',
    english: 'blessing, happiness',
    vietnamese: 'phúc, hạnh phúc',
  },
};

export interface HighlightedChineseTextProps {
  text: string;
  wordAccuracies?: WordAccuracy[];
  style?: any;
  onWordPress?: (word: string) => void;
}

export const HighlightedChineseText: React.FC<HighlightedChineseTextProps> = ({
  text,
  wordAccuracies = [],
  style,
  onWordPress,
}) => {
  const [selectedWord, setSelectedWord] = useState<WordDefinition | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });

  // Create a map for quick lookup of word accuracy
  const accuracyMap = new Map<string, WordAccuracy>();
  wordAccuracies.forEach((wa) => {
    accuracyMap.set(wa.word, wa);
  });

  const handleWordLongPress = useCallback(
    (word: string, event: any) => {
      const definition = mockDictionary[word];
      if (definition) {
        setSelectedWord(definition);

        // Get touch position for modal placement
        event.nativeEvent.locationX &&
          setModalPosition({
            x: event.nativeEvent.pageX || event.nativeEvent.locationX,
            y: event.nativeEvent.pageY || event.nativeEvent.locationY,
          });

        setModalVisible(true);
        onWordPress?.(word);
      }
    },
    [onWordPress]
  );

  const closeModal = useCallback(() => {
    setModalVisible(false);
    setSelectedWord(null);
  }, []);

  const renderWord = (word: string, index: number) => {
    // Skip punctuation and spaces
    if (/[，。！？\s]/.test(word)) {
      return (
        <Text key={index} style={[styles.baseText, style]}>
          {word}
        </Text>
      );
    }

    const accuracy = accuracyMap.get(word);
    const hasDefinition = mockDictionary[word];

    let wordStyle = [styles.baseText, style];

    // Apply highlighting based on accuracy
    if (accuracy) {
      if (accuracy.isCorrect) {
        wordStyle.push(styles.correctWord);
      } else {
        wordStyle.push(styles.incorrectWord);
      }
    }

    // Add underline for words with definitions
    if (hasDefinition) {
      wordStyle.push(styles.definedWord);
    }

    return (
      <TouchableOpacity
        key={index}
        onPress={(event) => handleWordLongPress(word, event)}
        activeOpacity={0.7}
      >
        <Text style={wordStyle}>{word}</Text>
      </TouchableOpacity>
    );
  };

  const renderDefinitionModal = () => {
    if (!selectedWord) return null;

    return (
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <Pressable style={styles.modalOverlay} onPress={closeModal}>
          <View
            style={[
              styles.modalContent,
              {
                top: Math.max(50, modalPosition.y - 150),
                left: Math.max(20, Math.min(modalPosition.x - 100, 300)),
              },
            ]}
          >
            {/* Close button */}
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Ionicons name="close" size={20} color={colors.neutral[600]} />
            </TouchableOpacity>

            {/* Word display */}
            <View style={styles.wordHeader}>
              <Text style={styles.modalHanzi}>{selectedWord.hanzi}</Text>
              <AudioButton
                hanzi={selectedWord.hanzi}
                pinyin={selectedWord.pinyin}
                tone={1}
                size="small"
              />
            </View>

            {/* Pinyin */}
            <Text style={styles.modalPinyin}>{selectedWord.pinyin}</Text>

            {/* Meanings */}
            <View style={styles.meaningsContainer}>
              <View style={styles.meaningRow}>
                <Text style={styles.languageLabel}>🇺🇸</Text>
                <Text style={styles.meaningText}>{selectedWord.english}</Text>
              </View>
              <View style={styles.meaningRow}>
                <Text style={styles.languageLabel}>🇻🇳</Text>
                <Text style={styles.meaningText}>
                  {selectedWord.vietnamese}
                </Text>
              </View>
            </View>
          </View>
        </Pressable>
      </Modal>
    );
  };

  // Split text into individual characters for rendering
  const characters = text.split('');

  return (
    <View style={styles.container}>
      <View style={styles.instructionHint}>
        <Ionicons
          name="information-circle-outline"
          size={16}
          color={colors.primary[500]}
        />
        <Text style={styles.instructionText}>
          Nhấn vào từ để xem nghĩa và nghe âm thanh
        </Text>
      </View>

      <Text style={[styles.textContainer, style]}>
        {characters.map((char, index) => renderWord(char, index))}
      </Text>
      {renderDefinitionModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  instructionHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
    marginBottom: getResponsiveSpacing('sm'),
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: getResponsiveSpacing('xs'),
    backgroundColor: colors.primary[50],
    borderRadius: 6,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary[500],
  },
  instructionText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.primary[700],
    fontStyle: 'italic',
  },
  textContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
  },
  wordContainer: {
    position: 'relative',
  },
  baseText: {
    fontSize: getResponsiveFontSize('lg'),
    lineHeight: getResponsiveFontSize('lg') * 1.8,
    color: colors.neutral[900],
  },
  correctWord: {
    backgroundColor: colors.accent[100],
    color: colors.accent[800],
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  incorrectWord: {
    backgroundColor: colors.error[100],
    color: colors.error[800],
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  definedWord: {
    borderBottomWidth: 1,
    borderBottomColor: colors.primary[300],
    borderStyle: 'dotted',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    position: 'absolute',
    backgroundColor: colors.neutral[50],
    borderRadius: 12,
    padding: getResponsiveSpacing('lg'),
    maxWidth: 280,
    minWidth: 200,
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  closeButton: {
    position: 'absolute',
    top: getResponsiveSpacing('sm'),
    right: getResponsiveSpacing('sm'),
    padding: getResponsiveSpacing('xs'),
  },
  wordHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: getResponsiveSpacing('sm'),
    marginRight: getResponsiveSpacing('lg'), // Space for close button
  },
  modalHanzi: {
    fontSize: getResponsiveFontSize('3xl'),
    fontWeight: 'bold',
    color: colors.neutral[900],
  },
  modalPinyin: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.primary[600],
    fontStyle: 'italic',
    marginBottom: getResponsiveSpacing('md'),
    textAlign: 'center',
  },
  meaningsContainer: {
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('md'),
  },
  meaningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  languageLabel: {
    fontSize: getResponsiveFontSize('base'),
    width: 24,
  },
  meaningText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    flex: 1,
    lineHeight: getResponsiveFontSize('base') * 1.4,
  },
});
