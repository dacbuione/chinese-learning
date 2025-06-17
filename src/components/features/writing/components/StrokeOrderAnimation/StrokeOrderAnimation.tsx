import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Animated } from 'react-native';
import { Svg, Path, G, Circle } from 'react-native-svg';
import { Card } from '@/ui/atoms/Card';
import { TranslationText } from '@/ui/atoms/Text';
import { Button } from '@/ui/atoms/Button';
import { colors, Layout, getResponsiveSpacing, getResponsiveFontSize } from '@/theme';
import { Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react-native';

interface StrokeAnimationData {
  id: string;
  path: string;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'curve' | 'hook' | 'dot';
  order: number;
}

interface StrokeOrderAnimationProps {
  character: string;
  strokes: StrokeAnimationData[];
  pinyin?: string;
  vietnamese?: string;
  autoPlay?: boolean;
  playbackSpeed?: number;
  canvasSize?: number;
  showStrokeNumbers?: boolean;
  showDirection?: boolean;
  onAnimationComplete?: () => void;
  onStrokeComplete?: (strokeIndex: number) => void;
}

export const StrokeOrderAnimation: React.FC<StrokeOrderAnimationProps> = ({
  character,
  strokes,
  pinyin,
  vietnamese,
  autoPlay = false,
  playbackSpeed = 1000,
  canvasSize = 300,
  showStrokeNumbers = true,
  showDirection = true,
  onAnimationComplete,
  onStrokeComplete,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStroke, setCurrentStroke] = useState(0);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [showGuides, setShowGuides] = useState(true);

  const responsiveCanvasSize = Layout.isMobile ? canvasSize * 0.9 : canvasSize;
  const strokeWidth = Layout.isMobile ? 3 : 4;

  // Auto play effect
  useEffect(() => {
    if (autoPlay && strokes.length > 0) {
      playAnimation();
    }
  }, [autoPlay, strokes]);

  const playAnimation = useCallback(async () => {
    if (isPlaying || strokes.length === 0) return;

    setIsPlaying(true);
    setCurrentStroke(0);
    setCompletedStrokes([]);
    setAnimationProgress(0);

    for (let i = 0; i < strokes.length; i++) {
      setCurrentStroke(i);
      
      // Animate stroke drawing
      for (let progress = 0; progress <= 1; progress += 0.05) {
        setAnimationProgress(progress);
        await new Promise(resolve => setTimeout(resolve, playbackSpeed / 20));
      }

      // Mark stroke as completed
      setCompletedStrokes(prev => [...prev, i]);
      onStrokeComplete?.(i);
      
      // Pause between strokes
      await new Promise(resolve => setTimeout(resolve, playbackSpeed / 4));
    }

    setIsPlaying(false);
    setCurrentStroke(-1);
    setAnimationProgress(0);
    onAnimationComplete?.();
  }, [isPlaying, strokes, playbackSpeed, onStrokeComplete, onAnimationComplete]);

  const pauseAnimation = useCallback(() => {
    setIsPlaying(false);
  }, []);

  const resetAnimation = useCallback(() => {
    setIsPlaying(false);
    setCurrentStroke(0);
    setAnimationProgress(0);
    setCompletedStrokes([]);
  }, []);

  const toggleGuides = useCallback(() => {
    setShowGuides(prev => !prev);
  }, []);

  const renderGuidelines = () => {
    if (!showGuides) return null;

    const center = responsiveCanvasSize / 2;
    const quarter = responsiveCanvasSize / 4;
    const guidelineColor = colors.neutral[300];

    return (
      <G>
        {/* Main cross */}
        <Path
          d={`M0,${center} L${responsiveCanvasSize},${center}`}
          stroke={guidelineColor}
          strokeWidth={1}
          strokeDasharray="4,4"
          opacity={0.6}
        />
        <Path
          d={`M${center},0 L${center},${responsiveCanvasSize}`}
          stroke={guidelineColor}
          strokeWidth={1}
          strokeDasharray="4,4"
          opacity={0.6}
        />
        
        {/* Quarter lines */}
        <Path
          d={`M0,${quarter} L${responsiveCanvasSize},${quarter}`}
          stroke={guidelineColor}
          strokeWidth={0.5}
          opacity={0.4}
        />
        <Path
          d={`M0,${quarter * 3} L${responsiveCanvasSize},${quarter * 3}`}
          stroke={guidelineColor}
          strokeWidth={0.5}
          opacity={0.4}
        />
        <Path
          d={`M${quarter},0 L${quarter},${responsiveCanvasSize}`}
          stroke={guidelineColor}
          strokeWidth={0.5}
          opacity={0.4}
        />
        <Path
          d={`M${quarter * 3},0 L${quarter * 3},${responsiveCanvasSize}`}
          stroke={guidelineColor}
          strokeWidth={0.5}
          opacity={0.4}
        />
      </G>
    );
  };

  const renderCompletedStrokes = () => {
    return (
      <G>
        {completedStrokes.map(strokeIndex => {
          const stroke = strokes[strokeIndex];
          if (!stroke) return null;

          return (
            <G key={`completed-${strokeIndex}`}>
              <Path
                d={stroke.path}
                stroke={colors.primary[600]}
                strokeWidth={strokeWidth}
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              
              {showStrokeNumbers && (
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
      </G>
    );
  };

  const renderCurrentStroke = () => {
    if (!isPlaying || currentStroke < 0 || currentStroke >= strokes.length) return null;

    const stroke = strokes[currentStroke];
    const pathLength = stroke.path.length;
    const animatedPath = stroke.path.substring(0, Math.floor(pathLength * animationProgress));

    return (
      <G>
        {/* Animated stroke */}
        <Path
          d={animatedPath}
          stroke={colors.secondary[500]}
          strokeWidth={strokeWidth * 1.2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        
        {/* Direction indicator */}
        {showDirection && animationProgress > 0 && (
          <Circle
            cx={stroke.startPoint.x + (stroke.endPoint.x - stroke.startPoint.x) * animationProgress}
            cy={stroke.startPoint.y + (stroke.endPoint.y - stroke.startPoint.y) * animationProgress}
            r={4}
            fill={colors.accent[500]}
          />
        )}
        
        {/* Start point indicator */}
        {showStrokeNumbers && (
          <G>
            <Circle
              cx={stroke.startPoint.x}
              cy={stroke.startPoint.y}
              r={10}
              fill={colors.accent[500]}
            />
            <TranslationText
              size="xs"
              color={colors.neutral[50]}
              style={{
                position: 'absolute',
                left: stroke.startPoint.x - 4,
                top: stroke.startPoint.y - 6,
                fontSize: 10,
                fontWeight: 'bold',
              }}
            >
              {currentStroke + 1}
            </TranslationText>
          </G>
        )}
      </G>
    );
  };

  const renderStrokeNumbersPreview = () => {
    if (!showStrokeNumbers || isPlaying) return null;

    return (
      <G>
        {strokes.map((stroke, index) => (
          <G key={`number-${index}`}>
            <Circle
              cx={stroke.startPoint.x}
              cy={stroke.startPoint.y}
              r={8}
              fill={colors.neutral[400]}
              opacity={0.7}
            />
            <TranslationText
              size="xs"
              color={colors.neutral[50]}
              style={{
                position: 'absolute',
                left: stroke.startPoint.x - 3,
                top: stroke.startPoint.y - 6,
                fontSize: 8,
                fontWeight: 'bold',
              }}
            >
              {index + 1}
            </TranslationText>
          </G>
        ))}
      </G>
    );
  };

  return (
    <Card variant="default" style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.characterInfo}>
          <TranslationText size="3xl" weight="bold" style={styles.character}>
            {character}
          </TranslationText>
          {pinyin && (
            <TranslationText size="lg" color={colors.primary[600]} style={styles.pinyin}>
              {pinyin}
            </TranslationText>
          )}
          {vietnamese && (
            <TranslationText size="base" color={colors.neutral[700]}>
              {vietnamese}
            </TranslationText>
          )}
        </View>
        
        <View style={styles.strokeInfo}>
          <TranslationText size="sm" color={colors.neutral[600]}>
            Tổng số nét: {strokes.length}
          </TranslationText>
          {isPlaying && (
            <TranslationText size="sm" color={colors.primary[600]}>
              Đang vẽ nét {currentStroke + 1}
            </TranslationText>
          )}
        </View>
      </View>

      {/* Canvas */}
      <View style={[
        styles.canvasContainer,
        {
          width: responsiveCanvasSize,
          height: responsiveCanvasSize,
        }
      ]}>
        <Svg
          width={responsiveCanvasSize}
          height={responsiveCanvasSize}
          style={styles.canvas}
        >
          {renderGuidelines()}
          {renderCompletedStrokes()}
          {renderCurrentStroke()}
          {renderStrokeNumbersPreview()}
        </Svg>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.primaryControls}>
          <Button 
            variant={isPlaying ? "primary" : "outline"}
            size="md" 
            onPress={isPlaying ? pauseAnimation : playAnimation}
            disabled={strokes.length === 0}
            style={styles.controlButton}
          >
            {isPlaying ? 
              <Pause size={18} color={colors.neutral[50]} /> : 
              <Play size={18} color={colors.primary[500]} />
            }
            <TranslationText 
              size="sm" 
              color={isPlaying ? colors.neutral[50] : colors.primary[500]}
            >
              {isPlaying ? 'Tạm dừng' : 'Phát'}
            </TranslationText>
          </Button>
          
          <Button 
            variant="outline" 
            size="md" 
            onPress={resetAnimation}
            disabled={strokes.length === 0}
            style={styles.controlButton}
          >
            <RotateCcw size={18} color={colors.neutral[600]} />
            <TranslationText size="sm" color={colors.neutral[600]}>
              Đặt lại
            </TranslationText>
          </Button>
        </View>
        
        <View style={styles.secondaryControls}>
          <Button 
            variant="ghost" 
            size="sm" 
            onPress={toggleGuides}
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
      </View>

      {/* Progress */}
      {strokes.length > 0 && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(completedStrokes.length / strokes.length) * 100}%` }
              ]}
            />
          </View>
          <TranslationText size="xs" color={colors.neutral[500]}>
            Tiến độ: {completedStrokes.length}/{strokes.length} nét hoàn thành
          </TranslationText>
        </View>
      )}

      {/* Stroke direction legend */}
      {showDirection && (
        <View style={styles.legend}>
          <TranslationText size="xs" color={colors.neutral[600]} weight="medium">
            Hướng dẫn:
          </TranslationText>
          <View style={styles.legendItems}>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.primary[500] }]} />
              <TranslationText size="xs" color={colors.neutral[600]}>
                Nét hoàn thành
              </TranslationText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.secondary[500] }]} />
              <TranslationText size="xs" color={colors.neutral[600]}>
                Nét đang vẽ
              </TranslationText>
            </View>
            <View style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: colors.accent[500] }]} />
              <TranslationText size="xs" color={colors.neutral[600]}>
                Hướng vẽ
              </TranslationText>
            </View>
          </View>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: getResponsiveSpacing('lg'),
  },
  header: {
    width: '100%',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  characterInfo: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  character: {
    fontSize: getResponsiveFontSize('5xl'),
    fontFamily: 'System',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  pinyin: {
    fontStyle: 'italic',
    marginBottom: getResponsiveSpacing('xs'),
  },
  strokeInfo: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  canvasContainer: {
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: Layout.isMobile ? 12 : 16,
    backgroundColor: colors.neutral[50],
    marginBottom: getResponsiveSpacing('lg'),
  },
  canvas: {
    borderRadius: Layout.isMobile ? 10 : 14,
  },
  controls: {
    width: '100%',
    gap: getResponsiveSpacing('md'),
  },
  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: getResponsiveSpacing('md'),
  },
  secondaryControls: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  controlButton: {
    minWidth: Layout.isMobile ? 100 : 120,
  },
  progressContainer: {
    width: '100%',
    marginTop: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('xs'),
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 3,
  },
  legend: {
    width: '100%',
    marginTop: getResponsiveSpacing('md'),
    padding: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[100],
    borderRadius: Layout.isMobile ? 8 : 12,
    gap: getResponsiveSpacing('sm'),
  },
  legendItems: {
    flexDirection: Layout.isMobile ? 'column' : 'row',
    gap: getResponsiveSpacing('sm'),
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
}); 