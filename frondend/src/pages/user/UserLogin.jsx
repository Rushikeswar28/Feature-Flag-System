import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api, { extractErrorMessage } from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function UserLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/user/login', { email, password })
      login(data)
      navigate('/user/check')
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-shell" style={{ '--focus-color': 'var(--user-primary)' }}>
      <div className="auth-card">
        <div className="auth-icon" style={{ background: '#eff6ff', color: 'var(--user-primary)' }}>👤</div>
        <h1 className="auth-title">User Login</h1>
        <p className="auth-subtitle">Sign in to check feature availability</p>

        {error && <div className="error-banner">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
            />
          </div>
          <button
            type="submit"
            className="btn"
            style={{ background: 'var(--user-primary)', color: '#fff' }}
            disabled={loading}
          >
            {loading ? 'Signing in…' : 'Login'}
          </button>
        </form>

        <p className="auth-footer">
          Don't have an account? <Link to="/user/signup" style={{ color: 'var(--user-primary)' }}>Sign Up</Link>
        </p>
      </div>
    </div>
  )
}
