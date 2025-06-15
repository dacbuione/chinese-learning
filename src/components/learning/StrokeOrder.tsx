/**
 * Stroke Order Component for Chinese Character Writing Practice
 * 
 * Interactive component for learning and practicing Chinese character stroke order
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path, G, Circle, Line, Text as SvgText } from 'react-native-svg';

// Theme and utils
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '../../theme';
import { useTranslation } from '../../localization';

// Types
import { ChineseWord } from '../../services/vocabularyService';

interface StrokeData {
  id: number;
  path: string;
  direction: 'horizontal' | 'vertical' | 'diagonal' | 'curve';
  order: number;
  startPoint: { x: number; y: number };
  endPoint: { x: number; y: number };
  description: string; // Vietnamese description of the stroke
}

interface StrokeOrderProps {
  word: ChineseWord;
  onComplete?: (accuracy: number, timeSpent: number) => void;
  onStrokeComplete?: (strokeIndex: number, isCorrect: boolean) => void;
  showHints?: boolean;
  practiceMode?: 'guided' | 'free' | 'test';
  style?: any;
}

export const StrokeOrder: React.FC<StrokeOrderProps> = ({
  word,
  onComplete,
  onStrokeComplete,
  showHints = true,
  practiceMode = 'guided',
  style,
}) => {
  const { t } = useTranslation();
  const [currentStroke, setCurrentStroke] = useState(0);
  const [completedStrokes, setCompletedStrokes] = useState<number[]>([]);
  const [userPaths, setUserPaths] = useState<string[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startTime, setStartTime] = useState<number>(Date.now());
  const [animationStep, setAnimationStep] = useState(0);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const animatedValue = useRef(new Animated.Value(0)).current;
  const drawingPath = useRef<string>('').current;
  const [currentPath, setCurrentPath] = useState<string>('');

  // Sample stroke data - in real app this would come from a stroke database
  const strokeData: StrokeData[] = getStrokeDataForCharacter(word.simplified);

  useEffect(() => {
    setStartTime(Date.now());
    resetPractice();
  }, [word]);

  const resetPractice = () => {
    setCurrentStroke(0);
    setCompletedStrokes([]);
    setUserPaths([]);
    setIsDrawing(false);
    setShowSuccess(false);
    setAnimationStep(0);
    animatedValue.setValue(0);
  };

  const startStrokeAnimation = () => {
    if (currentStroke >= strokeData.length) return;
    
    animatedValue.setValue(0);
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: false,
    }).start(() => {
      // Animation completed
      setTimeout(() => {
        setAnimationStep(prev => prev + 1);
      }, 500);
    });
  };

  const handleDrawingStart = () => {
    if (practiceMode === 'test' || currentStroke >= strokeData.length) {
      setIsDrawing(true);
      setCurrentPath('');
    }
  };

  const handleDrawingMove = (event: any) => {
    if (!isDrawing) return;
    
    // Get touch coordinates relative to the drawing area
    const { x, y } = event.nativeEvent;
    const newPath = currentPath + (currentPath ? ` L${x},${y}` : `M${x},${y}`);
    setCurrentPath(newPath);
  };

  const handleDrawingEnd = () => {
    if (!isDrawing) return;
    
    setIsDrawing(false);
    
    if (currentStroke < strokeData.length) {
      // Check stroke accuracy
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
        // Reset current stroke for retry
      }
    }
    
    setCurrentPath('');
  };

  const calculateStrokeAccuracy = (userPath: string, correctStroke: StrokeData): number => {
    // Simplified accuracy calculation
    // In a real app, this would use more sophisticated path matching algorithms
    if (!userPath || userPath.length < 10) return 0;
    
    // Check if user started near the correct start point
    const pathMatch = userPath.match(/M([\d.]+),([\d.]+)/);
    if (!pathMatch) return 0;
    
    const userStart = { x: parseFloat(pathMatch[1]), y: parseFloat(pathMatch[2]) };
    const correctStart = correctStroke.startPoint;
    
    const startDistance = Math.sqrt(
      Math.pow(userStart.x - correctStart.x, 2) + 
      Math.pow(userStart.y - correctStart.y, 2)
    );
    
    // Simple distance-based accuracy (in real app would be much more sophisticated)
    const maxDistance = 50; // pixels
    return Math.max(0, 1 - (startDistance / maxDistance));
  };

  const calculateOverallAccuracy = (): number => {
    // Calculate based on completed strokes and time
    const strokeAccuracy = completedStrokes.length / strokeData.length;
    const timeSpent = Date.now() - startTime;
    const timeFactor = Math.max(0.5, 1 - (timeSpent - 30000) / 60000); // Bonus for completing within 30s
    
    return Math.round(strokeAccuracy * timeFactor * 100);
  };

  const getStrokeColor = (strokeIndex: number): string => {
    if (completedStrokes.includes(strokeIndex)) {
      return colors.success[500]; // Completed stroke
    } else if (strokeIndex === currentStroke) {
      return colors.primary[500]; // Current stroke
    } else if (strokeIndex < currentStroke) {
      return colors.warning[500]; // Available for practice
    } else {
      return colors.neutral[300]; // Future stroke
    }
  };

  const renderCharacterOutline = () => {
    return (
      <Svg width="200" height="200" viewBox="0 0 200 200">
        {/* Grid lines for guidance */}
        <Line x1="100" y1="0" x2="100" y2="200" stroke={colors.neutral[200]} strokeWidth="1" strokeDasharray="5,5" />
        <Line x1="0" y1="100" x2="200" y2="100" stroke={colors.neutral[200]} strokeWidth="1" strokeDasharray="5,5" />
        
        {/* Completed strokes */}
        {strokeData.map((stroke, index) => (
          <G key={`stroke-${index}`}>
            {completedStrokes.includes(index) && (
              <Path
                d={stroke.path}
                stroke={colors.success[500]}
                strokeWidth="6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            
            {/* Current stroke animation */}
            {index === currentStroke && practiceMode === 'guided' && (
              <Animated.View>
                <Path
                  d={stroke.path}
                  stroke={colors.primary[500]}
                  strokeWidth="4"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="10,5"
                  strokeDashoffset={animatedValue.interpolate({
                    inputRange: [0, 1],
                    outputRange: [100, 0],
                  }) as any}
                />
              </Animated.View>
            )}
            
            {/* Stroke order numbers */}
            {showHints && (
              <Circle
                cx={stroke.startPoint.x}
                cy={stroke.startPoint.y}
                r="12"
                fill={getStrokeColor(index)}
                opacity={0.8}
              />
            )}
            {showHints && (
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
            )}
          </G>
        ))}
        
        {/* User's current drawing */}
        {currentPath && (
          <Path
            d={currentPath}
            stroke={colors.secondary[500]}
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity={0.7}
          />
        )}
      </Svg>
    );
  };

  return (
    <View style={[styles.container, style]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Luyện Viết Chữ Hán</Text>
        <Text style={styles.character}>{word.simplified}</Text>
        <Text style={styles.pinyin}>{word.pinyin}</Text>
        <Text style={styles.meaning}>{word.vietnamese.join(', ')}</Text>
      </View>

      {/* Progress indicator */}
      <View style={styles.progressSection}>
        <Text style={styles.progressText}>
          Nét thứ {currentStroke + 1} / {strokeData.length}
        </Text>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${(completedStrokes.length / strokeData.length) * 100}%` }
            ]} 
          />
        </View>
      </View>

      {/* Drawing area */}
      <View style={styles.drawingSection}>
        <LinearGradient
          colors={[colors.neutral[50], colors.neutral[100]]}
          style={styles.drawingArea}
        >
          <PanGestureHandler
            onGestureEvent={handleDrawingMove}
            onHandlerStateChange={(event) => {
              if (event.nativeEvent.state === State.BEGAN) {
                handleDrawingStart();
              } else if (event.nativeEvent.state === State.END) {
                handleDrawingEnd();
              }
            }}
          >
            <View style={styles.svgContainer}>
              {renderCharacterOutline()}
            </View>
          </PanGestureHandler>
        </LinearGradient>
      </View>

      {/* Current stroke info */}
      {currentStroke < strokeData.length && (
        <View style={styles.strokeInfo}>
          <Text style={styles.strokeTitle}>
            Nét {strokeData[currentStroke].order}: {strokeData[currentStroke].description}
          </Text>
          <Text style={styles.strokeDirection}>
            Hướng: {getDirectionName(strokeData[currentStroke].direction)}
          </Text>
        </View>
      )}

      {/* Controls */}
      <View style={styles.controls}>
        {practiceMode === 'guided' && (
          <TouchableOpacity
            style={styles.controlButton}
            onPress={startStrokeAnimation}
          >
            <Ionicons name="play" size={20} color={colors.neutral[50]} />
            <Text style={styles.controlButtonText}>Xem mẫu</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          style={[styles.controlButton, styles.resetButton]}
          onPress={resetPractice}
        >
          <Ionicons name="refresh" size={20} color={colors.neutral[50]} />
          <Text style={styles.controlButtonText}>Viết lại</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.controlButton, styles.hintButton]}
          onPress={() => {/* Toggle hints */}}
        >
          <Ionicons name={showHints ? "eye-off" : "eye"} size={20} color={colors.neutral[50]} />
          <Text style={styles.controlButtonText}>Gợi ý</Text>
        </TouchableOpacity>
      </View>

      {/* Success modal */}
      {showSuccess && (
        <View style={styles.successOverlay}>
          <LinearGradient
            colors={[colors.success[100], colors.success[200]]}
            style={styles.successModal}
          >
            <Ionicons name="checkmark-circle" size={64} color={colors.success[600]} />
            <Text style={styles.successTitle}>Hoàn thành!</Text>
            <Text style={styles.successMessage}>
              Bạn đã viết thành công chữ &ldquo;{word.simplified}&rdquo;
            </Text>
            <Text style={styles.accuracyText}>
              Độ chính xác: {calculateOverallAccuracy()}%
            </Text>
            <TouchableOpacity
              style={styles.continueButton}
              onPress={() => setShowSuccess(false)}
            >
              <Text style={styles.continueButtonText}>Tiếp tục</Text>
            </TouchableOpacity>
          </LinearGradient>
        </View>
      )}
    </View>
  );
};

// Helper functions
function getStrokeDataForCharacter(character: string): StrokeData[] {
  // This would normally come from a stroke database
  // Here's sample data for common characters
  const strokeDatabase: Record<string, StrokeData[]> = {
    '人': [
      {
        id: 1,
        path: 'M80 50 L120 150',
        direction: 'diagonal',
        order: 1,
        startPoint: { x: 80, y: 50 },
        endPoint: { x: 120, y: 150 },
        description: 'Nét chéo từ trái xuống phải',
      },
      {
        id: 2,
        path: 'M120 50 L80 150',
        direction: 'diagonal',
        order: 2,
        startPoint: { x: 120, y: 50 },
        endPoint: { x: 80, y: 150 },
        description: 'Nét chéo từ phải xuống trái',
      },
    ],
    '一': [
      {
        id: 1,
        path: 'M50 100 L150 100',
        direction: 'horizontal',
        order: 1,
        startPoint: { x: 50, y: 100 },
        endPoint: { x: 150, y: 100 },
        description: 'Nét ngang từ trái sang phải',
      },
    ],
    '二': [
      {
        id: 1,
        path: 'M50 80 L150 80',
        direction: 'horizontal',
        order: 1,
        startPoint: { x: 50, y: 80 },
        endPoint: { x: 150, y: 80 },
        description: 'Nét ngang trên',
      },
      {
        id: 2,
        path: 'M40 120 L160 120',
        direction: 'horizontal',
        order: 2,
        startPoint: { x: 40, y: 120 },
        endPoint: { x: 160, y: 120 },
        description: 'Nét ngang dưới',
      },
    ],
  };

  return strokeDatabase[character] || [
    {
      id: 1,
      path: 'M100 100 L100 100',
      direction: 'horizontal',
      order: 1,
      startPoint: { x: 100, y: 100 },
      endPoint: { x: 100, y: 100 },
      description: 'Chưa có dữ liệu nét cho chữ này',
    },
  ];
}

function getDirectionName(direction: string): string {
  const directionNames: Record<string, string> = {
    horizontal: 'Ngang',
    vertical: 'Dọc',
    diagonal: 'Chéo',
    curve: 'Cong',
  };
  return directionNames[direction] || 'Không xác định';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getResponsiveSpacing('lg'),
    backgroundColor: colors.neutral[50],
  },
  
  header: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  title: {
    fontSize: getResponsiveFontSize('xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },
  
  character: {
    fontSize: getResponsiveFontSize('6xl'),
    fontWeight: '300',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('sm'),
  },
  
  pinyin: {
    fontSize: getResponsiveFontSize('lg'),
    color: colors.primary[600],
    marginBottom: getResponsiveSpacing('xs'),
  },
  
  meaning: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },
  
  progressSection: {
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  progressText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[700],
    textAlign: 'center',
    marginBottom: getResponsiveSpacing('sm'),
  },
  
  progressBar: {
    height: 8,
    backgroundColor: colors.neutral[200],
    borderRadius: 4,
    overflow: 'hidden',
  },
  
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary[500],
    borderRadius: 4,
  },
  
  drawingSection: {
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  drawingArea: {
    borderRadius: 16,
    padding: getResponsiveSpacing('md'),
    elevation: 4,
    shadowColor: colors.neutral[900],
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  
  svgContainer: {
    width: 200,
    height: 200,
  },
  
  strokeInfo: {
    backgroundColor: colors.neutral[100],
    padding: getResponsiveSpacing('md'),
    borderRadius: 12,
    marginBottom: getResponsiveSpacing('lg'),
  },
  
  strokeTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  
  strokeDirection: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
  },
  
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    gap: getResponsiveSpacing('sm'),
  },
  
  controlButton: {
    flex: 1,
    backgroundColor: colors.primary[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 12,
    gap: getResponsiveSpacing('xs'),
  },
  
  resetButton: {
    backgroundColor: colors.warning[500],
  },
  
  hintButton: {
    backgroundColor: colors.secondary[500],
  },
  
  controlButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
  
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  successModal: {
    width: '80%',
    padding: getResponsiveSpacing('xl'),
    borderRadius: 20,
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  
  successTitle: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.success[700],
  },
  
  successMessage: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[700],
    textAlign: 'center',
  },
  
  accuracyText: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.success[600],
  },
  
  continueButton: {
    backgroundColor: colors.primary[500],
    paddingHorizontal: getResponsiveSpacing('xl'),
    paddingVertical: getResponsiveSpacing('md'),
    borderRadius: 12,
  },
  
  continueButtonText: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
}); 