import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const { db } = await import('./src/lib/firebase.js');
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';

async function listAndDelete() {
  try {
    const snapshot = await getDocs(collection(db, "guided_routes"));
    snapshot.forEach(docSnap => {
      console.log("Found Doc ID:", docSnap.id, "=> Name:", docSnap.data().name);
    });
    
    // Check if there is one named "從河到海"
    const targetDoc = snapshot.docs.find(d => d.data().name === "從河到海" || d.id === "從河到海");
    if (targetDoc) {
      console.log("Deleting document:", targetDoc.id);
      await deleteDoc(doc(db, "guided_routes", targetDoc.id));
      console.log("Deleted successfully.");
    } else {
      console.log("Could not find '從河到海'.");
    }
  } catch (e) {
    console.error("Error:", e);
  }
  process.exit(0);
}
listAndDelete();
