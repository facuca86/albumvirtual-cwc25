import { initializeApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyBqRvXmDjKRo5kye39hGeh0uW0tGoi5o7c",
  authDomain: "panini-2026-c3ae8.firebaseapp.com",
  projectId: "panini-2026-c3ae8",
  storageBucket: "panini-2026-c3ae8.firebasestorage.app",
  messagingSenderId: "713513106611",
  appId: "1:713513106611:web:0f222abee8dde76915c4c6",
  measurementId: "G-X3LTQMHJZQ"
};

const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);

export const db = hasFirebaseConfig
  ? getFirestore(initializeApp(firebaseConfig, 'panini2022'))
  : null;

export { doc, getDoc, setDoc };

if (!hasFirebaseConfig) {
  console.warn('Firebase no está configurado. Se usará almacenamiento local en este navegador.');
}
