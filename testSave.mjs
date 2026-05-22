// testSave.mjs - verifies Firestore write capability
import 'dotenv/config';
import { db } from './src/lib/firebase.js';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';

async function testWrite() {
  try {
    const testDocRef = doc(db, 'guided_routes', 'test_route_' + Date.now());
    const data = {
      name: 'Test Route',
      description: 'Automated test write',
      createdAt: serverTimestamp(),
      waypoints: [],
    };
    await setDoc(testDocRef, data);
    console.log('✅ Firestore write succeeded');
  } catch (err) {
    console.error('❌ Firestore write failed:', err);
    process.exit(1);
  }
}

testWrite();
