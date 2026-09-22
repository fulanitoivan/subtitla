import type { SubtitleSegment } from '../types/subtitle';

export interface DemoVideoOption {
  id: string;
  title: string;
  description: string;
  url: string;
  duration: number;
  segments: SubtitleSegment[];
}

export const DEMO_VIDEOS: DemoVideoOption[] = [
  {
    id: 'creator-viral-tips',
    title: 'Consejo Viral para Creadores',
    description: 'Video vertical ideal para Reels, TikTok y YouTube Shorts',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    duration: 15.0,
    segments: [
      {
        id: 'seg-1',
        start: 0.0,
        end: 3.2,
        text: 'Si quieres que tus videos se hagan virales',
        words: [
          { id: 'w1', word: 'Si', start: 0.0, end: 0.3 },
          { id: 'w2', word: 'quieres', start: 0.3, end: 0.7 },
          { id: 'w3', word: 'que', start: 0.7, end: 0.9 },
          { id: 'w4', word: 'tus', start: 0.9, end: 1.2 },
          { id: 'w5', word: 'videos', start: 1.2, end: 1.8, emoji: '📹' },
          { id: 'w6', word: 'se', start: 1.8, end: 2.0 },
          { id: 'w7', word: 'hagan', start: 2.0, end: 2.4 },
          { id: 'w8', word: 'virales', start: 2.4, end: 3.2, highlightColor: '#FFE500', emoji: '🚀' },
        ]
      },
      {
        id: 'seg-2',
        start: 3.3,
        end: 6.8,
        text: 'necesitas subtítulos dinámicos que atrapen la atención',
        words: [
          { id: 'w9', word: 'necesitas', start: 3.3, end: 3.9 },
          { id: 'w10', word: 'subtítulos', start: 3.9, end: 4.6, highlightColor: '#38BDF8', emoji: '✨' },
          { id: 'w11', word: 'dinámicos', start: 4.6, end: 5.3, highlightColor: '#00FF66' },
          { id: 'w12', word: 'que', start: 5.3, end: 5.5 },
          { id: 'w13', word: 'atrapen', start: 5.5, end: 6.0 },
          { id: 'w14', word: 'la', start: 6.0, end: 6.2 },
          { id: 'w15', word: 'atención', start: 6.2, end: 6.8, highlightColor: '#F43F5E', emoji: '👀' },
        ]
      },
      {
        id: 'seg-3',
        start: 7.0,
        end: 11.2,
        text: 'El 85% de la gente mira videos sin sonido',
        words: [
          { id: 'w16', word: 'El', start: 7.0, end: 7.3 },
          { id: 'w17', word: '85%', start: 7.3, end: 8.2, highlightColor: '#FFE500', emoji: '🔥' },
          { id: 'w18', word: 'de', start: 8.2, end: 8.4 },
          { id: 'w19', word: 'la', start: 8.4, end: 8.6 },
          { id: 'w20', word: 'gente', start: 8.6, end: 9.1 },
          { id: 'w21', word: 'mira', start: 9.1, end: 9.6 },
          { id: 'w22', word: 'videos', start: 9.6, end: 10.2 },
          { id: 'w23', word: 'sin', start: 10.2, end: 10.6 },
          { id: 'w24', word: 'sonido', start: 10.6, end: 11.2, emoji: '🔇' },
        ]
      },
      {
        id: 'seg-4',
        start: 11.4,
        end: 14.8,
        text: 'Crea tu contenido con inteligencia artificial hoy mismo',
        words: [
          { id: 'w25', word: 'Crea', start: 11.4, end: 11.8 },
          { id: 'w26', word: 'tu', start: 11.8, end: 12.1 },
          { id: 'w27', word: 'contenido', start: 12.1, end: 12.7 },
          { id: 'w28', word: 'con', start: 12.7, end: 13.0 },
          { id: 'w29', word: 'inteligencia', start: 13.0, end: 13.6, highlightColor: '#A855F7', emoji: '⚡' },
          { id: 'w30', word: 'artificial', start: 13.6, end: 14.2, highlightColor: '#A855F7', emoji: '🤖' },
          { id: 'w31', word: 'hoy', start: 14.2, end: 14.5 },
          { id: 'w32', word: 'mismo', start: 14.5, end: 14.8, highlightColor: '#FFE500' },
        ]
      }
    ]
  },
  {
    id: 'tech-growth',
    title: 'Estrategia de Crecimiento Rápido',
    description: 'Demostración de alto ritmo para negocios y marketing',
    url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    duration: 15.0,
    segments: [
      {
        id: 'tech-1',
        start: 0.0,
        end: 4.0,
        text: 'La clave del éxito en redes es la retención',
        words: [
          { id: 'tw1', word: 'La', start: 0.0, end: 0.4 },
          { id: 'tw2', word: 'clave', start: 0.4, end: 0.9, highlightColor: '#00FF66', emoji: '🔑' },
          { id: 'tw3', word: 'del', start: 0.9, end: 1.2 },
          { id: 'tw4', word: 'éxito', start: 1.2, end: 1.8, highlightColor: '#FFE500', emoji: '🏆' },
          { id: 'tw5', word: 'en', start: 1.8, end: 2.1 },
          { id: 'tw6', word: 'redes', start: 2.1, end: 2.7 },
          { id: 'tw7', word: 'es', start: 2.7, end: 3.0 },
          { id: 'tw8', word: 'la', start: 3.0, end: 3.3 },
          { id: 'tw9', word: 'retención', start: 3.3, end: 4.0, highlightColor: '#F43F5E', emoji: '📈' },
        ]
      },
      {
        id: 'tech-2',
        start: 4.2,
        end: 9.0,
        text: 'Cada segundo cuenta para mantener al usuario enganchado',
        words: [
          { id: 'tw10', word: 'Cada', start: 4.2, end: 4.7 },
          { id: 'tw11', word: 'segundo', start: 4.7, end: 5.4, highlightColor: '#38BDF8', emoji: '⏱️' },
          { id: 'tw12', word: 'cuenta', start: 5.4, end: 6.0 },
          { id: 'tw13', word: 'para', start: 6.0, end: 6.4 },
          { id: 'tw14', word: 'mantener', start: 6.4, end: 7.2 },
          { id: 'tw15', word: 'al', start: 7.2, end: 7.5 },
          { id: 'tw16', word: 'usuario', start: 7.5, end: 8.2 },
          { id: 'tw17', word: 'enganchado', start: 8.2, end: 9.0, highlightColor: '#FFE500', emoji: '🪝' },
        ]
      },
      {
        id: 'tech-3',
        start: 9.2,
        end: 14.5,
        text: '¡Prueba diferentes estilos y encuentra tu fórmula ganadora!',
        words: [
          { id: 'tw18', word: '¡Prueba', start: 9.2, end: 9.8, highlightColor: '#A855F7' },
          { id: 'tw19', word: 'diferentes', start: 9.8, end: 10.6 },
          { id: 'tw20', word: 'estilos', start: 10.6, end: 11.4, highlightColor: '#00FF66', emoji: '🎨' },
          { id: 'tw21', word: 'y', start: 11.4, end: 11.7 },
          { id: 'tw22', word: 'encuentra', start: 11.7, end: 12.5 },
          { id: 'tw23', word: 'tu', start: 12.5, end: 12.8 },
          { id: 'tw24', word: 'fórmula', start: 12.8, end: 13.5, highlightColor: '#F43F5E', emoji: '🧪' },
          { id: 'tw25', word: 'ganadora!', start: 13.5, end: 14.5, highlightColor: '#FFE500', emoji: '💯' },
        ]
      }
    ]
  }
];
