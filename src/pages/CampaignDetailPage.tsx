import React, { useEffect, useState, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  DollarSign,
  CheckCircle2,
  Sparkles,
  Send,
  Star,
  Wand2,
  Target,
  Users,
  Cpu,
  Layers,
  Award,
} from 'lucide-react';
import { Campaign, CampaignProposal, CreatorMatchResult } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { CreatorCard } from '../components/CreatorCard';

export const CampaignDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, portfolio, showToast } = useAuth();

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [proposals, setProposals] = useState<CampaignProposal[]>([]);
  const [aiMatches, setAiMatches] = useState<CreatorMatchResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Proposal form state (for Creators)
  const [pitch, setPitch] = useState('');
  const [price, setPrice] = useState<number>(950);
  const [timeline, setTimeline] = useState('6 days');
  const [selectedPortIds, setSelectedPortIds] = useState<string[]>([]);
  const [submittingProp, setSubmittingProp] = useState(false);

  // Review form state (for owning Brand when campaign is Completed)
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const [campRes, matchRes] = await Promise.all([
        apiRequest<{ campaign: Campaign; proposals: CampaignProposal[] }>(`/api/campaigns/${id}`),
        apiRequest<{ matches: CreatorMatchResult[] }>('/api/ai/match-creators', {
          method: 'POST',
          body: JSON.stringify({ campaignId: id }),
        }),
      ]);
      setCampaign(campRes.campaign);
      setProposals(campRes.proposals || []);
      setAiMatches((matchRes.matches || []).slice(0, 3));
      if (campRes.campaign) {
        setPrice(Math.round((campRes.campaign.budget_min + campRes.campaign.budget_max) / 2));
      }
    } catch {
      setCampaign(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const isOwnerBrand = user && campaign && (user.id === campaign.brand_id || user.role === 'admin');
  const myProposal = user && proposals.find((p) => p.creator_id === user.id);

  const handleSubmitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in as a Creator to submit a proposal.', 'info');
      navigate('/auth?mode=login');
      return;
    }
    if (!campaign) return;
    setSubmittingProp(true);
    try {
      const res = await apiRequest<{ proposal: CampaignProposal }>(
        `/api/campaigns/${campaign.id}/proposals`,
        {
          method: 'POST',
          body: JSON.stringify({
            pitch,
            price,
            timeline,
            portfolio_ids: selectedPortIds,
          }),
        }
      );
      setProposals((prev) => [res.proposal, ...prev]);
      showToast('Your proposal has been submitted to the brand!', 'success');
      setPitch('');
    } catch (err: any) {
      showToast(err.message || 'Could not submit proposal.', 'error');
    } finally {
      setSubmittingProp(false);
    }
  };

  const handleProposalDecision = async (proposalId: string, status: 'accepted' | 'rejected') => {
    try {
      await apiRequest(`/api/proposals/${proposalId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(
        status === 'accepted'
          ? 'Proposal accepted! Campaign is now In Progress & conversation started.'
          : 'Proposal marked as rejected.',
        status === 'accepted' ? 'success' : 'info'
      );
      await loadData();
    } catch (err: any) {
      showToast(err.message || 'Failed to update proposal status.', 'error');
    }
  };

  const handleStatusChange = async (newStatus: Campaign['status']) => {
    if (!campaign) return;
    try {
      const res = await apiRequest<{ campaign: Campaign }>(`/api/campaigns/${campaign.id}`, {
        method: 'PUT',
        body: JSON.stringify({ status: newStatus }),
      });
      setCampaign(res.campaign);
      showToast(`Campaign status updated to ${newStatus.replace('_', ' ')}.`, 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update campaign status.', 'error');
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!campaign) return;
    const targetCreatorId =
      campaign.hired_creator_id ||
      proposals.find((p) => p.status === 'accepted')?.creator_id ||
      'creator-1';

    setSubmittingReview(true);
    try {
      await apiRequest('/api/reviews', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: campaign.id,
          creator_id: targetCreatorId,
          rating: reviewRating,
          feedback: reviewFeedback,
        }),
      });
      showToast('Thank you! Your verified review has been published.', 'success');
      setReviewSubmitted(true);
      setReviewFeedback('');
    } catch (err: any) {
      showToast(err.message || 'Could not submit review.', 'error');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 space-y-6">
        <div className="glass-card rounded-3xl h-64 animate-pulse" />
        <div className="glass-card rounded-3xl h-96 animate-pulse" />
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display font-bold text-2xl text-white">Campaign Brief Not Found</h2>
        <Link to="/campaigns" className="btn-electric px-6 py-2.5 rounded-xl text-sm inline-block mt-4">
          Back to All Campaigns
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ================= CAMPAIGN HEADER ================= */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7C4DFF]/20 text-[#9D7BFF] border border-[#7C4DFF]/40">
                {campaign.category}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ● {campaign.status.replace('_', ' ')}
              </span>
              <span className="text-xs text-[#B9B3D0]">Posted by {campaign.brand_name}</span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              {campaign.title}
            </h1>

            <div className="flex flex-wrap items-center gap-6 text-xs sm:text-sm pt-1">
              <span className="flex items-center gap-1.5 font-bold text-emerald-400">
                <DollarSign className="w-4 h-4" />
                Budget: ${campaign.budget_min.toLocaleString()} – ${campaign.budget_max.toLocaleString()} USD
              </span>
              <span className="flex items-center gap-1.5 text-[#B9B3D0]">
                <Calendar className="w-4 h-4 text-[#7C4DFF]" /> Deadline: {campaign.deadline}
              </span>
              <span className="flex items-center gap-1.5 text-[#B9B3D0] capitalize">
                <Award className="w-4 h-4 text-[#FF7A1A]" /> Experience: {campaign.experience_level}
              </span>
            </div>
          </div>

          {/* Owner Controls */}
          {isOwnerBrand && (
            <div className="flex flex-wrap items-center gap-2 bg-[#0B081D]/70 p-3 rounded-2xl border border-white/10">
              <span className="text-xs text-[#B9B3D0] mr-1">Campaign Status:</span>
              {(['draft', 'open', 'in_progress', 'completed'] as Campaign['status'][]).map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusChange(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold uppercase transition ${
                    campaign.status === st
                      ? 'bg-[#7C4DFF] text-white'
                      : 'bg-white/5 text-[#B9B3D0] hover:text-white'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ================= MAIN GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 7 Cols: Full Brief Details */}
        <div className="lg:col-span-7 space-y-6">
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 space-y-6">
            <div>
              <h2 className="font-display font-bold text-lg text-white mb-2">Campaign Overview</h2>
              <p className="text-sm text-[#B9B3D0] leading-relaxed">{campaign.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#0B081D]/60 border border-white/10">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9D7BFF] flex items-center gap-1.5 mb-1.5">
                  <Target className="w-3.5 h-3.5 text-[#FF7A1A]" /> Campaign Goals
                </h3>
                <p className="text-xs text-white/90 leading-relaxed">{campaign.goals}</p>
              </div>
              <div className="p-4 rounded-2xl bg-[#0B081D]/60 border border-white/10">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9D7BFF] flex items-center gap-1.5 mb-1.5">
                  <Users className="w-3.5 h-3.5 text-[#7C4DFF]" /> Target Audience
                </h3>
                <p className="text-xs text-white/90 leading-relaxed">{campaign.target_audience}</p>
              </div>
            </div>

            {/* Deliverables */}
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9D7BFF] flex items-center gap-1.5 mb-3">
                <Layers className="w-4 h-4 text-[#FF7A1A]" /> Required Deliverables
              </h3>
              <ul className="space-y-2">
                {campaign.deliverables.map((del, idx) => (
                  <li
                    key={idx}
                    className="p-3 rounded-xl bg-[#0B081D]/70 border border-white/5 text-xs sm:text-sm text-white flex items-center gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    {del}
                  </li>
                ))}
              </ul>
            </div>

            {/* Required Skills & AI Tools */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#B9B3D0] flex items-center gap-1.5 mb-2">
                  <Cpu className="w-3.5 h-3.5 text-[#9D7BFF]" /> Required AI Tools
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.required_ai_tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-[#7C4DFF]/20 text-white border border-[#7C4DFF]/40"
                    >
                      {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#B9B3D0] mb-2">
                  Required Production Skills
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {campaign.required_skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl text-xs bg-[#0B081D] text-[#B9B3D0] border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Verified Review Box when Campaign is Completed & User is Brand Owner */}
          {isOwnerBrand && campaign.status === 'completed' && !reviewSubmitted && (
            <div className="glass-card rounded-3xl p-6 border border-emerald-500/40 space-y-4">
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <Star className="w-4 h-4 fill-emerald-400" /> Campaign Completed — Leave a Creator Review
              </div>
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="text-xs text-[#B9B3D0] block mb-1.5">Star Rating (1–5)</label>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setReviewRating(star)}
                        className="p-1.5 rounded-lg bg-[#0B081D] border border-white/10"
                      >
                        <Star
                          className={`w-5 h-5 ${
                            star <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-white/20'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-[#B9B3D0] block mb-1.5">Written Feedback</label>
                  <textarea
                    rows={3}
                    value={reviewFeedback}
                    onChange={(e) => setReviewFeedback(e.target.value)}
                    placeholder="Share how the AI creator performed on quality, prompt consistency, and turnaround..."
                    className="input-dark w-full text-sm"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="btn-primary-orange px-6 py-2.5 rounded-xl text-xs"
                >
                  {submittingReview ? 'Publishing Review...' : 'Publish Verified Review'}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Right 5 Cols: Proposal Submission (Creator) OR Incoming Proposals (Brand) */}
        <div className="lg:col-span-5 space-y-6">
          {isOwnerBrand ? (
            <div className="glass-card rounded-3xl p-6 border border-[#7C4DFF]/30 space-y-4">
              <h3 className="font-display font-bold text-lg text-white">
                Submitted Creator Proposals ({proposals.length})
              </h3>
              {proposals.length === 0 ? (
                <p className="text-xs text-[#B9B3D0] py-6 text-center">
                  No proposals received yet. Invite matched AI creators below!
                </p>
              ) : (
                <div className="space-y-4">
                  {proposals.map((prop) => (
                    <div
                      key={prop.id}
                      className="p-4 rounded-2xl bg-[#0B081D]/80 border border-white/10 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <Link
                          to={`/creators/${prop.creator_id}`}
                          className="flex items-center gap-2.5 hover:opacity-90"
                        >
                          <img
                            src={prop.creator_avatar}
                            alt={prop.creator_name}
                            className="w-10 h-10 rounded-xl object-cover border border-[#9D7BFF]"
                          />
                          <div>
                            <div className="text-sm font-bold text-white">{prop.creator_name}</div>
                            <div className="text-[11px] text-[#9D7BFF]">
                              {prop.creator_title} • {prop.creator_rating}★
                            </div>
                          </div>
                        </Link>
                        <div className="text-right">
                          <div className="font-display font-extrabold text-lg text-emerald-400">
                            ${prop.price}
                          </div>
                          <div className="text-[11px] text-[#B9B3D0]">{prop.timeline}</div>
                        </div>
                      </div>

                      <p className="text-xs text-white/90 leading-relaxed bg-white/5 p-3 rounded-xl">
                        {prop.pitch}
                      </p>

                      <div className="flex items-center justify-between pt-1">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase ${
                            prop.status === 'accepted'
                              ? 'bg-emerald-500/20 text-emerald-300'
                              : prop.status === 'rejected'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-amber-500/20 text-amber-300'
                          }`}
                        >
                          {prop.status}
                        </span>

                        {prop.status === 'pending' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleProposalDecision(prop.id, 'rejected')}
                              className="px-3 py-1.5 rounded-xl text-xs bg-rose-500/15 text-rose-300 hover:bg-rose-500/25 border border-rose-500/30"
                            >
                              Decline
                            </button>
                            <button
                              onClick={() => handleProposalDecision(prop.id, 'accepted')}
                              className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-500 text-white hover:bg-emerald-600"
                            >
                              Accept & Hire
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="glass-card rounded-3xl p-6 border border-[#7C4DFF]/30 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#FF7A1A]" /> Submit Creator Proposal
                </h3>
              </div>

              {myProposal ? (
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-300">
                      ✓ Proposal Submitted
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] uppercase font-bold bg-white/10 text-white">
                      Status: {myProposal.status}
                    </span>
                  </div>
                  <p className="text-xs text-[#B9B3D0]">{myProposal.pitch}</p>
                  <div className="text-xs font-semibold text-white pt-1">
                    Quoted: ${myProposal.price} USD • Timeline: {myProposal.timeline}
                  </div>
                </div>
              ) : campaign.status !== 'open' ? (
                <p className="text-xs text-[#B9B3D0]">
                  This campaign is currently {campaign.status.replace('_', ' ')} and is no longer accepting new proposals.
                </p>
              ) : user?.role === 'brand' ? (
                <div className="p-4 rounded-2xl bg-[#0B081D]/70 border border-white/10 text-xs text-[#B9B3D0] space-y-2">
                  <p>You are signed in with a Brand/Agency account. Switch to a Creator account to submit proposals.</p>
                  <Link to="/campaigns/new" className="text-[#9D7BFF] font-semibold hover:underline block">
                    Or create your own Campaign Brief →
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmitProposal} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
                      Personalized Creative Pitch & AI Pipeline Approach
                    </label>
                    <textarea
                      rows={4}
                      value={pitch}
                      onChange={(e) => setPitch(e.target.value)}
                      placeholder="Explain how you will execute the deliverables using your AI tools (e.g. custom Flux LoRA + Runway Gen-3)..."
                      className="input-dark w-full text-sm"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
                        Proposed Price (USD)
                      </label>
                      <input
                        type="number"
                        min={50}
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="input-dark w-full text-sm"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
                        Delivery Timeline
                      </label>
                      <input
                        type="text"
                        value={timeline}
                        onChange={(e) => setTimeline(e.target.value)}
                        placeholder="e.g. 5 days"
                        className="input-dark w-full text-sm"
                        required
                      />
                    </div>
                  </div>

                  {portfolio.length > 0 && (
                    <div>
                      <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
                        Attach Relevant Portfolio Samples (Optional)
                      </label>
                      <div className="space-y-1.5 max-h-36 overflow-y-auto">
                        {portfolio.map((item) => {
                          const checked = selectedPortIds.includes(item.id);
                          return (
                            <label
                              key={item.id}
                              className="flex items-center gap-2 p-2 rounded-xl bg-[#0B081D]/60 border border-white/10 text-xs cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={checked}
                                onChange={() =>
                                  setSelectedPortIds((prev) =>
                                    checked ? prev.filter((i) => i !== item.id) : [...prev, item.id]
                                  )
                                }
                                className="accent-[#7C4DFF]"
                              />
                              <span className="text-white truncate">{item.title}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submittingProp}
                    className="btn-primary-orange w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    {submittingProp ? 'Submitting Proposal...' : 'Submit Proposal'}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ================= AI MATCHED CREATORS FOR THIS CAMPAIGN ================= */}
      {aiMatches.length > 0 && (
        <div className="pt-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF7A1A]">
                <Wand2 className="w-3.5 h-3.5" /> Intelligent Creator Recommendations
              </div>
              <h2 className="font-display font-bold text-2xl text-white mt-1">
                Top AI-Matched Creators for This Brief
              </h2>
              <p className="text-xs text-[#B9B3D0]">
                Calculated via deterministic 6-factor weighted scoring (niche, AI tools, portfolio, budget, availability, rating). Match scores are recommendations, not guarantees.
              </p>
            </div>
            <Link
              to={`/ai-studio?campaignId=${campaign.id}`}
              className="text-xs font-semibold text-[#9D7BFF] hover:text-white"
            >
              Open Full 100-Point Match Breakdown →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {aiMatches.map((m) => (
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
