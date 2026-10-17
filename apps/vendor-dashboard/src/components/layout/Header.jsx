export function Header({ titel, subtitel, acties }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '24px',
      paddingBottom: '20px',
      borderBottom: '1px solid #EDE6D6',
    }}>
      <div>
        <h1 style={{
          fontFamily: 'Cormorant Garamond, serif',
          fontSize: '28px',
          fontWeight: '600',
          color: '#2D2520',
          margin: 0,
          letterSpacing: '0.5px',
        }}>
          {titel}
        </h1>
        {subtitel && (
          <p style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '13px',
            color: '#8B7355',
            margin: '4px 0 0',
          }}>
            {subtitel}
          </p>
        )}
      </div>
      {acties && (
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {acties}
        </div>
      )}
    </div>
  )
}
