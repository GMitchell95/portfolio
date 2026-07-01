'use client';

export default function PhoneVideo({
  src,
  label,
}: {
  src: string;
  label: string;
}) {
  return (
    <div
      aria-label={label}
      style={{ position: 'relative', width: '100%', aspectRatio: '450 / 920' }}
    >
      {/* Layer 0 — background colour visible behind the screen area */}
      <div style={{
        position: 'absolute',
        top: '2.2%', bottom: '2.28%', left: '3.5%', right: '3.5%',
        background: '#060D18',
        borderRadius: '30px',
        zIndex: 0,
      }} />

      {/* Layer 1 — video */}
      <div style={{
        position: 'absolute',
        top: '6.2%', bottom: '2.28%', left: '3.5%', right: '3.5%',
        borderTopLeftRadius: '0px',
        borderTopRightRadius: '0px',
        borderBottomLeftRadius: '30px',
        borderBottomRightRadius: '30px',
        overflow: 'hidden',
        zIndex: 1,
      }}>
        <video
          autoPlay
          loop
          muted
          playsInline
          style={{ width: '100%', height: '100%', display: 'block' }}
        >
          <source src={src} type="video/mp4" />
        </video>
        <div style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '3.7%',
          background: '#0E1727',
          zIndex: 1,
          pointerEvents: 'none',
        }} />
      </div>

      {/* Layer 2 — iPhone frame on top */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/images/case-studies/electricity-tracker/iphone.png"
        alt=""
        style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, width: '100%', height: '100%', zIndex: 2, pointerEvents: 'none', display: 'block' }}
      />
    </div>
  );
}
