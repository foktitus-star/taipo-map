// testSaveAuth.mjs - Firestore write with anonymous authentication
import 'dotenv/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
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
const auth = getAuth(app);
const db = getFirestore(app);

async function testSaveAuth() {
  try {
    const userCred = await signInAnonymously(auth);
    console.log('✅ 匿名登入成功, uid:', userCred.user.uid);
    const docId = 'auth_test_' + Date.now();
    const payload = {
      id: docId,
      name: '匿名測試路線',
      published: true,
      updatedAt: new Date().toISOString()
    };
    await setDoc(doc(db, 'guided_routes', docId), payload);
    console.log('✅ 寫入成功, docId:', docId);
  } catch (e) {
    console.error('❌ 操作失敗:', e);
  }
}

testSaveAuth();
