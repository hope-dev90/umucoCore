export const colors = {
  primary: '#8D493A',
  primaryDark: '#3E2723',
  primarySoft: '#FCDFD3',
  bgMain: '#FDFBF7',
  bgCard: '#FFFFFF',
  bgSidebar: '#FFFFFF',
  bgDark: '#3E2723',
  textPrimary: '#2C1A14',
  textSecondary: '#6F5B55',
  textMuted: '#8A7B73',
  border: '#EADBC8',
  borderLight: '#F1ECE6',
  success: '#2F6B4F',
  danger: '#991B1B',
  white: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
