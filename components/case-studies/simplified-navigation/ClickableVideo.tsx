'use client';

import { useRef } from 'react';
import PhotoSwipe from 'photoswipe';
import 'photoswipe/style.css';

const SVG_CLOSE = `<svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>`;
const ICON_STYLE = 'display:flex;align-items:center;justify-content:center;position:absolute;top:0;left:0;right:0;bottom:0;pointer-events:none;';

function ZoomIcon() {
  return (
    <svg width={13} height={13} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607zM10.5 7.5v6m3-3h-6" />
    </svg>
  );
}

export default function ClickableVideo({
  src,
  label,
  onClick,
}: {
  src: string;
  label: string;
  onClick?: () => void;
}) {
  const pswpRef = useRef<InstanceType<typeof PhotoSwipe> | null>(null);

  const handleClick = () => {
    if (onClick) { onClick(); return; }
    if (pswpRef.current) return;

    const pswp = new PhotoSwipe({
      dataSource: [{ type: 'video', src, width: 1920, height: 1080 }],
      index: 0,
      bgOpacity: 0.88,
      bgClickAction: 'close',
      loop: false,
    });

    pswp.on('contentLoad', (e) => {
      if (e.content.type !== 'video') return;
      e.preventDefault();

      const video = document.createElement('video');
      video.src = e.content.data.src as string;
      video.autoplay = true;
      video.loop = true;
      video.muted = true;
      video.playsInline = true;
      video.style.cssText = 'width:100%;height:100%;object-fit:contain;display:block;';
      e.content.element = video as unknown as HTMLImageElement;
    });

    pswp.on('close', () => { pswpRef.current = null; });

    pswp.init();
    pswpRef.current = pswp;

    if (pswp.element) {
      const closeBtn = pswp.element.querySelector('.pswp__button--close');
      if (closeBtn) {
        const span = document.createElement('span');
        span.style.cssText = ICON_STYLE;
        span.innerHTML = SVG_CLOSE;
        closeBtn.appendChild(span);
      }
      // Zoom is not meaningful for video — hide the button
      const zoomBtn = pswp.element.querySelector<HTMLElement>('.pswp__button--zoom');
      zoomBtn?.style.setProperty('display', 'none', 'important');
    }
  };

  return (
    <div
      className="cs-img-wrap"
      onClick={handleClick}
      style={{ background: 'var(--color-surface)', clipPath: 'inset(1px 1px 0 0)' }}
      aria-label={label}
    >
      <video autoPlay loop muted playsInline style={{ width: '100%', display: 'block' }}>
        <source src={src} type="video/mp4" />
      </video>
      <div className="cs-zoom-hint">
        <ZoomIcon />
        View full size
      </div>
    </div>
  );
}
