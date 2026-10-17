export function Badge({ status, label }) {
  const kleuren = {
    'badge-blauw':  { bg: '#EBF4FF', kleur: '#1D6FA4', rand: '#BFDBFE' },
    'badge-goud':   { bg: '#FEF9EC', kleur: '#92610A', rand: '#FDE68A' },
    'badge-groen':  { bg: '#ECFDF5', kleur: '#065F46', rand: '#A7F3D0' },
    'badge-rood':   { bg: '#FEF2F2', kleur: '#991B1B', rand: '#FECACA' },
    'badge-grijs':  { bg: '#F9FAFB', kleur: '#4B5563', rand: '#E5E7EB' },
    'badge-oranje': { bg: '#FFF7ED', kleur: '#9A3412', rand: '#FDBA74' },
    'badge-paars':  { bg: '#F5F3FF', kleur: '#5B21B6', rand: '#DDD6FE' },
  }

  const stijl = kleuren[status] || kleuren['badge-grijs']

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: '2px 10px',
      borderRadius: '12px',
      fontSize: '11px',
      fontWeight: '500',
      fontFamily: 'Montserrat, sans-serif',
      letterSpacing: '0.3px',
      background: stijl.bg,
      color: stijl.kleur,
      border: `1px solid ${stijl.rand}`,
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  )
}
