import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";


const firebaseConfig = {
  apiKey: "AIzaSyBoYsHylid8StwydWv1c9m7aGbTxNMR5FQ",
  authDomain: "raiox-desenhar.firebaseapp.com",
  projectId: "raiox-desenhar",
  storageBucket: "raiox-desenhar.firebasestorage.app",
  messagingSenderId: "362898713478",
  appId: "1:362898713478:web:6e7908e19ab8dc638e9a07"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
