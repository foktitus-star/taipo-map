// testSave.js - script to test Firestore write
require('dotenv').config({ path: '.env.local' });
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

async function testSave() {
  const docId = 'test_route_' + Date.now();
  const payload = {
    id: docId,
    name: '測試路線',
    subtitle: '測試路線說明',
    color: '#3b82f6',
    colorDark: '#1d4ed8',
    startStation: '測試起點',
    stationCount: 1,
    stations: [],
    segments: [],
    published: true,
    editorDraft: {},
    updatedAt: new Date().toISOString()
  };
  try {
    await setDoc(doc(db, 'guided_routes', docId), payload);
    console.log('✅ Firestore write succeeded, docId:', docId);
  } catch (e) {
    console.error('❌ Firestore write failed:', e);
  }
}

testSave();
