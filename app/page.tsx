'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FormBuilderTile from '@/components/tiles/FormBuilderTile'
import MegaMenuTile from '@/components/tiles/MegaMenuTile'
import VinylTile from '@/components/tiles/VinylTile'
import Button from '@/components/ui/Button'
import { SlotText } from 'slot-text/react'
import 'slot-text/style.css'

const CONTAINER = { maxWidth: 1100, margin: "0 auto" }
const WORDS = ['playground', 'elements', 'designs']

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0)
  const sectionRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = sectionRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('sw-visible')
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % WORDS.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [])

  return (
    <>
      {/* Fixed Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 divider-line-header" style={{ backgroundColor: 'rgba(253, 253, 252, 0.8)', backdropFilter: 'blur(12px)', borderBottomWidth: 1, borderBottomStyle: 'solid' }}>
        <div
          className="site-container flex items-center justify-between"
          style={{ ...CONTAINER, height: 56 }}
        >
          <span style={{ color: 'var(--color-heading)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-small)' }}>
            Glen Mitchell
          </span>
          <ul className="flex items-center gap-8 list-none">
            <li>
              <a href="#work" className="nav-link" style={{ fontSize: 'var(--font-size-small)' }}>
                Work
              </a>
            </li>
            <li>
              <a href="#about" className="nav-link" style={{ fontSize: 'var(--font-size-small)' }}>
                About
              </a>
            </li>
            <li>
              <a href="mailto:glenmitchell95@gmail.com?subject=I%27m%20reaching%20out%20about%20..." className="nav-link" style={{ fontSize: 'var(--font-size-small)' }}>
                Contact
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Page content */}
      <div className="site-container" style={CONTAINER}>
        {/* Hero Section */}
        <section>
          <div style={{ maxWidth: 510, padding: '136px 0 80px' }}>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
              I&rsquo;m Glen, an Irish product designer currently based in Barcelona.
            </p>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)', marginTop: 16 }}>
              I&rsquo;ve spent over 5 years designing a complex B2B product at{' '}
              <a href="https://www.keelvar.com/" target="_blank" rel="noopener noreferrer" className="hero-link hero-link--purple">Keelvar</a>
              , an agentic sourcing platform. Recently I rebuilt this portfolio to learn what it&rsquo;s like to prototype and build with Claude.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 32 }}>
              <a href="https://www.linkedin.com/in/glenmitchell95/" target="_blank" rel="noopener noreferrer" className="hero-link hero-link--zinc" style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-body)' }}>
                LinkedIn
              </a>
              <div style={{ width: 1, height: 12, backgroundColor: 'var(--color-border)' }} />
              <a href="mailto:glenmitchelldesign@gmail.com" className="hero-link hero-link--zinc" style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-body)' }}>
                Email me
              </a>
            </div>
          </div>
        </section>

        {/* Selected Work Section */}
        <section
          ref={sectionRef}
          className="border-t"
          style={{ borderColor: 'var(--color-surface)', padding: '80px 0' }}
        >
          <h2 style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-heading)', marginBottom: 32 }}>
            Selected work
          </h2>
          <div className="sw-grid">

            {/* Electricity Tracker — portrait */}
            <Link href="/projects/electricity-tracker" className="sw-tile">
              <div className="sw-img-container sw-img-container--portrait bg-zinc-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/images/case-studies/electricity-tracker/hero.png"
                  alt="Electricity tracker"
                  className="sw-img"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    objectPosition: 'top',
                    borderRadius: '8px 8px 0 0',
                  }}
                />
              </div>
              <div style={{ paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                <span className="text-zinc-800" style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)' }}>Electricity tracker</span>
                <span className="sw-year text-zinc-500" style={{ fontSize: 'var(--font-size-nav)', fontWeight: 'var(--font-weight-regular)', whiteSpace: 'nowrap' }}>2026</span>
              </div>
            </Link>

            {/* Simplified Navigation — landscape */}
            <Link href="/projects/simplified-navigation" className="sw-tile">
              <div className="sw-img-container bg-zinc-100">
                <Image
                  src="/images/case-studies/simplified-navigation/home-simplified-nav.png"
                  alt="Simplified navigation"
                  width={3200}
                  height={1800}
                  className="sw-img"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div style={{ paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                <span className="text-zinc-800" style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)' }}>Simplified navigation</span>
                <span className="sw-year text-zinc-500" style={{ fontSize: 'var(--font-size-nav)', fontWeight: 'var(--font-weight-regular)', whiteSpace: 'nowrap' }}>2026</span>
              </div>
            </Link>

            {/* Messages — landscape */}
            <Link href="/projects/messages" className="sw-tile">
              <div className="sw-img-container bg-zinc-100">
                <Image
                  src="/images/case-studies/messages/home-messages.png"
                  alt="Messages"
                  width={3200}
                  height={1800}
                  className="sw-img"
                  style={{ width: '100%', height: 'auto' }}
                />
              </div>
              <div style={{ paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 16 }}>
                <span className="text-zinc-800" style={{ fontSize: 'var(--font-size-small)', fontWeight: 'var(--font-weight-medium)' }}>Messages</span>
                <span className="sw-year text-zinc-500" style={{ fontSize: 'var(--font-size-nav)', fontWeight: 'var(--font-weight-regular)', whiteSpace: 'nowrap' }}>2025</span>
              </div>
            </Link>

          </div>
        </section>

        {/* Work Section */}
        <section
          id="work"
          className="border-t"
          style={{ padding: "80px 0", borderColor: 'var(--color-surface)' }}
        >
          <h2
            className="mb-8"
            style={{ fontSize: 'var(--font-size-h3)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-heading)' }}
          >
            Interactive <SlotText text={WORDS[wordIndex]} />
          </h2>
          <div className="flex items-center justify-between" style={{ marginTop: 32, marginBottom: 12 }}>
            <span style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-heading)' }}>
              Simplified navigation
            </span>
            <Link href="/projects/simplified-navigation">
              <Button variant="outline" size="sm" icon={<i className="fa-solid fa-arrow-right" style={{ fontSize: 12 }} />}>
                View project
              </Button>
            </Link>
          </div>
          <MegaMenuTile />

          <div style={{ marginTop: 32 }}>
            <FormBuilderTile />
          </div>

          <div style={{ marginTop: 32 }}>
            <VinylTile />
          </div>
        </section>
      </div>
    </>
  );
}
