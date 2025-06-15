# 🏗️ Architecture Guide - Chinese Learning App

## 📂 Cấu Trúc Thư Mục Mới (New Folder Structure)

```
src/
├── components/                    # Component Layer
│   ├── ui/                       # UI Components (Atomic Design)
│   │   ├── atoms/               # Basic UI elements
│   │   │   ├── Button/
│   │   │   │   ├── index.tsx
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Button.styles.ts
│   │   │   │   ├── Button.types.ts
│   │   │   │   └── Button.test.tsx
│   │   │   ├── Input/
│   │   │   ├── Text/
│   │   │   ├── Icon/
│   │   │   ├── Loading/
│   │   │   └── Badge/
│   │   ├── molecules/           # Compound UI components
│   │   │   ├── FormField/
│   │   │   ├── SearchBar/
│   │   │   ├── ProgressBar/
│   │   │   ├── AudioPlayer/
│   │   │   └── NavigationTab/
│   │   └── organisms/           # Complex UI sections
│   │       ├── Header/
│   │       ├── Sidebar/
│   │       ├── Navigation/
│   │       └── Modal/
│   ├── features/                # Feature-based Components
│   │   ├── vocabulary/          # Vocabulary Learning
│   │   │   ├── components/
│   │   │   │   ├── VocabularyCard/
│   │   │   │   ├── VocabularyList/
│   │   │   │   ├── VocabularySearch/
│   │   │   │   └── VocabularyQuiz/
│   │   │   ├── hooks/
│   │   │   │   ├── useVocabulary.ts
│   │   │   │   └── useVocabularyProgress.ts
│   │   │   ├── services/
│   │   │   │   └── vocabularyService.ts
│   │   │   ├── types/
│   │   │   │   └── vocabulary.types.ts
│   │   │   └── index.ts
│   │   ├── pronunciation/       # Tone & Pronunciation
│   │   │   ├── components/
│   │   │   │   ├── TonePractice/
│   │   │   │   ├── ToneIndicator/
│   │   │   │   ├── AudioRecorder/
│   │   │   │   └── PronunciationFeedback/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── writing/            # Character Writing
│   │   │   ├── components/
│   │   │   │   ├── StrokeOrder/
│   │   │   │   ├── WritingPad/
│   │   │   │   ├── CharacterPreview/
│   │   │   │   └── WritingQuiz/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── grammar/            # Grammar Learning
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── lessons/            # Lesson Management
│   │   │   ├── components/
│   │   │   │   ├── LessonCard/
│   │   │   │   ├── LessonProgress/
│   │   │   │   ├── LessonList/
│   │   │   │   └── LessonDetail/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── quiz/              # Quiz & Assessment
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── progress/          # Progress Tracking
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   └── auth/              # Authentication
│   │       ├── components/
│   │       ├── hooks/
│   │       ├── services/
│   │       ├── types/
│   │       └── index.ts
│   └── layout/                # Layout Components
│       ├── AppLayout/
│       ├── AuthLayout/
│       ├── LessonLayout/
│       └── ResponsiveContainer/
├── hooks/                     # Global Hooks
│   ├── useApi.ts
│   ├── useAuth.ts
│   ├── useStorage.ts
│   ├── useAudio.ts
│   ├── useTranslation.ts
│   ├── useTheme.ts
│   └── useResponsive.ts
├── services/                  # API & External Services
│   ├── api/
│   │   ├── client.ts
│   │   ├── endpoints.ts
│   │   └── types.ts
│   ├── storage/
│   │   ├── AsyncStorage.ts
│   │   └── SecureStorage.ts
│   ├── audio/
│   │   ├── AudioService.ts
│   │   └── RecordingService.ts
│   ├── translation/
│   │   └── TranslationService.ts
│   └── analytics/
│       └── AnalyticsService.ts
├── store/                    # State Management (Redux Toolkit)
│   ├── index.ts
│   ├── rootReducer.ts
│   ├── middleware.ts
│   └── slices/
│       ├── authSlice.ts
│       ├── vocabularySlice.ts
│       ├── progressSlice.ts
│       ├── lessonsSlice.ts
│       └── settingsSlice.ts
├── utils/                    # Utility Functions
│   ├── constants/
│   │   ├── colors.ts
│   │   ├── dimensions.ts
│   │   └── routes.ts
│   ├── helpers/
│   │   ├── chinese.ts       # Chinese text utilities
│   │   ├── pronunciation.ts # Pinyin utilities
│   │   ├── formatting.ts
│   │   └── validation.ts
│   ├── performance/
│   │   ├── optimization.ts
│   │   └── caching.ts
│   └── testing/
│       ├── testUtils.ts
│       └── mockData.ts
├── types/                    # Global TypeScript Types
│   ├── api.types.ts
│   ├── navigation.types.ts
│   ├── common.types.ts
│   └── chinese.types.ts
├── theme/                    # Design System
│   ├── index.ts
│   ├── colors.ts
│   ├── typography.ts
│   ├── spacing.ts
│   ├── responsive.ts
│   ├── animations.ts
│   └── components/          # Component-specific themes
│       ├── button.theme.ts
│       ├── card.theme.ts
│       └── text.theme.ts
├── localization/            # Internationalization
│   ├── index.ts
│   ├── vi.ts               # Vietnamese translations
│   ├── en.ts               # English translations
│   └── zh.ts               # Chinese translations
└── assets/                 # Static Assets
    ├── images/
    ├── audio/
    ├── fonts/
    └── animations/
```

## 🎨 Design Patterns Implemented

### 1. **Atomic Design Pattern**
```tsx
// Atoms: Basic building blocks
export const Button = ({ variant, size, children, ...props }) => {
  const styles = useButtonStyles(variant, size);
  return <TouchableOpacity style={styles} {...props}>{children}</TouchableOpacity>;
};

// Molecules: Combinations of atoms
export const SearchBar = ({ onSearch, placeholder }) => {
  return (
    <View style={styles.container}>
      <Input placeholder={placeholder} />
      <Button variant="primary" onPress={onSearch}>
        <Icon name="search" />
      </Button>
    </View>
  );
};

// Organisms: Complex components
export const VocabularySection = ({ vocabulary, onSelect }) => {
  return (
    <View>
      <SearchBar onSearch={handleSearch} />
      <VocabularyList items={vocabulary} onSelect={onSelect} />
    </View>
  );
};
```

### 2. **Feature-Driven Development (FDD)**
```tsx
// features/vocabulary/index.ts - Feature barrel export
export { VocabularyCard } from './components/VocabularyCard';
export { VocabularyList } from './components/VocabularyList';
export { useVocabulary } from './hooks/useVocabulary';
export { vocabularyService } from './services/vocabularyService';
export type { VocabularyItem, VocabularyProgress } from './types/vocabulary.types';
```

### 3. **Container-Presenter Pattern**
```tsx
// Container (Smart Component)
export const VocabularyCardContainer: React.FC<Props> = ({ vocabularyId }) => {
  const { vocabulary, isLoading, playAudio } = useVocabulary(vocabularyId);
  const { updateProgress } = useProgress();
  
  const handleCardPress = useCallback(() => {
    playAudio(vocabulary.audio);
    updateProgress(vocabularyId);
  }, [vocabulary, vocabularyId]);
  
  return (
    <VocabularyCardPresenter
      vocabulary={vocabulary}
      isLoading={isLoading}
      onPress={handleCardPress}
    />
  );
};

// Presenter (Dumb Component)
export const VocabularyCardPresenter: React.FC<PresenterProps> = ({
  vocabulary,
  isLoading,
  onPress
}) => {
  if (isLoading) return <LoadingPlaceholder />;
  
  return (
    <Card onPress={onPress}>
      <ChineseText>{vocabulary.hanzi}</ChineseText>
      <PinyinText>{vocabulary.pinyin}</PinyinText>
      <TranslationText>{vocabulary.vietnamese}</TranslationText>
    </Card>
  );
};
```

### 4. **Composition Pattern**
```tsx
// Base Card component
export const Card: React.FC<CardProps> = ({ children, variant, ...props }) => {
  return (
    <View style={[styles.card, styles[variant]]} {...props}>
      {children}
    </View>
  );
};

// Composed Vocabulary Card
export const VocabularyCard: React.FC<VocabularyCardProps> = ({ vocabulary }) => {
  return (
    <Card variant="vocabulary">
      <Card.Header>
        <ToneIndicator tone={vocabulary.tone} />
        <AudioButton audio={vocabulary.audio} />
      </Card.Header>
      <Card.Body>
        <ChineseText size="large">{vocabulary.hanzi}</ChineseText>
        <PinyinText>{vocabulary.pinyin}</PinyinText>
      </Card.Body>
      <Card.Footer>
        <TranslationText>{vocabulary.vietnamese}</TranslationText>
      </Card.Footer>
    </Card>
  );
};
```

### 5. **Hook Pattern for State Logic**
```tsx
// Custom hook for vocabulary management
export const useVocabulary = (lessonId: string) => {
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const fetchVocabulary = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await vocabularyService.getByLesson(lessonId);
      setVocabulary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [lessonId]);
  
  const playAudio = useCallback(async (audioUrl: string) => {
    await AudioService.play(audioUrl);
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
```

### 6. **Factory Pattern for Component Creation**
```tsx
// Component factory for different card types
export class CardFactory {
  static create(type: CardType, props: any) {
    switch (type) {
      case 'vocabulary':
        return <VocabularyCard {...props} />;
      case 'grammar':
        return <GrammarCard {...props} />;
      case 'pronunciation':
        return <PronunciationCard {...props} />;
      default:
        return <BaseCard {...props} />;
    }
  }
}

// Usage
const renderCard = (item: LearningItem) => {
  return CardFactory.create(item.type, { data: item });
};
```

### 7. **Observer Pattern for Progress Tracking**
```tsx
// Progress tracker service
class ProgressTracker {
  private observers: Observer[] = [];
  
  subscribe(observer: Observer) {
    this.observers.push(observer);
  }
  
  unsubscribe(observer: Observer) {
    this.observers = this.observers.filter(obs => obs !== observer);
  }
  
  notify(progress: ProgressData) {
    this.observers.forEach(observer => observer.update(progress));
  }
  
  updateProgress(lessonId: string, score: number) {
    const progress = { lessonId, score, timestamp: Date.now() };
    this.notify(progress);
  }
}

// Usage in component
export const useLessonProgress = (lessonId: string) => {
  const [progress, setProgress] = useState<ProgressData | null>(null);
  
  useEffect(() => {
    const observer = {
      update: (progressData: ProgressData) => {
        if (progressData.lessonId === lessonId) {
          setProgress(progressData);
        }
      }
    };
    
    ProgressTracker.subscribe(observer);
    
    return () => ProgressTracker.unsubscribe(observer);
  }, [lessonId]);
  
  return progress;
};
```

## 🔧 Implementation Benefits

### ✅ **Scalability**
- Feature-based organization cho phép team làm việc độc lập
- Atomic design giúp tái sử dụng components
- Clear separation of concerns

### ✅ **Maintainability**
- Mỗi component có structure nhất quán
- Easy to find và modify code
- Clear testing strategy với co-located tests

### ✅ **Reusability**
- UI components có thể sử dụng across features
- Custom hooks tái sử dụng business logic
- Services layer abstracts external dependencies

### ✅ **Performance**
- Lazy loading cho features
- Memoization patterns trong hooks
- Optimized re-renders với proper component structure

### ✅ **Developer Experience**
- TypeScript support với proper typing
- Consistent naming conventions
- Clear import/export patterns
- Auto-completion friendly structure

## 🚀 Migration Strategy

1. **Phase 1**: Setup new folder structure
2. **Phase 2**: Migrate UI components (atoms → molecules → organisms)
3. **Phase 3**: Extract feature-specific logic
4. **Phase 4**: Implement design patterns
5. **Phase 5**: Add comprehensive testing
6. **Phase 6**: Performance optimization

Cấu trúc này sẽ giúp ứng dụng học tiếng Trung dễ dàng scale lên và maintain trong tương lai. 