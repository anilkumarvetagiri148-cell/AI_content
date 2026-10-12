import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  ArrowRight,
  Wand2,
  CheckCircle2,
  Star,
  Zap,
  ShieldCheck,
  Layers,
  Rocket,
  ChevronDown,
  Play,
  Cpu,
} from 'lucide-react';
import { CREATOR_CATEGORIES, FullCreator, PortfolioProject } from '../types';
import { apiRequest } from '../lib/api';
import { CreatorCard } from '../components/CreatorCard';
import { ProjectModal } from '../components/ProjectModal';

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [featuredCreators, setFeaturedCreators] = useState<FullCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [selectedProject, setSelectedProject] = useState<PortfolioProject | null>(null);

  useEffect(() => {
    apiRequest<{ creators: FullCreator[] }>('/api/creators')
      .then((res) => {
        setFeaturedCreators(res.creators.slice(0, 6));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) params.set('search', searchQuery.trim());
    if (selectedCategory && selectedCategory !== 'All') params.set('category', selectedCategory);
    navigate(`/creators?${params.toString()}`);
  };

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Discover',
      subtitle: 'Explore Verified AI Portfolios',
      description:
        'Browse specialized AI creators across video generation, photorealistic product LoRAs, virtual influencers, and spatial audio.',
      icon: Search,
      color: 'from-[#7C4DFF] to-[#9D7BFF]',
    },
    {
      step: '02',
      title: 'Match',
      subtitle: 'Intelligent 0–100 Weighted Scoring',
      description:
        'Use our AI Brief Assistant and transparent multi-factor matching engine to rank creators by niche, AI tool stack, budget, and rating.',
      icon: Wand2,
      color: 'from-[#9D7BFF] to-[#FF7A1A]',
    },
    {
      step: '03',
      title: 'Collaborate',
      subtitle: 'Proposals, Invites & Messaging',
      description:
        'Review custom creator pitches, compare deliverables, invite top matches, and align on styleframes inside dedicated workspaces.',
      icon: Layers,
      color: 'from-[#FF7A1A] to-[#FF5500]',
    },
    {
      step: '04',
      title: 'Launch',
      subtitle: 'Ship High-ROAS Campaigns 10x Faster',
      description:
        'Approve 4K master deliverables, mark campaigns completed, and leave verified brand reviews to build long-term creative partnerships.',
      icon: Rocket,
      color: 'from-emerald-500 to-[#7C4DFF]',
    },
  ];

  const faqs = [
    {
      q: 'How does CreatorConnect AI solve creator discovery for brands and agencies?',
      a: 'Traditional freelance platforms bury AI specialists under generic design categories. CreatorConnect AI indexes every creator by their exact generative AI pipeline (Runway Gen-3, OpenAI Sora, Flux.1 Pro, Custom LoRA, ComfyUI, ElevenLabs), verified commercial deliverables, and starting package prices.',
    },
    {
      q: 'How are the 0–100% AI Creator Match scores calculated?',
      a: 'We never use fake or random match numbers. Our matching engine computes a transparent 100-point weighted score across 6 factors: Category & Niche Alignment (25 pts), Required Skills & AI Tools Overlap (25 pts), Portfolio Relevance (15 pts), Budget Compatibility (15 pts), Availability (10 pts), and Verified Rating & Experience (10 pts). Note: Match scores are intelligent recommendations, not guarantees.',
    },
    {
      q: 'What if I only have a rough idea for an AI campaign?',
      a: 'Our built-in AI Campaign Brief Assistant converts a single sentence—like "I need an AI video advertisement for my new skincare product"—into a complete structured brief with objectives, target audience, deliverables, required AI tools, budget range, and timeline.',
    },
    {
      q: 'Can AI creators maintain exact product label and character consistency?',
      a: 'Yes! Many verified creators on CreatorConnect AI specialize in custom Flux/SDXL LoRA training, ControlNet depth passes, and FaceID locks—preserving 100% of your packaging typography or virtual influencer identity across dozens of scenes.',
    },
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="pointer-events-none absolute top-0 left-1/5 w-[620px] h-[620px] rounded-full bg-[#7C4DFF]/30 blur-[150px] -z-10" />
      <div className="pointer-events-none absolute top-24 left-1/2 w-[500px] h-[500px] rounded-full bg-[#06B6D4]/22 blur-[140px] -z-10" />
      <div className="pointer-events-none absolute top-40 right-10 w-[480px] h-[480px] rounded-full bg-[#FF7A1A]/24 blur-[135px] -z-10" />

      {/* ================= HERO SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-20 lg:pt-16 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Headline & CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#130B35]/80 border border-[#9D7BFF]/45 text-xs font-semibold text-[#9D7BFF] shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#FF7A1A]" />
              <span>AI-Native Creative Marketplace • Problem Statement #2</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl leading-[1.1] tracking-tight text-white">
              Where AI Creativity Meets{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D7BFF] via-[#22D3EE] to-[#FF7A1A]">
                Brand Ambition.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-white/85 max-w-2xl leading-relaxed">
              Discover extraordinary AI creators, match with the right talent, and turn creative ideas into campaigns.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/creators"
                className="btn-primary-orange px-7 py-3.5 rounded-2xl text-sm sm:text-base inline-flex items-center gap-2"
              >
                Explore Creators <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/auth?mode=signup&role=creator"
                className="px-7 py-3.5 rounded-2xl text-sm sm:text-base font-semibold bg-[#17132E] hover:bg-[#211C40] text-white border border-[#7C4DFF]/40 transition inline-flex items-center gap-2"
              >
                Join as a Creator
              </Link>
              <Link
                to="/ai-studio"
                className="px-4 py-3.5 rounded-2xl text-xs sm:text-sm font-semibold text-[#9D7BFF] hover:text-white transition inline-flex items-center gap-1.5"
              >
                <Wand2 className="w-4 h-4 text-[#FF7A1A]" /> Try AI Matcher
              </Link>
            </div>

            {/* Interactive Search Bar */}
            <form
              onSubmit={handleHeroSearch}
              className="mt-6 p-2 rounded-2xl glass-card border border-white/15 shadow-2xl flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="flex items-center gap-2.5 flex-1 px-3 py-2">
                <Search className="w-4 h-4 text-[#9D7BFF] shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search creators, Runway Gen-3, LoRA, skincare commercials..."
                  className="bg-transparent text-sm text-white placeholder-[#B9B3D0]/60 focus:outline-none w-full"
                />
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                aria-label="Filter by AI Category"
                className="bg-[#0B081D] text-xs font-medium text-[#B9B3D0] border border-white/10 rounded-xl px-3 py-2.5 focus:outline-none focus:border-[#7C4DFF]"
              >
                <option value="All">All AI Categories</option>
                {CREATOR_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="btn-electric px-6 py-2.5 rounded-xl text-sm font-semibold shrink-0"
              >
                Search
              </button>
            </form>

            {/* Quick Category Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
              <span className="text-[#B9B3D0]">Popular:</span>
              {[
                'Finance & Investing',
                'Technology & AI',
                'Education & E-Learning',
                'E-commerce & Product Advertising',
                'Animation & Motion Graphics',
              ].map((cat) => (
                <Link
                  key={cat}
                  to={`/creators?category=${encodeURIComponent(cat)}`}
                  className="px-3 py-1 rounded-full bg-white/5 hover:bg-[#7C4DFF]/20 text-[#B9B3D0] hover:text-white border border-white/10 transition"
                >
                  {cat}
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Right Column: Hero Visual Artwork & Floating Creator Cards */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-[#9D7BFF]/30 shadow-glow-purple bg-[#17132E]">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1000&q=85"
                alt="AI Generated Luxury Campaign Visual"
                className="w-full h-[430px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0B081D] via-transparent to-black/30" />

              {/* Top Overlay Pill */}
              <div className="absolute top-4 left-4 right-4 flex items-center justify-between">
                <span className="px-3 py-1.5 rounded-full text-xs font-semibold bg-[#0B081D]/80 backdrop-blur-md text-white border border-white/15 flex items-center gap-1.5">
                  <Play className="w-3 h-3 fill-[#FF7A1A] text-[#FF7A1A]" />
                  Runway Gen-3 + Flux.1 LoRA Showcase
                </span>
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-[#7C4DFF] text-white">
                  96% Brand Match
                </span>
              </div>

              {/* Floating Creator Card #1 */}
              <div className="absolute bottom-4 left-4 right-4 glass-card rounded-2xl p-4 border border-white/20 shadow-2xl">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"
                      alt="Aria Vance"
                      className="w-11 h-11 rounded-xl object-cover border border-[#9D7BFF]"
                    />
                    <div>
                      <div className="text-sm font-bold text-white flex items-center gap-1">
                        Aria Vance <CheckCircle2 className="w-3.5 h-3.5 text-[#9D7BFF]" />
                      </div>
                      <div className="text-xs text-[#B9B3D0]">AI Commercial Film Director • 4.95★</div>
                    </div>
                  </div>
                  <Link
                    to="/creators/creator-1"
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#FF7A1A] text-white hover:bg-[#FF8F3D] transition"
                  >
                    View Work
                  </Link>
                </div>
              </div>
            </div>

            {/* Floating Mini Match Badge */}
            <div className="hidden sm:flex items-center gap-3 absolute -top-5 -left-6 glass-card px-4 py-3 rounded-2xl border border-[#7C4DFF]/40 shadow-xl">
              <div className="w-9 h-9 rounded-xl bg-[#7C4DFF]/20 flex items-center justify-center text-[#9D7BFF]">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs font-bold text-white">AI Brief Assistant</div>
                <div className="text-[11px] text-emerald-400">Prompt → Full Campaign in 5s</div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ================= PLATFORM STATISTICS (LABELED DEMO DATA) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
            <span className="text-xs uppercase tracking-widest text-[#9D7BFF] font-semibold">
              Platform Benchmark Metrics
            </span>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-[#B9B3D0] border border-white/10">
              Clearly Labeled Demo Benchmark Data
            </span>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { value: '2,400+', label: 'Verified AI Creators & Prompt Engineers', sub: 'Across 24 Industry Categories' },
              { value: '10x Faster', label: 'Average Campaign Turnaround vs. Traditional Shoots', sub: '4.2 Days Avg Delivery' },
              { value: '94.2%', label: 'Brand-to-Creator AI Matching Satisfaction', sub: '6-Factor Weighted Engine' },
              { value: '68% Lower', label: 'Production Cost on Product & Video Campaigns', sub: 'Sample Benchmark Metric' },
            ].map((stat, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-[#0B081D]/60 border border-white/5">
                <div className="font-display font-extrabold text-2xl sm:text-3xl text-white">{stat.value}</div>
                <div className="text-xs sm:text-sm font-medium text-white/90 mt-1">{stat.label}</div>
                <div className="text-[11px] text-[#9D7BFF] mt-1">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= FEATURED AI CREATORS SECTION ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF7A1A]">
              Curated AI Talent
            </span>
            <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-1">
              Featured AI Content Creators
            </h2>
            <p className="text-sm text-[#B9B3D0] mt-1">
              Hand-picked specialists in Runway Gen-3, OpenAI Sora, custom product LoRAs, and virtual influencers.
            </p>
          </div>
          <Link
            to="/creators"
            className="text-sm font-semibold text-[#9D7BFF] hover:text-white flex items-center gap-1.5 shrink-0"
          >
            View All Creators <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="glass-card rounded-2xl h-96 animate-pulse p-5" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredCreators.map((creator) => (
              <CreatorCard
                key={creator.id}
                creator={creator}
                onSelectProject={(proj) => setSelectedProject(proj)}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================= HOW IT WORKS SECTION ================= */}
      <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#9D7BFF]">
            Seamless End-to-End Workflow
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-2">
            How CreatorConnect AI Works
          </h2>
          <p className="text-sm text-[#B9B3D0] mt-2">
            From rough creative concept to delivered 4K AI campaign assets in four streamlined steps.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {howItWorksSteps.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="glass-card glass-card-hover rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center text-white shadow-lg`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="font-display font-extrabold text-3xl text-white/15">{item.step}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">{item.title}</h3>
                  <div className="text-xs font-semibold text-[#9D7BFF] mt-0.5 mb-2.5">{item.subtitle}</div>
                  <p className="text-xs text-[#B9B3D0] leading-relaxed">{item.description}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= BRAND TESTIMONIALS (LABELED SAMPLE CONTENT) ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
          <div>
            <span className="text-xs font-semibold uppercase tracking-widest text-[#FF7A1A]">
              Sample Client Stories
            </span>
            <h2 className="font-display font-bold text-3xl text-white mt-1">
              Trusted by Forward-Thinking Brands & Agencies
            </h2>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-white/5 text-[#B9B3D0] border border-white/10">
            Labeled Sample Testimonials for Demonstration
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              quote:
                'CreatorConnect AI matched us with a Runway Gen-3 & Flux LoRA specialist in under 3 minutes. Our HydraGlow serum video spot achieved 3.1x higher click-through than our studio shoot.',
              author: 'Sophia Chen',
              role: 'VP of Brand Marketing, Lumina Botanicals (Sample)',
              avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80',
              rating: 5,
            },
            {
              quote:
                'Instead of spending $35,000 on tabletop beverage photography, we hired Kael Tanaka through CreatorConnect AI to train custom SKU LoRAs and generate 40 8K product stills in 72 hours.',
              author: 'David Vance-Kerr',
              role: 'Executive Creative Director, Hyperion Agency (Sample)',
              avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80',
              rating: 5,
            },
            {
              quote:
                'The AI Brief Assistant turned our one-sentence TikTok campaign idea into a production-ready brief with deliverables and budget benchmarks that attracted 4 top-tier proposals the same day.',
              author: 'Elena Vance-Meyer',
              role: 'Growth Lead, Kinetix Streetwear (Sample)',
              avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80',
              rating: 5,
            },
          ].map((t, i) => (
            <div key={i} className="glass-card rounded-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-1 text-amber-400 mb-4">
                  {[...Array(t.rating)].map((_, idx) => (
                    <Star key={idx} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-white/90 leading-relaxed italic">“{t.quote}”</p>
              </div>
              <div className="flex items-center gap-3 mt-6 pt-4 border-t border-white/10">
                <img src={t.avatar} alt={t.author} className="w-10 h-10 rounded-full object-cover" />
                <div>
                  <div className="text-xs font-bold text-white">{t.author}</div>
                  <div className="text-[11px] text-[#B9B3D0]">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= PRICING & PLATFORM PLANS ================= */}
      <section id="pricing" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#9D7BFF]">
            Transparent Marketplace Tiers
          </span>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white mt-2">
            Platform Plans for Creators & Brands
          </h2>
          <p className="text-sm text-[#B9B3D0] mt-2">
            Start free during our MVP launch. Scale when your creative pipeline grows.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              name: 'AI Creator Studio',
              price: '$0',
              period: 'forever + 5% platform fee',
              desc: 'Everything independent AI artists and prompt directors need to get discovered.',
              features: [
                'Public AI Portfolio & Case Studies',
                '3 Custom Pricing Service Packages',
                'Unlimited Campaign Proposal Submissions',
                'Automatic Inclusion in AI Matching Engine',
                'Direct Brand Messaging & Verified Reviews',
              ],
              cta: 'Join as a Creator',
              link: '/auth?mode=signup&role=creator',
              highlighted: false,
            },
            {
              name: 'Brand & Growth Team',
              price: '$0',
              period: 'per month (Pay per campaign)',
              desc: 'Ideal for D2C brands and marketing teams commissioning AI video, product stills, and UGC.',
              features: [
                'Unlimited Campaign Brief Publications',
                'AI Campaign Brief Assistant Generator',
                '0–100 Weighted AI Creator Matching',
                'Direct Creator Invitations & Favorites List',
                'Full Commercial Rights & Review Management',
              ],
              cta: 'Start Hiring Creators',
              link: '/auth?mode=signup&role=brand',
              highlighted: true,
            },
            {
              name: 'Creative Agency Enterprise',
              price: '$299',
              period: 'per month (Demo Tier)',
              desc: 'Built for multi-brand agencies managing high-volume generative creative pipelines.',
              features: [
                'Multi-Brand Campaign Workspaces',
                'Custom LoRA & Model Weight Escrow',
                'Priority Verified Creator Shortlisting',
                'Dedicated AI Creative Strategist Support',
                'Custom Legal & IP Compliance Auditing',
              ],
              cta: 'Explore Agency Hub',
              link: '/auth?mode=signup&role=brand',
              highlighted: false,
            },
          ].map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-3xl p-7 flex flex-col justify-between border transition ${
                plan.highlighted
                  ? 'bg-gradient-to-b from-[#231B49] to-[#120D28] border-[#7C4DFF] shadow-glow-purple relative'
                  : 'glass-card border-white/10'
              }`}
            >
              {plan.highlighted && (
                <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[11px] font-bold bg-gradient-to-r from-[#FF7A1A] to-[#7C4DFF] text-white">
                  Most Popular for Brands
                </span>
              )}
              <div>
                <h3 className="font-display font-bold text-xl text-white">{plan.name}</h3>
                <div className="mt-4 flex items-baseline gap-2">
                  <span className="font-display font-extrabold text-4xl text-white">{plan.price}</span>
                  <span className="text-xs text-[#B9B3D0]">{plan.period}</span>
                </div>
                <p className="text-xs text-[#B9B3D0] mt-3 leading-relaxed">{plan.desc}</p>
                <ul className="mt-6 space-y-3">
                  {plan.features.map((f, i) => (
                    <li key={i} className="text-xs text-white/90 flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={plan.link}
                className={`mt-8 w-full py-3 rounded-xl text-sm font-semibold text-center block transition ${
                  plan.highlighted
                    ? 'btn-primary-orange'
                    : 'bg-white/10 hover:bg-white/15 text-white border border-white/10'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ================= FAQ SECTION ================= */}
      <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-10">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#FF7A1A]">
            Got Questions?
          </span>
          <h2 className="font-display font-bold text-3xl text-white mt-1">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="glass-card rounded-2xl border border-white/10 overflow-hidden">
                <button
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-white/5 transition"
                >
                  <span className="font-semibold text-sm sm:text-base text-white">{faq.q}</span>
                  <ChevronDown
                    className={`w-5 h-5 text-[#9D7BFF] shrink-0 transition-transform ${
                      isOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-xs sm:text-sm text-[#B9B3D0] leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ================= FINAL CTA BANNER ================= */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-[#1D153F] via-[#2B1B5E] to-[#17132E] border border-[#7C4DFF]/40 shadow-glow-purple flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF7A1A]">
              <Zap className="w-4 h-4" /> Ready to Launch Your Next AI Campaign?
            </div>
            <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-white">
              Match with Verified AI Creators in Under 60 Seconds.
            </h2>
            <p className="text-sm text-[#B9B3D0]">
              Generate a structured campaign brief with our AI Assistant or showcase your generative portfolio to global brands today.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 shrink-0">
            <Link to="/campaigns/new" className="btn-primary-orange px-6 py-3.5 rounded-2xl text-sm">
              Create Campaign Brief
            </Link>
            <Link
              to="/creators"
              className="px-6 py-3.5 rounded-2xl text-sm font-semibold bg-[#0B081D]/80 hover:bg-[#0B081D] text-white border border-white/15 transition"
            >
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} />
    </div>
  );
};
