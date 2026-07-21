// CRT 覆盖层:全屏扫描线 + 顶部辉光晕影。纯装饰,不拦截指针。
export function Scanlines() {
  return (
    <>
      <div className="scanlines" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
    </>
  )
}
