import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

/**
 * Root application shell.
 *
 * Background strategy:
 *   Layer 0 — multi-stop diagonal base gradient (pink → lavender → blue → teal)
 *   Layer 1 — five fixed radial blob glows (one per colour family)
 *   Layer 2 — sidebar (its own glass-sidebar gradient)
 *   Layer 3 — main content area with glass cards
 *
 * This layered approach ensures the gradient is vivid enough to show
 * through translucent card surfaces in both themes.
 */
export function AppLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden">

      {/* ── LAYER 0: Base gradient ───────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 0,
          background: `
            linear-gradient(
              135deg,
              var(--bg-grad-a)  0%,
              var(--bg-grad-b) 33%,
              var(--bg-grad-c) 66%,
              var(--bg-grad-d) 100%
            )
          `,
        }}
      />

      {/* ── LAYER 1: Radial glow blobs ───────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{ position: 'fixed', inset: 0, zIndex: 1, pointerEvents: 'none' }}
      >
        {/* Top-left rose glow */}
        <div style={{
          position: 'absolute', top: '-20%', left: '-10%',
          width: '60vw', height: '60vw', maxWidth: 800, maxHeight: 800,
          borderRadius: '50%',
          background: `radial-gradient(circle at center, var(--blob-1) 0%, transparent 65%)`,
        }} />
        {/* Centre lilac glow */}
        <div style={{
          position: 'absolute', top: '15%', left: '25%',
          width: '55vw', height: '55vw', maxWidth: 700, maxHeight: 700,
          borderRadius: '50%',
          background: `radial-gradient(circle at center, var(--blob-2) 0%, transparent 65%)`,
        }} />
        {/* Right sky-blue glow */}
        <div style={{
          position: 'absolute', top: '5%', right: '-15%',
          width: '50vw', height: '50vw', maxWidth: 650, maxHeight: 650,
          borderRadius: '50%',
          background: `radial-gradient(circle at center, var(--blob-3) 0%, transparent 65%)`,
        }} />
        {/* Bottom-right teal glow */}
        <div style={{
          position: 'absolute', bottom: '-15%', right: '-5%',
          width: '45vw', height: '45vw', maxWidth: 580, maxHeight: 580,
          borderRadius: '50%',
          background: `radial-gradient(circle at center, var(--blob-4) 0%, transparent 65%)`,
        }} />
        {/* Bottom-left peach glow */}
        <div style={{
          position: 'absolute', bottom: '-10%', left: '10%',
          width: '40vw', height: '40vw', maxWidth: 520, maxHeight: 520,
          borderRadius: '50%',
          background: `radial-gradient(circle at center, var(--blob-5) 0%, transparent 65%)`,
        }} />
      </div>

      {/* ── LAYER 2: Sidebar ─────────────────────────────────────────────── */}
      <Sidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* ── LAYER 3: Main content ─────────────────────────────────────────── */}
      <div
        className="flex flex-col flex-1 min-w-0 min-h-screen"
        style={{
          position: 'relative',
          zIndex: 2,
          /* Offset for the fixed 270px sidebar on desktop */
          marginLeft: '0',
        }}
      >
        {/* Desktop left-margin spacer — pushes content past the fixed sidebar */}
        <style>{`
          @media (min-width: 1024px) {
            #lumino-main-area { margin-left: 270px; }
          }
        `}</style>
        <div id="lumino-main-area" className="flex flex-col flex-1 min-h-screen">
          <Header onMenuOpen={() => setMobileMenuOpen(true)} />
          <main
            id="main-content"
            className="flex-1"
            style={{ padding: '0.25rem 1.5rem 3rem', overflowY: 'auto' }}
            tabIndex={-1}
          >
            <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </div>
  )
}
