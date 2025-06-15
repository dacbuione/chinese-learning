# 🎯 Usage Examples - New Architecture

## 🔥 Quick Start Examples

### 1. Basic Vocabulary Card Usage

```tsx
// app/(drawer)/lessons.tsx
import React from 'react';
import { ScrollView, View } from 'react-native';
import { VocabularyCard } from '../src/components/features/vocabulary';
import { VocabularyItem } from '../src/components/features/vocabulary';

const vocabularyData: VocabularyItem[] = [
  {
    id: '1',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    tone: 3,
    vietnamese: 'Xin chào',
    english: 'Hello',
    difficulty: 'beginner',
    category: 'greetings',
    lessonId: 'lesson-1'
  },
  {
    id: '2',
    hanzi: '谢谢',
    pinyin: 'xiè xiè',
    tone: 4,
    vietnamese: 'Cảm ơn',
    english: 'Thank you',
    difficulty: 'beginner',
    category: 'greetings',
    lessonId: 'lesson-1'
  }
];

export default function LessonsScreen() {
  const handleVocabularyPress = (vocabulary: VocabularyItem) => {
    console.log('Selected vocabulary:', vocabulary.hanzi);
    // Navigate to detail screen or play audio
  };

  const handleAudioPress = (audioUrl: string) => {
    console.log('Playing audio:', audioUrl);
    // Play audio implementation
  };

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      {vocabularyData.map((vocabulary) => (
        <VocabularyCard
          key={vocabulary.id}
          vocabulary={vocabulary}
          onPress={handleVocabularyPress}
          onAudioPress={handleAudioPress}
          variant="default"
          showProgress={false}
        />
      ))}
    </ScrollView>
  );
}
```

### 2. Responsive Text Components

```tsx
// components/ui/molecules/LessonHeader/LessonHeader.tsx
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { ChineseText, PinyinText, TranslationText } from '../../atoms/Text';
import { getResponsiveSpacing } from '../../../../theme/responsive';

interface LessonHeaderProps {
  title: string;
  subtitle: string;
  lesson: {
    hanzi: string;
    pinyin: string;
    vietnamese: string;
    tone: number;
  };
}

export const LessonHeader: React.FC<LessonHeaderProps> = ({
  title,
  subtitle,
  lesson
}) => {
  return (
    <View style={styles.container}>
      <TranslationText size="2xl" weight="bold" align="center">
        {title}
      </TranslationText>
      
      <TranslationText size="base" color="#666" align="center">
        {subtitle}
      </TranslationText>

      <View style={styles.lessonDemo}>
        <ChineseText 
          size="6xl" 
          tone={lesson.tone}
          showTone={true}
        >
          {lesson.hanzi}
        </ChineseText>
        
        <PinyinText size="xl">
          {lesson.pinyin}
        </PinyinText>
        
        <TranslationText language="vi" size="lg" weight="medium">
          {lesson.vietnamese}
        </TranslationText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: getResponsiveSpacing('xl'),
    gap: getResponsiveSpacing('md'),
  },
  lessonDemo: {
    alignItems: 'center',
    marginTop: getResponsiveSpacing('lg'),
    gap: getResponsiveSpacing('sm'),
  },
});
```

### 3. Feature-Based Hook Usage

```tsx
// components/features/vocabulary/hooks/useVocabulary.ts
import { useState, useEffect, useCallback } from 'react';
import { VocabularyItem } from '../types/vocabulary.types';

export const useVocabulary = (lessonId: string) => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVocabulary = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Simulate API call
      const response = await fetch(`/api/lessons/${lessonId}/vocabulary`);
      const data = await response.json();
      
      setVocabulary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);

  const playAudio = useCallback(async (audioUrl: string) => {
    try {
      // Audio service implementation
      console.log('Playing audio:', audioUrl);
    } catch (err) {
      console.error('Audio playback failed:', err);
    }
  }, []);

  useEffect(() => {
    fetchVocabulary();
  }, [fetchVocabulary]);

  return {
    vocabulary,
    isLoading,
    error,
    refetch: fetchVocabulary,
    playAudio,
  };
};

// Usage in component
export const VocabularyList: React.FC = () => {
  const { vocabulary, isLoading, error, playAudio } = useVocabulary('lesson-1');

  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <View>
      {vocabulary.map((item) => (
        <VocabularyCard
          key={item.id}
          vocabulary={item}
          onAudioPress={playAudio}
        />
      ))}
    </View>
  );
};
```

### 4. Atomic Design with Composition

```tsx
// components/ui/molecules/SearchBar/SearchBar.tsx
import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button } from '../../atoms/Button';
import { TextInput } from '../../atoms/TextInput';
import { Icon } from '../../atoms/Icon';
import { getResponsiveSpacing } from '../../../../theme/responsive';

interface SearchBarProps {
  placeholder?: string;
  onSearch: (query: string) => void;
  onClear?: () => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Tìm kiếm từ vựng...",
  onSearch,
  onClear
}) => {
  const [query, setQuery] = useState('');

  const handleSearch = () => {
    onSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  return (
    <View style={styles.container}>
      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        style={styles.input}
        onSubmitEditing={handleSearch}
      />
      
      {query.length > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onPress={handleClear}
          style={styles.clearButton}
        >
          <Icon name="close" size={16} />
        </Button>
      )}
      
      <Button
        variant="primary"
        size="md"
        onPress={handleSearch}
        style={styles.searchButton}
      >
        <Icon name="search" size={18} />
      </Button>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: getResponsiveSpacing('sm'),
    marginBottom: getResponsiveSpacing('md'),
  },
  input: {
    flex: 1,
  },
  clearButton: {
    minWidth: 32,
  },
  searchButton: {
    minWidth: 44,
  },
});
```

### 5. Responsive Grid Layout

```tsx
// components/ui/organisms/VocabularyGrid/VocabularyGrid.tsx
import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { VocabularyCard } from '../../../features/vocabulary';
import { VocabularyItem } from '../../../features/vocabulary';
import { Layout, getResponsiveSpacing } from '../../../../theme/responsive';

interface VocabularyGridProps {
  vocabularies: VocabularyItem[];
  onSelectVocabulary: (vocabulary: VocabularyItem) => void;
  onPlayAudio?: (audioUrl: string) => void;
}

export const VocabularyGrid: React.FC<VocabularyGridProps> = ({
  vocabularies,
  onSelectVocabulary,
  onPlayAudio
}) => {
  const columns = Layout.getOptimalColumns();
  const cardWidth = Layout.getCardWidth(columns);

  return (
    <ScrollView style={styles.container}>
      <View style={styles.grid}>
        {vocabularies.map((vocabulary) => (
          <VocabularyCard
            key={vocabulary.id}
            vocabulary={vocabulary}
            onPress={onSelectVocabulary}
            onAudioPress={onPlayAudio}
            variant={Layout.isMobile ? 'compact' : 'default'}
            style={[
              styles.card,
              {
                width: Layout.isMobile ? '100%' : cardWidth,
              }
            ]}
          />
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: getResponsiveSpacing('lg'),
  },
  grid: {
    flexDirection: Layout.isMobile ? 'column' : 'row',
    flexWrap: Layout.isMobile ? 'nowrap' : 'wrap',
    gap: getResponsiveSpacing('md'),
    justifyContent: Layout.isMobile ? 'flex-start' : 'space-between',
  },
  card: {
    marginBottom: getResponsiveSpacing('md'),
  },
});
```

### 6. Theme-Based Styling

```tsx
// components/ui/atoms/Card/Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, Layout } from '../../../../theme';
import { getResponsiveSpacing } from '../../../../theme/responsive';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined';
  padding?: 'sm' | 'md' | 'lg' | 'xl';
  style?: ViewStyle;
}

export const Card: React.FC<CardProps> = ({
  children,
  variant = 'default',
  padding = 'lg',
  style
}) => {
  const getVariantStyle = () => {
    switch (variant) {
      case 'elevated':
        return styles.elevated;
      case 'outlined':
        return styles.outlined;
      default:
        return styles.default;
    }
  };

  return (
    <View 
      style={[
        styles.base,
        getVariantStyle(),
        { padding: getResponsiveSpacing(padding) },
        style
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: Layout.isMobile ? 12 : 16,
    backgroundColor: colors.neutral[50],
  },
  default: {
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  elevated: {
    shadowColor: colors.neutral[900],
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.neutral[200],
    shadowOpacity: 0,
    elevation: 0,
  },
});
```

### 7. Container-Presenter Pattern

```tsx
// components/features/vocabulary/components/VocabularyCardContainer.tsx
import React from 'react';
import { VocabularyCardPresenter } from './VocabularyCardPresenter';
import { useVocabulary } from '../hooks/useVocabulary';
import { useAudio } from '../../../../hooks/useAudio';
import { VocabularyItem } from '../types/vocabulary.types';

interface VocabularyCardContainerProps {
  vocabularyId: string;
  onPress?: (vocabulary: VocabularyItem) => void;
  showProgress?: boolean;
}

export const VocabularyCardContainer: React.FC<VocabularyCardContainerProps> = ({
  vocabularyId,
  onPress,
  showProgress = false
}) => {
  const { vocabulary, isLoading, progress } = useVocabulary(vocabularyId);
  const { playAudio } = useAudio();

  const handleCardPress = () => {
    if (vocabulary) {
      onPress?.(vocabulary);
    }
  };

  const handleAudioPress = (audioUrl: string) => {
    playAudio(audioUrl);
  };

  if (isLoading) {
    return <VocabularyCardSkeleton />;
  }

  if (!vocabulary) {
    return <VocabularyCardError />;
  }

  return (
    <VocabularyCardPresenter
      vocabulary={vocabulary}
      progress={progress}
      showProgress={showProgress}
      onPress={handleCardPress}
      onAudioPress={handleAudioPress}
    />
  );
};

// Presenter (Pure component)
export const VocabularyCardPresenter: React.FC<{
  vocabulary: VocabularyItem;
  progress?: VocabularyProgress;
  showProgress: boolean;
  onPress: () => void;
  onAudioPress: (audioUrl: string) => void;
}> = ({ vocabulary, progress, showProgress, onPress, onAudioPress }) => {
  return (
    <VocabularyCard
      vocabulary={vocabulary}
      progress={progress}
      showProgress={showProgress}
      onPress={onPress}
      onAudioPress={onAudioPress}
    />
  );
};
```

## 🎯 Key Benefits Demonstrated

### ✅ **Reusability**
- `VocabularyCard` component used in multiple contexts
- `Text` atoms reused across different features
- `Button` atom with multiple variants

### ✅ **Responsive Design**
- Components adapt to different screen sizes
- Spacing and typography scale appropriately
- Grid layouts optimize for device type

### ✅ **Type Safety**
- Strong TypeScript interfaces
- Proper prop validation
- Intellisense support

### ✅ **Maintainability**
- Clear separation of concerns
- Consistent naming conventions
- Easy to find and modify components

### ✅ **Scalability**
- Feature-based organization
- Atomic design principles
- Modular architecture

**Sử dụng các examples này như template để implement các features mới trong ứng dụng học tiếng Trung!** 