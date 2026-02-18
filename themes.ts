export interface Theme {
  id: string;
  name: string;
  icon: string;
  colors: {
    bg: string;
    bgAlt: string;
    bgCard: string;
    canvas: string;
    canvasGradient?: string;
    border: string;
    borderLight: string;
    text: string;
    textMuted: string;
    textDim: string;
    primary: string;
    primaryHover: string;
    primaryLight: string;
    secondary: string;
    secondaryHover: string;
    accent: string;
    accentHover: string;
    warning: string;
    warningHover: string;
  };
}

export const themes: Record<string, Theme> = {
  classic: {
    id: 'classic',
    name: 'Classic Dark',
    icon: '🌙',
    colors: {
      bg: '#171717',
      bgAlt: '#262626',
      bgCard: '#171717cc',
      canvas: '#0a0a0a',
      canvasGradient:
        'radial-gradient(ellipse at center, #1a1a1a 0%, #0a0a0a 50%, #000000 100%)',
      border: '#404040',
      borderLight: '#525252',
      text: '#ffffff',
      textMuted: '#a3a3a3',
      textDim: '#525252',
      primary: '#10b981',
      primaryHover: '#059669',
      primaryLight: '#10b98170',
      secondary: '#525252',
      secondaryHover: '#737373',
      accent: '#6366f1',
      accentHover: '#4f46e5',
      warning: '#f59e0b',
      warningHover: '#d97706',
    },
  },
  casino: {
    id: 'casino',
    name: 'Casino Red',
    icon: '🎰',
    colors: {
      bg: '#1a0a0a',
      bgAlt: '#2a1515',
      bgCard: '#1a0a0acc',
      canvas: '#0f0505',
      canvasGradient:
        'radial-gradient(ellipse at top, #2a0a0a 0%, #1a0505 40%, #0a0000 100%)',
      border: '#dc2626',
      borderLight: '#ef4444',
      text: '#fef2f2',
      textMuted: '#fca5a5',
      textDim: '#7f1d1d',
      primary: '#dc2626',
      primaryHover: '#b91c1c',
      primaryLight: '#dc262670',
      secondary: '#92400e',
      secondaryHover: '#b45309',
      accent: '#fbbf24',
      accentHover: '#f59e0b',
      warning: '#ea580c',
      warningHover: '#c2410c',
    },
  },
  felt: {
    id: 'felt',
    name: 'Green Felt',
    icon: '♠️',
    colors: {
      bg: '#0a2e1e',
      bgAlt: '#144a32',
      bgCard: '#0a2e1ecc',
      canvas: '#051810',
      canvasGradient:
        'radial-gradient(ellipse at center, #0a3520 0%, #051810 50%, #020a05 100%)',
      border: '#16a34a',
      borderLight: '#22c55e',
      text: '#f0fdf4',
      textMuted: '#86efac',
      textDim: '#14532d',
      primary: '#16a34a',
      primaryHover: '#15803d',
      primaryLight: '#16a34a70',
      secondary: '#065f46',
      secondaryHover: '#047857',
      accent: '#eab308',
      accentHover: '#ca8a04',
      warning: '#f59e0b',
      warningHover: '#d97706',
    },
  },
  ocean: {
    id: 'ocean',
    name: 'Ocean Blue',
    icon: '🌊',
    colors: {
      bg: '#0c1929',
      bgAlt: '#1e293b',
      bgCard: '#0c1929cc',
      canvas: '#020617',
      canvasGradient:
        'radial-gradient(ellipse at bottom, #0c2540 0%, #051428 50%, #020617 100%)',
      border: '#0ea5e9',
      borderLight: '#38bdf8',
      text: '#f0f9ff',
      textMuted: '#7dd3fc',
      textDim: '#082f49',
      primary: '#0ea5e9',
      primaryHover: '#0284c7',
      primaryLight: '#0ea5e970',
      secondary: '#334155',
      secondaryHover: '#475569',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      warning: '#f97316',
      warningHover: '#ea580c',
    },
  },
  royal: {
    id: 'royal',
    name: 'Royal Purple',
    icon: '👑',
    colors: {
      bg: '#1e0a2e',
      bgAlt: '#2e1a3e',
      bgCard: '#1e0a2ecc',
      canvas: '#0f051a',
      canvasGradient:
        'radial-gradient(ellipse at center, #2a1040 0%, #15082a 50%, #0a0415 100%)',
      border: '#a855f7',
      borderLight: '#c084fc',
      text: '#faf5ff',
      textMuted: '#d8b4fe',
      textDim: '#581c87',
      primary: '#a855f7',
      primaryHover: '#9333ea',
      primaryLight: '#a855f770',
      secondary: '#6b21a8',
      secondaryHover: '#7e22ce',
      accent: '#f59e0b',
      accentHover: '#d97706',
      warning: '#ec4899',
      warningHover: '#db2777',
    },
  },
  sunset: {
    id: 'sunset',
    name: 'Sunset Blaze',
    icon: '🌅',
    colors: {
      bg: '#2a1410',
      bgAlt: '#3d2015',
      bgCard: '#2a1410cc',
      canvas: '#1a0a05',
      canvasGradient:
        'linear-gradient(135deg, #4a1a0a 0%, #2a0f0a 50%, #1a0505 100%)',
      border: '#f97316',
      borderLight: '#fb923c',
      text: '#fff7ed',
      textMuted: '#fed7aa',
      textDim: '#7c2d12',
      primary: '#f97316',
      primaryHover: '#ea580c',
      primaryLight: '#f9731670',
      secondary: '#92400e',
      secondaryHover: '#b45309',
      accent: '#eab308',
      accentHover: '#ca8a04',
      warning: '#dc2626',
      warningHover: '#b91c1c',
    },
  },
  midnight: {
    id: 'midnight',
    name: 'Midnight Sky',
    icon: '✨',
    colors: {
      bg: '#0f1419',
      bgAlt: '#1c2128',
      bgCard: '#0f1419cc',
      canvas: '#050810',
      canvasGradient:
        'linear-gradient(180deg, #0a1628 0%, #050a15 50%, #020408 100%)',
      border: '#3b82f6',
      borderLight: '#60a5fa',
      text: '#f0f9ff',
      textMuted: '#93c5fd',
      textDim: '#1e3a8a',
      primary: '#3b82f6',
      primaryHover: '#2563eb',
      primaryLight: '#3b82f670',
      secondary: '#475569',
      secondaryHover: '#64748b',
      accent: '#8b5cf6',
      accentHover: '#7c3aed',
      warning: '#f59e0b',
      warningHover: '#d97706',
    },
  },
  neon: {
    id: 'neon',
    name: 'Neon Nights',
    icon: '🔮',
    colors: {
      bg: '#0a0a0a',
      bgAlt: '#1a1a1a',
      bgCard: '#0a0a0acc',
      canvas: '#000000',
      canvasGradient:
        'radial-gradient(ellipse at center, #1a0a2a 0%, #0a0514 40%, #000000 100%)',
      border: '#a855f7',
      borderLight: '#c084fc',
      text: '#faf5ff',
      textMuted: '#e9d5ff',
      textDim: '#581c87',
      primary: '#c026d3',
      primaryHover: '#a21caf',
      primaryLight: '#c026d370',
      secondary: '#6b21a8',
      secondaryHover: '#7e22ce',
      accent: '#06b6d4',
      accentHover: '#0891b2',
      warning: '#ec4899',
      warningHover: '#db2777',
    },
  },
  forest: {
    id: 'forest',
    name: 'Deep Forest',
    icon: '🌲',
    colors: {
      bg: '#0a1f0a',
      bgAlt: '#152e15',
      bgCard: '#0a1f0acc',
      canvas: '#050a05',
      canvasGradient:
        'linear-gradient(180deg, #0f2a0f 0%, #081808 50%, #030803 100%)',
      border: '#10b981',
      borderLight: '#34d399',
      text: '#f0fdf4',
      textMuted: '#86efac',
      textDim: '#14532d',
      primary: '#10b981',
      primaryHover: '#059669',
      primaryLight: '#10b98170',
      secondary: '#166534',
      secondaryHover: '#15803d',
      accent: '#84cc16',
      accentHover: '#65a30d',
      warning: '#f59e0b',
      warningHover: '#d97706',
    },
  },
};

export const getTheme = (id: string): Theme => {
  return themes[id] || themes.classic;
};
