import { Bell, Search, Sun, Moon, Menu } from 'lucide-react'
import { useTheme } from '@/context/ThemeContext'

function getGreeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

/* Consistent glass pill button used for theme toggle and notifications */
function GlassButton({ children, onClick, ariaLabel, style = {} }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      style={{
        width: '42px',
        height: '42px',
        borderRadius: '0.75rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        cursor: 'pointer',
        background: 'var(--bg-card)',
        backdropFilter: 'var(--blur-glass)',
        WebkitBackdropFilter: 'var(--blur-glass)',
        border: '1px solid var(--border-card)',
        boxShadow: 'var(--shadow-card)',
        color: 'var(--text-secondary)',
        transition: 'transform 0.15s ease, box-shadow 0.15s ease',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
    >
      {children}
    </button>
  )
}

export function Header({ onMenuOpen }) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.125rem 1.5rem',
        minHeight: '72px',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}
    >
      {/* Mobile hamburger */}
      <GlassButton
        ariaLabel="Open navigation menu"
        onClick={onMenuOpen}
        style={{ display: 'none' }}
        /* Shown via className below — using a wrapper div for responsive */
      />
      <div className="lg:hidden">
        <GlassButton ariaLabel="Open navigation menu" onClick={onMenuOpen}>
          <Menu size={19} />
        </GlassButton>
      </div>

      {/* ── Greeting ──────────────────────────────────────── */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <h1
          style={{
            fontSize: '1.3125rem',
            fontWeight: 800,
            color: 'var(--text-primary)',
            letterSpacing: '-0.02em',
            lineHeight: 1.25,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {getGreeting()} 👋
        </h1>
        <p
          className="hidden sm:block"
          style={{
            fontSize: '0.8125rem',
            color: 'var(--text-muted)',
            marginTop: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          Welcome to Lumino — let&apos;s build your career today.
        </p>
      </div>

      {/* ── Search ──────────────────────────────────────── */}
      <div
        className="hidden md:flex"
        style={{
          alignItems: 'center',
          gap: '0.625rem',
          width: '300px',
          height: '42px',
          padding: '0 1rem',
          borderRadius: '0.75rem',
          flexShrink: 0,
          background: 'var(--bg-card)',
          backdropFilter: 'var(--blur-glass)',
          WebkitBackdropFilter: 'var(--blur-glass)',
          border: '1px solid var(--border-card)',
          boxShadow: 'var(--shadow-card)',
        }}
      >
        <Search size={15} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input
          type="search"
          placeholder="Search..."
          aria-label="Search"
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontSize: '0.875rem',
            color: 'var(--text-primary)',
            fontFamily: 'inherit',
          }}
        />
      </div>

      {/* ── Theme toggle ──────────────────────────────────── */}
      <GlassButton
        onClick={toggleTheme}
        ariaLabel={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
      >
        {theme === 'dark'
          ? <Sun   size={17} color="#F6B99F" />
          : <Moon  size={17} color="#896BC5" />
        }
      </GlassButton>

      {/* ── Notifications ─────────────────────────────────── */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <GlassButton ariaLabel="Notifications">
          <Bell size={17} color="var(--text-secondary)" />
        </GlassButton>
        {/* Unread dot */}
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: '6px',
            right: '6px',
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            background: '#D96D94',
            border: '2px solid transparent',
            boxShadow: '0 0 6px rgba(217,109,148,0.70)',
          }}
        />
      </div>
    </header>
  )
}
