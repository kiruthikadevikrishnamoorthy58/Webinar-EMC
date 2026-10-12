export default function Navbar() {
  return (
    <header className="nav">
      <div className="container nav-inner">
        <a href="#" className="logo">
          <span className="logo-zero">0</span>
          <svg className="logo-arrow" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 12h14m0 0-5-5m5 5-5 5" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="logo-text">Shipped</span>
        </a>
        <nav className="nav-links">
          <a href="#how">How it works</a>
          <a href="#upload">Try it</a>
        </nav>
        <a href="#upload" className="btn btn-primary btn-nav">Score my resume</a>
      </div>
    </header>
  )
}
