import { NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Settings,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import logoSrc from '@/assets/logo.png'
import { Avatar } from '@/components/ui/Avatar'
import { APP_NAME } from '@/lib/constants'
import { useAuth } from '@/context/AuthContext'

/* ── Navigation item definitions ─────────────────────────────────── */
const NAV_ITEMS = [
  { label: 'Home',         icon: LayoutDashboard, path: '/' },
  { label: 'Resume',       icon: FileText,        path: '/resume' },
  { label: 'AI Interview', icon: MessageSquare,   path: '/interview' },
]

const BOTTOM_ITEMS = [
  { label: 'Settings',      icon: Settings,    path: '/settings' },
  { label: 'Help & Support', icon: HelpCircle, path: '/help' },
]

/* ── Single nav item ─────────────────────────────────────────────── */
function NavItem({ item, onClick }) {
  const Icon = item.icon

  return (
    <NavLink
      to={item.path}
      end={item.path === '/'}
      onClick={onClick}
      aria-label={item.label}
      style={({ isActive }) => ({
        display: 'flex',
        alignItems: 'center',
        gap: '0.875rem',
        padding: '0.75rem 1rem',
        borderRadius: '0.75rem',
        textDecoration: 'none',
        transition: 'all 0.18s ease',
        userSelect: 'none',
        position: 'relative',
        /* Active: frosted-glass pill matching IMAGE 2 */
        background: isActive ? 'rgba(255,255,255,0.22)' : 'transparent',
        backdropFilter: isActive ? 'blur(10px)' : 'none',
        WebkitBackdropFilter: isActive ? 'blur(10px)' : 'none',
        border: isActive ? '1px solid rgba(255,255,255,0.30)' : '1px solid transparent',
        boxShadow: isActive
          ? '0 4px 20px rgba(0,0,0,0.20), inset 0 1px 0 rgba(255,255,255,0.30)'
          : 'none',
      })}
      className="group"
    >
      {({ isActive }) => (
        <>
          <Icon
            size={18}
            strokeWidth={isActive ? 2.2 : 1.8}
            style={{
              flexShrink: 0,
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.65)',
              transition: 'color 0.18s',
            }}
          />
          <span
            style={{
              fontSize: '0.9rem',
              fontWeight: isActive ? 700 : 500,
              color: isActive ? '#ffffff' : 'rgba(255,255,255,0.72)',
              transition: 'color 0.18s, font-weight 0.18s',
              flex: 1,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {item.label}
          </span>
        </>
      )}
    </NavLink>
  )
}

/* ── Sidebar component ───────────────────────────────────────────── */
export function Sidebar({ mobileOpen, onMobileClose }) {
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()

  // Derive display values — prefer profile row, fall back to auth user metadata
  const displayName  = profile?.full_name
    || user?.user_metadata?.full_name
    || user?.email?.split('@')[0]
    || 'Your Account'
  const displayEmail = profile?.email || user?.email || ''
  const avatarUrl    = profile?.avatar_url || user?.user_metadata?.avatar_url || null

  const handleSignOut = async () => {
    await signOut()
    navigate('/login', { replace: true })
  }

  const sidebarStyles = {
    width: '270px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    /* Own gradient — separate from app background, matching IMAGE 2 */
    background: `linear-gradient(
      180deg,
      var(--sidebar-grad-a) 0%,
      var(--sidebar-grad-b) 50%,
      var(--sidebar-grad-c) 100%
    )`,
    backdropFilter: 'blur(32px)',
    WebkitBackdropFilter: 'blur(32px)',
    borderRight: '1px solid rgba(255,255,255,0.12)',
    boxShadow: 'var(--shadow-sidebar)',
    position: 'relative',
    overflow: 'hidden',
  }

  const sidebarInner = (
    <>
      {/* ── Subtle internal glow overlay ──────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: '-30%', left: '-20%',
          width: '140%', height: '70%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(150,100,220,0.22) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: '-20%', right: '-20%',
          width: '100%', height: '60%',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(60,120,220,0.15) 0%, transparent 70%)',
          pointerEvents: 'none',
        }}
      />
      {/* Right-edge highlight line */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          top: 0, right: 0, bottom: 0,
          width: '1px',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0.10) 50%, transparent 100%)',
          pointerEvents: 'none',
          zIndex: 10,
        }}
      />

      {/* ── Logo ──────────────────────────────────────── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          padding: '1.75rem 1.25rem 1.5rem',
          flexShrink: 0,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* Official Lumino crystal logo */}
        <img
          src={logoSrc}
          alt="Lumino logo"
          style={{
            width: '40px',
            height: '40px',
            objectFit: 'contain',
            flexShrink: 0,
            display: 'block',
          }}
        />
        <div style={{ minWidth: 0 }}>
          <p style={{
            fontSize: '1.0625rem',
            fontWeight: 800,
            color: '#ffffff',
            letterSpacing: '-0.01em',
            lineHeight: 1.2,
          }}>
            {APP_NAME}
          </p>
          <p style={{
            fontSize: '0.6875rem',
            color: 'rgba(255,255,255,0.55)',
            fontWeight: 500,
            marginTop: '1px',
          }}>
            AI Career Development
          </p>
        </div>
      </div>

      {/* ── Divider ───────────────────────────────────── */}
      <div style={{
        margin: '0 1.25rem 0.5rem',
        height: '1px',
        background: 'rgba(255,255,255,0.12)',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }} />

      {/* ── Main navigation ───────────────────────────── */}
      <nav
        aria-label="Primary navigation"
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0.75rem 0.875rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.5rem',
          position: 'relative',
          zIndex: 2,
        }}
      >
        {NAV_ITEMS.map(item => (
          <NavItem key={item.path} item={item} onClick={onMobileClose} />
        ))}
      </nav>

      {/* ── Bottom navigation ─────────────────────────── */}
      <div style={{
        padding: '0 0.875rem 0.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          margin: '0 0.375rem 0.625rem',
          height: '1px',
          background: 'rgba(255,255,255,0.10)',
        }} />
        {BOTTOM_ITEMS.map(item => (
          <NavItem key={item.path} item={item} onClick={onMobileClose} />
        ))}
      </div>

      {/* ── User profile card + logout ────────────────── */}
      <div style={{
        padding: '0.75rem 0.875rem 1.25rem',
        flexShrink: 0,
        position: 'relative',
        zIndex: 2,
      }}>
        {/* Profile card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem 0.875rem',
            borderRadius: '0.875rem',
            background: 'rgba(255,255,255,0.12)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.20)',
            boxShadow: '0 2px 12px rgba(0,0,0,0.18), inset 0 1px 0 rgba(255,255,255,0.18)',
          }}
          role="region"
          aria-label="User account"
        >
          <Avatar src={avatarUrl} name={displayName} size="sm" />
          <div style={{ minWidth: 0, flex: 1 }}>
            <p style={{
              fontSize: '0.8125rem',
              fontWeight: 700,
              color: '#ffffff',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}>
              {displayName}
            </p>
            <p style={{
              fontSize: '0.6875rem',
              color: 'rgba(255,255,255,0.55)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              marginTop: '2px',
            }}>
              {displayEmail}
            </p>
          </div>
          {/* Logout button */}
          <button
            type="button"
            onClick={handleSignOut}
            aria-label="Sign out"
            title="Sign out"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'rgba(255,255,255,0.50)',
              transition: 'color 0.15s',
              flexShrink: 0,
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.90)'}
            onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.50)'}
          >
            <LogOut size={15} strokeWidth={2} />
          </button>
        </div>
      </div>
    </>
  )

  return (
    <>
      {/* ── Mobile overlay ──────────────────────────────────── */}
      {mobileOpen && (
        <div
          onClick={onMobileClose}
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 40,
            background: 'rgba(0,0,0,0.55)',
            backdropFilter: 'blur(4px)',
          }}
        />
      )}

      {/* ── Desktop sidebar (fixed, full height) ────────────── */}
      <aside
        aria-label="Main navigation"
        className="hidden lg:flex lg:flex-col"
        style={{
          ...sidebarStyles,
          position: 'fixed',
          top: 0,
          left: 0,
          height: '100vh',
          zIndex: 30,
        }}
      >
        {sidebarInner}
      </aside>

      {/* ── Mobile sidebar (fixed overlay) ──────────────────── */}
      <aside
        aria-label="Main navigation"
        className="lg:hidden"
        style={{
          ...sidebarStyles,
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 50,
          transform: mobileOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {sidebarInner}
      </aside>
    </>
  )
}
