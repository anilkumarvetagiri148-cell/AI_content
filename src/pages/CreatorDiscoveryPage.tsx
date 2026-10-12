import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  RotateCcw,
  Sparkles,
  Wand2,
  Users,
  ChevronDown,
  LayoutGrid,
  ListFilter,
  Send,
  MessageSquare,
  X,
  CheckCircle2,
  IndianRupee,
  Film,
  Heart,
  Star,
} from 'lucide-react';
import {
  AI_TOOLS_LIST,
  Campaign,
  DISCOVER_CATEGORIES,
  formatINR,
  FullCreator,
  PortfolioProject,
  SKILLS_FILTER_LIST,
} from '../types';
import { apiRequest } from '../lib/api';
import { CreatorCard } from '../components/CreatorCard';
import { ProjectModal } from '../components/ProjectModal';
import { SmartImage } from '../components/SmartImage';
import { useAuth } from '../context/AuthContext';
import { BACKGROUND_THEMES, useBackgroundTheme } from '../components/AmbientBackground';

export const CreatorDiscoveryPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, savedCreatorIds, showToast } = useAuth();
  const { themeId, setThemeId } = useBackgroundTheme();

  const [allCreators, setAllCreators] = useState<FullCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCategoryGrid, setShowCategoryGrid] = useState(false);

  // Unified Discover + Creators view mode ('all' | 'featured' | 'saved')
  const [viewMode, setViewMode] = useState<'all' | 'featured' | 'saved'>(
    searchParams.get('featured') === 'true' ? 'featured' : 'all'
  );

  // Lightbox & Quick Hire / Contact Modal states
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);
  const [hireTargetCreator, setHireTargetCreator] = useState<FullCreator | null>(null);
  const [hireTab, setHireTab] = useState<'message' | 'invite'>('message');
  const [quickMessage, setQuickMessage] = useState('');
  const [brandCampaigns, setBrandCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [submittingHire, setSubmittingHire] = useState(false);

  // Filter states initialized from URL params
  const initialCat = searchParams.get('category');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [category, setCategory] = useState(
    initialCat && initialCat !== 'All' ? initialCat : 'All Creators'
  );
  const [selectedTool, setSelectedTool] = useState('all');
  const [selectedSkill, setSelectedSkill] = useState('all');
  const [minBudget, setMinBudget] = useState<number>(0);
  const [maxBudget, setMaxBudget] = useState<number>(65000);
  const [minRating, setMinRating] = useState<number>(0);
  const [availability, setAvailability] = useState<string>('all');
  const [experience, setExperience] = useState<string>('all');
  const [contentFormat, setContentFormat] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('recommended');
  const [visibleCount, setVisibleCount] = useState<number>(12);

  useEffect(() => {
    setLoading(true);
    apiRequest<{ creators: FullCreator[] }>('/api/creators')
      .then((res) => {
        setAllCreators(res.creators || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const urlCat = searchParams.get('category');
    const urlSearch = searchParams.get('search');
    const urlFeatured = searchParams.get('featured');
    if (urlCat) {
      setCategory(urlCat === 'All' ? 'All Creators' : urlCat);
    }
    if (urlSearch !== null) setSearch(urlSearch);
    if (urlFeatured === 'true') setViewMode('featured');
  }, [searchParams]);

  // Reset pagination count when filters change so user immediately sees top results
  useEffect(() => {
    setVisibleCount(12);
  }, [
    viewMode,
    search,
    category,
    selectedTool,
    selectedSkill,
    minBudget,
    maxBudget,
    minRating,
    availability,
    experience,
    contentFormat,
    sortBy,
  ]);

  // Compute creator counts per category across allCreators
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'All Creators': allCreators.length,
    };
    for (const cat of DISCOVER_CATEGORIES) {
      if (cat === 'All Creators') continue;
      counts[cat] = allCreators.filter(
        (c) =>
          c.creator_profile.industry_category === cat ||
          c.creator_profile.specialization === cat ||
          c.creator_profile.secondary_categories.includes(cat)
      ).length;
    }
    return counts;
  }, [allCreators]);

  // Collect dynamic skills & specializations from dataset + standard list
  const availableSkills = useMemo(() => {
    const set = new Set<string>(SKILLS_FILTER_LIST);
    allCreators.forEach((c) => {
      c.creator_profile.skills.slice(0, 2).forEach((s) => set.add(s));
    });
    return Array.from(set).slice(0, 36);
  }, [allCreators]);

  const featuredCount = useMemo(
    () => allCreators.filter((c) => c.creator_profile.featured).length,
    [allCreators]
  );

  const filteredCreators = useMemo(() => {
    let list = [...allCreators];

    if (viewMode === 'featured') {
      list = list.filter((c) => c.creator_profile.featured);
    } else if (viewMode === 'saved') {
      list = list.filter((c) => savedCreatorIds.includes(c.id));
    }

    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter((c) => {
        const text = [
          c.name,
          c.bio,
          c.location,
          c.creator_profile.title,
          c.creator_profile.industry_category || '',
          c.creator_profile.specialization,
          ...c.creator_profile.secondary_categories,
          ...c.creator_profile.skills,
          ...c.creator_profile.ai_tools,
        ]
          .join(' ')
          .toLowerCase();
        return text.includes(q);
      });
    }

    if (category !== 'All Creators' && category !== 'All') {
      const catLower = category.toLowerCase();
      list = list.filter(
        (c) =>
          (c.creator_profile.industry_category || '').toLowerCase() === catLower ||
          c.creator_profile.specialization.toLowerCase() === catLower ||
          c.creator_profile.secondary_categories.some((sc) => sc.toLowerCase() === catLower)
      );
    }

    if (selectedTool !== 'all') {
      const toolLower = selectedTool.toLowerCase();
      list = list.filter((c) =>
        c.creator_profile.ai_tools.some((t) => t.toLowerCase().includes(toolLower))
      );
    }

    if (selectedSkill !== 'all') {
      const skillLower = selectedSkill.toLowerCase();
      list = list.filter(
        (c) =>
          c.creator_profile.skills.some((s) => s.toLowerCase().includes(skillLower)) ||
          c.creator_profile.specialization.toLowerCase().includes(skillLower) ||
          c.creator_profile.secondary_categories.some((sc) => sc.toLowerCase().includes(skillLower))
      );
    }

    if (minBudget > 0) {
      list = list.filter((c) => c.creator_profile.starting_price >= minBudget);
    }

    if (maxBudget < 65000) {
      list = list.filter((c) => c.creator_profile.starting_price <= maxBudget);
    }

    if (minRating > 0) {
      list = list.filter((c) => c.creator_profile.rating >= minRating);
    }

    if (availability !== 'all') {
      list = list.filter((c) => c.creator_profile.availability === availability);
    }

    if (experience !== 'all') {
      list = list.filter((c) => c.creator_profile.experience_level === experience);
    }

    if (contentFormat !== 'all') {
      const fmt = contentFormat.toLowerCase();
      list = list.filter(
        (c) =>
          (c.creator_profile.content_formats || []).some((f) => f.toLowerCase() === fmt) ||
          c.portfolio.some((p) => p.media_type.toLowerCase() === fmt)
      );
    }

    if (sortBy === 'rating') {
      list.sort((a, b) => b.creator_profile.rating - a.creator_profile.rating);
    } else if (sortBy === 'price_asc') {
      list.sort((a, b) => a.creator_profile.starting_price - b.creator_profile.starting_price);
    } else if (sortBy === 'price_desc') {
      list.sort((a, b) => b.creator_profile.starting_price - a.creator_profile.starting_price);
    } else if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sortBy === 'relevance') {
      list.sort(
        (a, b) =>
          b.creator_profile.completed_campaigns - a.creator_profile.completed_campaigns ||
          b.creator_profile.rating - a.creator_profile.rating
      );
    } else {
      // Recommended (featured + rating + availability)
      list.sort((a, b) => {
        if (a.creator_profile.featured !== b.creator_profile.featured) {
          return a.creator_profile.featured ? -1 : 1;
        }
        return b.creator_profile.rating - a.creator_profile.rating;
      });
    }

    return list;
  }, [
    allCreators,
    viewMode,
    savedCreatorIds,
    search,
    category,
    selectedTool,
    selectedSkill,
    minBudget,
    maxBudget,
    minRating,
    availability,
    experience,
    contentFormat,
    sortBy,
  ]);

  const handleSelectCategory = (cat: string) => {
    setCategory(cat);
    const nextParams = new URLSearchParams(searchParams);
    if (cat === 'All Creators') {
      nextParams.delete('category');
    } else {
      nextParams.set('category', cat);
    }
    setSearchParams(nextParams, { replace: true });
  };

  const clearAllFilters = () => {
    setViewMode('all');
    setSearch('');
    setCategory('All Creators');
    setSelectedTool('all');
    setSelectedSkill('all');
    setMinBudget(0);
    setMaxBudget(65000);
    setMinRating(0);
    setAvailability('all');
    setExperience('all');
    setContentFormat('all');
    setSortBy('recommended');
    setSearchParams({});
  };

  const hasActiveFilters =
    viewMode !== 'all' ||
    search.trim() !== '' ||
    category !== 'All Creators' ||
    selectedTool !== 'all' ||
    selectedSkill !== 'all' ||
    minBudget > 0 ||
    maxBudget < 65000 ||
    minRating > 0 ||
    availability !== 'all' ||
    experience !== 'all' ||
    contentFormat !== 'all';

  const openHireModal = async (creator: FullCreator) => {
    if (!user) {
      showToast('Please sign in to contact or hire creators.', 'info');
      navigate('/auth?mode=login');
      return;
    }
    setHireTargetCreator(creator);
    setQuickMessage(
      `Hi ${creator.name}, we loved your ${
        creator.creator_profile.industry_category || creator.creator_profile.specialization
      } portfolio and would like to discuss a project!`
    );
    if (user.role === 'brand' || user.role === 'admin') {
      try {
        const res = await apiRequest<{ campaigns: Campaign[] }>(
          `/api/campaigns?brandId=${user.id}`
        );
        const openList = res.campaigns.filter((c) => c.status === 'open' || c.status === 'draft');
        setBrandCampaigns(openList);
        if (openList[0]) setSelectedCampaignId(openList[0].id);
      } catch {
        // ignore
      }
    }
  };

  const handleQuickHireSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hireTargetCreator || !user) return;
    setSubmittingHire(true);
    try {
      if (hireTab === 'invite' && selectedCampaignId) {
        await apiRequest('/api/invitations', {
          method: 'POST',
          body: JSON.stringify({
            campaign_id: selectedCampaignId,
            creator_id: hireTargetCreator.id,
            message: quickMessage.trim(),
          }),
        });
        showToast(`Campaign invitation sent to ${hireTargetCreator.name}!`, 'success');
      } else {
        await apiRequest('/api/conversations', {
          method: 'POST',
          body: JSON.stringify({
            participant_id: hireTargetCreator.id,
            message: quickMessage.trim(),
          }),
        });
        showToast(`Direct inquiry sent to ${hireTargetCreator.name}!`, 'success');
      }
      setHireTargetCreator(null);
    } catch (err: any) {
      showToast(err.message || 'Could not send request.', 'error');
    } finally {
      setSubmittingHire(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* ================= HERO HEADER & CATEGORY NAVIGATION ================= */}
      <div className="glass-banner rounded-3xl p-6 sm:p-8 mb-8 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#7C4DFF]/35 blur-[110px]" />
        <div className="pointer-events-none absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-[#06B6D4]/25 blur-[110px]" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-[#FF7A1A]/25 blur-[100px]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex flex-wrap items-center gap-2.5 mb-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0D0726]/80 border border-[#9D7BFF]/45 text-xs font-semibold text-[#9D7BFF]">
                <Sparkles className="w-3.5 h-3.5 text-[#FF7A1A]" />
                <span>24 Industry Categories • {allCreators.length || 138}+ Verified AI Creators</span>
              </div>

              {/* Quick Interactive Background Color Swatches */}
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0D0726]/70 border border-white/15">
                <span className="text-[10px] font-semibold text-[#B9B3D0] mr-1">UI Vibe:</span>
                {BACKGROUND_THEMES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setThemeId(t.id)}
                    title={`Switch to ${t.name}`}
                    className={`w-4 h-4 rounded-full transition-transform ${
                      themeId === t.id
                        ? 'scale-125 ring-2 ring-white shadow-md'
                        : 'opacity-70 hover:opacity-100 hover:scale-110'
                    }`}
                    style={{ background: t.previewGradient }}
                  />
                ))}
              </div>
            </div>

            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight">
              Discover Creators.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D7BFF] via-[#22D3EE] to-[#FF7A1A]">
                Find Your Creative Match.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-white/85 mt-2 max-w-3xl leading-relaxed">
              Explore talented AI creators across finance, education, business, technology,
              entertainment, and more. Find the right talent to bring your next campaign to life.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-start lg:self-auto shrink-0">
            <button
              type="button"
              onClick={() => setShowCategoryGrid((prev) => !prev)}
              className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-[#0D0726]/75 hover:bg-[#1C1246] text-white border border-white/20 transition inline-flex items-center gap-2"
            >
              <LayoutGrid className="w-4 h-4 text-[#22D3EE]" />
              {showCategoryGrid ? 'Compact Category Chips' : 'Browse All 24 Categories'}
            </button>
            <Link
              to="/ai-studio"
              className="btn-electric px-5 py-3 rounded-2xl text-xs sm:text-sm inline-flex items-center gap-2"
            >
              <Wand2 className="w-4 h-4 text-[#FF7A1A]" />
              AI Creator Matcher
            </Link>
          </div>
        </div>

        {/* Unified Discover + Creators Collection Tabs */}
        <div className="mt-6 pt-5 border-t border-white/15 flex flex-wrap items-center justify-between gap-3 relative z-10">
          <div className="inline-flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-[#0D0726]/75 border border-white/15">
            <button
              type="button"
              onClick={() => setViewMode('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                viewMode === 'all'
                  ? 'bg-gradient-to-r from-[#7C4DFF] to-[#06B6D4] text-white shadow-md'
                  : 'text-[#B9B3D0] hover:text-white'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              All Creators ({allCreators.length})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('featured')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                viewMode === 'featured'
                  ? 'bg-gradient-to-r from-[#FF7A1A] to-[#EC4899] text-white shadow-md'
                  : 'text-[#B9B3D0] hover:text-white'
              }`}
            >
              <Star className="w-3.5 h-3.5 fill-current" />
              Featured Creators ({featuredCount})
            </button>
            <button
              type="button"
              onClick={() => setViewMode('saved')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                viewMode === 'saved'
                  ? 'bg-rose-500 text-white shadow-md'
                  : 'text-[#B9B3D0] hover:text-white'
              }`}
            >
              <Heart className="w-3.5 h-3.5 fill-current" />
              Saved Favorites ({savedCreatorIds.length})
            </button>
          </div>

          <span className="text-xs text-white/75">
            Select any of the <strong className="text-[#22D3EE]">24 industry categories</strong> below to filter creators:
          </span>
        </div>

        {/* Category Navigation: Either Full 24-Category Responsive Grid OR Horizontally Scrollable Chips */}
        {showCategoryGrid ? (
          <div className="mt-4 pt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
            {DISCOVER_CATEGORIES.map((cat) => {
              const isSelected = category === cat;
              const count = categoryCounts[cat] ?? 0;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleSelectCategory(cat)}
                  className={`px-3 py-2.5 rounded-xl text-left text-xs font-semibold transition flex items-center justify-between gap-2 border ${
                    isSelected
                      ? 'bg-[#7C4DFF] text-white border-[#9D7BFF] shadow-glow-purple'
                      : 'bg-[#0B081D]/75 text-[#B9B3D0] hover:text-white hover:border-[#7C4DFF]/50 border-white/10'
                  }`}
                >
                  <span className="truncate">{cat}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded-md text-[10px] shrink-0 ${
                      isSelected ? 'bg-black/30 text-white' : 'bg-white/5 text-[#9D7BFF]'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
              {DISCOVER_CATEGORIES.map((cat) => {
                const isSelected = category === cat;
                const count = categoryCounts[cat] ?? 0;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => handleSelectCategory(cat)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-[#7C4DFF] text-white border-[#9D7BFF] shadow-glow-purple'
                        : 'bg-[#0B081D]/75 text-[#B9B3D0] hover:text-white hover:border-[#7C4DFF]/40 border-white/10'
                    }`}
                  >
                    <span>{cat}</span>
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-white/5 text-[#9D7BFF]'
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ================= SEARCH & MULTI-FILTER CONTROL PANEL ================= */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 mb-8 space-y-4">
        {/* Primary Filter Row: Search, Category Select, AI Tools, Skills, Sort */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-[#9D7BFF] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search creators by name, industry, skill, or AI tool…"
              className="input-dark w-full pl-10 text-xs sm:text-sm"
            />
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-2">
            <select
              value={category}
              onChange={(e) => handleSelectCategory(e.target.value)}
              aria-label="Filter by Category"
              className="input-dark w-full text-xs sm:text-sm"
            >
              {DISCOVER_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat === 'All Creators' ? 'Category: All (24)' : cat}
                </option>
              ))}
            </select>
          </div>

          {/* AI Tool Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedTool}
              onChange={(e) => setSelectedTool(e.target.value)}
              aria-label="Filter by AI Tool"
              className="input-dark w-full text-xs sm:text-sm"
            >
              <option value="all">All AI Tools</option>
              {AI_TOOLS_LIST.map((tool) => (
                <option key={tool} value={tool}>
                  {tool}
                </option>
              ))}
            </select>
          </div>

          {/* Skills & Specialization Filter */}
          <div className="md:col-span-2">
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              aria-label="Filter by Skill or Specialization"
              className="input-dark w-full text-xs sm:text-sm"
            >
              <option value="all">All Skills & Niches</option>
              {availableSkills.map((sk) => (
                <option key={sk} value={sk}>
                  {sk}
                </option>
              ))}
            </select>
          </div>

          {/* Sort Dropdown */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Sort Creators"
              className="input-dark w-full text-xs sm:text-sm font-semibold text-[#9D7BFF]"
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="relevance">Sort: Most Relevant</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="newest">Sort: Newest</option>
              <option value="price_asc">Sort: Lowest Price (₹)</option>
              <option value="price_desc">Sort: Highest Price (₹)</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Bar: Min/Max Budget (INR), Rating, Experience, Availability, Content Format */}
        <div className="pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-4 sm:gap-5">
            {/* Min & Max Budget in INR */}
            <div className="flex flex-wrap items-center gap-2 bg-[#0B081D]/70 px-3 py-1.5 rounded-xl border border-white/10">
              <IndianRupee className="w-3.5 h-3.5 text-[#FF7A1A]" />
              <span className="text-[#B9B3D0]">Budget (INR):</span>
              <select
                value={minBudget}
                onChange={(e) => setMinBudget(Number(e.target.value))}
                aria-label="Minimum Budget in INR"
                className="bg-[#17132E] border border-white/15 rounded-lg px-2 py-1 text-white"
              >
                <option value={0}>Min: ₹0</option>
                <option value={10000}>Min: ₹10,000</option>
                <option value={15000}>Min: ₹15,000</option>
                <option value={25000}>Min: ₹25,000</option>
                <option value={35000}>Min: ₹35,000</option>
              </select>
              <span className="text-[#B9B3D0]">to</span>
              <select
                value={maxBudget}
                onChange={(e) => setMaxBudget(Number(e.target.value))}
                aria-label="Maximum Budget in INR"
                className="bg-[#17132E] border border-white/15 rounded-lg px-2 py-1 text-white"
              >
                <option value={15000}>Max: ₹15,000</option>
                <option value={25000}>Max: ₹25,000</option>
                <option value={35000}>Max: ₹35,000</option>
                <option value={50000}>Max: ₹50,000</option>
                <option value={65000}>Max: Any (₹60,000+)</option>
              </select>
            </div>

            {/* Minimum Rating */}
            <div className="flex items-center gap-2">
              <span className="text-[#B9B3D0]">Rating:</span>
              <select
                value={minRating}
                onChange={(e) => setMinRating(Number(e.target.value))}
                aria-label="Minimum Rating"
                className="bg-[#0B081D] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value={0}>Any ★</option>
                <option value={4.5}>4.5★ & up</option>
                <option value={4.8}>4.8★ & up</option>
                <option value={4.9}>4.9★ & up</option>
              </select>
            </div>

            {/* Experience Level */}
            <div className="flex items-center gap-2">
              <span className="text-[#B9B3D0]">Experience:</span>
              <select
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                aria-label="Experience Level"
                className="bg-[#0B081D] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Levels</option>
                <option value="expert">Expert (5+ yrs)</option>
                <option value="senior">Senior (3–5 yrs)</option>
                <option value="intermediate">Intermediate</option>
              </select>
            </div>

            {/* Availability */}
            <div className="flex items-center gap-2">
              <span className="text-[#B9B3D0]">Availability:</span>
              <select
                value={availability}
                onChange={(e) => setAvailability(e.target.value)}
                aria-label="Availability"
                className="bg-[#0B081D] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Status</option>
                <option value="available">Available Now</option>
                <option value="busy">Busy / Limited</option>
              </select>
            </div>

            {/* Content Format */}
            <div className="flex items-center gap-2">
              <Film className="w-3.5 h-3.5 text-[#9D7BFF]" />
              <span className="text-[#B9B3D0]">Format:</span>
              <select
                value={contentFormat}
                onChange={(e) => setContentFormat(e.target.value)}
                aria-label="Content Format"
                className="bg-[#0B081D] border border-white/15 rounded-lg px-2.5 py-1.5 text-white"
              >
                <option value="all">All Formats</option>
                <option value="video">AI Video & Reels</option>
                <option value="image">AI Images & Stills</option>
                <option value="audio">AI Voice & Music</option>
                <option value="interactive">Interactive & 3D</option>
              </select>
            </div>
          </div>

          {/* Count & Clear All Filters */}
          <div className="flex items-center gap-3 ml-auto">
            <span className="text-[#B9B3D0]">
              Showing{' '}
              <strong className="text-white font-bold">{filteredCreators.length}</strong>{' '}
              {category !== 'All Creators' ? `in ${category}` : 'matching creators'}
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 flex items-center gap-1.5 font-semibold transition"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All Filters
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ================= RESULTS GRID OR EMPTY STATE ================= */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <div key={n} className="glass-card rounded-2xl h-[460px] animate-pulse" />
          ))}
        </div>
      ) : filteredCreators.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto my-8 border border-white/10">
          <div className="w-14 h-14 rounded-2xl bg-[#7C4DFF]/20 border border-[#7C4DFF]/40 flex items-center justify-center mx-auto mb-4 text-[#9D7BFF]">
            <Users className="w-7 h-7" />
          </div>
          <h3 className="font-display font-bold text-xl text-white">
            No AI Creators Match Those Filters
          </h3>
          <p className="text-sm text-[#B9B3D0] mt-2">
            Try adjusting your INR budget range, selecting &ldquo;All Creators&rdquo;, or clearing
            your search keywords.
          </p>
          <button
            type="button"
            onClick={clearAllFilters}
            className="btn-primary-orange px-6 py-2.5 rounded-xl text-sm mt-6 inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> Clear All Filters
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCreators.slice(0, visibleCount).map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onSelectProject={(proj) => setSelectedProject(proj)}
                onHireClick={(c) => openHireModal(c)}
              />
            ))}
          </div>

          {/* Pagination / Load More Controls */}
          {visibleCount < filteredCreators.length && (
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 12)}
                className="px-7 py-3.5 rounded-2xl text-sm font-semibold bg-[#17132E] hover:bg-[#211C40] text-white border border-[#7C4DFF]/40 shadow-glow-purple transition inline-flex items-center gap-2"
              >
                Load More Creators ({filteredCreators.length - visibleCount} remaining)
                <ChevronDown className="w-4 h-4" />
              </button>
              {filteredCreators.length - visibleCount > 12 && (
                <button
                  type="button"
                  onClick={() => setVisibleCount(filteredCreators.length)}
                  className="px-5 py-3.5 rounded-2xl text-xs font-semibold bg-[#0B081D]/80 hover:bg-white/10 text-[#B9B3D0] hover:text-white border border-white/10 transition"
                >
                  Show All ({filteredCreators.length})
                </button>
              )}
            </div>
          )}
        </>
      )}

      {/* Portfolio Lightbox Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* Quick Hire / Contact Creator Modal */}
      {hireTargetCreator && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={() => setHireTargetCreator(null)}
        >
          <div
            className="glass-card rounded-3xl max-w-lg w-full p-6 border border-white/20 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <SmartImage
                  src={hireTargetCreator.avatar_url}
                  alt={hireTargetCreator.name}
                  category={
                    hireTargetCreator.creator_profile.industry_category ||
                    hireTargetCreator.creator_profile.specialization
                  }
                  variant="avatar"
                  className="w-12 h-12 rounded-2xl border border-[#7C4DFF]"
                />
                <div>
                  <h3 className="font-display font-bold text-lg text-white flex items-center gap-1.5">
                    Hire {hireTargetCreator.name}
                    <CheckCircle2 className="w-4 h-4 text-[#9D7BFF]" />
                  </h3>
                  <p className="text-xs text-[#9D7BFF]">
                    {hireTargetCreator.creator_profile.title} • Starts at{' '}
                    {formatINR(hireTargetCreator.creator_profile.starting_price)}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHireTargetCreator(null)}
                className="p-1.5 rounded-xl bg-white/5 text-[#B9B3D0] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-[#0B081D]">
              <button
                type="button"
                onClick={() => setHireTab('message')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  hireTab === 'message'
                    ? 'bg-[#7C4DFF] text-white'
                    : 'text-[#B9B3D0] hover:text-white'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" /> Direct Message Inquiry
              </button>
              <button
                type="button"
                onClick={() => setHireTab('invite')}
                className={`py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                  hireTab === 'invite'
                    ? 'bg-[#FF7A1A] text-white'
                    : 'text-[#B9B3D0] hover:text-white'
                }`}
              >
                <Send className="w-3.5 h-3.5" /> Invite to Campaign Brief
              </button>
            </div>

            <form onSubmit={handleQuickHireSubmit} className="space-y-4">
              {hireTab === 'invite' && (
                <div>
                  <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
                    Select Active Campaign Brief
                  </label>
                  {brandCampaigns.length === 0 ? (
                    <div className="p-3 rounded-xl bg-[#0B081D] border border-white/10 text-xs text-[#B9B3D0] flex items-center justify-between">
                      <span>No open campaigns found in your account.</span>
                      <Link
                        to="/campaigns/new"
                        className="text-[#FF7A1A] font-semibold hover:underline"
                      >
                        Create Brief →
                      </Link>
                    </div>
                  ) : (
                    <select
                      value={selectedCampaignId}
                      onChange={(e) => setSelectedCampaignId(e.target.value)}
                      className="input-dark w-full text-xs sm:text-sm"
                    >
                      {brandCampaigns.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.title} ({formatINR(c.budget_min)} – {formatINR(c.budget_max)})
                        </option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
                  Project Brief / Message to {hireTargetCreator.name.split(' ')[0]}
                </label>
                <textarea
                  rows={4}
                  value={quickMessage}
                  onChange={(e) => setQuickMessage(e.target.value)}
                  className="input-dark w-full text-xs sm:text-sm"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <Link
                  to={`/creators/${hireTargetCreator.id}`}
                  className="text-xs text-[#9D7BFF] hover:underline"
                >
                  View Full Profile & Packages →
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setHireTargetCreator(null)}
                    className="px-4 py-2 rounded-xl text-xs text-[#B9B3D0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={
                      submittingHire || (hireTab === 'invite' && brandCampaigns.length === 0)
                    }
                    className="btn-primary-orange px-5 py-2.5 rounded-xl text-xs font-semibold"
                  >
                    {submittingHire
                      ? 'Sending...'
                      : hireTab === 'invite'
                      ? 'Send Campaign Invite'
                      : 'Send Inquiry'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
