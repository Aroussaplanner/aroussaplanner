export function Invoerveld({ label, fout, verplicht, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '12px',
          fontWeight: '500',
          color: '#2D2520',
          letterSpacing: '0.3px',
        }}>
          {label}{verplicht && <span style={{ color: '#C4A882', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <input
        style={{
          width: '100%',
          padding: '9px 12px',
          border: `1px solid ${fout ? '#DC2626' : '#DDD6CC'}`,
          borderRadius: '6px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '13px',
          color: '#2D2520',
          background: '#FDFAF6',
          outline: 'none',
          boxSizing: 'border-box',
          transition: 'border-color 0.15s ease',
        }}
        onFocus={e => e.target.style.borderColor = '#C4A882'}
        onBlur={e => e.target.style.borderColor = fout ? '#DC2626' : '#DDD6CC'}
        {...props}
      />
      {fout && (
        <span style={{ fontSize: '11px', color: '#DC2626', fontFamily: 'Montserrat, sans-serif' }}>
          {fout}
        </span>
      )}
    </div>
  )
}

export function Selectieveld({ label, fout, verplicht, kinderen, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '12px',
          fontWeight: '500',
          color: '#2D2520',
          letterSpacing: '0.3px',
        }}>
          {label}{verplicht && <span style={{ color: '#C4A882', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <select
        style={{
          width: '100%',
          padding: '9px 12px',
          border: `1px solid ${fout ? '#DC2626' : '#DDD6CC'}`,
          borderRadius: '6px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '13px',
          color: '#2D2520',
          background: '#FDFAF6',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        {...props}
      >
        {kinderen}
      </select>
      {fout && (
        <span style={{ fontSize: '11px', color: '#DC2626', fontFamily: 'Montserrat, sans-serif' }}>
          {fout}
        </span>
      )}
    </div>
  )
}

export function Tekstveld({ label, fout, verplicht, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      {label && (
        <label style={{
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '12px',
          fontWeight: '500',
          color: '#2D2520',
          letterSpacing: '0.3px',
        }}>
          {label}{verplicht && <span style={{ color: '#C4A882', marginLeft: '2px' }}>*</span>}
        </label>
      )}
      <textarea
        style={{
          width: '100%',
          padding: '9px 12px',
          border: `1px solid ${fout ? '#DC2626' : '#DDD6CC'}`,
          borderRadius: '6px',
          fontFamily: 'Montserrat, sans-serif',
          fontSize: '13px',
          color: '#2D2520',
          background: '#FDFAF6',
          outline: 'none',
          boxSizing: 'border-box',
          resize: 'vertical',
          minHeight: '80px',
        }}
        {...props}
      />
    </div>
  )
}
