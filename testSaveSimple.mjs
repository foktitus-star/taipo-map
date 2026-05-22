// testSaveSimple.mjs - minimal Firestore write test
import 'dotenv/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

async function testSaveSimple() {
  const docId = 'simple_test_' + Date.now();
  const payload = {
    id: docId,
    name: '簡易測試路線',
    published: true,
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'guided_routes', docId), payload);
    console.log('✅ 成功寫入 Firestore，docId:', docId);
  } catch (e) {
    console.error('❌ Firestore 寫入失敗:', e);
  }
}

testSaveSimple();
