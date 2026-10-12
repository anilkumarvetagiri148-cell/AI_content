import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Globe, Mail, Shield, ArrowUpRight } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-white/15 bg-[#09051E]/75 backdrop-blur-2xl text-[#B9B3D0] mt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Col 1-2: Brand */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C4DFF] via-[#06B6D4] to-[#FF7A1A] flex items-center justify-center shadow-glow-purple">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-extrabold text-xl text-white">
                CreatorConnect <span className="text-[#9D7BFF]">AI</span>
              </span>
            </Link>
            <p className="text-sm text-[#B9B3D0] max-w-sm leading-relaxed">
              The AI-native marketplace connecting extraordinary AI visual, video, virtual influencer, and sonic creators with visionary brands and creative agencies.
            </p>
            <div className="flex items-center gap-3 pt-2 text-xs text-[#B9B3D0]">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#17132E] border border-white/10 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                AI Matching Engine Active
              </span>
              <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#17132E] border border-white/10">
                <Shield className="w-3.5 h-3.5 text-[#9D7BFF]" />
                RLS & Role Verified
              </span>
            </div>
          </div>

          {/* Col 3: Marketplace */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Marketplace
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/creators" className="hover:text-white transition">
                  Discover Creators (24 Categories)
                </Link>
              </li>
              <li>
                <Link to="/campaigns" className="hover:text-white transition">
                  Browse Campaign Briefs
                </Link>
              </li>
              <li>
                <Link to="/ai-studio" className="hover:text-white transition flex items-center gap-1">
                  AI Creator Matcher <ArrowUpRight className="w-3.5 h-3.5 text-[#FF7A1A]" />
                </Link>
              </li>
              <li>
                <Link to="/campaigns/new" className="hover:text-white transition">
                  AI Brief Assistant
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Specializations */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Top Creator Categories
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/creators?category=Finance+%26+Investing" className="hover:text-white transition">
                  Finance & Investing
                </Link>
              </li>
              <li>
                <Link to="/creators?category=Technology+%26+AI" className="hover:text-white transition">
                  Technology & AI
                </Link>
              </li>
              <li>
                <Link to="/creators?category=Education+%26+E-Learning" className="hover:text-white transition">
                  Education & E-Learning
                </Link>
              </li>
              <li>
                <Link to="/creators?category=E-commerce+%26+Product+Advertising" className="hover:text-white transition">
                  E-commerce & Advertising
                </Link>
              </li>
              <li>
                <Link to="/creators?category=Animation+%26+Motion+Graphics" className="hover:text-white transition">
                  Animation & Motion Graphics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 5: Account & Legal */}
          <div>
            <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">
              Platform & Access
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/auth?mode=signup&role=creator" className="hover:text-white transition">
                  Join as an AI Creator
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=signup&role=brand" className="hover:text-white transition">
                  Hire as a Brand / Agency
                </Link>
              </li>
              <li>
                <Link to="/auth?mode=login" className="hover:text-white transition">
                  Demo Role Switcher
                </Link>
              </li>
              <li>
                <a href="mailto:hello@creatorconnect.ai" className="hover:text-white transition flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#9D7BFF]" />
                  hello@creatorconnect.ai
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B9B3D0]">
          <p>© {new Date().getFullYear()} CreatorConnect AI. Built for Problem Statement No. 2 — AI Content Creator Marketplace.</p>
          <div className="flex items-center gap-6">
            <Link to="/#faq" className="hover:text-white transition">FAQ</Link>
            <Link to="/#pricing" className="hover:text-white transition">Pricing</Link>
            <span className="flex items-center gap-1 text-white/70">
              <Globe className="w-3.5 h-3.5 text-[#7C4DFF]" /> Global AI Talent Network
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
