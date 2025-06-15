import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

// Import components and theme
import { colors, getResponsiveSpacing, getResponsiveFontSize, device } from '../../../src/theme';
import { useTranslation } from '../../../src/localization';
import { Card } from '../../../src/components/ui/atoms/Card';

interface Lesson {
  id: string;
  title: string;
  description: string;
  type: 'vocabulary' | 'grammar' | 'pronunciation' | 'writing';
  hskLevel: number;
  progress: number;
  isLocked: boolean;
  duration: number; // in minutes
  totalWords: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

export default function LessonsScreen() {
  const { t, learning } = useTranslation();
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHSKLevel, setSelectedHSKLevel] = useState<number | null>(null);

  // Enhanced lesson data with more variety
  const lessons: Lesson[] = [
    {
      id: 'chao-hoi',
      title: 'Chào hỏi cơ bản',
      description: 'Học cách chào hỏi trong tiếng Trung - 你好, 再见, 谢谢',
      type: 'vocabulary',
      hskLevel: 1,
      progress: 100,
      isLocked: false,
      duration: 15,
      totalWords: 8,
      difficulty: 'beginner',
      tags: ['greetings', 'daily', 'essential'],
    },
    {
      id: 'so-dem',
      title: 'Số đếm 1-10',
      description: 'Học các số từ 1 đến 10 - 一, 二, 三, 四, 五...',
      type: 'vocabulary',
      hskLevel: 1,
      progress: 75,
      isLocked: false,
      duration: 12,
      totalWords: 10,
      difficulty: 'beginner',
      tags: ['numbers', 'counting', 'basic'],
    },
    {
      id: '3',
      title: 'Thanh điệu cơ bản',
      description: 'Luyện tập 4 thanh điệu chính của tiếng Trung Quốc',
      type: 'pronunciation',
      hskLevel: 1,
      progress: 50,
      isLocked: false,
      duration: 20,
      totalWords: 15,
      difficulty: 'beginner',
      tags: ['tones', 'pronunciation', 'fundamental'],
    },
    {
      id: '4',
      title: 'Gia đình',
      description: 'Từ vựng về thành viên gia đình - 爸爸, 妈妈, 儿子, 女儿',
      type: 'vocabulary',
      hskLevel: 1,
      progress: 25,
      isLocked: false,
      duration: 18,
      totalWords: 12,
      difficulty: 'beginner',
      tags: ['family', 'relationships', 'people'],
    },
    {
      id: '5',
      title: 'Viết chữ Hán cơ bản',
      description: 'Học cách viết những chữ Hán đầu tiên và thứ tự nét',
      type: 'writing',
      hskLevel: 1,
      progress: 0,
      isLocked: false,
      duration: 25,
      totalWords: 6,
      difficulty: 'beginner',
      tags: ['writing', 'strokes', 'characters'],
    },
    {
      id: '6',
      title: 'Câu hỏi đơn giản',
      description: 'Cấu trúc câu hỏi cơ bản - 什么, 哪里, 怎么样',
      type: 'grammar',
      hskLevel: 2,
      progress: 0,
      isLocked: true,
      duration: 22,
      totalWords: 10,
      difficulty: 'intermediate',
      tags: ['questions', 'grammar', 'structure'],
    },
    {
      id: '7',
      title: 'Thời gian và ngày tháng',
      description: 'Học cách nói thời gian, ngày, tháng, năm trong tiếng Trung',
      type: 'vocabulary',
      hskLevel: 1,
      progress: 60,
      isLocked: false,
      duration: 20,
      totalWords: 15,
      difficulty: 'beginner',
      tags: ['time', 'dates', 'calendar'],
    },
    {
      id: '8',
      title: 'Màu sắc và hình dạng',
      description: 'Từ vựng về màu sắc và hình dạng cơ bản',
      type: 'vocabulary',
      hskLevel: 1,
      progress: 30,
      isLocked: false,
      duration: 16,
      totalWords: 14,
      difficulty: 'beginner',
      tags: ['colors', 'shapes', 'descriptive'],
    },
  ];

  const categories = [
    { id: 'all', label: 'Tất cả', icon: 'grid-outline' },
    { id: 'vocabulary', label: learning.vocabulary, icon: 'book-outline' },
    { id: 'pronunciation', label: learning.pronunciation, icon: 'mic-outline' },
    { id: 'writing', label: learning.writing, icon: 'brush-outline' },
    { id: 'grammar', label: learning.grammar, icon: 'library-outline' },
  ];

  const hskLevels = [1, 2, 3, 4, 5, 6];

  // Filtered and searched lessons
  const filteredLessons = useMemo(() => {
    let filtered = lessons;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(lesson => lesson.type === selectedCategory);
    }

    // Filter by HSK level
    if (selectedHSKLevel) {
      filtered = filtered.filter(lesson => lesson.hskLevel === selectedHSKLevel);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(lesson =>
        lesson.title.toLowerCase().includes(query) ||
        lesson.description.toLowerCase().includes(query) ||
        lesson.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [selectedCategory, selectedHSKLevel, searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return 'book-outline';
      case 'pronunciation':
        return 'mic-outline';
      case 'writing':
        return 'brush-outline';
      case 'grammar':
        return 'library-outline';
      default:
        return 'document-outline';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'vocabulary':
        return colors.primary[500];
      case 'pronunciation':
        return colors.secondary[500];
      case 'writing':
        return colors.accent[500];
      case 'grammar':
        return colors.warning[500];
      default:
        return colors.neutral[500];
    }
  };

  const getHSKColor = (level: number) => {
    const hskColors = [
      colors.neutral[500],
      colors.primary[500],   // HSK 1
      colors.secondary[500], // HSK 2
      colors.accent[500],    // HSK 3
      colors.warning[500],   // HSK 4
      colors.error[500],     // HSK 5
      colors.primary[700],   // HSK 6
    ];
    return hskColors[level] || colors.neutral[500];
  };

  const handleLessonPress = (lesson: Lesson) => {
    if (lesson.isLocked) {
      console.log('Lesson is locked');
      return;
    }
    
    // Navigate to lesson detail screen
    router.push(`/lessons/${lesson.id}`);
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Bài học</Text>
      <Text style={styles.headerSubtitle}>
        {filteredLessons.length} bài học có sẵn
      </Text>
    </View>
  );

  const renderSearchBar = () => (
    <View style={styles.searchContainer}>
      <View style={styles.searchInputContainer}>
        <Ionicons name="search" size={20} color={colors.neutral[400]} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm bài học..."
          placeholderTextColor={colors.neutral[400]}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => setSearchQuery('')}>
            <Ionicons name="close-circle" size={20} color={colors.neutral[400]} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  const renderCategories = () => (
    <View style={styles.categoriesContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.categoriesWrapper}>
          {categories.map((category) => (
            <TouchableOpacity
              key={category.id}
              style={[
                styles.categoryButton,
                selectedCategory === category.id && styles.categoryButtonActive
              ]}
              onPress={() => setSelectedCategory(category.id)}
            >
              <Ionicons 
                name={category.icon as any} 
                size={20} 
                color={selectedCategory === category.id ? colors.neutral[50] : colors.neutral[600]} 
              />
              <Text style={[
                styles.categoryButtonText,
                selectedCategory === category.id && styles.categoryButtonTextActive
              ]}>
                {category.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderHSKLevels = () => (
    <View style={styles.hskContainer}>
      <Text style={styles.hskTitle}>Cấp độ HSK</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={styles.hskWrapper}>
          <TouchableOpacity
            style={[
              styles.hskButton,
              selectedHSKLevel === null && styles.hskButtonActive
            ]}
            onPress={() => setSelectedHSKLevel(null)}
          >
            <Text style={[
              styles.hskButtonText,
              selectedHSKLevel === null && styles.hskButtonTextActive
            ]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {hskLevels.map((level) => (
            <TouchableOpacity
              key={level}
              style={[
                styles.hskButton,
                { borderColor: getHSKColor(level) },
                selectedHSKLevel === level && { backgroundColor: getHSKColor(level) }
              ]}
              onPress={() => setSelectedHSKLevel(level)}
            >
              <Text style={[
                styles.hskButtonText,
                { color: selectedHSKLevel === level ? colors.neutral[50] : getHSKColor(level) }
              ]}>
                HSK {level}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );

  const renderLessonCard = (lesson: Lesson) => (
    <Card key={lesson.id} style={styles.lessonCard}>
      <TouchableOpacity
        style={styles.lessonContent}
        onPress={() => handleLessonPress(lesson)}
        disabled={lesson.isLocked}
        activeOpacity={lesson.isLocked ? 1 : 0.8}
      >
        {/* Header with type and HSK level */}
        <View style={styles.lessonHeader}>
          <View style={styles.lessonTypeContainer}>
            <View style={[styles.lessonTypeIcon, { backgroundColor: getTypeColor(lesson.type) }]}>
              <Ionicons 
                name={getTypeIcon(lesson.type) as any} 
                size={16} 
                color={colors.neutral[50]} 
              />
            </View>
            <Text style={styles.lessonTypeText}>
              {lesson.type === 'vocabulary' ? learning.vocabulary :
               lesson.type === 'pronunciation' ? learning.pronunciation :
               lesson.type === 'writing' ? learning.writing :
               lesson.type === 'grammar' ? learning.grammar : lesson.type}
            </Text>
          </View>
          
          <View style={[styles.hskBadge, { backgroundColor: getHSKColor(lesson.hskLevel) }]}>
            <Text style={styles.hskBadgeText}>HSK {lesson.hskLevel}</Text>
          </View>
        </View>

        {/* Title and description */}
        <Text style={[styles.lessonTitle, lesson.isLocked && styles.lockedText]}>
          {lesson.title}
        </Text>
        <Text style={[styles.lessonDescription, lesson.isLocked && styles.lockedText]}>
          {lesson.description}
        </Text>

        {/* Lesson info */}
        <View style={styles.lessonInfo}>
          <View style={styles.lessonInfoItem}>
            <Ionicons name="time-outline" size={14} color={colors.neutral[500]} />
            <Text style={styles.lessonInfoText}>{lesson.duration} phút</Text>
          </View>
          <View style={styles.lessonInfoItem}>
            <Ionicons name="library-outline" size={14} color={colors.neutral[500]} />
            <Text style={styles.lessonInfoText}>{lesson.totalWords} từ</Text>
          </View>
          <View style={styles.lessonInfoItem}>
            <Ionicons 
              name={lesson.difficulty === 'beginner' ? 'star-outline' : 
                    lesson.difficulty === 'intermediate' ? 'star-half-outline' : 'star'} 
              size={14} 
              color={colors.neutral[500]} 
            />
            <Text style={styles.lessonInfoText}>
              {lesson.difficulty === 'beginner' ? 'Cơ bản' :
               lesson.difficulty === 'intermediate' ? 'Trung cấp' : 'Nâng cao'}
            </Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBarBg}>
            <View 
              style={[
                styles.progressBarFill, 
                { 
                  width: `${lesson.progress}%`,
                  backgroundColor: lesson.isLocked ? colors.neutral[300] : getTypeColor(lesson.type)
                }
              ]} 
            />
          </View>
          <Text style={[styles.progressText, lesson.isLocked && styles.lockedText]}>
            {lesson.isLocked ? 'Đã khóa' : lesson.progress === 0 ? 'Chưa bắt đầu' : `${lesson.progress}%`}
          </Text>
        </View>

        {/* Lock overlay */}
        {lesson.isLocked && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={20} color={colors.neutral[400]} />
          </View>
        )}
      </TouchableOpacity>
    </Card>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="search" size={48} color={colors.neutral[300]} />
      <Text style={styles.emptyStateTitle}>Không tìm thấy bài học</Text>
      <Text style={styles.emptyStateText}>
        Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      {renderHeader()}
      {renderSearchBar()}
      {renderCategories()}
      {renderHSKLevels()}
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.lessonsContainer}>
          {filteredLessons.length > 0 ? (
            filteredLessons.map(renderLessonCard)
          ) : (
            renderEmptyState()
          )}
        </View>
        
        {/* Bottom spacing for tab bar */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.neutral[50],
  },
  
  // Header
  header: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingVertical: getResponsiveSpacing('md'),
    backgroundColor: colors.neutral[50],
  },
  headerTitle: {
    fontSize: getResponsiveFontSize('2xl'),
    fontWeight: '700',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  headerSubtitle: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[600],
  },

  // Search
  searchContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingBottom: getResponsiveSpacing('md'),
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
    borderRadius: 12,
    paddingHorizontal: getResponsiveSpacing('md'),
    gap: getResponsiveSpacing('sm'),
  },
  searchInput: {
    flex: 1,
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[900],
    paddingVertical: getResponsiveSpacing('md'),
  },
  
  // Categories
  categoriesContainer: {
    paddingVertical: getResponsiveSpacing('sm'),
    backgroundColor: colors.neutral[50],
  },
  categoriesWrapper: {
    flexDirection: 'row',
    paddingHorizontal: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('sm'),
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    gap: getResponsiveSpacing('xs'),
  },
  categoryButtonActive: {
    backgroundColor: colors.primary[500],
  },
  categoryButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[600],
  },
  categoryButtonTextActive: {
    color: colors.neutral[50],
  },

  // HSK Levels
  hskContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    paddingBottom: getResponsiveSpacing('md'),
  },
  hskTitle: {
    fontSize: getResponsiveFontSize('base'),
    fontWeight: '600',
    color: colors.neutral[700],
    marginBottom: getResponsiveSpacing('sm'),
  },
  hskWrapper: {
    flexDirection: 'row',
    gap: getResponsiveSpacing('sm'),
  },
  hskButton: {
    paddingHorizontal: getResponsiveSpacing('md'),
    paddingVertical: getResponsiveSpacing('sm'),
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.neutral[300],
    backgroundColor: colors.neutral[50],
  },
  hskButtonActive: {
    backgroundColor: colors.primary[500],
    borderColor: colors.primary[500],
  },
  hskButtonText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[600],
  },
  hskButtonTextActive: {
    color: colors.neutral[50],
  },
  
  // Lessons
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: getResponsiveSpacing('sm'),
  },
  lessonsContainer: {
    paddingHorizontal: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('md'),
  },
  lessonCard: {
    padding: 0,
    overflow: 'hidden',
  },
  lessonContent: {
    padding: getResponsiveSpacing('lg'),
    position: 'relative',
  },
  
  // Lesson header
  lessonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: getResponsiveSpacing('md'),
  },
  lessonTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
  },
  lessonTypeIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  lessonTypeText: {
    fontSize: getResponsiveFontSize('sm'),
    fontWeight: '500',
    color: colors.neutral[600],
  },
  hskBadge: {
    paddingHorizontal: getResponsiveSpacing('sm'),
    paddingVertical: 4,
    borderRadius: 12,
  },
  hskBadgeText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '600',
    color: colors.neutral[50],
  },
  
  // Lesson content
  lessonTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[900],
    marginBottom: getResponsiveSpacing('xs'),
  },
  lessonDescription: {
    fontSize: getResponsiveFontSize('sm'),
    color: colors.neutral[600],
    marginBottom: getResponsiveSpacing('md'),
    lineHeight: 20,
  },
  
  // Lesson info
  lessonInfo: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: getResponsiveSpacing('lg'),
    marginBottom: getResponsiveSpacing('md'),
  },
  lessonInfoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('xs'),
  },
  lessonInfoText: {
    fontSize: getResponsiveFontSize('xs'),
    color: colors.neutral[500],
  },
  
  // Progress
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('md'),
  },
  progressBarBg: {
    flex: 1,
    height: 6,
    backgroundColor: colors.neutral[200],
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 3,
  },
  progressText: {
    fontSize: getResponsiveFontSize('xs'),
    fontWeight: '500',
    color: colors.neutral[600],
    minWidth: 60,
    textAlign: 'right',
  },
  
  // Lock state
  lockedText: {
    opacity: 0.5,
  },
  lockOverlay: {
    position: 'absolute',
    top: getResponsiveSpacing('md'),
    right: getResponsiveSpacing('md'),
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.neutral[100],
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('3xl'),
  },
  emptyStateTitle: {
    fontSize: getResponsiveFontSize('lg'),
    fontWeight: '600',
    color: colors.neutral[600],
    marginTop: getResponsiveSpacing('md'),
    marginBottom: getResponsiveSpacing('sm'),
  },
  emptyStateText: {
    fontSize: getResponsiveFontSize('base'),
    color: colors.neutral[500],
    textAlign: 'center',
  },
  
  // Bottom spacing
  bottomSpacing: {
    height: getResponsiveSpacing('xl'),
  },
});