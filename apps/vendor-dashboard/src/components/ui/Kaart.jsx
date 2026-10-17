export function Kaart({ children, stijl }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #EDE6D6',
      borderRadius: '10px',
      padding: '20px 24px',
      ...stijl,
    }}>
      {children}
    </div>
  )
}

export function StatKaart({ label, waarde, subwaarde, kleur = '#C4A882', icoon }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #EDE6D6',
      borderRadius: '10px',
      padding: '20px 24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <span style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '11px',
          fontWeight: '500',
          color: '#8B7355',
          letterSpacing: '1px',
          textTransform: 'uppercase',
        }}>
          {label}
        </span>
        {icoon && (
          <span style={{ fontSize: '18px', opacity: 0.6 }}>{icoon}</span>
        )}
      </div>
      <div style={{
        fontFamily: 'Cormorant Garamond, serif',
        fontSize: '32px',
        fontWeight: '600',
        color: '#2D2520',
        lineHeight: 1,
      }}>
        {waarde}
      </div>
      {subwaarde && (
        <div style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '11px',
          color: '#8B7355',
        }}>
          {subwaarde}
        </div>
      )}
    </div>
  )
}
