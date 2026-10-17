import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { VendorProvider } from './context/VendorContext'
import { DashboardLayout } from './components/layout/DashboardLayout'
import { Login } from './pages/auth/Login'
import { Register } from './pages/auth/Register'
import { Dashboard } from './pages/Dashboard'
import { Leads } from './pages/Leads'
import { Quotes } from './pages/Quotes'
import { Bookings } from './pages/Bookings'
import { Costs } from './pages/Costs'
import { Settings } from './pages/Settings'

export function App() {
  return (
    <VendorProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/inloggen" element={<Login />} />
          <Route path="/registreren" element={<Register />} />

          {/* Dashboard routes (beschermd) */}
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/aanvragen" element={<Leads />} />
            <Route path="/offertes" element={<Quotes />} />
            <Route path="/boekingen" element={<Bookings />} />
            <Route path="/kosten" element={<Costs />} />
            <Route path="/instellingen" element={<Settings />} />
          </Route>

          {/* Redirect root */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </VendorProvider>
  )
}
