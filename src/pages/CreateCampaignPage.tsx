import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Wand2,
  Sparkles,
  Plus,
  Trash2,
  Save,
  Send,
  CheckCircle2,
  Cpu,
} from 'lucide-react';
import {
  AI_TOOLS_LIST,
  Campaign,
  CREATOR_CATEGORIES,
  ExperienceLevel,
  GeneratedBrief,
} from '../types';
import { apiRequest } from '../lib/api';
import { useAuth } from '../context/AuthContext';

export const CreateCampaignPage: React.FC = () => {
  const { user, showToast } = useAuth();
  const navigate = useNavigate();

  // AI Brief Assistant State
  const [aiPrompt, setAiPrompt] = useState(
    'I need an AI video advertisement for my new luxury botanical skincare serum with macro product shots.'
  );
  const [generatingAi, setGeneratingAi] = useState(false);
  const [aiEngineUsed, setAiEngineUsed] = useState<string | null>(null);

  // Structured Brief Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('AI Video Generation');
  const [contentType, setContentType] = useState('30s 4K Commercial + Social Cutdowns');
  const [goals, setGoals] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [deliverables, setDeliverables] = useState<string[]>([
    '1x 30s 4K Master AI Video Spot (16:9 & 9:16)',
    '3x 15s Social Ad Hook Variations',
    '10x High-Res Product Key Visuals',
  ]);
  const [newDeliverable, setNewDeliverable] = useState('');
  const [budgetMin, setBudgetMin] = useState<number>(800);
  const [budgetMax, setBudgetMax] = useState<number>(1600);
  const [deadline, setDeadline] = useState<string>(
    new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0]
  );
  const [requiredSkills, setRequiredSkills] = useState<string[]>([
    'Cinematic AI Video',
    'Product Commercials',
    'Custom LoRA Training',
  ]);
  const [skillInput, setSkillInput] = useState('');
  const [requiredTools, setRequiredTools] = useState<string[]>([
    'Runway Gen-3 Alpha',
    'Flux.1 Pro',
    'ComfyUI',
  ]);
  const [experienceLevel, setExperienceLevel] = useState<'any' | ExperienceLevel>('senior');
  const [referenceUrl, setReferenceUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGenerateBrief = async () => {
    if (!aiPrompt.trim()) {
      showToast('Please enter a short description of your campaign idea first.', 'info');
      return;
    }
    setGeneratingAi(true);
    try {
      const res = await apiRequest<{ brief: GeneratedBrief }>('/api/ai/generate-brief', {
        method: 'POST',
        body: JSON.stringify({ prompt: aiPrompt, category }),
      });
      const b = res.brief;
      setTitle(b.title);
      setDescription(b.description);
      setCategory(b.category);
      setContentType(b.content_type);
      setGoals(b.goals);
      setTargetAudience(b.target_audience);
      setDeliverables(b.deliverables);
      setRequiredSkills(b.required_skills);
      setRequiredTools(b.required_ai_tools);
      setBudgetMin(b.budget_min);
      setBudgetMax(b.budget_max);
      setDeadline(b.deadline);
      setExperienceLevel(b.experience_level);
      setAiEngineUsed(
        b.engineMode === 'ai_api'
          ? 'Generated via Live Server-Side AI API'
          : 'Generated via Built-In Intelligent Brief Synthesis Engine (Fallback)'
      );
      showToast('Structured campaign brief generated! Review and customize any field below.', 'success');
    } catch (err: any) {
      showToast(err.message || 'Could not generate brief.', 'error');
    } finally {
      setGeneratingAi(false);
    }
  };

  const toggleTool = (tool: string) => {
    setRequiredTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  const handleSaveCampaign = async (status: 'draft' | 'open') => {
    if (!user) {
      showToast('Please sign in with a Brand/Agency account to publish or save a campaign.', 'info');
      navigate('/auth?mode=login');
      return;
    }
    if (user.role !== 'brand' && user.role !== 'admin') {
      showToast('Only Brand or Agency accounts can publish campaign briefs.', 'error');
      return;
    }
    if (!title.trim() || !description.trim()) {
      showToast('Please provide a campaign title and description (or click Generate with AI Assistant).', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const res = await apiRequest<{ campaign: Campaign }>('/api/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description,
          category,
          content_type: contentType,
          goals,
          target_audience: targetAudience,
          deliverables,
          budget_min: budgetMin,
          budget_max: budgetMax,
          deadline,
          required_skills: requiredSkills,
          required_ai_tools: requiredTools,
          experience_level: experienceLevel,
          reference_urls: referenceUrl.trim() ? [referenceUrl.trim()] : [],
          status,
        }),
      });
      showToast(
        status === 'open'
          ? 'Campaign brief published! Redirecting to AI Creator Matching...'
          : 'Campaign draft saved to your Brand Dashboard.',
        'success'
      );
      navigate(`/campaigns/${res.campaign.id}`);
    } catch (err: any) {
      showToast(err.message || 'Failed to save campaign.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#FF7A1A] mb-1">
          <Sparkles className="w-3.5 h-3.5" /> Campaign Brief Studio
        </div>
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
          Create an AI Campaign Brief
        </h1>
        <p className="text-sm text-[#B9B3D0] mt-1">
          Use the AI Campaign Brief Assistant to turn a rough idea into a structured brief, or fill in your exact specifications below.
        </p>
      </div>

      {/* ================= AI CAMPAIGN BRIEF ASSISTANT ================= */}
      <div className="rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#231B4B] via-[#17132E] to-[#0B081D] border border-[#7C4DFF]/50 shadow-glow-purple space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#FF7A1A]/20 border border-[#FF7A1A]/40 flex items-center justify-center text-[#FF7A1A]">
              <Wand2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-white">
                AI Campaign Brief Assistant
              </h2>
              <p className="text-xs text-[#B9B3D0]">
                Describe your product or campaign idea in plain English and let AI structure the deliverables, skills, budget, and timeline.
              </p>
            </div>
          </div>
          {aiEngineUsed && (
            <span className="px-3 py-1 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {aiEngineUsed}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <textarea
            rows={2}
            value={aiPrompt}
            onChange={(e) => setAiPrompt(e.target.value)}
            placeholder="e.g., I need an AI video advertisement for my new skincare product..."
            className="input-dark flex-1 text-sm"
          />
          <button
            type="button"
            onClick={handleGenerateBrief}
            disabled={generatingAi}
            className="btn-primary-orange px-6 py-3 rounded-2xl text-xs sm:text-sm shrink-0 flex items-center justify-center gap-2"
          >
            <Wand2 className="w-4 h-4" />
            {generatingAi ? 'Generating Brief...' : 'Generate Structured Brief'}
          </button>
        </div>

        {/* Sample Prompt Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#B9B3D0]">Try prompt:</span>
          {[
            'I need an AI video advertisement for my new skincare product',
            'Zero-studio 8K product photography for 4 cold brew coffee cans using custom LoRA',
            'Virtual AI influencer ambassador for our sustainable streetwear TikTok launch',
          ].map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setAiPrompt(sample)}
              className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#7C4DFF]/25 text-[#B9B3D0] hover:text-white border border-white/10 transition text-left"
            >
              “{sample.slice(0, 48)}...”
            </button>
          ))}
        </div>
      </div>

      {/* ================= STRUCTURED CAMPAIGN BRIEF FORM ================= */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-white/10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
          <div className="md:col-span-8">
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Campaign Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., HydraGlow Bio-Retinol Serum — 30s AI Video Commercial"
              className="input-dark w-full text-sm"
            />
          </div>

          <div className="md:col-span-4">
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Primary AI Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-dark w-full text-sm"
            >
              {CREATOR_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
            Campaign Objective & Description *
          </label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe the creative direction, visual mood, product details, and any brand guidelines..."
            className="input-dark w-full text-sm"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Campaign Goals & KPIs
            </label>
            <input
              type="text"
              value={goals}
              onChange={(e) => setGoals(e.target.value)}
              placeholder="e.g., Achieve 2.5x ROAS on TikTok/Reels & replace studio shoot"
              className="input-dark w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Target Audience
            </label>
            <input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Gen-Z and Millennial beauty shoppers aged 22–40"
              className="input-dark w-full text-sm"
            />
          </div>
        </div>

        {/* Deliverables List Builder */}
        <div>
          <label className="text-xs font-semibold text-[#B9B3D0] block mb-2">
            Required Deliverables
          </label>
          <div className="space-y-2 mb-3">
            {deliverables.map((del, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#0B081D]/80 border border-white/10 text-xs sm:text-sm text-white"
              >
                <span>{del}</span>
                <button
                  type="button"
                  onClick={() => setDeliverables((prev) => prev.filter((_, i) => i !== idx))}
                  className="text-[#B9B3D0] hover:text-rose-400"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              type="text"
              value={newDeliverable}
              onChange={(e) => setNewDeliverable(e.target.value)}
              placeholder="Add another deliverable (e.g., 5x 8K Product Stills)..."
              className="input-dark flex-1 text-xs sm:text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (newDeliverable.trim()) {
                  setDeliverables((prev) => [...prev, newDeliverable.trim()]);
                  setNewDeliverable('');
                }
              }}
              className="px-4 py-2 rounded-xl bg-[#17132E] hover:bg-[#211C40] text-xs font-semibold text-white border border-white/15 flex items-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
        </div>

        {/* Budget, Deadline & Experience */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Min Budget (USD)
            </label>
            <input
              type="number"
              min={50}
              value={budgetMin}
              onChange={(e) => setBudgetMin(Number(e.target.value))}
              className="input-dark w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Max Budget (USD)
            </label>
            <input
              type="number"
              min={budgetMin}
              value={budgetMax}
              onChange={(e) => setBudgetMax(Number(e.target.value))}
              className="input-dark w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Target Deadline
            </label>
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="input-dark w-full text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Creator Experience
            </label>
            <select
              value={experienceLevel}
              onChange={(e) => setExperienceLevel(e.target.value as any)}
              className="input-dark w-full text-sm"
            >
              <option value="any">Any Experience</option>
              <option value="intermediate">Intermediate</option>
              <option value="senior">Senior (3+ yrs)</option>
              <option value="expert">Expert (5+ yrs)</option>
            </select>
          </div>
        </div>

        {/* AI Tools Multi-Select */}
        <div>
          <label className="text-xs font-semibold text-[#B9B3D0] flex items-center gap-1.5 mb-2">
            <Cpu className="w-3.5 h-3.5 text-[#9D7BFF]" /> Preferred AI Tools & Models
          </label>
          <div className="flex flex-wrap gap-2">
            {AI_TOOLS_LIST.map((tool) => {
              const active = requiredTools.includes(tool);
              return (
                <button
                  key={tool}
                  type="button"
                  onClick={() => toggleTool(tool)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition ${
                    active
                      ? 'bg-[#7C4DFF] text-white border-[#9D7BFF]'
                      : 'bg-[#0B081D]/60 text-[#B9B3D0] border-white/10 hover:text-white'
                  }`}
                >
                  {tool}
                </button>
              );
            })}
          </div>
        </div>

        {/* Skills Input */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Required Production Skills
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {requiredSkills.map((sk) => (
                <span
                  key={sk}
                  onClick={() => setRequiredSkills((prev) => prev.filter((s) => s !== sk))}
                  className="px-2.5 py-1 rounded-lg text-xs bg-[#0B081D] text-white border border-white/15 cursor-pointer hover:border-rose-400"
                  title="Click to remove"
                >
                  {sk} ×
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                placeholder="Add skill (e.g. Color Grading)..."
                className="input-dark flex-1 text-xs"
              />
              <button
                type="button"
                onClick={() => {
                  if (skillInput.trim()) {
                    setRequiredSkills((prev) => [...prev, skillInput.trim()]);
                    setSkillInput('');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-white/10 text-xs text-white"
              >
                Add
              </button>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-[#B9B3D0] block mb-1.5">
              Reference Image / Moodboard URL (Optional)
            </label>
            <input
              type="url"
              value={referenceUrl}
              onChange={(e) => setReferenceUrl(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="input-dark w-full text-sm"
            />
          </div>
        </div>

        {/* Submit Actions: Save Draft or Publish */}
        <div className="pt-6 border-t border-white/10 flex flex-wrap items-center justify-end gap-4">
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSaveCampaign('draft')}
            className="px-6 py-3 rounded-2xl text-sm font-semibold bg-[#17132E] hover:bg-[#211C40] text-white border border-white/15 transition flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-[#9D7BFF]" /> Save as Draft
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => handleSaveCampaign('open')}
            className="btn-primary-orange px-7 py-3 rounded-2xl text-sm flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Publish Campaign & Match Creators
          </button>
        </div>
      </div>
    </div>
  );
};
