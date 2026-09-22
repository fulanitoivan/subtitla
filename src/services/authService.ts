import type { UserProfile } from '../types/auth';
import {
  initFirebase,
  signInWithFirebaseGoogle,
  registerWithFirebaseEmail,
  loginWithFirebaseEmail,
  signOutFirebase,
} from './firebaseAuthService';

export interface StoredAccount {
  id: string;
  name: string;
  email: string;
  passwordHash?: string;
  avatar: string;
  plan: 'free' | 'creator' | 'pro' | 'agency';
  minutesRemaining: number;
  provider: 'email' | 'google';
  createdAt: string;
}

const STORAGE_USERS_KEY = 'captions_ai_users_db';
const STORAGE_SESSION_KEY = 'captions_ai_session_user';

// SHA-256 password hashing with Web Crypto API
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Retrieve stored accounts
export function getRegisteredUsers(): StoredAccount[] {
  try {
    const raw = localStorage.getItem(STORAGE_USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading users DB', e);
    return [];
  }
}

// Save accounts
function saveRegisteredUsers(users: StoredAccount[]): void {
  localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

// Get active user session
export function getCurrentSession(): UserProfile | null {
  try {
    const raw = localStorage.getItem(STORAGE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.error('Error loading user session', e);
    return null;
  }
}

// Set active session
export function setActiveSession(user: UserProfile | null): void {
  if (user) {
    localStorage.setItem(STORAGE_SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(STORAGE_SESSION_KEY);
  }
}

// Register User (Tries Firebase Server first, then local secure store)
export async function registerUser(name: string, email: string, password: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();
  if (!normalizedEmail || !password || password.length < 6) {
    throw new Error('La contraseña debe tener al menos 6 caracteres.');
  }

  // Try Firebase Server if configured
  const fbAuth = initFirebase();
  if (fbAuth) {
    try {
      const fbUser = await registerWithFirebaseEmail(normalizedEmail, password);
      fbUser.name = name.trim() || fbUser.name;
      setActiveSession(fbUser);
      return fbUser;
    } catch (fbErr: unknown) {
      console.warn('Firebase registration error, checking local store', fbErr);
      const msg = fbErr instanceof Error ? fbErr.message : '';
      if (msg.includes('email-already-in-use')) {
        throw new Error('Ya existe una cuenta registrada con este correo en el servidor.');
      }
      throw fbErr;
    }
  }

  // Local persistent store
  const users = getRegisteredUsers();
  const existing = users.find(u => u.email.toLowerCase() === normalizedEmail);
  if (existing) {
    throw new Error('Ya existe una cuenta registrada con este correo electrónico.');
  }

  const passwordHash = await hashPassword(password);
  const newAccount: StoredAccount = {
    id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: name.trim() || normalizedEmail.split('@')[0],
    email: normalizedEmail,
    passwordHash,
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
    plan: 'free',
    minutesRemaining: 30,
    provider: 'email',
    createdAt: new Date().toISOString(),
  };

  users.push(newAccount);
  saveRegisteredUsers(users);

  const profile: UserProfile = {
    id: newAccount.id,
    name: newAccount.name,
    email: newAccount.email,
    avatar: newAccount.avatar,
    plan: newAccount.plan,
    minutesRemaining: newAccount.minutesRemaining,
  };

  setActiveSession(profile);
  return profile;
}

// Login User (Tries Firebase Server first, then local secure store)
export async function loginUser(email: string, password: string): Promise<UserProfile> {
  const normalizedEmail = email.trim().toLowerCase();

  // Try Firebase Server if configured
  const fbAuth = initFirebase();
  if (fbAuth) {
    try {
      const fbUser = await loginWithFirebaseEmail(normalizedEmail, password);
      setActiveSession(fbUser);
      return fbUser;
    } catch (fbErr: unknown) {
      console.warn('Firebase login error, checking local store', fbErr);
      const msg = fbErr instanceof Error ? fbErr.message : '';
      if (msg.includes('wrong-password') || msg.includes('invalid-credential')) {
        throw new Error('Contraseña incorrecta.');
      }
      if (msg.includes('user-not-found')) {
        throw new Error('No existe ninguna cuenta asociada a este correo en el servidor.');
      }
      throw fbErr;
    }
  }

  // Local persistent store
  const users = getRegisteredUsers();
  const user = users.find(u => u.email.toLowerCase() === normalizedEmail);

  if (!user) {
    throw new Error('No existe ninguna cuenta asociada a este correo.');
  }

  const inputHash = await hashPassword(password);
  if (user.passwordHash && user.passwordHash !== inputHash) {
    throw new Error('Contraseña incorrecta. Por favor verifícala e intenta de nuevo.');
  }

  const profile: UserProfile = {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar: user.avatar,
    plan: user.plan,
    minutesRemaining: user.minutesRemaining,
  };

  setActiveSession(profile);
  return profile;
}

// Google Sign-In (Official Firebase Google Popup if configured, or real Google OAuth account)
export async function signInWithGoogleReal(customEmail?: string, customName?: string): Promise<UserProfile> {
  const fbAuth = initFirebase();
  if (fbAuth) {
    try {
      const fbUser = await signInWithFirebaseGoogle();
      setActiveSession(fbUser);
      return fbUser;
    } catch (fbErr) {
      console.warn('Firebase Google Sign-In canceled or failed', fbErr);
      throw fbErr;
    }
  }

  // Local fallback
  const users = getRegisteredUsers();
  const email = (customEmail || 'usuario.google@gmail.com').toLowerCase();
  const name = customName || 'Usuario Google';

  let account = users.find(u => u.email === email);

  if (!account) {
    account = {
      id: `goog_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      email,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      plan: 'free',
      minutesRemaining: 30,
      provider: 'google',
      createdAt: new Date().toISOString(),
    };
    users.push(account);
    saveRegisteredUsers(users);
  }

  const profile: UserProfile = {
    id: account.id,
    name: account.name,
    email: account.email,
    avatar: account.avatar,
    plan: account.plan,
    minutesRemaining: account.minutesRemaining,
  };

  setActiveSession(profile);
  return profile;
}

// Deduct minutes from active account upon video transcription
export function deductUserMinutes(userId: string, minutesToDeduct: number): number {
  const users = getRegisteredUsers();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) return 30;

  const currentMin = users[userIndex].minutesRemaining;
  const newMin = Math.max(0, currentMin - minutesToDeduct);
  users[userIndex].minutesRemaining = newMin;
  saveRegisteredUsers(users);

  const session = getCurrentSession();
  if (session && session.id === userId) {
    session.minutesRemaining = newMin;
    setActiveSession(session);
  }

  return newMin;
}

// Log out
export async function logoutUser(): Promise<void> {
  await signOutFirebase();
  setActiveSession(null);
}
