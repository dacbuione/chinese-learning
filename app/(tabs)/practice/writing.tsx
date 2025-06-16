import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, SafeAreaView, ScrollView, Alert, Text, TouchableOpacity, Dimensions } from 'react-native';
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
  
  // Corrected character data with proper stroke paths for Chinese characters
  const characterData: CharacterData[] = [
    {
      character: '人',
      pinyin: 'rén',
      vietnamese: 'người',
      strokes: [
        {
          id: 'stroke1',
          path: 'M120 60 L160 200', // Left stroke (撇)
          startPoint: { x: 120, y: 60 },
          endPoint: { x: 160, y: 200 },
          direction: 'diagonal',
          order: 1,
        },
        {
          id: 'stroke2', 
          path: 'M180 60 L160 200', // Right stroke (捺)
          startPoint: { x: 180, y: 60 },
          endPoint: { x: 160, y: 200 },
          direction: 'diagonal',
          order: 2,
        },
      ]
    },
    {
      character: '大',
      pinyin: 'dà',
      vietnamese: 'lớn',
      strokes: [
        {
          id: 'stroke1',
          path: 'M160 50 L160 180', // Vertical stroke (一)
          startPoint: { x: 160, y: 50 },
          endPoint: { x: 160, y: 180 },
          direction: 'vertical',
          order: 1,
        },
        {
          id: 'stroke2',
          path: 'M100 120 L220 120', // Horizontal stroke (一)
          startPoint: { x: 100, y: 120 },
          endPoint: { x: 220, y: 120 },
          direction: 'horizontal',
          order: 2,
        },
        {
          id: 'stroke3',
          path: 'M120 200 L200 200', // Bottom horizontal stroke
          startPoint: { x: 120, y: 200 },
          endPoint: { x: 200, y: 200 },
          direction: 'horizontal',
          order: 3,
        },
      ]
    },
    {
      character: '小',
      pinyin: 'xiǎo', 
      vietnamese: 'nhỏ',
      strokes: [
        {
          id: 'stroke1',
          path: 'M160 50 L160 120', // Vertical stroke
          startPoint: { x: 160, y: 50 },
          endPoint: { x: 160, y: 120 },
          direction: 'vertical',
          order: 1,
        },
        {
          id: 'stroke2',
          path: 'M120 140 L140 180', // Left dot/stroke
          startPoint: { x: 120, y: 140 },
          endPoint: { x: 140, y: 180 },
          direction: 'diagonal',
          order: 2,
        },
        {
          id: 'stroke3',
          path: 'M200 140 L180 180', // Right dot/stroke
          startPoint: { x: 200, y: 140 },
          endPoint: { x: 180, y: 180 },
          direction: 'diagonal',
          order: 3,
        },
      ]
    },
  ];

  const [currentCharacterIndex, setCurrentCharacterIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [currentStrokeAnimation, setCurrentStrokeAnimation] = useState(-1);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [showGuides, setShowGuides] = useState(true);
  const [practiceMode, setPracticeMode] = useState<'demo' | 'practice'>('demo');
  const [userStrokes, setUserStrokes] = useState<UserStroke[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [score, setScore] = useState(0);

  const currentCharacter = characterData[currentCharacterIndex];
  const animationTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const drawingPathRef = useRef<{ x: number; y: number }[]>([]);

  // Error boundary wrapper
  const withErrorBoundary = useCallback((fn: () => void) => {
    try {
      fn();
    } catch (error) {
      console.error('Writing practice error:', error);
      Alert.alert('Lỗi', 'Đã xảy ra lỗi. Vui lòng thử lại.');
    }
  }, []);

  const startStrokeAnimation = useCallback(() => {
    if (isAnimating || !currentCharacter.strokes.length) return;

    withErrorBoundary(() => {
      setIsAnimating(true);
      setCurrentStrokeAnimation(0);
      setCompletedStrokes([]);
      
      const animateStroke = (strokeIndex: number) => {
        if (strokeIndex >= currentCharacter.strokes.length) {
          setIsAnimating(false);
          setCurrentStrokeAnimation(-1);
          return;
        }

        setCurrentStrokeAnimation(strokeIndex);
        
        animationTimeoutRef.current = setTimeout(() => {
          setCompletedStrokes(prev => [...prev, strokeIndex]);
          animateStroke(strokeIndex + 1);
        }, 1500) as any;
      };

      animateStroke(0);
    });
  }, [isAnimating, currentCharacter.strokes, withErrorBoundary]);

  const stopAnimation = useCallback(() => {
    if (animationTimeoutRef.current) {
      clearTimeout(animationTimeoutRef.current);
      animationTimeoutRef.current = null;
    }
    setIsAnimating(false);
    setCurrentStrokeAnimation(-1);
  }, []);

  const resetPractice = useCallback(() => {
    withErrorBoundary(() => {
      stopAnimation();
      setCompletedStrokes([]);
      setUserStrokes([]);
      setCurrentPath('');
      setIsDrawing(false);
      drawingPathRef.current = [];
      setScore(0);
    });
  }, [stopAnimation, withErrorBoundary]);

  const nextCharacter = useCallback(() => {
    if (currentCharacterIndex < characterData.length - 1) {
      setCurrentCharacterIndex(prev => prev + 1);
      resetPractice();
    }
  }, [currentCharacterIndex, characterData.length, resetPractice]);

  const previousCharacter = useCallback(() => {
    if (currentCharacterIndex > 0) {
      setCurrentCharacterIndex(prev => prev - 1);
      resetPractice();
    }
  }, [currentCharacterIndex, resetPractice]);

  const togglePracticeMode = useCallback(() => {
    setPracticeMode(prev => prev === 'demo' ? 'practice' : 'demo');
    resetPractice();
  }, [resetPractice]);

  // Drawing handlers for practice mode
  const handleDrawingStart = useCallback((event: any) => {
    if (practiceMode !== 'practice' || isDrawing) return;
    
    withErrorBoundary(() => {
      const { x, y } = event.nativeEvent;
      setIsDrawing(true);
      setCurrentPath(`M${x},${y}`);
      drawingPathRef.current = [{ x, y }];
    });
  }, [practiceMode, isDrawing, withErrorBoundary]);

  const handleDrawingMove = useCallback((event: any) => {
    if (!isDrawing) return;

    withErrorBoundary(() => {
      const { x, y } = event.nativeEvent;
      drawingPathRef.current.push({ x, y });
      setCurrentPath(prev => `${prev} L${x},${y}`);
    });
  }, [isDrawing, withErrorBoundary]);

  const handleDrawingEnd = useCallback(() => {
    if (!isDrawing) return;

    withErrorBoundary(() => {
      setIsDrawing(false);
      
      if (drawingPathRef.current.length > 5) { // Minimum stroke length
        const newStroke: UserStroke = {
          id: `user-stroke-${Date.now()}`,
          path: currentPath,
          points: [...drawingPathRef.current],
        };
        
        setUserStrokes(prev => [...prev, newStroke]);
        
        // Simple scoring based on stroke count
        const newScore = Math.min(100, Math.round((userStrokes.length + 1) / currentCharacter.strokes.length * 100));
        setScore(newScore);
      }
      
      setCurrentPath('');
      drawingPathRef.current = [];
    });
  }, [isDrawing, currentPath, userStrokes.length, currentCharacter.strokes.length, withErrorBoundary]);

  // TTS functionality
  const {
    isLoading: isTTSLoading,
    isPlaying: isTTSPlaying,
    speakVocabulary,
    stop: stopTTS,
  } = useVocabularyTTS();

  const handlePlayAudio = useCallback(async () => {
    try {
      if (isTTSPlaying) {
        await stopTTS();
      } else {
        await speakVocabulary({
          simplified: currentCharacter.character,
          pinyin: currentCharacter.pinyin,
        });
      }
    } catch (error) {
      console.error('Character TTS Error:', error);
      Alert.alert('Lỗi phát âm', 'Không thể phát âm chữ Hán. Vui lòng thử lại.');
    }
  }, [isTTSPlaying, stopTTS, speakVocabulary, currentCharacter]);

  const renderGuidelines = () => {
    if (!showGuides) return null;

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

          <PanGestureHandler
            onGestureEvent={(event) => {
              if (event.nativeEvent.state === State.ACTIVE) {
                handleDrawingMove(event);
              }
            }}
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.BEGAN) {
                handleDrawingStart(event);
              } else if (event.nativeEvent.state === State.END || event.nativeEvent.state === State.CANCELLED) {
                handleDrawingEnd();
              }
            }}
            enabled={practiceMode === 'practice'}
          >
            <View style={[styles.canvasContainer, { width: canvasSize, height: canvasSize }]}>
              <Svg width={canvasSize} height={canvasSize} style={styles.canvas}>
                {renderGuidelines()}
                {renderStrokes()}
              </Svg>
            </View>
          </PanGestureHandler>

          {/* Canvas Controls */}
          <View style={styles.canvasControls}>
            <Button 
              variant={practiceMode === 'demo' ? "primary" : "outline"}
              size="sm" 
              onPress={togglePracticeMode}
            >
              <TranslationText size="sm" color={practiceMode === 'demo' ? colors.neutral[50] : colors.primary[500]}>
                {practiceMode === 'demo' ? 'Chế độ xem' : 'Chế độ viết'}
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
}); 