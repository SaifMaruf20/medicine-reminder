# 💊 OshudhSathi (ঔষধসাথী) — React Native Expo Mobile App

> **Carbon-copy 1:1 migration of OshudhSathi from Flutter 3 / Dart to React Native + Expo SDK 57 (React Native 0.86)** with modern industry standards, designed for university presentation and production readiness.

---

## 🚀 Key Highlights & Stack

| Category | Flutter Implementation | React Native Expo (2026 Industry Standard) |
| :--- | :--- | :--- |
| **Framework** | Flutter 3.19 / Dart | **React Native 0.86 + Expo SDK 57** (New Architecture & Hermes) |
| **Language** | Dart | **TypeScript (Strict Mode)** with Path Aliases (`@/*`) |
| **Navigation** | `MaterialApp` + `Navigator.push` | **Expo Router v4** (file-based routing with deep linking) |
| **State Management** | Riverpod (`StateNotifierProvider`) | **Zustand** (lightweight, modular client state) |
| **API Client** | Dio + Custom Interceptor | **Axios** with JWT SecureStore Interceptor (2-3s fast-fail offline fallback) |
| **Secure Token** | `shared_preferences` | **`expo-secure-store`** (hardware-backed keystore/keychain) |
| **Offline Storage** | `shared_preferences` | **`@react-native-async-storage/async-storage`** |
| **Bengali Voice (TTS)** | `flutter_tts` ("bn-BD") | **`expo-speech`** ("bn-BD" voice alerts on dose times and confirmation) |
| **Notifications** | `flutter_local_notifications` | **`expo-notifications`** (Android notification channel + scheduling) |
| **Prescription OCR** | `google_mlkit_text_recognition` | **`src/services/ocr.ts`** (Regex + NLP keyword extraction) |
| **Camera & QR** | `mobile_scanner` / `camera` | **`expo-camera`** (CameraView with reticle overlay) |
| **QR Generation** | `qr_flutter` | **`react-native-qrcode-svg`** |
| **Contact Picker** | `flutter_contacts` | **`expo-contacts`** (native phonebook picker integration) |
| **PDF Doctor Report** | `path_provider` + `share_plus` | **`expo-print`** (HTML to PDF) + **`expo-sharing`** |
| **Offline BD Catalog** | Bundled 310+ Medicines | **`src/data/offlineMedicineDataset.ts`** (instant 0ms offline search & alternatives) |

---

## 📱 Screen-by-Screen Architecture

### 1. 🔐 Authentication Flow (`app/(auth)/`)
- **Walkthrough (`onboarding.tsx`)**: 3-step carousel with indicators, introducing reminders, family care, and emergency SOS.
- **Login (`login.tsx`)**: Phone and password form with one-tap **"টেস্ট লগইন তথ্য (অটো-ফিল)"** banner for demo presentation (`01619504428` / `Jovayer1234`).
- **OTP Verification (`otp.tsx`)**: 11-digit Bangladeshi mobile validation, 60s countdown timer, and **"ডেমো OTP (123456) অটো-ফিল"** button.
- **Registration (`register.tsx`)**: Full profile registration with blood group chip selector (`A+` to `O-`), emergency contact, allergies, and chronic conditions.

### 2. 🏠 Home Dashboard (`app/(tabs)/index.tsx`)
- **Header**: Islamic greeting `"আসসালামু আলাইকুম 👋"`, user name, family sharing and generic finder quick-access shortcuts.
- **Progress Card**: Real-time progress bar displaying `{taken}/{total} টি সম্পন্ন` and completion celebration message.
- **Refill Alert Banner**: Triggers automatically when `remainingQuantity <= refillAlertDays * 2`.
- **Quick Action Grid**: 4 feature cards:
  - 📅 ডাক্তার ভিজিট (Appointments)
  - 💰 সস্তা বিকল্প (Generic Finder)
  - 👨‍👩‍👧 ফ্যামিলি কেয়ার (Family Monitor)
  - ❤️ বিপি ও সুগার (Health Tracker)
- **Today's Dose Checklist**: Grouped by time slots (সকাল, দুপুর ও বিকাল, রাত) with one-tap status toggling (খেয়েছি / মিসড) and Bengali audio feedback.

### 3. 💊 Medicine Management (`app/(tabs)/medicines.tsx` & `app/add-medicine.tsx`)
- **Active Medicine List**: Search by name and filter by disease category chips (সব, গ্যাস্ট্রিক, ডায়াবেটিস, প্রেসার, ভিটামিন, অন্যান্য).
- **Add Medicine Flow**:
  - Search from DGDA 310+ medicine database or toggle "নিজে লিখুন" to enter custom medicines.
  - Dosage forms: ট্যাবলেট, ক্যাপসুল, সিরাপ, ইনজেকশন, ড্রপস, মলম.
  - Frequency: দিনে ১ বার, দিনে ২ বার, দিনে ৩ বার.
  - Meal instructions: খাওয়ার আগে, খাওয়ার পরে, যেকোনো সময়.
  - Inventory tracking: মোট সংখ্যা ও রিফিল নোটিফিকেশন দিন.
  - Toggle for Bengali voice reminders.

### 4. 📈 Health Tracker (`app/(tabs)/health.tsx`)
- **4 Measurement Sections**:
  - 🩺 রক্তচাপ (Blood Pressure: Systolic & Diastolic mmHg) with normal/prehypertension/hypertension color badges.
  - 🩸 ব্লাড সুগার (Blood Sugar: mmol/L) with fasting/after-meal context.
  - ⚖️ ওজন (Weight in kg).
  - 💓 পালস রেট (Pulse in bpm).
- **Doctor PDF Report Export**: One-tap generation of a full medical PDF report formatted in Bengali and English, shared directly via WhatsApp, email, or device storage.

### 5. 📋 Prescription Vault & OCR (`app/(tabs)/prescriptions.tsx` & `app/add-prescription.tsx`)
- Digital vault preserving doctor visit dates, hospital names, diagnoses, and multi-image uploads.
- Fullscreen zoom viewer for examining handwritten prescriptions.
- OCR text recognition parsing doctor qualifications (MBBS, FCPS), clinic names, visit dates, and prescribed drugs.

### 6. 🆘 Emergency ID & Helplines (`app/(tabs)/emergency.tsx`)
- **Digital Medical ID Card**: Bold blood group badge, emergency contact with instant phone dialer, allergies, chronic ailments, and active prescriptions.
- **Offline Responder QR Code**: Encodes health profile as JSON so paramedics can scan without an internet connection.
- **Bangladesh Government Helplines**:
  - `999` — জাতীয় জরুরি সেবা
  - `16263` — স্বাস্থ্য বাতায়ন (২৪ ঘণ্টা ডাক্তার)
  - `333` — জাতীয় তথ্য ও সেবা
  - `16163` — নারী ও শিশু হেল্পলাইন
  - `199` — দুর্যোগের আগাম বার্তা
  - `01713007700` — পয়জন ইনফরমেশন সেন্টার
- **Personal Contacts**: Import contacts directly from phonebook or add manually.

### 7. 👨‍👩‍👧 Family Link & Appointments (`app/family-sharing.tsx`, `app/qr-scanner.tsx`, `app/appointments.tsx`)
- **Family Sharing**: Unique invite code generator and camera QR scanner to link elderly parents or family members.
- **Live Adherence Monitoring**: Displays today's doses taken/pending for linked family members.
- **Doctor Appointments**: Tracks upcoming clinic visits with configurable advance notification reminders (1, 3, or 7 days prior).

---

## 🛠️ How to Run the App

### Prerequisites
- Node.js (v18+)
- Android Studio / Android Emulator or Expo Go on a physical phone

### 1. Start Metro Dev Server
```powershell
cd c:\dev\ph\app-rn
npm start
```

### 2. Run on Android
```powershell
# Open on Android Emulator or connected device
npm run android

# Or scan the QR code from Expo Go app on your phone
```

### 3. Run on Web (for quick browser testing)
```powershell
npm run web
```

---

## 📡 API Configuration
The API configuration is located at `src/constants/api.ts`.
- Physical Android device on LAN: connects to `http://192.168.31.106:3001/api/v1`
- Android Emulator: connects to `http://10.0.2.2:3001/api/v1`
- Web / iOS simulator: connects to `http://localhost:3001/api/v1`
- **Offline Fallback**: When the backend server is unreachable, the app automatically switches to Local-First mode without crashing, using bundled datasets and mock demo authentication.
