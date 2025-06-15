# 🚀 Migration Guide - Chinese Learning App

## 📋 Pre-Migration Checklist

- [ ] Backup current codebase
- [ ] Stop all running processes (`pkill -f expo && pkill -f metro`)
- [ ] Review current component usage
- [ ] Update team on new architecture

## 🔄 Step-by-Step Migration

### Phase 1: Setup New Structure ✅ (COMPLETED)
```bash
# New folders have been created:
src/
├── components/
│   ├── ui/atoms/
│   ├── ui/molecules/
│   ├── ui/organisms/
│   ├── features/
│   └── layout/
├── services/
├── store/slices/
├── types/
└── localization/
```

### Phase 2: Migrate UI Components

#### 2.1 Move Button Component
```bash
# Old location: src/components/common/Button.tsx
# New location: src/components/ui/atoms/Button/
```

**Old Usage:**
```tsx
import { Button } from '../components/common/Button';

<Button>Click me</Button>
```

**New Usage:**
```tsx
import { Button } from '../components/ui/atoms/Button';

<Button variant="primary" size="md">Click me</Button>
```

#### 2.2 Replace Text Components
**Old:**
```tsx
// No specialized text components
<Text style={styles.chineseText}>你好</Text>
<Text style={styles.pinyin}>nǐ hǎo</Text>
<Text style={styles.translation}>Xin chào</Text>
```

**New:**
```tsx
import { ChineseText, PinyinText, TranslationText } from '../components/ui/atoms/Text';

<ChineseText size="5xl" tone={3}>你好</ChineseText>
<PinyinText>nǐ hǎo</PinyinText>
<TranslationText language="vi">Xin chào</TranslationText>
```

### Phase 3: Feature-Based Components

#### 3.1 Migrate VocabularyCard
**Old Location:** `src/components/lessons/VocabularyCard.tsx`
**New Location:** `src/components/features/vocabulary/components/VocabularyCard/`

**Old Usage:**
```tsx
import { VocabularyCard } from '../components/lessons/VocabularyCard';

<VocabularyCard 
  hanzi="你好"
  pinyin="nǐ hǎo"
  vietnamese="Xin chào"
  onPress={handlePress}
/>
```

**New Usage:**
```tsx
import { VocabularyCard } from '../components/features/vocabulary';

<VocabularyCard 
  vocabulary={{
    id: '1',
    hanzi: '你好',
    pinyin: 'nǐ hǎo',
    tone: 3,
    vietnamese: 'Xin chào',
    english: 'Hello',
    difficulty: 'beginner',
    category: 'greetings',
    lessonId: 'lesson-1'
  }}
  onPress={handlePress}
  variant="default"
  showProgress={true}
/>
```

#### 3.2 Update Import Statements

**Create an update script:**
```bash
# Run this script to update imports across the project
find src/ -name "*.tsx" -type f -exec sed -i '' 's/from.*components\/lessons\/VocabularyCard/from "..\/components\/features\/vocabulary"/g' {} +
```

### Phase 4: Theme System Updates

#### 4.1 Update Spacing Usage
**Old:**
```tsx
const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 24,
  }
});
```

**New:**
```tsx
import { getResponsiveSpacing } from '../theme/responsive';

const styles = StyleSheet.create({
  container: {
    padding: getResponsiveSpacing('lg'),
    margin: getResponsiveSpacing('xl'),
  }
});
```

#### 4.2 Update Font Sizes
**Old:**
```tsx
fontSize: 24,
color: '#DC2626',
```

**New:**
```tsx
import { responsiveTypography } from '../theme/responsive';
import { colors } from '../theme';

fontSize: responsiveTypography.getResponsiveFontSize('xl'),
color: colors.primary[500],
```

### Phase 5: Redux Store Migration

#### 5.1 Move to Redux Toolkit Slices
**Old Location:** `src/redux/`
**New Location:** `src/store/slices/`

**Example Migration:**
```tsx
// Old: src/redux/vocabularyReducer.ts
// New: src/store/slices/vocabularySlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { VocabularyItem } from '../components/features/vocabulary';

interface VocabularyState {
  items: VocabularyItem[];
  loading: boolean;
  error: string | null;
}

const vocabularySlice = createSlice({
  name: 'vocabulary',
  initialState,
  reducers: {
    setVocabulary: (state, action: PayloadAction<VocabularyItem[]>) => {
      state.items = action.payload;
    },
    // ... other reducers
  },
});
```

### Phase 6: Services Layer

#### 6.1 Create API Services
```tsx
// src/services/api/vocabularyApi.ts
import { VocabularyItem } from '../../components/features/vocabulary';

export const vocabularyApi = {
  async getVocabularyByLesson(lessonId: string): Promise<VocabularyItem[]> {
    const response = await fetch(`/api/lessons/${lessonId}/vocabulary`);
    return response.json();
  },
  
  async playAudio(audioUrl: string): Promise<void> {
    // Audio implementation
  }
};
```

## 🔧 Migration Scripts

### Automated Import Updates
```bash
#!/bin/bash
# migrate-imports.sh

echo "🔄 Updating import statements..."

# Update Button imports
find src/ -name "*.tsx" -type f -exec sed -i '' 's/from.*components\/common\/Button/from "..\/components\/ui\/atoms\/Button"/g' {} +

# Update VocabularyCard imports  
find src/ -name "*.tsx" -type f -exec sed -i '' 's/from.*components\/lessons\/VocabularyCard/from "..\/components\/features\/vocabulary"/g' {} +

# Update theme imports
find src/ -name "*.tsx" -type f -exec sed -i '' 's/from.*theme$/from "..\/theme"/g' {} +

echo "✅ Import statements updated!"
```

### Component Analysis Script
```bash
#!/bin/bash
# analyze-components.sh

echo "📊 Analyzing component usage..."

echo "Old component imports:"
grep -r "from.*components/common" src/ --include="*.tsx" | wc -l
grep -r "from.*components/lessons" src/ --include="*.tsx" | wc -l

echo "Hardcoded styles to migrate:"
grep -r "fontSize.*[0-9]" src/ --include="*.tsx" | wc -l
grep -r "padding.*[0-9]" src/ --include="*.tsx" | wc -l
grep -r "color.*#" src/ --include="*.tsx" | wc -l
```

## 🧪 Testing Migration

### 1. Component Testing
```tsx
// Test new VocabularyCard
import { render } from '@testing-library/react-native';
import { VocabularyCard } from '../components/features/vocabulary';

const mockVocabulary = {
  id: '1',
  hanzi: '你好',
  pinyin: 'nǐ hǎo',
  tone: 3,
  vietnamese: 'Xin chào',
  english: 'Hello',
  difficulty: 'beginner' as const,
  category: 'greetings',
  lessonId: 'lesson-1'
};

test('VocabularyCard renders correctly', () => {
  const { getByText } = render(
    <VocabularyCard vocabulary={mockVocabulary} />
  );
  
  expect(getByText('你好')).toBeTruthy();
  expect(getByText('nǐ hǎo')).toBeTruthy();
  expect(getByText('Xin chào')).toBeTruthy();
});
```

### 2. Responsive Testing
```tsx
// Test responsive behavior
import { Layout } from '../theme/responsive';

test('Components adapt to different screen sizes', () => {
  // Mock different screen sizes
  Layout.isMobile = true;
  // ... test mobile layout
  
  Layout.isTablet = true;
  // ... test tablet layout
});
```

## 📈 Success Metrics

### Before Migration
- [ ] Document current bundle size
- [ ] Record current render performance
- [ ] Note current component count

### After Migration  
- [ ] Bundle size comparison
- [ ] Performance benchmarks
- [ ] Code maintainability score
- [ ] Team productivity metrics

## 🚨 Rollback Plan

If migration fails:
1. `git checkout main` to revert changes
2. Restore previous component structure
3. Remove new folders: `rm -rf src/components/ui src/components/features`
4. Restart development server

## 📞 Support

For migration issues:
- Check Architecture Guide: `docs/ARCHITECTURE.md`
- Review component examples in `src/components/ui/atoms/`
- Test with existing screens before full migration

**Remember:** Migrate incrementally, test frequently, and maintain backward compatibility during transition. 