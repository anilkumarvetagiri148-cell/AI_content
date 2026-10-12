import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2, Eye, Heart, Flag, Layers, Cpu } from 'lucide-react';
import { PortfolioProject } from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SmartImage } from './SmartImage';

interface ProjectModalProps {
  project: PortfolioProject | null;
  onClose: () => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose }) => {
  const { user, showToast } = useAuth();
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [activeImageUrl, setActiveImageUrl] = useState<string>('');

  useEffect(() => {
    if (project) {
      setActiveImageUrl(project.thumbnail_url || project.media_urls?.[0] || '');
    }
  }, [project]);

  if (!project) return null;

  const galleryUrls = Array.from(
    new Set([project.thumbnail_url, ...(project.media_urls || [])].filter(Boolean))
  );

  const handleReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast('Please sign in to submit a moderation report.', 'info');
      return;
    }
    if (!reportReason.trim()) return;
    try {
      await apiRequest('/api/reports', {
        method: 'POST',
        body: JSON.stringify({
          item_type: 'portfolio',
          item_id: project.id,
          item_title: project.title,
          reason: reportReason,
        }),
      });
      showToast('Content report submitted to platform moderators.', 'success');
      setReporting(false);
      setReportReason('');
    } catch (err: any) {
      showToast(err.message || 'Failed to submit report', 'error');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="glass-card rounded-3xl max-w-4xl w-full overflow-hidden border border-white/20 shadow-2xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-[#0B081D]/80">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#7C4DFF]/20 text-[#9D7BFF] border border-[#7C4DFF]/40">
              {project.category}
            </span>
            <span className="text-xs text-[#B9B3D0] uppercase tracking-wider">
              {project.media_type} Project
            </span>
          </div>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-[#B9B3D0] hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12">
          {/* Media Preview */}
          <div className="lg:col-span-7 bg-[#060411] flex flex-col justify-center p-4">
            <div className="w-full h-[320px] sm:h-[380px] rounded-2xl overflow-hidden border border-white/10">
              <SmartImage
                src={activeImageUrl || project.thumbnail_url}
                alt={project.title}
                category={project.category}
                variant="portfolio"
                className="w-full h-full"
              />
            </div>

            {galleryUrls.length > 1 && (
              <div className="flex gap-2.5 mt-3 overflow-x-auto pb-1">
                {galleryUrls.map((url, idx) => {
                  const isActive = (activeImageUrl || project.thumbnail_url) === url;
                  return (
                    <button
                      type="button"
                      key={idx}
                      onClick={() => setActiveImageUrl(url)}
                      className={`w-24 h-16 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                        isActive
                          ? 'border-[#7C4DFF] shadow-glow-purple scale-[1.02]'
                          : 'border-white/15 opacity-75 hover:opacity-100'
                      }`}
                    >
                      <SmartImage
                        src={url}
                        alt={`${project.title} frame ${idx + 1}`}
                        category={project.category}
                        variant="portfolio"
                        className="w-full h-full"
                      />
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Project Metadata */}
          <div className="lg:col-span-5 p-6 flex flex-col justify-between space-y-5 bg-[#17132E]/70">
            <div className="space-y-4">
              <h3 className="font-display font-bold text-xl text-white leading-snug">
                {project.title}
              </h3>
              <p className="text-sm text-[#B9B3D0] leading-relaxed">{project.description}</p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-[#0B081D]/70 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-[#B9B3D0] block">
                    Creator Role
                  </span>
                  <span className="text-xs font-semibold text-white mt-0.5 block">
                    {project.role}
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-[#0B081D]/70 border border-white/10">
                  <span className="text-[10px] uppercase tracking-wider text-[#B9B3D0] block">
                    Client / Brief
                  </span>
                  <span className="text-xs font-semibold text-white mt-0.5 block">
                    {project.client_name || 'Commercial Showcase'}
                  </span>
                </div>
              </div>

              {/* Deliverables */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#B9B3D0] flex items-center gap-1.5 mb-2">
                  <Layers className="w-3.5 h-3.5 text-[#FF7A1A]" /> Project Deliverables
                </h4>
                <ul className="space-y-1.5">
                  {project.deliverables.map((del, i) => (
                    <li key={i} className="text-xs text-white/90 flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      {del}
                    </li>
                  ))}
                </ul>
              </div>

              {/* AI Tools Used */}
              <div>
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#B9B3D0] flex items-center gap-1.5 mb-2">
                  <Cpu className="w-3.5 h-3.5 text-[#9D7BFF]" /> AI Pipeline & Tools Used
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {project.ai_tools_used.map((tool) => (
                    <span
                      key={tool}
                      className="px-2.5 py-1 rounded-lg text-xs font-medium bg-[#7C4DFF]/20 text-white border border-[#7C4DFF]/40 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3 text-[#9D7BFF]" /> {tool}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer Metrics & Report */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#B9B3D0]">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-[#9D7BFF]" /> {project.views.toLocaleString()} views
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4 text-rose-400" /> {project.likes.toLocaleString()} likes
                  </span>
                </div>
                <button
                  onClick={() => setReporting(!reporting)}
                  className="text-xs text-[#B9B3D0] hover:text-rose-400 flex items-center gap-1 transition"
                >
                  <Flag className="w-3.5 h-3.5" /> Report
                </button>
              </div>

              {reporting && (
                <form onSubmit={handleReport} className="space-y-2 pt-2">
                  <input
                    type="text"
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value)}
                    placeholder="Reason for reporting this portfolio item..."
                    className="input-dark w-full text-xs"
                    required
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReporting(false)}
                      className="px-3 py-1 rounded-lg text-xs text-[#B9B3D0]"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 rounded-lg text-xs bg-rose-500/20 text-rose-300 border border-rose-500/40"
                    >
                      Submit Report
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
