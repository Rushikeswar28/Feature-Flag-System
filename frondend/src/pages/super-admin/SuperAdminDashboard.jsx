import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api, { extractErrorMessage } from '../../api/axios.js'
import { useAuth } from '../../context/AuthContext.jsx'

export default function SuperAdminDashboard() {
  const [orgs, setOrgs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [newOrgName, setNewOrgName] = useState('')
  const [creating, setCreating] = useState(false)
  const [modalError, setModalError] = useState('')

  const { logout } = useAuth()
  const navigate = useNavigate()

  async function loadOrgs() {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/organizations')
      setOrgs(data)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOrgs()
  }, [])

  function handleLogout() {
    logout()
    navigate('/super-admin/login')
  }

  async function handleCreate(e) {
    e.preventDefault()
    setModalError('')
    setCreating(true)
    try {
      await api.post('/organizations', { name: newOrgName.trim() })
      setNewOrgName('')
      setShowModal(false)
      loadOrgs()
    } catch (err) {
      setModalError(extractErrorMessage(err))
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="dash-shell" style={{ '--sidebar-bg': 'var(--super-bg)', '--accent-color': 'var(--super-primary)' }}>
      <aside className="dash-sidebar">
        <div className="dash-sidebar-brand">🛡️ Super Admin</div>
        <button className="dash-nav-item active">🏢 Organizations</button>
        <div style={{ flex: 1 }} />
        <button className="dash-nav-item" onClick={handleLogout}>↩ Logout</button>
      </aside>

      <main className="dash-main">
        <div className="dash-header">
          <div>
            <h1 className="dash-title">Organizations</h1>
            <p className="dash-subtitle">Manage all organizations in the system</p>
          </div>
          <button
            className="btn"
            style={{ width: 'auto', padding: '10px 18px', background: 'var(--super-primary)', color: '#fff' }}
            onClick={() => setShowModal(true)}
          >
            + Create Organization
          </button>
        </div>

        <div className="card">
          {error && <div className="error-banner">{error}</div>}

          {loading ? (
            <div className="empty-state">Loading organizations…</div>
          ) : orgs.length === 0 ? (
            <div className="empty-state">No organizations yet. Create the first one above.</div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Organization Name</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                {orgs.map((org) => (
                  <tr key={org.id}>
                    <td>{org.id}</td>
                    <td>{org.name}</td>
                    <td>{new Date(org.createdAt).toLocaleString()}</td>
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
            <h2 className="auth-title" style={{ textAlign: 'left' }}>Create Organization</h2>
            <p className="auth-subtitle" style={{ textAlign: 'left' }}>Add a new organization</p>

            {modalError && <div className="error-banner">{modalError}</div>}

            <form onSubmit={handleCreate}>
              <div className="field">
                <label htmlFor="orgName">Organization Name</label>
                <input
                  id="orgName"
                  type="text"
                  value={newOrgName}
                  onChange={(e) => setNewOrgName(e.target.value)}
                  placeholder="Enter organization name"
                  required
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-block-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn"
                  style={{ background: 'var(--super-primary)', color: '#fff' }}
                  disabled={creating}
                >
                  {creating ? 'Creating…' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
