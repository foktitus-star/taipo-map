// testSimple.mjs - writes a minimal document to Firestore to verify connectivity
import 'dotenv/config';
import { db } from './src/lib/firebase.js';
import { doc, setDoc } from 'firebase/firestore';

async function run() {
  try {
    await setDoc(doc(db, 'guided_routes', 'simple_test'), { hello: 'world', createdAt: new Date().toISOString() });
    console.log('✅ Simple write succeeded');
  } catch (e) {
    console.error('❌ Simple write failed:', e);
  }
}

run();
