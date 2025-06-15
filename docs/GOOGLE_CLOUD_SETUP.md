# 🔧 Hướng Dẫn Setup Google Cloud Text-to-Speech API

## 📋 **BƯỚC 1: SETUP GOOGLE CLOUD PROJECT**

### 1.1 Đăng nhập Google Cloud Console
1. Truy cập: https://console.cloud.google.com/
2. Đăng nhập bằng Google account của bạn
3. Chấp nhận Terms of Service nếu được yêu cầu

### 1.2 Tạo Project Mới
1. Click vào **Project Selector** (góc trên bên trái)
2. Click **"NEW PROJECT"**
3. Nhập thông tin:
   - **Project name**: `chinese-learning-app`
   - **Project ID**: `chinese-learning-app-[random-id]` (tự động tạo)
   - **Location**: Để mặc định
4. Click **"CREATE"**

### 1.3 Enable Billing (Bắt buộc)
1. Vào **Navigation Menu** (☰) → **Billing**
2. Click **"Link a billing account"**
3. Tạo billing account mới hoặc chọn existing account
4. **Lưu ý**: Bạn sẽ có $300 credit miễn phí + 1M ký tự TTS miễn phí/tháng

### 1.4 Enable Text-to-Speech API
1. Vào **Navigation Menu** (☰) → **APIs & Services** → **Library**
2. Tìm kiếm: **"Cloud Text-to-Speech API"**
3. Click vào **Cloud Text-to-Speech API**
4. Click **"ENABLE"**
5. Đợi vài phút để API được kích hoạt

### 1.5 Tạo Service Account & API Key
1. Vào **Navigation Menu** (☰) → **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **Service account**
3. Nhập thông tin:
   - **Service account name**: `tts-service-account`
   - **Service account ID**: `tts-service-account`
   - **Description**: `Text-to-Speech service for Chinese Learning App`
4. Click **"CREATE AND CONTINUE"**
5. **Grant access**: Chọn role **"Cloud Text-to-Speech User"**
6. Click **"CONTINUE"** → **"DONE"**

### 1.6 Download Service Account Key
1. Trong **Credentials**, click vào service account vừa tạo
2. Vào tab **"KEYS"**
3. Click **"ADD KEY"** → **"Create new key"**
4. Chọn **JSON** format
5. Click **"CREATE"**
6. File JSON sẽ được download → **LƯU GIỮ AN TOÀN**

---

## 🔑 **BƯỚC 2: SETUP ENVIRONMENT**

### 2.1 Cài đặt Dependencies
```bash
# Cài đặt Google Cloud TTS client
npm install @google-cloud/text-to-speech

# Cài đặt audio utilities
npm install react-native-sound
npm install @react-native-async-storage/async-storage

# Cài đặt file system utilities
npm install react-native-fs
```

### 2.2 Setup Environment Variables
Tạo file `.env` trong root project:
```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=chinese-learning-app-[your-id]
GOOGLE_CLOUD_KEYFILE_PATH=./google-cloud-key.json

# TTS Configuration
TTS_CACHE_SIZE=100
TTS_DEFAULT_LANGUAGE=zh-CN
TTS_DEFAULT_VOICE=zh-CN-Wavenet-A
```

### 2.3 Copy Service Account Key
1. Copy file JSON đã download vào thư mục project
2. Rename thành `google-cloud-key.json`
3. **QUAN TRỌNG**: Thêm vào `.gitignore`:
```gitignore
# Google Cloud credentials
google-cloud-key.json
.env
```

---

## ✅ **KIỂM TRA SETUP**

### Test API Connection
```bash
# Test bằng command line
curl -H "Authorization: Bearer $(gcloud auth application-default print-access-token)" \
  -H "Content-Type: application/json; charset=utf-8" \
  -d '{
    "input": {"text": "你好"},
    "voice": {"languageCode": "zh-CN", "name": "zh-CN-Wavenet-A"},
    "audioConfig": {"audioEncoding": "MP3"}
  }' \
  "https://texttospeech.googleapis.com/v1/text:synthesize"
```

Nếu thành công, bạn sẽ nhận được response với `audioContent` base64.

---

## 🚨 **LƯU Ý BẢO MẬT**

1. **KHÔNG** commit file `google-cloud-key.json` lên Git
2. **KHÔNG** share API key với ai
3. **LUÔN** sử dụng environment variables
4. **ĐỊNH KỲ** rotate service account keys (3-6 tháng)

---

## 💰 **THEO DÕI CHI PHÍ**

### Setup Billing Alerts
1. Vào **Navigation Menu** (☰) → **Billing** → **Budgets & alerts**
2. Click **"CREATE BUDGET"**
3. Thiết lập:
   - **Budget amount**: $10/month
   - **Alert thresholds**: 50%, 90%, 100%
   - **Email notifications**: Bật

### Monitor Usage
- Vào **Navigation Menu** (☰) → **APIs & Services** → **Quotas**
- Tìm **"Cloud Text-to-Speech API"**
- Theo dõi **"Characters per month"** (limit: 1M miễn phí)

---

## 🔄 **NEXT STEPS**

Sau khi hoàn thành setup:
1. ✅ Google Cloud project đã tạo
2. ✅ Text-to-Speech API đã enable
3. ✅ Service account đã tạo
4. ✅ API key đã download
5. ✅ Dependencies đã cài đặt
6. ✅ Environment variables đã setup

**Tiếp theo**: Tích hợp TTS service vào ứng dụng React Native! 