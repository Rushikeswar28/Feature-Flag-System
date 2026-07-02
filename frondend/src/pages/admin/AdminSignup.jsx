import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { extractErrorMessage } from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminSignup() {
  const [orgs, setOrgs] = useState([])
  const [form, setForm] = useState({ name: '', email: '', password: '', organizationId: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    api.get('/organizations/public')
      .then(({ data }) => setOrgs(data))
      .catch(() => setOrgs([]))
  }, [])

  function updateField(field, value) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/admin/signup', {
        ...form,
        organizationId: Number(form.organizationId),
      })
      login(data)
      navigate('/admin/dashboard')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell" style={{ '--focus-color': 'var(--admin-primary)' }}>
      <div className="auth-card">
        <div className="auth-icon" style={{ background: '#f0fdf4', color: 'var(--admin-primary)' }}>🏢</div>
        <h1 className="auth-title">Admin Signup</h1>
        <p className="auth-subtitle">Create an account to manage your organization's flags</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="name">Full Name</label>
            <input id="name" value={form.name} onChange={(e) => updateField('name', e.target.value)} placeholder="Enter your name" required />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => updateField('email', e.target.value)} placeholder="Enter your email" required />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" value={form.password} onChange={(e) => updateField('password', e.target.value)} placeholder="Enter your password" minLength={6} required />
          </div>
          <div className="field">
            <label htmlFor="organization">Organization</label>
            <select id="organization" value={form.organizationId} onChange={(e) => updateField('organizationId', e.target.value)} required>
              <option value="" disabled>Select organization</option>
              {orgs.map((org) => (
                <option key={org.id} value={org.id}>{org.name}</option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="btn"
            style={{ background: 'var(--admin-primary)', color: '#fff' }}
            disabled={loading || orgs.length === 0}
          >
            {loading ? 'Signing up…' : 'Sign Up'}
          </button>
        </form>

        {orgs.length === 0 && (
          <p className="auth-subtitle" style={{ marginTop: 12 }}>
            No organizations exist yet — ask your Super Admin to create one first.
          </p>
        )}

        <p className="auth-footer">
          Already have an account? <Link to="/admin/login" style={{ color: 'var(--admin-primary)' }}>Login</Link>
        </p>
      </div>
    </div>
  )
}
