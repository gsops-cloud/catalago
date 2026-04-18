import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

// ⚠️ IMPORTANTE: Substitua com suas credenciais do Firebase
// 1. Acessa https://console.firebase.google.com/
// 2. Cria novo projeto
// 3. Vai para Project Settings
// 4. Copia a config e cola aqui

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const storage = getStorage(app);
