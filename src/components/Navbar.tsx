import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Bell,
  MessageSquare,
  Menu,
  X,
  LayoutDashboard,
  LogOut,
  ShieldCheck,
  Wand2,
  PlusCircle,
  Palette,
  Check,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { BACKGROUND_THEMES, useBackgroundTheme } from './AmbientBackground';

export const Navbar: React.FC = () => {
  const { user, notifications, markAllNotificationsRead, logout } = useAuth();
  const { themeId, setThemeId, currentTheme } = useBackgroundTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [themeOpen, setThemeOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read_status).length;

  const dashboardPath =
    user?.role === 'admin'
      ? '/admin'
      : user?.role === 'brand'
      ? '/dashboard/brand'
      : '/dashboard/creator';

  const navLinks = [
    { label: 'Discover Creators', path: '/creators' },
    { label: 'Campaigns', path: '/campaigns' },
    { label: 'AI Matcher', path: '/ai-studio', badge: 'AI' },
    { label: 'How It Works', path: '/#how-it-works' },
  ];

  const isActive = (path: string) => {
    if (path.includes('#')) return false;
    const base = path.split('?')[0];
    if (base === '/creators' && (location.pathname === '/creators' || location.pathname === '/discover')) {
      return true;
    }
    return location.pathname === base;
  };

  return (
    <header className="sticky top-0 z-50 border-b border-white/15 bg-[#0F092C]/75 backdrop-blur-2xl shadow-lg">
      {/* Subtle Top Iridescent Accent Line */}
      <div className="h-[2px] w-full bg-gradient-to-r from-[#7C4DFF] via-[#06B6D4] to-[#FF7A1A]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C4DFF] via-[#06B6D4] to-[#FF7A1A] flex items-center justify-center shadow-glow-purple group-hover:scale-105 transition-transform">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-display font-extrabold text-lg sm:text-xl tracking-tight text-white">
              CreatorConnect{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#9D7BFF] to-[#22D3EE]">
                AI
              </span>
            </span>
            <span className="hidden xl:block text-[10px] uppercase tracking-widest text-[#B9B3D0]">
              AI Creator Marketplace
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                isActive(item.path)
                  ? 'bg-gradient-to-r from-[#7C4DFF]/30 to-[#06B6D4]/20 text-white border border-[#9D7BFF]/45 shadow-sm'
                  : 'text-[#B9B3D0] hover:text-white hover:bg-white/10'
              }`}
            >
              {item.badge && <Wand2 className="w-3.5 h-3.5 text-[#FF7A1A]" />}
              {item.label}
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#FF7A1A]/20 text-[#FF7A1A] border border-[#FF7A1A]/30">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Interactive Background Theme Switcher */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setThemeOpen(!themeOpen);
                setNotifOpen(false);
              }}
              className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white flex items-center gap-2 transition"
              title="Customize Background Theme"
            >
              <span
                className="w-3.5 h-3.5 rounded-full border border-white/40 shrink-0"
                style={{ background: currentTheme.previewGradient }}
              />
              <Palette className="w-3.5 h-3.5 text-[#9D7BFF]" />
              <span className="hidden lg:inline">Backdrop</span>
            </button>

            {themeOpen && (
              <div className="absolute right-0 mt-2 w-72 glass-card rounded-2xl shadow-2xl border border-white/20 p-3.5 z-50 space-y-2.5">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-[#FF7A1A]" /> Ambient Backdrop Theme
                  </span>
                  <button
                    type="button"
                    onClick={() => setThemeOpen(false)}
                    className="text-xs text-[#9D7BFF] hover:underline"
                  >
                    Done
                  </button>
                </div>
                <div className="space-y-1.5">
                  {BACKGROUND_THEMES.map((t) => {
                    const selected = t.id === themeId;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setThemeId(t.id)}
                        className={`w-full p-2.5 rounded-xl text-left flex items-center justify-between gap-2.5 border transition ${
                          selected
                            ? 'bg-[#7C4DFF]/25 border-[#9D7BFF] text-white'
                            : 'bg-[#0B081D]/60 hover:bg-white/10 border-white/10 text-[#B9B3D0]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-7 h-7 rounded-lg shrink-0 border border-white/25 shadow-md"
                            style={{ background: t.previewGradient }}
                          />
                          <div className="min-w-0">
                            <div className="text-xs font-bold text-white truncate">{t.name}</div>
                            <div className="text-[10px] text-[#B9B3D0] truncate">{t.tagline}</div>
                          </div>
                        </div>
                        {selected && <Check className="w-4 h-4 text-emerald-400 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {user ? (
            <>
              {user.role === 'brand' && (
                <Link
                  to="/campaigns/new"
                  className="px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#FF7A1A]/15 text-[#FF7A1A] border border-[#FF7A1A]/30 hover:bg-[#FF7A1A]/25 transition flex items-center gap-1.5"
                >
                  <PlusCircle className="w-4 h-4" />
                  Post Brief
                </Link>
              )}

              {/* Messages Link */}
              <Link
                to="/messages"
                className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#B9B3D0] hover:text-white hover:border-[#7C4DFF]/50 transition relative"
                title="Messages & Collaboration"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>

              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => {
                    setNotifOpen(!notifOpen);
                    setThemeOpen(false);
                    if (!notifOpen && unreadCount > 0) {
                      markAllNotificationsRead();
                    }
                  }}
                  className="p-2.5 rounded-xl bg-white/10 border border-white/15 text-[#B9B3D0] hover:text-white hover:border-[#7C4DFF]/50 transition relative"
                  title="Notifications"
                >
                  <Bell className="w-4 h-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FF7A1A] text-[10px] font-bold text-white flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-80 glass-card rounded-2xl shadow-2xl border border-white/15 p-3 z-50">
                    <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10">
                      <span className="text-xs font-semibold uppercase tracking-wider text-[#B9B3D0]">
                        Notifications
                      </span>
                      <button
                        onClick={() => setNotifOpen(false)}
                        className="text-xs text-[#9D7BFF] hover:underline"
                      >
                        Close
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-xs text-[#B9B3D0] py-6 text-center">No notifications yet.</p>
                    ) : (
                      <div className="max-h-72 overflow-y-auto space-y-2">
                        {notifications.slice(0, 6).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              setNotifOpen(false);
                              navigate(n.link || dashboardPath);
                            }}
                            className="p-2.5 rounded-xl bg-[#0B081D]/70 hover:bg-[#7C4DFF]/15 border border-white/5 cursor-pointer transition"
                          >
                            <div className="text-xs font-semibold text-white">{n.title}</div>
                            <div className="text-xs text-[#B9B3D0] mt-0.5 line-clamp-2">{n.message}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Dashboard Button */}
              <Link
                to={dashboardPath}
                className="flex items-center gap-2.5 pl-2.5 pr-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 border border-[#7C4DFF]/40 transition"
              >
                <img
                  src={user.avatar_url}
                  alt={user.name}
                  className="w-7 h-7 rounded-full object-cover border border-[#9D7BFF]"
                />
                <div className="text-left">
                  <div className="text-xs font-semibold text-white leading-none flex items-center gap-1">
                    {user.name.split(' ')[0]}
                    {user.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-[#FF7A1A]" />}
                  </div>
                  <div className="text-[10px] text-[#9D7BFF] capitalize">{user.role} Hub</div>
                </div>
                <LayoutDashboard className="w-3.5 h-3.5 text-[#B9B3D0] ml-1" />
              </Link>

              <button
                onClick={() => {
                  logout();
                  navigate('/');
                }}
                className="p-2.5 rounded-xl bg-white/5 hover:bg-rose-500/20 text-[#B9B3D0] hover:text-rose-300 border border-white/10 transition"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <>
              <Link
                to="/auth?mode=login"
                className="px-4 py-2.5 rounded-xl text-sm font-medium text-[#B9B3D0] hover:text-white hover:bg-white/10 transition"
              >
                Login
              </Link>
              <Link
                to="/auth?mode=signup"
                className="btn-primary-orange px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2.5 rounded-xl bg-white/10 border border-white/15 text-white"
          aria-label="Toggle Menu"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/10 bg-[#0E0728]/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-2">
          {navLinks.map((item) => (
            <Link
              key={item.label}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-2.5 rounded-xl text-sm font-medium text-[#B9B3D0] hover:text-white hover:bg-white/5"
            >
              {item.label}
            </Link>
          ))}

          {/* Mobile Theme Selector */}
          <div className="pt-2 pb-2 border-t border-white/10">
            <span className="px-4 text-[11px] font-semibold uppercase tracking-wider text-[#9D7BFF] block mb-2">
              Backdrop Color Theme
            </span>
            <div className="flex items-center gap-2 px-4 overflow-x-auto pb-1">
              {BACKGROUND_THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setThemeId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 flex items-center gap-1.5 border ${
                    themeId === t.id
                      ? 'bg-[#7C4DFF]/30 border-[#9D7BFF] text-white'
                      : 'bg-white/5 border-white/10 text-[#B9B3D0]'
                  }`}
                >
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ background: t.previewGradient }}
                  />
                  {t.name.split(' ')[0]}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex flex-col gap-2">
            {user ? (
              <>
                <Link
                  to={dashboardPath}
                  onClick={() => setMobileOpen(false)}
                  className="btn-electric px-4 py-2.5 rounded-xl text-sm text-center"
                >
                  Open {user.role.toUpperCase()} Dashboard
                </Link>
                <Link
                  to="/messages"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm text-center bg-[#17132E] text-white border border-white/10"
                >
                  Messages
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setMobileOpen(false);
                    navigate('/');
                  }}
                  className="px-4 py-2.5 rounded-xl text-sm text-rose-300 bg-rose-500/10 border border-rose-500/20"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/auth?mode=login"
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-sm text-center bg-[#17132E] text-white border border-white/10"
                >
                  Login
                </Link>
                <Link
                  to="/auth?mode=signup"
                  onClick={() => setMobileOpen(false)}
                  className="btn-primary-orange px-4 py-2.5 rounded-xl text-sm text-center"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
