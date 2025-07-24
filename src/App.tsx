import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import Layout from './components/Layout'
import { ProtectedRoute } from './components/ProtectedRoute'
import Index from './pages/Index'
import Dashboard from './pages/Dashboard'
import People from './pages/People'
import Gifts from './pages/Gifts'
import GiftRecommendations from './pages/GiftRecommendations'
import GiftTracking from './pages/GiftTracking'
import Occasions from './pages/Occasions'
import Analytics from './pages/Analytics'
import AdvancedAnalytics from './pages/AdvancedAnalytics'
import Budgets from './pages/Budgets'
import Families from './pages/Families'
import Notifications from './pages/Notifications'
import Settings from './pages/Settings'
import Billing from './pages/Billing'
import DataImportExport from './pages/DataImportExport'
import Login from './pages/Login'
import Register from './pages/Register'
import Help from './pages/Help'
import Contact from './pages/Contact'
import NotFound from './pages/NotFound'
import './App.css'

// Layout wrapper component
const LayoutWrapper = () => (
  <Layout>
    <Outlet />
  </Layout>
)

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Public routes */}
                <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/help" element={<Help />} />
    <Route path="/contact" element={<Contact />} />
            
            {/* Public routes */}
            <Route path="/" element={<Index />} />
            
            {/* Protected routes */}
            <Route path="/app" element={
              <ProtectedRoute>
                <LayoutWrapper />
              </ProtectedRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="people" element={<People />} />
              <Route path="gifts" element={<Gifts />} />
              <Route path="occasions" element={<Occasions />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="families" element={<Families />} />
              <Route path="analytics" element={<Analytics />} />
              
              <Route path="recommendations" element={<GiftRecommendations />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="billing" element={<Billing />} />
              <Route path="data" element={<DataImportExport />} />
              <Route path="gift-ideas" element={<GiftRecommendations />} />
              <Route path="tracking" element={<Gifts />} />
              <Route path="social" element={<Families />} />
              <Route path="advanced-analytics" element={<Analytics />} />
            </Route>
            
            {/* 404 route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Toaster />
        </div>
      </Router>
    </AuthProvider>
  )
}

export default App
