'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';

// ── Types ───────────────────────────────────────────────────────────────────

interface Slide {
  title: string;
  body: string;
  label: string;
  src?: string;
}

interface LightboxState {
  open: boolean;
  slides: Slide[];
  index: number;
}

// ── SVG icons ───────────────────────────────────────────────────────────────

function ChevronLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

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

function CloseIcon() {
  return (
    <svg width={18} height={18} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

// ── Global styles ────────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  /* Reset background set by root layout */
  body { background: white !important; }

  /* Keyframes */
  @keyframes titleExit {
    from { opacity: 1; filter: blur(0px); transform: translateX(0); }
    to   { opacity: 0; filter: blur(2px); transform: translateX(var(--exit-x)); }
  }
  @keyframes titleEnter {
    from { opacity: 0; filter: blur(2px); transform: translateX(var(--enter-x)); }
    to   { opacity: 1; filter: blur(0px); transform: translateX(0); }
  }
  @keyframes imgExit {
    from { opacity: 1; filter: blur(0px); transform: translateX(0); }
    to   { opacity: 0; filter: blur(3px); transform: translateX(var(--exit-x)); }
  }
  @keyframes imgEnter {
    from { opacity: 0; filter: blur(3px); transform: translateX(var(--enter-x)); }
    to   { opacity: 1; filter: blur(0px); transform: translateX(0); }
  }
  @keyframes lbFadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }

  .sw-title-exiting  { animation: titleExit  80ms linear forwards; }
  .sw-title-entering { animation: titleEnter 150ms linear forwards; }
  .sw-img-exiting    { animation: imgExit  120ms linear forwards; }
  .sw-img-entering   { animation: imgEnter 180ms linear forwards; }

  /* Top header */
  .cs-header {
    position: fixed;
    top: 0; left: 0; right: 0;
    z-index: 200;
    height: 56px;
    background: rgba(255,255,255,0.92);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid #E4E4E7;
    display: flex;
    align-items: center;
    transform: translateY(-100%);
    transition: transform 0.25s cubic-bezier(0.4,0,0.2,1);
  }
  .cs-header.cs-header--visible {
    transform: translateY(0);
  }
  @media (max-width: 1199px) {
    .cs-header {
      transform: translateY(0) !important;
    }
  }

  /* Header inner */
  .cs-header-inner {
    max-width: 680px;
    width: 100%;
    margin: 0 auto;
    padding: 0 40px;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  @media (max-width: 1199px) {
    .cs-header-inner {
      justify-content: flex-start;
    }
  }

  /* Vertical divider between Back and title — narrow only */
  .cs-header-divider {
    display: none;
    width: 1px;
    align-self: stretch;
    background: #E4E4E7;
    margin: 0 16px;
    flex-shrink: 0;
  }
  @media (max-width: 1199px) {
    .cs-header-divider { display: block; }
  }

  /* Back button visible only on narrow */
  .cs-header-back {
    display: none;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #71717A;
    text-decoration: none;
    transition: color 0.15s ease-out;
  }
  .cs-header-back:hover { color: #27272A; }
  @media (max-width: 1199px) {
    .cs-header-back { display: inline-flex; }
  }

  /* Narrow spacer */
  .cs-header-spacer {
    display: none;
    height: 56px;
  }
  @media (max-width: 1199px) {
    .cs-header-spacer { display: block; }
  }

  /* Sidebar */
  .cs-sidebar {
    display: none;
  }
  @media (min-width: 1200px) {
    .cs-sidebar {
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 80px;
      left: max(24px, calc(50% - 340px - 180px));
      width: 160px;
      z-index: 100;
    }
  }

  /* Sidebar back link */
  .cs-sidebar-back {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 500;
    color: #71717A;
    margin-bottom: 24px;
    text-decoration: none;
    transition: color 0.15s ease-out;
  }
  .cs-sidebar-back:hover { color: #27272A; }

  /* Sidebar nav */
  .cs-sidebar-nav {
    display: flex;
    flex-direction: column;
    border-left: 1px solid #E4E4E7;
  }

  /* Sidebar link */
  .cs-nav-link {
    font-size: 13px;
    font-weight: 400;
    color: #A1A1AA;
    padding: 8px 0 8px 16px;
    cursor: pointer;
    border: none;
    border-left: 2px solid transparent;
    margin-left: -1px;
    background: none;
    text-align: left;
    line-height: 1.4;
    transition: color 0.15s ease, border-color 0.15s ease;
  }
  .cs-nav-link:hover { color: #3F3F46; }
  .cs-nav-link.cs-nav-link--active {
    color: #27272A;
    font-weight: 500;
    border-left-color: #27272A;
  }

  /* Zoom hint on image hover */
  .cs-img-wrap { position: relative; cursor: zoom-in; border-radius: 8px; overflow: hidden; display: block; }
  .cs-img-wrap:hover .cs-zoom-hint { opacity: 1; }
  .cs-zoom-hint {
    position: absolute;
    bottom: 12px; right: 12px;
    background: rgba(0,0,0,0.55);
    color: white;
    font-size: 12px;
    font-weight: 500;
    padding: 5px 10px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    gap: 6px;
    opacity: 0;
    transition: opacity 0.15s ease;
    pointer-events: none;
    backdrop-filter: blur(4px);
  }

  /* Switcher button hover */
  .cs-sw-btn:hover:not(:disabled) {
    background: #FAFAFA !important;
    border-color: #D4D4D8 !important;
  }

  /* Footer button hover */
  .cs-btn-outline:hover:not(:disabled) {
    background: #FAFAFA !important;
    border-color: #D4D4D8 !important;
  }

  /* Sidebar back hover handled by class above */

  /* Lightbox */
  .cs-lightbox {
    position: fixed;
    inset: 0;
    z-index: 999;
    background: rgba(0,0,0,0.88);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    animation: lbFadeIn 0.2s ease-out;
  }
  .cs-lb-nav:hover:not(:disabled) {
    background: rgba(255,255,255,0.16) !important;
  }
  .cs-lb-close:hover {
    background: rgba(255,255,255,0.16) !important;
  }
`;

// ── ImagePlaceholder ─────────────────────────────────────────────────────────

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

// ── ClickableImage ───────────────────────────────────────────────────────────

function ClickableImage({
  label,
  src,
  tall = false,
  constrained = false,
  onClick,
}: {
  label: string;
  src?: string;
  tall?: boolean;
  constrained?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className="cs-img-wrap"
      onClick={onClick}
      style={{ maxHeight: constrained ? 480 : undefined }}
    >
      {src ? (
        <div style={{ position: 'relative', width: '100%', aspectRatio: '1760/1060', borderRadius: 8, overflow: 'hidden' }}>
          <Image src={src} fill style={{ objectFit: 'cover' }} alt={label} />
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

// ── IterationSwitcher ────────────────────────────────────────────────────────

function IterationSwitcher({
  slides,
  onOpenLightbox,
}: {
  slides: Slide[];
  onOpenLightbox: (slides: Slide[], index: number) => void;
}) {
  const [current, setCurrent] = useState(0);
  const [displayTitle, setDisplayTitle] = useState(slides[0].title);
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
    <div style={{ marginTop: 40 }}>
      {/* Meta row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 12 }}>
        <span
          ref={titleRef}
          style={{ fontSize: 15, fontWeight: 600, color: '#27272A', display: 'inline-block', willChange: 'transform, opacity' }}
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
                  background: i === current ? '#27272A' : '#D4D4D8',
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
            fontSize: 13, fontWeight: 500, color: '#A1A1AA',
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
              border: '1px solid #E4E4E7',
              background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: current === 0 ? 'default' : 'pointer',
              opacity: current === 0 ? 0.3 : 1,
              color: '#3F3F46',
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
              border: '1px solid #E4E4E7',
              background: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: current === total - 1 ? 'default' : 'pointer',
              opacity: current === total - 1 ? 0.3 : 1,
              color: '#3F3F46',
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
        <ClickableImage
          label={slides[current].label}
          src={slides[current].src}
          onClick={() => onOpenLightbox(slides, current)}
        />
      </div>

      {/* Caption */}
      <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.65, marginTop: 12 }}>
        {slides[current].body}
      </p>
    </div>
  );
}

// ── Lightbox ─────────────────────────────────────────────────────────────────

function Lightbox({
  state,
  onClose,
  onNavigate,
}: {
  state: LightboxState;
  onClose: () => void;
  onNavigate: (dir: number) => void;
}) {
  useEffect(() => {
    if (!state.open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onNavigate(1);
      if (e.key === 'ArrowLeft') onNavigate(-1);
    };
    document.addEventListener('keydown', handler);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handler);
      document.body.style.overflow = '';
    };
  }, [state.open, onClose, onNavigate]);

  if (!state.open) return null;

  const slide = state.slides[state.index];
  const hasMultiple = state.slides.length > 1;

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
        }}
      >
        <CloseIcon />
      </button>

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        maxWidth: '90vw', maxHeight: '90vh', width: '100%',
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

          {/* Image or placeholder */}
          {slide.src ? (
            <img
              src={slide.src}
              alt={slide.label}
              style={{
                maxWidth: '80vw',
                maxHeight: '72vh',
                borderRadius: 8,
                display: 'block',
                objectFit: 'contain',
              }}
            />
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
              <span style={{ fontSize: 14, color: '#666' }}>{slide.label}</span>
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

        {/* Caption */}
        <div style={{ marginTop: 20, textAlign: 'center', color: 'white' }}>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>{slide.title}</div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', maxWidth: 560, lineHeight: 1.6 }}>{slide.body}</div>
          {hasMultiple && (
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', marginTop: 12 }}>
              {state.index + 1} of {state.slides.length}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Slide data ───────────────────────────────────────────────────────────────

const EARLY_SLIDES: Slide[] = [
  {
    title: 'Simple dropdown list',
    label: 'Iteration 1',
    src: '/images/case-studies/simplified-navigation/Iteration-top-nav.png',
    body: 'The starting point — a basic vertical list. Familiar and low-friction, but quickly ran into problems once category lists grew longer than a dozen items.',
  },
  {
    title: 'Flyout panel — left anchored',
    label: 'Iteration 2',
    src: '/images/case-studies/simplified-navigation/iteration-breadcrumb.png',
    body: 'Hovering a category revealed sub-items in a panel anchored to the left. Felt clunky on wide viewports and created awkward mouse travel paths.',
  },
  {
    title: 'Tab-based mega panel',
    label: 'Iteration 3',
    body: 'A full-width panel with top-level tabs. Showed a lot of content at once but the visual weight created cognitive overload in early feedback sessions.',
  },
  {
    title: 'Icon-led category grid',
    label: 'Iteration 4',
    body: 'Pairing category names with icons improved recognition speed, but maintaining a consistent icon style across 50+ categories added unsustainable design overhead.',
  },
  {
    title: 'Sidebar drawer',
    label: 'Iteration 5',
    body: "A slide-in drawer from the left. Felt too mobile-native for desktop and broke the user's spatial relationship with the page they were browsing.",
  },
];

const REFINED_SLIDES: Slide[] = [
  {
    title: 'Two-column panel with featured item',
    label: 'Concept A',
    body: 'Categories left, sub-items right, with a featured slot at the bottom. Good hierarchy but required editorial maintenance to keep the featured area relevant.',
  },
  {
    title: 'Three-column grid',
    label: 'Concept B',
    body: 'All top-level categories shown simultaneously with sub-items visible beneath each. More content at a glance but harder to establish clear visual hierarchy between levels.',
  },
  {
    title: 'Hover-activated side panel',
    label: 'Concept C',
    body: 'Category list on the left activates a rich panel on hover. This became the chosen direction — good balance between discoverability and control, and easy to extend over time.',
  },
];

const SECTIONS = [
  { id: 'section-brief',        label: 'The brief' },
  { id: 'section-explorations', label: 'Explorations' },
  { id: 'section-refined',      label: 'Refined concept' },
  { id: 'section-conclusion',   label: 'Conclusion' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SimplifiedNavigationPage() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('section-brief');
  const [lightbox, setLightbox] = useState<LightboxState>({ open: false, slides: [], index: 0 });
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => {
      if (heroTitleRef.current) {
        setHeaderVisible(heroTitleRef.current.getBoundingClientRect().bottom < 0);
      }
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100) {
        setActiveSection(SECTIONS[SECTIONS.length - 1].id);
        return;
      }
      const scrollY = window.scrollY + 120;
      let current = SECTIONS[0].id;
      SECTIONS.forEach(s => {
        const el = document.getElementById(s.id);
        if (el && el.offsetTop <= scrollY) current = s.id;
      });
      setActiveSection(current);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 56, behavior: 'smooth' });
  }, []);

  const openLightbox = useCallback((slides: Slide[], index: number) => {
    setLightbox({ open: true, slides, index });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(prev => ({ ...prev, open: false })), []);

  const navigateLightbox = useCallback((dir: number) => {
    setLightbox(prev => ({
      ...prev,
      index: Math.max(0, Math.min(prev.slides.length - 1, prev.index + dir)),
    }));
  }, []);

  const openSingleImage = useCallback((title: string, body: string, label: string) => {
    setLightbox({ open: true, slides: [{ title, body, label }], index: 0 });
  }, []);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* ── TOP HEADER ────────────────────────────────────────────────── */}
      <header className={`cs-header${headerVisible ? ' cs-header--visible' : ''}`}>
        <div className="cs-header-inner">
          <a href="/" className="cs-header-back">
            <ChevronLeft size={14} />
            Back
          </a>
          <span className="cs-header-divider" />
          <span style={{ fontSize: 15, fontWeight: 500, color: '#27272A' }}>Simplified navigation</span>
        </div>
      </header>

      <div className="cs-header-spacer" />

      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      <nav className="cs-sidebar">
        <a href="/" className="cs-sidebar-back">
          <ChevronLeft size={14} />
          Back
        </a>
        <div className="cs-sidebar-nav">
          {SECTIONS.map(s => (
            <button
              key={s.id}
              className={`cs-nav-link${activeSection === s.id ? ' cs-nav-link--active' : ''}`}
              onClick={() => scrollToSection(s.id)}
            >
              {s.label}
            </button>
          ))}
        </div>
      </nav>

      {/* ── PAGE CONTENT ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 40px', background: 'white' }}>

        {/* HERO */}
        <section style={{ paddingTop: 80 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#4443B4', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>
            Case study
          </div>
          <h1
            ref={heroTitleRef}
            style={{ fontSize: 36, fontWeight: 600, color: '#18181B', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 24 }}
          >
            Simplified navigation
          </h1>
          <p style={{ fontSize: 15, color: '#71717A', lineHeight: 1.65, marginBottom: 40 }}>
            Redesigning the navigation for a complex procurement sourcing platform — reducing a seven-step flow down to three, without losing access to any of the functionality underneath.
          </p>
          <div style={{ display: 'flex', gap: 40, paddingTop: 40, borderTop: '1px solid rgba(228,228,231,0.5)' }}>
            {[
              { label: 'Role', value: 'Product designer' },
              { label: 'Timeline', value: '1–2 weeks' },
              { label: 'Date', value: 'February 2026' },
            ].map(item => (
              <div key={item.label} style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#27272A', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 15, fontWeight: 400, color: '#71717A' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* THE BRIEF */}
        <section id="section-brief" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>The brief</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            The navigation for Keelvar&#39;s sourcing platform was overwhelming users. The existing side nav used an accordion to reveal pages across seven steps — and when users created a new event, there was no clear starting point or sense of what to do next. We needed to simplify the navigation and give users a clear path forward at every stage. We had roughly a week to get from problem to a concept ready for build.
          </p>
        </section>

        {/* EXPLORATIONS */}
        <section id="section-explorations" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>Explorations</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            Before exploring concepts, I mapped the existing nav from an IA perspective — identifying which pages could be logically grouped or consolidated across the seven steps.
          </p>

          {/* Analysis block */}
          <div style={{ marginTop: 40, marginBottom: 64 }}>
            <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.7, marginBottom: 32 }}>
              The original seven-step flow broken down by event stage — showing where pages could be consolidated without losing functionality.
            </p>
            <ClickableImage
              label="Page break up diagram"
              tall
              constrained
              onClick={() => openSingleImage(
                'Current state analysis',
                'The original seven-step nav broken down by event stage and steps, showing where consolidation was possible.',
                'Page break up diagram',
              )}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.7 }}>
              Early ideas exploring different structural approaches before bringing the wider team in.
            </p>
          </div>

          <IterationSwitcher slides={EARLY_SLIDES} onOpenLightbox={openLightbox} />
        </section>

        {/* REFINED CONCEPT */}
        <section id="section-refined" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>Refined concept</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            We ran a workshop with the PM, three engineers, and myself — everyone contributed concepts, one engineer built a rough coded version of his idea. Using Figma Make, we prototyped collaboratively, narrowed to one or two directions, then I refined further and brought it back for a follow-up review.
          </p>
          <IterationSwitcher slides={REFINED_SLIDES} onOpenLightbox={openLightbox} />
        </section>

        {/* CONCLUSION */}
        <section id="section-conclusion" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>Conclusion</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            A few of the more significant choices made during the project — and the reasoning behind them.
          </p>

          <div style={{ marginTop: 40, display: 'flex', flexDirection: 'column', gap: 32 }}>
            {[
              {
                tag: 'Kept',
                tagStyle: { background: '#DCFCE7', color: '#16A34A' },
                title: 'Three-step structure',
                body: 'The IA mapping showed many existing steps were granular sub-tasks that could sit under broader categories — the three-step structure was validated early and held firm throughout.',
              },
              {
                tag: 'Added',
                tagStyle: { background: '#DBEAFE', color: '#1D4ED8' },
                title: 'Quick-access sub-page shortcut',
                body: 'Internal feedback made clear that power users needed a faster way to jump to specific sub-pages. A keyboard-accessible dropdown alongside the three tabs was added, letting users navigate directly to any page without stepping through the hierarchy.',
              },
              {
                tag: 'Constraint',
                tagStyle: { background: '#F3E8FF', color: '#7C3AED' },
                title: 'No external validation before build',
                body: "Time constraints meant we couldn't test with customers before handoff. The plan was to validate with an early MVP of the new v2 platform once it was available.",
              },
              {
                tag: 'Kept',
                tagStyle: { background: '#DCFCE7', color: '#16A34A' },
                title: 'Internal feedback as the primary signal',
                body: 'Feedback from professional services — the team dealing with customers daily — was broadly positive and gave us enough confidence to move forward.',
              },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <span style={{
                  fontSize: 11, fontWeight: 600,
                  letterSpacing: '0.04em', textTransform: 'uppercase' as const,
                  borderRadius: 4, padding: '3px 7px',
                  flexShrink: 0, marginTop: 2,
                  ...item.tagStyle,
                }}>
                  {item.tag}
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#27272A', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 14, color: '#71717A', lineHeight: 1.7 }}>{item.body}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FOOTER */}
        <div style={{
          padding: '48px 0',
          borderTop: '1px solid rgba(228,228,231,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 24,
        }}>
          <span style={{ fontSize: 14, color: '#A1A1AA' }}>Glen Mitchell</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              disabled
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 36, padding: '0 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                background: 'white', color: '#27272A',
                border: '1px solid #E4E4E7',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                opacity: 0.3, cursor: 'default',
              }}
            >
              <ChevronLeft />
              Previous
            </button>
            <button
              className="cs-btn-outline"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 36, padding: '0 16px', borderRadius: 8,
                fontSize: 14, fontWeight: 500,
                background: 'white', color: '#27272A',
                border: '1px solid #E4E4E7',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease-out',
              }}
            >
              Next project
              <ChevronRight />
            </button>
          </div>
        </div>

      </div>

      {/* LIGHTBOX */}
      <Lightbox state={lightbox} onClose={closeLightbox} onNavigate={navigateLightbox} />
    </>
  );
}
