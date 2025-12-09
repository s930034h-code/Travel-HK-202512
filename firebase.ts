
import * as firebaseApp from 'firebase/app';
import { getDatabase } from 'firebase/database';

// ⚠️ 重要：請將下方的設定替換成您在 Firebase Console 複製的內容
// Replace the following config with your own from Firebase Console
const firebaseConfig = {
  apiKey: "AIzaSyDGuhHXGAQ6GW_G6OiYNiFIJaLZjuOlT1s",
  authDomain: "hk-trip-2025.firebaseapp.com",
  databaseURL: "https://hk-trip-2025-default-rtdb.firebaseio.com",
  projectId: "hk-trip-2025",
  storageBucket: "hk-trip-2025.firebasestorage.app",
  messagingSenderId: "451450729564",
  appId: "1:451450729564:web:56a06069f23ba85b3ca299"
};

// 檢查邏輯更新：只要金鑰長度大於 20 (Firebase Key 通常很長)，就視為已設定
// 這樣可以避免字串比對的問題
export const isFirebaseConfigured = firebaseConfig.apiKey.length > 20;

// Debug helper to show on mobile screen
export const getDebugInfo = () => {
  const key = firebaseConfig.apiKey;
  return {
    configured: isFirebaseConfigured,
    keyLength: key.length,
    // 顯示前四碼與後四碼，方便確認是否讀到舊檔
    keyPreview: key.length > 10 
      ? `${key.slice(0,4)}...${key.slice(-4)}` 
      : key
  };
};

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);
export const db = getDatabase(app);
