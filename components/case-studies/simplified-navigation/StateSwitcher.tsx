'use client';

import { useEffect, useRef } from 'react';
import type { SlideState } from './types';

export default function StateSwitcher({
  states,
  active,
  onChange,
}: {
  states: SlideState[];
  active: number;
  onChange: (i: number) => void;
}) {
  const btnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const sliderRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    const slider = sliderRef.current;
    const btn = btnRefs.current[active];
    if (!slider || !btn) return;

    const parent = btn.offsetParent as HTMLElement | null;
    if (!parent) return;
    const btnRect = btn.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const left = btnRect.left - parentRect.left;

    if (!initialized.current) {
      // First paint — snap with no transition
      slider.style.transition = 'none';
      slider.style.width = `${btnRect.width}px`;
      slider.style.transform = `translateX(${left}px)`;
      // Force reflow then re-enable transition for future moves
      void slider.offsetHeight;
      slider.style.transition = 'transform 0.22s cubic-bezier(0.4,0,0.2,1), width 0.22s cubic-bezier(0.4,0,0.2,1)';
      initialized.current = true;
    } else {
      slider.style.width = `${btnRect.width}px`;
      slider.style.transform = `translateX(${left}px)`;
    }
  }, [active]);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: 14,
        left: '50%',
        transform: 'translateX(-50%)',
        background: 'rgba(255,255,255,0.92)',
        backdropFilter: 'blur(8px)',
        borderRadius: 12,
        padding: 4,
        boxShadow: '0 0 0 1px rgba(0,0,0,0.03), 0 1px 1px rgba(0,0,0,0.03), 0 2px 2px rgba(0,0,0,0.03), 0 4px 4px rgba(0,0,0,0.03), 0 0 8px rgba(0,0,0,0.03)',
        zIndex: 10,
        pointerEvents: 'auto',
      }}
      onClick={e => e.stopPropagation()}
      onMouseEnter={e => e.stopPropagation()}
      onMouseLeave={e => e.stopPropagation()}
      onMouseOver={e => e.stopPropagation()}
    >
      <div style={{ position: 'relative', display: 'flex', gap: 4, pointerEvents: 'auto' }}>
        {/* Sliding indicator */}
        <div
          ref={sliderRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: 28,
            borderRadius: 8,
            background: 'rgba(0,0,0,0.04)',
            pointerEvents: 'none',
            zIndex: 0,
          }}
        />
        {/* Buttons */}
        {states.map((s, i) => (
          <button
            key={i}
            ref={el => { btnRefs.current[i] = el; }}
            onClick={() => onChange(i)}
            className={i === active ? 'text-zinc-700' : 'text-zinc-500'}
            style={{
              height: 28,
              padding: '0 12px',
              borderRadius: 8,
              fontSize: 'var(--font-size-label)',
              fontWeight: 'var(--font-weight-medium)',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              position: 'relative',
              zIndex: 1,
              whiteSpace: 'nowrap',
            }}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
}
