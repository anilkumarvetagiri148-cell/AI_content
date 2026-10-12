import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  Sparkles,
  Briefcase,
  Heart,
  MessageSquare,
  CheckCircle2,
  XCircle,
  Send,
  Wand2,
  ArrowUpRight,
  BarChart3,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import {
  Campaign,
  CampaignInvitation,
  CampaignProposal,
  Conversation,
  CreatorMatchResult,
  FullCreator,
} from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CreatorCard } from '../components/CreatorCard';

const DEMO_PERFORMANCE_DATA = [
  { week: 'Wk 1', impressions: 180, conversions: 42 },
  { week: 'Wk 2', impressions: 310, conversions: 78 },
  { week: 'Wk 3', impressions: 490, conversions: 134 },
  { week: 'Wk 4', impressions: 680, conversions: 195 },
  { week: 'Wk 5', impressions: 920, conversions: 284 },
];

export const BrandDashboardPage: React.FC = () => {
  const { user, showToast } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [proposals, setProposals] = useState<CampaignProposal[]>([]);
  const [savedCreators, setSavedCreators] = useState<FullCreator[]>([]);
  const [invitations, setInvitations] = useState<CampaignInvitation[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [recommended, setRecommended] = useState<CreatorMatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [campRes, propRes, favRes, invRes, convRes, matchRes] = await Promise.all([
        apiRequest<{ campaigns: Campaign[] }>(`/api/campaigns?brandId=${user.id}`),
        apiRequest<{ proposals: CampaignProposal[] }>('/api/proposals'),
        apiRequest<{ creators: FullCreator[] }>('/api/favorites'),
        apiRequest<{ invitations: CampaignInvitation[] }>('/api/invitations'),
        apiRequest<{ conversations: Conversation[] }>('/api/conversations'),
        apiRequest<{ matches: CreatorMatchResult[] }>('/api/ai/match-creators', {
          method: 'POST',
          body: JSON.stringify({
            category: 'AI Video Generation',
            required_skills: ['Cinematic AI Video', 'Custom LoRA Training'],
            required_ai_tools: ['Runway Gen-3 Alpha', 'Flux.1 Pro'],
            budget_min: 500,
            budget_max: 1800,
          }),
        }),
      ]);
      setCampaigns(campRes.campaigns || []);
      setProposals(propRes.proposals || []);
      setSavedCreators(favRes.creators || []);
      setInvitations(invRes.invitations || []);
      setConversations(convRes.conversations || []);
      setRecommended((matchRes.matches || []).slice(0, 3));
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const handleProposalAction = async (proposalId: string, status: 'accepted' | 'rejected') => {
    try {
      await apiRequest(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(
        status === 'accepted'
          ? 'Proposal accepted! Campaign moved to In Progress.'
          : 'Proposal declined.',
        status === 'accepted' ? 'success' : 'info'
      );
      await loadDashboard();
    } catch (err: any) {
      showToast(err.message || 'Could not update proposal.', 'error');
    }
  };

  const statusBadge = (status: Campaign['status']) => {
    switch (status) {
      case 'open':
        return 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';
      case 'in_progress':
        return 'bg-[#7C4DFF]/25 text-[#9D7BFF] border-[#7C4DFF]/40';
      case 'completed':
        return 'bg-sky-500/20 text-sky-300 border-sky-500/30';
      default:
        return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="glass-card rounded-3xl h-40 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl h-80 animate-pulse lg:col-span-2" />
          <div className="glass-card rounded-3xl h-80 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-[#7C4DFF]/40 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url}
            alt={user?.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-[#7C4DFF]"
          />
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF7A1A]">
              Brand & Agency Command Center
            </span>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              {user?.company_name || user?.name}
            </h1>
            <p className="text-xs sm:text-sm text-[#B9B3D0]">
              Manage active AI campaigns, review creator proposals, and launch briefs with the AI Assistant.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/campaigns/new"
            className="btn-primary-orange px-5 py-3 rounded-2xl text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" /> Create New Campaign Brief
          </Link>
          <Link
            to="/ai-studio"
            className="px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold bg-[#17132E] hover:bg-[#211C40] text-white border border-[#7C4DFF]/40 transition inline-flex items-center gap-2"
          >
            <Wand2 className="w-4 h-4 text-[#9D7BFF]" /> AI Matcher
          </Link>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-[#B9B3D0] flex items-center gap-1.5">
            <Briefcase className="w-4 h-4 text-[#7C4DFF]" /> Total Campaigns
          </span>
          <div className="font-display font-extrabold text-3xl text-white mt-2">
            {campaigns.length}
          </div>
          <span className="text-[11px] text-emerald-400">
            {campaigns.filter((c) => c.status === 'open' || c.status === 'in_progress').length} Active
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-[#B9B3D0] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#FF7A1A]" /> Incoming Proposals
          </span>
          <div className="font-display font-extrabold text-3xl text-white mt-2">
            {proposals.length}
          </div>
          <span className="text-[11px] text-[#9D7BFF]">
            {proposals.filter((p) => p.status === 'pending').length} Pending Review
          </span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-[#B9B3D0] flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-400" /> Saved Creators
          </span>
          <div className="font-display font-extrabold text-3xl text-white mt-2">
            {savedCreators.length}
          </div>
          <span className="text-[11px] text-[#B9B3D0]">Shortlisted Talent</span>
        </div>

        <div className="glass-card rounded-2xl p-5 border border-white/10">
          <span className="text-xs text-[#B9B3D0] flex items-center gap-1.5">
            <Send className="w-4 h-4 text-emerald-400" /> Sent Invitations
          </span>
          <div className="font-display font-extrabold text-3xl text-white mt-2">
            {invitations.length}
          </div>
          <span className="text-[11px] text-[#B9B3D0]">Direct Creator Invites</span>
        </div>
      </div>

      {/* Main Two-Column Grid: Active Campaigns + Incoming Proposals */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Campaigns + Performance Chart */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-white">Your Campaigns</h2>
              <Link to="/campaigns/new" className="text-xs text-[#9D7BFF] hover:underline">
                + New Brief
              </Link>
            </div>

            {campaigns.length === 0 ? (
              <p className="text-xs text-[#B9B3D0] py-6 text-center">
                No campaigns created yet. Launch your first brief to start receiving creator proposals!
              </p>
            ) : (
              <div className="space-y-3">
                {campaigns.map((camp) => (
                  <div
                    key={camp.id}
                    className="p-4 rounded-2xl bg-[#0B081D]/70 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${statusBadge(
                            camp.status
                          )}`}
                        >
                          {camp.status.replace('_', ' ')}
                        </span>
                        <span className="text-xs text-[#9D7BFF]">{camp.category}</span>
                      </div>
                      <Link
                        to={`/campaigns/${camp.id}`}
                        className="font-display font-bold text-sm sm:text-base text-white hover:text-[#9D7BFF] block"
                      >
                        {camp.title}
                      </Link>
                      <div className="text-xs text-[#B9B3D0]">
                        Budget: ${camp.budget_min}–${camp.budget_max} • Due {camp.deadline} •{' '}
                        <strong className="text-white">{camp.proposal_count || 0} proposals</strong>
                      </div>
                    </div>

                    <Link
                      to={`/campaigns/${camp.id}`}
                      className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-[#7C4DFF] text-white border border-white/10 transition shrink-0 text-center"
                    >
                      Manage
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Campaign Performance Summary Chart (Labeled Sample Analytics) */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#9D7BFF]" />
                <h2 className="font-display font-bold text-lg text-white">
                  AI Creative Performance Reach (K)
                </h2>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 text-[#B9B3D0] border border-white/10">
                Sample Demo Campaign Analytics
              </span>
            </div>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={DEMO_PERFORMANCE_DATA}>
                  <defs>
                    <linearGradient id="purpleGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7C4DFF" stopOpacity={0.5} />
                      <stop offset="95%" stopColor="#7C4DFF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="week" stroke="#B9B3D0" fontSize={12} />
                  <YAxis stroke="#B9B3D0" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#17132E',
                      borderColor: '#7C4DFF',
                      borderRadius: '12px',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="impressions"
                    stroke="#7C4DFF"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#purpleGrad)"
                    name="Impressions (K)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right 5 Cols: Incoming Proposals + Recent Messages + Pending Invitations */}
        <div className="lg:col-span-5 space-y-6">
          {/* Incoming Creator Proposals */}
          <div className="glass-card rounded-3xl p-6 border border-[#7C4DFF]/30 space-y-4">
            <h2 className="font-display font-bold text-lg text-white">
              Incoming Creator Proposals ({proposals.length})
            </h2>

            {proposals.length === 0 ? (
              <p className="text-xs text-[#B9B3D0] py-4">No proposals received yet.</p>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {proposals.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-4 rounded-2xl bg-[#0B081D]/80 border border-white/10 space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <Link
                        to={`/creators/${prop.creator_id}`}
                        className="flex items-center gap-2.5 hover:opacity-90"
                      >
                        <img
                          src={prop.creator_avatar}
                          alt={prop.creator_name}
                          className="w-9 h-9 rounded-xl object-cover"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{prop.creator_name}</div>
                          <div className="text-[10px] text-[#9D7BFF] line-clamp-1">
                            For: {prop.campaign_title}
                          </div>
                        </div>
                      </Link>
                      <div className="text-right">
                        <span className="font-display font-bold text-sm text-emerald-400">
                          ${prop.price}
                        </span>
                        <span className="block text-[10px] text-[#B9B3D0]">{prop.timeline}</span>
                      </div>
                    </div>

                    <p className="text-xs text-[#B9B3D0] line-clamp-2">{prop.pitch}</p>

                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[10px] uppercase font-bold text-[#9D7BFF]">
                        Status: {prop.status}
                      </span>
                      {prop.status === 'pending' && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleProposalAction(prop.id, 'rejected')}
                            className="p-1.5 rounded-lg bg-rose-500/15 text-rose-300 hover:bg-rose-500/30"
                            title="Decline Proposal"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleProposalAction(prop.id, 'accepted')}
                            className="px-3 py-1 rounded-lg bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Accept
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Messages */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#9D7BFF]" /> Recent Messages
              </h2>
              <Link to="/messages" className="text-xs text-[#9D7BFF] hover:underline">
                Open Inbox →
              </Link>
            </div>
            {conversations.length === 0 ? (
              <p className="text-xs text-[#B9B3D0]">No active conversations yet.</p>
            ) : (
              <div className="space-y-2.5">
                {conversations.slice(0, 3).map((conv) => (
                  <Link
                    key={conv.id}
                    to="/messages"
                    className="p-3 rounded-2xl bg-[#0B081D]/70 hover:bg-[#7C4DFF]/15 border border-white/10 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={conv.creator_avatar}
                        alt={conv.creator_name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-white">{conv.creator_name}</div>
                        <div className="text-xs text-[#B9B3D0] truncate">{conv.last_message}</div>
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-[#9D7BFF] shrink-0" />
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Pending Invitations */}
          <div className="glass-card rounded-3xl p-6 border border-white/10 space-y-3">
            <h2 className="font-display font-bold text-base text-white">Sent Creator Invitations</h2>
            {invitations.length === 0 ? (
              <p className="text-xs text-[#B9B3D0]">No invitations sent yet.</p>
            ) : (
              invitations.map((inv) => (
                <div
                  key={inv.id}
                  className="p-3 rounded-xl bg-[#0B081D]/60 border border-white/5 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-semibold text-white">{inv.creator_name}</span>
                    <span className="block text-[11px] text-[#B9B3D0] line-clamp-1">
                      {inv.campaign_title}
                    </span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-[#7C4DFF]/20 text-[#9D7BFF]">
                    {inv.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Saved Creators Section */}
      {savedCreators.length > 0 && (
        <div className="space-y-4">
          <h2 className="font-display font-bold text-2xl text-white">
            Your Saved Creators ({savedCreators.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedCreators.map((c) => (
              <CreatorCard key={c.id} creator={c} />
            ))}
          </div>
        </div>
      )}

      {/* AI Recommended Creators */}
      {recommended.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold uppercase tracking-widest text-[#FF7A1A]">
                AI Talent Recommendations
              </span>
              <h2 className="font-display font-bold text-2xl text-white">
                Recommended Creators for Your Brand
              </h2>
            </div>
            <Link to="/ai-studio" className="text-xs text-[#9D7BFF] hover:underline">
              Customize Matching Criteria →
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recommended.map((m) => (
              <CreatorCard
                key={m.creator.id}
                creator={m.creator}
                matchScore={m.matchScore}
                matchSummary={m.summaryReason}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
