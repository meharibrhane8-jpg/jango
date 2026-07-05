import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

async function run() {
  const app = initializeApp();
  const db = getFirestore(app, "ai-studio-aigeezkeyboard-dace50ee-1fa2-46b6-adbc-f0bf24ed5201");
  try {
    await db.collection('test').get();
    console.log('OK');
  } catch (err) {
    console.error(err);
  }
}
run();
