# ✅ Checklist Setup Google Cloud Text-to-Speech

## 📋 **CHECKLIST HOÀN CHỈNH**

### 🔧 **PHASE 1: GOOGLE CLOUD SETUP**

#### ☐ 1.1 Tạo Google Cloud Account
- [ ] Truy cập https://console.cloud.google.com/
- [ ] Đăng nhập bằng Google account
- [ ] Chấp nhận Terms of Service
- [ ] Verify phone number (nếu cần)

#### ☐ 1.2 Tạo Project
- [ ] Click "Select a project" → "NEW PROJECT"
- [ ] Project name: `chinese-learning-app`
- [ ] Project ID: `chinese-learning-app-[random]` (ghi lại ID này)
- [ ] Location: Để mặc định
- [ ] Click "CREATE"

#### ☐ 1.3 Enable Billing
- [ ] Vào Navigation Menu (☰) → "Billing"
- [ ] Click "Link a billing account"
- [ ] Tạo billing account mới hoặc chọn existing
- [ ] **Lưu ý**: Có $300 credit miễn phí + 1M ký tự TTS/tháng

#### ☐ 1.4 Enable Text-to-Speech API
- [ ] Vào Navigation Menu (☰) → "APIs & Services" → "Library"
- [ ] Tìm kiếm: "Cloud Text-to-Speech API"
- [ ] Click vào "Cloud Text-to-Speech API"
- [ ] Click "ENABLE"
- [ ] Đợi 2-3 phút để API được kích hoạt

#### ☐ 1.5 Tạo Service Account
- [ ] Vào "APIs & Services" → "Credentials"
- [ ] Click "+ CREATE CREDENTIALS" → "Service account"
- [ ] Service account name: `tts-service-account`
- [ ] Service account ID: `tts-service-account`
- [ ] Description: `Text-to-Speech service for Chinese Learning App`
- [ ] Click "CREATE AND CONTINUE"

#### ☐ 1.6 Grant Permissions
- [ ] Role: Chọn "Cloud Text-to-Speech User"
- [ ] Click "CONTINUE"
- [ ] Click "DONE"

#### ☐ 1.7 Download API Key
- [ ] Click vào service account vừa tạo
- [ ] Vào tab "KEYS"
- [ ] Click "ADD KEY" → "Create new key"
- [ ] Format: Chọn "JSON"
- [ ] Click "CREATE"
- [ ] **QUAN TRỌNG**: Lưu file JSON an toàn

---

### 🛠️ **PHASE 2: PROJECT SETUP**

#### ☐ 2.1 Setup Environment Variables
- [ ] Copy file JSON vào thư mục project
- [ ] Rename thành `google-cloud-key.json`
- [ ] Tạo file `.env` trong root:
```env
GOOGLE_CLOUD_PROJECT_ID=chinese-learning-app-[your-id]
GOOGLE_CLOUD_KEYFILE_PATH=./google-cloud-key.json
TTS_CACHE_SIZE=100
TTS_DEFAULT_LANGUAGE=zh-CN
TTS_DEFAULT_VOICE=zh-CN-Wavenet-A
```

#### ☐ 2.2 Update .gitignore
- [ ] Thêm vào `.gitignore`:
```gitignore
# Google Cloud credentials
google-cloud-key.json
.env
```

#### ☐ 2.3 Install Dependencies
- [ ] Chạy: `npm install @google-cloud/text-to-speech`
- [ ] Chạy: `npm install @react-native-async-storage/async-storage`
- [ ] Chạy: `npm install expo-av`
- [ ] Chạy: `npm install expo-file-system`

#### ☐ 2.4 Update app.json
- [ ] Thêm expo-av plugin:
```json
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

### 🧪 **PHASE 3: TESTING SETUP**

#### ☐ 3.1 Test Google Cloud Connection
- [ ] Chạy command test:
```bash
curl -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "input": {"text": "你好"},
    "voice": {"languageCode": "zh-CN", "name": "zh-CN-Wavenet-A"},
    "audioConfig": {"audioEncoding": "MP3"}
  }' \
  "https://texttospeech.googleapis.com/v1/text:synthesize"
```
- [ ] Verify response có `audioContent` field

#### ☐ 3.2 Test trong App
- [ ] Start app: `npx expo start --clear`
- [ ] Navigate to Pronunciation Practice
- [ ] Click audio button
- [ ] Verify audio plays correctly

#### ☐ 3.3 Test Error Handling
- [ ] Temporarily disable internet
- [ ] Try playing audio
- [ ] Verify fallback mechanism works

---

### 📊 **PHASE 4: MONITORING SETUP**

#### ☐ 4.1 Setup Billing Alerts
- [ ] Vào "Billing" → "Budgets & alerts"
- [ ] Click "CREATE BUDGET"
- [ ] Budget amount: $10/month
- [ ] Alert thresholds: 50%, 90%, 100%
- [ ] Email notifications: Enable

#### ☐ 4.2 Monitor API Usage
- [ ] Vào "APIs & Services" → "Quotas"
- [ ] Tìm "Cloud Text-to-Speech API"
- [ ] Monitor "Characters per month" (limit: 1M free)

#### ☐ 4.3 Setup Logging
- [ ] Vào "Logging" → "Logs Explorer"
- [ ] Filter: `resource.type="cloud_function"`
- [ ] Monitor TTS requests và errors

---

### 🔒 **PHASE 5: SECURITY CHECKLIST**

#### ☐ 5.1 API Key Security
- [ ] ✅ File `google-cloud-key.json` KHÔNG được commit
- [ ] ✅ File `.env` KHÔNG được commit
- [ ] ✅ API key chỉ có permissions cần thiết
- [ ] ✅ Service account chỉ có role "Cloud Text-to-Speech User"

#### ☐ 5.2 Access Control
- [ ] Review IAM permissions
- [ ] Ensure principle of least privilege
- [ ] Set up key rotation schedule (3-6 months)

---

### 🚀 **PHASE 6: PRODUCTION READINESS**

#### ☐ 6.1 Performance Optimization
- [ ] Enable caching trong TTS service
- [ ] Test cache hit rates
- [ ] Optimize audio file sizes
- [ ] Test on slow networks

#### ☐ 6.2 Error Handling
- [ ] Test quota exceeded scenario
- [ ] Test network timeout
- [ ] Test invalid API key
- [ ] Verify fallback mechanisms

#### ☐ 6.3 User Experience
- [ ] Test loading states
- [ ] Test audio quality on different devices
- [ ] Test accessibility features
- [ ] Test offline behavior

---

## 🎯 **VERIFICATION TESTS**

### ✅ **Final Verification Checklist**

#### Test 1: Basic TTS Functionality
- [ ] Open app
- [ ] Go to Pronunciation Practice
- [ ] Click audio button for "你好"
- [ ] ✅ Audio plays correctly
- [ ] ✅ Loading indicator shows
- [ ] ✅ Button state changes

#### Test 2: Caching
- [ ] Play same audio twice
- [ ] ✅ Second play is instant (cached)
- [ ] Check console logs for cache hit

#### Test 3: Error Handling
- [ ] Disable internet
- [ ] Try playing audio
- [ ] ✅ Error message shows
- [ ] ✅ Fallback mechanism activates

#### Test 4: Different Devices
- [ ] Test on iOS device
- [ ] Test on Android device
- [ ] Test on web browser
- [ ] ✅ Audio works on all platforms

#### Test 5: Performance
- [ ] Monitor memory usage
- [ ] Check audio quality
- [ ] Test with multiple simultaneous audio
- [ ] ✅ No memory leaks
- [ ] ✅ Smooth performance

---

## 🚨 **TROUBLESHOOTING GUIDE**

### ❌ **Common Issues**

#### Issue 1: "Could not load default credentials"
**Symptoms:** TTS service fails to initialize
**Solutions:**
- [ ] Check `google-cloud-key.json` exists
- [ ] Verify `.env` file has correct PROJECT_ID
- [ ] Ensure file path is correct
- [ ] Restart development server

#### Issue 2: "Audio playback failed"
**Symptoms:** Audio button doesn't play sound
**Solutions:**
- [ ] Check device volume
- [ ] Test on real device (not simulator)
- [ ] Verify expo-av installation
- [ ] Check audio permissions

#### Issue 3: "Quota exceeded"
**Symptoms:** TTS requests fail after many uses
**Solutions:**
- [ ] Check usage in Google Cloud Console
- [ ] Implement caching to reduce requests
- [ ] Consider upgrading to paid tier
- [ ] Use Web Speech API fallback

#### Issue 4: "Network timeout"
**Symptoms:** TTS requests take too long
**Solutions:**
- [ ] Check internet connection
- [ ] Implement retry mechanism
- [ ] Add request timeout
- [ ] Cache common phrases

---

## 📞 **SUPPORT CONTACTS**

### 🆘 **Need Help?**

1. **Google Cloud Support**
   - Documentation: https://cloud.google.com/text-to-speech/docs
   - Community: https://stackoverflow.com/questions/tagged/google-cloud-text-to-speech

2. **Expo Support**
   - Documentation: https://docs.expo.dev/versions/latest/sdk/av/
   - Community: https://forums.expo.dev/

3. **Project Issues**
   - Check console logs first
   - Review this checklist
   - Test individual components

---

## 🎉 **SUCCESS CRITERIA**

### ✅ **Setup Complete When:**

- [ ] ✅ Google Cloud project created và configured
- [ ] ✅ TTS API enabled và working
- [ ] ✅ Service account created với proper permissions
- [ ] ✅ Environment variables set correctly
- [ ] ✅ Dependencies installed successfully
- [ ] ✅ Audio plays in app
- [ ] ✅ Caching works properly
- [ ] ✅ Error handling functional
- [ ] ✅ Performance acceptable
- [ ] ✅ Security measures in place

**🎊 Congratulations! Your Google Cloud TTS integration is complete!**

---

## 📝 **NOTES SECTION**

### 📋 **Personal Setup Notes**
```
Project ID: ________________________
Service Account Email: ________________________
API Key Created Date: ________________________
Billing Account: ________________________
First Successful Test: ________________________
```

### 🐛 **Issues Encountered**
```
Issue 1: ________________________
Solution: ________________________
Date: ________________________

Issue 2: ________________________
Solution: ________________________
Date: ________________________
```

### 📈 **Performance Notes**
```
First TTS Call Time: ________________________
Cache Hit Rate: ________________________
Memory Usage: ________________________
Audio Quality Rating: ________________________
``` 