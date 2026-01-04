// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
    apiKey: "AIzaSyBh3lm7lJirTJZbMVKoIO4NJyZj7XtWBvw",
    authDomain: "tellar-duel-rpg.firebaseapp.com",
    projectId: "tellar-duel-rpg",
    storageBucket: "tellar-duel-rpg.firebasestorage.app",
    messagingSenderId: "805940186544",
    appId: "1:805940186544:web:6bc1083d54d90fa7165a75"
  };

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);

// Exporta os serviços para usarmos no resto do app
export const auth = getAuth(app);
export const db = getFirestore(app);