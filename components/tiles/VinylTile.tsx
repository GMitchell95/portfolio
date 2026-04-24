'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import styles from './VinylTile.module.css'

// ── Data ─────────────────────────────────────────────────────
interface Album {
  track: string
  artist: string
  album: string
  spotify: string
  art: string
  c1: string
  tilt: string
  slideX: string
}

const ALBUMS: Album[] = [
  { track: 'No Reply',      artist: 'Tame Impala',    album: 'Deadbeat',          spotify: '5x0zW1JcdON7Zli2umGEJg', art: 'https://i.scdn.co/image/ab67616d00001e02208500450dcd0fd294d7bd3b', c1: '#f0a500', tilt: '-9deg', slideX: '-26px' },
  { track: 'Quik Stop',     artist: 'J. Cole',        album: 'The Fall-Off',      spotify: '050ECC7Yu78pTJP8PrMo8o', art: 'https://i.scdn.co/image/ab67616d00001e0280788f104c780412212e97e3', c1: '#8b5e1a', tilt: '-3deg', slideX: '-9px' },
  { track: 'Real Friends',  artist: 'Kanye West',     album: 'The Life of Pablo', spotify: '66Q3fAmSX5eHamgbKa9alP', art: 'https://i.scdn.co/image/ab67616d00001e022a7db835b912dc5014bd37f4', c1: '#d4a843', tilt:  '1deg', slideX:  '2px' },
  { track: 'Arabella',      artist: 'Arctic Monkeys', album: 'AM',                spotify: '7nzsY8vlnKdvGOEE0rjAXZ', art: 'https://i.scdn.co/image/ab67616d00001e024ae1c4c5c45aabe565499163', c1: '#cc0033', tilt:  '5deg', slideX: '13px' },
  { track: 'Bug',           artist: 'Fontaines D.C.', album: 'Romance',           spotify: '0MXmiqd7zoXxv6Gqn9ahhQ', art: 'https://i.scdn.co/image/ab67616d00001e02f69e28716be1331924f25f2e', c1: '#c0408a', tilt:  '9deg', slideX: '24px' },
]

const DEFAULT_INSTRUCTION = 'Click to open album, drag the vinyl to the player'

function artProxy(url: string) {
  return `/api/album-art?url=${encodeURIComponent(url)}`
}

// ── Vinyl SVG ────────────────────────────────────────────────
function VinylSvg({ c1, artUrl, size, uid }: { c1: string; artUrl: string; size: number; uid: string }) {
  const cx = size / 2
  const labelR = cx * 0.28

  const rings = Array.from({ length: 24 }, (_, i) => {
    const r = 12 + (i / 24) * (cx - 18)
    const op = 0.03 + (i % 4 === 0 ? 0.055 : 0)
    return <circle key={i} cx={cx} cy={cx} r={r} fill="none" stroke={`rgba(255,255,255,${op})`} strokeWidth="0.7" />
  })

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ display: 'block', borderRadius: '50%' }}>
      <defs>
        <radialGradient id={`vg-${uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={c1} stopOpacity="0.45" />
          <stop offset="60%" stopColor="#111" />
          <stop offset="100%" stopColor="#080808" />
        </radialGradient>
        {artUrl && <clipPath id={`lc-${uid}`}><circle cx={cx} cy={cx} r={labelR} /></clipPath>}
      </defs>
      <circle cx={cx} cy={cx} r={cx} fill="#111" />
      <circle cx={cx} cy={cx} r={cx} fill={`url(#vg-${uid})`} opacity="0.6" />
      {rings}
      {artUrl ? (
        <image
          href={artUrl}
          x={cx - labelR} y={cx - labelR}
          width={labelR * 2} height={labelR * 2}
          clipPath={`url(#lc-${uid})`}
          preserveAspectRatio="xMidYMid slice"
        />
      ) : (
        <circle cx={cx} cy={cx} r={labelR} fill={c1} opacity="0.85" />
      )}
      <circle cx={cx} cy={cx} r={cx * 0.045} fill="#111" />
      <ellipse
        cx={cx * 0.76} cy={cx * 0.7}
        rx={cx * 0.12} ry={cx * 0.065}
        fill="rgba(255,255,255,0.03)"
        transform={`rotate(-35 ${cx} ${cx})`}
      />
    </svg>
  )
}

// ── Eject fly state ──────────────────────────────────────────
interface EjectFlyState {
  startLeft: number; startTop: number
  album: Album
  sourceIdx: number | null
}

// ── Component ────────────────────────────────────────────────
export default function VinylTile() {
  const [openIdx, setOpenIdx]             = useState<number | null>(null)
  const [discAnimated, setDiscAnimated]   = useState(false)
  const [isDragging, setIsDragging]       = useState(false)
  const [dragPos, setDragPos]             = useState({ x: 0, y: 0 })
  const [isOverPlatter, setIsOverPlatter] = useState(false)
  const [platterAlbum, setPlatterAlbum]   = useState<Album | null>(null)
  const [sourceAlbumIdx, setSourceAlbumIdx] = useState<number | null>(null)
  const [playState, setPlayState]         = useState<'ready' | 'playing' | null>(null)
  const [instruction, setInstruction]     = useState(DEFAULT_INSTRUCTION)
  const [imgLoaded, setImgLoaded]         = useState<boolean[]>(ALBUMS.map(() => false))
  const [ejectFly, setEjectFly]           = useState<EjectFlyState | null>(null)
  const [ejectFlyActive, setEjectFlyActive] = useState(false)
  const [isMounted, setIsMounted]         = useState(false)

  const platterRef    = useRef<HTMLDivElement>(null)
  const iframeRef     = useRef<HTMLIFrameElement>(null)
  const albumRefs     = useRef<(HTMLDivElement | null)[]>([])
  const imgElRefs     = useRef<(HTMLImageElement | null)[]>([])
  const dragPayload   = useRef<Album | null>(null)
  const dragSrcIdx    = useRef<number | null>(null)
  const isDraggingRef = useRef(false)
  const openIdxRef    = useRef<number | null>(null)
  const ejectFlyRef   = useRef<HTMLDivElement>(null)

  useEffect(() => { setIsMounted(true) }, [])

  // onLoad misses already-cached images — check .complete on mount
  useEffect(() => {
    imgElRefs.current.forEach((img, idx) => {
      if (img?.complete && img.naturalWidth > 0) {
        setImgLoaded(prev => {
          if (prev[idx]) return prev
          const n = [...prev]; n[idx] = true; return n
        })
      }
    })
  }, [])
  useEffect(() => { openIdxRef.current = openIdx }, [openIdx])

  // ── Open / close album ─────────────────────────────────────
  function openAlbum(idx: number) {
    setOpenIdx(idx)
    setDiscAnimated(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setDiscAnimated(true))
    })
    setInstruction('Drag the vinyl across to the player →')
  }

  function closeAlbum() {
    setDiscAnimated(false)
    setOpenIdx(null)
    setInstruction(DEFAULT_INSTRUCTION)
  }

  function handleAlbumClick(idx: number) {
    if (isDraggingRef.current) return
    const current = openIdxRef.current
    if (current === idx) {
      closeAlbum()
    } else {
      if (current !== null) setDiscAnimated(false)
      openAlbum(idx)
    }
  }

  // ── Drag ──────────────────────────────────────────────────
  function startDrag(e: React.MouseEvent | MouseEvent, idx: number, clientX: number, clientY: number) {
    isDraggingRef.current = true
    setIsDragging(true)
    dragPayload.current = ALBUMS[idx]
    dragSrcIdx.current = idx
    setDragPos({ x: clientX, y: clientY })

    function onMove(ev: MouseEvent) {
      setDragPos({ x: ev.clientX, y: ev.clientY })
      if (platterRef.current) {
        const pr = platterRef.current.getBoundingClientRect()
        const dist = Math.hypot(ev.clientX - (pr.left + pr.width / 2), ev.clientY - (pr.top + pr.height / 2))
        setIsOverPlatter(dist < pr.width / 2 + 24)
      }
    }

    function onUp(ev: MouseEvent) {
      isDraggingRef.current = false
      setIsDragging(false)
      setIsOverPlatter(false)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)

      if (platterRef.current && dragPayload.current) {
        const pr = platterRef.current.getBoundingClientRect()
        const dist = Math.hypot(ev.clientX - (pr.left + pr.width / 2), ev.clientY - (pr.top + pr.height / 2))
        if (dist < pr.width / 2 + 24) {
          const album = dragPayload.current
          const src = dragSrcIdx.current!
          // Close the album
          setOpenIdx(null)
          setDiscAnimated(false)
          placeOnPlatter(album, src)
        }
        // else: miss — disc stays visible (was hidden during drag, reshow)
      }
      dragPayload.current = null
      dragSrcIdx.current = null
    }

    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  function handleDiscMouseDown(e: React.MouseEvent, idx: number) {
    if (e.button !== 0) return
    e.preventDefault()
    e.stopPropagation()
    startDrag(e, idx, e.clientX, e.clientY)
  }

  function handleDiscTouchStart(e: React.TouchEvent, idx: number) {
    e.preventDefault()
    const t = e.touches[0]
    isDraggingRef.current = true
    setIsDragging(true)
    dragPayload.current = ALBUMS[idx]
    dragSrcIdx.current = idx
    setDragPos({ x: t.clientX, y: t.clientY })

    function onMove(ev: TouchEvent) {
      const tt = ev.touches[0]
      setDragPos({ x: tt.clientX, y: tt.clientY })
      if (platterRef.current) {
        const pr = platterRef.current.getBoundingClientRect()
        const dist = Math.hypot(tt.clientX - (pr.left + pr.width / 2), tt.clientY - (pr.top + pr.height / 2))
        setIsOverPlatter(dist < pr.width / 2 + 24)
      }
    }

    function onUp(ev: TouchEvent) {
      const tt = ev.changedTouches[0]
      isDraggingRef.current = false
      setIsDragging(false)
      setIsOverPlatter(false)
      document.removeEventListener('touchmove', onMove)
      document.removeEventListener('touchend', onUp)

      if (platterRef.current && dragPayload.current) {
        const pr = platterRef.current.getBoundingClientRect()
        const dist = Math.hypot(tt.clientX - (pr.left + pr.width / 2), tt.clientY - (pr.top + pr.height / 2))
        if (dist < pr.width / 2 + 24) {
          const album = dragPayload.current
          const src = dragSrcIdx.current!
          setOpenIdx(null)
          setDiscAnimated(false)
          placeOnPlatter(album, src)
        }
      }
      dragPayload.current = null
      dragSrcIdx.current = null
    }

    document.addEventListener('touchmove', onMove, { passive: false })
    document.addEventListener('touchend', onUp)
  }

  // ── Place on platter ───────────────────────────────────────
  function placeOnPlatter(album: Album, srcIdx: number) {
    stopPlayback(true)
    setPlatterAlbum(album)
    setSourceAlbumIdx(srcIdx)
    // Set src during mouseup (user gesture) so the embed can autoplay
    if (iframeRef.current) {
      iframeRef.current.src = `https://open.spotify.com/embed/track/${album.spotify}?utm_source=generator&theme=0&autoplay=1`
    }
    setTimeout(() => {
      setPlayState('ready')
      setInstruction('Click the tonearm to spin')
    }, 320)
  }

  // ── Drop needle ────────────────────────────────────────────
  function dropNeedle() {
    if (playState !== 'ready' || !platterAlbum) return
    setPlayState('playing')
    setInstruction('Now spinning — click ⏏ to eject')
  }

  // ── Eject ──────────────────────────────────────────────────
  function handleEject() {
    if (!platterRef.current) { stopPlayback(false); return }
    const pr = platterRef.current.getBoundingClientRect()
    // Capture sourceAlbumIdx before stopPlayback clears it
    const srcIdx = sourceAlbumIdx

    setEjectFly({
      startLeft: pr.left + pr.width / 2 - 82,
      startTop:  pr.top + pr.height / 2 - 82,
      album: platterAlbum!,
      sourceIdx: srcIdx,
    })
    setEjectFlyActive(false)

    requestAnimationFrame(() => {
      requestAnimationFrame(() => setEjectFlyActive(true))
    })

    stopPlayback(false)
    setTimeout(() => setEjectFly(null), 650)
  }

  function stopPlayback(silent: boolean) {
    setPlayState(null)
    if (!silent) {
      setPlatterAlbum(null)
      setSourceAlbumIdx(null)
      setInstruction(DEFAULT_INSTRUCTION)
      if (iframeRef.current) iframeRef.current.src = ''
    }
  }

  // ── Render ─────────────────────────────────────────────────
  const isPlaying = playState === 'playing'
  const isReady   = playState === 'ready'

  return (
    <div>
      {/* Section label */}
      <div style={{ fontSize: 12, fontWeight: 500, color: '#71717a', letterSpacing: '0.02em', marginBottom: 8 }}>
        Currently listening
      </div>

      {/* Tile */}
      <div className={styles.stage}>
        <div className={styles.layout}>

          {/* ── Shelf ──────────────────────────────────────── */}
          <div className={styles.shelf}>
            {ALBUMS.map((album, idx) => (
              <div
                key={idx}
                ref={el => { albumRefs.current[idx] = el }}
                className={`${styles.album} ${openIdx === idx ? styles.albumOpen : ''}`}
                style={{ '--tilt': album.tilt } as React.CSSProperties}
                onClick={() => handleAlbumClick(idx)}
              >
                {/* "click to open" badge */}
                <div className={styles.clickBadge}>click to open</div>

                {/* Floating disc — behind sleeve in z-order */}
                {openIdx === idx && (
                  <div
                    className={`${styles.disc} ${isDragging ? styles.discHidden : ''}`}
                    style={{
                      opacity:   discAnimated ? 1 : 0,
                      transform: discAnimated
                        ? `translateY(-88px) translateX(${album.slideX})`
                        : 'translateY(16px)',
                    }}
                    onMouseDown={e => handleDiscMouseDown(e, idx)}
                    onTouchStart={e => handleDiscTouchStart(e, idx)}
                  >
                    <VinylSvg c1={album.c1} artUrl={artProxy(album.art)} size={118} uid={`float-${idx}`} />
                  </div>
                )}

                {/* Sleeve */}
                <div className={styles.albumCover}>
                  <img
                    ref={el => { imgElRefs.current[idx] = el }}
                    className={`${styles.coverImg} ${imgLoaded[idx] ? styles.coverImgLoaded : ''}`}
                    src={artProxy(album.art)}
                    alt={`${album.album} — ${album.artist}`}
                    onLoad={() => setImgLoaded(prev => { const n = [...prev]; n[idx] = true; return n })}
                    draggable={false}
                  />
                  {!imgLoaded[idx] && <div className={styles.coverSkeleton} />}
                  <div className={styles.albumInfo}>
                    <div className={styles.albumInfoTitle}>{album.track}</div>
                    <div className={styles.albumInfoArtist}>{album.artist} · {album.album}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Turntable ───────────────────────────────────── */}
          <div className={styles.player}>
            <div className={styles.playerBase}>

              {/* LED */}
              <div className={`${styles.led} ${isPlaying ? styles.ledOn : ''}`} />

              {/* Platter */}
              <div
                ref={platterRef}
                className={`${styles.platter} ${isOverPlatter ? styles.platterDropTarget : ''}`}
              >
                <div className={`${styles.dropHint} ${isOverPlatter ? styles.dropHintActive : ''}`}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
                    stroke="rgba(68,67,180,0.65)" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M12 5v14M5 12l7 7 7-7" />
                  </svg>
                </div>

                {/* Placed vinyl */}
                <div className={`${styles.placedVinyl} ${platterAlbum ? styles.placedVinylVisible : ''} ${isPlaying ? styles.placedVinylSpinning : ''}`}>
                  {platterAlbum && (
                    <VinylSvg c1={platterAlbum.c1} artUrl={artProxy(platterAlbum.art)} size={164} uid="platter" />
                  )}
                </div>

                <div className={styles.spindle} />
              </div>

              {/* Tonearm */}
              <div
                className={`${styles.tonearmWrap} ${isReady ? styles.tonearmWrapReady : ''}`}
                onClick={() => { if (isReady) dropNeedle() }}
              >
                <div className={`${styles.tonearm} ${isPlaying ? styles.tonearmPlaying : ''}`}>
                  {/* Purple outline — shown when ready */}
                  {isReady && (
                    <svg
                      className={styles.tonearmOutline}
                      width="52" height="100" viewBox="0 0 52 100"
                      style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}
                    >
                      <circle cx="22" cy="13" r="12" fill="none" stroke="rgba(68,67,180,1)" strokeWidth="1.5" />
                      <line x1="22" y1="13" x2="9" y2="90" stroke="rgba(68,67,180,1)" strokeWidth="6" strokeLinecap="round" />
                      <rect x="0.5" y="81.5" width="19" height="12" rx="3.5" fill="none" stroke="rgba(68,67,180,1)" strokeWidth="1.5" />
                      <line x1="10" y1="92" x2="10" y2="101" stroke="rgba(68,67,180,1)" strokeWidth="3.5" strokeLinecap="round" />
                    </svg>
                  )}
                  {/* Arm */}
                  <svg width="52" height="100" viewBox="0 0 52 100" style={{ position: 'relative', zIndex: 1 }}>
                    <circle cx="22" cy="13" r="11" fill="#2a2a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                    <circle cx="22" cy="13" r="6" fill="#3a3a3e" />
                    <circle cx="22" cy="13" r="2.5" fill="#555" />
                    <line x1="22" y1="13" x2="9" y2="90" stroke="#555" strokeWidth="3.5" strokeLinecap="round" />
                    <rect x="2" y="83" width="16" height="9" rx="2.5" fill="#444" stroke="rgba(255,255,255,0.08)" strokeWidth="0.5" />
                    <line x1="10" y1="92" x2="10" y2="100" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
              </div>

              {/* Eject — visible whenever vinyl is on the platter */}
              <button
                className={`${styles.ejectBtn} ${platterAlbum ? styles.ejectBtnVisible : ''}`}
                title="Eject"
                onClick={handleEject}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                  stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M2 9h8M2 6.5l4-4 4 4" />
                </svg>
              </button>

            </div>
          </div>

        </div>

        <div className={styles.instruction}>{instruction}</div>
      </div>

      {/* ── Spotify iframe (hidden off-screen) ───────────── */}
      <iframe
        ref={iframeRef}
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        allowFullScreen
        title="Spotify player"
        style={{
          position: 'fixed',
          bottom: -200,
          left: -200,
          width: 1,
          height: 1,
          opacity: 0,
          pointerEvents: 'none',
          border: 'none',
        }}
      />

      {/* ── Drag ghost portal ─────────────────────────────── */}
      {isMounted && isDragging && dragPayload.current && createPortal(
        <div style={{
          position: 'fixed',
          left: dragPos.x,
          top: dragPos.y,
          transform: 'translate(-50%, -50%)',
          width: 120,
          height: 120,
          borderRadius: '50%',
          pointerEvents: 'none',
          zIndex: 99999,
          filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.45))',
          opacity: 0.92,
          willChange: 'transform',
        }}>
          <VinylSvg c1={dragPayload.current.c1} artUrl={artProxy(dragPayload.current.art)} size={120} uid="ghost" />
        </div>,
        document.body
      )}

      {/* ── Eject fly-back portal ─────────────────────────── */}
      {isMounted && ejectFly && (() => {
        const targetAlbumEl = ejectFly.sourceIdx !== null ? albumRefs.current[ejectFly.sourceIdx] : null
        let endLeft = ejectFly.startLeft
        let endTop  = ejectFly.startTop
        if (targetAlbumEl) {
          const ar = targetAlbumEl.getBoundingClientRect()
          endLeft = ar.left + ar.width / 2 - 74
          endTop  = ar.top + ar.height / 2 - 74
        }
        return createPortal(
          <div
            ref={ejectFlyRef}
            style={{
              position: 'fixed',
              width: 164,
              height: 164,
              borderRadius: '50%',
              pointerEvents: 'none',
              zIndex: 999,
              left: ejectFlyActive ? endLeft : ejectFly.startLeft,
              top:  ejectFlyActive ? endTop  : ejectFly.startTop,
              opacity:   ejectFlyActive ? 0 : 1,
              transform: ejectFlyActive ? 'scale(0.85)' : 'scale(1)',
              transition: ejectFlyActive
                ? 'left 0.55s cubic-bezier(0.4,0,0.2,1), top 0.55s cubic-bezier(0.4,0,0.2,1), opacity 0.3s ease 0.3s, transform 0.55s ease'
                : 'none',
            }}
          >
            <VinylSvg c1={ejectFly.album.c1} artUrl={artProxy(ejectFly.album.art)} size={164} uid="eject-fly" />
          </div>,
          document.body
        )
      })()}

    </div>
  )
}
