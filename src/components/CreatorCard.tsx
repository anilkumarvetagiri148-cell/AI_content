import React from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  Heart,
  CheckCircle2,
  MapPin,
  Sparkles,
  ArrowUpRight,
  Award,
  Send,
} from 'lucide-react';
import { formatINR, FullCreator, PortfolioProject } from '../types';
import { useAuth } from '../context/AuthContext';
import { SmartImage } from './SmartImage';

interface CreatorCardProps {
  creator: FullCreator;
  matchScore?: number;
  matchSummary?: string;
  onSelectProject?: (project: PortfolioProject) => void;
  onHireClick?: (creator: FullCreator) => void;
}

export const CreatorCard: React.FC<CreatorCardProps> = ({
  creator,
  matchScore,
  matchSummary,
  onSelectProject,
  onHireClick,
}) => {
  const { savedCreatorIds, toggleFavorite } = useAuth();
  const isSaved = savedCreatorIds.includes(creator.id);
  const cp = creator.creator_profile;
  const categoryLabel = cp.industry_category || cp.specialization;

  // Extract 3 category-matched portfolio preview images
  const previewProjects = creator.portfolio.slice(0, 3);
  const img1 =
    previewProjects[0]?.thumbnail_url ||
    previewProjects[0]?.media_urls?.[0] ||
    '';
  const img2 =
    previewProjects[1]?.thumbnail_url ||
    previewProjects[0]?.media_urls?.[1] ||
    img1;
  const img3 =
    previewProjects[2]?.thumbnail_url ||
    previewProjects[0]?.media_urls?.[2] ||
    img1;

  const availabilityColors = {
    available: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
    busy: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
    unavailable: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
  };

  return (
    <div className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col justify-between group border border-white/10">
      <div>
        {/* 3-Image Portfolio Preview Mosaic (4:3 / 16:9 Aspect Ratio Preserved) */}
        <div className="relative bg-[#0B081D] p-2 pb-0">
          <div className="grid grid-cols-3 gap-1.5 h-44 rounded-xl overflow-hidden">
            {/* Main Portfolio Thumbnail (2 Cols) */}
            <div
              onClick={() => previewProjects[0] && onSelectProject?.(previewProjects[0])}
              className="col-span-2 relative h-full overflow-hidden cursor-pointer"
            >
              <SmartImage
                src={img1}
                alt={previewProjects[0]?.title || `${creator.name} Portfolio 1`}
                category={categoryLabel}
                variant="portfolio"
                className="w-full h-full group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            {/* 2 Secondary Portfolio Thumbnails (1 Col stacked) */}
            <div className="col-span-1 grid grid-rows-2 gap-1.5 h-full">
              <div
                onClick={() =>
                  (previewProjects[1] || previewProjects[0]) &&
                  onSelectProject?.(previewProjects[1] || previewProjects[0])
                }
                className="relative w-full h-full overflow-hidden cursor-pointer"
              >
                <SmartImage
                  src={img2}
                  alt={previewProjects[1]?.title || `${creator.name} Portfolio 2`}
                  category={categoryLabel}
                  variant="portfolio"
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div
                onClick={() =>
                  (previewProjects[2] || previewProjects[0]) &&
                  onSelectProject?.(previewProjects[2] || previewProjects[0])
                }
                className="relative w-full h-full overflow-hidden cursor-pointer"
              >
                <SmartImage
                  src={img3}
                  alt={previewProjects[2]?.title || `${creator.name} Portfolio 3`}
                  category={categoryLabel}
                  variant="portfolio"
                  className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-black/35 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-[10px] font-bold text-white px-2 py-0.5 rounded bg-black/60">
                    +{creator.portfolio.length} Projects
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Top Left Availability & Featured Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-1.5 z-10">
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border backdrop-blur-md capitalize ${
                availabilityColors[cp.availability]
              }`}
            >
              ● {cp.availability}
            </span>
            {cp.featured && (
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#7C4DFF]/85 text-white border border-white/20 backdrop-blur-md flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5" /> Featured
              </span>
            )}
          </div>

          {/* Match Score Badge if provided */}
          {matchScore !== undefined && (
            <div className="absolute bottom-2 right-4 px-3 py-1 rounded-xl bg-gradient-to-r from-[#7C4DFF] to-[#FF7A1A] text-white font-bold text-xs shadow-lg z-10">
              {matchScore}% AI Match
            </div>
          )}

          {/* Save / Favorite Heart Button */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              toggleFavorite(creator.id);
            }}
            aria-label="Save creator to favorites"
            className={`absolute top-4 right-4 p-2 rounded-full backdrop-blur-md border transition z-10 ${
              isSaved
                ? 'bg-rose-500 text-white border-rose-400 shadow-lg'
                : 'bg-[#0B081D]/70 text-white/85 hover:text-white border-white/20'
            }`}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* Creator Identity & Metadata */}
        <div className="px-5 pt-4 pb-3">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <Link to={`/creators/${creator.id}`} className="shrink-0">
                <SmartImage
                  src={creator.avatar_url}
                  alt={creator.name}
                  category={categoryLabel}
                  variant="avatar"
                  className="w-13 h-13 w-[52px] h-[52px] rounded-2xl border-2 border-[#7C4DFF] shadow-lg"
                />
              </Link>
              <div className="min-w-0">
                <Link
                  to={`/creators/${creator.id}`}
                  className="font-display font-bold text-base text-white hover:text-[#9D7BFF] transition flex items-center gap-1.5 truncate"
                >
                  <span className="truncate">{creator.name}</span>
                  {creator.verified && (
                    <CheckCircle2 className="w-4 h-4 text-[#9D7BFF] shrink-0" />
                  )}
                </Link>
                <p className="text-xs text-[#9D7BFF] font-medium truncate">{cp.title}</p>
                <div className="flex items-center gap-2 text-[11px] text-[#B9B3D0] mt-0.5">
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-[#7C4DFF] shrink-0" />
                    {creator.location}
                  </span>
                </div>
              </div>
            </div>

            {/* Star Rating & Demo Label */}
            <div className="text-right shrink-0">
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-[#0B081D]/90 border border-white/10 text-xs font-bold text-amber-400">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{cp.rating.toFixed(2)}</span>
              </div>
              <span className="block text-[10px] text-[#B9B3D0] mt-0.5">
                {cp.review_count} demo reviews
              </span>
            </div>
          </div>

          {/* Industry Category + Experience Badges */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <span className="text-[11px] font-semibold text-white bg-[#7C4DFF]/25 border border-[#7C4DFF]/40 px-2.5 py-0.5 rounded-md">
              {categoryLabel}
            </span>
            <span className="text-[11px] font-medium text-[#B9B3D0] bg-[#0B081D]/80 border border-white/10 px-2 py-0.5 rounded-md capitalize flex items-center gap-1">
              <Award className="w-3 h-3 text-[#FF7A1A]" />
              {cp.experience_level} • {cp.experience_years}y
            </span>
          </div>

          {/* Short Readable Biography */}
          <p className="mt-2.5 text-xs text-[#B9B3D0] line-clamp-2 leading-relaxed">
            {creator.bio}
          </p>

          {matchSummary && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-[#7C4DFF]/15 border border-[#7C4DFF]/30 text-xs text-white/90">
              <span className="font-semibold text-[#FF7A1A]">Why Matched: </span>
              {matchSummary}
            </div>
          )}

          {/* Specialization Skills & AI Tools */}
          <div className="mt-3 flex flex-wrap gap-1.5">
            {cp.ai_tools.slice(0, 3).map((tool) => (
              <span
                key={tool}
                className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#0B081D]/90 text-[#9D7BFF] border border-[#7C4DFF]/30"
              >
                {tool}
              </span>
            ))}
            {cp.skills.slice(0, 1).map((skill) => (
              <span
                key={skill}
                className="px-2 py-0.5 rounded-md text-[10px] bg-[#0B081D]/70 text-white/80 border border-white/10"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Footer: Starting Price in INR (₹) + View Portfolio & Hire Creator Buttons */}
      <div className="px-5 py-3.5 mt-2 border-t border-white/10 bg-[#0B081D]/50 flex items-center justify-between gap-2">
        <div>
          <span className="text-[10px] uppercase tracking-wider text-[#B9B3D0] block">
            Starting Project Price
          </span>
          <span className="font-display font-extrabold text-lg text-white">
            {formatINR(cp.starting_price)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {onHireClick ? (
            <button
              onClick={() => onHireClick(creator)}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FF7A1A]/15 hover:bg-[#FF7A1A] text-[#FF7A1A] hover:text-white border border-[#FF7A1A]/40 transition flex items-center gap-1"
            >
              <Send className="w-3 h-3" /> Hire
            </button>
          ) : (
            <Link
              to={`/creators/${creator.id}?action=hire`}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-[#FF7A1A]/15 hover:bg-[#FF7A1A] text-[#FF7A1A] hover:text-white border border-[#FF7A1A]/40 transition flex items-center gap-1"
            >
              <Send className="w-3 h-3" /> Hire
            </Link>
          )}

          <Link
            to={`/creators/${creator.id}`}
            className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#7C4DFF]/25 hover:bg-[#7C4DFF] text-white border border-[#7C4DFF]/40 transition flex items-center gap-1"
          >
            View Portfolio <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
