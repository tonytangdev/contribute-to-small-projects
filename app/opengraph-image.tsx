import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'Contribute to Small Projects'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 72,
          background: 'linear-gradient(135deg, #f8fafc 0%, #dbeafe 50%, #e0e7ff 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontSize: 80,
              fontWeight: 900,
              background: 'linear-gradient(90deg, #0f172a 0%, #1e40af 50%, #4338ca 100%)',
              backgroundClip: 'text',
              color: 'transparent',
              marginBottom: 30,
              lineHeight: 1.1,
            }}
          >
            Contribute to Small Projects
          </div>
          <div
            style={{
              fontSize: 40,
              color: '#475569',
              maxWidth: 900,
              lineHeight: 1.4,
            }}
          >
            Discover open source projects with 100-600 stars — perfect for your first contributions
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}
