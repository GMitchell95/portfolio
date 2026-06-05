'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';
import type { LightboxState } from './types';
import StateSwitcher from './StateSwitcher';

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
    });

    pswp.init();
    pswpRef.current = pswp;
    if (pswp.element) setPswpEl(pswp.element);

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
