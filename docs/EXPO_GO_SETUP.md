# 🚧 Expo Go Speech Recognition Setup Guide

## 📱 **TẤT CẢ THÔNG TIN VỀ EXPO GO**

### 🔍 **Vấn đề với Expo Go**

Expo Go **KHÔNG SUPPORT** native modules như:
- `@react-native-community/voice`
- `expo-av` (deprecated)
- Bất kỳ native module nào khác

### ✅ **GIẢI PHÁP HIỆN TẠI**

Chúng ta đã implement **3-tier fallback system**:

```tsx
// 🌐 Web Browser
if (Platform.OS === 'web') {
  return <SpeechRecognitionComponent />; // Web Speech API
}

// 📱 Mobile Development Build  
else if (hasNativeModules) {
  return <NativeSpeechRecognitionComponent />; // Native modules
}

// 🚧 Expo Go Fallback
else {
  return <ExpoGoSpeechRecognitionComponent />; // Mock simulation
}
```

---

## 🎯 **3 CÁCH SỬ DỤNG**

### 1. **💻 Web Development (Hoạt động 100%)**
```bash
# Start web development
npx expo start --web

# Features:
✅ Web Speech API
✅ Real speech recognition  
✅ Chinese pronunciation evaluation
✅ Full functionality
```

### 2. **📱 Development Build (Hoạt động 100%)**
```bash
# iOS Development Build
npx expo run:ios

# Android Development Build  
npx expo run:android

# Features:
✅ Native Speech Recognition
✅ Real microphone access
✅ Chinese pronunciation evaluation
✅ Full functionality
```

### 3. **🚧 Expo Go (Mô phỏng cho development)**
```bash
# Start with Expo Go
npx expo start

# Features:
⚠️  Mock speech recognition
⚠️  Simulated transcripts
⚠️  Development notifications
⚠️  Testing UI/UX only
```

---

## 🛠️ **EXPO GO MOCK FEATURES**

### 📝 **Mock Transcripts**
```tsx
const mockTranscripts = [
  '你好',           // Xin chào
  '你好世界',       // Xin chào thế giới  
  '我是学生',       // Tôi là học sinh
  '我在学习中文',   // Tôi đang học tiếng Trung
  '今天天气很好',   // Hôm nay thời tiết đẹp
  '谢谢你的帮助',   // Cảm ơn sự giúp đỡ của bạn
];
```

### 🎭 **Simulation Process**
1. User clicks "Mô phỏng ghi âm"
2. Alert shows development notice
3. Random Chinese text appears character by character
4. Pronunciation evaluation runs on mock text
5. Results displayed with scores

### 🎨 **Visual Feedback**
```tsx
// Development Notice Box
🚧 Chế độ phát triển - Speech Recognition được mô phỏng
Để test thật: npx expo run:ios hoặc npx expo run:android

// Mock Transcript Display  
Bạn đã nói (mô phỏng): 你好世界
(đang mô phỏng...)

// Evaluation Results
Kết quả đánh giá: 85%
Tốt! Tiếp tục luyện tập!
```

---

## 🚀 **DEVELOPMENT WORKFLOW**

### 📋 **Recommended Process**

1. **🎨 UI/UX Development** (Expo Go)
   ```bash
   npx expo start
   # Test layouts, navigation, styling
   # Mock speech recognition for UI testing
   ```

2. **🌐 Web Testing** (Full Features)
   ```bash
   npx expo start --web
   # Test real speech recognition
   # Chinese pronunciation evaluation
   # Full feature testing
   ```

3. **📱 Mobile Testing** (Production Ready)
   ```bash
   npx expo run:ios     # iOS testing
   npx expo run:android # Android testing
   # Final testing before release
   ```

### ⚡ **Quick Commands**
```bash
# Kill previous processes (ALWAYS run first)
pkill -f expo && pkill -f metro

# Start development
npx expo start --clear           # Expo Go (mock)
npx expo start --web --clear     # Web (real)
npx expo run:ios --clear         # iOS (real)
npx expo run:android --clear     # Android (real)
```

---

## 🔧 **TROUBLESHOOTING**

### ❌ **Common Errors in Expo Go**

#### **Error: "Native module doesn't exist"**
```
✅ EXPECTED - This is normal in Expo Go
✅ Solution: Use web or development build
```

#### **Error: "expo-av deprecated"**
```bash
✅ FIXED - Removed expo-av, using expo-audio
npm uninstall expo-av
npm install expo-audio
```

#### **Error: "Voice module not available"**
```
✅ EXPECTED - Native modules not in Expo Go
✅ Solution: App automatically uses mock fallback
```

### 🔄 **Reset Commands**
```bash
# Complete reset
pkill -f expo && pkill -f metro
rm -rf node_modules
npm install
npx expo install --fix
npx expo start --clear
```

---

## 📊 **FEATURE COMPARISON**

| Feature | Web | Development Build | Expo Go |
|---------|-----|------------------|----------|
| Speech Recognition | ✅ Real | ✅ Real | 🚧 Mock |
| Microphone Access | ✅ Yes | ✅ Yes | ❌ No |
| Chinese Evaluation | ✅ Yes | ✅ Yes | ✅ Yes* |
| UI/UX Testing | ✅ Yes | ✅ Yes | ✅ Yes |
| Production Ready | ✅ Yes | ✅ Yes | ❌ No |

*Evaluation runs on mock data

---

## 🎯 **NEXT STEPS**

### 🏗️ **For Production**
1. Build development build: `npx expo run:ios`
2. Test real speech recognition
3. Build production app: `eas build`

### 🧪 **For Development**
1. Use Expo Go for UI/UX
2. Use web for real speech testing  
3. Use development build for final testing

### 📱 **For Users**
- App Store/Play Store builds will have full functionality
- No limitations in production builds
- Native speech recognition works perfectly

---

## 💡 **PRO TIPS**

### 🎨 **Design in Expo Go**
```tsx
// Test all UI states
<ExpoGoSpeechRecognitionComponent 
  expectedText="你好世界"
  showExpectedText={true}
  autoEvaluate={true}
/>
```

### 🌐 **Validate in Web**
```bash
npx expo start --web
# Test real speech recognition
# Validate Chinese pronunciation
```

### 📱 **Ship with Development Build**
```bash
npx expo run:ios --device
# Test on real device
# Validate native speech recognition
```

---

## 🚨 **IMPORTANT NOTES**

1. **Expo Go = Development Only**
   - Mock speech recognition
   - UI/UX testing only
   - Not for production testing

2. **Web = Full Features**  
   - Real Web Speech API
   - Chinese pronunciation evaluation
   - Production-ready testing

3. **Development Build = Production Ready**
   - Native speech recognition
   - Real microphone access
   - Final testing environment

4. **Auto-Detection**
   - App automatically chooses correct component
   - No manual configuration needed
   - Graceful fallbacks everywhere

**Remember: Expo Go chỉ để test UI/UX. Để test Speech Recognition thật, dùng Web hoặc Development Build! 🎯** 