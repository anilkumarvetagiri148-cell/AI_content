import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link, useSearchParams } from 'react-router-dom';
import {
  MapPin,
  Globe,
  Star,
  Heart,
  CheckCircle2,
  MessageSquare,
  Send,
  Sparkles,
  Clock,
  Briefcase,
  Eye,
  ExternalLink,
  Layers,
  X,
} from 'lucide-react';
import { Campaign, formatINR, FullCreator, PortfolioProject } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { ProjectModal } from '../components/ProjectModal';
import { SmartImage } from '../components/SmartImage';

export const CreatorProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, savedCreatorIds, toggleFavorite, showToast } = useAuth();

  const [creator, setCreator] = useState<FullCreator | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  // Modals: Message Creator & Invite to Campaign
  const [messageModalOpen, setMessageModalOpen] = useState(false);
  const [messageBody, setMessageBody] = useState('');
  const [sendingMsg, setSendingMsg] = useState(false);

  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [brandCampaigns, setBrandCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState('');
  const [inviteNote, setInviteNote] = useState('');
  const [sendingInvite, setSendingInvite] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    apiRequest<{ creator: FullCreator }>(`/api/creators/${id}`)
      .then((res) => setCreator(res.creator))
      .catch(() => setCreator(null))
      .finally(() => setLoading(false));
  }, [id]);

  // Auto-open hire/message modal if navigated with ?action=hire
  useEffect(() => {
    if (!loading && creator && searchParams.get('action') === 'hire') {
      if (user?.role === 'brand' || user?.role === 'admin') {
        openInviteModal();
      } else if (user) {
        setMessageModalOpen(true);
      }
    }
  }, [loading, creator, searchParams]);

  const openInviteModal = async () => {
    if (!user) {
      showToast('Please sign in as a Brand or Agency to invite creators.', 'info');
      navigate('/auth?mode=login');
      return;
    }
    if (user.role !== 'brand' && user.role !== 'admin') {
      setMessageModalOpen(true);
      return;
    }
    setInviteModalOpen(true);
    try {
      const res = await apiRequest<{ campaigns: Campaign[] }>(`/api/campaigns?brandId=${user.id}`);
      const openList = res.campaigns.filter((c) => c.status === 'open' || c.status === 'draft');
      setBrandCampaigns(openList);
      if (openList[0]) setSelectedCampaignId(openList[0].id);
    } catch {
      // ignore
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creator || !selectedCampaignId) return;
    setSendingInvite(true);
    try {
      await apiRequest('/api/invitations', {
        method: 'POST',
        body: JSON.stringify({
          campaign_id: selectedCampaignId,
          creator_id: creator.id,
          message:
            inviteNote ||
            `Hi ${creator.name}, we would love to invite you to submit a proposal for our campaign!`,
        }),
      });
      showToast(`Campaign invitation sent to ${creator.name}!`, 'success');
      setInviteModalOpen(false);
      setInviteNote('');
    } catch (err: any) {
      showToast(err.message || 'Could not send invitation.', 'error');
    } finally {
      setSendingInvite(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to message creators.', 'info');
      navigate('/auth?mode=login');
      return;
    }
    if (!creator || !messageBody.trim()) return;
    setSendingMsg(true);
    try {
      await apiRequest('/api/conversations', {
        method: 'POST',
        body: JSON.stringify({
          participant_id: creator.id,
          message: messageBody.trim(),
        }),
      });
      showToast(`Message sent to ${creator.name}!`, 'success');
      setMessageModalOpen(false);
      setMessageBody('');
      navigate('/messages');
    } catch (err: any) {
      showToast(err.message || 'Could not send message.', 'error');
    } finally {
      setSendingMsg(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
        <div className="glass-card rounded-3xl h-64 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="glass-card rounded-3xl h-96 animate-pulse lg:col-span-2" />
          <div className="glass-card rounded-3xl h-96 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!creator) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <h2 className="font-display font-bold text-2xl text-white">Creator Profile Not Found</h2>
        <Link to="/creators" className="btn-electric px-6 py-2.5 rounded-xl text-sm inline-block mt-4">
          Back to Creator Marketplace
        </Link>
      </div>
    );
  }

  const cp = creator.creator_profile;
  const isSaved = savedCreatorIds.includes(creator.id);
  const categoryLabel = cp.industry_category || cp.specialization;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* ================= HERO PROFILE HEADER ================= */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/15 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#7C4DFF]/20 blur-[100px]" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <SmartImage
              src={creator.avatar_url}
              alt={creator.name}
              category={categoryLabel}
              variant="avatar"
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl border-2 border-[#7C4DFF] shadow-glow-purple shrink-0"
            />
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white flex items-center gap-2">
                  {creator.name}
                  {creator.verified && (
                    <CheckCircle2 className="w-5 h-5 text-[#9D7BFF]" />
                  )}
                </h1>
                <span className="px-3 py-0.5 rounded-full text-xs font-semibold bg-[#7C4DFF]/25 text-[#9D7BFF] border border-[#7C4DFF]/40">
                  {categoryLabel}
                </span>
                <span
                  className={`px-3 py-0.5 rounded-full text-xs font-semibold capitalize border ${
                    cp.availability === 'available'
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                      : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  }`}
                >
                  ● {cp.availability}
                </span>
              </div>

              <p className="text-sm sm:text-base font-medium text-[#9D7BFF]">{cp.title}</p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-[#B9B3D0]">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#7C4DFF]" /> {creator.location}
                </span>
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-[#7C4DFF]" /> {creator.languages.join(', ')}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-[#FF7A1A]" /> Avg. Response: {cp.response_time}
                </span>
                <span className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-[#9D7BFF]" /> {cp.profile_views.toLocaleString()} profile views
                </span>
              </div>
            </div>
          </div>

          {/* Right Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => toggleFavorite(creator.id)}
              className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition flex items-center gap-2 ${
                isSaved
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                  : 'bg-[#0B081D]/80 text-white border-white/15 hover:border-[#7C4DFF]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-rose-400' : ''}`} />
              {isSaved ? 'Saved' : 'Save'}
            </button>

            <button
              onClick={() => {
                if (!user) {
                  showToast('Please sign in to message this creator.', 'info');
                  navigate('/auth?mode=login');
                  return;
                }
                setMessageModalOpen(true);
              }}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold bg-[#17132E] hover:bg-[#211C40] text-white border border-[#7C4DFF]/40 transition flex items-center gap-2"
            >
              <MessageSquare className="w-4 h-4 text-[#9D7BFF]" /> Contact Creator
            </button>

            <button
              onClick={openInviteModal}
              className="btn-primary-orange px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2"
            >
              <Send className="w-4 h-4" /> Hire / Invite to Campaign
            </button>
          </div>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-7 pt-6 border-t border-white/10">
          <div className="p-3.5 rounded-2xl bg-[#0B081D]/60 border border-white/5">
            <span className="text-[11px] text-[#B9B3D0] block">Verified Rating (Demo Data)</span>
            <div className="flex items-center gap-1.5 mt-1">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span className="font-display font-bold text-lg text-white">{cp.rating.toFixed(2)}</span>
              <span className="text-xs text-[#B9B3D0]">({cp.review_count} reviews)</span>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B081D]/60 border border-white/5">
            <span className="text-[11px] text-[#B9B3D0] block">Completed Campaigns</span>
            <span className="font-display font-bold text-lg text-white mt-1 block">
              {cp.completed_campaigns} Projects
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B081D]/60 border border-white/5">
            <span className="text-[11px] text-[#B9B3D0] block">Experience Level</span>
            <span className="font-display font-bold text-lg text-white mt-1 block capitalize">
              {cp.experience_level} ({cp.experience_years} yrs)
            </span>
          </div>
          <div className="p-3.5 rounded-2xl bg-[#0B081D]/60 border border-white/5">
            <span className="text-[11px] text-[#B9B3D0] block">Starting Project Price</span>
            <span className="font-display font-bold text-lg text-emerald-400 mt-1 block">
              {formatINR(cp.starting_price)}
            </span>
          </div>
        </div>
      </div>

      {/* ================= MAIN BODY GRID ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left 8 Cols: Bio, Portfolio Gallery, Reviews */}
        <div className="lg:col-span-8 space-y-8">
          {/* About & AI Stack */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5">
            <h2 className="font-display font-bold text-xl text-white">About & Creative Pipeline</h2>
            <p className="text-sm text-[#B9B3D0] leading-relaxed">{creator.bio}</p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9D7BFF] mb-2.5">
                  AI Tools & Models Mastered
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cp.ai_tools.map((tool) => (
                    <span
                      key={tool}
                      className="px-3 py-1 rounded-xl text-xs font-medium bg-[#7C4DFF]/20 text-white border border-[#7C4DFF]/40 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#FF7A1A]" /> {tool}
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-[#9D7BFF] mb-2.5">
                  Production Skills & Niches
                </h3>
                <div className="flex flex-wrap gap-1.5">
                  {cp.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 rounded-xl text-xs bg-[#0B081D]/80 text-[#B9B3D0] border border-white/10"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Gallery */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display font-bold text-2xl text-white">
                  AI Portfolio Showcase ({creator.portfolio.length})
                </h2>
                <p className="text-xs text-[#B9B3D0]">
                  Click any project to inspect deliverables, AI pipeline, and full-resolution preview.
                </p>
              </div>
            </div>

            {creator.portfolio.length === 0 ? (
              <div className="glass-card rounded-2xl p-8 text-center text-sm text-[#B9B3D0]">
                No portfolio items uploaded yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {creator.portfolio.map((proj) => (
                  <div
                    key={proj.id}
                    onClick={() => setSelectedProject(proj)}
                    className="glass-card glass-card-hover rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    <div className="relative h-52 overflow-hidden bg-[#0B081D]">
                      <SmartImage
                        src={proj.thumbnail_url}
                        alt={proj.title}
                        category={proj.category || categoryLabel}
                        variant="portfolio"
                        className="w-full h-full group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B081D] via-transparent to-transparent pointer-events-none" />
                      <span className="absolute top-3 left-3 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-[#0B081D]/80 text-[#9D7BFF] border border-white/15 backdrop-blur-md">
                        {proj.category}
                      </span>
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold bg-[#7C4DFF]/80 text-white">
                        {proj.media_type}
                      </span>
                    </div>
                    <div className="p-4 space-y-2">
                      <h3 className="font-display font-bold text-base text-white group-hover:text-[#9D7BFF] transition line-clamp-1">
                        {proj.title}
                      </h3>
                      <p className="text-xs text-[#B9B3D0] line-clamp-2">{proj.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {proj.ai_tools_used.slice(0, 3).map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded text-[10px] bg-[#0B081D] text-white/80 border border-white/10"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Client Reviews & Ratings */}
          <div className="glass-card rounded-3xl p-6 sm:p-7 border border-white/10 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display font-bold text-xl text-white">
                Verified Brand Reviews ({creator.reviews.length} • Demo Data)
              </h2>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold text-sm">
                <Star className="w-4 h-4 fill-amber-400" />
                {cp.rating.toFixed(2)} Avg
              </div>
            </div>

            {creator.reviews.length === 0 ? (
              <p className="text-xs text-[#B9B3D0]">No client reviews yet.</p>
            ) : (
              <div className="space-y-4">
                {creator.reviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="p-4 rounded-2xl bg-[#0B081D]/70 border border-white/10 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <SmartImage
                          src={rev.reviewer_avatar}
                          alt={rev.reviewer_name}
                          category={categoryLabel}
                          variant="avatar"
                          className="w-9 h-9 rounded-full"
                        />
                        <div>
                          <div className="text-xs font-bold text-white">{rev.reviewer_name}</div>
                          <div className="text-[11px] text-[#9D7BFF]">
                            {rev.reviewer_company} • {rev.campaign_title}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-white/90 leading-relaxed pt-1">
                      “{rev.feedback}”
                    </p>
                    <div className="text-[10px] text-[#B9B3D0]">
                      Reviewed on {new Date(rev.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 4 Cols: Service Packages & Social Links */}
        <div className="lg:col-span-4 space-y-6">
          <div className="glass-card rounded-3xl p-6 border border-[#7C4DFF]/30 space-y-5 sticky top-24">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#FF7A1A]" /> Service Packages
              </h3>
              <span className="text-xs text-[#9D7BFF]">Commercial Rights Included</span>
            </div>

            <div className="space-y-4">
              {cp.packages.map((pkg, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#0B081D]/80 border border-white/10 hover:border-[#7C4DFF]/50 transition space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-[#9D7BFF]">
                      {pkg.name}
                    </span>
                    <span className="font-display font-extrabold text-xl text-white">
                      {formatINR(pkg.price)}
                    </span>
                  </div>
                  <p className="text-xs text-[#B9B3D0]">{pkg.description}</p>
                  <div className="text-[11px] text-white/80 flex items-center gap-3 pt-1">
                    <span>⏱ {pkg.deliveryDays} Days Delivery</span>
                    <span>•</span>
                    <span>🔄 {pkg.revisions} Revisions</span>
                  </div>
                  <ul className="space-y-1 pt-2 border-t border-white/5">
                    {pkg.deliverables.map((d, i) => (
                      <li key={i} className="text-[11px] text-[#B9B3D0] flex items-center gap-1.5">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <button
              onClick={openInviteModal}
              className="btn-primary-orange w-full py-3 rounded-xl text-sm flex items-center justify-center gap-2"
            >
              <Briefcase className="w-4 h-4" /> Hire {creator.name.split(' ')[0]} for Campaign
            </button>

            {/* External Portfolio & Social Links */}
            <div className="pt-4 border-t border-white/10 space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#B9B3D0] block">
                Links & Verification
              </span>
              {creator.website && (
                <a
                  href={creator.website}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#9D7BFF] hover:underline flex items-center justify-between py-1"
                >
                  <span>Official Studio Website</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
              {Object.entries(creator.social_links || {}).map(([platform, handle]) =>
                handle ? (
                  <div key={platform} className="flex items-center justify-between text-xs py-1">
                    <span className="capitalize text-[#B9B3D0]">{platform}</span>
                    <span className="text-white font-medium">{handle}</span>
                  </div>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Lightbox Modal */}
      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />

      {/* Message Creator Modal */}
      {messageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card rounded-3xl max-w-md w-full p-6 border border-white/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                Message {creator.name}
              </h3>
              <button onClick={() => setMessageModalOpen(false)} className="text-[#B9B3D0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSendMessage} className="space-y-4">
              <textarea
                rows={4}
                value={messageBody}
                onChange={(e) => setMessageBody(e.target.value)}
                placeholder={`Hi ${creator.name}, we love your ${categoryLabel} work and want to discuss an upcoming campaign...`}
                className="input-dark w-full text-sm"
                required
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setMessageModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs text-[#B9B3D0]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={sendingMsg}
                  className="btn-electric px-5 py-2.5 rounded-xl text-xs"
                >
                  {sendingMsg ? 'Sending...' : 'Send Message'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invite to Campaign Modal */}
      {inviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card rounded-3xl max-w-lg w-full p-6 border border-white/20 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-bold text-lg text-white">
                Invite {creator.name} to a Campaign
              </h3>
              <button onClick={() => setInviteModalOpen(false)} className="text-[#B9B3D0] hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {brandCampaigns.length === 0 ? (
              <div className="space-y-3 py-4 text-center">
                <p className="text-sm text-[#B9B3D0]">
                  You don’t have any active campaigns yet. Create a campaign brief first!
                </p>
                <Link
                  to="/campaigns/new"
                  className="btn-primary-orange px-5 py-2.5 rounded-xl text-xs inline-block"
                >
                  Create Campaign Brief
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
                    Select Your Campaign
                  </label>
                  <select
                    value={selectedCampaignId}
                    onChange={(e) => setSelectedCampaignId(e.target.value)}
                    className="input-dark w-full text-sm"
                  >
                    {brandCampaigns.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.title} ({formatINR(c.budget_min)}–{formatINR(c.budget_max)})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
                    Personalized Invitation Note
                  </label>
                  <textarea
                    rows={3}
                    value={inviteNote}
                    onChange={(e) => setInviteNote(e.target.value)}
                    placeholder={`Hi ${creator.name}, your portfolio in ${categoryLabel} is a great fit for our brief!`}
                    className="input-dark w-full text-sm"
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setInviteModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs text-[#B9B3D0]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingInvite}
                    className="btn-primary-orange px-5 py-2.5 rounded-xl text-xs"
                  >
                    {sendingInvite ? 'Sending Invitation...' : 'Send Campaign Invite'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
