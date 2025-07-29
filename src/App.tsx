import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import ErrorBoundary from './components/ErrorBoundary'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import LoadingSpinner from './components/LoadingSpinner'
import './App.css'

// Lazy load page components for better code splitting
const Index = React.lazy(() => import('./pages/Index'))
const Dashboard = React.lazy(() => import('./pages/Dashboard'))
const People = React.lazy(() => import('./pages/People'))
const Gifts = React.lazy(() => import('./pages/Gifts'))
const GiftRecommendations = React.lazy(() => import('./pages/GiftRecommendations'))
const GiftTracking = React.lazy(() => import('./pages/GiftTracking'))
const Occasions = React.lazy(() => import('./pages/Occasions'))
const Analytics = React.lazy(() => import('./pages/Analytics'))
const AdvancedAnalytics = React.lazy(() => import('./pages/AdvancedAnalytics'))
const Budgets = React.lazy(() => import('./pages/Budgets'))
const Families = React.lazy(() => import('./pages/Families'))
const Notifications = React.lazy(() => import('./pages/Notifications'))
const Settings = React.lazy(() => import('./pages/Settings'))
const Billing = React.lazy(() => import('./pages/Billing'))
const DataImportExport = React.lazy(() => import('./pages/DataImportExport'))
const Login = React.lazy(() => import('./pages/Login'))
const Register = React.lazy(() => import('./pages/Register'))
const Help = React.lazy(() => import('./pages/Help'))
const Contact = React.lazy(() => import('./pages/Contact'))
const NotFound = React.lazy(() => import('./pages/NotFound'))

// Additional lazy-loaded pages
const GiftIdeas = React.lazy(() => import('./pages/GiftIdeas'))
const Integrations = React.lazy(() => import('./pages/Integrations'))
const Reminders = React.lazy(() => import('./pages/Reminders'))
const Search = React.lazy(() => import('./pages/Search'))
const Social = React.lazy(() => import('./pages/Social'))
const Wishlists = React.lazy(() => import('./pages/Wishlists'))

// Layout wrapper component
const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
)

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Public routes */}
              <Route path="/login" element={<Suspense fallback={<LoadingSpinner />}><Login /></Suspense>} />
              <Route path="/register" element={<Suspense fallback={<LoadingSpinner />}><Register /></Suspense>} />
              <Route path="/help" element={<Suspense fallback={<LoadingSpinner />}><Help /></Suspense>} />
              <Route path="/contact" element={<Suspense fallback={<LoadingSpinner />}><Contact /></Suspense>} />
              
              {/* Public routes */}
              <Route path="/" element={<Suspense fallback={<LoadingSpinner />}><Index /></Suspense>} />
              
              {/* Protected routes */}
              <Route path="/app" element={
                <ProtectedRoute>
                  <LayoutWrapper />
                </ProtectedRoute>
              }>
                <Route index element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
                <Route path="dashboard" element={<Suspense fallback={<LoadingSpinner />}><Dashboard /></Suspense>} />
                <Route path="people" element={<Suspense fallback={<LoadingSpinner />}><People /></Suspense>} />
                <Route path="gifts" element={<Suspense fallback={<LoadingSpinner />}><Gifts /></Suspense>} />
                <Route path="occasions" element={<Suspense fallback={<LoadingSpinner />}><Occasions /></Suspense>} />
                <Route path="budgets" element={<Suspense fallback={<LoadingSpinner />}><Budgets /></Suspense>} />
                <Route path="families" element={<Suspense fallback={<LoadingSpinner />}><Families /></Suspense>} />
                <Route path="analytics" element={<Suspense fallback={<LoadingSpinner />}><Analytics /></Suspense>} />
                <Route path="advanced-analytics" element={<Suspense fallback={<LoadingSpinner />}><AdvancedAnalytics /></Suspense>} />
                
                <Route path="recommendations" element={<Suspense fallback={<LoadingSpinner />}><GiftRecommendations /></Suspense>} />
                <Route path="gift-ideas" element={<Suspense fallback={<LoadingSpinner />}><GiftIdeas /></Suspense>} />
                <Route path="tracking" element={<Suspense fallback={<LoadingSpinner />}><GiftTracking /></Suspense>} />
                <Route path="notifications" element={<Suspense fallback={<LoadingSpinner />}><Notifications /></Suspense>} />
                <Route path="reminders" element={<Suspense fallback={<LoadingSpinner />}><Reminders /></Suspense>} />
                <Route path="search" element={<Suspense fallback={<LoadingSpinner />}><Search /></Suspense>} />
                <Route path="social" element={<Suspense fallback={<LoadingSpinner />}><Social /></Suspense>} />
                <Route path="wishlists" element={<Suspense fallback={<LoadingSpinner />}><Wishlists /></Suspense>} />
                <Route path="integrations" element={<Suspense fallback={<LoadingSpinner />}><Integrations /></Suspense>} />
                <Route path="settings" element={<Suspense fallback={<LoadingSpinner />}><Settings /></Suspense>} />
                <Route path="billing" element={<Suspense fallback={<LoadingSpinner />}><Billing /></Suspense>} />
                <Route path="data" element={<Suspense fallback={<LoadingSpinner />}><DataImportExport /></Suspense>} />
              </Route>
              
              {/* 404 route */}
              <Route path="*" element={<Suspense fallback={<LoadingSpinner />}><NotFound /></Suspense>} />
            </Routes>
            <Toaster />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
