import { ReactNode } from 'react'

export default function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h2 style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
      <span style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-heading)' }}>{children}</span>
      <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(0,0,0,0.06)' }} />
    </h2>
  )
}
