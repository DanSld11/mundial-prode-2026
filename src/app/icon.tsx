import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = { width: 32, height: 32 }
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(145deg, #C8102E 0%, #8B0000 100%)',
          borderRadius: 7,
        }}
      >
        <div style={{ fontSize: 20, lineHeight: 1, display: 'flex' }}>⚽</div>
      </div>
    ),
    { ...size }
  )
}
