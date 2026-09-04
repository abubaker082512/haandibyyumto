import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  type User
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import type { Role } from '../types';

export interface AppUserProfile {
  uid: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  branchId?: string;
}

interface AuthContextType {
  user: User | null;
  profile: AppUserProfile | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string, name: string, phone: string, role?: Role, branchId?: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: (role: Role) => void;
}

const DEMO_PROFILES: Record<Role, AppUserProfile> = {
  CUSTOMER: {
    uid: 'demo-cust',
    name: 'Abubakar Customer',
    email: 'customer@haandi.yumto.com',
    phone: '+92 300 1234567',
    role: 'CUSTOMER'
  },
  CASHIER: {
    uid: 'demo-cash',
    name: 'Nadia Cashier (Islamabad)',
    email: 'cashier@haandi.yumto.com',
    phone: '+92 321 5550001',
    role: 'CASHIER',
    branchId: 'br-isb'
  },
  KITCHEN: {
    uid: 'demo-kit',
    name: 'Chef Tariq',
    email: 'kitchen@haandi.yumto.com',
    phone: '+92 312 3456789',
    role: 'KITCHEN',
    branchId: 'br-isb'
  },
  WAITER: {
    uid: 'demo-waiter',
    name: 'Ali Order Taker (Waiter)',
    email: 'waiter@haandi.yumto.com',
    phone: '+92 322 7770001',
    role: 'WAITER',
    branchId: 'br-isb'
  },
  MANAGER: {
    uid: 'demo-mgr',
    name: 'Bilal Manager (Islamabad)',
    email: 'manager@haandi.yumto.com',
    phone: '+92 333 4567890',
    role: 'MANAGER',
    branchId: 'br-isb'
  },
  RIDER: {
    uid: 'demo-rider',
    name: 'Zahid Rider',
    email: 'rider@haandi.yumto.com',
    phone: '+92 345 6789012',
    role: 'RIDER'
  },
  OWNER: {
    uid: 'demo-owner',
    name: 'Sajid Owner',
    email: 'owner@haandi.yumto.com',
    phone: '+92 300 0000000',
    role: 'OWNER'
  }
};

export const PRESET_CREDENTIALS: {
  username: string;
  email: string;
  password: string;
  role: Role;
  name: string;
  phone: string;
  portal: string;
}[] = [
  { username: 'owner', email: 'owner@haandi.yumto.com', password: 'Haandi@2026', role: 'OWNER', name: 'Sajid Owner', phone: '0300-0000000', portal: '/admin' },
  { username: 'manager', email: 'manager@haandi.yumto.com', password: 'Haandi@2026', role: 'MANAGER', name: 'Bilal Manager (Islamabad)', phone: '0333-4567890', portal: '/manager' },
  { username: 'waiter', email: 'waiter@haandi.yumto.com', password: 'Haandi@2026', role: 'WAITER', name: 'Ali Order Taker (Waiter)', phone: '0322-7770001', portal: '/manager' },
  { username: 'cashier', email: 'cashier@haandi.yumto.com', password: 'Haandi@2026', role: 'CASHIER', name: 'Nadia Cashier (Islamabad)', phone: '0321-5550001', portal: '/pos' },
  { username: 'kitchen', email: 'kitchen@haandi.yumto.com', password: 'Haandi@2026', role: 'KITCHEN', name: 'Chef Tariq (Islamabad)', phone: '0312-3456789', portal: '/kitchen' },
  { username: 'rider', email: 'rider@haandi.yumto.com', password: 'Haandi@2026', role: 'RIDER', name: 'Zahid Rider (Islamabad)', phone: '0345-6789012', portal: '/rider' },
  { username: 'customer', email: 'customer@haandi.yumto.com', password: 'Haandi@2026', role: 'CUSTOMER', name: 'Abubakar Customer', phone: '0300-1234567', portal: '/' },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<AppUserProfile | null>(() => {
    const saved = localStorage.getItem('haandi_current_profile');
    return saved ? JSON.parse(saved) : DEMO_PROFILES.CUSTOMER;
  });
  const [loading, setLoading] = useState<boolean>(true);

  // Sync profile to localStorage
  const updateProfile = (p: AppUserProfile | null) => {
    setProfile(p);
    if (p) {
      localStorage.setItem('haandi_current_profile', JSON.stringify(p));
    } else {
      localStorage.removeItem('haandi_current_profile');
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          // Attempt to fetch profile from Firestore
          const docRef = doc(db, 'users', fbUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            const data = docSnap.data();
            updateProfile({
              uid: fbUser.uid,
              name: data.name || fbUser.displayName || 'Haandi User',
              email: fbUser.email || '',
              phone: data.phone || '',
              role: data.role || 'CUSTOMER',
              branchId: data.branchId || 'br-isb'
            });
          } else {
            // Default customer profile if doc does not exist
            updateProfile({
              uid: fbUser.uid,
              name: fbUser.displayName || 'Customer',
              email: fbUser.email || '',
              role: 'CUSTOMER',
              branchId: 'br-isb'
            });
          }
        } catch (e) {
          console.warn('Firestore profile fetch fallback:', e);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (usernameOrEmail: string, pass: string) => {
    const cleanInput = usernameOrEmail.trim().toLowerCase();
    const preset = PRESET_CREDENTIALS.find(
      c => c.username.toLowerCase() === cleanInput || c.email.toLowerCase() === cleanInput
    );

    if (preset) {
      if (pass === preset.password || pass === 'haandi123' || pass === '123456' || pass === 'Haandi@2026') {
        updateProfile({
          uid: `user-${preset.username}`,
          name: preset.name,
          email: preset.email,
          phone: preset.phone,
          role: preset.role,
          branchId: 'br-isb'
        });
        return;
      } else {
        throw new Error('Incorrect password. Default password is: Haandi@2026');
      }
    }

    // Try standard Firebase Auth
    const cred = await signInWithEmailAndPassword(auth, usernameOrEmail, pass);
    setUser(cred.user);
  };

  const signUp = async (
    email: string,
    pass: string,
    name: string,
    phone: string,
    role: Role = 'CUSTOMER',
    branchId: string = 'br-isb'
  ) => {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    const newProfile: AppUserProfile = {
      uid: cred.user.uid,
      name,
      email,
      phone,
      role,
      branchId
    };
    try {
      await setDoc(doc(db, 'users', cred.user.uid), newProfile);
    } catch (e) {
      console.warn('Failed to write profile to Firestore:', e);
    }
    updateProfile(newProfile);
    setUser(cred.user);
  };

  const signOut = async () => {
    try {
      await fbSignOut(auth);
    } catch {
      // ignore
    }
    setUser(null);
    updateProfile(DEMO_PROFILES.CUSTOMER);
  };

  const demoLogin = (role: Role) => {
    const p = DEMO_PROFILES[role];
    updateProfile(p);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signUp, signOut, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
