# 🎵 Hướng Dẫn Tích Hợp Google Cloud Text-to-Speech

## 📋 **TỔNG QUAN TÍCH HỢP**

Hệ thống TTS đã được tích hợp hoàn chỉnh vào ứng dụng học tiếng Trung với các tính năng:

### ✅ **Đã Hoàn Thành**
- ✅ Google Cloud TTS Service với SSML support
- ✅ Audio Player Service với caching
- ✅ React Hooks (useTTS, useVocabularyTTS, usePronunciationTTS)
- ✅ AudioButton Components với visual feedback
- ✅ Tích hợp vào Pronunciation Practice screen
- ✅ Error handling và fallback mechanisms
- ✅ Responsive design cho tất cả devices

### 🔧 **Cần Setup**
- 🔧 Google Cloud Project và API key
- 🔧 Environment variables
- 🔧 Dependencies installation

---

## 🚀 **BƯỚC 1: SETUP GOOGLE CLOUD**

### 1.1 Tạo Google Cloud Project
```bash
# 1. Truy cập: https://console.cloud.google.com/
# 2. Tạo project mới: "chinese-learning-app"
# 3. Enable billing account
# 4. Enable Text-to-Speech API
```

### 1.2 Tạo Service Account
```bash
# 1. Vào APIs & Services → Credentials
# 2. Create Credentials → Service account
# 3. Name: "tts-service-account"
# 4. Role: "Cloud Text-to-Speech User"
# 5. Download JSON key file
```

### 1.3 Setup Environment
```bash
# Tạo file .env trong root project
GOOGLE_CLOUD_PROJECT_ID=your-project-id
GOOGLE_CLOUD_KEYFILE_PATH=./google-cloud-key.json
TTS_CACHE_SIZE=100
TTS_DEFAULT_LANGUAGE=zh-CN
TTS_DEFAULT_VOICE=zh-CN-Wavenet-A
```

---

## 🛠️ **BƯỚC 2: CÀI ĐẶT DEPENDENCIES**

### 2.1 Install Required Packages
```bash
npm install @google-cloud/text-to-speech
npm install @react-native-async-storage/async-storage
npm install expo-av
npm install expo-file-system
```

### 2.2 Setup Expo Audio
```bash
# Thêm vào app.json
{
  "expo": {
    "plugins": [
      [
        "expo-av",
        {
          "microphonePermission": "Allow $(PRODUCT_NAME) to access your microphone."
        }
      ]
    ]
  }
}
```

---

## 🎯 **BƯỚC 3: SỬ DỤNG TTS TRONG COMPONENTS**

### 3.1 Basic Usage với useTTS Hook
```tsx
import { useTTS } from '../hooks/useTTS';

function MyComponent() {
  const [ttsState, ttsControls] = useTTS();
  
  const handleSpeak = async () => {
    await ttsControls.speak('你好', {
      language: 'zh-CN',
      speed: 1.0,
    });
  };
  
  return (
    <Button 
      title={ttsState.isLoading ? 'Loading...' : 'Speak'}
      onPress={handleSpeak}
      disabled={ttsState.isLoading}
    />
  );
}
```

### 3.2 Chinese-specific với useVocabularyTTS
```tsx
import { useVocabularyTTS } from '../hooks/useTTS';

function VocabularyCard({ hanzi, pinyin, tone }) {
  const { speakVocabulary, isLoading, isPlaying } = useVocabularyTTS();
  
  const handleSpeak = async () => {
    await speakVocabulary(hanzi, pinyin, tone, 1.0);
  };
  
  return (
    <TouchableOpacity onPress={handleSpeak}>
      <Text>{hanzi}</Text>
      <Text>{pinyin}</Text>
      {isLoading && <ActivityIndicator />}
    </TouchableOpacity>
  );
}
```

### 3.3 Sử dụng AudioButton Components
```tsx
import { VocabularyAudioButton, PronunciationAudioButton } from '../components/common/AudioButton';

// Trong vocabulary card
<VocabularyAudioButton
  hanzi="你好"
  pinyin="nǐ hǎo"
  tone={3}
  size="medium"
/>

// Trong pronunciation practice
<PronunciationAudioButton
  hanzi="你好"
  pinyin="nǐ hǎo"
  tone={3}
  size="large"
/>
```

---

## 🎨 **BƯỚC 4: CUSTOMIZATION**

### 4.1 Thêm Voice Options
```tsx
// Trong GoogleTTSService.ts
const chineseVoices = {
  'female-standard': 'zh-CN-Standard-A',
  'female-wavenet': 'zh-CN-Wavenet-A',
  'male-standard': 'zh-CN-Standard-B',
  'male-wavenet': 'zh-CN-Wavenet-B',
};
```

### 4.2 Custom SSML cho Thanh Điệu
```tsx
// Tự động tạo SSML với tone marks
const ssmlText = `
  <speak>
    <prosody rate="0.8" pitch="+2st">
      <phoneme alphabet="ipa" ph="ni˨˩˦ xaʊ˨˩˦">
        你好
      </phoneme>
    </prosody>
  </speak>
`;
```

### 4.3 Advanced Caching Strategy
```tsx
// Cache theo HSK level và frequency
const cacheKey = `${hanzi}_${pinyin}_${tone}_${hskLevel}`;
const priority = getWordFrequency(hanzi); // High frequency = higher cache priority
```

---

## 📊 **BƯỚC 5: MONITORING & OPTIMIZATION**

### 5.1 Cost Monitoring
```tsx
// Track usage để không vượt quá free tier
const usageTracker = {
  charactersThisMonth: 0,
  maxFreeCharacters: 1000000, // 1M free per month
  
  trackUsage(text: string) {
    this.charactersThisMonth += text.length;
    if (this.charactersThisMonth > this.maxFreeCharacters * 0.9) {
      console.warn('⚠️ Approaching TTS usage limit');
    }
  }
};
```

### 5.2 Performance Optimization
```tsx
// Preload common words
const commonWords = ['你好', '谢谢', '再见', '对不起'];
useEffect(() => {
  commonWords.forEach(word => {
    // Preload vào cache
    ttsService.synthesize(word, { language: 'zh-CN' });
  });
}, []);
```

### 5.3 Error Handling Strategy
```tsx
const handleTTSError = (error: Error) => {
  if (error.message.includes('quota')) {
    // Switch to Web Speech API
    return synthesizeWithWebSpeech(text);
  } else if (error.message.includes('network')) {
    // Retry with exponential backoff
    return retryWithBackoff(() => synthesize(text));
  } else {
    // Log error và show user-friendly message
    console.error('TTS Error:', error);
    showToast('Không thể phát âm. Vui lòng thử lại.');
  }
};
```

---

## 🧪 **BƯỚC 6: TESTING**

### 6.1 Test TTS Service
```tsx
// Test basic functionality
describe('GoogleTTSService', () => {
  it('should synthesize Chinese text', async () => {
    const result = await googleTTSService.synthesize('你好', {
      language: 'zh-CN'
    });
    
    expect(result.audioContent).toBeDefined();
    expect(result.source).toBe('google-tts');
  });
  
  it('should handle tone marks correctly', async () => {
    const result = await googleTTSService.synthesizeChinese({
      hanzi: '你好',
      pinyin: 'ni hao',
      tone: 3,
    });
    
    expect(result.audioContent).toBeDefined();
  });
});
```

### 6.2 Test Audio Playback
```tsx
// Test audio player
describe('AudioPlayerService', () => {
  it('should play audio from base64', async () => {
    const mockBase64 = 'mock-audio-content';
    
    await audioPlayerService.playFromBase64('test-id', mockBase64);
    
    const state = audioPlayerService.getAudioState('test-id');
    expect(state?.isPlaying).toBe(true);
  });
});
```

---

## 🚨 **TROUBLESHOOTING**

### Common Issues & Solutions

#### 1. **Google Cloud Authentication Error**
```bash
Error: Could not load the default credentials
```
**Solution:**
- Kiểm tra file `google-cloud-key.json` có tồn tại
- Verify environment variables đúng
- Ensure service account có đúng permissions

#### 2. **Audio Playback Error**
```bash
Error: Unable to play audio
```
**Solution:**
- Check expo-av installation
- Verify audio permissions
- Test trên device thật (không phải simulator)

#### 3. **TTS Quota Exceeded**
```bash
Error: Quota exceeded for quota metric
```
**Solution:**
- Monitor usage trong Google Cloud Console
- Implement fallback to Web Speech API
- Optimize caching strategy

#### 4. **Network Timeout**
```bash
Error: Request timeout
```
**Solution:**
- Implement retry mechanism
- Add network connectivity check
- Cache frequently used audio

---

## 📈 **PERFORMANCE METRICS**

### Expected Performance
- **First TTS call**: 2-3 seconds (network + synthesis)
- **Cached audio**: <100ms (instant playback)
- **Memory usage**: ~50MB for 100 cached audio files
- **Network usage**: ~10KB per TTS request

### Optimization Targets
- **Cache hit rate**: >80% for common vocabulary
- **Error rate**: <1% for TTS requests
- **User satisfaction**: >95% audio quality rating

---

## 🔄 **NEXT STEPS**

### Phase 1: Basic Integration ✅
- [x] Setup Google Cloud TTS
- [x] Create TTS service layer
- [x] Implement audio playback
- [x] Add React hooks
- [x] Create UI components

### Phase 2: Advanced Features (Upcoming)
- [ ] Voice selection (male/female)
- [ ] Speed control UI
- [ ] Offline TTS capability
- [ ] Custom voice training
- [ ] Pronunciation scoring

### Phase 3: Production Optimization
- [ ] CDN for audio caching
- [ ] Advanced analytics
- [ ] A/B testing for voice quality
- [ ] Multi-region deployment

---

## 💡 **BEST PRACTICES**

1. **Always handle errors gracefully**
2. **Implement progressive enhancement** (Web Speech → Google TTS)
3. **Cache aggressively** for common vocabulary
4. **Monitor usage** to stay within free tier
5. **Test on real devices** for audio quality
6. **Provide visual feedback** during loading
7. **Respect user preferences** (volume, speed)
8. **Optimize for offline usage** when possible

---

## 📞 **SUPPORT**

Nếu gặp vấn đề trong quá trình tích hợp:

1. **Check logs** trong console
2. **Verify setup** theo checklist
3. **Test components** riêng lẻ
4. **Review documentation** của Google Cloud TTS
5. **Contact support** nếu cần thiết

**Chúc bạn tích hợp thành công! 🎉** 