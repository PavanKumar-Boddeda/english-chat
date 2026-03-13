import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAzu8HjaVkz-11RkBiVayvqWylcTqeTrLQ",
  authDomain: "english-chat-app-b2f00.firebaseapp.com",
  projectId: "english-chat-app-b2f00",
  storageBucket: "english-chat-app-b2f00.firebasestorage.app",
  messagingSenderId: "G-GSVQCFFKGQ",
  appId: "1:846886383979:web:cbb5a67329cd0c3d9adc2e"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);

