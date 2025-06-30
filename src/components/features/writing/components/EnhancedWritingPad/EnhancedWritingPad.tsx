import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  StyleSheet,
  PanGestureHandler,
  State,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import Svg, {
  Path,
  G,
  Circle,
  Text as SvgText,
  Line,
  Defs,
  LinearGradient,
  Stop,
} from 'react-native-svg';
import { PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';

// Components
import { Card } from '../../../../ui/atoms/Card/Card';
import { Text } from '../../../../ui/atoms/Text';
import { Button } from '../../../../ui/atoms/Button';

// Theme
import { colors, getResponsiveSpacing, Layout } from '../../../../../theme';

// Audio services
import chineseTTS from '../../../../../services/tts/ChineseTTSService';

export interface StrokeData {
  id: string;
  path: string;
  order: number;
  direction: 'horizontal' | 'vertical' | 'dot' | 'curve';
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
}

export interface WritingCharacter {
  hanzi: string;
  pinyin: string;
  meaning: string;
  strokes: StrokeData[];
  strokeOrder: string[];
  difficultyLevel: number;
  practice_tips: string[];
}

export interface WritingAnalysis {
  accuracy: number;
  strokeAccuracy: number[];
  orderCorrect: boolean;
  speedScore: number;
  overallFeedback: string;
  improvements: string[];
}

export interface EnhancedWritingPadProps {
  character: WritingCharacter;
  mode?: 'learn' | 'practice' | 'test';
  showStrokeOrder?: boolean;
  showGridLines?: boolean;
  enableAudio?: boolean;
  onWritingComplete?: (analysis: WritingAnalysis) => void;
  onStrokeComplete?: (strokeIndex: number, accuracy: number) => void;
}

const { width: screenWidth } = Dimensions.get('window');
const CANVAS_SIZE = Math.min(screenWidth - 40, 400);
const GRID_SIZE = CANVAS_SIZE / 10;

export const EnhancedWritingPad: React.FC<EnhancedWritingPadProps> = ({
  character,
  mode = 'practice',
  showStrokeOrder = true,
  showGridLines = true,
  enableAudio = true,
  onWritingComplete,
  onStrokeComplete,
}) => {
  // State
  const [userStrokes, setUserStrokes] = useState<string[]>([]);
  const [currentStroke, setCurrentStroke] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [strokeAnimations, setStrokeAnimations] = useState<Animated.Value[]>([]);
  const [showReference, setShowReference] = useState(mode === 'learn');
  const [isAnimating, setIsAnimating] = useState(false);
  const [writingStartTime, setWritingStartTime] = useState<number | null>(null);
  const [strokeTimes, setStrokeTimes] = useState<number[]>([]);

  // Refs
  const pathRef = useRef<string>('');
  const startTimeRef = useRef<number>(0);

  // Initialize stroke animations
  useEffect(() => {
    const animations = character.strokes.map(() => new Animated.Value(0));
    setStrokeAnimations(animations);
  }, [character]);

  // Auto-play stroke order demo
  useEffect(() => {
    if (mode === 'learn' && strokeAnimations.length > 0) {
      playStrokeOrderDemo();
    }
  }, [strokeAnimations, mode]);

  const playStrokeOrderDemo = async () => {
    if (isAnimating) return;
    
    setIsAnimating(true);
    
    // Reset all animations
    strokeAnimations.forEach(anim => anim.setValue(0));
    
    // Play audio introduction
    if (enableAudio) {
      await chineseTTS.speak(`我们来学习写${character.hanzi}`, { rate: 0.8 });
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    // Animate each stroke
    for (let i = 0; i < strokeAnimations.length; i++) {
      // Highlight current stroke
      if (enableAudio) {
        await chineseTTS.speak(`第${i + 1}笔`, { rate: 0.7 });
      }

      await new Promise<void>((resolve) => {
        Animated.timing(strokeAnimations[i], {
          toValue: 1,
          duration: 1500,
          useNativeDriver: false,
        }).start(() => resolve());
      });

      await new Promise(resolve => setTimeout(resolve, 800));
    }

    if (enableAudio) {
      await chineseTTS.speak(`完成！现在你来试试写${character.hanzi}`, { rate: 0.8 });
    }

    setIsAnimating(false);
  };

  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    const { x, y } = event.nativeEvent;
    
    if (!isDrawing) return;

    const newPoint = `${x - 20},${y - 20}`;
    
    if (currentStroke === '') {
      pathRef.current = `M${newPoint}`;
      setCurrentStroke(`M${newPoint}`);
      setWritingStartTime(Date.now());
      startTimeRef.current = Date.now();
    } else {
      pathRef.current += ` L${newPoint}`;
      setCurrentStroke(pathRef.current);
    }
  };

  const onHandlerStateChange = (event: PanGestureHandlerGestureEvent) => {
    if (event.nativeEvent.state === State.BEGAN) {
      setIsDrawing(true);
      pathRef.current = '';
      setCurrentStroke('');
    } else if (event.nativeEvent.state === State.END) {
      setIsDrawing(false);
      completeStroke();
    }
  };

  const completeStroke = async () => {
    if (currentStroke === '') return;

    const strokeEndTime = Date.now();
    const strokeDuration = strokeEndTime - startTimeRef.current;
    
    setUserStrokes(prev => [...prev, currentStroke]);
    setStrokeTimes(prev => [...prev, strokeDuration]);
    setCurrentStroke('');
    
    // Analyze stroke accuracy
    const accuracy = analyzeStroke(currentStroke, currentStrokeIndex);
    onStrokeComplete?.(currentStrokeIndex, accuracy);

    // Audio feedback
    if (enableAudio) {
      if (accuracy > 80) {
        await chineseTTS.speak('很好！', { rate: 1.0 });
      } else if (accuracy > 60) {
        await chineseTTS.speak('不错，继续努力！', { rate: 0.9 });
      } else {
        await chineseTTS.speak('再试一次', { rate: 0.8 });
      }
    }

    // Move to next stroke
    if (currentStrokeIndex < character.strokes.length - 1) {
      setCurrentStrokeIndex(prev => prev + 1);
    } else {
      // Writing complete
      completeWriting();
    }
  };

  const analyzeStroke = (userStroke: string, strokeIndex: number): number => {
    // Mock stroke analysis - in real app would compare with reference stroke
    const referenceStroke = character.strokes[strokeIndex];
    
    // Simple analysis based on stroke complexity and user input
    const strokeComplexity = referenceStroke.path.length;
    const userComplexity = userStroke.length;
    
    const complexityRatio = Math.min(userComplexity / strokeComplexity, 1);
    const baseAccuracy = complexityRatio * 100;
    
    // Add some randomness for demonstration
    const variation = (Math.random() - 0.5) * 20;
    
    return Math.max(60, Math.min(100, baseAccuracy + variation));
  };

  const completeWriting = async () => {
    if (!writingStartTime) return;

    const totalTime = Date.now() - writingStartTime;
    const avgStrokeTime = strokeTimes.reduce((sum, time) => sum + time, 0) / strokeTimes.length;
    
    // Analyze overall writing
    const analysis: WritingAnalysis = {
      accuracy: calculateOverallAccuracy(),
      strokeAccuracy: character.strokes.map((_, index) => 
        analyzeStroke(userStrokes[index] || '', index)
      ),
      orderCorrect: true, // Simplified - would check actual stroke order
      speedScore: calculateSpeedScore(totalTime, avgStrokeTime),
      overallFeedback: generateFeedback(),
      improvements: generateImprovements(),
    };

    // Audio completion feedback
    if (enableAudio) {
      if (analysis.accuracy > 90) {
        await chineseTTS.speak(`太棒了！你写的${character.hanzi}很标准！`, { rate: 0.8 });
      } else if (analysis.accuracy > 75) {
        await chineseTTS.speak(`很好！继续练习会更好`, { rate: 0.8 });
      } else {
        await chineseTTS.speak(`继续努力，多练习几次`, { rate: 0.8 });
      }
    }

    onWritingComplete?.(analysis);
  };

  const calculateOverallAccuracy = (): number => {
    if (userStrokes.length === 0) return 0;
    
    const strokeAccuracies = userStrokes.map((stroke, index) => 
      analyzeStroke(stroke, index)
    );
    
    return strokeAccuracies.reduce((sum, acc) => sum + acc, 0) / strokeAccuracies.length;
  };

  const calculateSpeedScore = (totalTime: number, avgStrokeTime: number): number => {
    // Ideal time range for character writing
    const idealTotalTime = character.strokes.length * 2000; // 2 seconds per stroke
    const timeDiff = Math.abs(totalTime - idealTotalTime);
    const timeScore = Math.max(0, 100 - (timeDiff / idealTotalTime) * 50);
    
    return Math.round(timeScore);
  };

  const generateFeedback = (): string => {
    const accuracy = calculateOverallAccuracy();
    
    if (accuracy > 90) {
      return '写得非常好！笔画准确，笔顺正确。';
    } else if (accuracy > 75) {
      return '写得不错！有几处小地方可以改进。';
    } else if (accuracy > 60) {
      return '基本正确，需要多练习提高准确度。';
    } else {
      return '需要更多练习，注意笔画顺序和形状。';
    }
  };

  const generateImprovements = (): string[] => {
    const improvements = [];
    const accuracy = calculateOverallAccuracy();
    
    if (accuracy < 80) {
      improvements.push('注意笔画的准确性和形状');
    }
    if (userStrokes.length !== character.strokes.length) {
      improvements.push('确保按正确的笔画数量书写');
    }
    improvements.push('多观察范字的笔画结构');
    improvements.push('保持稳定的书写速度');
    
    return improvements;
  };

  const clearWriting = () => {
    setUserStrokes([]);
    setCurrentStroke('');
    setCurrentStrokeIndex(0);
    setWritingStartTime(null);
    setStrokeTimes([]);
    pathRef.current = '';
  };

  const toggleReference = () => {
    setShowReference(!showReference);
  };

  const replayDemo = () => {
    playStrokeOrderDemo();
  };

  const renderGridLines = () => {
    if (!showGridLines) return null;

    const lines = [];
    
    // Vertical lines
    for (let i = 0; i <= 10; i++) {
      lines.push(
        <Line
          key={`v-${i}`}
          x1={i * GRID_SIZE}
          y1={0}
          x2={i * GRID_SIZE}
          y2={CANVAS_SIZE}
          stroke={colors.neutral[200]}
          strokeWidth={i === 5 ? 2 : 1}
          strokeDasharray={i === 5 ? undefined : "5,5"}
        />
      );
    }
    
    // Horizontal lines
    for (let i = 0; i <= 10; i++) {
      lines.push(
        <Line
          key={`h-${i}`}
          x1={0}
          y1={i * GRID_SIZE}
          x2={CANVAS_SIZE}
          y2={i * GRID_SIZE}
          stroke={colors.neutral[200]}
          strokeWidth={i === 5 ? 2 : 1}
          strokeDasharray={i === 5 ? undefined : "5,5"}
        />
      );
    }

    return lines;
  };

  const renderReferenceStrokes = () => {
    if (!showReference) return null;

    return character.strokes.map((stroke, index) => {
      const animatedValue = strokeAnimations[index] || new Animated.Value(1);
      
      return (
        <G key={`ref-${index}`}>
          <Path
            d={stroke.path}
            stroke={colors.neutral[400]}
            strokeWidth={8}
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.3}
          />
          
          {/* Stroke order number */}
          {showStrokeOrder && (
            <Circle
              cx={stroke.startPoint.x}
              cy={stroke.startPoint.y}
              r={12}
              fill={colors.primary[500]}
              opacity={0.8}
            />
          )}
          {showStrokeOrder && (
            <SvgText
              x={stroke.startPoint.x}
              y={stroke.startPoint.y + 4}
              textAnchor="middle"
              fontSize="10"
              fill={colors.neutral[50]}
              fontWeight="bold"
            >
              {index + 1}
            </SvgText>
          )}
        </G>
      );
    });
  };

  const renderUserStrokes = () => {
    return userStrokes.map((stroke, index) => (
      <Path
        key={`user-${index}`}
        d={stroke}
        stroke={index === currentStrokeIndex - 1 ? colors.success[500] : colors.primary[600]}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    ));
  };

  const renderCurrentStroke = () => {
    if (!currentStroke) return null;

    return (
      <Path
        d={currentStroke}
        stroke={colors.secondary[500]}
        strokeWidth={6}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    );
  };

  const renderStrokeGuide = () => {
    if (currentStrokeIndex >= character.strokes.length) return null;
    
    const currentGuideStroke = character.strokes[currentStrokeIndex];
    
    return (
      <Path
        d={currentGuideStroke.path}
        stroke={colors.warning[400]}
        strokeWidth={8}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.6}
        strokeDasharray="10,5"
      />
    );
  };

  return (
    <Card style={styles.container}>
      {/* Character Info */}
      <View style={styles.header}>
        <View style={styles.characterInfo}>
          <Text style={styles.hanziDisplay}>{character.hanzi}</Text>
          <Text style={styles.pinyinDisplay}>{character.pinyin}</Text>
          <Text style={styles.meaningDisplay}>{character.meaning}</Text>
        </View>
        
        <View style={styles.progress}>
          <Text style={styles.progressText}>
            {currentStrokeIndex} / {character.strokes.length}
          </Text>
        </View>
      </View>

      {/* Writing Canvas */}
      <View style={styles.canvasContainer}>
        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
        >
          <View style={styles.canvas}>
            <Svg width={CANVAS_SIZE} height={CANVAS_SIZE}>
              <Defs>
                <LinearGradient id="grid" x1="0%" y1="0%" x2="100%" y2="100%">
                  <Stop offset="0%" stopColor={colors.neutral[100]} />
                  <Stop offset="100%" stopColor={colors.neutral[50]} />
                </LinearGradient>
              </Defs>
              
              {/* Background */}
              <Path
                d={`M0,0 L${CANVAS_SIZE},0 L${CANVAS_SIZE},${CANVAS_SIZE} L0,${CANVAS_SIZE} Z`}
                fill="url(#grid)"
              />
              
              {/* Grid lines */}
              {renderGridLines()}
              
              {/* Reference strokes */}
              {renderReferenceStrokes()}
              
              {/* Stroke guide */}
              {renderStrokeGuide()}
              
              {/* User strokes */}
              {renderUserStrokes()}
              
              {/* Current stroke */}
              {renderCurrentStroke()}
            </Svg>
          </View>
        </PanGestureHandler>
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <View style={styles.primaryControls}>
          <Button
            title="重播示范"
            onPress={replayDemo}
            variant="outline"
            size="small"
            disabled={isAnimating}
          />
          
          <Button
            title={showReference ? "隐藏参考" : "显示参考"}
            onPress={toggleReference}
            variant="outline"
            size="small"
          />
          
          <Button
            title="清除"
            onPress={clearWriting}
            variant="outline"
            size="small"
          />
        </View>
      </View>

      {/* Tips */}
      {character.practice_tips && character.practice_tips.length > 0 && (
        <View style={styles.tipsSection}>
          <Text style={styles.tipsTitle}>练習提示：</Text>
          {character.practice_tips.map((tip, index) => (
            <Text key={index} style={styles.tipText}>
              • {tip}
            </Text>
          ))}
        </View>
      )}
    </Card>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: getResponsiveSpacing('lg'),
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  characterInfo: {
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },

  hanziDisplay: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.neutral[900],
  },

  pinyinDisplay: {
    fontSize: 18,
    color: colors.primary[600],
    fontStyle: 'italic',
  },

  meaningDisplay: {
    fontSize: 16,
    color: colors.neutral[700],
  },

  progress: {
    alignItems: 'center',
  },

  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[600],
  },

  canvasContainer: {
    alignItems: 'center',
  },

  canvas: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  controls: {
    gap: getResponsiveSpacing('md'),
  },

  primaryControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('sm'),
  },

  tipsSection: {
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    padding: getResponsiveSpacing('md'),
    gap: getResponsiveSpacing('sm'),
  },

  tipsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.neutral[700],
  },

  tipText: {
    fontSize: 14,
    color: colors.neutral[600],
    lineHeight: 20,
  },
});

export default EnhancedWritingPad; 