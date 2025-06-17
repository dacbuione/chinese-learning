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

# 🎤 Hướng Dẫn Sử Dụng Speech Recognition

## 📱 **TÍNH NĂNG MỚI: NHẬN DIỆN GIỌNG NÓI**

Chúc mừng! Ứng dụng Chinese Learning App đã được tích hợp **Speech Recognition** hoàn toàn **MIỄN PHÍ** để giúp bạn luyện phát âm tiếng Trung hiệu quả hơn.

---

## 🚀 **CÁC TÍNH NĂNG CHÍNH**

### 1. 🎯 **Nhận Diện Giọng Nói Real-time**
- **Công nghệ**: Web Speech API (Chrome/Edge)
- **Ngôn ngữ hỗ trợ**: Tiếng Trung (zh-CN), Tiếng Việt (vi-VN)
- **Thời gian**: Tối đa 30 giây cho mỗi lần đọc
- **Độ chính xác**: 85-95% với phát âm chuẩn

### 2. 📊 **Đánh Giá Phát Âm Chi Tiết**
- **Độ chính xác từ**: Phân tích từng ký tự tiếng Trung
- **Thanh điệu**: Đánh giá độ chính xác thanh điệu (声调)
- **Trôi chảy**: Đánh giá tốc độ và sự mượt mà
- **Điểm tổng**: Từ 0-100% với feedback cụ thể

### 3. 💡 **Gợi Ý Cải Thiện**
- Phân tích lỗi phát âm phổ biến
- Đưa ra lời khuyên cụ thể
- Hướng dẫn luyện tập hiệu quả

---

## 📖 **CÁCH SỬ DỤNG**

### **Bước 1: Truy cập Reading Practice**
```
1. Mở ứng dụng Chinese Learning App
2. Chọn tab "Practice" (Luyện tập)
3. Chọn "Reading" (Đọc hiểu)
4. Chọn bài đọc bất kỳ
```

### **Bước 2: Chuyển sang Tab "Đọc to"**
```
1. Trong màn hình Reading Practice
2. Nhấn tab "Đọc to" (biểu tượng microphone)
3. Bạn sẽ thấy giao diện Speech Recognition
```

### **Bước 3: Bắt đầu Luyện Phát Âm**
```
1. Đọc văn bản tiếng Trung hiển thị
2. Nhấn "Bắt đầu ghi âm"
3. Cho phép truy cập microphone (lần đầu)
4. Đọc to và rõ ràng
5. Nhấn "Dừng ghi âm" hoặc chờ tự động dừng
6. Xem kết quả đánh giá
```

---

## 🎯 **TIPS LUYỆN TẬP HIỆU QUẢ**

### **1. Chuẩn Bị Trước Khi Đọc**
```
✅ Đọc thầm 1-2 lần để hiểu nội dung
✅ Chú ý pinyin và thanh điệu
✅ Đảm bảo môi trường yên tĩnh
✅ Microphone hoạt động tốt
```

### **2. Kỹ Thuật Đọc**
```
✅ Đọc chậm và rõ ràng
✅ Nhấn mạnh thanh điệu
✅ Tạm dừng giữa các câu
✅ Phát âm đầy đủ từng từ
```

### **3. Xử Lý Kết Quả**
```
📊 Điểm 90-100%: Xuất sắc! Tiếp tục duy trì
📊 Điểm 75-89%: Tốt! Luyện thêm thanh điệu
📊 Điểm 50-74%: Khá! Đọc chậm hơn
📊 Điểm <50%: Cần cải thiện, nghe và bắt chước
```

---

## 🔧 **YÊU CẦU HỆ THỐNG**

### **Trình Duyệt Hỗ Trợ**
- ✅ **Chrome** (Khuyến nghị - độ chính xác cao nhất)
- ✅ **Microsoft Edge** (Hỗ trợ tốt)
- ✅ **Safari** (iOS/macOS - hỗ trợ cơ bản)
- ❌ **Firefox** (Chưa hỗ trợ Web Speech API)

### **Thiết Bị**
- 📱 **Mobile**: iOS 14+, Android 8+
- 💻 **Desktop**: Windows 10+, macOS 10.15+
- 🎤 **Microphone**: Bất kỳ (tích hợp hoặc rời)

### **Kết Nối**
- 🌐 **Internet**: Cần kết nối ổn định
- 📶 **Tốc độ**: Tối thiểu 1 Mbps

---

## 🚨 **XỬ LÝ SỰ CỐ**

### **Lỗi Thường Gặp & Cách Fix**

#### **1. "Trình duyệt không hỗ trợ"**
```
🔧 Giải pháp:
- Sử dụng Chrome hoặc Edge
- Cập nhật trình duyệt lên phiên bản mới nhất
- Kiểm tra JavaScript có được bật không
```

#### **2. "Cần quyền truy cập microphone"**
```
🔧 Giải pháp:
- Nhấn "Allow" khi được hỏi
- Kiểm tra cài đặt privacy trong trình duyệt
- Reload trang và thử lại
```

#### **3. "Không phát hiện giọng nói"**
```
🔧 Giải pháp:
- Kiểm tra microphone hoạt động
- Nói to hơn và rõ ràng hơn
- Giảm tiếng ồn xung quanh
- Thử lại với câu ngắn hơn
```

#### **4. "Lỗi kết nối mạng"**
```
🔧 Giải pháp:
- Kiểm tra kết nối internet
- Thử reload trang
- Chuyển sang WiFi nếu đang dùng 4G
```

#### **5. "Độ chính xác thấp"**
```
🔧 Giải pháp:
- Đọc chậm hơn
- Phát âm rõ ràng từng từ
- Chú ý thanh điệu tiếng Trung
- Luyện tập với câu ngắn trước
```

---

## 📊 **HIỂU KẾT QUẢ ĐÁNH GIÁ**

### **Các Chỉ Số Quan Trọng**

#### **1. Điểm Tổng (0-100%)**
- Đánh giá tổng thể độ chính xác phát âm
- Kết hợp tất cả yếu tố: từ, thanh điệu, trôi chảy

#### **2. Độ Chính Xác Từ**
- Phân tích từng ký tự tiếng Trung
- So sánh với text gốc
- Phát hiện từ bị đọc sai hoặc bỏ sót

#### **3. Thanh Điệu (声调)**
- Đánh giá 4 thanh điệu cơ bản
- Phát hiện lỗi thanh điệu phổ biến
- Quan trọng nhất trong tiếng Trung

#### **4. Trôi Chảy**
- Tốc độ đọc phù hợp
- Độ mượt mà giữa các từ
- Thời gian phản hồi

### **Mức Đánh Giá**
```
🏆 EXCELLENT (90-100%): Phát âm xuất sắc
👍 GOOD (75-89%): Phát âm tốt
👌 FAIR (50-74%): Phát âm khá, cần cải thiện
💪 POOR (<50%): Cần luyện tập nhiều hơn
```

---

## 🎓 **LỘ TRÌNH LUYỆN TẬP**

### **Tuần 1-2: Làm Quen**
```
🎯 Mục tiêu: Đạt 60% accuracy
📚 Nội dung: Câu đơn giản 5-10 từ
⏰ Thời gian: 15 phút/ngày
🔄 Lặp lại: Mỗi câu 3-5 lần
```

### **Tuần 3-4: Phát Triển**
```
🎯 Mục tiêu: Đạt 75% accuracy
📚 Nội dung: Đoạn văn ngắn 20-30 từ
⏰ Thời gian: 20 phút/ngày
🔄 Lặp lại: Mỗi đoạn 2-3 lần
```

### **Tuần 5-8: Thành Thạo**
```
🎯 Mục tiêu: Đạt 85% accuracy
📚 Nội dung: Đoạn văn dài 50+ từ
⏰ Thời gian: 30 phút/ngày
🔄 Lặp lại: Đọc liền mạch
```

### **Tuần 9+: Hoàn Thiện**
```
🎯 Mục tiêu: Đạt 90%+ accuracy
📚 Nội dung: Bài đọc phức tạp
⏰ Thời gian: 45 phút/ngày
🔄 Lặp lại: Tập trung vào tốc độ
```

---

## 🏆 **THÀNH TÍCH & ĐỘNG LỰC**

### **Theo Dõi Tiến Độ**
- 📈 Biểu đồ accuracy theo thời gian
- 🎯 Streak ngày luyện tập liên tiếp
- 🏅 Badges thành tích đặc biệt
- 📊 So sánh với người dùng khác

### **Mục Tiêu Hàng Ngày**
- 🎤 Đọc ít nhất 5 câu/ngày
- 📊 Duy trì accuracy >75%
- ⏰ Luyện tập 15 phút/ngày
- 🔄 Cải thiện 1% mỗi tuần

---

## 🆘 **HỖ TRỢ & LIÊN HỆ**

### **Cần Thêm Hỗ Trợ?**
- 📧 Email: support@chineselearningapp.com
- 💬 Chat: Trong ứng dụng
- 📚 FAQ: Phần Help trong app
- 🎥 Video tutorials: YouTube channel

### **Feedback & Đề Xuất**
- ⭐ Rate app trên App Store/Google Play
- 💡 Gửi ý kiến qua app feedback
- 🐛 Báo lỗi qua bug report
- 🚀 Đề xuất tính năng mới

---

## 🔮 **TÍNH NĂNG SẮP TỚI**

### **Version 2.0 (Coming Soon)**
- 🎯 **Tone Recognition**: Phân tích chi tiết từng thanh điệu
- 🗣️ **Conversation Practice**: Luyện đối thoại với AI
- 📝 **Writing Integration**: Kết hợp viết và đọc
- 🎮 **Gamification**: Thêm game phát âm

### **Version 3.0 (Future)**
- 🤖 **AI Teacher**: Giáo viên AI cá nhân hóa
- 🌍 **Offline Mode**: Hoạt động không cần internet
- 📱 **Watch App**: Luyện tập trên Apple Watch
- 👥 **Social Features**: Luyện tập cùng bạn bè

---

**🎉 Chúc bạn luyện tập hiệu quả và tiến bộ nhanh chóng với Speech Recognition!**

*Developed with ❤️ by Chinese Learning App Team* 