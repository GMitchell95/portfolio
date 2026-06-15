import Button from '@/components/ui/Button'

const CONTAINER = { maxWidth: 1100, margin: '0 auto' }

const COLORS: { token: string; hex: string; tailwind: string }[] = [
  { token: '--color-heading',        hex: '#18181B', tailwind: 'zinc-900' },
  { token: '--color-primary',        hex: '#27272A', tailwind: 'zinc-800' },
  { token: '--color-secondary',      hex: '#3F3F46', tailwind: 'zinc-700' },
  { token: '--color-body',           hex: '#52525B', tailwind: 'zinc-600' },
  { token: '--color-muted',          hex: '#71717A', tailwind: 'zinc-500' },
  { token: '--color-border-strong',  hex: '#D4D4D8', tailwind: 'zinc-300' },
  { token: '--color-border',         hex: '#E4E4E7', tailwind: 'zinc-200' },
  { token: '--color-surface',        hex: '#F4F4F5', tailwind: 'zinc-100' },
  { token: '--color-surface-subtle', hex: '#FAFAFA', tailwind: 'zinc-50'  },
  { token: '--color-white',          hex: '#FFFFFF', tailwind: 'white'    },
  { token: '--color-accent',         hex: '#4443B4', tailwind: ''         },
  { token: '--color-accent-hover',   hex: '#3332A0', tailwind: ''         },
  { token: '--color-accent-light',   hex: '#EBEBF8', tailwind: ''         },
]

const FONT_SIZES: { token: string; value: string }[] = [
  { token: '--font-size-h1',    value: '36px' },
  { token: '--font-size-h2',    value: '20px' },
  { token: '--font-size-h3',    value: '16px' },
  { token: '--font-size-body',  value: '15px' },
  { token: '--font-size-small', value: '14px' },
  { token: '--font-size-label', value: '12px' },
  { token: '--font-size-nav',   value: '13px' },
]

const VARIANTS = ['primary', 'secondary', 'outline', 'ghost'] as const
const SIZES    = ['sm', 'md', 'lg'] as const

const SECTION_HEADING: React.CSSProperties = {
  fontSize:     'var(--font-size-h2)',
  fontWeight:   'var(--font-weight-medium)',
  color:        'var(--color-heading)',
  marginBottom: 24,
}

export default function StyleguidePage() {
  return (
    <div className="site-container" style={{ ...CONTAINER, paddingTop: 80, paddingBottom: 120 }}>
      <h1 style={{ fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)' }}>
        Styleguide
      </h1>

      {/* ── Colours ─────────────────────────────────────── */}
      <h2 style={{ ...SECTION_HEADING, marginTop: 48 }}>Colours</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 24 }}>
        {COLORS.map(({ token, hex, tailwind }) => (
          <div key={token}>
            <div style={{
              width: 64,
              height: 64,
              borderRadius: 8,
              background: `var(${token})`,
              border: '1px solid var(--color-border)',
              marginBottom: 10,
            }} />
            <div style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-heading)' }}>
              {token}
            </div>
            {tailwind && (
              <div style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)', marginTop: 2 }}>
                {tailwind}
              </div>
            )}
            <div style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)', marginTop: 2 }}>
              {hex}
            </div>
          </div>
        ))}
      </div>

      {/* ── Typography ──────────────────────────────────── */}
      <h2 style={{ ...SECTION_HEADING, marginTop: 64 }}>Typography</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        {FONT_SIZES.map(({ token, value }) => (
          <div key={token} style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 24 }}>
            <p style={{
              fontSize:     `var(${token})`,
              fontWeight:   'var(--font-weight-regular)',
              color:        'var(--color-heading)',
              lineHeight:   'var(--line-height-body)',
              marginBottom: 6,
            }}>
              The quick brown fox jumps over the lazy dog
            </p>
            <div style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>
              {token} · {value} · --font-weight-regular
            </div>
          </div>
        ))}

        {/* Weight examples at --font-size-h2 */}
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 24 }}>
          <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-heading)', lineHeight: 'var(--line-height-body)', marginBottom: 6 }}>
            The quick brown fox jumps over the lazy dog
          </p>
          <div style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>
            --font-size-h2 · 20px · --font-weight-medium
          </div>
        </div>
        <div style={{ borderBottom: '1px solid var(--color-border)', paddingBottom: 24 }}>
          <p style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', lineHeight: 'var(--line-height-body)', marginBottom: 6 }}>
            The quick brown fox jumps over the lazy dog
          </p>
          <div style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>
            --font-size-h2 · 20px · --font-weight-bold
          </div>
        </div>
      </div>

      {/* ── Buttons ─────────────────────────────────────── */}
      <h2 style={{ ...SECTION_HEADING, marginTop: 64 }}>Buttons</h2>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        {VARIANTS.map(variant => (
          <div key={variant}>
            <div style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-muted)', marginBottom: 16 }}>
              {variant}
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
              {/* Text buttons */}
              {SIZES.map(size => (
                <div key={size} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  <Button variant={variant} size={size}>Button</Button>
                  <span style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>{size}</span>
                </div>
              ))}

              {/* Text button with icon */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                <Button
                  variant={variant}
                  size="md"
                  icon={<i className="fa-solid fa-bolt" style={{ fontSize: 12 }} />}
                >
                  With icon
                </Button>
                <span style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>md · icon</span>
              </div>

              {/* Icon-only square buttons */}
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginLeft: 'auto' }}>
              {SIZES.map(size => (
                <div key={`icon-${size}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8 }}>
                  <Button variant={variant} size={size} icon>
                    <i className="fa-solid fa-bolt" style={{ fontSize: 12 }} />
                  </Button>
                  <span style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)' }}>{size} · icon-only</span>
                </div>
              ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
