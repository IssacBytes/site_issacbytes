import Link from 'next/link'
import { prompt } from '@/site.config'
import { Shell } from '@/components/Shell'

export default function NotFound() {
  return (
    <Shell keybar={{ label: 'NOT FOUND' }}>
      <div className="wrap" style={{ minHeight: '58vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', maxWidth: 720, padding: '40px var(--pad)' }}>
        <div className="prompt" style={{ marginBottom: 10 }}>
          {prompt}:~$ cd /写作/这篇不存在
        </div>
        <div style={{ fontSize: 14, color: 'var(--red,#e0674a)', marginBottom: 34 }}>
          zsh: cd: no such file or directory: /写作/这篇不存在
        </div>
        <div
          style={{
            fontSize: 120,
            fontWeight: 700,
            lineHeight: 0.9,
            letterSpacing: '-.04em',
            color: 'var(--am,#e8b25a)',
            animation: 'glitch404 3.6s infinite',
          }}
        >
          404
        </div>
        <div style={{ fontSize: 16, color: 'rgb(var(--inkrgb,233 226 208) / .75)', margin: '18px 0 30px' }}>
          页面走丢了 —— 但你还站在 <span style={{ color: 'var(--am,#e8b25a)' }}>~</span> 里,没事。
        </div>
        <div style={{ fontSize: 13, color: 'var(--green,#79c98a)', marginBottom: 12 }}>did you mean:</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, fontSize: 13 }}>
          <Link href="/writing/" className="hbg" style={{ border: '1px solid rgb(var(--amrgb,232 178 90) / .3)', padding: '8px 16px', color: 'var(--am,#e8b25a)' }}>
            cd ~/writing
          </Link>
          <Link href="/projects/" className="hb" style={{ border: '1px solid rgb(var(--amrgb,232 178 90) / .2)', padding: '8px 16px', color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            cd ~/projects
          </Link>
          <Link href="/about/" className="hb" style={{ border: '1px solid rgb(var(--amrgb,232 178 90) / .2)', padding: '8px 16px', color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            cd ~/about
          </Link>
          <Link href="/" className="hb" style={{ border: '1px solid rgb(var(--amrgb,232 178 90) / .2)', padding: '8px 16px', color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
            cd ~ &amp; 回首页
          </Link>
        </div>
        <div style={{ marginTop: 38, fontSize: 14, color: 'rgb(var(--inkrgb,233 226 208) / .75)' }}>
          {prompt}:~$ <span className="cur" style={{ height: 16 }} />
        </div>
      </div>
    </Shell>
  )
}
