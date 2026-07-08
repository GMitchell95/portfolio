'use client';

import { useState, useRef, useCallback } from 'react';
import type { Slide } from './types';
import ClickableImage from './ClickableImage';
import StateSwitcher from './StateSwitcher';
import { ChevronLeft, ChevronRight } from './icons';

export default function IterationSwitcher({
  slides,
  onOpenLightbox,
  marginTop = 40,
}: {
  slides: Slide[];
  onOpenLightbox: (slides: Slide[], index: number, stateIndices?: Record<number, number>) => void;
  marginTop?: number;
}) {
  const [current, setCurrent] = useState(0);
  const [displayTitle, setDisplayTitle] = useState(slides[0].title);
  // Per-slide active state index; keyed by slide index
  const [stateIndices, setStateIndices] = useState<Record<number, number>>({});
  const total = slides.length;

  const titleRef = useRef<HTMLSpanElement>(null);
  const imgWrapRef = useRef<HTMLDivElement>(null);
  const titleTimer1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titleTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgTimer1 = useRef<ReturnType<typeof setTimeout> | null>(null);
  const imgTimer2 = useRef<ReturnType<typeof setTimeout> | null>(null);

  const animateTitle = useCallback((newText: string, dir: number) => {
    const el = titleRef.current;
    if (!el) return;
    if (titleTimer1.current) clearTimeout(titleTimer1.current);
    if (titleTimer2.current) clearTimeout(titleTimer2.current);

    el.style.setProperty('--exit-x', dir > 0 ? '-6px' : '6px');
    el.style.setProperty('--enter-x', dir > 0 ? '6px' : '-6px');
    el.classList.remove('sw-title-exiting', 'sw-title-entering');
    void el.offsetHeight;
    el.classList.add('sw-title-exiting');

    titleTimer1.current = setTimeout(() => {
      el.classList.remove('sw-title-exiting');
      setDisplayTitle(newText);
      // rAF lets React commit the new text before we trigger the enter animation
      requestAnimationFrame(() => {
        void el.offsetHeight;
        el.classList.add('sw-title-entering');
        titleTimer2.current = setTimeout(() => el.classList.remove('sw-title-entering'), 150);
      });
    }, 80);
  }, []);

  const animateImg = useCallback((dir: number) => {
    const el = imgWrapRef.current;
    if (!el) return;
    if (imgTimer1.current) clearTimeout(imgTimer1.current);
    if (imgTimer2.current) clearTimeout(imgTimer2.current);

    el.style.setProperty('--exit-x', dir > 0 ? '-24px' : '24px');
    el.style.setProperty('--enter-x', dir > 0 ? '24px' : '-24px');
    el.classList.remove('sw-img-exiting', 'sw-img-entering');
    void el.offsetHeight;
    el.classList.add('sw-img-exiting');

    imgTimer1.current = setTimeout(() => {
      el.classList.remove('sw-img-exiting');
      void el.offsetHeight;
      el.classList.add('sw-img-entering');
      imgTimer2.current = setTimeout(() => el.classList.remove('sw-img-entering'), 180);
    }, 120);
  }, []);

  // Animations are called directly (not inside the state updater) so they never
  // run as side effects during React's render phase.
  const navigate = useCallback((dir: number) => {
    const next = Math.max(0, Math.min(total - 1, current + dir));
    if (next === current) return;
    animateTitle(slides[next].title, dir);
    animateImg(dir);
    setCurrent(next);
  }, [current, total, slides, animateTitle, animateImg]);

  const goTo = useCallback((i: number) => {
    if (i === current) return;
    const dir = i > current ? 1 : -1;
    animateTitle(slides[i].title, dir);
    animateImg(dir);
    setCurrent(i);
  }, [current, slides, animateTitle, animateImg]);

  return (
    <div style={{ marginTop }}>
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
        <span
          ref={titleRef}
          style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', display: 'inline-block', willChange: 'transform, opacity' }}
        >
          {displayTitle}
        </span>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* Dots */}
          <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                style={{
                  width: i === current ? 16 : 5,
                  height: 5,
                  borderRadius: i === current ? 3 : '50%',
                  background: i === current ? 'var(--color-primary)' : 'var(--color-border-strong)',
                  border: 'none',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'width 0.3s cubic-bezier(0.4,0,0.2,1), border-radius 0.3s cubic-bezier(0.4,0,0.2,1), background 0.3s ease',
                  willChange: 'width',
                }}
              />
            ))}
          </div>

          {/* Counter */}
          <span style={{
            fontSize: 'var(--font-size-nav)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-muted)',
            fontVariantNumeric: 'tabular-nums', minWidth: 36, textAlign: 'center',
          }}>
            {current + 1} of {total}
          </span>

          {/* Prev */}
          <button
            className="cs-sw-btn"
            onClick={() => navigate(-1)}
            disabled={current === 0}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: current === 0 ? 'default' : 'pointer',
              opacity: current === 0 ? 0.3 : 1,
              color: 'var(--color-secondary)',
              flexShrink: 0,
              transition: 'all 0.15s ease-out',
            }}
          >
            <ChevronLeft />
          </button>

          {/* Next */}
          <button
            className="cs-sw-btn"
            onClick={() => navigate(1)}
            disabled={current === total - 1}
            style={{
              width: 32, height: 32, borderRadius: 8,
              border: '1px solid var(--color-border)',
              background: 'var(--color-white)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: current === total - 1 ? 'default' : 'pointer',
              opacity: current === total - 1 ? 0.3 : 1,
              color: 'var(--color-secondary)',
              flexShrink: 0,
              transition: 'all 0.15s ease-out',
            }}
          >
            <ChevronRight />
          </button>
        </div>
      </div>

      {/* Image */}
      <div ref={imgWrapRef} style={{ willChange: 'transform, opacity' }}>
        {(() => {
          const slide = slides[current];
          const hasStates = slide.states && slide.states.length > 1;
          const activeStateIdx = stateIndices[current] ?? 0;
          const activeSrc = hasStates ? slide.states![activeStateIdx].src : slide.src;
          return (
            <div style={{ position: 'relative' }}>
              <ClickableImage
                label={slide.label}
                src={activeSrc}
                onClick={() => onOpenLightbox(slides, current, stateIndices)}
              />
              {hasStates && (
                <StateSwitcher
                  states={slide.states!}
                  active={activeStateIdx}
                  onChange={i => setStateIndices(prev => ({ ...prev, [current]: i }))}
                />
              )}
            </div>
          );
        })()}
      </div>

      {/* Caption */}
      <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-muted)', lineHeight: 'var(--line-height-body)', marginTop: 8 }}>
        {slides[current].body}
      </p>
    </div>
  );
}
