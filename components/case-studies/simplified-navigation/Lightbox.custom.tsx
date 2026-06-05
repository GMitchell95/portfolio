'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { LightboxState } from './types';
import StateSwitcher from './StateSwitcher';
import { ChevronLeft, ChevronRight } from './icons';

function CloseIcon() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

const DRAG_THRESHOLD = 3;
const ZOOM_EASE = '0.4s cubic-bezier(0.4, 0, 0.2, 1)';

export default function Lightbox({
  state,
  onClose,
  onNavigate,
}: {
  state: LightboxState;
  onClose: () => void;
  onNavigate: (dir: number) => void;
}) {
  const [activeStateIndices, setActiveStateIndices] = useState<Record<number, number>>({});
  const [zoomed,     setZoomed]     = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [badgeLabel, setBadgeLabel] = useState<string | null>(null);

  const imgRef       = useRef<HTMLImageElement>(null);
  const stageRef     = useRef<HTMLDivElement>(null);
  const captionRef   = useRef<HTMLDivElement>(null);
  const zoomedRef    = useRef(false);
  const scaleRef   = useRef(1);
  const txRef      = useRef(0);
  const badgeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef      = useRef<{ startX: number; txStart: number; moved: boolean } | null>(null);

  zoomedRef.current = zoomed;

  useEffect(() => {
    if (state.open) setActiveStateIndices(state.stateIndices);
  }, [state.open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Badge ─────────────────────────────────────────────────────────────────────
  const showBadge = useCallback((label: string) => {
    setBadgeLabel(label);
    if (badgeTimer.current) clearTimeout(badgeTimer.current);
    badgeTimer.current = setTimeout(() => setBadgeLabel(null), 2200);
  }, []);

  // ── Caption DOM helper ────────────────────────────────────────────────────────
  const setCaptionStyle = useCallback((opacity: string, transform: string, transition: string) => {
    const el = captionRef.current;
    if (!el) return;
    el.style.transition = transition;
    el.style.opacity    = opacity;
    el.style.transform  = transform;
  }, []);

  // ── Pan clamping ─────────────────────────────────────────────────────────────
  const clampTx = useCallback((tx: number): number => {
    const img = imgRef.current;
    if (!img) return tx;
    const maxPan = Math.max(0, (img.offsetWidth * scaleRef.current - window.innerWidth) / 2);
    return Math.min(maxPan, Math.max(-maxPan, tx));
  }, []);

  // ── Apply transform to image ──────────────────────────────────────────────────
  const applyTransform = useCallback((tx: number, scale: number, transition = 'none') => {
    const img = imgRef.current;
    if (!img) return;
    img.style.transition      = transition;
    img.style.transformOrigin = 'center center';
    img.style.transform       = `translate3d(${tx}px, 0, 0) scale3d(${scale}, ${scale}, 1)`;
  }, []);

  // ── Zoom in ───────────────────────────────────────────────────────────────────
  const doZoomIn = useCallback(() => {
    const img = imgRef.current;
    if (!img) return;

    const scale = window.innerHeight / img.getBoundingClientRect().height;
    scaleRef.current = scale;
    txRef.current    = 0;

    // Sync: hide caption immediately so the layout settles before the transition fires.
    // visibility: hidden keeps it in the flow (no reflow), so the image position is
    // already stable when the rAF zoom starts.
    const caption = captionRef.current;
    if (caption) {
      caption.style.transition  = 'none';
      caption.style.opacity     = '0';
      caption.style.visibility  = 'hidden';
    }

    // rAF: layout has settled — fire zoom from the correct position
    requestAnimationFrame(() => {
      applyTransform(0, scale, `transform ${ZOOM_EASE}`);
      setZoomed(true);
      showBadge('Drag to pan · click to zoom out');
    });
  }, [applyTransform, showBadge]);

  // ── Zoom out ──────────────────────────────────────────────────────────────────
  const doZoomOut = useCallback(() => {
    scaleRef.current = 1;
    txRef.current    = 0;
    applyTransform(0, 1, `transform ${ZOOM_EASE}`);

    const caption = captionRef.current;
    if (caption) caption.style.visibility = 'visible';
    setZoomed(false);
    setIsDragging(false);
    dragRef.current = null;

    requestAnimationFrame(() => {
      setCaptionStyle('1', 'translateY(0)', 'opacity 250ms ease, transform 250ms ease');
    });
    showBadge('Fit');
  }, [applyTransform, setCaptionStyle, showBadge]);

  // ── Reset on slide change / close ────────────────────────────────────────────
  const resetImmediate = useCallback(() => {
    scaleRef.current = 1;
    txRef.current    = 0;
    applyTransform(0, 1);
    const caption = captionRef.current;
    if (caption) { caption.style.visibility = 'visible'; caption.style.opacity = '1'; caption.style.transition = 'none'; }
    setCaptionStyle('1', 'translateY(0)', 'none');
    setZoomed(false);
    setIsDragging(false);
    dragRef.current = null;
  }, [applyTransform, setCaptionStyle]);

  useEffect(() => { resetImmediate(); }, [state.index]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!state.open) resetImmediate(); }, [state.open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedRef.current) doZoomOut();
        else onClose();
      }
      if (e.key === 'ArrowRight') onNavigate(1);
      if (e.key === 'ArrowLeft')  onNavigate(-1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [state.open, onClose, onNavigate, doZoomOut]);

  // ── Wheel / trackpad pan ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!state.open) return;
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!zoomedRef.current) return;
      e.preventDefault();
      const newTx = clampTx(txRef.current - (e.deltaX || e.deltaY));
      txRef.current = newTx;
      applyTransform(newTx, scaleRef.current);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [state.open, applyTransform, clampTx]);

  // ── Drag to pan ───────────────────────────────────────────────────────────────
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!zoomedRef.current) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, txStart: txRef.current, moved: false };
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current || !zoomedRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (!dragRef.current.moved && Math.abs(dx) < DRAG_THRESHOLD) return;
    dragRef.current.moved = true;
    const newTx = clampTx(dragRef.current.txStart + dx);
    txRef.current = newTx;
    applyTransform(newTx, scaleRef.current);
  }, [applyTransform, clampTx]);

  const handleMouseUp = useCallback(() => {
    const wasDrag = dragRef.current?.moved ?? false;
    if (!wasDrag) dragRef.current = null;
    setTimeout(() => { setIsDragging(false); if (wasDrag) dragRef.current = null; }, wasDrag ? 50 : 0);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (dragRef.current && !dragRef.current.moved) dragRef.current = null;
    setIsDragging(false);
  }, []);

  // ── Click: zoom in / out ──────────────────────────────────────────────────────
  const handleClick = useCallback(() => {
    if (dragRef.current?.moved) { dragRef.current = null; return; }
    dragRef.current = null;
    if (!zoomedRef.current) doZoomIn();
    else doZoomOut();
  }, [doZoomIn, doZoomOut]);

  // ── Render ────────────────────────────────────────────────────────────────────
  if (!state.open) return null;

  const slide          = state.slides[state.index];
  const hasMultiple    = state.slides.length > 1;
  const hasStates      = !!(slide.states && slide.states.length > 1);
  const activeStateIdx = activeStateIndices[state.index] ?? 0;
  const activeSrc      = hasStates ? slide.states![activeStateIdx].src : slide.src;
  const cursor         = !zoomed ? 'zoom-in' : isDragging ? 'grabbing' : 'grab';

  return (
    <div
      className="cs-lightbox"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Close */}
      <button
        className="cs-lb-close"
        onClick={onClose}
        style={{
          position: 'absolute', top: 20, right: 20,
          width: 40, height: 40, borderRadius: 10,
          border: '1px solid rgba(255,255,255,0.15)',
          background: 'rgba(255,255,255,0.08)',
          color: 'white',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          transition: 'background 0.15s ease',
          zIndex: 10,
        }}
      >
        <CloseIcon />
      </button>

      {/* Zoom badge */}
      {badgeLabel && (
        <div style={{
          position: 'absolute', bottom: 32, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)',
          color: 'rgba(255,255,255,0.85)',
          fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)',
          padding: '5px 14px', borderRadius: 20,
          pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap',
          animation: 'cs-lb-badge-out 2200ms ease forwards',
        }}>
          {badgeLabel}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>

        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

          {/* Prev */}
          {hasMultiple && (
            <button
              className="cs-lb-nav"
              onClick={() => onNavigate(-1)}
              disabled={state.index === 0}
              style={{
                position: 'absolute', left: -60, top: '50%', transform: 'translateY(-50%)',
                width: 44, height: 44, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: state.index === 0 ? 'default' : 'pointer',
                opacity: zoomed ? 0 : state.index === 0 ? 0.2 : 1,
                pointerEvents: zoomed ? 'none' : 'auto',
                transition: 'background 0.15s ease, opacity 0.25s ease',
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Image stage */}
          {activeSrc ? (
            <div
              ref={stageRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onClick={handleClick}
              style={{
                position: 'relative',
                display: 'inline-block',
                overflow: zoomed ? 'visible' : 'hidden',
                maxWidth: '90vw',
                borderRadius: zoomed ? 0 : 8,
                cursor,
                userSelect: 'none',
                transition: `border-radius ${ZOOM_EASE}`,
              }}
            >
              <img
                ref={imgRef}
                src={activeSrc}
                alt={slide.label}
                draggable={false}
                style={{
                  display: 'block',
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  transformOrigin: 'center center',
                  willChange: 'transform',
                  pointerEvents: 'none',
                }}
              />
              {hasStates && (
                <StateSwitcher
                  states={slide.states!}
                  active={activeStateIdx}
                  onChange={i => setActiveStateIndices(prev => ({ ...prev, [state.index]: i }))}
                />
              )}
            </div>
          ) : (
            <div style={{
              width: 800, maxWidth: '80vw',
              height: 450, maxHeight: '72vh',
              background: '#2a2a2a',
              borderRadius: 8,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', gap: 12,
            }}>
              <svg width={32} height={32} fill="none" viewBox="0 0 24 24" stroke="#555" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909" />
              </svg>
              <span style={{ fontSize: 'var(--font-size-small)', color: '#666' }}>{slide.label}</span>
            </div>
          )}

          {/* Next */}
          {hasMultiple && (
            <button
              className="cs-lb-nav"
              onClick={() => onNavigate(1)}
              disabled={state.index === state.slides.length - 1}
              style={{
                position: 'absolute', right: -60, top: '50%', transform: 'translateY(-50%)',
                width: 44, height: 44, borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: state.index === state.slides.length - 1 ? 'default' : 'pointer',
                opacity: zoomed ? 0 : state.index === state.slides.length - 1 ? 0.2 : 1,
                pointerEvents: zoomed ? 'none' : 'auto',
                transition: 'background 0.15s ease, opacity 0.25s ease',
              }}
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Caption — fades out on zoom, display: none after transition */}
        <div
          ref={captionRef}
          style={{
            marginTop: 20,
            textAlign: 'center',
            color: 'white',
            opacity: 1,
            transform: 'translateY(0)',
          }}
        >
          <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', marginBottom: 4 }}>{slide.title}</div>
          <div style={{ fontSize: 'var(--font-size-nav)', color: 'rgba(255,255,255,0.55)', maxWidth: 560, lineHeight: 'var(--line-height-body)' }}>{slide.body}</div>
          {hasMultiple && (
            <div style={{ fontSize: 'var(--font-size-label)', color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>
              {state.index + 1} of {state.slides.length}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
