import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
} from 'firebase/auth';
import type { UserProfile } from '../types/auth';

export interface FirebaseConfigOptions {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

// User's active Firebase Cloud configuration
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigOptions = {
  apiKey: 'AIzaSyAa_IytbZRjKY1f-6vEgj-oB3z2CNzxFyU',
  authDomain: 'trancriptor-61621.firebaseapp.com',
  projectId: 'trancriptor-61621',
  storageBucket: 'trancriptor-61621.firebasestorage.app',
  messagingSenderId: '923551532157',
  appId: '1:923551532157:web:ccdbda7cb8518753ef5d14',
};

const STORAGE_FIREBASE_CONFIG = 'captions_ai_firebase_config';

// Retrieve stored custom Firebase configuration or default
export function getStoredFirebaseConfig(): FirebaseConfigOptions {
  try {
    const raw = localStorage.getItem(STORAGE_FIREBASE_CONFIG);
    return raw ? JSON.parse(raw) : DEFAULT_FIREBASE_CONFIG;
  } catch (e) {
    console.error('Error reading firebase config', e);
    return DEFAULT_FIREBASE_CONFIG;
  }
}

// Save Firebase config
export function saveFirebaseConfig(config: FirebaseConfigOptions): void {
  localStorage.setItem(STORAGE_FIREBASE_CONFIG, JSON.stringify(config));
}

let firebaseApp: FirebaseApp | null = null;
let firebaseAuth: Auth | null = null;

// Initialize Firebase client
export function initFirebase(): Auth {
  if (firebaseAuth) return firebaseAuth;

  const config = getStoredFirebaseConfig();

  try {
    if (!getApps().length) {
      firebaseApp = initializeApp(config);
    } else {
      firebaseApp = getApps()[0];
    }
    firebaseAuth = getAuth(firebaseApp);
    return firebaseAuth;
  } catch (err) {
    console.error('Failed to initialize Firebase Auth', err);
    throw err;
  }
}

// Convert Firebase User to App UserProfile
export function mapFirebaseUserToProfile(user: User): UserProfile {
  return {
    id: user.uid,
    name: user.displayName || user.email?.split('@')[0] || 'Usuario',
    email: user.email || '',
    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.email || user.uid)}`,
    plan: 'free',
    minutesRemaining: 30,
  };
}

// Real Google Sign-In with Firebase Popup
export async function signInWithFirebaseGoogle(): Promise<UserProfile> {
  const auth = initFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const credential = await signInWithPopup(auth, provider);
  return mapFirebaseUserToProfile(credential.user);
}

// Real Email Registration on Firebase Server
export async function registerWithFirebaseEmail(email: string, pass: string): Promise<UserProfile> {
  const auth = initFirebase();
  const credential = await createUserWithEmailAndPassword(auth, email, pass);
  return mapFirebaseUserToProfile(credential.user);
}

// Real Email Login on Firebase Server
export async function loginWithFirebaseEmail(email: string, pass: string): Promise<UserProfile> {
  const auth = initFirebase();
  const credential = await signInWithEmailAndPassword(auth, email, pass);
  return mapFirebaseUserToProfile(credential.user);
}

// Real Logout from Firebase
export async function signOutFirebase(): Promise<void> {
  if (!firebaseAuth) {
    try {
      initFirebase();
    } catch {
      // ignore
    }
  }
  if (firebaseAuth) {
    await signOut(firebaseAuth);
  }
}
