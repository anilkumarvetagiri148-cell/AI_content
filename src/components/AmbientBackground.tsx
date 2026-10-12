import React, { createContext, useContext, useState, useEffect } from 'react';

export type BackgroundThemeId =
  | 'aurora-prism'
  | 'cyber-sunset'
  | 'ocean-nebula'
  | 'royal-velvet'
  | 'solar-flare';

export interface BackgroundThemeOption {
  id: BackgroundThemeId;
  name: string;
  tagline: string;
  previewGradient: string;
  baseGradient: string;
  orb1: string;
  orb2: string;
  orb3: string;
  orb4: string;
  beamColor: string;
  gridColor: string;
}

export const BACKGROUND_THEMES: BackgroundThemeOption[] = [
  {
    id: 'aurora-prism',
    name: 'Aurora Prism Mesh',
    tagline: 'Electric Violet, Cyber Cyan & Sunset Coral',
    previewGradient: 'linear-gradient(135deg, #7C4DFF 0%, #06B6D4 50%, #FF7A1A 100%)',
    baseGradient:
      'radial-gradient(ellipse 90% 60% at 15% 10%, rgba(124, 77, 255, 0.34) 0%, transparent 60%), radial-gradient(ellipse 80% 55% at 88% 15%, rgba(6, 182, 212, 0.28) 0%, transparent 60%), radial-gradient(ellipse 75% 60% at 80% 85%, rgba(255, 122, 26, 0.25) 0%, transparent 65%), radial-gradient(ellipse 85% 65% at 15% 88%, rgba(217, 70, 239, 0.24) 0%, transparent 65%), linear-gradient(160deg, #0D0726 0%, #160D3D 35%, #0C1E3E 70%, #12082B 100%)',
    orb1: 'rgba(139, 92, 246, 0.42)',
    orb2: 'rgba(6, 182, 212, 0.34)',
    orb3: 'rgba(255, 122, 26, 0.32)',
    orb4: 'rgba(236, 72, 153, 0.30)',
    beamColor: 'rgba(157, 123, 255, 0.22)',
    gridColor: 'rgba(157, 123, 255, 0.08)',
  },
  {
    id: 'cyber-sunset',
    name: 'Neon Sunset Horizon',
    tagline: 'Radiant Magenta, Warm Coral & Deep Plum',
    previewGradient: 'linear-gradient(135deg, #F43F5E 0%, #FF7A1A 50%, #9333EA 100%)',
    baseGradient:
      'radial-gradient(ellipse 90% 60% at 20% 12%, rgba(244, 63, 94, 0.34) 0%, transparent 60%), radial-gradient(ellipse 80% 55% at 85% 18%, rgba(255, 122, 26, 0.32) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 50% 85%, rgba(147, 51, 234, 0.32) 0%, transparent 65%), linear-gradient(160deg, #1A0626 0%, #2D0C3A 40%, #230F36 75%, #120620 100%)',
    orb1: 'rgba(244, 63, 94, 0.38)',
    orb2: 'rgba(255, 122, 26, 0.36)',
    orb3: 'rgba(168, 85, 247, 0.38)',
    orb4: 'rgba(236, 72, 153, 0.32)',
    beamColor: 'rgba(255, 122, 26, 0.24)',
    gridColor: 'rgba(244, 63, 94, 0.08)',
  },
  {
    id: 'ocean-nebula',
    name: 'Bioluminescent Nebula',
    tagline: 'Emerald Teal, Sapphire Blue & Electric Indigo',
    previewGradient: 'linear-gradient(135deg, #10B981 0%, #06B6D4 50%, #6366F1 100%)',
    baseGradient:
      'radial-gradient(ellipse 90% 60% at 15% 12%, rgba(6, 182, 212, 0.34) 0%, transparent 60%), radial-gradient(ellipse 85% 55% at 85% 15%, rgba(16, 185, 129, 0.28) 0%, transparent 60%), radial-gradient(ellipse 80% 65% at 50% 85%, rgba(99, 102, 241, 0.32) 0%, transparent 65%), linear-gradient(160deg, #051329 0%, #0B2545 40%, #101942 75%, #070F26 100%)',
    orb1: 'rgba(6, 182, 212, 0.38)',
    orb2: 'rgba(16, 185, 129, 0.32)',
    orb3: 'rgba(99, 102, 241, 0.38)',
    orb4: 'rgba(59, 130, 246, 0.32)',
    beamColor: 'rgba(6, 182, 212, 0.22)',
    gridColor: 'rgba(56, 189, 248, 0.08)',
  },
  {
    id: 'royal-velvet',
    name: 'Imperial Amethyst & Gold',
    tagline: 'Luxe Royal Purple, Champagne Gold & Velvet',
    previewGradient: 'linear-gradient(135deg, #8B5CF6 0%, #F59E0B 55%, #EC4899 100%)',
    baseGradient:
      'radial-gradient(ellipse 90% 60% at 18% 10%, rgba(139, 92, 246, 0.38) 0%, transparent 60%), radial-gradient(ellipse 75% 55% at 85% 16%, rgba(245, 158, 11, 0.28) 0%, transparent 60%), radial-gradient(ellipse 80% 60% at 60% 88%, rgba(217, 70, 239, 0.28) 0%, transparent 65%), linear-gradient(160deg, #120828 0%, #24104E 42%, #1C0D3B 75%, #0E0620 100%)',
    orb1: 'rgba(139, 92, 246, 0.44)',
    orb2: 'rgba(245, 158, 11, 0.30)',
    orb3: 'rgba(217, 70, 239, 0.32)',
    orb4: 'rgba(124, 77, 255, 0.36)',
    beamColor: 'rgba(245, 158, 11, 0.20)',
    gridColor: 'rgba(167, 139, 250, 0.08)',
  },
  {
    id: 'solar-flare',
    name: 'Cosmic Solar Flare',
    tagline: 'Crimson Rose, Electric Orange & Deep Violet',
    previewGradient: 'linear-gradient(135deg, #FF5500 0%, #E11D48 50%, #7C4DFF 100%)',
    baseGradient:
      'radial-gradient(ellipse 85% 60% at 82% 12%, rgba(255, 85, 0, 0.34) 0%, transparent 60%), radial-gradient(ellipse 80% 55% at 18% 18%, rgba(225, 29, 72, 0.30) 0%, transparent 60%), radial-gradient(ellipse 85% 65% at 45% 85%, rgba(124, 77, 255, 0.34) 0%, transparent 65%), linear-gradient(160deg, #190724 0%, #2B0B30 38%, #1A0E3D 74%, #0E061E 100%)',
    orb1: 'rgba(255, 90, 26, 0.38)',
    orb2: 'rgba(225, 29, 72, 0.34)',
    orb3: 'rgba(124, 77, 255, 0.38)',
    orb4: 'rgba(249, 115, 22, 0.30)',
    beamColor: 'rgba(255, 122, 26, 0.25)',
    gridColor: 'rgba(251, 113, 133, 0.08)',
  },
];

interface ThemeContextValue {
  themeId: BackgroundThemeId;
  setThemeId: (id: BackgroundThemeId) => void;
  currentTheme: BackgroundThemeOption;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeId: 'aurora-prism',
  setThemeId: () => {},
  currentTheme: BACKGROUND_THEMES[0],
});

export const useBackgroundTheme = () => useContext(ThemeContext);

export const BackgroundThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeIdState] = useState<BackgroundThemeId>(() => {
    const saved = localStorage.getItem('cc_bg_theme') as BackgroundThemeId | null;
    if (saved && BACKGROUND_THEMES.some((t) => t.id === saved)) {
      return saved;
    }
    return 'aurora-prism';
  });

  const setThemeId = (id: BackgroundThemeId) => {
    setThemeIdState(id);
    localStorage.setItem('cc_bg_theme', id);
  };

  useEffect(() => {
    const active = BACKGROUND_THEMES.find((t) => t.id === themeId) || BACKGROUND_THEMES[0];
    document.body.style.background = active.baseGradient;
    document.body.style.backgroundAttachment = 'fixed';
  }, [themeId]);

  const currentTheme = BACKGROUND_THEMES.find((t) => t.id === themeId) || BACKGROUND_THEMES[0];

  return (
    <ThemeContext.Provider value={{ themeId, setThemeId, currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const AmbientBackground: React.FC = () => {
  const { currentTheme } = useBackgroundTheme();

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 -z-10 pointer-events-none overflow-hidden transition-all duration-700"
      style={{ background: currentTheme.baseGradient }}
    >
      {/* Top Spotlight Aurora Crown */}
      <div
        className="absolute -top-44 left-1/2 -translate-x-1/2 w-[1100px] h-[480px] rounded-full blur-[130px] opacity-80 transition-all duration-700"
        style={{
          background: `radial-gradient(circle, ${currentTheme.beamColor} 0%, transparent 70%)`,
        }}
      />

      {/* Animated Floating Aurora Orb 1 (Top-Left) */}
      <div
        className="aurora-orb-1 absolute -top-28 -left-28 w-[540px] h-[540px] rounded-full blur-[135px] transition-all duration-700"
        style={{ background: currentTheme.orb1 }}
      />

      {/* Animated Floating Aurora Orb 2 (Top-Right) */}
      <div
        className="aurora-orb-2 absolute top-12 -right-28 w-[520px] h-[520px] rounded-full blur-[140px] transition-all duration-700"
        style={{ background: currentTheme.orb2 }}
      />

      {/* Animated Floating Aurora Orb 3 (Mid-Bottom Right) */}
      <div
        className="aurora-orb-3 absolute bottom-10 right-1/5 w-[500px] h-[500px] rounded-full blur-[145px] transition-all duration-700"
        style={{ background: currentTheme.orb3 }}
      />

      {/* Animated Floating Aurora Orb 4 (Bottom-Left) */}
      <div
        className="aurora-orb-1 absolute -bottom-32 left-10 w-[480px] h-[480px] rounded-full blur-[140px] transition-all duration-700"
        style={{ background: currentTheme.orb4 }}
      />

      {/* Diagonal Iridescent Light Ribbon */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            'linear-gradient(125deg, transparent 20%, rgba(157, 123, 255, 0.08) 42%, rgba(6, 182, 212, 0.09) 53%, rgba(255, 122, 26, 0.07) 64%, transparent 82%)',
        }}
      />

      {/* Futuristic Architectural Grid Pattern with Radial Mask */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `linear-gradient(to right, ${currentTheme.gridColor} 1px, transparent 1px), linear-gradient(to bottom, ${currentTheme.gridColor} 1px, transparent 1px)`,
          backgroundSize: '56px 56px',
          maskImage:
            'radial-gradient(ellipse 85% 75% at 50% 35%, rgba(0,0,0,0.85) 20%, transparent 90%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 85% 75% at 50% 35%, rgba(0,0,0,0.85) 20%, transparent 90%)',
        }}
      />

      {/* Subtle Glowing Starlight Constellation Dots */}
      <div
        className="absolute inset-0 opacity-35"
        style={{
          backgroundImage:
            'radial-gradient(rgba(255, 255, 255, 0.55) 1px, transparent 1px), radial-gradient(rgba(157, 123, 255, 0.6) 1px, transparent 1px)',
          backgroundSize: '120px 120px, 190px 190px',
          backgroundPosition: '0 0, 45px 65px',
          maskImage: 'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 95%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 80% at 50% 50%, black 30%, transparent 95%)',
        }}
      />
    </div>
  );
};
