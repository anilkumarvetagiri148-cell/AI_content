import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Eye,
  Star,
  CheckCircle2,
  Edit3,
  DollarSign,
  Send,
  X,
  Briefcase,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  AI_TOOLS_LIST,
  AvailabilityStatus,
  CampaignInvitation,
  CampaignProposal,
  CREATOR_CATEGORIES,
} from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

const DEMO_CREATOR_METRICS = [
  { month: 'Jun', views: 290, earnings: 1200 },
  { month: 'Jul', views: 410, earnings: 1850 },
  { month: 'Aug', views: 530, earnings: 2400 },
  { month: 'Sep', views: 690, earnings: 3100 },
  { month: 'Oct', views: 880, earnings: 3850 },
];

export const CreatorDashboardPage: React.FC = () => {
  const { user, creatorProfile, portfolio, refreshUser, showToast } = useAuth();
  const [proposals, setProposals] = useState<CampaignProposal[]>([]);
  const [invitations, setInvitations] = useState<CampaignInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals: Add Portfolio Project & Edit Creator Skills/Profile
  const [addProjectOpen, setAddProjectOpen] = useState(false);
  const [projTitle, setProjTitle] = useState('');
  const [projDesc, setProjDesc] = useState('');
  const [projCategory, setProjCategory] = useState<string>('AI Video Generation');
  const [projThumb, setProjThumb] = useState(
    'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1000&q=80'
  );
  const [projMediaType, setProjMediaType] = useState<'image' | 'video' | 'audio'>('video');
  const [projTools, setProjTools] = useState<string[]>(['Runway Gen-3 Alpha', 'Flux.1 Pro']);
  const [savingProj, setSavingProj] = useState(false);

  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editBio, setEditBio] = useState('');
  const [editSpec, setEditSpec] = useState('');
  const [editPrice, setEditPrice] = useState<number>(450);
  const [editSkills, setEditSkills] = useState('');
  const [editTools, setEditTools] = useState<string[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [propRes, invRes] = await Promise.all([
        apiRequest<{ proposals: CampaignProposal[] }>('/api/proposals'),
        apiRequest<{ invitations: CampaignInvitation[] }>('/api/invitations'),
      ]);
      setProposals(propRes.proposals || []);
      setInvitations(invRes.invitations || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (user && creatorProfile) {
      setEditTitle(creatorProfile.title);
      setEditBio(user.bio);
      setEditSpec(creatorProfile.specialization);
      setEditPrice(creatorProfile.starting_price);
      setEditSkills(creatorProfile.skills.join(', '));
      setEditTools(creatorProfile.ai_tools);
    }
  }, [user, creatorProfile]);

  // Calculate Profile Completion %
  const completionChecks = [
    Boolean(user?.bio && user.bio.length > 20),
    Boolean(user?.location),
    Boolean(creatorProfile?.skills && creatorProfile.skills.length >= 3),
    Boolean(creatorProfile?.ai_tools && creatorProfile.ai_tools.length >= 2),
    Boolean(portfolio.length >= 1),
    Boolean(creatorProfile?.packages && creatorProfile.packages.length >= 1),
  ];
  const completionPct = Math.round(
    (completionChecks.filter(Boolean).length / completionChecks.length) * 100
  );

  const handleAvailabilityToggle = async (newStatus: AvailabilityStatus) => {
    try {
      await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({ availability: newStatus }),
      });
      await refreshUser();
      showToast(`Availability updated to ${newStatus}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not update availability.', 'error');
    }
  };

  const handleAddPortfolio = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projTitle.trim() || !projDesc.trim() || !projThumb.trim()) return;
    setSavingProj(true);
    try {
      await apiRequest('/api/portfolio', {
        method: 'POST',
        body: JSON.stringify({
          title: projTitle,
          description: projDesc,
          category: projCategory,
          thumbnail_url: projThumb,
          media_type: projMediaType,
          ai_tools_used: projTools,
          deliverables: ['4K Final Master Assets', 'Commercial License'],
        }),
      });
      await refreshUser();
      showToast('New portfolio project published to your profile!', 'success');
      setAddProjectOpen(false);
      setProjTitle('');
      setProjDesc('');
    } catch (err: any) {
      showToast(err.message || 'Failed to add portfolio project.', 'error');
    } finally {
      setSavingProj(false);
    }
  };

  const handleDeletePortfolio = async (projectId: string) => {
    try {
      await apiRequest(`/api/portfolio/${projectId}`, { method: 'DELETE' });
      await refreshUser();
      showToast('Portfolio item removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not delete item.', 'error');
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiRequest('/api/auth/profile', {
        method: 'PUT',
        body: JSON.stringify({
          title: editTitle,
          bio: editBio,
          specialization: editSpec,
          starting_price: editPrice,
          skills: editSkills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          ai_tools: editTools,
        }),
      });
      await refreshUser();
      showToast('Creator profile & AI stack updated!', 'success');
      setEditProfileOpen(false);
    } catch (err: any) {
      showToast(err.message || 'Could not update profile.', 'error');
    }
  };

  const handleInvitationResponse = async (invId: string, status: 'accepted' | 'declined') => {
    try {
      await apiRequest(`/api/invitations/${invId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(`Invitation ${status}!`, status === 'accepted' ? 'success' : 'info');
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Could not update invitation.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="glass-card rounded-3xl h-44 animate-pulse" />
        <div className="glass-card rounded-3xl h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header & Availability Toggle */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#7C4DFF]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#7C4DFF]"
          />
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#9D7BFF]">
              AI Creator Studio Dashboard
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              {user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#B9B3D0]">{creatorProfile?.title}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Availability Selector */}
          <div className="flex items-center gap-1.5 bg-[#0B081D] p-1.5 rounded-2xl border border-white/10">
            {(['available', 'busy', 'unavailable'] as AvailabilityStatus[]).map((st) => (
              <button
                key={st}
                onClick={() => handleAvailabilityToggle(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  creatorProfile?.availability === st
                    ? 'bg-[#7C4DFF] text-white'
                    : 'text-[#B9B3D0] hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <button
            onClick={() => setEditProfileOpen(true)}
            className="px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold bg-[#17132E] hover:bg-[#211C40] text-white border border-white/15 flex items-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-[#9D7BFF]" /> Update Skills & Pricing
          </button>

          <button
            onClick={() => setAddProjectOpen(true)}
            className="btn-primary-orange px-5 py-2.5 rounded-2xl text-xs sm:text-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Add Portfolio Project
          </button>
        </div>
      </div>

      {/* Profile Completion Bar */}
      <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1 flex-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-white">
              Creator Profile & AI Matching Readiness
            </span>
            <span className="font-bold text-[#9D7BFF]">{completionPct}% Complete</span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#0B081D] overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#7C4DFF] to-[#FF7A1A] transition-all duration-500"
              style={{ width: `${completionPct}%` }}
            />
          </div>
        </div>
        <Link
          to={`/creators/${user?.id}`}
          className="text-xs font-semibold text-[#9D7BFF] hover:underline shrink-0"
        >
          View Public Profile →
        </Link>
      </div>

      {/* KPI Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-[#B9B3D0] flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-[#9D7BFF]" /> Profile Views
          </span>
          <div className="font-display font-extrabold text-3xl text-white mt-2">
            {creatorProfile?.profile_views.toLocaleString() || 0}
          </div>
          <span className="text-[11px] text-emerald-400">+18% vs last week</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-[#B9B3D0] flex items-center gap-1.5">
            <Star className="w-4 h-4 text-amber-400" /> Client Rating
          </span>
          <div className="font-display font-extrabold text-3xl text-white mt-2">
            {creatorProfile?.rating.toFixed(2) || '5.00'}★
          </div>
          <span className="text-[11px] text-[#B9B3D0]">
            {creatorProfile?.review_count || 0} Verified Reviews
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-[#B9B3D0] flex items-center gap-1.5">
            <Send className="w-4 h-4 text-[#FF7A1A]" /> Submitted Proposals
          </span>
          <div className="font-display font-extrabold text-3xl text-white mt-2">
            {proposals.length}
          </div>
          <span className="text-[11px] text-emerald-400">
            {proposals.filter((p) => p.status === 'accepted').length} Accepted
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-[#B9B3D0] flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-emerald-400" /> Starting Rate
          </span>
          <div className="font-display font-extrabold text-3xl text-white mt-2">
            ${creatorProfile?.starting_price || 350}
          </div>
          <span className="text-[11px] text-[#B9B3D0]">
            {creatorProfile?.completed_campaigns || 0} Completed Campaigns
          </span>
        </div>
      </div>

      {/* Main Grid: Portfolio Management + Invitations & Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Portfolio Projects & Engagement Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-white">
                Your AI Portfolio Projects ({portfolio.length})
              </h2>
              <button
                onClick={() => setAddProjectOpen(true)}
                className="text-xs font-semibold text-[#FF7A1A] hover:underline flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Project
              </button>
            </div>

            {portfolio.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#B9B3D0] bg-[#0B081D]/50 rounded-2xl">
                Upload your first AI-generated video, image, or LoRA project to rank higher in Brand AI Matching!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((proj) => (
                  <div
                    key={proj.id}
                    className="rounded-2xl overflow-hidden bg-[#0B081D]/80 border border-white/10 flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={proj.thumbnail_url}
                        alt={proj.title}
                        className="w-full h-36 object-cover"
                      />
                      <div className="p-3.5 space-y-1">
                        <span className="text-[10px] text-[#9D7BFF] font-semibold uppercase">
                          {proj.category}
                        </span>
                        <h3 className="font-bold text-sm text-white line-clamp-1">{proj.title}</h3>
                        <p className="text-xs text-[#B9B3D0] line-clamp-2">{proj.description}</p>
                      </div>
                    </div>
                    <div className="px-3.5 py-2.5 border-t border-white/5 flex items-center justify-between text-xs">
                      <span className="text-[#B9B3D0]">{proj.views} views</span>
                      <button
                        onClick={() => handleDeletePortfolio(proj.id)}
                        className="text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Profile Views & Demo Earnings Chart */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h2 className="font-display font-bold text-lg text-white">
                Monthly Profile Views & Project Volume
              </h2>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-[#B9B3D0] border border-white/10">
                Sample Demo Metrics
              </span>
            </div>
            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DEMO_CREATOR_METRICS}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="month" stroke="#B9B3D0" fontSize={12} />
                  <YAxis stroke="#B9B3D0" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17132E',
                      borderColor: '#7C4DFF',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="views" fill="#7C4DFF" radius={[6, 6, 0, 0]} name="Profile Views" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Campaign Invitations & Submitted Proposals */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Campaign Invitations */}
          <div className="glass-card rounded-3xl p-6 border border-[#7C4DFF]/30 space-y-4">
            <h2 className="font-display font-bold text-lg text-white">
              Brand Invitations ({invitations.length})
            </h2>
            {invitations.length === 0 ? (
              <p className="text-xs text-[#B9B3D0]">No direct campaign invitations yet.</p>
            ) : (
              <div className="space-y-3">
                {invitations.map((inv) => (
                  <div
                    key={inv.id}
                    className="p-4 rounded-2xl bg-[#0B081D]/80 border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#9D7BFF]">{inv.brand_name}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold bg-white/10 text-white">
                        {inv.status}
                      </span>
                    </div>
                    <Link
                      to={`/campaigns/${inv.campaign_id}`}
                      className="font-bold text-sm text-white hover:text-[#9D7BFF] block"
                    >
                      {inv.campaign_title}
                    </Link>
                    <p className="text-xs text-[#B9B3D0] italic">“{inv.message}”</p>
                    {inv.status === 'pending' && (
                      <div className="flex items-center gap-2 pt-1">
                        <button
                          onClick={() => handleInvitationResponse(inv.id, 'declined')}
                          className="px-3 py-1.5 rounded-xl text-xs bg-rose-500/15 text-rose-300"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => handleInvitationResponse(inv.id, 'accepted')}
                          className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white"
                        >
                          Accept Invite
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submitted Proposals Tracker */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white">
                Submitted Proposals ({proposals.length})
              </h2>
              <Link to="/campaigns" className="text-xs text-[#9D7BFF] hover:underline">
                Browse Briefs →
              </Link>
            </div>
            {proposals.length === 0 ? (
              <p className="text-xs text-[#B9B3D0]">
                You haven’t submitted any proposals yet. Browse open campaigns to pitch!
              </p>
            ) : (
              <div className="space-y-3">
                {proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-2xl bg-[#0B081D]/70 border border-white/10 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/campaigns/${prop.campaign_id}`}
                        className="font-bold text-xs sm:text-sm text-white hover:text-[#9D7BFF] line-clamp-1"
                      >
                        {prop.campaign_title}
                      </Link>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          prop.status === 'accepted'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : prop.status === 'rejected'
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-amber-500/20 text-amber-300'
                        }`}
                      >
                        {prop.status}
                      </span>
                    </div>
                    <div className="text-xs text-[#B9B3D0]">
                      Proposed: <strong className="text-emerald-400">${prop.price}</strong> •{' '}
                      {prop.timeline}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ================= MODAL: ADD PORTFOLIO PROJECT ================= */}
      {addProjectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 border border-white/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                Add AI Portfolio Project
              </h3>
              <button onClick={() => setAddProjectOpen(false)} className="text-[#B9B3D0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddPortfolio} className="space-y-4">
              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1">Project Title *</label>
                <input
                  type="text"
                  value={projTitle}
                  onChange={(e) => setProjTitle(e.target.value)}
                  placeholder="e.g., LUMINA — 4K Generative Product Spot"
                  className="input-dark w-full text-sm"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#B9B3D0] block mb-1">Category</label>
                  <select
                    value={projCategory}
                    onChange={(e) => setProjCategory(e.target.value)}
                    className="input-dark w-full text-xs sm:text-sm"
                  >
                    {CREATOR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#B9B3D0] block mb-1">Media Format</label>
                  <select
                    value={projMediaType}
                    onChange={(e) => setProjMediaType(e.target.value as any)}
                    className="input-dark w-full text-xs sm:text-sm"
                  >
                    <option value="video">AI Video</option>
                    <option value="image">AI Image / Stills</option>
                    <option value="audio">AI Voice / Audio</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1">Preview Image URL *</label>
                <input
                  type="url"
                  value={projThumb}
                  onChange={(e) => setProjThumb(e.target.value)}
                  className="input-dark w-full text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1">
                  Project Description & AI Pipeline Used *
                </label>
                <textarea
                  rows={3}
                  value={projDesc}
                  onChange={(e) => setProjDesc(e.target.value)}
                  placeholder="Describe the prompt engineering, LoRA training, or motion control workflow..."
                  className="input-dark w-full text-sm"
                  required
                />
              </div>
              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1">AI Tools Used</label>
                <div className="flex flex-wrap gap-1.5">
                  {AI_TOOLS_LIST.slice(0, 8).map((tool) => {
                    const active = projTools.includes(tool);
                    return (
                      <button
                        type="button"
                        key={tool}
                        onClick={() =>
                          setProjTools((prev) =>
                            active ? prev.filter((t) => t !== tool) : [...prev, tool]
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs border ${
                          active
                            ? 'bg-[#7C4DFF] text-white border-[#9D7BFF]'
                            : 'bg-[#0B081D] text-[#B9B3D0] border-white/10'
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAddProjectOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#B9B3D0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingProj}
                  className="btn-primary-orange px-5 py-2.5 rounded-xl text-xs"
                >
                  {savingProj ? 'Publishing...' : 'Publish Portfolio Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT SKILLS & PROFILE ================= */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 border border-white/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                Update Creator Profile & AI Stack
              </h3>
              <button onClick={() => setEditProfileOpen(false)} className="text-[#B9B3D0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1">Professional Title</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="input-dark w-full text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-[#B9B3D0] block mb-1">Primary Specialization</label>
                  <select
                    value={editSpec}
                    onChange={(e) => setEditSpec(e.target.value)}
                    className="input-dark w-full text-xs sm:text-sm"
                  >
                    {CREATOR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[#B9B3D0] block mb-1">Starting Package ($ USD)</label>
                  <input
                    type="number"
                    min={50}
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="input-dark w-full text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1">Bio</label>
                <textarea
                  rows={3}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="input-dark w-full text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1">
                  Skills (comma-separated)
                </label>
                <input
                  type="text"
                  value={editSkills}
                  onChange={(e) => setEditSkills(e.target.value)}
                  className="input-dark w-full text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-[#B9B3D0] block mb-1">AI Tools Mastered</label>
                <div className="flex flex-wrap gap-1.5">
                  {AI_TOOLS_LIST.map((tool) => {
                    const active = editTools.includes(tool);
                    return (
                      <button
                        type="button"
                        key={tool}
                        onClick={() =>
                          setEditTools((prev) =>
                            active ? prev.filter((t) => t !== tool) : [...prev, tool]
                          )
                        }
                        className={`px-2.5 py-1 rounded-lg text-xs border ${
                          active
                            ? 'bg-[#7C4DFF] text-white border-[#9D7BFF]'
                            : 'bg-[#0B081D] text-[#B9B3D0] border-white/10'
                        }`}
                      >
                        {tool}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#B9B3D0]"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-electric px-5 py-2.5 rounded-xl text-xs">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
