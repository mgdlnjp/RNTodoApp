import { Platform, ViewStyle } from 'react-native';
import { Category, Priority } from './types';

// 60 / 30 / 10 : fond neutre, texte encre, orange OPLA en accent.
export const colors = {
  primary: '#FE5410',
  primarySoft: 'rgba(254, 84, 16, 0.08)',
  primaryBorder: 'rgba(254, 84, 16, 0.16)',
  brandBlue: '#00AEE4',
  background: '#F7F6F4',
  surface: '#FFFFFF',
  ink: '#1C1A19',
  text: 'rgba(28, 26, 25, 0.92)',
  textMuted: 'rgba(28, 26, 25, 0.62)',
  textSubtle: 'rgba(28, 26, 25, 0.40)',
  border: 'rgba(28, 26, 25, 0.08)',
  danger: '#E5484D',
  dangerSoft: 'rgba(229, 72, 77, 0.08)',
  white: '#FFFFFF',
};

// Grille de 4/8 points.
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32, xxxl: 48 };

export const radius = { sm: 12, md: 16, lg: 24, pill: 999 };

// 4 tailles, 2 graisses.
export const font = {
  display: 32,
  title: 20,
  body: 16,
  caption: 13,
  regular: '400' as const,
  bold: '700' as const,
};

export const priorities: Record<Priority, { label: string; color: string }> = {
  haute: { label: 'Haute', color: '#E5484D' },
  moyenne: { label: 'Moyenne', color: '#F5A524' },
  basse: { label: 'Basse', color: '#12A594' },
};

export const categories: Record<Category, { label: string; emoji: string; bg: string; fg: string }> = {
  travail: { label: 'Travail', emoji: '💼', bg: '#E6F4FE', fg: '#0B68CB' },
  perso: { label: 'Personnel', emoji: '🌿', bg: '#EFEAFE', fg: '#6E56CF' },
  courses: { label: 'Courses', emoji: '🛒', bg: '#E6F6EB', fg: '#18794E' },
  autre: { label: 'Autre', emoji: '✨', bg: '#FDEBF3', fg: '#C2298A' },
};

// Ombres douces, teintées (jamais noir pur).
export const shadow = (tint = '#3A2A20', strength = 1): ViewStyle =>
  Platform.select<ViewStyle>({
    ios: {
      shadowColor: tint,
      shadowOffset: { width: 0, height: 8 * strength },
      shadowOpacity: 0.08 * strength,
      shadowRadius: 16 * strength,
    },
    default: { elevation: 3 * strength, shadowColor: tint },
  })!;
