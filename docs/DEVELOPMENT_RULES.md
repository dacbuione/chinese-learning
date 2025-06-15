# 🚨 DEVELOPMENT RULES - Chinese Learning App

## 📱 **CRITICAL TABBAR RULE**

### ⚠️ **TUYỆT ĐỐI KHÔNG THÊM VÀO TABBAR**

**TABBAR CHỈ CÓ 5 TABS CỐ ĐỊNH:**
1. **Home** (`app/(tabs)/index.tsx`)
2. **Lessons** (`app/(tabs)/lessons/index.tsx`) 
3. **Practice** (`app/(tabs)/practice/index.tsx`)
4. **Progress** (`app/(tabs)/progress/index.tsx`)
5. **Profile** (`app/(tabs)/profile/index.tsx`)

### 🚫 **CÁC MÀNG HÌNH KHÔNG ĐƯỢC THÊM VÀO TABBAR:**

#### ✅ **Đúng - Trong folder của tab với _layout.tsx:**
```
app/(tabs)/
├── lessons/                   # Lessons tab folder
│   ├── _layout.tsx           # ✅ QUAN TRỌNG - Khai báo routes
│   ├── index.tsx             # ✅ Tab chính
│   └── [id].tsx              # ✅ Detail screen - ĐƯỢC khai báo trong _layout.tsx
├── practice/                  # Practice tab folder
│   ├── _layout.tsx           # ✅ QUAN TRỌNG - Khai báo routes  
│   ├── index.tsx             # ✅ Tab chính
│   └── quiz.tsx              # ✅ Detail screen - ĐƯỢC khai báo trong _layout.tsx
├── vocabulary/                # Detail screens - NGOÀI tabs
│   └── [id].tsx              # ✅ Vocabulary detail
├── index.tsx                 # Home tab
├── progress/index.tsx        # Progress tab
├── profile/index.tsx         # Profile tab
└── _layout.tsx               # Root layout
```

#### ❌ **SAI - Không có _layout.tsx hoặc không khai báo:**
```
app/(tabs)/
├── lessons/
│   ├── index.tsx             # ✅ OK - Tab chính
│   └── [id].tsx              # ❌ SAI - Không có _layout.tsx khai báo
├── practice/
│   ├── index.tsx             # ✅ OK - Tab chính  
│   └── quiz.tsx              # ❌ SAI - Không có _layout.tsx khai báo
```

---

## 🔄 **NAVIGATION RULES**

### **Back Navigation Logic:**
- **Detail screens → Parent screen** (KHÔNG về Home)
- **Quiz → Lesson Detail** (KHÔNG về Home)
- **Vocabulary Detail → Lesson Detail** (KHÔNG về Home)

### **Navigation Paths:**
```typescript
// ✅ Đúng - Detail screens trong tab folder
router.push('/(tabs)/lessons/chao-hoi')     // Lesson detail (có _layout.tsx)
router.push('/(tabs)/practice/quiz?lesson=...') // Quiz screen (có _layout.tsx)
router.push('/vocabulary/ni-hao')           // Vocabulary detail (ngoài tabs)

// ❌ Sai - Không có _layout.tsx
router.push('/lessons/chao-hoi')            // Sẽ không hoạt động
router.push('/practice/quiz')               // Sẽ không hoạt động
```

---

## 📂 **FILE STRUCTURE RULES**

### **Khi tạo màn hình mới:**

1. **Xác định loại màn hình:**
   - **Tab chính** → Đặt trong `app/(tabs)/[tab-name]/index.tsx`
   - **Detail screen của tab** → Đặt trong `app/(tabs)/[tab-name]/[detail].tsx` + tạo `_layout.tsx`
   - **Detail screen độc lập** → Đặt ngoài `app/(tabs)/`
   - **Modal/Popup** → Đặt ngoài `app/(tabs)/`

2. **Tạo _layout.tsx cho detail screens:**
   ```typescript
   // app/(tabs)/lessons/_layout.tsx
   import { Stack } from 'expo-router';
   
   export default function LessonsLayout() {
     return (
       <Stack screenOptions={{ headerShown: false }}>
         <Stack.Screen name="index" options={{ title: 'Bài học' }} />
         <Stack.Screen name="[id]" options={{ title: 'Chi tiết bài học' }} />
       </Stack>
     );
   }
   ```

3. **Kiểm tra tabbar:**
   - Restart app và kiểm tra bottom tabbar
   - Chỉ được có 5 tabs: Home, Lessons, Practice, Progress, Profile
   - Detail screens KHÔNG xuất hiện trong tabbar

4. **Update navigation paths:**
   - Detail trong tab: `/(tabs)/lessons/[id]`
   - Detail ngoài tab: `/vocabulary/[id]`

---

## 🧪 **TESTING RULES**

### **Luôn test bằng click thủ công:**
1. Restart app: `pkill -f expo && npx expo start --web --clear`
2. Navigate bằng click từ Home
3. Kiểm tra URL paths
4. Kiểm tra back navigation
5. **Kiểm tra tabbar chỉ có 5 tabs**

### **Checklist trước khi commit:**
- [ ] Tabbar chỉ có 5 tabs cố định
- [ ] Detail screens không xuất hiện trong tabbar  
- [ ] Back navigation về màn hình trước (không về Home)
- [ ] URL paths sử dụng absolute paths
- [ ] Tất cả navigation hoạt động bằng click

---

## 🎯 **EXPO ROUTER STRUCTURE**

### **Hiểu về Expo Router:**
- Files trong `app/(tabs)/` → Tự động tạo tabs
- Files ngoài `app/(tabs)/` → Screens thông thường  
- `[id].tsx` → Dynamic routes
- `index.tsx` → Default route
- `_layout.tsx` → Khai báo Stack navigation cho folder

### **Tránh lỗi thường gặp:**
- ❌ Đặt detail screens trong `(tabs)/` mà không có `_layout.tsx`
- ❌ Quên tạo `_layout.tsx` cho detail screens
- ❌ Sử dụng sai navigation paths
- ❌ Quên update import paths khi di chuyển files

---

## 🚨 **EMERGENCY FIX**

### **Nếu thấy tab thừa trong tabbar:**

1. **Identify file causing extra tab:**
   ```bash
   find app/(tabs) -name "*.tsx" -not -name "index.tsx" -not -name "_layout.tsx"
   ```

2. **Move file outside (tabs):**
   ```bash
   mkdir -p app/[category]
   mv app/(tabs)/[category]/[file].tsx app/[category]/
   ```

3. **Update imports:**
   ```typescript
   // Old: '../../../src/theme'
   // New: '../../src/theme'
   ```

4. **Update navigation:**
   ```typescript
   // Detail trong tab: router.push('/(tabs)/category/id')
   // Detail ngoài tab: router.push('/category/id')
   ```

5. **Test immediately:**
   ```bash
   pkill -f expo && npx expo start --web --clear
   ```

---

## ✅ **SUCCESS CRITERIA**

### **App đạt chuẩn khi:**
- Tabbar có đúng 5 tabs: Home, Lessons, Practice, Progress, Profile
- Detail screens không xuất hiện trong tabbar
- Navigation logic rõ ràng và nhất quán
- Back navigation về đúng màn hình trước
- URL structure clean và semantic
- Responsive design hoạt động trên mọi device

**REMEMBER: TABBAR = 5 TABS ONLY! 🚨** 