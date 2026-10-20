'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import FormBuilderTile from '@/components/tiles/FormBuilderTile'
import MegaMenuTile from '@/components/tiles/MegaMenuTile'
import VinylTile from '@/components/tiles/VinylTile'
import TextEditorTile from '@/components/tiles/TextEditorTile'
import VideoTile from '@/components/tiles/VideoTile'
import Button from '@/components/ui/Button'
import SectionHeading from '@/components/ui/SectionHeading'
import { SlotText } from 'slot-text/react'
import 'slot-text/style.css'

const CONTAINER = { maxWidth: 1100, margin: "0 auto" }
const WORDS = ['playground', 'elements', 'designs']

export default function Home() {
  const [wordIndex, setWordIndex] = useState(0)
  const [navVisible, setNavVisible] = useState(false)
  const sectionRef = useRef<HTMLElement>(null)
  const introRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = introRef.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setNavVisible(!entry.isIntersecting && entry.boundingClientRect.bottom < 0)
      },
      { threshold: 0 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

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
      <nav className={`fixed top-0 left-0 right-0 z-50 divider-line-header hp-nav${navVisible ? ' hp-nav--visible' : ''}`} style={{ backgroundColor: 'rgba(253, 253, 252, 0.8)', backdropFilter: 'blur(12px)', borderBottomWidth: 1, borderBottomStyle: 'solid' }}>
        <div
          className="site-container flex items-center justify-between"
          style={{ ...CONTAINER, height: 56 }}
        >
          <span style={{ color: 'var(--color-heading)', fontWeight: 'var(--font-weight-medium)', fontSize: 'var(--font-size-small)' }}>
            Glen Mitchell
          </span>
          <ul className="flex items-center gap-8 list-none">
            <li>
              <a href="#projects" className="nav-link" style={{ fontSize: 'var(--font-size-small)' }}>
                Projects
              </a>
            </li>
            <li>
              <a href="#interactive-playground" className="nav-link" style={{ fontSize: 'var(--font-size-small)' }}>
                Interactive playground
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
      <div className="site-container hp-main" style={CONTAINER}>
        {/* Hero Section */}
        <section ref={introRef}>
          <div className="hp-intro" style={{ maxWidth: 510, padding: '168px 0 0' }}>
            <div className="flex items-center" style={{ gap: 16, marginBottom: 32 }}>
              <Image
                src="/images/home/profile-photo.png"
                width={44}
                height={44}
                alt="Glen Mitchell"
                style={{ borderRadius: 12, objectFit: 'cover', backgroundColor: 'rgba(0,0,0,0.04)' }}
              />
              <div>
                <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-medium)', color: 'var(--color-primary)' }}>Glen Mitchell</div>
                <div style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-muted)' }}>Product designer</div>
              </div>
            </div>
            <p style={{ fontSize: 'var(--font-size-body)', fontWeight: 'var(--font-weight-regular)', color: 'var(--color-body)', lineHeight: 'var(--line-height-body)' }}>
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
          id="projects"
          ref={sectionRef}
          className="hp-section hp-section--first"
        >
          <SectionHeading>Projects</SectionHeading>
          <div className="sw-grid">

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
              <div className="sw-caption">
                <span className="sw-title">Simplified navigation</span>
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
              <div className="sw-caption">
                <span className="sw-title">Messages</span>
                <span className="sw-year text-zinc-500" style={{ fontSize: 'var(--font-size-nav)', fontWeight: 'var(--font-weight-regular)', whiteSpace: 'nowrap' }}>2025</span>
              </div>
            </Link>

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
              <div className="sw-caption">
                <span className="sw-title">Electricity tracker</span>
                <span className="sw-year text-zinc-500" style={{ fontSize: 'var(--font-size-nav)', fontWeight: 'var(--font-weight-regular)', whiteSpace: 'nowrap' }}>2026</span>
              </div>
            </Link>

          </div>
        </section>

        {/* Interface Details Section */}
        <section className="hp-section">
          <SectionHeading>Interface details</SectionHeading>
          <div className="vt-stack">
            <VideoTile
              src="/videos/home/overview-reel"
              caption="UI reel"
              label="A reel of interface work: an event overview, scheduling, document settings, Kai generating RFI questions, a supplier list, a mobile gym app flow and a bid sheet table"
            />
            <VideoTile
              src="/videos/home/notifications-reel"
              caption="Notifications tray"
              label="Notifications tray: a badge counts up, the tray opens, and one notification is marked as read"
            />
          </div>
        </section>

        {/* Work Section */}
        <section
          id="interactive-playground"
          className="hp-section"
        >
          <SectionHeading>Interactive <SlotText text={WORDS[wordIndex]} /></SectionHeading>
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
            <TextEditorTile />
          </div>

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
