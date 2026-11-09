export const theme = {
  colors: {
    primary: '#d11243',         // GoMeat Crimson
    primaryHover: '#b80f3b',
    primaryLight: '#fff1f2',
    
    teal: '#0f766e',            // Hub / Ops Dark Store Teal
    tealLight: '#f0fdfa',
    tealBorder: '#99f6e4',
    
    navy: '#0f172a',            // Deep Slate
    navyMuted: '#334155',
    
    emerald: '#10b981',         // Quality Passed / Sanitized
    emeraldLight: '#ecfdf5',
    emeraldBg: '#dcfce7',
    
    amber: '#f59e0b',           // Butchering In Progress
    amberLight: '#fffbeb',
    amberBg: '#fef3c7',
    
    sky: '#0284c7',             // Cold Chain Probe
    skyLight: '#f0f9ff',
    
    bg: '#f8fafc',
    surface: '#ffffff',
    surfaceSubtle: '#f1f5f9',
    
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#94a3b8',
    
    border: '#e2e8f0',
    borderStrong: '#cbd5e1',
    
    danger: '#ef4444',
  },
  typography: {
    weightBold: '700' as const,
    weightSemi: '600' as const,
    weightMedium: '500' as const,
    weightRegular: '400' as const,
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  radius: {
    sm: 6,
    md: 10,
    lg: 14,
    xl: 20,
    full: 9999,
  },
  shadow: {
    card: {
      shadowColor: '#0f172a',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 6,
      elevation: 2,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
