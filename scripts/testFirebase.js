import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: "AIzaSyB-qZ6xUK3CjkFyhiwrZreFOjjov6DlFNU",
  authDomain: "haandi-web-app.firebaseapp.com",
  projectId: "haandi-web-app",
  storageBucket: "haandi-web-app.firebasestorage.app",
  messagingSenderId: "289271292018",
  appId: "1:289271292018:web:9307fcf22220262769a2eb",
  measurementId: "G-TMZ50DK781"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

console.log('Firebase App initialized successfully:', app.name);
console.log('Auth initialized:', !!auth);
console.log('Firestore initialized:', !!db);
