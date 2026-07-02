import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { extractErrorMessage } from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function AdminDashboard() {
  const [flags, setFlags] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showModal, setShowModal] = useState(false)
  const [editingFlag, setEditingFlag] = useState(null) // null = creating, object = editing
  const [formKey, setFormKey] = useState('')
  const [formEnabled, setFormEnabled] = useState(false)
  const [saving, setSaving] = useState(false)
  const [modalError, setModalError] = useState('')

  const { auth, logout } = useAuth()
  const navigate = useNavigate()

  async function loadFlags() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/flags')
      setFlags(data)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFlags()
  }, [])

  function handleLogout() {
    logout()
    navigate('/admin/login')
  }

  function openCreateModal() {
    setEditingFlag(null)
    setFormKey('')
    setFormEnabled(false)
    setModalError('')
    setShowModal(true)
  }

  function openEditModal(flag) {
    setEditingFlag(flag)
    setFormKey(flag.featureKey)
    setFormEnabled(flag.enabled)
    setModalError('')
    setShowModal(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setModalError('')
    setSaving(true)
    try {
      if (editingFlag) {
        await api.put(`/flags/${editingFlag.id}`, { featureKey: formKey.trim(), enabled: formEnabled })
      } else {
        await api.post('/flags', { featureKey: formKey.trim(), enabled: formEnabled })
      }
      setShowModal(false)
      loadFlags()
    } catch (err) {
      setModalError(extractErrorMessage(err))
    } finally {
      setSaving(false)
    }
  }

  async function handleToggle(flag) {
    // Optimistic update for a snappier feel; rolled back on failure.
    setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: !f.enabled } : f)))
    try {
      await api.put(`/flags/${flag.id}`, { enabled: !flag.enabled })
    } catch (err) {
      setFlags((prev) => prev.map((f) => (f.id === flag.id ? { ...f, enabled: flag.enabled } : f)))
      setError(extractErrorMessage(err))
    }
  }

  async function handleDelete(flag) {
    if (!window.confirm(`Delete feature flag "${flag.featureKey}"? This can't be undone.`)) return
    try {
      await api.delete(`/flags/${flag.id}`)
      loadFlags()
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  return (
    <div className="dash-shell" style={{ '--sidebar-bg': '#0f2418', '--accent-color': 'var(--admin-primary)' }}>
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">🏢 {auth?.organizationName || 'Organization'}</div>
        <button className="dash-nav-item active">🚩 Feature Flags</button>
        <div style={{ flex: 1 }} />
        <button className="dash-nav-item" onClick={handleLogout}>↩ Logout</button>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Feature Flags</h1>
            <p className="dash-subtitle">Manage feature flags for your organization</p>
          </div>
          <button
            className="btn"
            style={{ width: 'auto', padding: '10px 18px', background: 'var(--admin-primary)', color: '#fff' }}
            onClick={openCreateModal}
          >
            + Create Flag
          </button>
        </div>

        <div className="card">
          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <div className="empty-state">Loading feature flags…</div>
          ) : flags.length === 0 ? (
            <div className="empty-state">No feature flags yet. Create your first one above.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Feature Key</th>
                  <th>Status</th>
                  <th>Created At</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {flags.map((flag) => (
                  <tr key={flag.id}>
                    <td>{flag.id}</td>
                    <td><code style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{flag.featureKey}</code></td>
                    <td>
                      <button
                        className={`toggle ${flag.enabled ? 'on' : ''}`}
                        onClick={() => handleToggle(flag)}
                        aria-label={flag.enabled ? 'Disable flag' : 'Enable flag'}
                      />
                    </td>
                    <td>{new Date(flag.createdAt).toLocaleString()}</td>
                    <td>
                      <button className="icon-btn" onClick={() => openEditModal(flag)} title="Edit key">✎</button>
                      <button className="icon-btn" onClick={() => handleDelete(flag)} title="Delete">🗑</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="auth-title" style={{ textAlign: 'left' }}>
              {editingFlag ? 'Edit Feature Flag' : 'Create Feature Flag'}
            </h2>
            <p className="auth-subtitle" style={{ textAlign: 'left' }}>
              {editingFlag ? 'Update the key or status' : 'Add a new feature flag'}
            </p>

            {modalError && <div className="error-banner">{modalError}</div>}

            <form onSubmit={handleSave}>
              <div className="field">
                <label htmlFor="featureKey">Feature Key</label>
                <input
                  id="featureKey"
                  value={formKey}
                  onChange={(e) => setFormKey(e.target.value)}
                  placeholder="Enter feature key (e.g. dark_mode)"
                  required
                  autoFocus
                />
              </div>
              <div className="field" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <button
                  type="button"
                  className={`toggle ${formEnabled ? 'on' : ''}`}
                  onClick={() => setFormEnabled((v) => !v)}
                  aria-label="Toggle enabled"
                />
                <span style={{ fontSize: 14 }}>{formEnabled ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-block-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: 'var(--admin-primary)', color: '#fff' }}
                  disabled={saving}
                >
                  {saving ? 'Saving…' : editingFlag ? 'Save' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
