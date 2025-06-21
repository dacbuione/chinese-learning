import React, { useState, useRef, useCallback, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert, Text, TouchableOpacity, Dimensions, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path, G, Circle, Line, Text as SvgText } from 'react-native-svg';

// Components  
import { TranslationText } from '../../../src/components/ui/atoms/Text';
import { Button } from '../../../src/components/ui/atoms/Button';
import { Card } from '../../../src/components/ui/atoms/Card';
import { ErrorBoundary } from '../../../src/components/common/ErrorBoundary';

// Theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, Layout } from '../../../src/theme';
import { ArrowLeft, RotateCcw, ChevronLeft, ChevronRight, Play, Pause, Eye, EyeOff } from 'lucide-react-native';

// TTS
import { useVocabularyTTS } from '../../../src/hooks/useTTS';

// API
import { api } from '../../../src/services/api/client';

interface StrokeData {
  id: string;
  path: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'curve';
  order: number;
}

interface CharacterData {
  character: string;
  pinyin: string;
  vietnamese: string;
  strokes: StrokeData[];
}

interface UserStroke {
  id: string;
  path: string;
  points: { x: number; y: number }[];
}

export default function WritingPracticeScreen() {
  const router = useRouter();
  const canvasSize = Layout.isMobile ? 280 : 320;
  
  // Dynamic character data loaded from API
  const [characterData, setCharacterData] = useState<CharacterData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [practiceMode, setPracticeMode] = useState<'demo' | 'practice'>('demo');
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [userStrokes, setUserStrokes] = useState<UserStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [score, setScore] = useState(0);
  const [showGuides, setShowGuides] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStrokeAnimation, setCurrentStrokeAnimation] = useState(-1);

  // TTS hook
  const { speakVocabulary, isPlaying: isTTSPlaying, isLoading: isTTSLoading } = useVocabularyTTS();

  // Load writing practice data from API
  useEffect(() => {
    loadWritingPracticeData();
  }, []);

  const loadWritingPracticeData = async () => {
    try {
      setIsLoading(true);
      const response = await api.vocabulary.getForWritingPractice();
      
      if (response.success && response.data) {
        // Transform API data to match component interface
        const transformedData: CharacterData[] = response.data
          .filter((item: any) => item.strokeOrder && item.strokeOrder.length > 0)
          .map((item: any) => generateCharacterData(item));
        
        setCharacterData(transformedData);
      } else {
        Alert.alert('Lỗi', 'Không thể tải dữ liệu luyện viết. Vui lòng thử lại.');
        setCharacterData([]);
      }
    } catch (error) {
      console.error('Error loading writing practice data:', error);
      Alert.alert('Lỗi', 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
      setCharacterData([]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateCharacterData = (vocabularyItem: any): CharacterData => {
    // Generate stroke paths based on character complexity
    const character = vocabularyItem.hanzi;
    const strokeCount = vocabularyItem.strokeOrder?.length || character.length * 2;
    
    const strokes: StrokeData[] = [];
    const centerX = canvasSize / 2;
    const centerY = canvasSize / 2;
    
    // Generate basic stroke patterns for simple characters
    for (let i = 0; i < Math.min(strokeCount, 8); i++) {
      const angle = (i * 45) * (Math.PI / 180);
      const radius = 60;
      const startX = centerX + Math.cos(angle) * radius;
      const startY = centerY + Math.sin(angle) * radius;
      const endX = centerX + Math.cos(angle + Math.PI / 2) * radius;
      const endY = centerY + Math.sin(angle + Math.PI / 2) * radius;
      
      strokes.push({
        id: `stroke${i + 1}`,
        path: `M${startX} ${startY} L${endX} ${endY}`,
        startPoint: { x: startX, y: startY },
        endPoint: { x: endX, y: endY },
        direction: i % 2 === 0 ? 'horizontal' : 'vertical',
        order: i + 1,
      });
    }
    
    return {
      character: character,
      pinyin: vocabularyItem.pinyin,
      vietnamese: vocabularyItem.vietnameseTranslation,
      strokes: strokes,
    };
  };

  const currentCharacter = characterData[currentCharacterIndex];

  const handlePlayAudio = useCallback(() => {
    if (currentCharacter) {
      speakVocabulary({
        simplified: currentCharacter.character,
        pinyin: currentCharacter.pinyin,
      });
    }
  }, [currentCharacter, speakVocabulary]);

  const resetPractice = () => {
    setCompletedStrokes([]);
    setUserStrokes([]);
    setScore(0);
    setIsAnimating(false);
    setCurrentStrokeAnimation(-1);
    setPracticeMode('demo');
  };

  const nextCharacter = () => {
    if (currentCharacterIndex < characterData.length - 1) {
      setCurrentCharacterIndex(prev => prev + 1);
      resetPractice();
    }
  };

  const previousCharacter = () => {
    if (currentCharacterIndex > 0) {
      setCurrentCharacterIndex(prev => prev - 1);
      resetPractice();
    }
  };

  const startStrokeAnimation = () => {
    setIsAnimating(true);
    setCurrentStrokeAnimation(0);
    
    const animateNextStroke = (strokeIndex: number) => {
      if (strokeIndex >= currentCharacter.strokes.length) {
        setIsAnimating(false);
        setCurrentStrokeAnimation(-1);
        return;
      }
      
      setTimeout(() => {
        setCompletedStrokes(prev => [...prev, strokeIndex]);
        setCurrentStrokeAnimation(strokeIndex + 1);
        animateNextStroke(strokeIndex + 1);
      }, 1500);
    };
    
    setCompletedStrokes([]);
    animateNextStroke(0);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    setCurrentStrokeAnimation(-1);
  };

  const renderCharacterGuides = () => {
    const center = canvasSize / 2;
    const quarter = canvasSize / 4;

    return (
      <G>
        {/* Main cross */}
        <Line
          x1={0}
          y1={center}
          x2={canvasSize}
          y2={center}
          stroke={colors.neutral[300]}
          strokeWidth={1}
          strokeDasharray="5,5"
          opacity={0.6}
        />
        <Line
          x1={center}
          y1={0}
          x2={center}
          y2={canvasSize}
          stroke={colors.neutral[300]}
          strokeWidth={1}
          strokeDasharray="5,5"
          opacity={0.6}
        />
        
        {/* Quarter lines */}
        <Line x1={0} y1={quarter} x2={canvasSize} y2={quarter} stroke={colors.neutral[200]} strokeWidth={0.5} opacity={0.4} />
        <Line x1={0} y1={quarter * 3} x2={canvasSize} y2={quarter * 3} stroke={colors.neutral[200]} strokeWidth={0.5} opacity={0.4} />
        <Line x1={quarter} y1={0} x2={quarter} y2={canvasSize} stroke={colors.neutral[200]} strokeWidth={0.5} opacity={0.4} />
        <Line x1={quarter * 3} y1={0} x2={quarter * 3} y2={canvasSize} stroke={colors.neutral[200]} strokeWidth={0.5} opacity={0.4} />
      </G>
    );
  };

  const renderStrokes = () => {
    return (
      <G>
        {/* Completed strokes */}
        {completedStrokes.map(strokeIndex => {
          const stroke = currentCharacter.strokes[strokeIndex];
          if (!stroke) return null;

          return (
            <G key={`completed-${strokeIndex}`}>
              <Path
                d={stroke.path}
                stroke={colors.primary[600]}
                strokeWidth={4}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {showGuides && (
                <Circle
                  cx={stroke.startPoint.x}
                  cy={stroke.startPoint.y}
                  r={8}
                  fill={colors.primary[500]}
                />
              )}
            </G>
          );
        })}

        {/* Current animating stroke */}
        {isAnimating && currentStrokeAnimation >= 0 && currentStrokeAnimation < currentCharacter.strokes.length && (
          <Path
            d={currentCharacter.strokes[currentStrokeAnimation].path}
            stroke={colors.secondary[500]}
            strokeWidth={5}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="10,5"
          />
        )}

        {/* User strokes in practice mode */}
        {practiceMode === 'practice' && userStrokes.map(stroke => (
          <Path
            key={stroke.id}
            d={stroke.path}
            stroke={colors.accent[500]}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.8}
          />
        ))}

        {/* Current drawing stroke */}
        {isDrawing && currentPath && (
          <Path
            d={currentPath}
            stroke={colors.accent[400]}
            strokeWidth={3}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Stroke order numbers */}
        {showGuides && !isAnimating && practiceMode === 'demo' && currentCharacter.strokes.map((stroke, index) => (
          <G key={`number-${index}`}>
            <Circle
              cx={stroke.startPoint.x}
              cy={stroke.startPoint.y}
              r={12}
              fill={completedStrokes.includes(index) ? colors.primary[500] : colors.neutral[400]}
              opacity={0.9}
            />
            <SvgText
              x={stroke.startPoint.x}
              y={stroke.startPoint.y + 4}
              textAnchor="middle"
              fontSize="10"
              fill={colors.neutral[50]}
              fontWeight="bold"
            >
              {stroke.order}
            </SvgText>
          </G>
        ))}
      </G>
    );
  };

  // Loading state
  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary[500]} />
          <Text style={styles.loadingText}>Đang tải dữ liệu luyện viết...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Empty state
  if (characterData.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Không có dữ liệu luyện viết</Text>
          <Button
            variant="primary"
            onPress={loadWritingPracticeData}
          >
            Thử lại
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentCharacter) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Lỗi tải ký tự</Text>
          <Button
            variant="primary"
            onPress={() => router.back()}
          >
            Quay lại
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <ErrorBoundary>
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Button variant="ghost" size="sm" onPress={() => router.back()}>
            <ArrowLeft size={20} color={colors.neutral[700]} />
          </Button>
          
          <View style={styles.headerTitle}>
            <TranslationText size="lg" weight="bold" color={colors.neutral[900]}>
              Luyện viết chữ Hán
            </TranslationText>
            <TranslationText size="sm" color={colors.neutral[600]}>
              {currentCharacterIndex + 1}/{characterData.length}
            </TranslationText>
          </View>
          
          <Button variant="ghost" size="sm" onPress={resetPractice}>
            <RotateCcw size={20} color={colors.neutral[700]} />
          </Button>
        </View>

        {/* Content */}
        <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
          {/* Character Display */}
          <Card variant="default" style={styles.characterCard}>
            <View style={styles.characterHeader}>
              <TranslationText size="4xl" weight="bold" style={styles.characterText}>
                {currentCharacter.character}
              </TranslationText>
              <View style={styles.characterInfo}>
                <TranslationText size="lg" color={colors.primary[600]} style={styles.pinyinText}>
                  {currentCharacter.pinyin}
                </TranslationText>
                <TranslationText size="base" color={colors.neutral[700]}>
                  {currentCharacter.vietnamese}
                </TranslationText>
                <TranslationText size="sm" color={colors.neutral[600]}>
                  Số nét: {currentCharacter.strokes.length}
                </TranslationText>
              </View>
            </View>

            {/* Audio Button */}
            <Button 
              variant="outline" 
              size="sm" 
              onPress={handlePlayAudio}
              disabled={isTTSLoading}
              style={styles.audioButton}
            >
              <TranslationText size="sm" color={colors.primary[600]}>
                {isTTSPlaying ? '⏸️ Đang phát' : '🔊 Phát âm'}
              </TranslationText>
            </Button>
          </Card>

          {/* Writing Canvas */}
          <Card variant="default" style={styles.canvasCard}>
            <View style={styles.canvasHeader}>
              <TranslationText size="base" weight="medium" color={colors.neutral[900]}>
                {practiceMode === 'demo' ? 'Xem mẫu viết' : 'Luyện tập viết'}
              </TranslationText>
              {practiceMode === 'practice' && (
                <TranslationText size="sm" color={colors.accent[600]}>
                  Điểm: {score}/100
                </TranslationText>
              )}
            </View>
            
            <View style={styles.canvasContainer}>
              <Svg width={canvasSize} height={canvasSize} style={styles.canvas}>
                {showGuides && renderCharacterGuides()}
                {renderStrokes()}
              </Svg>
            </View>

            {/* Canvas Controls */}
            <View style={styles.canvasControls}>
              <Button 
                variant="primary" 
                size="sm" 
                onPress={() => setPracticeMode(practiceMode === 'demo' ? 'practice' : 'demo')}
              >
                <TranslationText size="sm" color={colors.neutral[50]}>
                  {practiceMode === 'demo' ? 'Luyện tập' : 'Xem mẫu'}
                </TranslationText>
              </Button>

              {practiceMode === 'demo' && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onPress={isAnimating ? stopAnimation : startStrokeAnimation}
                >
                  {isAnimating ? 
                    <Pause size={16} color={colors.neutral[600]} /> : 
                    <Play size={16} color={colors.neutral[600]} />
                  }
                  <TranslationText size="sm" color={colors.neutral[600]}>
                    {isAnimating ? 'Dừng' : 'Xem mẫu'}
                  </TranslationText>
                </Button>
              )}

              <Button 
                variant="ghost" 
                size="sm" 
                onPress={() => setShowGuides(!showGuides)}
              >
                {showGuides ? 
                  <EyeOff size={16} color={colors.neutral[500]} /> : 
                  <Eye size={16} color={colors.neutral[500]} />
                }
                <TranslationText size="xs" color={colors.neutral[500]}>
                  {showGuides ? 'Ẩn lưới' : 'Hiện lưới'}
                </TranslationText>
              </Button>
            </View>
          </Card>

          {/* Tips */}
          <Card variant="default" style={styles.tipsContainer}>
            <TranslationText size="sm" weight="medium" color={colors.primary[600]}>
              💡 Mẹo luyện tập:
            </TranslationText>
            <TranslationText size="sm" color={colors.neutral[600]}>
              • Viết từ trên xuống dưới, từ trái sang phải
            </TranslationText>
            <TranslationText size="sm" color={colors.neutral[600]}>
              • Hoàn thành nét ngang trước nét dọc
            </TranslationText>
            <TranslationText size="sm" color={colors.neutral[600]}>
              • Viết phần bên ngoài trước phần bên trong
            </TranslationText>
            {practiceMode === 'practice' && (
              <TranslationText size="sm" color={colors.accent[600]}>
                • Chạm và kéo trên màn hình để viết
              </TranslationText>
            )}
          </Card>
        </ScrollView>

        {/* Navigation Footer */}
        <View style={styles.footer}>
          <Button 
            variant="outline" 
            size="sm" 
            onPress={previousCharacter}
            disabled={currentCharacterIndex === 0}
          >
            <ChevronLeft size={16} color={colors.neutral[600]} />
            <TranslationText size="sm" color={colors.neutral[600]}>
              Trước
            </TranslationText>
          </Button>
          
          <View style={styles.progressIndicator}>
            {characterData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.progressDot,
                  {
                    backgroundColor: index === currentCharacterIndex 
                      ? colors.primary[500] 
                      : colors.neutral[300]
                  }
                ]}
              />
            ))}
          </View>
          
          <Button 
            variant="outline" 
            size="sm" 
            onPress={nextCharacter}
            disabled={currentCharacterIndex === characterData.length - 1}
          >
            <TranslationText size="sm" color={colors.neutral[600]}>
              Tiếp
            </TranslationText>
            <ChevronRight size={16} color={colors.neutral[600]} />
          </Button>
        </View>
      </SafeAreaView>
    </ErrorBoundary>
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
  headerTitle: {
    flex: 1,
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('lg'),
  },
  characterCard: {
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
  },
  characterHeader: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  characterText: {
    fontSize: getResponsiveFontSize('5xl'),
    fontFamily: 'System',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },
  characterInfo: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  pinyinText: {
    fontStyle: 'italic',
  },
  audioButton: {
    marginTop: getResponsiveSpacing('sm'),
  },
  canvasCard: {
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
  },
  canvasHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  canvasContainer: {
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: 12,
    backgroundColor: colors.neutral[50],
    marginBottom: getResponsiveSpacing('md'),
  },
  canvas: {
    borderRadius: 10,
  },
  canvasControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getResponsiveSpacing('sm'),
    flexWrap: 'wrap',
  },
  tipsContainer: {
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.primary[50],
    gap: getResponsiveSpacing('sm'),
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
    borderTopWidth: 1,
    borderTopColor: colors.neutral[200],
  },
  progressIndicator: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xs'),
  },
  progressDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  // Loading and error states
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: getResponsiveSpacing('xl'),
  },
  loadingText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('md'),
    textAlign: 'center',
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
    marginBottom: getResponsiveSpacing('md'),
    textAlign: 'center',
  },
}); 