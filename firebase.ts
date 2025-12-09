
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

// Simple check to see if the user has configured the keys
export const isFirebaseConfigured = !firebaseConfig.apiKey.includes("AIzaSyDGuhHXGAQ6GW_G6OiYNiFIJaLZjuOlT1s");

// Initialize Firebase
const app = firebaseApp.initializeApp(firebaseConfig);
export const db = getDatabase(app);
