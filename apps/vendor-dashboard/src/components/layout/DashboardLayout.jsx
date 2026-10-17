import { Navigate, Outlet } from 'react-router-dom'
import { useVendor } from '../../context/VendorContext'
import { Sidebar } from './Sidebar'

export function DashboardLayout() {
  const { user, laadt, heeftOrganisatie } = useVendor()

  if (laadt) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#F7F2EA',
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '18px',
        color: '#8B7355',
      }}>
        Laden...
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/inloggen" replace />
  }

  if (!heeftOrganisatie) {
    return <Navigate to="/registreren" replace />
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#F7F2EA',
    }}>
      <Sidebar />
      <main style={{
        flex: 1,
        marginLeft: '220px',
        padding: '32px 36px',
        minHeight: '100vh',
        maxWidth: 'calc(100vw - 220px)',
        boxSizing: 'border-box',
      }}>
        <Outlet />
      </main>
    </div>
  )
}
