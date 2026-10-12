import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  PlusCircle,
  Calendar,
  DollarSign,
  Sparkles,
  ArrowUpRight,
  Layers,
  Users,
  Wand2,
} from 'lucide-react';
import { Campaign, CREATOR_CATEGORIES } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const CampaignsPage: React.FC = () => {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState('open');

  useEffect(() => {
    setLoading(true);
    apiRequest<{ campaigns: Campaign[] }>('/api/campaigns')
      .then((res) => setCampaigns(res.campaigns || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return campaigns.filter((c) => {
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (category !== 'All' && c.category !== category) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${c.title} ${c.description} ${c.brand_name} ${c.required_skills.join(' ')} ${c.required_ai_tools.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [campaigns, search, category, statusFilter]);

  const statusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'in_progress':
        return 'bg-[#7C4DFF]/25 text-[#9D7BFF] border-[#7C4DFF]/40';
      case 'completed':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-white/10 text-[#B9B3D0] border-white/15';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF7A1A] mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Active Brand & Agency Briefs
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            AI Campaign Brief Marketplace
          </h1>
          <p className="text-sm text-[#B9B3D0] mt-1 max-w-2xl">
            Browse live creative briefs from brands and agencies, inspect required AI pipelines, and submit tailored proposals.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link
            to="/campaigns/new"
            className="btn-primary-orange px-5 py-3 rounded-2xl text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            {user?.role === 'brand' ? 'Create Campaign Brief' : 'Try AI Brief Builder'}
          </Link>
          <Link
            to="/ai-studio"
            className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-[#17132E] hover:bg-[#211C40] text-white border border-[#7C4DFF]/40 transition inline-flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4 text-[#9D7BFF]" /> AI Matcher
          </Link>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 border border-white/10 mb-8 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-6 relative">
          <Search className="w-4 h-4 text-[#9D7BFF] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search campaigns by keyword, brand, Runway Gen-3, LoRA..."
            className="input-dark w-full pl-10 text-sm"
          />
        </div>
        <div className="md:col-span-4">
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            aria-label="Filter by Campaign Category"
            className="input-dark w-full text-sm"
          >
            <option value="All">All AI Categories</option>
            {CREATOR_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div className="md:col-span-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            aria-label="Filter by Status"
            className="input-dark w-full text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="open">Open Only</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Campaigns List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="glass-card rounded-2xl h-48 animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center">
          <h3 className="font-display font-bold text-xl text-white">No Campaigns Match Your Search</h3>
          <p className="text-sm text-[#B9B3D0] mt-2">
            Try switching Status to "All Statuses" or resetting your category filter.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filtered.map((camp) => (
            <div
              key={camp.id}
              className="glass-card glass-card-hover rounded-3xl p-6 flex flex-col justify-between border border-white/10"
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={camp.brand_logo}
                      alt={camp.brand_name}
                      className="w-11 h-11 rounded-xl object-cover border border-white/15"
                    />
                    <div>
                      <span className="text-xs text-[#9D7BFF] font-medium block">{camp.brand_name}</span>
                      <Link
                        to={`/campaigns/${camp.id}`}
                        className="font-display font-bold text-lg text-white hover:text-[#9D7BFF] transition line-clamp-1"
                      >
                        {camp.title}
                      </Link>
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wider border shrink-0 ${statusBadge(
                      camp.status
                    )}`}
                  >
                    {camp.status.replace('_', ' ')}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-[#B9B3D0] line-clamp-2 leading-relaxed">
                  {camp.description}
                </p>

                {/* Deliverables & AI Tools */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#7C4DFF]/20 text-[#9D7BFF] border border-[#7C4DFF]/30">
                    {camp.category}
                  </span>
                  {camp.required_ai_tools.slice(0, 3).map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg text-xs bg-[#0B081D]/80 text-white/85 border border-white/10"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-5 text-xs">
                  <span className="flex items-center gap-1 font-bold text-emerald-400 text-sm">
                    <DollarSign className="w-4 h-4" />
                    {camp.budget_min.toLocaleString()} – ${camp.budget_max.toLocaleString()}
                  </span>
                  <span className="flex items-center gap-1 text-[#B9B3D0]">
                    <Calendar className="w-3.5 h-3.5 text-[#7C4DFF]" /> Due {camp.deadline}
                  </span>
                  <span className="flex items-center gap-1 text-[#B9B3D0]">
                    <Users className="w-3.5 h-3.5 text-[#FF7A1A]" /> {camp.proposal_count || 0} Proposals
                  </span>
                </div>

                <Link
                  to={`/campaigns/${camp.id}`}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C4DFF]/20 hover:bg-[#7C4DFF] text-white border border-[#7C4DFF]/40 transition flex items-center gap-1"
                >
                  View Brief & Pitch <ArrowUpRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
