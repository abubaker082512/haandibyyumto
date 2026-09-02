import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration from Firebase Console
export const firebaseConfig = {
  apiKey: "AIzaSyB-qZ6xUK3CjkFyhiwrZreFOjjov6DlFNU",
  authDomain: "haandi-web-app.firebaseapp.com",
  projectId: "haandi-web-app",
  storageBucket: "haandi-web-app.firebasestorage.app",
  messagingSenderId: "289271292018",
  appId: "1:289271292018:web:9307fcf22220262769a2eb",
  measurementId: "G-TMZ50DK781"
};

// Initialize Firebase once
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

export default app;
