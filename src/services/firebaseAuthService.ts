import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged,
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

// Parse Firebase Auth errors into clear Spanish messages
export function parseFirebaseAuthError(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'code' in err) {
    const code = (err as { code: string }).code;
    switch (code) {
      case 'auth/popup-blocked':
        return 'El navegador bloqueó la ventana emergente. Hemos iniciado la autenticación por redirección.';
      case 'auth/popup-closed-by-user':
        return 'Se cerró la ventana de Google antes de finalizar el acceso.';
      case 'auth/cancelled-popup-request':
        return 'Se canceló la solicitud de autenticación anterior.';
      case 'auth/email-already-in-use':
        return 'Ya existe una cuenta con este correo electrónico.';
      case 'auth/wrong-password':
      case 'auth/invalid-credential':
        return 'Contraseña o credenciales incorrectas.';
      case 'auth/user-not-found':
        return 'No se encontró ninguna cuenta con este correo.';
      case 'auth/weak-password':
        return 'La contraseña es muy débil (mínimo 6 caracteres).';
      case 'auth/unauthorized-domain':
        return 'Dominio no autorizado en Firebase. Añade el dominio en la consola de Firebase.';
      default:
        break;
    }
  }
  return err instanceof Error ? err.message : 'Error de autenticación con Firebase.';
}

// Real Google Sign-In with Popup and Automatic Redirect Fallback
export async function signInWithFirebaseGoogle(onRedirecting?: () => void): Promise<UserProfile> {
  const auth = initFirebase();
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const credential = await signInWithPopup(auth, provider);
    return mapFirebaseUserToProfile(credential.user);
  } catch (err: unknown) {
    const errorCode = typeof err === 'object' && err !== null && 'code' in err ? (err as { code: string }).code : '';
    const errorMsg = err instanceof Error ? err.message : '';

    // If popup is blocked by Safari/Chrome or user agent, fallback to redirect
    if (errorCode === 'auth/popup-blocked' || errorMsg.includes('popup-blocked')) {
      console.warn('Popup blocked by browser. Falling back to signInWithRedirect...');
      if (onRedirecting) {
        onRedirecting();
      }
      await signInWithRedirect(auth, provider);
      // Return a pending promise while the browser navigates to Google
      return new Promise(() => {});
    }

    throw new Error(parseFirebaseAuthError(err));
  }
}

// Check for redirect result on app initialization (when user returns from Google OAuth redirect)
export async function checkFirebaseRedirectResult(): Promise<UserProfile | null> {
  try {
    const auth = initFirebase();
    const result = await getRedirectResult(auth);
    if (result && result.user) {
      return mapFirebaseUserToProfile(result.user);
    }
  } catch (err) {
    console.error('Error handling Firebase redirect result:', err);
  }
  return null;
}

// Subscribe to Firebase Auth state updates
export function subscribeToFirebaseAuthState(callback: (user: UserProfile | null) => void): () => void {
  try {
    const auth = initFirebase();
    return onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        callback(mapFirebaseUserToProfile(firebaseUser));
      } else {
        callback(null);
      }
    });
  } catch (err) {
    console.error('Error subscribing to Firebase auth state:', err);
    return () => {};
  }
}

// Real Email Registration on Firebase Server
export async function registerWithFirebaseEmail(email: string, pass: string): Promise<UserProfile> {
  const auth = initFirebase();
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, pass);
    return mapFirebaseUserToProfile(credential.user);
  } catch (err) {
    throw new Error(parseFirebaseAuthError(err));
  }
}

// Real Email Login on Firebase Server
export async function loginWithFirebaseEmail(email: string, pass: string): Promise<UserProfile> {
  const auth = initFirebase();
  try {
    const credential = await signInWithEmailAndPassword(auth, email, pass);
    return mapFirebaseUserToProfile(credential.user);
  } catch (err) {
    throw new Error(parseFirebaseAuthError(err));
  }
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
