import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

/**
 * ProtectedRoute — wraps protected routes.
 *
 * Used as a layout route in App.jsx:
 *   <Route element={<ProtectedRoute />}>
 *     <Route element={<AppLayout />}>
 *       <Route index element={<DashboardPage />} />
 *       ...
 *     </Route>
 *   </Route>
 *
 * Behaviour:
 *   loading=true       → full-screen spinner (prevents flash)
 *   user=null          → redirect to /login, preserving intended destination
 *   user=<User>        → renders <Outlet /> (AppLayout + nested pages)
 */
export function ProtectedRoute() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return <AuthLoadingScreen />
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <Outlet />
}

/**
 * Full-screen spinner shown while the initial session check runs.
 * Uses the Lumino gradient background to avoid visual jarring.
 */
function AuthLoadingScreen() {
  return (
    <div
      style={{
        minHeight: '100svh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, var(--bg-grad-a) 0%, var(--bg-grad-b) 33%, var(--bg-grad-c) 66%, var(--bg-grad-d) 100%)',
      }}
      aria-label="Loading"
      role="status"
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            border: '3px solid rgba(137,107,197,0.25)',
            borderTopColor: '#896BC5',
            animation: 'lumino-spin 0.8s linear infinite',
          }}
        />
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontFamily: 'Poppins, sans-serif' }}>
          Loading…
        </p>
      </div>
      <style>{`@keyframes lumino-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
