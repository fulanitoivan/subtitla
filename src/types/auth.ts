export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  plan: 'free' | 'creator' | 'pro' | 'agency';
  minutesRemaining: number;
}

export type AuthMode = 'login' | 'register';
