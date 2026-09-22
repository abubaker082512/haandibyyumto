import { db as firestore } from '../lib/firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

const collectionsToSync = [
  'yumto_orders',
  'yumto_tables',
  'yumto_menu',
  'yumto_shifts',
  'yumto_reservations'
];

let isSyncingFromCloud = false;

export const startFirestoreSync = (mockDbInstance: any) => {
  console.log('Starting Firestore Realtime Hybrid Sync...');

  // 1. Listen to cloud changes and update local
  collectionsToSync.forEach(key => {
    onSnapshot(collection(firestore, key), (snapshot) => {
      isSyncingFromCloud = true;
      const data = snapshot.docs.map(docSnap => docSnap.data());
      localStorage.setItem(key, JSON.stringify(data));
      
      // We need to notify React components to re-render
      // Since notify is private, we can bypass it if needed or if mockDbInstance exposes it
      if (typeof mockDbInstance.notify === 'function') {
        mockDbInstance.notify();
      } else {
        // Hack to call private notify via prototype or cast
        (mockDbInstance as any).notify();
      }
      isSyncingFromCloud = false;
    });
  });
};

export const pushToFirestore = (key: string, data: any[]) => {
  if (isSyncingFromCloud || !collectionsToSync.includes(key)) return;

  // We batch set all documents in this array to their respective collections
  // In a real app we'd find the diff, but for this hybrid we overwrite the docs
  data.forEach(item => {
    if (item && item.id) {
      setDoc(doc(firestore, key, item.id), item).catch(err => console.error('Firestore Sync Error:', err));
    }
  });
};
