import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #C8102E 0%, #8B0000 100%)',
          borderRadius: 38,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background circle decoration */}
        <div
          style={{
            position: 'absolute',
            top: -20,
            right: -20,
            width: 100,
            height: 100,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.08)',
            display: 'flex',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -15,
            left: -15,
            width: 70,
            height: 70,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.06)',
            display: 'flex',
          }}
        />
        {/* Soccer ball */}
        <div style={{ fontSize: 72, lineHeight: 1, display: 'flex' }}>⚽</div>
        {/* Year text */}
        <div
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: 900,
            letterSpacing: 4,
            marginTop: 8,
            display: 'flex',
          }}
        >
          2026
        </div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
