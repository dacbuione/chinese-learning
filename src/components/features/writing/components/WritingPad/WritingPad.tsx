import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Svg, Path, G } from 'react-native-svg';
import { Card } from '../../../../ui/atoms/Card';
import { TranslationText } from '../../../../ui/atoms/Text';
import { Button } from '../../../../ui/atoms/Button';
import { colors, Layout, getResponsiveSpacing } from '../../../../../theme';
import { WritingPadProps, StrokePath } from '../../../writing/types/writing.types';
import { RotateCcw, Check, Eye, Play, Pause } from 'lucide-react-native';

export const WritingPad: React.FC<WritingPadProps> = ({
  targetCharacter,
  strokeOrder = [],
  onStrokeComplete,
  onCharacterComplete,
  showStrokeOrder = true,
  showGuidelines = true,
  strokeWidth = 4,
  canvasSize = 300,
  variant = 'practice',
  disabled = false,
  autoPlay = false,
  playbackSpeed = 1000,
  onScoreCalculated,
  style,
}) => {
  const [strokes, setStrokes] = useState<StrokePath[]>([]);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const [showReference, setShowReference] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);

  const panGestureRef = useRef(null);
  const strokePathRef = useRef<{ x: number; y: number }[]>([]);

  // Calculate responsive canvas size
  const responsiveCanvasSize = Layout.isMobile 
    ? Math.min(canvasSize, Layout.screenWidth - (getResponsiveSpacing('lg') * 2))
    : canvasSize;

  const handleGestureEvent = useCallback((event: any) => {
    if (disabled || isAnimating) return;

    const { x, y } = event.nativeEvent;
    const canvasX = Math.max(0, Math.min(x, responsiveCanvasSize));
    const canvasY = Math.max(0, Math.min(y, responsiveCanvasSize));

    if (!isDrawing) {
      // Start new stroke
      setIsDrawing(true);
      strokePathRef.current = [{ x: canvasX, y: canvasY }];
      setCurrentPath(`M${canvasX},${canvasY}`);
    } else {
      // Continue stroke
      strokePathRef.current.push({ x: canvasX, y: canvasY });
      setCurrentPath(prev => `${prev} L${canvasX},${canvasY}`);
    }
  }, [disabled, isAnimating, isDrawing, responsiveCanvasSize]);

  const handleGestureStateChange = useCallback((event: any) => {
    if (disabled || isAnimating) return;

    const { state } = event.nativeEvent;

    if (state === State.BEGAN) {
      setIsDrawing(true);
    } else if (state === State.END || state === State.CANCELLED) {
      if (isDrawing && strokePathRef.current.length > 1) {
        // Complete the stroke
        const newStroke: StrokePath = {
          id: `stroke-${Date.now()}`,
          path: currentPath,
          points: [...strokePathRef.current],
          timestamp: Date.now(),
          order: strokes.length,
        };

        setStrokes(prev => [...prev, newStroke]);
        onStrokeComplete?.(newStroke, strokes.length);

        // Check if character is complete
        if (strokeOrder.length > 0 && strokes.length + 1 >= strokeOrder.length) {
          handleCharacterComplete([...strokes, newStroke]);
        }

        setCurrentStrokeIndex(prev => prev + 1);
      }

      setIsDrawing(false);
      setCurrentPath('');
      strokePathRef.current = [];
    }
  }, [disabled, isAnimating, isDrawing, currentPath, strokes, strokeOrder, onStrokeComplete]);

  const handleCharacterComplete = useCallback((allStrokes: StrokePath[]) => {
    // Calculate score based on stroke accuracy (simplified)
    const score = calculateStrokeAccuracy(allStrokes);
    onScoreCalculated?.(score);
    if (targetCharacter) {
      onCharacterComplete?.(targetCharacter, allStrokes, score);
    }
  }, [targetCharacter, onCharacterComplete, onScoreCalculated]);

  const calculateStrokeAccuracy = (userStrokes: StrokePath[]): number => {
    // Simplified scoring algorithm
    // In a real app, this would compare against reference stroke data
    if (!strokeOrder.length) return 100;
    
    const strokeCountAccuracy = Math.min(userStrokes.length / strokeOrder.length, 1) * 100;
    const strokeOrderAccuracy = userStrokes.length <= strokeOrder.length ? 100 : 80;
    
    return Math.round((strokeCountAccuracy + strokeOrderAccuracy) / 2);
  };

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    setCurrentStrokeIndex(0);
    setCurrentPath('');
    setIsDrawing(false);
    strokePathRef.current = [];
  }, []);

  const undoLastStroke = useCallback(() => {
    if (strokes.length > 0) {
      setStrokes(prev => prev.slice(0, -1));
      setCurrentStrokeIndex(prev => Math.max(0, prev - 1));
    }
  }, [strokes.length]);

  const toggleReference = useCallback(() => {
    setShowReference(prev => !prev);
  }, []);

  const animateStrokeOrder = useCallback(async () => {
    if (!strokeOrder.length || isAnimating) return;

    setIsAnimating(true);
    setAnimationProgress(0);
    clearCanvas();

    for (let i = 0; i < strokeOrder.length; i++) {
      const stroke = strokeOrder[i];
      
      // Animate stroke drawing
      for (let progress = 0; progress <= 1; progress += 0.1) {
        setAnimationProgress((i + progress) / strokeOrder.length);
        await new Promise(resolve => setTimeout(resolve, playbackSpeed / 10));
      }

      // Add completed stroke
      const animatedStroke: StrokePath = {
        id: `animated-${i}`,
        path: stroke,
        points: [], // Would be calculated from stroke path
        timestamp: Date.now(),
        order: i,
      };

      setStrokes(prev => [...prev, animatedStroke]);
      await new Promise(resolve => setTimeout(resolve, playbackSpeed / 5));
    }

    setIsAnimating(false);
    setAnimationProgress(0);
  }, [strokeOrder, isAnimating, playbackSpeed, clearCanvas]);

  const renderGuidelines = () => {
    if (!showGuidelines) return null;

    const center = responsiveCanvasSize / 2;
    const guidelineColor = colors.neutral[300];

    return (
      <G>
        {/* Center cross */}
        <Path
          d={`M0,${center} L${responsiveCanvasSize},${center}`}
          stroke={guidelineColor}
          strokeWidth={1}
          strokeDasharray="5,5"
        />
        <Path
          d={`M${center},0 L${center},${responsiveCanvasSize}`}
          stroke={guidelineColor}
          strokeWidth={1}
          strokeDasharray="5,5"
        />
        
        {/* Grid lines */}
        <Path
          d={`M0,${center / 2} L${responsiveCanvasSize},${center / 2}`}
          stroke={guidelineColor}
          strokeWidth={0.5}
          opacity={0.5}
        />
        <Path
          d={`M0,${center * 1.5} L${responsiveCanvasSize},${center * 1.5}`}
          stroke={guidelineColor}
          strokeWidth={0.5}
          opacity={0.5}
        />
        <Path
          d={`M${center / 2},0 L${center / 2},${responsiveCanvasSize}`}
          stroke={guidelineColor}
          strokeWidth={0.5}
          opacity={0.5}
        />
        <Path
          d={`M${center * 1.5},0 L${center * 1.5},${responsiveCanvasSize}`}
          stroke={guidelineColor}
          strokeWidth={0.5}
          opacity={0.5}
        />
      </G>
    );
  };

  const renderReferenceCharacter = () => {
    if (!showReference || !targetCharacter) return null;

    return (
      <G opacity={0.3}>
        {/* Reference character would be rendered here */}
        {/* This would typically be vector paths for the character */}
      </G>
    );
  };

  const renderStrokeOrderGuide = () => {
    if (!showStrokeOrder || !strokeOrder.length || variant === 'free') return null;

    const nextStrokeIndex = Math.min(currentStrokeIndex, strokeOrder.length - 1);
    const nextStroke = strokeOrder[nextStrokeIndex];

    if (!nextStroke || isAnimating) return null;

    return (
      <G>
        <Path
          d={nextStroke}
          stroke={colors.primary[300]}
          strokeWidth={strokeWidth}
          fill="none"
          opacity={0.4}
          strokeDasharray="10,5"
        />
      </G>
    );
  };

  const renderUserStrokes = () => {
    return (
      <G>
        {strokes.map((stroke, index) => (
          <Path
            key={stroke.id}
            d={stroke.path}
            stroke={colors.primary[600]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
        
        {/* Current stroke being drawn */}
        {isDrawing && currentPath && (
          <Path
            d={currentPath}
            stroke={colors.primary[500]}
            strokeWidth={strokeWidth}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
      </G>
    );
  };

  return (
    <Card variant="default" style={StyleSheet.flatten([styles.container, style])}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.characterInfo}>
          {targetCharacter && (
            <TranslationText size="2xl" weight="bold" style={styles.targetCharacter}>
              {targetCharacter}
            </TranslationText>
          )}
          {strokeOrder.length > 0 && (
            <TranslationText size="sm" color={colors.neutral[600]}>
              Nét {currentStrokeIndex + 1}/{strokeOrder.length}
            </TranslationText>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {strokeOrder.length > 0 && (
            <Button variant="ghost" size="sm" onPress={animateStrokeOrder} disabled={isAnimating}>
              {isAnimating ? <Pause size={20} color={colors.primary[500]} /> : <Play size={20} color={colors.primary[500]} />}
            </Button>
          )}
          
          <Button variant="ghost" size="sm" onPress={toggleReference}>
            <Eye size={20} color={showReference ? colors.primary[500] : colors.neutral[400]} />
          </Button>
        </View>
      </View>

      {/* Canvas */}
      <PanGestureHandler
        ref={panGestureRef}
        onGestureEvent={handleGestureEvent}
        onHandlerStateChange={handleGestureStateChange}
        enabled={!disabled && !isAnimating}
      >
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
            {renderReferenceCharacter()}
            {renderStrokeOrderGuide()}
            {renderUserStrokes()}
          </Svg>
          
          {/* Animation overlay */}
          {isAnimating && (
            <View style={styles.animationOverlay}>
              <TranslationText size="sm" color={colors.neutral[600]}>
                Đang hiển thị thứ tự nét... {Math.round(animationProgress * 100)}%
              </TranslationText>
            </View>
          )}
        </View>
      </PanGestureHandler>

      {/* Controls */}
      <View style={styles.controls}>
        <Button 
          variant="outline" 
          size="sm" 
          onPress={undoLastStroke}
          disabled={strokes.length === 0 || isAnimating}
        >
          <RotateCcw size={16} color={colors.neutral[600]} />
          <TranslationText size="sm" color={colors.neutral[600]}>
            Hoàn tác
          </TranslationText>
        </Button>
        
        <Button 
          variant="outline" 
          size="sm" 
          onPress={clearCanvas}
          disabled={strokes.length === 0 || isAnimating}
        >
          <TranslationText size="sm" color={colors.neutral[600]}>
            Xóa tất cả
          </TranslationText>
        </Button>
        
        {variant === 'assessment' && strokes.length > 0 && (
          <Button 
            variant="primary" 
            size="sm" 
            onPress={() => handleCharacterComplete(strokes)}
            disabled={isAnimating}
          >
            <Check size={16} color={colors.neutral[50]} />
            <TranslationText size="sm" color={colors.neutral[50]}>
              Hoàn thành
            </TranslationText>
          </Button>
        )}
      </View>

      {/* Progress indicator */}
      {strokeOrder.length > 0 && variant !== 'free' && (
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <View 
              style={[
                styles.progressFill,
                { width: `${(currentStrokeIndex / strokeOrder.length) * 100}%` }
              ]}
            />
          </View>
          <TranslationText size="xs" color={colors.neutral[500]}>
            Tiến độ: {currentStrokeIndex}/{strokeOrder.length} nét
          </TranslationText>
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: getResponsiveSpacing('lg'),
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    marginBottom: getResponsiveSpacing('lg'),
  },
  characterInfo: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  targetCharacter: {
    color: colors.neutral[800],
  },
  headerActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xs'),
  },
  canvasContainer: {
    position: 'relative',
    backgroundColor: colors.neutral[50],
    borderWidth: 2,
    borderColor: colors.neutral[200],
    borderRadius: Layout.isMobile ? 12 : 16,
    overflow: 'hidden',
  },
  canvas: {
    backgroundColor: 'transparent',
  },
  animationOverlay: {
    position: 'absolute',
    top: getResponsiveSpacing('sm'),
    left: getResponsiveSpacing('sm'),
    right: getResponsiveSpacing('sm'),
    backgroundColor: colors.neutral[50],
    borderRadius: 8,
    padding: getResponsiveSpacing('sm'),
    alignItems: 'center',
  },
  controls: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('md'),
    marginTop: getResponsiveSpacing('lg'),
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  progressContainer: {
    width: '100%',
    marginTop: getResponsiveSpacing('md'),
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
}); 