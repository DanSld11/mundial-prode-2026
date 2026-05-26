import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #C8102E 0%, #8B0000 100%)',
          borderRadius: 102,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background decorations */}
        <div
          style={{
            position: 'absolute',
            top: -50,
            right: -50,
            width: 260,
            height: 260,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -40,
            left: -40,
            width: 180,
            height: 180,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
          }}
        />
        {/* Soccer ball */}
        <div style={{ fontSize: 200, lineHeight: 1, display: 'flex' }}>⚽</div>
        {/* Brand text */}
        <div
          style={{
            color: 'white',
            fontSize: 72,
            fontWeight: 900,
            letterSpacing: 10,
            marginTop: 16,
            display: 'flex',
          }}
        >
          2026
        </div>
        {/* Subtitle */}
        <div
          style={{
            color: 'rgba(255,255,255,0.65)',
            fontSize: 28,
            fontWeight: 600,
            letterSpacing: 6,
            marginTop: 6,
            display: 'flex',
          }}
        >
          MUNDIAL
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
