'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

function ImageIcon() {
  return (
    <svg width={26} height={26} fill="none" viewBox="0 0 24 24" stroke="#A1A1AA" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
    </svg>
  );
}

function ZoomIcon() {
  return (
    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
  );
}

function ImagePlaceholder({ label, tall = false }: { label: string; tall?: boolean }) {
  return (
    <div
      style={{
        width: '100%',
        aspectRatio: tall ? '9/14' : '16/9',
        maxHeight: tall ? 480 : undefined,
        background: '#F4F4F5',
        borderRadius: 8,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        <ImageIcon />
        <span style={{ fontSize: 13, color: '#A1A1AA', fontWeight: 500 }}>{label}</span>
      </div>
    </div>
  );
}

export default function ClickableImage({
  label,
  src,
  tall = false,
  constrained = false,
  aspectRatio = '1760/1060',
  loading,
  onClick,
}: {
  label: string;
  src?: string;
  tall?: boolean;
  constrained?: boolean;
  aspectRatio?: string;
  loading?: 'eager' | 'lazy';
  onClick: () => void;
}) {
  // Track a fade key so we can crossfade when src changes
  const [displayed, setDisplayed] = useState<{ src: string; key: number } | null>(
    src ? { src, key: 0 } : null
  );
  const [incoming, setIncoming] = useState<{ src: string; key: number } | null>(null);
  const fadeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const keyCounter = useRef(1);

  useEffect(() => {
    if (!src) { setDisplayed(null); setIncoming(null); return; }
    // First render or same src — no crossfade needed
    if (!displayed || displayed.src === src) {
      setDisplayed({ src, key: displayed?.key ?? 0 });
      return;
    }
    // New src — crossfade
    if (fadeTimer.current) clearTimeout(fadeTimer.current);
    const k = keyCounter.current++;
    setIncoming({ src, key: k });
    fadeTimer.current = setTimeout(() => {
      setDisplayed({ src, key: k });
      setIncoming(null);
    }, 200);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  return (
    <div
      className="cs-img-wrap"
      onClick={onClick}
      style={{ maxHeight: constrained ? 480 : undefined }}
    >
      {displayed || src ? (
        <div style={{ position: 'relative', width: '100%', aspectRatio, borderRadius: 8, overflow: 'hidden' }}>
          {/* Base layer */}
          {displayed && (
            <Image
              key={displayed.key}
              src={displayed.src}
              fill
              loading={loading}
              style={{ objectFit: 'cover', opacity: incoming ? 0 : 1, transition: incoming ? 'opacity 200ms ease' : 'none' }}
              alt={label}
            />
          )}
          {/* Incoming crossfade layer */}
          {incoming && (
            <Image
              key={incoming.key}
              src={incoming.src}
              fill
              style={{ objectFit: 'cover', opacity: 1, animation: 'cs-fade-in 200ms ease forwards' }}
              alt={label}
            />
          )}
        </div>
      ) : (
        <ImagePlaceholder label={label} tall={tall} />
      )}
      <div className="cs-zoom-hint">
        <ZoomIcon />
        View full size
      </div>
    </div>
  );
}
