import { ImageResponse } from 'next/og'
import { site, prompt } from '@/site.config'

export const dynamic = 'force-static'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

// 社交分享卡。用拉丁字符(sign / 域名)避免无 CJK 字体时的方块;
// 需要中文卡面时可在此加载一份中文字体 buffer。
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#0f0e0a',
          padding: '64px 72px',
          fontFamily: 'monospace',
          color: '#e9e2d0',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', fontSize: 26, color: '#e8b25a' }}>{prompt}:~$ whoami</div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ fontSize: 128, fontWeight: 700, letterSpacing: '-0.03em', color: '#e8b25a' }}>{site.sign}</div>
          <div style={{ display: 'flex', height: 8, marginTop: 8 }}>
            <div style={{ width: 240, background: '#e8b25a' }} />
            <div style={{ width: 120, background: 'rgba(232,178,90,0.5)' }} />
            <div style={{ width: 80, background: '#79c98a' }} />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 30 }}>
          <span style={{ color: 'rgba(233,226,208,0.65)' }}>{site.domain}</span>
          <span style={{ color: 'rgba(233,226,208,0.4)', fontSize: 22 }}>phosphor terminal / personal site</span>
        </div>
      </div>
    ),
    size
  )
}
