import { Routes, Route } from 'react-router-dom'
import ProtectedRoute from './components/ProtectedRoute.jsx'

import Landing from './pages/Landing.jsx'

import SuperAdminLogin from './pages/super-admin/SuperAdminLogin.jsx'
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard.jsx'

import AdminSignup from './pages/admin/AdminSignup.jsx'
import AdminLogin from './pages/admin/AdminLogin.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'

import UserSignup from './pages/user/UserSignup.jsx'
import UserLogin from './pages/user/UserLogin.jsx'
import CheckFeature from './pages/user/CheckFeature.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />

      {/* Super Admin */}
      <Route path="/super-admin/login" element={<SuperAdminLogin />} />
      <Route
        path="/super-admin/dashboard"
        element={
          <ProtectedRoute role="SUPER_ADMIN">
            <SuperAdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* Organization Admin */}
      <Route path="/admin/signup" element={<AdminSignup />} />
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute role="ORG_ADMIN">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      {/* End User */}
      <Route path="/user/signup" element={<UserSignup />} />
      <Route path="/user/login" element={<UserLogin />} />
      <Route
        path="/user/check"
        element={
          <ProtectedRoute role="END_USER">
            <CheckFeature />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<Landing />} />
    </Routes>
  )
}
