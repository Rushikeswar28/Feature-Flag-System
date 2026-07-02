import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { extractErrorMessage } from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function CheckFeature() {
  const [featureKey, setFeatureKey] = useState('')
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/user/login')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await api.post('/user/check-feature', { featureKey: featureKey.trim() })
      setResult(data)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  function checkAnother() {
    setResult(null)
    setFeatureKey('')
    setError('')
  }

  return (
    <div className="auth-shell" style={{ '--focus-color': 'var(--user-primary)', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: '100%', maxWidth: 420, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
          {auth?.organizationName} · {auth?.name}
        </span>
        <button className="link-btn" style={{ color: 'var(--user-primary)' }} onClick={handleLogout}>
          Logout
        </button>
      </div>

      {!result ? (
        <div className="auth-card" style={{ maxWidth: 420 }}>
          <h1 className="auth-title" style={{ textAlign: 'left', fontSize: 18 }}>Check Feature</h1>
          <p className="auth-subtitle" style={{ textAlign: 'left' }}>
            Check if a feature is enabled for your organization
          </p>

          {error && <div className="error-banner">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="field">
              <label htmlFor="featureKey">Feature Key</label>
              <input
                id="featureKey"
                value={featureKey}
                onChange={(e) => setFeatureKey(e.target.value)}
                placeholder="dark_mode"
                required
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="btn"
              style={{ background: 'var(--user-primary)', color: '#fff' }}
              disabled={loading}
            >
              {loading ? 'Checking…' : 'Check'}
            </button>
          </form>
        </div>
      ) : (
        <div className="auth-card" style={{ maxWidth: 420 }}>
          <h1 className="auth-title" style={{ textAlign: 'left', fontSize: 18 }}>Feature Status</h1>
          <p className="auth-subtitle" style={{ textAlign: 'left' }}>
            Result for feature: <code style={{ fontFamily: 'var(--font-mono)' }}>{result.featureKey}</code>
          </p>

          <div className={`result-card ${result.found && result.enabled ? 'result-enabled' : 'result-disabled'}`}>
            <div className="result-icon">{result.found && result.enabled ? '✓' : '✕'}</div>
            <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
              {!result.found ? 'Not found' : result.enabled ? 'Enabled' : 'Disabled'}
            </div>
            <div style={{ fontSize: 13 }}>
              {!result.found
                ? "No feature flag with this key exists for your organization."
                : result.enabled
                ? 'This feature is enabled for your organization.'
                : 'This feature is disabled for your organization.'}
            </div>
          </div>

          <button
            className="btn-block-secondary"
            style={{ marginTop: 16 }}
            onClick={checkAnother}
          >
            Check Another Feature
          </button>
        </div>
      )}
    </div>
  )
}
