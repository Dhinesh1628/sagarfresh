export const theme = {
  colors: {
    primary: '#d11243',         // GoMeat Crimson
    primaryHover: '#b80f3b',
    primaryLight: '#fff1f2',
    
    fleetDark: '#0f172a',       // Deep Fleet Navy
    fleetNavy: '#1e293b',
    fleetCard: '#1e293b',
    fleetBorder: '#334155',
    
    emerald: '#10b981',         // Verified / Safe
    emeraldLight: '#ecfdf5',
    emeraldBg: '#064e3b',
    
    amber: '#f59e0b',           // Pending / In Transit
    amberLight: '#fffbeb',
    amberBg: '#78350f',
    
    sky: '#0284c7',             // Cold Chain Telemetry
    skyLight: '#f0f9ff',
    
    bg: '#0f172a',              // Outdoor Dark-Optimized Default
    surface: '#1e293b',
    surfaceSubtle: '#334155',
    
    text: '#ffffff',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    border: '#334155',
    borderStrong: '#475569',
    
    danger: '#ef4444',
    dangerBg: '#7f1d1d',
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
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 3,
    },
    modal: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.4,
      shadowRadius: 16,
      elevation: 8,
    },
  },
};
