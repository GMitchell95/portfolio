'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import type { Slide, LightboxState } from '@/components/case-studies/simplified-navigation/types';
import ClickableImage from '@/components/case-studies/simplified-navigation/ClickableImage';
import ClickableVideo from '@/components/case-studies/simplified-navigation/ClickableVideo';
import IterationSwitcher from '@/components/case-studies/simplified-navigation/IterationSwitcher';
import Lightbox from '@/components/case-studies/simplified-navigation/Lightbox';

// ── Icons ────────────────────────────────────────────────────────────────────

function ChevronLeft({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

// ── Global styles ────────────────────────────────────────────────────────────

const GLOBAL_STYLES = `
  /* Reset background set by root layout */
  body { background: white !important; overflow-x: hidden; }

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

  /* Highlighter effect on scenario statement */
  .highlight-scenario {
    background: linear-gradient(
      104deg,
      transparent 0%,
      rgba(245, 253, 216, 0.6) 3%,
      rgba(245, 253, 216, 1) 6%,
      rgba(245, 253, 216, 0.9) 90%,
      rgba(245, 253, 216, 0.3) 95%,
      transparent 100%
    );
    border-radius: 4px;
    padding: 1px 3px;
    -webkit-box-decoration-break: clone;
    box-decoration-break: clone;
  }
`;

// ── Sections ─────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'section-approach-research', label: '1. Approach & Research' },
  { id: 'section-ideation', label: '2. Ideation: Interactions & Utility' },
  { id: 'section-key-experience', label: '3. Define a Key Experience' },
  { id: 'section-measuring-success', label: '4. Measuring Success' },
];

const KEY_EXPERIENCE_ITERATION_SLIDES: Slide[] = [
  {
    title: 'AI toolbar with original sidebar',
    label: 'Iteration 1',
    body: '',
    src: '/images/case-studies/reedsy-design-assignment/1-original-sidebar.png',
    width: 3520,
    height: 2120,
  },
  {
    title: 'AI toolbar with styles in sidebar',
    label: 'Iteration 2',
    body: '',
    src: '/images/case-studies/reedsy-design-assignment/2-styles-sidebar.png',
    width: 3520,
    height: 2120,
  },
  {
    title: 'Bottom styles toolbar with AI button',
    label: 'Iteration 3',
    body: '',
    src: '/images/case-studies/reedsy-design-assignment/3-stylesbar-bottom.png',
    width: 3520,
    height: 2120,
  },
  {
    title: 'Compact toolbar',
    label: 'Iteration 4',
    body: '',
    src: '/images/case-studies/reedsy-design-assignment/4-compact-toolbar.png',
    width: 3520,
    height: 2120,
  },
];

const KEY_EXPERIENCE_SLIDES: Slide[] = [
  {
    title: 'Toolbar, left aligned',
    body: '',
    src: '/images/case-studies/reedsy-design-assignment/toolbar-left.png',
    label: 'Toolbar, left aligned',
    width: 1760,
    height: 1060,
  },
  {
    title: 'Toolbar, right aligned',
    body: '',
    src: '/images/case-studies/reedsy-design-assignment/toolbar-right.png',
    label: 'Toolbar, right aligned',
    width: 1760,
    height: 1060,
  },
  {
    title: 'Both toolbars',
    body: '',
    src: '/images/case-studies/reedsy-design-assignment/both-toolbars.png',
    label: 'Both toolbars',
    width: 1760,
    height: 1060,
  },
];

const IDEATION_IDEAS: { idea: string; points: string[] }[] = [
  { idea: 'Productive window', points: ['Suggest their most productive time range for writing based on data'] },
  {
    idea: 'World or map building',
    points: [
      'Build a map or globe style world where you can visually see the locations of the story and characters',
      "See the character's route when travelling from one location to the next",
      'Scrub through a timeline showing when towns were destroyed or taken over, with flags for who ruled them',
      'Move parts of the map to match how the user envisioned it. Maybe in blocks',
    ],
  },
  { idea: 'Timeline builder', points: ['See character relationship and locations on a timeline at different points so the user can visually see whats happening. Following story arcs, the user can tag: Rise or rising action, Climax, Return or fall, Catastrophe'] },
  { idea: 'Character creation', points: ['Based on character descriptions, AI could show what the character would look like'] },
  { idea: 'Storyboarding', points: ['AI could sketch parts of the story or particular scenes like a comic book or storyboard'] },
  { idea: 'Chapter summaries', points: ['AI summarises chapters into two to three lines so the user can easily see what happened in each chapter'] },
  {
    idea: 'Embedded AI actions',
    points: ['User highlights text and sees AI actions appear: Check grammar, Fact check, Editor review, View relationship'],
  },
  {
    idea: 'View character relationship',
    points: [
      'View character relationships and interactions based on selection of text.',
      "Easily allow the user to dig into previous conversations and quickly find the interactions they've had.",
      'For larger books this makes it easy to pull up interactions without tediously searching for characters separately.',
    ],
  },
  { idea: 'Fact check', points: ['Allow writers to fact check parts of the book they are unsure about in a particular field, e.g. space'] },
  {
    idea: 'Editor mode',
    points: [
      "User turns on editor mode and defines the type of editor they'd want to review their work",
      "AI highlights areas with notes based on the editor's persona, pointing out holes or flaws that don't make sense",
      'Not a replacement for their editor, just a first pass to fix things before the real review',
    ],
  },
  { idea: 'AI motivational nudges', points: ['Messages to keep the user focused, similar to a Duolingo streak reminder'] },
];

const MEASURING_SUCCESS_METRICS: { name: string; calculation: string; description: string }[] = [
  {
    name: 'Click rate',
    calculation: "Click count on 'View relationship' button",
    description: "How often the 'View relationship' button was clicked. If a user is repeatedly clicking the button, it's likely they're repeatedly using the feature which is a positive sign.",
  },
  {
    name: 'Drop off rate',
    calculation: 'Funnel completion rate (click button, then view or click at least 1 other interaction card)',
    description: 'Want to understand how many times the flow was completed. If the flows were not completed, at what point did the user drop off?',
  },
  {
    name: 'Time to complete flow',
    calculation: "Duration from clicking the 'View relationship' button to clicking another interaction card or using the arrow buttons to change the interaction selection",
    description: 'Trying to understand how long it takes to complete the flow',
  },
  {
    name: 'Usage frequency over time',
    calculation: 'Uses per day/week',
    description: "Does the user try the feature and then stop using it? Tracking this over time shows whether it's becoming a feature people actually rely on.",
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReedsyDesignAssignmentPage() {
  const [headerVisible, setHeaderVisible] = useState(false);
  const [activeSection, setActiveSection] = useState('section-approach-research');
  const [lightbox, setLightbox] = useState<LightboxState>({ open: false, slides: [], index: 0, stateIndices: {} });
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const lastScrollYRef = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      if (heroTitleRef.current) {
        setHeaderVisible(heroTitleRef.current.getBoundingClientRect().bottom < 0);
      }
      if (window.innerWidth < 700 && headerRef.current) {
        if (window.scrollY < 100) {
          headerRef.current.classList.remove('cs-header--scroll-hidden');
          lastScrollYRef.current = window.scrollY;
        } else {
          const diff = window.scrollY - lastScrollYRef.current;
          if (Math.abs(diff) > 10) {
            headerRef.current.classList.toggle('cs-header--scroll-hidden', diff > 0);
            lastScrollYRef.current = window.scrollY;
          }
        }
      }
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 10) {
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
      <header ref={headerRef} className={`cs-header${headerVisible ? ' cs-header--visible' : ''}`}>
        <div className="cs-header-inner">
          <a href="/" className="cs-header-back">
            <ChevronLeft size={14} />
            Back
          </a>
          <span className="cs-header-divider" />
          <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>Reedsy</span>
        </div>
      </header>

      <div className="cs-header-spacer" />

      {/* ── SIDEBAR ───────────────────────────────────────────────────── */}
      <nav className="cs-sidebar sidebar-fade-in">
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
        <section>
          <div className="hero-stagger-el" style={{ paddingTop: 80, animationDelay: '0ms' }}>
            <div className="text-cyan-700" style={{ fontSize: 'var(--font-size-label)', fontWeight: 'var(--font-weight-medium)', letterSpacing: '0.06em', marginBottom: 8 }}>
              Design assignment
            </div>
            <h1
              ref={heroTitleRef}
              style={{ fontSize: 'var(--font-size-h1)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', lineHeight: 'var(--line-height-heading)', letterSpacing: '-0.025em', marginBottom: 16 }}
            >
              Reedsy
            </h1>
            <p style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-muted)', marginBottom: 16 }}>
              Glen Mitchell, 8 September 2026
            </p>
            <div style={{ background: 'var(--color-surface)', padding: 16, borderRadius: 12, marginBottom: 40 }}>
              <p style={{ fontSize: 'var(--font-size-body)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
                &ldquo;Beyond the chat box, how can AI help serious writers write better books with Reedsy Studio?&rdquo;
              </p>
            </div>
          </div>
        </section>

        {/* SECTIONS */}
        {SECTIONS.map((s, i) => (
          <section
            key={s.id}
            id={s.id}
            className={i === 0 ? 'hero-stagger-el' : undefined}
            style={{ padding: '40px 0', borderTop: '1px solid rgba(228,228,231,0.5)', scrollMarginTop: '39px', ...(i === 0 ? { animationDelay: '280ms' } : {}) }}
          >
            <h2 style={{ fontSize: 'var(--font-size-h2)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 16 }}>{s.label}</h2>
            {i === 0 ? (
              <ul style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', margin: 0, paddingLeft: 20, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li>
                  We don&apos;t want AI writing stories for users. There&apos;s a strong pushback against the use of AI in a lot of creative industries. So we need to keep that in mind.
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, listStyleType: 'circle' }}>
                    <li>It should aid the user, but not write the story for the user.</li>
                  </ul>
                </li>
                <li>
                  Type of research:
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <li>
                      <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-body)' }}>Surveys</span>
                      <br />
                      Try to reach a broad number of writers. For something topical like this, I think it makes sense to get as much input from writers as we can.
                    </li>
                    <li>
                      <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-body)' }}>Interviews</span>
                      <br />
                      Have discussions with writers to get their thoughts. Try and figure out what parts of AI usage are acceptable and not acceptable within the writing community. 6-10 interviews.
                    </li>
                    <li>
                      <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-body)' }}>Online research</span>
                      <br />
                      Deep dive through online articles and forums to see what writers are saying about AI usage. Look at the acceptable ways they&apos;re already using it in their current workflows.
                      <ul style={{ margin: '8px 0 0', paddingLeft: 20, listStyleType: 'circle' }}>
                        <li>
                          Tools to look into:
                          <ul style={{ margin: '8px 0 0', paddingLeft: 20, listStyleType: 'disc' }}>
                            <li>Grammarly - How are they using AI to improve users writing</li>
                            <li>Linear/Notion - How are they embedding AI into their workflows</li>
                            <li>Duolingo - How are they gamifying learning</li>
                          </ul>
                        </li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
            ) : i === 1 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    <th style={{ textAlign: 'left', fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-muted)', borderBottom: '1px solid rgba(228,228,231,0.5)', padding: '12px 12px 8px 0' }}>Idea</th>
                    <th style={{ textAlign: 'left', fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-muted)', borderBottom: '1px solid rgba(228,228,231,0.5)', padding: '12px 0 8px' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {IDEATION_IDEAS.map((row, rowIndex) => {
                    const isLastRow = rowIndex === IDEATION_IDEAS.length - 1;
                    const rowBorderBottom = isLastRow ? 'none' : '1px solid rgba(228,228,231,0.5)';
                    return (
                      <tr key={row.idea}>
                        <td style={{ width: 220, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', verticalAlign: 'top', borderBottom: rowBorderBottom, padding: '12px 12px 12px 0' }}>{row.idea}</td>
                        <td style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', verticalAlign: 'top', borderBottom: rowBorderBottom, padding: '12px 0' }}>
                          <ul style={{ margin: 0, paddingLeft: 20, listStyleType: 'disc' }}>
                            {row.points.map(point => (
                              <li key={point}>
                                {point}
                                {row.idea === 'Productive window' && point === 'Suggest their most productive time range for writing based on data' && (
                                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, listStyleType: 'circle' }}>
                                    <li>Your most productive writing hours: 🕗 08:00-11:15</li>
                                    <li>Average 8,000 words in this window</li>
                                    <li>That&apos;s 75% of your daily word count</li>
                                  </ul>
                                )}
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : i === 2 ? (
              <>
                <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 8 }}>Selected scenario</h3>
                <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginBottom: 8 }}>
                  <mark className="highlight-scenario">Easily view character relationships and interactions from selected text.</mark>
                </p>
                <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginBottom: 40 }}>
                  Tracking character relationships manually across a long manuscript must be tedious. By embedding this into the toolbar, appearing only when text is selected, writers can view a character&apos;s relationships and interaction history without breaking their flow, all while keeping the UI clean and reducing cognitive load.
                </p>
                <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 8 }}>Initial explorations</h3>
                <div style={{ marginBottom: 40 }}>
                  <IterationSwitcher
                    slides={KEY_EXPERIENCE_ITERATION_SLIDES}
                    onOpenLightbox={openLightbox}
                    aspectRatio="1420/869"
                    marginTop={0}
                  />
                </div>
                <div style={{ marginBottom: 40 }}>
                  <ClickableImage
                    label="Sidebar iterations"
                    src="/images/case-studies/reedsy-design-assignment/sidebar-iterations.png"
                    onClick={() => openSingleImage(
                      'Sidebar iterations',
                      '',
                      'Sidebar iterations',
                      '/images/case-studies/reedsy-design-assignment/sidebar-iterations.png',
                      3520, 2120
                    )}
                  />
                  <p style={{ fontSize: 'var(--font-size-label)', color: 'var(--color-muted)', textAlign: 'center', marginTop: 8 }}>
                    Quick iterations of the side panel
                  </p>
                </div>
                <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginBottom: 8 }}>Final flow</h3>
                <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginBottom: 12 }}>
                  The video shows the toolbar with AI actions appearing after text selection. It covers the panel opening, the character info minimising as the user scrolls the interactions panel, and finally viewing the different character interactions.
                </p>
                <div style={{
                  background: '#F1F1F1',
                  borderRadius: 16,
                  padding: 24,
                  overflow: 'hidden',
                }}>
                  <ClickableVideo
                    src="/videos/reedsy-design-assignment/reedsy-action-bar-preview.mp4"
                    lightboxSrc="/videos/reedsy-design-assignment/reedsy-action-bar-hq.mp4"
                    label="Reedsy action bar prototype"
                  />
                </div>
                <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginTop: 40, marginBottom: 12 }}>
                  As the user scrolls through interactions, the top section shrinks in size, allowing for more real estate for the user to see more interaction cards.
                </p>
                <ClickableImage
                  label="Scroll panel"
                  src="/images/case-studies/reedsy-design-assignment/scroll-panel.png"
                  aspectRatio="2158/2120"
                  onClick={() => openSingleImage(
                    'Scroll panel',
                    '',
                    'Scroll panel',
                    '/images/case-studies/reedsy-design-assignment/scroll-panel.png',
                    2158, 2120
                  )}
                />
                <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginTop: 40, marginBottom: 12 }}>
                  Showing how the toolbar snaps on the left and right side of the text container depending on the last word selected.
                </p>
                <div style={{ display: 'flex', gap: 16 }}>
                  {KEY_EXPERIENCE_SLIDES.map((slide, slideIndex) => (
                    <div key={slide.src} style={{ flex: 1, minWidth: 0 }}>
                      <ClickableImage
                        label={slide.label}
                        src={slide.src}
                        aspectRatio="1760/1060"
                        onClick={() => openLightbox(KEY_EXPERIENCE_SLIDES, slideIndex)}
                      />
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr>
                    <th style={{ width: 160, textAlign: 'left', fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-muted)', borderBottom: '1px solid rgba(228,228,231,0.5)', padding: '12px 12px 8px 0' }}>Name</th>
                    <th style={{ width: 220, textAlign: 'left', fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-muted)', borderBottom: '1px solid rgba(228,228,231,0.5)', padding: '12px 12px 8px 0' }}>Calculation</th>
                    <th style={{ textAlign: 'left', fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-muted)', borderBottom: '1px solid rgba(228,228,231,0.5)', padding: '12px 0 8px' }}>Description</th>
                  </tr>
                </thead>
                <tbody>
                  {MEASURING_SUCCESS_METRICS.map((row, rowIndex) => {
                    const isLastRow = rowIndex === MEASURING_SUCCESS_METRICS.length - 1;
                    const rowBorderBottom = isLastRow ? 'none' : '1px solid rgba(228,228,231,0.5)';
                    return (
                      <tr key={row.name}>
                        <td style={{ width: 160, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', verticalAlign: 'top', borderBottom: rowBorderBottom, padding: '12px 12px 12px 0' }}>{row.name}</td>
                        <td style={{ width: 220, fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', verticalAlign: 'top', borderBottom: rowBorderBottom, padding: '12px 12px 12px 0' }}>{row.calculation}</td>
                        <td style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', verticalAlign: 'top', borderBottom: rowBorderBottom, padding: '12px 0' }}>{row.description}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginTop: 40, marginBottom: 8 }}>How could you tell if this assistant truly helps writers, not just entertains them?</h3>
              <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
                I think the &apos;Click rate&apos; per user along with the &apos;Usage frequency over time&apos; will indicate if the feature is being used. If we see the numbers are consistent, it&apos;s likely they&apos;re repeatedly using the feature which is a positive sign. It is important however, to reach out to users for feedback. We shouldn&apos;t only rely on stats.
              </p>
              <h3 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-bold)', color: 'var(--color-heading)', marginTop: 40, marginBottom: 8 }}>What feedback mechanisms could you implement to improve the experience over time?</h3>
              <ul style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', margin: 0, paddingLeft: 20, listStyleType: 'disc', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <li>
                  Adding a dismissible pop-over showing at the bottom of the panel that asks if the user enjoys the feature. It should show after X amount of uses.
                  <ul style={{ margin: '8px 0 0', paddingLeft: 20, listStyleType: 'circle', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <li>Either showing a dialog text input to allow natural feedback</li>
                    <li>
                      Or providing a fixed set of answers or scale:
                      <ul style={{ margin: '8px 0 0', paddingLeft: 20, listStyleType: 'disc' }}>
                        <li>On a scale of 1-5, how useful is this new feature?</li>
                      </ul>
                    </li>
                  </ul>
                </li>
              </ul>
              </>
            )}
          </section>
        ))}

        {/* FOOTER */}
        <div style={{
          padding: '48px 0',
          borderTop: '1px solid rgba(228,228,231,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <span style={{ fontSize: 'var(--font-size-small)', color: 'var(--color-muted)' }}>Glen Mitchell</span>
        </div>

      </div>

      <Lightbox state={lightbox} onClose={closeLightbox} onNavigate={navigateLightbox} />
    </>
  );
}
