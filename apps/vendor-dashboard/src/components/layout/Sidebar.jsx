import { NavLink } from 'react-router-dom'
import { useVendor } from '../../context/VendorContext'

const navItems = [
  { pad: '/dashboard', label: 'Dashboard', icoon: '◈' },
  { pad: '/aanvragen', label: 'Aanvragen', icoon: '✉' },
  { pad: '/offertes', label: 'Offertes', icoon: '📋' },
  { pad: '/boekingen', label: 'Boekingen', icoon: '📅' },
  { pad: '/kosten', label: 'Kosten & Marge', icoon: '€' },
  { pad: '/instellingen', label: 'Instellingen', icoon: '⚙' },
]

export function Sidebar() {
  const { organisatie, uitloggen } = useVendor()

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: '#1A1210',
      display: 'flex',
      flexDirection: 'column',
      position: 'fixed',
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px 20px',
        borderBottom: '1px solid rgba(196,168,130,0.2)',
      }}>
        <div style={{
          fontFamily: 'Italiana, serif',
          fontSize: '22px',
          color: '#C4A882',
          letterSpacing: '1px',
        }}>
          Aroussa
        </div>
        <div style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '10px',
          color: 'rgba(196,168,130,0.6)',
          letterSpacing: '2px',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}>
          Leveranciers
        </div>
      </div>

      {/* Organisatie */}
      {organisatie && (
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid rgba(196,168,130,0.1)',
        }}>
          <div style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.4)',
            letterSpacing: '0.5px',
            marginBottom: '2px',
          }}>
            Ingelogd als
          </div>
          <div style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            color: '#F7F2EA',
            fontWeight: '500',
          }}>
            {organisatie.name}
          </div>
        </div>
      )}

      {/* Navigatie */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {navItems.map(item => (
          <NavLink
            key={item.pad}
            to={item.pad}
            style={({ isActive }) => ({
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 20px',
              fontFamily: 'Montserrat, sans-serif',
              fontSize: '13px',
              fontWeight: isActive ? '500' : '400',
              color: isActive ? '#C4A882' : 'rgba(247,242,234,0.6)',
              textDecoration: 'none',
              background: isActive ? 'rgba(196,168,130,0.1)' : 'transparent',
              borderLeft: isActive ? '2px solid #C4A882' : '2px solid transparent',
              transition: 'all 0.15s ease',
            })}
          >
            <span style={{ fontSize: '15px', width: '18px', textAlign: 'center' }}>
              {item.icoon}
            </span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Uitloggen */}
      <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(196,168,130,0.1)' }}>
        <button
          onClick={uitloggen}
          style={{
            width: '100%',
            padding: '8px',
            background: 'transparent',
            border: '1px solid rgba(196,168,130,0.3)',
            borderRadius: '6px',
            color: 'rgba(247,242,234,0.5)',
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '12px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          ↩ Uitloggen
        </button>
      </div>
    </aside>
  )
}
