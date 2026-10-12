import React, { useState } from 'react';

interface SmartImageProps {
  src: string;
  alt: string;
  category?: string;
  variant?: 'avatar' | 'portfolio';
  className?: string;
  eager?: boolean;
}

const CATEGORY_GRADIENTS: Record<string, [string, string, string]> = {
  'Finance & Investing': ['#064E3B', '#059669', '📈 Finance & Market AI'],
  'Education & E-Learning': ['#1E3A8A', '#3B82F6', '🎓 E-Learning & EdTech AI'],
  'Business & Entrepreneurship': ['#312E81', '#6366F1', '💼 Executive & Startup AI'],
  'Technology & AI': ['#4C1D95', '#8B5CF6', '🤖 Neural Tech & Robotics'],
  'Gaming & Esports': ['#701A75', '#D946EF', '🎮 Gaming & Esports VFX'],
  'Health & Fitness': ['#065F46', '#10B981', '💪 Fitness & Wellness AI'],
  'Food & Cooking': ['#7C2D12', '#F97316', '🍲 Culinary & Food Studio'],
  'Travel & Tourism': ['#0C4A6E', '#0EA5E9', '✈️ Destination & Travel AI'],
  'Fashion & Beauty': ['#831843', '#EC4899', '✨ Haute Couture & Beauty'],
  'Digital Marketing': ['#581C87', '#A855F7', '📊 Performance Ad Creative'],
  'Social Media Influencers': ['#701A75', '#F43F5E', '📱 Virtual Influencer Studio'],
  'Entertainment & Comedy': ['#78350F', '#F59E0B', '🎬 Entertainment & Viral Media'],
  'Science & Research': ['#1E1B4B', '#38BDF8', '🔬 Scientific Visualization AI'],
  'Real Estate': ['#1F2937', '#60A5FA', '🏛️ Architectural 3D & PropTech'],
  'E-commerce & Product Advertising': ['#3B0764', '#FF7A1A', '🛍️ 8K Product LoRA Studio'],
  'Photography & Videography': ['#111827', '#9D7BFF', '📷 Neural Cinema & Stills'],
  'Animation & Motion Graphics': ['#311042', '#7C4DFF', '🎞️ 3D & ControlNet Motion'],
  'Music & Audio': ['#1E1B4B', '#EC4899', '🎵 Spatial Audio & Voice AI'],
  'Lifestyle & Personal Development': ['#134E4A', '#2DD4BF', '🌿 Mindful Lifestyle AI'],
  'News & Media': ['#1E293B', '#EF4444', '📰 Broadcast & AI Journalism'],
  'Automotive': ['#0F172A', '#3B82F6', '🏎️ Automotive CGI & Motion'],
  'Agriculture & Farming': ['#14532D', '#22C55E', '🌾 AgriTech & Smart Farming'],
  'Environment & Sustainability': ['#064E3B', '#34D399', '🌍 CleanTech & Eco Visuals'],
};

function buildFallbackSvgDataUri(title: string, category = 'Technology & AI', variant: 'avatar' | 'portfolio' = 'portfolio'): string {
  const [c1, c2, badge] = CATEGORY_GRADIENTS[category] || ['#17132E', '#7C4DFF', '✨ CreatorConnect AI'];
  const safeTitle = (title || 'AI Creative').replace(/[<>&"']/g, '').slice(0, 36);
  const initials = safeTitle
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  if (variant === 'avatar') {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${c1}"/>
          <stop offset="100%" stop-color="${c2}"/>
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#g)"/>
      <circle cx="200" cy="155" r="65" fill="rgba(255,255,255,0.18)"/>
      <path d="M90 360 C90 270 310 270 310 360" fill="rgba(255,255,255,0.18)"/>
      <text x="200" y="175" text-anchor="middle" fill="#FFFFFF" font-family="Inter, sans-serif" font-weight="800" font-size="48">${initials}</text>
    </svg>`;
    return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#0B081D"/>
        <stop offset="50%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
    </defs>
    <rect width="800" height="600" fill="url(#bg)"/>
    <circle cx="650" cy="120" r="180" fill="rgba(255,122,26,0.16)"/>
    <circle cx="160" cy="480" r="210" fill="rgba(124,77,255,0.22)"/>
    <rect x="60" y="60" width="680" height="480" rx="28" fill="rgba(11,8,29,0.55)" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>
    <text x="100" y="260" fill="#9D7BFF" font-family="Inter, sans-serif" font-weight="700" font-size="22">${badge}</text>
    <text x="100" y="320" fill="#FFFFFF" font-family="Inter, sans-serif" font-weight="800" font-size="34">${safeTitle}</text>
    <text x="100" y="370" fill="#B9B3D0" font-family="Inter, sans-serif" font-weight="500" font-size="20">Verified AI Portfolio Deliverable • 4K Render</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  category = 'Technology & AI',
  variant = 'portfolio',
  className = '',
  eager = false,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  const fallbackUri = buildFallbackSvgDataUri(alt, category, variant);
  const activeSrc = errored || !src ? fallbackUri : src;

  return (
    <div className={`relative overflow-hidden bg-[#130F29] ${className}`}>
      {!loaded && !errored && (
        <div className="absolute inset-0 bg-gradient-to-r from-[#17132E] via-[#261F4A] to-[#17132E] animate-pulse" />
      )}
      <img
        src={activeSrc}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => {
          setErrored(true);
          setLoaded(true);
        }}
        className={`w-full h-full object-cover ${
          variant === 'avatar' ? 'object-top' : 'object-center'
        } transition-opacity duration-300 ${loaded ? 'opacity-100' : 'opacity-0'}`}
      />
    </div>
  );
};
