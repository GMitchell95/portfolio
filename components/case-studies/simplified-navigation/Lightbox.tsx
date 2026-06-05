'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';
import type { LightboxState } from './types';
import StateSwitcher from './StateSwitcher';

const SVG_CLOSE = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`;
const SVG_PREV  = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/></svg>`;
const SVG_NEXT  = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/></svg>`;
const SVG_ZOOM_IN  = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M11 8v6M8 11h6"/></svg>`;
const SVG_ZOOM_OUT = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-4.35-4.35M8 11h6"/></svg>`;

const ICON_STYLE = 'align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;display:flex;';

function updateArrowVisibility(el: Element, index: number, total: number) {
  el.querySelector('.pswp__button--arrow--prev')?.classList.toggle('pswp-arrow-hidden', index === 0);
  el.querySelector('.pswp__button--arrow--next')?.classList.toggle('pswp-arrow-hidden', index === total - 1);
}

function injectCustomIcons(el: Element) {
  const addIcon = (selector: string, svg: string) => {
    const btn = el.querySelector(selector);
    if (!btn) return;
    const span = document.createElement('span');
    span.style.cssText = ICON_STYLE;
    span.innerHTML = svg;
    btn.appendChild(span);
  };

  addIcon('.pswp__button--close',      SVG_CLOSE);
  addIcon('.pswp__button--arrow--prev', SVG_PREV);
  addIcon('.pswp__button--arrow--next', SVG_NEXT);

  const zoomBtn = el.querySelector('.pswp__button--zoom');
  if (zoomBtn) {
    const zIn  = document.createElement('span');
    const zOut = document.createElement('span');
    zIn.className  = 'pswp-custom-zoom-in';
    zOut.className = 'pswp-custom-zoom-out';
    zIn.style.cssText  = ICON_STYLE;
    zOut.style.cssText = ICON_STYLE;
    zIn.innerHTML  = SVG_ZOOM_IN;
    zOut.innerHTML = SVG_ZOOM_OUT;
    zoomBtn.appendChild(zIn);
    zoomBtn.appendChild(zOut);
  }
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
  const pswpRef    = useRef<InstanceType<typeof PhotoSwipe> | null>(null);
  // Stable refs so event handlers never close over stale callbacks
  const onCloseRef = useRef(onClose);
  const onNavRef   = useRef(onNavigate);
  onCloseRef.current = onClose;
  onNavRef.current   = onNavigate;

  const [pswpEl,            setPswpEl]            = useState<Element | null>(null);
  const [currIndex,         setCurrIndex]         = useState(0);
  const [activeStateIndices, setActiveStateIndices] = useState<Record<number, number>>({});

  useEffect(() => {
    if (!state.open) {
      pswpRef.current?.destroy();
      pswpRef.current = null;
      setPswpEl(null);
      return;
    }

    const initStates = state.stateIndices;
    setActiveStateIndices(initStates);
    setCurrIndex(state.index);

    const dataSource = state.slides.map((slide, i) => {
      const si  = initStates[i] ?? 0;
      const src = slide.states ? (slide.states[si]?.src ?? '') : (slide.src ?? '');
      return {
        src,
        width:  slide.width  ?? 3520,
        height: slide.height ?? 2120,
        alt:    slide.title,
      };
    });

    const pswp = new PhotoSwipe({
      dataSource,
      index:                state.index,
      bgOpacity:            0.88,
      secondaryZoomLevel:   'fill',
      imageClickAction:     'zoom-or-close',
      bgClickAction:        'close',
      zoomAnimationDuration: 333,
      easing:               'cubic-bezier(.4,0,.22,1)',
      loop:                 false,
    });

    const prevIdx = { current: state.index };

    pswp.on('close',  () => onCloseRef.current());

    pswp.on('change', () => {
      const dir = pswp.currIndex > prevIdx.current ? 1 : -1;
      prevIdx.current = pswp.currIndex;
      setCurrIndex(pswp.currIndex);
      onNavRef.current(dir);
      if (pswp.element) updateArrowVisibility(pswp.element, pswp.currIndex, dataSource.length);
    });

    pswp.init();
    pswpRef.current = pswp;
    if (pswp.element) {
      injectCustomIcons(pswp.element);
      updateArrowVisibility(pswp.element, state.index, dataSource.length);
      setPswpEl(pswp.element);
    }

    return () => {
      pswp.destroy();
      pswpRef.current = null;
      setPswpEl(null);
    };
  }, [state.open]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleStateChange = (slideIndex: number, stateIndex: number) => {
    setActiveStateIndices(prev => ({ ...prev, [slideIndex]: stateIndex }));
    const pswp  = pswpRef.current;
    const slide = state.slides[slideIndex];
    if (!pswp || !slide.states) return;
    const newSrc = slide.states[stateIndex]?.src;
    if (!newSrc) return;
    // Directly update the img element in PhotoSwipe's current slide
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const imgEl = (pswp.currSlide as any)?.content?.element;
    if (imgEl instanceof HTMLImageElement) imgEl.src = newSrc;
  };

  const currentSlide = state.slides[currIndex];
  const hasStates    = !!(currentSlide?.states && currentSlide.states.length > 1);

  if (!pswpEl || !state.open) return null;

  return hasStates ? createPortal(
    <div style={{
      position:  'absolute',
      bottom:    60,
      left:      '50%',
      transform: 'translateX(-50%)',
      zIndex:    10,
    }}>
      <StateSwitcher
        states={currentSlide.states!}
        active={activeStateIndices[currIndex] ?? 0}
        onChange={(i) => handleStateChange(currIndex, i)}
      />
    </div>,
    pswpEl,
  ) : null;
}
