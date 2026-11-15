import { Platform, ViewStyle } from 'react-native';
import { Category, Priority } from './types';

// Direction artistique « carnet » : papier crème, lignes bleues, marge orange,
// titres en Nunito (arrondie), feutre orange pour cocher et barrer.
export const colors = {
  primary: '#FE5410', // feutre orange (10 %)
  primarySoft: 'rgba(254, 84, 16, 0.08)',
  primaryBorder: 'rgba(254, 84, 16, 0.16)',
  highlighter: 'rgba(254, 84, 16, 0.22)',
  brandBlue: '#00AEE4',
  paper: '#FBF8F1', // fond papier (60 %)
  paperDeep: '#F3EEE2',
  rule: 'rgba(0, 174, 228, 0.18)', // lignes du cahier
  margin: 'rgba(254, 84, 16, 0.45)', // marge rouge-orangée
  postIt: '#FFE8A3',
  postItShadow: '#B8913A',
  background: '#FBF8F1',
  surface: '#FFFFFF',
  ink: '#1F2A44', // encre bleu nuit (30 %)
  text: 'rgba(31, 42, 68, 0.92)',
  textMuted: 'rgba(31, 42, 68, 0.62)',
  textSubtle: 'rgba(31, 42, 68, 0.40)',
  border: 'rgba(31, 42, 68, 0.10)',
  danger: '#E5484D',
  dangerSoft: 'rgba(229, 72, 77, 0.08)',
  white: '#FFFFFF',
};

// Grille de 4/8 points.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

// Géométrie du cahier : hauteur d'une ligne et position de la marge.
export const notebook = { line: 56, margin: 56 };

export const radius = { sm: 12, md: 16, lg: 24, pill: 999 };

// Système : 4 tailles, 2 graisses. Police d'accent (Nunito, arrondie) : 3 tailles,
// toujours avec une hauteur de ligne explicite pour éviter que le texte soit rogné.
export const font = {
  display: 32,
  title: 20,
  body: 16,
  caption: 13,
  regular: '400' as const,
  bold: '700' as const,
  hand: 'Nunito_600SemiBold',
  handBold: 'Nunito_800ExtraBold',
  handXL: 28,
  handXLLine: 36,
  handM: 22,
  handMLine: 30,
  handL: 18,
  handLLine: 26,
};

export const priorities: Record<Priority, { label: string; color: string; marks: string }> = {
  haute: { label: 'Haute', color: '#E5484D', marks: '!!!' },
  moyenne: { label: 'Moyenne', color: '#F5A524', marks: '!!' },
  basse: { label: 'Basse', color: '#12A594', marks: '!' },
};

export const categories: Record<Category, { label: string; emoji: string; bg: string; fg: string }> = {
  travail: { label: 'Travail', emoji: '💼', bg: '#E6F4FE', fg: '#0B68CB' },
  perso: { label: 'Personnel', emoji: '🌿', bg: '#EFEAFE', fg: '#6E56CF' },
  courses: { label: 'Courses', emoji: '🛒', bg: '#E6F6EB', fg: '#18794E' },
  autre: { label: 'Autre', emoji: '✨', bg: '#FDEBF3', fg: '#C2298A' },
};

// Ombres douces, teintées (jamais noir pur).
export const shadow = (tint = '#5C4A2A', strength = 1): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: tint,
      shadowOffset: { width: 0, height: 6 * strength },
      shadowOpacity: 0.1 * strength,
      shadowRadius: 12 * strength,
    },
    default: { elevation: 3 * strength, shadowColor: tint },
  })!;
