import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import Layout from '@/components/Layout';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';
import OfflineIndicator from '@/components/OfflineIndicator';
import MobileGestureGuide from '@/components/MobileGestureGuide';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useMobile } from '@/hooks/use-mobile';

// Pages
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Index from '@/pages/Index';
import Dashboard from '@/pages/Dashboard';
import Gifts from '@/pages/Gifts';
import People from '@/pages/People';
import Occasions from '@/pages/Occasions';
import Budgets from '@/pages/Budgets';
import Settings from '@/pages/Settings';
import Families from '@/pages/Families';
import Notifications from '@/pages/Notifications';
import Analytics from '@/pages/Analytics';
import GiftIdeas from '@/pages/GiftIdeas';
import GiftRecommendations from '@/pages/GiftRecommendations';
import GiftTracking from '@/pages/GiftTracking';
import Social from '@/pages/Social';
import AdvancedAnalytics from '@/pages/AdvancedAnalytics';
import Search from '@/pages/Search';
import DataImportExport from '@/pages/DataImportExport';
import Wishlists from '@/pages/Wishlists';
import Reminders from '@/pages/Reminders';
import Integrations from '@/pages/Integrations';
import Billing from '@/pages/Billing';
import NotFound from '@/pages/NotFound';

// Create a client
const queryClient = new QueryClient();

const AppContent: React.FC = () => {
  const { i18n } = useTranslation();
  const { isMobile, isPWA } = useMobile();

  // Initialize document direction based on language
  useEffect(() => {
    const currentLanguage = i18n.language || 'en';
    if (currentLanguage === 'ar') {
      document.documentElement.dir = 'rtl';
      document.documentElement.lang = 'ar';
    } else {
      document.documentElement.dir = 'ltr';
      document.documentElement.lang = currentLanguage;
    }
  }, [i18n.language]);

  // Register service worker for PWA
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered: ', registration);
        })
        .catch((registrationError) => {
          console.log('SW registration failed: ', registrationError);
        });
    }
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ErrorBoundary>
        <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Index />} />
        
        {/* Protected Routes with Layout */}
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/gifts" element={
          <ProtectedRoute>
            <Layout>
              <Gifts />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/people" element={
          <ProtectedRoute>
            <Layout>
              <People />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/occasions" element={
          <ProtectedRoute>
            <Layout>
              <Occasions />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/budgets" element={
          <ProtectedRoute>
            <Layout>
              <Budgets />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/settings" element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/families" element={
          <ProtectedRoute>
            <Layout>
              <Families />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/analytics" element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/gift-ideas" element={
          <ProtectedRoute>
            <Layout>
              <GiftIdeas />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/recommendations" element={
          <ProtectedRoute>
            <Layout>
              <GiftRecommendations />
            </Layout>
          </ProtectedRoute>
        } />
                    <Route path="/tracking" element={
              <ProtectedRoute>
                <Layout>
                  <GiftTracking />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/social" element={
              <ProtectedRoute>
                <Layout>
                  <Social />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/advanced-analytics" element={
              <ProtectedRoute>
                <Layout>
                  <AdvancedAnalytics />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/search" element={
          <ProtectedRoute>
            <Layout>
              <Search />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/data" element={
          <ProtectedRoute>
            <Layout>
              <DataImportExport />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/wishlists" element={
          <ProtectedRoute>
            <Layout>
              <Wishlists />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/reminders" element={
          <ProtectedRoute>
            <Layout>
              <Reminders />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/integrations" element={
          <ProtectedRoute>
            <Layout>
              <Integrations />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/billing" element={
          <ProtectedRoute>
            <Layout>
              <Billing />
            </Layout>
          </ProtectedRoute>
        } />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
      
      {/* PWA Install Prompt */}
      {!isPWA && <PWAInstallPrompt />}
      
      {/* Offline Indicator */}
      <OfflineIndicator />
      
      {/* Mobile Gesture Guide */}
      <MobileGestureGuide />
        </ErrorBoundary>
      </Router>
  );
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
          

        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
