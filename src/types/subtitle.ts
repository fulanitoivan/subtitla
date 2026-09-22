export interface Word {
  id: string;
  word: string;
  start: number; // in seconds
  end: number;   // in seconds
  confidence?: number;
  highlightColor?: string; // custom override per word
  emoji?: string;
}

export interface SubtitleSegment {
  id: string;
  start: number;
  end: number;
  text: string;
  words: Word[];
}

export type AnimationType = 'pop' | 'bounce' | 'glow' | 'fade' | 'none';
export type DisplayMode = 'one-word' | 'two-words' | 'three-words' | 'full-line';

export interface SubtitleStyle {
  id: string;
  name: string;
  fontFamily: string;
  fontSize: number; // in px for base 1080p
  textColor: string;
  highlightColor: string; // Active word color
  secondaryHighlightColor?: string; // Optional alternate
  textTransform: 'uppercase' | 'lowercase' | 'capitalize' | 'none';
  fontWeight: string | number;
  
  // Stroke / Outline
  hasStroke: boolean;
  strokeColor: string;
  strokeWidth: number; // in px
  
  // Background Box / Pill
  hasBackground: boolean;
  backgroundColor: string;
  backgroundOpacity: number; // 0 to 1
  backgroundPadding: number;
  borderRadius: number;
  
  // Shadow & Glow
  hasShadow: boolean;
  shadowColor: string;
  shadowBlur: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  
  // Layout & Positioning
  positionY: number; // percentage from top (0-100), default 75%
  positionX: number; // percentage from left (0-100), default 50%
  maxWidth: number; // max width percentage
  displayMode: DisplayMode;
  
  // Animations
  animation: AnimationType;
  animationScale: number; // e.g. 1.25 for 125% scale on active
  rotateActiveWord: boolean;
  activeWordAngle: number; // e.g. -4 to 4 deg
  
  // Extra elements
  showEmojis: boolean;
}

export interface VideoMetadata {
  name: string;
  duration: number;
  width: number;
  height: number;
  url: string;
  file?: File;
}

export type TranscriptionProvider = 'whisper-local' | 'groq' | 'gemini' | 'demo';

export interface ApiKeys {
  geminiKey: string;
  groqKey: string;
}
