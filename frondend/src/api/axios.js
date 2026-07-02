import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
})

api.interceptors.request.use((config) => {
  const raw = localStorage.getItem('ffs_auth')
  if (raw) {
    const { token } = JSON.parse(raw)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})

/** Pulls a readable message out of our backend's { message: "..." } error shape. */
export function extractErrorMessage(err) {
  return err?.response?.data?.message || err?.message || 'Something went wrong. Please try again.'
}

export default api
