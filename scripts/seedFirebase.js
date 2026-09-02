import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from 'firebase/auth';

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

console.log('🚀 Connecting to Firebase project: haandi-web-app...');

// Master Accounts matching CREDENTIALS.md
const USERS_TO_SEED = [
  {
    username: 'owner',
    email: 'owner@haandi.yumto.com',
    password: 'Haandi@2026',
    name: 'Haandi Owner',
    phone: '+92 300 0000000',
    role: 'OWNER',
    branchId: 'br-isb'
  },
  {
    username: 'manager',
    email: 'manager@haandi.yumto.com',
    password: 'Haandi@2026',
    name: 'Bilal Manager',
    phone: '+92 333 4567890',
    role: 'MANAGER',
    branchId: 'br-isb'
  },
  {
    username: 'cashier',
    email: 'cashier@haandi.yumto.com',
    password: 'Haandi@2026',
    name: 'Nadia Cashier',
    phone: '+92 321 5550001',
    role: 'CASHIER',
    branchId: 'br-isb'
  },
  {
    username: 'kitchen',
    email: 'kitchen@haandi.yumto.com',
    password: 'Haandi@2026',
    name: 'Chef Tariq',
    phone: '+92 312 3456789',
    role: 'KITCHEN',
    branchId: 'br-isb'
  },
  {
    username: 'rider',
    email: 'rider@haandi.yumto.com',
    password: 'Haandi@2026',
    name: 'Zahid Rider',
    phone: '+92 345 6789012',
    role: 'RIDER',
    branchId: 'br-isb'
  },
  {
    username: 'customer',
    email: 'customer@haandi.yumto.com',
    password: 'Haandi@2026',
    name: 'Abubakar Customer',
    phone: '+92 300 1234567',
    role: 'CUSTOMER',
    branchId: 'br-isb'
  }
];

// Single Active Branch (Gulberg Greens, Islamabad)
const BRANCH_DATA = {
  id: 'br-isb',
  name: 'Haandi by Yumto - Gulberg Greens, Islamabad',
  city: 'Islamabad',
  address: 'Gulberg Greens, Civic Center, Executive Block, Islamabad',
  phone: '0330 0500600',
  ntn: '4585147-3',
  premiumBookingFee: 1500,
  activeSurchargeToggle: true,
  deliveryRadiusKm: 2.5,
  location: {
    lat: 33.5932,
    lng: 73.1365
  },
  taxRates: {
    card: 5,
    cash: 16
  }
};

const FLOORS_DATA = [
  { id: 'fl-isb-g', branchId: 'br-isb', name: 'Ground Floor (Main Dining)', level: 0 },
  { id: 'fl-isb-f', branchId: 'br-isb', name: 'First Floor (Family Section)', level: 1 },
  { id: 'fl-isb-v', branchId: 'br-isb', name: 'Rooftop (VIP Majlis & Executive Cabins)', level: 2 }
];

const TABLES_DATA = [
  // Ground Floor
  { id: 'tb-br-isb-g1', floorId: 'fl-isb-g', branchId: 'br-isb', tableNumber: 'G-1', capacity: 4, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-g2', floorId: 'fl-isb-g', branchId: 'br-isb', tableNumber: 'G-2', capacity: 4, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-g3', floorId: 'fl-isb-g', branchId: 'br-isb', tableNumber: 'G-3', capacity: 2, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-g4', floorId: 'fl-isb-g', branchId: 'br-isb', tableNumber: 'G-4', capacity: 8, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-g5', floorId: 'fl-isb-g', branchId: 'br-isb', tableNumber: 'G-5', capacity: 4, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-g6', floorId: 'fl-isb-g', branchId: 'br-isb', tableNumber: 'G-6', capacity: 6, type: 'STANDARD', status: 'AVAILABLE' },

  // Family Floor
  { id: 'tb-br-isb-f1', floorId: 'fl-isb-f', branchId: 'br-isb', tableNumber: 'F-1', capacity: 6, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-f2', floorId: 'fl-isb-f', branchId: 'br-isb', tableNumber: 'F-2', capacity: 6, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-f3', floorId: 'fl-isb-f', branchId: 'br-isb', tableNumber: 'F-3', capacity: 6, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-f4', floorId: 'fl-isb-f', branchId: 'br-isb', tableNumber: 'F-4', capacity: 10, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-f5', floorId: 'fl-isb-f', branchId: 'br-isb', tableNumber: 'F-5', capacity: 12, type: 'STANDARD', status: 'AVAILABLE' },
  { id: 'tb-br-isb-f6', floorId: 'fl-isb-f', branchId: 'br-isb', tableNumber: 'F-6', capacity: 6, type: 'STANDARD', status: 'AVAILABLE' },

  // Rooftop VIP
  { id: 'tb-br-isb-v1', floorId: 'fl-isb-v', branchId: 'br-isb', tableNumber: 'Majlis M-1', capacity: 8, type: 'MAJLIS_FLOOR', status: 'AVAILABLE' },
  { id: 'tb-br-isb-v2', floorId: 'fl-isb-v', branchId: 'br-isb', tableNumber: 'Majlis M-2', capacity: 8, type: 'MAJLIS_FLOOR', status: 'AVAILABLE' },
  { id: 'tb-br-isb-v3', floorId: 'fl-isb-v', branchId: 'br-isb', tableNumber: 'VIP Cabin V-3', capacity: 6, type: 'VIP_CABIN', status: 'AVAILABLE' },
  { id: 'tb-br-isb-v4', floorId: 'fl-isb-v', branchId: 'br-isb', tableNumber: 'VIP Cabin V-4', capacity: 12, type: 'VIP_CABIN', status: 'AVAILABLE' }
];

// Authentic Haandi Menu Items
const MENU_ITEMS = [
  // Handi Special
  {
    id: 'handi-desi-murgh',
    name: 'Desi Murgh Handi',
    price: 2450,
    category: 'Handi Special',
    description: 'Fresh organic desi chicken slow-cooked in traditional clay pot with rich desi spices and ginger',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Half (0.5 kg)', price: 1450 }, { name: 'Full (1.0 kg)', price: 2450 }]
  },
  {
    id: 'handi-chicken-boneless',
    name: 'Chicken Boneless Handi',
    price: 1850,
    category: 'Handi Special',
    description: 'Tender boneless chicken breast cubes simmered in creamy tomato-butter gravy and aromatic fenugreek',
    imageUrl: 'https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Half (0.5 kg)', price: 1100 }, { name: 'Full (1.0 kg)', price: 1850 }]
  },
  {
    id: 'handi-paneer-reshmi',
    name: 'Handi Special Paneer Reshmi',
    price: 1990,
    category: 'Handi Special',
    description: 'Velvety reshmi chicken cooked with fresh cottage cheese cubes, dairy cream and roasted cumin in earthen handi',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Half (0.5 kg)', price: 1250 }, { name: 'Full (1.0 kg)', price: 1990 }]
  },
  {
    id: 'handi-mutton',
    name: 'Mutton Handi Special',
    price: 2890,
    category: 'Handi Special',
    description: 'Prime cuts of tender young mutton stewed in clay pot with caramelized onions, yogurt and whole garam masala',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Half (0.5 kg)', price: 1750 }, { name: 'Full (1.0 kg)', price: 2890 }]
  },
  {
    id: 'handi-white',
    name: 'Chicken White Handi',
    price: 1890,
    category: 'Handi Special',
    description: 'Mild, rich and aromatic white sauce cooked with almonds, white pepper, fresh cream and green cardamom',
    imageUrl: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Half (0.5 kg)', price: 1150 }, { name: 'Full (1.0 kg)', price: 1890 }]
  },

  // Karahi Special
  {
    id: 'karahi-desi-murgh',
    name: 'Desi Murgh Karahi',
    price: 2450,
    category: 'Karahi Special',
    description: 'Fresh desi chicken stir-fried over high flame with ripe red tomatoes, green chillies, garlic and black pepper',
    imageUrl: 'https://images.unsplash.com/photo-1626777552726-4a6b54c97e46?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Half (0.5 kg)', price: 1450 }, { name: 'Full (1.0 kg)', price: 2450 }]
  },
  {
    id: 'karahi-chicken',
    name: 'Chicken Karahi Special',
    price: 1790,
    category: 'Karahi Special',
    description: 'Crisp seared chicken cooked in pure desi butter with ginger juliennes and crushed coriander seeds',
    imageUrl: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Half (0.5 kg)', price: 1050 }, { name: 'Full (1.0 kg)', price: 1790 }]
  },
  {
    id: 'karahi-mutton',
    name: 'Mutton Shinwari Karahi',
    price: 2950,
    category: 'Karahi Special',
    description: 'Traditional Pashtun style mutton cooked purely in its own fat with juicy tomatoes, green chillies and salt',
    imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Half (0.5 kg)', price: 1790 }, { name: 'Full (1.0 kg)', price: 2950 }]
  },

  // Charcoal BBQ
  {
    id: 'bbq-seekh-kabab',
    name: 'Chicken Seekh Kabab',
    price: 950,
    category: 'Charcoal BBQ',
    description: 'Minced chicken blended with fresh herbs, mint, and secret spices, grilled over red-hot charcoal skewers (4 pcs)',
    imageUrl: 'https://images.unsplash.com/photo-1599488615731-7e5c2823ff28?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'bbq-mutton-kabab',
    name: 'Mutton Seekh Kabab',
    price: 1350,
    category: 'Charcoal BBQ',
    description: 'Spiced minced lamb skewered and charcoal grilled to juicy perfection with smoke infusion (4 pcs)',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'bbq-malai-boti',
    name: 'Chicken Malai Boti',
    price: 1190,
    category: 'Charcoal BBQ',
    description: 'Mouth-melting boneless chicken cubes marinated in fresh cream, cheese, cardamom and mild white pepper (8 pcs)',
    imageUrl: 'https://images.unsplash.com/photo-1567620832903-9fc6debc209f?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'bbq-shehnsha-platter',
    name: 'Shehnsha Royal BBQ Platter',
    price: 3850,
    category: 'Charcoal BBQ',
    description: 'Grand assortment of Chicken Seekh, Mutton Kabab, Malai Boti, Chicken Tikka, Fish Boti & 2 Roghni Naans with Raita',
    imageUrl: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },

  // Rice & Biryani
  {
    id: 'rice-dum-biryani',
    name: 'Special Chicken Dum Biryani',
    price: 890,
    category: 'Rice & Biryani',
    description: 'Aromatic long-grain basmati rice layered with spiced chicken and steamed in sealed pot with saffron and mint',
    imageUrl: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=600&q=80',
    isAvailable: true,
    variations: [{ name: 'Single', price: 890 }, { name: 'Family Platter', price: 2350 }]
  },

  // Tandoor / Naan
  {
    id: 'naan-roghni',
    name: 'Special Roghni Naan',
    price: 120,
    category: 'Roti & Naan',
    description: 'Fluffy tandoori bread brushed with melted butter and sprinkled with toasted sesame seeds',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'naan-garlic',
    name: 'Garlic Butter Naan',
    price: 150,
    category: 'Roti & Naan',
    description: 'Crispy naan infused with crushed garlic cloves and fresh coriander leaves',
    imageUrl: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },

  // Desserts & Beverages
  {
    id: 'dessert-kheer',
    name: 'Matka Kheer (Pistachio)',
    price: 320,
    category: 'Desserts',
    description: 'Slow-simmered rice pudding enriched with condensed milk, saffron and crushed pistachios served in clay bowl',
    imageUrl: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  },
  {
    id: 'drink-mint-margarita',
    name: 'Mint Margarita Cooler',
    price: 290,
    category: 'Beverages',
    description: 'Refreshing blended crushed ice with fresh garden mint leaves, lemon juice and sprite soda',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80',
    isAvailable: true
  }
];

async function seedFirebase() {
  console.log('\n=============================================');
  console.log('  HAANDI BY YUMTO — FIREBASE INITIALIZATION  ');
  console.log('=============================================\n');

  // 1. Firebase Authentication: Create / Verify all 6 Accounts
  console.log('📌 [1/4] Setting up Firebase Authentication accounts...');
  const userMap = {};

  for (const user of USERS_TO_SEED) {
    let uid = `user-${user.username}`;
    try {
      // Try to create user
      const userCred = await createUserWithEmailAndPassword(auth, user.email, user.password);
      uid = userCred.user.uid;
      console.log(`  ✅ Created user: ${user.email} (${user.role}) -> UID: ${uid}`);
    } catch (err) {
      if (err.code === 'auth/email-already-in-use') {
        try {
          // User already exists, sign in to retrieve existing UID
          const cred = await signInWithEmailAndPassword(auth, user.email, user.password);
          uid = cred.user.uid;
          console.log(`  ℹ️ Verified existing user: ${user.email} (${user.role}) -> UID: ${uid}`);
        } catch (signInErr) {
          console.log(`  ⚠️ User exists (${user.email}) - using local reference UID: ${uid}`);
        }
      } else {
        console.warn(`  ⚠️ Auth note for ${user.email}: ${err.message}`);
      }
    }
    userMap[user.username] = { ...user, uid };
  }

  // 2. Firestore: Save Users Collection
  console.log('\n📌 [2/4] Writing Users profiles to Firestore (/users)...');
  for (const key of Object.keys(userMap)) {
    const u = userMap[key];
    await setDoc(doc(db, 'users', u.uid), {
      uid: u.uid,
      username: u.username,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      branchId: u.branchId,
      updatedAt: new Date().toISOString()
    });
    console.log(`  ✓ Saved profile: ${u.email} (${u.role})`);
  }

  // 3. Firestore: Branch, Floors & Tables
  console.log('\n📌 [3/4] Writing Single Location & Layout to Firestore (/branches, /floors, /tables)...');
  await setDoc(doc(db, 'branches', BRANCH_DATA.id), BRANCH_DATA);
  console.log(`  ✓ Saved branch: ${BRANCH_DATA.name}`);

  for (const floor of FLOORS_DATA) {
    await setDoc(doc(db, 'floors', floor.id), floor);
  }
  console.log(`  ✓ Saved ${FLOORS_DATA.length} floors`);

  for (const table of TABLES_DATA) {
    await setDoc(doc(db, 'tables', table.id), table);
  }
  console.log(`  ✓ Saved ${TABLES_DATA.length} tables in Gulberg Greens`);

  // 4. Firestore: Menu Items & Settings
  console.log('\n📌 [4/4] Writing Authentic Haandi Menu & System Rules (/menu, /settings)...');
  for (const item of MENU_ITEMS) {
    await setDoc(doc(db, 'menu', item.id), {
      ...item,
      branchesAvailable: ['br-isb'],
      updatedAt: new Date().toISOString()
    });
  }
  console.log(`  ✓ Saved ${MENU_ITEMS.length} authentic Haandi menu items`);

  // System Rules
  await setDoc(doc(db, 'settings', 'system_rules'), {
    singleLocation: true,
    activeBranchId: 'br-isb',
    branchName: 'Haandi by Yumto - Gulberg Greens, Islamabad',
    address: 'Gulberg Greens, Civic Center, Executive Block, Islamabad',
    phone: '0330 0500600',
    ntn: '4585147-3',
    deliveryRadiusKm: 2.5,
    advancePrepaymentOnly: true,
    salesTax: {
      cardOrOnlinePercent: 5,
      cashPercent: 16
    },
    defaultPasswordHint: 'Haandi@2026',
    updatedAt: new Date().toISOString()
  });
  console.log('  ✓ Saved global system rules (/settings/system_rules)');

  console.log('\n🎉 ALL FIREBASE DATABASE COLLECTIONS & AUTH ACCOUNTS ARE LIVE & CONFIGURED!\n');
}

seedFirebase().then(() => {
  process.exit(0);
}).catch(err => {
  console.error('❌ Seeding error:', err);
  process.exit(1);
});
