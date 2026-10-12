import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  UserCheck,
  Briefcase,
  ShieldCheck,
  KeyRound,
  ArrowRight,
} from 'lucide-react';
import { CREATOR_CATEGORIES } from '../types';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../lib/api';

export const AuthPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { login, signup, showToast } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup' | 'reset'>(
    (searchParams.get('mode') as any) || 'login'
  );
  const [role, setRole] = useState<'creator' | 'brand'>(
    searchParams.get('role') === 'brand' ? 'brand' : 'creator'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [specialization, setSpecialization] = useState<string>('AI Video Generation');
  const [location, setLocation] = useState('Los Angeles, USA');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const m = searchParams.get('mode');
    if (m === 'login' || m === 'signup' || m === 'reset') setMode(m);
    const r = searchParams.get('role');
    if (r === 'creator' || r === 'brand') setRole(r);
  }, [searchParams]);

  const redirectAfterAuth = (userRole: string) => {
    if (userRole === 'admin') navigate('/admin');
    else if (userRole === 'brand') navigate('/dashboard/brand');
    else navigate('/dashboard/creator');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (mode === 'login') {
        const u = await login(email, password);
        redirectAfterAuth(u.role);
      } else if (mode === 'signup') {
        const u = await signup({
          name,
          email,
          password,
          role,
          company_name: companyName,
          specialization,
          location,
        });
        redirectAfterAuth(u.role);
      } else {
        const res = await apiRequest<{ message: string }>('/api/auth/reset-password', {
          method: 'POST',
          body: JSON.stringify({ email, newPassword: password }),
        });
        showToast(res.message, 'success');
        setMode('login');
      }
    } catch (err: any) {
      showToast(err.message || 'Authentication error.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setSubmitting(true);
    try {
      const u = await login(demoEmail, 'Demo@123');
      redirectAfterAuth(u.role);
    } catch (err: any) {
      showToast(err.message || 'Demo login failed.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Cols: Auth Form */}
        <div className="lg:col-span-7 glass-card rounded-3xl p-6 sm:p-8 border border-white/15 space-y-6">
          {/* Mode Tabs */}
          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-[#0B081D] border border-white/10">
            <button
              type="button"
              onClick={() => setMode('login')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                mode === 'login' ? 'bg-[#7C4DFF] text-white' : 'text-[#B9B3D0] hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition ${
                mode === 'signup' ? 'bg-[#7C4DFF] text-white' : 'text-[#B9B3D0] hover:text-white'
              }`}
            >
              Create Account
            </button>
            <button
              type="button"
              onClick={() => setMode('reset')}
              className={`px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                mode === 'reset' ? 'bg-[#7C4DFF] text-white' : 'text-[#B9B3D0] hover:text-white'
              }`}
            >
              Reset Password
            </button>
          </div>

          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              {mode === 'login'
                ? 'Welcome Back to CreatorConnect AI'
                : mode === 'signup'
                ? 'Join the AI Creator Marketplace'
                : 'Reset Your Account Password'}
            </h1>
            <p className="text-xs sm:text-sm text-[#B9B3D0] mt-1">
              {mode === 'login'
                ? 'Sign in with your email and password or use a 1-click demo account on the right.'
                : mode === 'signup'
                ? 'Select your role below to unlock tailored creator portfolios or brand campaign tools.'
                : 'Enter your registered email and a new password to reset access immediately.'}
            </p>
          </div>

          {/* Role Selector for Signup */}
          {mode === 'signup' && (
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setRole('creator')}
                className={`p-4 rounded-2xl border text-left transition ${
                  role === 'creator'
                    ? 'bg-[#7C4DFF]/20 border-[#7C4DFF] text-white'
                    : 'bg-[#0B081D]/60 border-white/10 text-[#B9B3D0]'
                }`}
              >
                <Sparkles className="w-5 h-5 text-[#9D7BFF] mb-1.5" />
                <div className="font-bold text-sm text-white">AI Content Creator</div>
                <div className="text-[11px] text-[#B9B3D0]">
                  Showcase AI work & pitch on briefs
                </div>
              </button>

              <button
                type="button"
                onClick={() => setRole('brand')}
                className={`p-4 rounded-2xl border text-left transition ${
                  role === 'brand'
                    ? 'bg-[#FF7A1A]/20 border-[#FF7A1A] text-white'
                    : 'bg-[#0B081D]/60 border-white/10 text-[#B9B3D0]'
                }`}
              >
                <Briefcase className="w-5 h-5 text-[#FF7A1A] mb-1.5" />
                <div className="font-bold text-sm text-white">Brand or Agency</div>
                <div className="text-[11px] text-[#B9B3D0]">
                  Post briefs & hire AI talent
                </div>
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#B9B3D0] block mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., Nova Vance"
                    className="input-dark w-full text-sm"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#B9B3D0] block mb-1">
                    {role === 'brand' ? 'Company / Agency Name' : 'Studio Handle'}
                  </label>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder={role === 'brand' ? 'Acme Brand Labs' : 'Nova AI Studio'}
                    className="input-dark w-full text-sm"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && role === 'creator' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-[#B9B3D0] block mb-1">
                    Primary AI Specialization
                  </label>
                  <select
                    value={specialization}
                    onChange={(e) => setSpecialization(e.target.value)}
                    className="input-dark w-full text-sm"
                  >
                    {CREATOR_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#B9B3D0] block mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="input-dark w-full text-sm"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-[#B9B3D0] block mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                className="input-dark w-full text-sm"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#B9B3D0] block mb-1">
                {mode === 'reset' ? 'New Password (min 6 chars) *' : 'Password *'}
              </label>
              <input
                type="password"
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="input-dark w-full text-sm"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary-orange w-full py-3.5 rounded-2xl text-sm flex items-center justify-center gap-2"
            >
              {submitting
                ? 'Processing...'
                : mode === 'login'
                ? 'Sign In to Workspace'
                : mode === 'signup'
                ? `Create ${role === 'brand' ? 'Brand' : 'Creator'} Account`
                : 'Update Password'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right 5 Cols: 1-Click Demo Role Switcher */}
        <div className="lg:col-span-5 glass-card rounded-3xl p-6 sm:p-7 border border-[#7C4DFF]/40 space-y-5">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#FF7A1A] uppercase tracking-wider">
            <KeyRound className="w-4 h-4" /> Instant Evaluator Demo Access
          </div>
          <h2 className="font-display font-bold text-xl text-white">
            1-Click Demo Account Login
          </h2>
          <p className="text-xs text-[#B9B3D0] leading-relaxed">
            Test every role-protected workflow immediately with pre-seeded portfolios, campaigns, proposals, and messages (Password for all demo accounts: <code className="text-white">Demo@123</code>):
          </p>

          <div className="space-y-3">
            <button
              type="button"
              onClick={() => handleQuickDemoLogin('brand@lumina-skincare.com')}
              className="w-full p-4 rounded-2xl bg-[#0B081D]/80 hover:bg-[#7C4DFF]/20 border border-white/10 hover:border-[#7C4DFF] text-left transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <Briefcase className="w-5 h-5 text-[#FF7A1A] shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white">
                    Brand / Agency Demo (Sophia Chen)
                  </div>
                  <div className="text-[11px] text-[#B9B3D0]">
                    Lumina Botanicals • Create Briefs, Accept Proposals, Run AI Matcher
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9D7BFF] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('aria.vance@creatorconnect.ai')}
              className="w-full p-4 rounded-2xl bg-[#0B081D]/80 hover:bg-[#7C4DFF]/20 border border-white/10 hover:border-[#7C4DFF] text-left transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <UserCheck className="w-5 h-5 text-[#9D7BFF] shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white">
                    AI Creator Demo (Aria Vance)
                  </div>
                  <div className="text-[11px] text-[#B9B3D0]">
                    AI Film Director • Upload Portfolio, Submit Proposals, Toggle Availability
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9D7BFF] shrink-0" />
            </button>

            <button
              type="button"
              onClick={() => handleQuickDemoLogin('admin@creatorconnect.ai')}
              className="w-full p-4 rounded-2xl bg-[#0B081D]/80 hover:bg-[#7C4DFF]/20 border border-white/10 hover:border-[#7C4DFF] text-left transition flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-sm text-white">
                    Platform Admin Demo (Alex Rivera)
                  </div>
                  <div className="text-[11px] text-[#B9B3D0]">
                    Verify Creators, Moderate Reported Content, Inspect Activity
                  </div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#9D7BFF] shrink-0" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
