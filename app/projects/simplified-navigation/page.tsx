'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Slide, LightboxState } from '@/components/case-studies/simplified-navigation/types';
import { ChevronLeft, ChevronRight } from '@/components/case-studies/simplified-navigation/icons';
import ClickableImage from '@/components/case-studies/simplified-navigation/ClickableImage';
import IterationSwitcher from '@/components/case-studies/simplified-navigation/IterationSwitcher';
import Lightbox from '@/components/case-studies/simplified-navigation/Lightbox';
import MegaMenuTile from '@/components/tiles/MegaMenuTile';

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
    background: rgba(255,255,255,0.92);
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

// ── Slide data ───────────────────────────────────────────────────────────────

const EARLY_SLIDES: Slide[] = [
  {
    title: 'Tab-based mega panel',
    label: 'Iteration 3',
    src: '/images/case-studies/simplified-navigation/iteration-top-second.png',
    body: 'A full-width panel with top-level tabs. Showed a lot of content at once but the visual weight created cognitive overload in early feedback sessions.',
  },
  {
    title: 'Flyout panel — left anchored',
    label: 'Iteration 1',
    states: [
      { label: 'Default', src: '/images/case-studies/simplified-navigation/iteration-breadcrumb1.png' },
      { label: 'Open',    src: '/images/case-studies/simplified-navigation/iteration-breadcrumb2.png' },
      { label: 'Subpage', src: '/images/case-studies/simplified-navigation/iteration-breadcrumb3.png' },
    ],
    body: 'Hovering a category revealed sub-items in a panel anchored to the left. Felt clunky on wide viewports and created awkward mouse travel paths.',
  },
  {
    title: 'Icon-led category grid',
    label: 'Iteration 4',
    src: '/images/case-studies/simplified-navigation/iteration-steps-dropdown.png',
    body: 'Pairing category names with icons improved recognition speed, but maintaining a consistent icon style across 50+ categories added unsustainable design overhead.',
  },
  {
    title: 'Simple dropdown list',
    label: 'Iteration 1',
    src: '/images/case-studies/simplified-navigation/iteration-top-nav (grey).png',
    body: 'The starting point — a basic vertical list. Familiar and low-friction, but quickly ran into problems once category lists grew longer than a dozen items.',
  },
  {
    title: 'Sidebar drawer',
    label: 'Iteration 5',
    body: "A slide-in drawer from the left. Felt too mobile-native for desktop and broke the user's spatial relationship with the page they were browsing.",
  },
];

const REFINED_SLIDES: Slide[] = [
  {
    title: '3-step nav',
    label: 'Concept A',
    src: '/images/case-studies/simplified-navigation/Refined-concept.png',
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

const ADDITIONAL_SLIDES: Slide[] = [
  {
    label: 'Detail 1',
    title: 'Coloured icons',
    body: '',
    src: '/images/case-studies/simplified-navigation/1-AD-Coloured-icons.png',
  },
  {
    label: 'Detail 2',
    title: 'Grey icons',
    body: '',
    src: '/images/case-studies/simplified-navigation/2-AD-Grey-icons.png',
  },
  {
    label: 'Detail 3',
    title: 'Status dropdowns',
    body: '',
    src: '/images/case-studies/simplified-navigation/3-AD-Status-dropdowns.png',
  },
];

const SECTIONS = [
  { id: 'section-brief',            label: 'The brief' },
  { id: 'section-explorations',     label: 'Explorations' },
  { id: 'section-refined',          label: 'Refined concept' },
  { id: 'section-additional',       label: 'Additional details' },
  { id: 'section-conclusion',       label: 'Conclusion' },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SimplifiedNavigationPage() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('section-brief');
  const [lightbox, setLightbox] = useState<LightboxState>({ open: false, slides: [], index: 0, stateIndices: {} });
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

  const openSingleImage = useCallback((title: string, body: string, label: string, src?: string) => {
    setLightbox({ open: true, slides: [{ title, body, label, src }], index: 0, stateIndices: {} });
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
        <section style={{ paddingTop: 80, paddingBottom: 40 }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#4443B4', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 20 }}>
            Project
          </div>
          <h1
            ref={heroTitleRef}
            style={{ fontSize: 36, fontWeight: 600, color: '#18181B', lineHeight: 1.05, letterSpacing: '-0.025em', marginBottom: 24 }}
          >
            Simplified navigation
          </h1>
          <p style={{ fontSize: 15, color: '#71717A', lineHeight: 1.65, marginBottom: 40 }}>
            Redesigning the navigation for a complex procurement sourcing platform, condensing a 7-step flow without losing access to any of the core functionality.
          </p>
          <div style={{ display: 'flex', gap: 40, paddingTop: 40, borderTop: '1px solid rgba(228,228,231,0.5)' }}>
            {[
              { label: 'Role', value: 'Product designer' },
              { label: 'Timeline', value: '1-2 weeks' },
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
        <section id="section-brief" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '55px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>The brief</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            The navigation for Keelvar&#39;s sourcing platform was overwhelming users. The existing side nav used an accordion to reveal pages across 7 different steps, and when users created a new event, there was no clear starting point or sense of what to do next. We needed to simplify the navigation and give users a clear idea of what they needed to do next.
          </p>
        </section>

        {/* EXPLORATIONS */}
        <section id="section-explorations" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '55px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>Explorations</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            Before exploring concepts, I mapped the existing nav from an information architecture perspective to identify which pages could be logically grouped or consolidated across the 7 steps.
          </p>

          {/* Analysis block */}
          <div style={{ marginTop: 40, marginBottom: 64 }}>
            <ClickableImage
              label="Page break up diagram"
              src="/images/case-studies/simplified-navigation/nav-breakdown.png"
              aspectRatio="1760/1546"
              loading="eager"
              onClick={() => openSingleImage(
                'Current state analysis',
                'The original seven-step nav broken down by event stage and steps, showing where consolidation was possible.',
                'Page break up diagram',
                '/images/case-studies/simplified-navigation/nav-breakdown.png',
              )}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#18181B', marginBottom: 8 }}>Early explorations</h3>
            <p style={{ fontSize: 15, color: '#71717A', lineHeight: 1.7 }}>
              Exploring various ways we could condense the nav into 3-4 simpler event stages. The main goal was to move away from a vertical side nav to some form of top nav.
            </p>
          </div>

          <IterationSwitcher slides={EARLY_SLIDES} onOpenLightbox={openLightbox} />
        </section>

        {/* REFINED CONCEPT */}
        <section id="section-refined" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '55px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>Refined concept</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            We ran a workshop with the PM, engineers, and myself. We shared ideas of concepts from Figma Make to quickly coded prototypes. We narrowed it down to a combination of 2 concepts which I refined further before sending final feedback.
          </p>
          <IterationSwitcher slides={REFINED_SLIDES} onOpenLightbox={openLightbox} />
          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#18181B', marginBottom: 12 }}>Internal feedback</h3>
            <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {[
                "The user should see what step they're on at all times.",
                "They should quickly be able to access other pages, even when in subpages.",
                "Reducing the number of steps to make event management feel simpler was important.",
              ].map((item, i) => (
                <li key={i} style={{ fontSize: 14, color: '#71717A', lineHeight: 1.7 }}>{item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* ADDITIONAL DETAILS */}
        <section id="section-additional" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '55px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>Additional details</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            Small improvements surfaced during team review — refinements to the todo section of the UI.
          </p>
          <IterationSwitcher slides={ADDITIONAL_SLIDES} onOpenLightbox={openLightbox} />
        </section>

        {/* CONCLUSION */}
        <section id="section-conclusion" style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '55px' }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: '#18181B', marginBottom: 16 }}>Conclusion</h2>
          <p style={{ fontSize: 15, fontWeight: 400, color: '#71717A', lineHeight: 1.7 }}>
            A few of the more significant choices made during the project — and the reasoning behind them.
          </p>

          <div style={{ marginTop: 40, display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 16, rowGap: 32, alignItems: 'start' }}>
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
              <React.Fragment key={i}>
                <span style={{
                  fontSize: 12, fontWeight: 600,
                  borderRadius: 4, padding: '3px 7px',
                  alignSelf: 'start', justifySelf: 'start',
                  marginTop: 2,
                  ...item.tagStyle,
                }}>
                  {item.tag}
                </span>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: '#27272A', marginBottom: 6 }}>{item.title}</div>
                  <div style={{ fontSize: 14, color: '#71717A', lineHeight: 1.7 }}>{item.body}</div>
                </div>
              </React.Fragment>
            ))}
          </div>

          <div style={{ marginTop: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: '#18181B', marginBottom: 4 }}>Interactive prototype</h3>
            <p style={{ fontSize: 14, color: '#71717A', lineHeight: 1.7, marginBottom: 16 }}>Click on tabs and subpages in the dropdown menu.</p>
            <div style={{
              background: '#F4F4F5',
              borderRadius: 16,
              padding: 0,
            }}>
              <MegaMenuTile />
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
