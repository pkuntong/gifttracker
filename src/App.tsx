import React from 'react'
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import { Toaster } from './components/ui/toaster'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import People from './pages/People'
import Gifts from './pages/Gifts'
import Occasions from './pages/Occasions'
import Budgets from './pages/Budgets'
import Families from './pages/Families'
import Analytics from './pages/Analytics'
import Search from './pages/Search'
import GiftRecommendations from './pages/GiftRecommendations'
import Notifications from './pages/Notifications'
import Login from './pages/Login'
import Register from './pages/Register'
import Settings from './pages/Settings'
import DataImportExport from './pages/DataImportExport'
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
            
            {/* Protected routes */}
            <Route path="/" element={<LayoutWrapper />}>
              <Route index element={<Dashboard />} />
              <Route path="people" element={<People />} />
              <Route path="gifts" element={<Gifts />} />
              <Route path="occasions" element={<Occasions />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="families" element={<Families />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="search" element={<Search />} />
              <Route path="recommendations" element={<GiftRecommendations />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="settings" element={<Settings />} />
              <Route path="data" element={<DataImportExport />} />
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
