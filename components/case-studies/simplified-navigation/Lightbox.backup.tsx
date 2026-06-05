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

const ZOOM_SCALE   = 1.4;
const DRAG_THRESHOLD = 3;

function clampTranslate(
  x: number, y: number,
  img: HTMLImageElement | null,
  stage: HTMLElement | null,
): { x: number; y: number } {
  if (!img || !stage) return { x, y };
  const maxX = Math.max(0, (img.offsetWidth  * ZOOM_SCALE - stage.clientWidth)  / 2);
  const maxY = Math.max(0, (img.offsetHeight * ZOOM_SCALE - stage.clientHeight) / 2);
  return {
    x: Math.min(maxX, Math.max(-maxX, x)),
    y: Math.min(maxY, Math.max(-maxY, y)),
  };
}

const ZOOM_TRANSITION = 'transform 0.32s cubic-bezier(0.4, 0, 0.2, 1)';

function applyImgTransform(
  img: HTMLImageElement | null,
  x: number,
  y: number,
  scale: number,
  transition = 'none',
) {
  if (!img) return;
  img.style.transition = transition;
  img.style.transform  = `translate(${x}px, ${y}px) scale(${scale})`;
}

export default function Lightbox({
  state,
  onClose,
  onNavigate,
}: {
  state: LightboxState;
  onClose: () => void;
  onNavigate: (dir: number) => void;
}) {
  // ── Existing: per-slide state indices ───────────────────────────────────────
  const [activeStateIndices, setActiveStateIndices] = useState<Record<number, number>>({});

  useEffect(() => {
    if (state.open) setActiveStateIndices(state.stateIndices);
  }, [state.open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Zoom / pan state ─────────────────────────────────────────────────────────
  const [zoomed,            setZoomed]            = useState(false);
  const [containerExpanded, setContainerExpanded] = useState(false);
  const [isDragging,        setIsDragging]        = useState(false);
  const [badgeLabel,        setBadgeLabel]        = useState<string | null>(null);

  // Refs — stable values accessible inside effects/handlers without stale closures
  // txRef/tyRef are the source of truth for position; transform is applied directly to the DOM
  const imgRef      = useRef<HTMLImageElement>(null);
  const stageRef    = useRef<HTMLDivElement>(null);
  const badgeTimer  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const unzoomTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const zoomedRef   = useRef(false);
  const txRef       = useRef(0);
  const tyRef       = useRef(0);
  const dragRef     = useRef<{
    startX: number; startY: number;
    tx: number; ty: number;
    moved: boolean;
  } | null>(null);

  // Keep zoomedRef current on every render
  zoomedRef.current = zoomed;

  // ── Helpers ──────────────────────────────────────────────────────────────────

  const showBadge = useCallback((label: string) => {
    setBadgeLabel(label);
    if (badgeTimer.current) clearTimeout(badgeTimer.current);
    badgeTimer.current = setTimeout(() => setBadgeLabel(null), 1800);
  }, []);

  const doZoomOut = useCallback(() => {
    txRef.current = 0;
    tyRef.current = 0;
    applyImgTransform(imgRef.current, 0, 0, 1, ZOOM_TRANSITION);
    setZoomed(false);
    setIsDragging(false);
    dragRef.current = null;
    if (unzoomTimer.current) clearTimeout(unzoomTimer.current);
    unzoomTimer.current = setTimeout(() => setContainerExpanded(false), 320);
  }, []);

  const resetZoomImmediate = useCallback(() => {
    txRef.current = 0;
    tyRef.current = 0;
    applyImgTransform(imgRef.current, 0, 0, 1);
    setZoomed(false);
    setContainerExpanded(false);
    setIsDragging(false);
    dragRef.current = null;
    if (unzoomTimer.current) clearTimeout(unzoomTimer.current);
  }, []);

  // ── Reset on slide change / close ────────────────────────────────────────────

  useEffect(() => { resetZoomImmediate(); }, [state.index]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { if (!state.open) resetZoomImmediate(); }, [state.open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Keyboard ─────────────────────────────────────────────────────────────────

  useEffect(() => {
    if (!state.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (zoomedRef.current) { doZoomOut(); showBadge('Fit'); }
        else onClose();
      }
      if (e.key === 'ArrowRight') onNavigate(1);
      if (e.key === 'ArrowLeft')  onNavigate(-1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = ''; };
  }, [state.open, onClose, onNavigate, doZoomOut, showBadge]);

  // ── Wheel / trackpad pan (non-passive, direct DOM write) ─────────────────────

  useEffect(() => {
    if (!state.open) return;
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (!zoomedRef.current) return;
      e.preventDefault();
      const clamped = clampTranslate(
        txRef.current - e.deltaX,
        tyRef.current - e.deltaY,
        imgRef.current,
        stageRef.current,
      );
      txRef.current = clamped.x;
      tyRef.current = clamped.y;
      applyImgTransform(imgRef.current, clamped.x, clamped.y, ZOOM_SCALE);
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [state.open]);

  // ── Mouse drag handlers ───────────────────────────────────────────────────────

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!zoomedRef.current) return;
    e.preventDefault();
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: txRef.current, ty: tyRef.current, moved: false };
    setIsDragging(true);
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!dragRef.current || !zoomedRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    if (!dragRef.current.moved && dx * dx + dy * dy < DRAG_THRESHOLD * DRAG_THRESHOLD) return;
    dragRef.current.moved = true;
    const clamped = clampTranslate(
      dragRef.current.tx + dx,
      dragRef.current.ty + dy,
      imgRef.current,
      stageRef.current,
    );
    txRef.current = clamped.x;
    tyRef.current = clamped.y;
    applyImgTransform(imgRef.current, clamped.x, clamped.y, ZOOM_SCALE);
  }, []);

  const handleMouseUp = useCallback(() => {
    // If it wasn't a drag, clear dragRef so click handler runs normally
    if (dragRef.current && !dragRef.current.moved) dragRef.current = null;
    setIsDragging(false);
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (dragRef.current && !dragRef.current.moved) dragRef.current = null;
    setIsDragging(false);
  }, []);

  // ── Click: zoom in / zoom out ─────────────────────────────────────────────────

  const handleClick = useCallback((e: React.MouseEvent) => {
    // Swallow clicks that were actually drags
    if (dragRef.current?.moved) { dragRef.current = null; return; }
    dragRef.current = null;

    if (!zoomedRef.current) {
      // Zoom in — translate so the clicked point stays centred
      const img = imgRef.current;
      if (!img) return;
      const rect = img.getBoundingClientRect();
      const clickX = e.clientX - (rect.left + rect.width  / 2);
      const clickY = e.clientY - (rect.top  + rect.height / 2);
      const clamped = clampTranslate(
        -clickX * (ZOOM_SCALE - 1),
        -clickY * (ZOOM_SCALE - 1),
        imgRef.current,
        stageRef.current,
      );
      txRef.current = clamped.x;
      tyRef.current = clamped.y;
      applyImgTransform(imgRef.current, clamped.x, clamped.y, ZOOM_SCALE, ZOOM_TRANSITION);
      setZoomed(true);
      setContainerExpanded(true);
      showBadge('Zoom in · click to reset');
    } else {
      doZoomOut();
      showBadge('Fit');
    }
  }, [showBadge, doZoomOut]);

  // ── Render ───────────────────────────────────────────────────────────────────

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
          color: 'rgba(255,255,255,0.85)', fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)',
          padding: '5px 14px', borderRadius: 20,
          pointerEvents: 'none', zIndex: 10, whiteSpace: 'nowrap',
          animation: 'cs-lb-badge-out 1800ms ease forwards',
        }}>
          {badgeLabel}
        </div>
      )}

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        maxWidth: containerExpanded ? '100vw' : '90vw',
        maxHeight: containerExpanded ? '100vh' : '90vh',
        width: '100%',
      }}>
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
                opacity: state.index === 0 ? 0.2 : 1,
                transition: 'background 0.15s ease',
              }}
            >
              <ChevronLeft size={18} />
            </button>
          )}

          {/* Image (or placeholder), with state switcher overlaid */}
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
                overflow: 'hidden',
                maxWidth: containerExpanded ? '100vw' : '90vw',
                maxHeight: containerExpanded ? '100vh' : undefined,
                borderRadius: containerExpanded ? 0 : 8,
                cursor,
                userSelect: 'none',
              }}
            >
              <img
                ref={imgRef}
                src={activeSrc}
                alt={slide.label}
                draggable={false}
                style={{
                  maxWidth: '90vw',
                  maxHeight: '80vh',
                  display: 'block',
                  objectFit: 'contain',
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
                opacity: state.index === state.slides.length - 1 ? 0.2 : 1,
                transition: 'background 0.15s ease',
              }}
            >
              <ChevronRight size={18} />
            </button>
          )}
        </div>

        {/* Caption — invisible while zoomed to preserve space */}
        <div style={{ marginTop: 20, textAlign: 'center', color: 'white', visibility: zoomed ? 'hidden' : 'visible', minHeight: 88 }}>
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
