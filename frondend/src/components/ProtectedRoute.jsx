import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const LOGIN_PATH_BY_ROLE = {
  SUPER_ADMIN: '/super-admin/login',
  ORG_ADMIN: '/admin/login',
  END_USER: '/user/login',
}

export default function ProtectedRoute({ role, children }) {
  const { auth } = useAuth()

  if (!auth || auth.role !== role) {
    return <Navigate to={LOGIN_PATH_BY_ROLE[role] || '/'} replace />
  }

  return children
}
