import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider }      from '@/context/ThemeContext'
import { AuthProvider }       from '@/context/AuthContext'
import { ProtectedRoute }     from '@/components/auth/ProtectedRoute'
import { AppLayout }          from '@/components/layout/AppLayout'
import { DashboardPage }      from '@/pages/Dashboard/DashboardPage'
import { ResumePage }         from '@/pages/Resume/ResumePage'
import { InterviewPage }      from '@/pages/Interview/InterviewPage'
import { SettingsPage }       from '@/pages/Settings/SettingsPage'
import { HelpPage }           from '@/pages/Help/HelpPage'
import { LoginPage }          from '@/pages/Auth/LoginPage'
import { RegisterPage }       from '@/pages/Auth/RegisterPage'
import { ForgotPasswordPage } from '@/pages/Auth/ForgotPasswordPage'
import { ResetPasswordPage }  from '@/pages/Auth/ResetPasswordPage'
import { AuthCallbackPage }   from '@/pages/Auth/AuthCallbackPage'
// Job Matcher and Roadmap are temporarily hidden.
// Imports are preserved below for easy restoration.
// import { JobMatcherPage } from '@/pages/JobMatcher/JobMatcherPage'
// import { RoadmapPage }    from '@/pages/Roadmap/RoadmapPage'

export default function App() {
  return (
    /*
     * ThemeProvider outermost — auth pages also respect the active theme.
     * AuthProvider wraps BrowserRouter so all routes can call useAuth().
     */
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* ── Public auth routes (no sidebar, no protection) ───── */}
            <Route path="/login"               element={<LoginPage />} />
            <Route path="/register"            element={<RegisterPage />} />
            <Route path="/forgot-password"     element={<ForgotPasswordPage />} />
            <Route path="/auth/reset-password" element={<ResetPasswordPage />} />
            <Route path="/auth/callback"       element={<AuthCallbackPage />} />

            {/*
             * ── Protected routes ────────────────────────────────────
             * ProtectedRoute is an outer layout route that either shows
             * a loading screen, redirects to /login, or renders <Outlet />.
             * AppLayout is a nested layout route that renders the sidebar,
             * header and its own <Outlet /> for page content.
             */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route index              element={<DashboardPage />} />
                <Route path="resume"      element={<ResumePage />} />
                <Route path="interview"   element={<InterviewPage />} />
                <Route path="settings"    element={<SettingsPage />} />
                <Route path="help"        element={<HelpPage />} />
                {/* Job Matcher and Roadmap are temporarily hidden.
                    Restore by uncommenting these routes and their imports above.
                <Route path="job-matcher" element={<JobMatcherPage />} />
                <Route path="roadmap"     element={<RoadmapPage />} />
                */}
              </Route>
            </Route>

            {/* ── Catch-all ────────────────────────────────────────── */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
