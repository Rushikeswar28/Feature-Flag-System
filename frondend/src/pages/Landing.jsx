import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <div className="landing">
      <h1>Feature Flag Management System</h1>
      <p>Multi-tenant feature flags — pick where you're signing in from.</p>

      <div className="landing-grid">
        <Link to="/super-admin/login" className="landing-card">
          <div className="auth-icon" style={{ background: '#eef2ff', color: 'var(--super-primary)' }}>🛡️</div>
          <h3>Super Admin</h3>
          <p>Create and manage organizations</p>
        </Link>

        <Link to="/admin/login" className="landing-card">
          <div className="auth-icon" style={{ background: '#f0fdf4', color: 'var(--admin-primary)' }}>🏢</div>
          <h3>Organization Admin</h3>
          <p>Manage your org's feature flags</p>
        </Link>

        <Link to="/user/login" className="landing-card">
          <div className="auth-icon" style={{ background: '#eff6ff', color: 'var(--user-primary)' }}>👤</div>
          <h3>End User</h3>
          <p>Check if a feature is enabled</p>
        </Link>
      </div>
    </div>
  )
}
