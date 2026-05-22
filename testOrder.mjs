import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
// NOW import db
const { db } = await import('./src/lib/firebase.js');
import { doc, setDoc } from 'firebase/firestore';

async function testFullWrite() {
  try {
    await setDoc(doc(db, 'guided_routes', 'test_route_abc'), { test: 123 });
    console.log('✅ Success');
  } catch (err) {
    console.error('❌ Failed:', err.message);
  }
  process.exit(0);
}
testFullWrite();
