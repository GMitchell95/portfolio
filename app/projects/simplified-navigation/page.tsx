'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import type { Slide, LightboxState } from '@/components/case-studies/simplified-navigation/types';
import { ChevronLeft, ChevronRight } from '@/components/case-studies/simplified-navigation/icons';
import ClickableImage from '@/components/case-studies/simplified-navigation/ClickableImage';
import ClickableVideo from '@/components/case-studies/simplified-navigation/ClickableVideo';
import IterationSwitcher from '@/components/case-studies/simplified-navigation/IterationSwitcher';
import Lightbox from '@/components/case-studies/simplified-navigation/Lightbox';
import MegaMenuTile from '@/components/tiles/MegaMenuTile';
import Button from '@/components/ui/Button';
import BorderBeam from 'border-beam';

// ── Global styles ────────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  /* Reset background set by root layout */
  body { background: white !important; overflow-x: hidden; }

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
  @keyframes cs-fade-in {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes cs-lb-badge-out {
    0%   { opacity: 1; }
    66%  { opacity: 1; }
    100% { opacity: 0; }
  }

  /* Hide scrollbars in zoomed lightbox view */
  .cs-lb-scrollhide { scrollbar-width: none; }
  .cs-lb-scrollhide::-webkit-scrollbar { display: none; }

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
    background: rgba(253,253,252,0.8);
    backdrop-filter: blur(12px);
    border-bottom: 1px solid rgba(0,0,0,0.06);
    display: flex;
    align-items: center;
    transform: translateY(-100%);
    transition: transform 0.24s ease-out;
  }
  .cs-header.cs-header--visible {
    transform: translateY(0);
  }
  @media (max-width: 1199px) and (min-width: 700px) {
    .cs-header {
      transform: translateY(0) !important;
    }
  }
  @media (max-width: 699px) {
    .cs-header {
      transform: translateY(0);
    }
    .cs-header--scroll-hidden {
      transform: translateY(-100%) !important;
    }
    .cs-interactive-prototype {
      display: none;
    }
    .cs-hero-img {
      width: 80vw !important;
      display: block;
      margin: 0 auto;
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
    background: var(--color-border);
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
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    color: var(--color-body);
    text-decoration: none;
    transition: color 0.15s ease-out;
  }
  .cs-header-back:hover { color: var(--color-primary); }
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
    font-size: var(--font-size-small);
    font-weight: var(--font-weight-medium);
    color: var(--color-body);
    margin-bottom: 24px;
    text-decoration: none;
    transition: color 0.15s ease-out;
  }
  .cs-sidebar-back:hover { color: var(--color-primary); }

  /* Sidebar nav */
  .cs-sidebar-nav {
    display: flex;
    flex-direction: column;
    border-left: 1px solid var(--color-border);
  }

  /* Sidebar link */
  .cs-nav-link {
    font-size: var(--font-size-nav);
    font-weight: var(--font-weight-regular);
    color: var(--color-muted);
    padding: 8px 0 8px 16px;
    cursor: pointer;
    border: none;
    border-left: 2px solid transparent;
    margin-left: -1px;
    background: none;
    text-align: left;
    line-height: var(--line-height-body);
    transition: color 0.15s ease, border-color 0.15s ease;
  }
  .cs-nav-link:hover { color: var(--color-secondary); }
  .cs-nav-link.cs-nav-link--active {
    color: var(--color-primary);
    font-weight: var(--font-weight-medium);
    border-left-color: var(--color-primary);
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
    font-weight: var(--font-weight-medium);
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
    background: var(--color-surface-subtle) !important;
    border-color: #D4D4D8 !important;
  }

  /* Footer button hover */
  .cs-btn-outline:hover:not(:disabled) {
    background: var(--color-surface-subtle) !important;
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

  /* Interactive prototype fullscreen */
  .cs-interactive-fullscreen { position: relative; }
  .cs-interactive-fullscreen:fullscreen {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--color-surface);
  }
  .cs-interactive-fullscreen:fullscreen .cs-interactive-content {
    max-width: 1100px;
    width: 100%;
  }

  /* Responsive horizontal padding */
  .cs-content-wrap {
    padding-left: 40px;
    padding-right: 40px;
  }
  @media (max-width: 768px) {
    .cs-content-wrap {
      padding-left: 16px;
      padding-right: 16px;
    }
    .cs-header-inner {
      padding: 0 16px;
    }
  }
`;

// ── Slide data ───────────────────────────────────────────────────────────────

const EARLY_SLIDES: Slide[] = [
  {
    title: 'Tabs (centred)',
    label: 'Iteration 3',
    src: '/images/case-studies/simplified-navigation/iteration-top-second.png',
    width: 3520, height: 2120,
    body: 'A full-width panel with top-level tabs. Showed a lot of content at once but the visual weight created cognitive overload in early feedback sessions.',
  },
  {
    title: 'Dropdown breadcrumb',
    label: 'Iteration 1',
    width: 3520, height: 2120,
    states: [
      { label: 'Default', src: '/images/case-studies/simplified-navigation/iteration-breadcrumb1.png' },
      { label: 'Open',    src: '/images/case-studies/simplified-navigation/iteration-breadcrumb2.png' },
      { label: 'Subpage', src: '/images/case-studies/simplified-navigation/iteration-breadcrumb3.png' },
    ],
    body: 'Hovering a category revealed sub-items in a panel anchored to the left. Felt clunky on wide viewports and created awkward mouse travel paths.',
  },
  {
    title: 'Dropdowns for steps',
    label: 'Iteration 4',
    src: '/images/case-studies/simplified-navigation/iteration-steps-dropdown.png',
    width: 3520, height: 2120,
    body: 'Pairing category names with icons improved recognition speed, but maintaining a consistent icon style across 50+ categories added unsustainable design overhead.',
  },
  {
    title: 'Tabs with mega menu',
    label: 'Iteration 1',
    src: '/images/case-studies/simplified-navigation/iteration-top-nav (grey).png',
    width: 3520, height: 2120,
    body: 'The starting point — a basic vertical list. Familiar and low-friction, but quickly ran into problems once category lists grew longer than a dozen items.',
  },
];

const REFINED_SLIDES: Slide[] = [
  {
    title: '3-step nav',
    label: 'Concept A',
    src: '/images/case-studies/simplified-navigation/Refined-concept.png',
    width: 3520, height: 2120,
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
  { id: 'section-brief',            label: 'The brief' },
  { id: 'section-explorations',     label: 'Explorations' },
  { id: 'section-refined',          label: 'Refined concept' },
  { id: 'section-additional',       label: 'Overview page' },
  { id: 'section-conclusion',       label: 'Conclusion' },
];

// ── Before/After slider ──────────────────────────────────────────────────────

function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = 'Before',
  afterAlt = 'After',
  aspectRatio = '1600/1000',
  initialPos = 50,
  orientation = 'vertical',
  onExpand,
}: {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  aspectRatio?: string;
  initialPos?: number;
  orientation?: 'horizontal' | 'vertical';
  onExpand: (startIndex: number) => void;
}) {
  const isHorizontal = orientation === 'horizontal';
  // displayPos can exceed 0–100 during elastic drag; clipPos is clamped for image reveal
  const [displayPos, setDisplayPos] = useState(initialPos);
  const [isReleasing, setIsReleasing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const isDragging = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const clipPos = Math.max(0, Math.min(100, displayPos));

  const rawToElastic = (raw: number) =>
    raw < 0 ? raw * 0.35 : raw > 100 ? 100 + (raw - 100) * 0.35 : raw;

  const startDrag = (client: number) => {
    if (!containerRef.current) return;
    isDragging.current = true;
    setDragging(true);
    setIsReleasing(false);
    const rect = containerRef.current.getBoundingClientRect();
    setDisplayPos(isHorizontal
      ? rawToElastic(((client - rect.left) / rect.width) * 100)
      : rawToElastic(((client - rect.top) / rect.height) * 100));
  };

  // Global handlers so drag continues when mouse leaves the frame
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDisplayPos(isHorizontal
        ? rawToElastic(((e.clientX - rect.left) / rect.width) * 100)
        : rawToElastic(((e.clientY - rect.top) / rect.height) * 100));
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      setDisplayPos(isHorizontal
        ? rawToElastic(((e.touches[0].clientX - rect.left) / rect.width) * 100)
        : rawToElastic(((e.touches[0].clientY - rect.top) / rect.height) * 100));
    };
    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      setDragging(false);
      setDisplayPos(prev => {
        const clamped = Math.max(0, Math.min(100, prev));
        if (clamped !== prev) {
          setIsReleasing(true);
          setTimeout(() => setIsReleasing(false), 500);
        }
        return clamped;
      });
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onTouchMove, { passive: false });
    document.addEventListener('touchend', onUp);
    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);
      document.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('touchend', onUp);
    };
  }, []); // safe: only refs and stable setState used inside

  const posTransition = isReleasing ? `${isHorizontal ? 'left' : 'top'} 450ms cubic-bezier(0.34, 1.56, 0.64, 1)` : 'none';
  // Fade divider within 6% of either edge; fully opaque in the middle 88%
  const dividerOpacity = Math.min(1, Math.min(clipPos, 100 - clipPos) / 6);
  // Gradient tint over "before" region; baseline 0.35 always present, ramps to 1.0 at full drag
  const tintOpacity = 0.35 + (clipPos / 100) * 0.65;

  return (
    // Outer wrapper: 20px padding on the drag axis so handle never clips at the edges
    <div style={isHorizontal ? { paddingLeft: 20, paddingRight: 20 } : { paddingTop: 20, paddingBottom: 20 }}>
      {/* Image container: coordinate system for handle/divider positioning */}
      <div
        ref={containerRef}
        style={{ position: 'relative', aspectRatio, userSelect: 'none', cursor: dragging ? 'grabbing' : 'default' }}
      >
        {/* Inner image wrapper: overflow:hidden + border-radius clips images and divider */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 12, overflow: 'hidden' }}>
          {/* Before — base layer */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={beforeSrc} alt={beforeAlt} draggable={false}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          {/* Accent tint over the "before" region, ramping in after 20% drag */}
          <div style={{
            position: 'absolute', inset: 0,
            background: isHorizontal
              ? 'linear-gradient(to right, transparent, rgba(68,67,180,0.14))'
              : 'linear-gradient(to bottom, transparent, rgba(68,67,180,0.14))',
            opacity: tintOpacity,
            clipPath: isHorizontal ? `inset(0 0 0 ${clipPos}%)` : `inset(${clipPos}% 0 0 0)`,
            pointerEvents: 'none',
          }} />
          {/* After — clipped to reveal as clipPos increases */}
          <div style={{ position: 'absolute', inset: 0, clipPath: isHorizontal ? `inset(0 ${100 - clipPos}% 0 0)` : `inset(0 0 ${100 - clipPos}% 0)` }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={afterSrc} alt={afterAlt} draggable={false}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
          </div>
          {/* Divider inside overflow:hidden so it respects the border-radius at all positions */}
          <div
            style={isHorizontal ? {
              position: 'absolute', top: 0, bottom: 0,
              left: `${displayPos}%`, width: 8, transform: 'translateX(-50%)',
              cursor: dragging ? 'grabbing' : 'grab',
              opacity: dividerOpacity,
              zIndex: 2, transition: posTransition,
            } : {
              position: 'absolute', left: 0, right: 0,
              top: `${displayPos}%`, height: 8, transform: 'translateY(-50%)',
              cursor: dragging ? 'grabbing' : 'grab',
              opacity: dividerOpacity,
              zIndex: 2, transition: posTransition,
            }}
            onMouseDown={e => { e.preventDefault(); startDrag(isHorizontal ? e.clientX : e.clientY); }}
            onTouchStart={e => startDrag(isHorizontal ? e.touches[0].clientX : e.touches[0].clientY)}
          >
            {/* 2px visible line, centred in the 8px hit area */}
            <div style={isHorizontal
              ? { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 2, transform: 'translateX(-50%)', background: 'rgba(0,0,0,0.18)', pointerEvents: 'none' }
              : { position: 'absolute', top: '50%', left: 0, right: 0, height: 2, transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.18)', pointerEvents: 'none' }} />
            {/* Shadow band directly beside the line */}
            <div style={isHorizontal
              ? { position: 'absolute', left: '50%', top: 0, bottom: 0, width: 8, background: 'linear-gradient(to right, rgba(0,0,0,0.05), transparent)', pointerEvents: 'none' }
              : { position: 'absolute', top: '50%', left: 0, right: 0, height: 8, background: 'linear-gradient(to bottom, rgba(0,0,0,0.05), transparent)', pointerEvents: 'none' }} />
          </div>
        </div>

        {/* Handle */}
        <div
          style={isHorizontal ? {
            position: 'absolute', top: '50%', left: `${displayPos}%`,
            transform: 'translate(-50%, -50%)',
            width: 36, height: 36, borderRadius: '50%',
            background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: dragging ? 'grabbing' : 'grab',
            zIndex: 3, color: '#52525B', transition: posTransition,
          } : {
            position: 'absolute', left: '50%', top: `${displayPos}%`,
            transform: 'translate(-50%, -50%)',
            width: 36, height: 36, borderRadius: '50%',
            background: 'white', boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: dragging ? 'grabbing' : 'grab',
            zIndex: 3, color: '#52525B', transition: posTransition,
          }}
          onMouseDown={e => { e.preventDefault(); startDrag(isHorizontal ? e.clientX : e.clientY); }}
          onTouchStart={e => startDrag(isHorizontal ? e.touches[0].clientX : e.touches[0].clientY)}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {isHorizontal
              ? <path d="M9 6l-6 6 6 6M15 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round"/>
              : <path d="M6 9l6-6 6 6M6 15l6 6 6-6" strokeLinecap="round" strokeLinejoin="round"/>}
          </svg>
        </div>

        {/* Expand button — stops drag propagation, opens lightbox */}
        <button
          onMouseDown={e => e.stopPropagation()}
          onClick={e => { e.stopPropagation(); onExpand(clipPos > 50 ? 1 : 0); }}
          style={{
            position: 'absolute', bottom: 16, right: 16,
            width: 32, height: 32, borderRadius: 8, zIndex: 3,
            background: 'rgba(255,255,255,0.9)',
            border: '1px solid rgba(0,0,0,0.08)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.12)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#52525B',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SimplifiedNavigationPage() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('section-brief');
  const [lightbox, setLightbox] = useState<LightboxState>({ open: false, slides: [], index: 0, stateIndices: {} });
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);
  const fullscreenRef = useRef<HTMLDivElement>(null);
  const targetScrollYRef = useRef<number>(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(() => {
    if (!document.fullscreenElement) {
      const rect = fullscreenRef.current?.getBoundingClientRect();
      if (rect) targetScrollYRef.current = window.scrollY + rect.top - 140;
      fullscreenRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

  // Scroll listener
  useEffect(() => {
    const onScroll = () => {
      if (heroTitleRef.current) {
        setHeaderVisible(heroTitleRef.current.getBoundingClientRect().bottom < 0);
      }
      if (window.innerWidth < 700 && headerRef.current) {
        const diff = window.scrollY - lastScrollYRef.current;
        if (Math.abs(diff) > 10) {
          headerRef.current.classList.toggle('cs-header--scroll-hidden', diff > 0);
          lastScrollYRef.current = window.scrollY;
        }
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

  useEffect(() => {
    const mark1 = document.getElementById('brief-mark-1');
    const mark2 = document.getElementById('brief-mark-2');
    const list = document.getElementById('brief-task-list');
    if (!mark1 || !mark2 || !list) return;

    let hasAnimated = false;

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !hasAnimated) {
          hasAnimated = true;
          mark1.classList.add('highlight-brief--animate');
          setTimeout(() => {
            mark2.classList.add('highlight-brief--animate');
          }, 400);
        }
      });
    }, { threshold: 0.5 });

    observer.observe(list);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const onFullscreenChange = () => {
      const isNowFullscreen = !!document.fullscreenElement;
      setIsFullscreen(isNowFullscreen);
      if (!isNowFullscreen) {
        setTimeout(() => {
          window.scrollTo({ top: targetScrollYRef.current, behavior: 'instant' });
        }, 50);
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const scrollToSection = useCallback((id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const openLightbox = useCallback((slides: Slide[], index: number, stateIndices: Record<number, number> = {}) => {
    setLightbox({ open: true, slides, index, stateIndices });
  }, []);

  const closeLightbox = useCallback(() => setLightbox(prev => ({ ...prev, open: false })), []);

  const navigateLightbox = useCallback((dir: number) => {
    setLightbox(prev => ({
      ...prev,
      index: Math.max(0, Math.min(prev.slides.length - 1, prev.index + dir)),
    }));
  }, []);

  const openSingleImage = useCallback((title: string, body: string, label: string, src?: string, width?: number, height?: number) => {
    setLightbox({ open: true, slides: [{ title, body, label, src, width, height }], index: 0, stateIndices: {} });
  }, []);

  return (
    <>
      <style>{GLOBAL_STYLES}</style>

      {/* ── TOP HEADER ────────────────────────────────────────────────── */}
      <header ref={headerRef} className={`cs-header${headerVisible ? ' cs-header--visible' : ''}`}>
        <div className="cs-header-inner">
          <a href="/" className="cs-header-back">
            <ChevronLeft size={14} />
            Back
          </a>
          <span className="cs-header-divider" />
          <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>Simplified navigation</span>
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
      <div className="cs-content-wrap" style={{ maxWidth: 680, margin: '0 auto', background: 'var(--color-white)' }}>

        {/* HERO */}
        <section style={{ paddingBottom: 40 }}>
          <div style={{
            marginLeft: 'calc(-50vw + 50%)',
            marginRight: 'calc(-50vw + 50%)',
            background: 'var(--color-surface-subtle)',
            padding: '80px 0 40px',
            marginBottom: 60,
          }}>
            <div className="cs-content-wrap" style={{ maxWidth: 680, margin: '0 auto' }}>
              <Image
                src="/images/case-studies/simplified-navigation/hero-menu.png"
                width={1166}
                height={856}
                priority
                alt="Simplified navigation hero"
                className="cs-hero-img"
                style={{ width: '100%', height: 'auto', borderRadius: 8 }}
              />
            </div>
          </div>
          <div>
            <div style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-accent)', letterSpacing: '0.06em', marginBottom: 8 }}>
              Project
            </div>
            <h1
              ref={heroTitleRef}
              style={{ fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', lineHeight: 'var(--line-height-heading)', letterSpacing: '-0.025em', marginBottom: 16 }}
            >
              Simplified navigation
            </h1>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginBottom: 40 }}>
              Redesigning the navigation for a complex procurement sourcing platform, condensing a 7-step flow without losing access to any of the core functionality.
            </p>
            <div style={{ display: 'flex', gap: 40, paddingTop: 40, borderTop: '1px solid rgba(228,228,231,0.5)' }}>
              {[
                { label: 'Role', value: 'Product designer' },
                { label: 'Timeline', value: '1-2 weeks' },
                { label: 'Date', value: 'February 2026' },
              ].map(item => (
                <div key={item.label} style={{ flex: 1 }}>
                  <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)' }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* THE BRIEF */}
        <section id="section-brief" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px' }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 12 }}>The brief</h2>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
            The navigation of Keelvar&#39;s sourcing v1 platform overwhelmed users. The existing side navigation used an accordion to reveal pages across seven different steps. When users created a new event, they lacked a clear starting point and direction for what to do next. Being part of the team working on sourcing v2, which aimed to reimagine the Sourcing Optimizer product, we had 2 tasks:
          </p>
          <ol id="brief-task-list" style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', listStyleType: 'decimal', paddingLeft: '1.5rem', marginTop: 8 }}>
            <li><mark id="brief-mark-1" className="highlight-brief">Simplify the navigation</mark></li>
            <li><mark id="brief-mark-2" className="highlight-brief">Provide users with a clear understanding of their next steps post event creation</mark></li>
          </ol>
          <div style={{ marginTop: 24 }}>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 8,
              overflow: 'hidden',
            }}>
              <ClickableVideo
                src="/videos/simplified-navigation/old-nav-sections-preview.mp4"
                lightboxSrc="/videos/simplified-navigation/old-nav-sections-hq.mp4"
                label="Old navigation flow"
              />
            </div>
            <p style={{ marginTop: 8, fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-muted)', textAlign: 'center' }}>The original side navigation.</p>
          </div>
        </section>

        {/* EXPLORATIONS */}
        <section id="section-explorations" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px' }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 12 }}>Explorations</h2>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
            Before exploring concepts, I mapped the existing nav from an information architecture perspective to identify which pages could be logically grouped or consolidated across the 7 steps.
          </p>

          {/* Analysis block */}
          <div style={{ marginTop: 12, marginBottom: 40 }}>
            <ClickableImage
              label="Page break up diagram"
              src="/images/case-studies/simplified-navigation/Nav-breakdown.png"
              aspectRatio="1760/1546"
              loading="eager"
              onClick={() => openSingleImage(
                'Current state analysis',
                'The original seven-step nav broken down by event stage and steps, showing where consolidation was possible.',
                'Page break up diagram',
                '/images/case-studies/simplified-navigation/Nav-breakdown.png',
                3520, 3092,
              )}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 className="mb-2" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)' }}>Early explorations</h3>
            <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
              Exploring different ways to condense the navigation into 3-4 simpler event stages. The main goal was to transition from a vertical side navigation to a top navigation.
            </p>
          </div>

          <IterationSwitcher slides={EARLY_SLIDES} onOpenLightbox={openLightbox} />
        </section>

        {/* REFINED CONCEPT */}
        <section id="section-refined" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px' }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 12 }}>Refined concept</h2>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
            We ran a workshop with the PM, engineers, and myself. We shared ideas of concepts from Figma Make to quickly coded prototypes. We narrowed it down to a combination of 2 concepts which I refined further before sending final feedback.
          </p>
          <div style={{ marginTop: 16 }}>
            <ClickableImage
              label="Refined concept"
              src="/images/case-studies/simplified-navigation/Refined-concept.png"
              aspectRatio="3520/2120"
              onClick={() => openSingleImage(
                'Refined concept',
                '',
                'Refined concept',
                '/images/case-studies/simplified-navigation/Refined-concept.png',
                3520, 2120,
              )}
            />
          </div>
          <div style={{ marginTop: 24 }}>
            <h3 className="mb-2" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)' }}>Internal feedback</h3>
            <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                "The user should see what step they're on at all times.",
                "They should quickly be able to access other pages, even when in subpages.",
                "Reducing the number of steps to make event management feel simpler was important.",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>{item}</li>
              ))}
            </ul>
          </div>
          <div style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 8px, transparent 8px, transparent 14px)', height: 1, width: '100%', margin: '24px 0' }} />
          <div>
            <h3 className="mb-2" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', display: 'flex', alignItems: 'center', gap: 8 }}>
              Further feedback
              <span style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)', color: '#78350f', background: '#fef3c7', borderRadius: 6, padding: '2px 8px' }}>Late</span>
            </h3>
            <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                "The existing side and top global navigation, shared across the product, could not be modified, a constraint that hadn't been raised earlier.",
                "This feedback came from the team responsible for that navigation, who noted it was complex to update and they had other priorities at the time.",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>{item}</li>
              ))}
            </ul>
          </div>
          <p style={{ marginTop: 16, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>Based on this feedback, a new header was introduced below the global nav to house the event level navigation. This did mean we lost some vertical real estate in the UI, but we had to move forward because of time constraints. The plan was to eventually revisit the global nav at some point, after validating the sourcing v2 product.</p>
          <div style={{ marginTop: 4 }}>
            <BeforeAfterSlider
              beforeSrc="/images/case-studies/simplified-navigation/Refined-concept.png"
              afterSrc="/images/case-studies/simplified-navigation/Refined-concept-last.png"
              beforeAlt="Refined concept — before"
              afterAlt="Refined concept — after"
              aspectRatio="3520/2120"
              onExpand={startIndex => openLightbox([
                { title: 'Refined concept', body: '', label: 'Before', src: '/images/case-studies/simplified-navigation/Refined-concept.png' },
                { title: 'Refined concept', body: '', label: 'After', src: '/images/case-studies/simplified-navigation/Refined-concept-last.png' },
              ], startIndex)}
            />
          </div>
          <p style={{ marginTop: -12, fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-muted)', lineHeight: 'var(--line-height-body)', textAlign: 'center' }}>Drag the divider to reveal the design before the late feedback.</p>

          <div style={{ backgroundImage: 'repeating-linear-gradient(to right, rgba(0,0,0,0.06) 0, rgba(0,0,0,0.06) 8px, transparent 8px, transparent 14px)', height: 1, width: '100%', margin: '40px 0' }} />

          <div>
            <h3 className="mb-2" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)' }}>Old navigation flow</h3>
            <p className="mb-3" style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>Below shows how the user previously navigated to the &apos;Scenario Analysis&apos; page.</p>
            <ClickableVideo src="/videos/simplified-navigation/old-flow.mp4" label="Original navigation flow" />
          </div>
          <div style={{ marginTop: 40 }}>
            <h3 className="mb-2" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)' }}>New navigation flow</h3>
            <p style={{ marginBottom: 8, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>The new design gives users three different paths to reach the same page, each just as fast or faster than before. The paths range from simple to advanced, so users can navigate in the way that best matches their familiarity with the tool.</p>
            <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, background: '#FAFAFA', border: '1px solid rgba(0, 0, 0, 0.05)', borderRadius: 8, padding: '8px 12px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 -960 960 960" fill="currentColor" style={{ color: 'var(--color-muted)', flexShrink: 0 }}><path d="M440-280h80v-240h-80v240Zm68.5-331.5Q520-623 520-640t-11.5-28.5Q497-680 480-680t-28.5 11.5Q440-657 440-640t11.5 28.5Q463-600 480-600t28.5-11.5ZM480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
              <p style={{ margin: 0, fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-muted)', lineHeight: 'var(--line-height-body)' }}>Some screens in the videos below contain wireframe placeholders.</p>
            </div>
            <p style={{ marginBottom: 12, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', lineHeight: 'var(--line-height-body)' }}>1. Navigate using the top-level steps</p>
            <div style={{ background: 'var(--color-surface)', borderRadius: 8, overflow: 'hidden', aspectRatio: '2194 / 1322' }}>
              <ClickableVideo
                src="/videos/simplified-navigation/1-click-step-preview.mp4"
                lightboxSrc="/videos/simplified-navigation/1-click-step-hq.mp4"
                label="Navigate using the top-level steps"
              />
            </div>
            <p style={{ marginTop: 8, fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>For first-time or less experienced users, the top-level steps offer a simple route. They select Analysis, see an overview, then continue to Scenario analysis.</p>
          </div>
          <div style={{ marginTop: 24 }}>
            <p style={{ marginBottom: 12, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', lineHeight: 'var(--line-height-body)' }}>2. Navigate using mega menu</p>
            <div style={{ background: 'var(--color-surface)', borderRadius: 8, overflow: 'hidden', aspectRatio: '2194 / 1322' }}>
              <ClickableVideo
                src="/videos/simplified-navigation/2-click-page-menu-preview.mp4"
                lightboxSrc="/videos/simplified-navigation/2-click-page-menu-hq.mp4"
                label="Navigate using mega menu"
              />
            </div>
            <p style={{ marginTop: 8, fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>For users who are a little more familiar with the tool, the mega menu offers a much faster route. They can jump straight to subpages without using the top-level steps.</p>
          </div>
          <div style={{ marginTop: 24 }}>
            <p style={{ marginBottom: 12, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', lineHeight: 'var(--line-height-body)' }}>3. Navigate using keyboard shortcut</p>
            <div style={{ background: 'var(--color-surface)', borderRadius: 8, overflow: 'hidden', aspectRatio: '2194 / 1322' }}>
              <ClickableVideo
                src="/videos/simplified-navigation/3-keyboard-shortcut-preview.mp4"
                lightboxSrc="/videos/simplified-navigation/3-keyboard-shortcut-hq.mp4"
                label="Navigate using keyboard shortcut"
              />
            </div>
            <p style={{ marginTop: 8, fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>For advanced users, a keyboard shortcut (Cmd+K) opens the mega menu, letting them navigate without clicking. Try it yourself in the prototype at the end.</p>
          </div>
          <div style={{ marginTop: 32 }}>
            <h3 className="mb-2" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)' }}>Cursor safe zone</h3>
            <p style={{ marginBottom: 12, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>Additional detail showing the safe zone that the mouse can travel without triggering the menu to close.</p>
            <div style={{
              background: 'var(--color-surface)',
              borderRadius: 8,
              overflow: 'hidden',
              aspectRatio: '2230 / 1172',
            }}>
              <ClickableVideo
                src="/videos/simplified-navigation/safe-zone-menu-preview.mp4"
                lightboxSrc="/videos/simplified-navigation/safe-zone-menu-hq.mp4"
                label="Safe zone mega menu"
              />
            </div>
          </div>
        </section>

        {/* ADDITIONAL DETAILS */}
        <section id="section-additional" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px' }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 12 }}>Overview page</h2>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
            Previously, when a user landed on a newly created event, they were taken to an event information page with no indication of what needed to be completed before publishing the event.
          </p>
          <div style={{ marginTop: 16, marginBottom: 40 }}>
            <ClickableImage
              label="Event information page"
              src="/images/case-studies/simplified-navigation/event-information.png"
              aspectRatio="1760/1060"
              onClick={() => openSingleImage(
                'Overview page',
                '',
                'Event information page',
                '/images/case-studies/simplified-navigation/event-information.png',
                3520, 2120,
              )}
            />
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-muted)', textAlign: 'center', marginTop: 8 }}>
              Landing page after creating a new event.
            </p>
          </div>
          <h3 className="mb-2" style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)' }}>Final design</h3>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginBottom: 12 }}>
            The new overview page front-loads all required tasks, with optional ones clearly marked. Users can work through and check off each task before publishing, reducing errors and giving them a clear path forward.
          </p>
          <div style={{ marginTop: 0, marginLeft: -20, marginRight: -20, width: 'calc(100% + 40px)' }}>
            <BeforeAfterSlider
              beforeSrc="/images/case-studies/simplified-navigation/final-before.png"
              afterSrc="/images/case-studies/simplified-navigation/final-after.png"
              beforeAlt="Final design — before"
              afterAlt="Final design — after"
              aspectRatio="3520/2120"
              initialPos={90}
              orientation="horizontal"
              onExpand={startIndex => openLightbox([
                { title: 'Final design', body: '', label: 'Before', src: '/images/case-studies/simplified-navigation/final-before.png' },
                { title: 'Final design', body: '', label: 'After', src: '/images/case-studies/simplified-navigation/final-after.png' },
              ], startIndex)}
            />
          </div>
          <p style={{ marginTop: 8, fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-muted)', lineHeight: 'var(--line-height-body)', textAlign: 'center' }}>Drag to reveal an earlier iteration with design annotations.</p>
        </section>

        {/* CONCLUSION */}
        <section id="section-conclusion" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px' }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 12 }}>Conclusion</h2>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
            A look back on the key outcomes, decisions, and constraints from the project.
          </p>

          <div style={{ marginTop: 24, display: 'grid', gridTemplateColumns: '1fr', columnGap: 16, rowGap: 24, alignItems: 'start' }}>
            {[
              {
                icon: 'check' as const,
                title: 'Simplified event flow',
                body: 'We consolidated a complex event flow into 3 clear steps, giving new and less advanced users a much simpler path through the product.',
              },
              {
                icon: 'check' as const,
                title: 'Improved overview page',
                body: 'The redesigned overview page front-loads all tasks required to publish an event, giving users a clear path forward. Previously, users had no clear indication of what was needed to publish an event.',
              },
              {
                icon: 'check' as const,
                title: 'Added mega menu',
                body: 'The accordion side nav made it difficult to find pages as they were buried inside sections. The new mega menu shows all pages at once, removing that friction entirely.',
              },
              {
                icon: 'check' as const,
                title: 'Added keyboard shortcuts',
                body: 'While redesigning the navigation, we took the opportunity to give power users a faster way to navigate the event. A keyboard shortcut lets users access the mega menu and jump directly to any subpage in 1-2 seconds.',
              },
              {
                icon: 'x' as const,
                title: 'Deferred external validation',
                body: 'Time pressure from leadership meant we were directed to move forward without customer validation for this project. We had only recently validated the lo-fi flow for Sourcing v2, so the intention was to validate once more designs were finalised.',
              },
            ].map((item, i) => (
              <div key={i}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                  {item.icon === 'check' ? (
                    <svg width="20" height="20" viewBox="0 0 640 640" fill="#16a34a" style={{ flexShrink: 0 }}>
                      <path d="M320 576C178.6 576 64 461.4 64 320C64 178.6 178.6 64 320 64C461.4 64 576 178.6 576 320C576 461.4 461.4 576 320 576zM320 112C205.1 112 112 205.1 112 320C112 434.9 205.1 528 320 528C434.9 528 528 434.9 528 320C528 205.1 434.9 112 320 112zM390.7 233.9C398.5 223.2 413.5 220.8 424.2 228.6C434.9 236.4 437.3 251.4 429.5 262.1L307.4 430.1C303.3 435.8 296.9 439.4 289.9 439.9C282.9 440.4 276 437.9 271.1 433L215.2 377.1C205.8 367.7 205.8 352.5 215.2 343.2C224.6 333.9 239.8 333.8 249.1 343.2L285.1 379.2L390.7 234z"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 640 640" fill="#e11d48" style={{ flexShrink: 0 }}>
                      <path d="M320 112C434.9 112 528 205.1 528 320C528 434.9 434.9 528 320 528C205.1 528 112 434.9 112 320C112 205.1 205.1 112 320 112zM320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C221.6 240.4 221.6 255.6 231 264.9L286 319.9L231 374.9C221.6 384.3 221.6 399.5 231 408.8C240.4 418.1 255.6 418.2 264.9 408.8L319.9 353.8L374.9 408.8C384.3 418.2 399.5 418.2 408.8 408.8C418.1 399.4 418.2 384.2 408.8 374.9L353.8 319.9L408.8 264.9C418.2 255.5 418.2 240.3 408.8 231C399.4 221.7 384.2 221.6 374.9 231L319.9 286L264.9 231C255.5 221.6 240.3 221.6 231 231z"/>
                    </svg>
                  )}
                  <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)' }}>{item.title}</div>
                </div>
                <div style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', paddingLeft: 32 }}>{item.body}</div>
              </div>
            ))}
          </div>

          <div className="cs-interactive-prototype" style={{ marginTop: 40 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)' }}>Interactive prototype</h3>
                <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>Click on tabs and subpages in the dropdown menu.</p>
              </div>
              <BorderBeam size="md" colorVariant="ocean" theme="light" strength={0.3}>
                <Button variant="outline" size="sm" icon={<i className="fa-solid fa-expand" style={{ fontSize: 12 }} />} onClick={toggleFullscreen}>
                  Fullscreen
                </Button>
              </BorderBeam>
            </div>
            <div
              ref={fullscreenRef}
              className="cs-interactive-fullscreen"
              style={{
                background: 'var(--color-surface)',
                borderRadius: 16,
                padding: 0,
                position: 'relative',
              }}
            >
              {isFullscreen && (
                <button
                  onClick={toggleFullscreen}
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    zIndex: 10,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 32,
                    padding: '0 12px',
                    borderRadius: 8,
                    fontSize: 'var(--font-size-small)',
                    fontWeight: 'var(--font-weight-medium)',
                    background: 'var(--color-white)',
                    color: 'var(--color-primary)',
                    border: '1px solid var(--color-border)',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                    cursor: 'pointer',
                  }}
                >
                  <i className="fa-solid fa-compress" style={{ fontSize: 11 }} />
                  Exit fullscreen
                </button>
              )}
              <div className="cs-interactive-content">
                <MegaMenuTile />
              </div>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <div style={{
          padding: '48px 0',
          borderTop: '1px solid rgba(228,228,231,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginTop: 24,
        }}>
          <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-muted)' }}>Glen Mitchell</span>
          <div style={{ display: 'flex', gap: 8 }}>
            <a
              href="/projects/electricity-tracker"
              className="cs-btn-outline"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 36, padding: '0 16px', borderRadius: 8,
                fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)',
                background: 'var(--color-white)', color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease-out',
                textDecoration: 'none',
              }}
            >
              <ChevronLeft />
              Previous
            </a>
            <a
              href="/projects/messages"
              className="cs-btn-outline"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 36, padding: '0 16px', borderRadius: 8,
                fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)',
                background: 'var(--color-white)', color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                cursor: 'pointer',
                transition: 'all 0.15s ease-out',
                textDecoration: 'none',
              }}
            >
              Next project
              <ChevronRight />
            </a>
          </div>
        </div>

      </div>

      {/* LIGHTBOX */}
      <Lightbox state={lightbox} onClose={closeLightbox} onNavigate={navigateLightbox} />
    </>
  );
}
