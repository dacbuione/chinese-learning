import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Dimensions } from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import Svg, { Path, G, Circle, Line, Text as SvgText } from 'react-native-svg';
import { Card } from '@/ui/atoms/Card';
import { ChineseText, PinyinText, TranslationText } from '@/ui/atoms/Text';
import { Button } from '@/ui/atoms/Button';
import { colors, Layout, getResponsiveSpacing, getResponsiveFontSize } from '@/theme';
import { WritingCharacter, StrokePath, CharacterStroke } from '@/types/writing.types';
import { RotateCcw, Check, Eye, Play, Pause, RefreshCw } from 'lucide-react-native';

interface StrokeData {
  id: number;
  path: string;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'curve';
  order: number;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  description: string;
}

interface StrokeOrderProps {
  character: WritingCharacter;
  onComplete?: (accuracy: number, timeSpent: number) => void;
  onStrokeComplete?: (strokeIndex: number, isCorrect: boolean) => void;
  showHints?: boolean;
  practiceMode?: 'guided' | 'free' | 'test';
  canvasSize?: number;
  style?: any;
}

export const StrokeOrder: React.FC<StrokeOrderProps> = ({
  character,
  onComplete,
  onStrokeComplete,
  showHints = true,
  practiceMode = 'guided',
  canvasSize = Layout.isMobile ? 280 : 320,
  style,
}) => {
  const [currentStroke, setCurrentStroke] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [userPaths, setUserPaths] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [animationStep, setAnimationStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showReference, setShowReference] = useState(true);
  const [animationProgress, setAnimationProgress] = useState(0);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const [currentPath, setCurrentPath] = useState<string>('');

  // Convert WritingCharacter strokes to StrokeData format
  const strokeData: StrokeData[] = character.strokes.map((stroke, index) => ({
    id: index,
    path: stroke.path,
    direction: stroke.direction as 'horizontal' | 'vertical' | 'diagonal' | 'curve',
    order: stroke.order,
    startPoint: stroke.startPoint,
    endPoint: stroke.endPoint,
    description: `Nét ${index + 1}: ${getDirectionName(stroke.direction)}`,
  }));

  useEffect(() => {
    setStartTime(Date.now());
    resetPractice();
  }, [character]);

  const resetPractice = () => {
    setCurrentStroke(0);
    setCompletedStrokes([]);
    setUserPaths([]);
    setIsDrawing(false);
    setShowSuccess(false);
    setAnimationStep(0);
    setIsAnimating(false);
    animatedValue.setValue(0);
  };

  const startStrokeAnimation = () => {
    if (currentStroke >= strokeData.length) return;
    
    setIsAnimating(true);
    setAnimationProgress(0);
    animatedValue.setValue(0);
    
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished) {
        setAnimationProgress(1);
        setIsAnimating(false);
        setTimeout(() => {
          setAnimationStep(prev => prev + 1);
        }, 500);
      }
    });
    
    // Listen to animation value changes
    const listener = animatedValue.addListener(({ value }) => {
      setAnimationProgress(value);
    });
    
    return () => {
      animatedValue.removeListener(listener);
    };
  };

  const handleGestureEvent = (event: any) => {
    if (!isDrawing || practiceMode === 'guided') return;
    
    const { x, y } = event.nativeEvent;
    const newPath = currentPath + (currentPath ? ` L${x},${y}` : `M${x},${y}`);
    setCurrentPath(newPath);
  };

  const handleGestureStateChange = (event: any) => {
    const { state } = event.nativeEvent;
    
    if (state === State.BEGAN) {
      handleDrawingStart();
    } else if (state === State.END) {
      handleDrawingEnd();
    }
  };

  const handleDrawingStart = () => {
    if (practiceMode === 'test' || practiceMode === 'free' || currentStroke < strokeData.length) {
      setIsDrawing(true);
      setCurrentPath('');
    }
  };

  const handleDrawingEnd = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentStroke < strokeData.length) {
      const accuracy = calculateStrokeAccuracy(currentPath, strokeData[currentStroke]);
      const isCorrect = accuracy > 0.7; // 70% accuracy threshold
      
      if (isCorrect) {
        setCompletedStrokes(prev => [...prev, currentStroke]);
        setUserPaths(prev => [...prev, currentPath]);
        setCurrentStroke(prev => prev + 1);
        
        onStrokeComplete?.(currentStroke, true);
        
        // Check if all strokes completed
        if (currentStroke + 1 >= strokeData.length) {
          const totalTime = Date.now() - startTime;
          const overallAccuracy = calculateOverallAccuracy();
          setShowSuccess(true);
          onComplete?.(overallAccuracy, totalTime);
        }
      } else {
        onStrokeComplete?.(currentStroke, false);
      }
    }
    
    setCurrentPath('');
  };

  const calculateStrokeAccuracy = (userPath: string, correctStroke: StrokeData): number => {
    if (!userPath || userPath.length < 10) return 0;
    
    const pathMatch = userPath.match(/M([\d.]+),([\d.]+)/);
    if (!pathMatch) return 0;
    
    const userStart = { x: parseFloat(pathMatch[1]), y: parseFloat(pathMatch[2]) };
    const correctStart = correctStroke.startPoint;
    
    const startDistance = Math.sqrt(
      Math.pow(userStart.x - correctStart.x, 2) + 
      Math.pow(userStart.y - correctStart.y, 2)
    );
    
    const maxDistance = 50;
    return Math.max(0, 1 - (startDistance / maxDistance));
  };

  const calculateOverallAccuracy = (): number => {
    const strokeAccuracy = completedStrokes.length / strokeData.length;
    const timeSpent = Date.now() - startTime;
    const timeFactor = Math.max(0.5, 1 - (timeSpent - 30000) / 60000);
    
    return Math.round(strokeAccuracy * timeFactor * 100);
  };

  const getStrokeColor = (strokeIndex: number): string => {
    if (completedStrokes.includes(strokeIndex)) {
      return colors.success[500];
    } else if (strokeIndex === currentStroke) {
      return colors.primary[500];
    } else if (strokeIndex < currentStroke) {
      return colors.warning[500];
    } else {
      return colors.neutral[300];
    }
  };

  const toggleReference = () => {
    setShowReference(!showReference);
  };

  const getDirectionName = (direction: string): string => {
    const directionNames = {
      horizontal: 'ngang',
      vertical: 'dọc',
      diagonal: 'chéo',
      curve: 'cong',
      hook: 'móc',
      dot: 'chấm',
    };
    return directionNames[direction as keyof typeof directionNames] || direction;
  };

  const renderGuidelines = () => (
    <G>
      <Line 
        x1={canvasSize / 2} y1="10" 
        x2={canvasSize / 2} y2={canvasSize - 10} 
        stroke={colors.neutral[200]} 
        strokeWidth="1" 
        strokeDasharray="5,5" 
      />
      <Line 
        x1="10" y1={canvasSize / 2} 
        x2={canvasSize - 10} y2={canvasSize / 2} 
        stroke={colors.neutral[200]} 
        strokeWidth="1" 
        strokeDasharray="5,5" 
      />
    </G>
  );

  const renderCompletedStrokes = () => (
    <G>
      {completedStrokes.map(strokeIndex => (
        <Path
          key={`completed-${strokeIndex}`}
          d={strokeData[strokeIndex].path}
          stroke={colors.success[500]}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      ))}
    </G>
  );

  const renderCurrentStroke = () => {
    if (currentStroke >= strokeData.length) return null;
    
    const stroke = strokeData[currentStroke];
    
    return (
      <G>
        {showHints && (
          <>
            <Circle
              cx={stroke.startPoint.x}
              cy={stroke.startPoint.y}
              r="8"
              fill={colors.success[500]}
              opacity="0.7"
            />
            <Circle
              cx={stroke.endPoint.x}
              cy={stroke.endPoint.y}
              r="6"
              fill={colors.error[500]}
              opacity="0.7"
            />
          </>
        )}
        
                 {isAnimating && (
           <Path
             d={stroke.path}
             stroke={colors.primary[500]}
             strokeWidth="4"
             fill="none"
             strokeLinecap="round"
             strokeLinejoin="round"
             strokeDasharray="300"
             strokeDashoffset={300 - (animationProgress * 300)}
           />
         )}
      </G>
    );
  };

  const renderReference = () => {
    if (!showReference) return null;
    
    return (
      <G opacity="0.3">
        {strokeData.map((stroke, index) => (
          <Path
            key={`reference-${index}`}
            d={stroke.path}
            stroke={colors.neutral[400]}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}
      </G>
    );
  };

  const renderUserStroke = () => {
    if (!currentPath) return null;
    
    return (
      <Path
        d={currentPath}
        stroke={colors.primary[600]}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  return (
    <Card variant="default" style={StyleSheet.flatten([styles.container, style])}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.characterInfo}>
          <ChineseText size="3xl" weight="bold" style={styles.targetCharacter}>
            {character.hanzi}
          </ChineseText>
          <PinyinText size="lg" style={styles.pinyin}>
            {character.pinyin}
          </PinyinText>
          <TranslationText size="base" color={colors.neutral[600]}>
            {character.vietnamese}
          </TranslationText>
        </View>
        
        <View style={styles.headerActions}>
          <Button variant="ghost" size="sm" onPress={startStrokeAnimation} disabled={isAnimating}>
            {isAnimating ? <Pause size={20} color={colors.primary[500]} /> : <Play size={20} color={colors.primary[500]} />}
          </Button>
          
          <Button variant="ghost" size="sm" onPress={toggleReference}>
            <Eye size={20} color={showReference ? colors.primary[500] : colors.neutral[400]} />
          </Button>
          
          <Button variant="ghost" size="sm" onPress={resetPractice}>
            <RefreshCw size={20} color={colors.neutral[600]} />
          </Button>
        </View>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <TranslationText size="sm" color={colors.neutral[600]}>
          Nét {currentStroke + 1} / {strokeData.length}
        </TranslationText>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedStrokes.length / strokeData.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Drawing Canvas */}
      <View style={[styles.canvasContainer, { width: canvasSize, height: canvasSize }]}>
        <PanGestureHandler
          onGestureEvent={handleGestureEvent}
          onHandlerStateChange={handleGestureStateChange}
        >
          <View style={styles.canvas}>
            <Svg width={canvasSize} height={canvasSize} viewBox={`0 0 ${canvasSize} ${canvasSize}`}>
              {renderGuidelines()}
              {renderReference()}
              {renderCompletedStrokes()}
              {renderCurrentStroke()}
              {renderUserStroke()}
            </Svg>
          </View>
        </PanGestureHandler>
      </View>

      {/* Instructions */}
      <View style={styles.instructions}>
        {currentStroke < strokeData.length ? (
          <TranslationText size="sm" color={colors.neutral[600]} align="center">
            {strokeData[currentStroke].description}
          </TranslationText>
        ) : showSuccess ? (
          <TranslationText size="base" color={colors.success[600]} align="center" weight="medium">
            ✅ Hoàn thành! Độ chính xác: {calculateOverallAccuracy()}%
          </TranslationText>
        ) : (
          <TranslationText size="sm" color={colors.neutral[600]} align="center">
            Luyện tập viết ký tự tiếng Trung
          </TranslationText>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: getResponsiveSpacing('md'),
    padding: getResponsiveSpacing('lg'),
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  characterInfo: {
    alignItems: 'center',
    flex: 1,
  },
  targetCharacter: {
    marginBottom: getResponsiveSpacing('xs'),
  },
  pinyin: {
    marginBottom: getResponsiveSpacing('xs'),
    fontStyle: 'italic',
  },
  headerActions: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('xs'),
  },
  progressContainer: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  progressBar: {
    height: 4,
    backgroundColor: colors.neutral[200],
    borderRadius: 2,
    marginTop: getResponsiveSpacing('xs'),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 2,
  },
  canvasContainer: {
    alignSelf: 'center',
    marginBottom: getResponsiveSpacing('lg'),
    borderWidth: 1,
    borderColor: colors.neutral[200],
    borderRadius: Layout.isMobile ? 8 : 12,
    overflow: 'hidden',
  },
  canvas: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  instructions: {
    minHeight: 40,
    justifyContent: 'center',
  },
});

export default StrokeOrder; 