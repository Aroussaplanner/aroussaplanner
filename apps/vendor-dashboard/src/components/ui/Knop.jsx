export function Knop({ children, variant = 'primair', type = 'button', onClick, disabled, klein = false, volikontwikkeld = false }) {
  const basis = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    fontFamily: 'Montserrat, sans-serif',
    fontSize: klein ? '12px' : '13px',
    fontWeight: '500',
    letterSpacing: '0.5px',
    padding: klein ? '6px 14px' : '10px 20px',
    borderRadius: '6px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.6 : 1,
    border: 'none',
    transition: 'all 0.15s ease',
    width: volikontwikkeld ? '100%' : undefined,
    textDecoration: 'none',
  }

  const varianten = {
    primair: {
      background: '#C4A882',
      color: '#fff',
    },
    secundair: {
      background: 'transparent',
      color: '#8B7355',
      border: '1px solid #C4A882',
    },
    gevaar: {
      background: '#DC2626',
      color: '#fff',
    },
    ghost: {
      background: 'transparent',
      color: '#8B7355',
    },
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      style={{ ...basis, ...varianten[variant] }}
    >
      {children}
    </button>
  )
}
