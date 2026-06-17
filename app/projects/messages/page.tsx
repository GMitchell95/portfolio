'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import type { Slide, LightboxState } from '@/components/case-studies/simplified-navigation/types';
import { ChevronLeft, ChevronRight } from '@/components/case-studies/simplified-navigation/icons';
import ClickableImage from '@/components/case-studies/simplified-navigation/ClickableImage';
import ClickableVideo from '@/components/case-studies/simplified-navigation/ClickableVideo';
import IterationSwitcher from '@/components/case-studies/simplified-navigation/IterationSwitcher';
import Lightbox from '@/components/case-studies/simplified-navigation/Lightbox';
import Button from '@/components/ui/Button';

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

const OVERVIEW_SLIDES = [
  {
    title: 'Old messages — bidder view',
    body: '',
    src: '/images/case-studies/messages/old-messages-bidder.png',
    label: 'Old messages — bidder view',
    width: 3520,
    height: 2120,
  },
  {
    title: 'Old messages — compose',
    body: '',
    src: '/images/case-studies/messages/old-messages-compose.png',
    label: 'Old messages — compose',
    width: 3520,
    height: 2120,
  },
];

// ── Sections ─────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'section-overview',  label: 'Overview' },
  { id: 'section-details',   label: 'Details' },
  { id: 'section-learnings', label: 'Learnings' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MessagesPage() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('section-overview');
  const [lightbox, setLightbox] = useState<LightboxState>({ open: false, slides: [], index: 0, stateIndices: {} });
  const heroTitleRef = useRef<HTMLHeadingElement>(null);

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
      <header className={`cs-header${headerVisible ? ' cs-header--visible' : ''}`}>
        <div className="cs-header-inner">
          <a href="/" className="cs-header-back">
            <ChevronLeft size={14} />
            Back
          </a>
          <span className="cs-header-divider" />
          <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>Messages</span>
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
            marginBottom: 40,
          }}>
            <div style={{ maxWidth: 680, margin: '0 auto', padding: '0 40px' }}>
              <div className="hero-image-enter" style={{ border: '1px solid rgba(0, 0, 0, 0.06)', borderRadius: 16, overflow: 'hidden' }}>
                <Image
                  src="/images/case-studies/messages/hero.png"
                  width={2484}
                  height={1688}
                  priority
                  alt="Messages hero"
                  style={{ width: '100%', height: 'auto', display: 'block' }}
                />
              </div>
            </div>
          </div>
          <div style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-accent)', letterSpacing: '0.06em', marginBottom: 20 }}>
            Project
          </div>
          <h1
            ref={heroTitleRef}
            style={{ fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', lineHeight: 'var(--line-height-heading)', letterSpacing: '-0.025em', marginBottom: 24 }}
          >
            Messages
          </h1>
          <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginBottom: 40 }}>
            As part of sourcing v2, we revisited the messages page to improve the overall experience. We introduced conventions from apps like Slack, Messenger and WhatsApp to make the experience feel more familiar.
          </p>
          <div style={{ display: 'flex', gap: 40, paddingTop: 40, borderTop: '1px solid rgba(228,228,231,0.5)' }}>
            {[
              { label: 'Role', value: 'Product designer' },
              { label: 'Timeline', value: '2 weeks' },
              { label: 'Date', value: 'October 2025' },
            ].map(item => (
              <div key={item.label} style={{ flex: 1 }}>
                <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-primary)', marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </section>

        {/* OVERVIEW */}
        <section id="section-overview" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px', minHeight: 400 }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 16 }}>Overview</h2>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
            The original messages page felt dated compared to modern messaging tools. The UI hadn&#39;t kept pace with conventions users were already familiar with, and some core flows worked differently to what users might expect.
          </p>
          <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ClickableImage
                label="Old messages — bidder view"
                src="/images/case-studies/messages/old-messages-bidder.png"
                aspectRatio="3520/2120"
                onClick={() => openLightbox(OVERVIEW_SLIDES, 0)}
              />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <ClickableImage
                label="Old messages — compose"
                src="/images/case-studies/messages/old-messages-compose.png"
                aspectRatio="3520/2120"
                onClick={() => openLightbox(OVERVIEW_SLIDES, 1)}
              />
            </div>
          </div>

        </section>

        {/* DETAILS */}
        <section id="section-details" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px', minHeight: 400 }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 16 }}>Details</h2>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
            Placeholder details. Walk through the design process, key decisions, explorations, and iterations here.
          </p>
        </section>

        {/* LEARNINGS */}
        <section id="section-learnings" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px', minHeight: 400 }}>
          <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 16 }}>Learnings</h2>
          <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
            Placeholder learnings. Reflect on what worked, what didn't, and what you'd do differently.
          </p>
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
            <button
              disabled
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                height: 36, padding: '0 16px', borderRadius: 8,
                fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)',
                background: 'var(--color-white)', color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
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
                fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)',
                background: 'var(--color-white)', color: 'var(--color-primary)',
                border: '1px solid var(--color-border)',
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
