import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AmbientBackground, BackgroundThemeProvider } from './components/AmbientBackground';
import { HomePage } from './pages/HomePage';
import { CreatorDiscoveryPage } from './pages/CreatorDiscoveryPage';
import { CreatorProfilePage } from './pages/CreatorProfilePage';
import { CampaignsPage } from './pages/CampaignsPage';
import { CampaignDetailPage } from './pages/CampaignDetailPage';
import { CreateCampaignPage } from './pages/CreateCampaignPage';
import { AIMatchingStudioPage } from './pages/AIMatchingStudioPage';
import { BrandDashboardPage } from './pages/BrandDashboardPage';
import { CreatorDashboardPage } from './pages/CreatorDashboardPage';
import { MessagesPage } from './pages/MessagesPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { AuthPage } from './pages/AuthPage';
import { UserRole } from './types';

const ScrollToTop: React.FC = () => {
  const { pathname, hash } = useLocation();
  useEffect(() => {
    if (hash) {
      const el = document.querySelector(hash);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);
  return null;
};

const ProtectedRoute: React.FC<{
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}> = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <div className="glass-card rounded-3xl h-64 animate-pulse" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth?mode=login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const redirect =
      user.role === 'admin'
        ? '/admin'
        : user.role === 'brand'
        ? '/dashboard/brand'
        : '/dashboard/creator';
    return <Navigate to={redirect} replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BackgroundThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <AmbientBackground />
          <div className="min-h-screen flex flex-col relative z-10 text-white">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/creators" element={<CreatorDiscoveryPage />} />
                <Route path="/discover" element={<CreatorDiscoveryPage />} />
                <Route path="/creators/:id" element={<CreatorProfilePage />} />
                <Route path="/campaigns" element={<CampaignsPage />} />
                <Route path="/campaigns/new" element={<CreateCampaignPage />} />
                <Route path="/campaigns/:id" element={<CampaignDetailPage />} />
                <Route path="/ai-studio" element={<AIMatchingStudioPage />} />
                <Route path="/auth" element={<AuthPage />} />

                {/* Role-Protected Routes */}
                <Route
                  path="/dashboard/brand"
                  element={
                    <ProtectedRoute allowedRoles={['brand', 'admin']}>
                      <BrandDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/dashboard/creator"
                  element={
                    <ProtectedRoute allowedRoles={['creator', 'admin']}>
                      <CreatorDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/messages"
                  element={
                    <ProtectedRoute>
                      <MessagesPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AuthProvider>
    </BackgroundThemeProvider>
  );
};
export default App;
