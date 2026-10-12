export default function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="badge">
            <span className="badge-dot" />
            Mock demo · nothing leaves your browser
          </span>
          <h1>
            Your resume,<br />
            <span className="highlight">scored in seconds.</span>
          </h1>
          <p className="subtitle">
            Drop in a PDF. Get a 0–100 fit score, the skills you already show,
            and the exact ones recruiters are looking for that you&apos;re missing.
          </p>
          <div className="hero-cta">
            <a href="#upload" className="btn btn-primary btn-lg">
              Upload my resume
              <svg viewBox="0 0 24 24" fill="none" className="btn-icon" aria-hidden="true">
                <path d="M12 5v14m0 0-6-6m6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </a>
            <a href="#how" className="btn btn-ghost btn-lg">How it works</a>
          </div>
          <ul className="hero-stats">
            <li><strong>4</strong><span>skills scored</span></li>
            <li><strong>0s</strong><span>data uploaded</span></li>
            <li><strong>1</strong><span>PDF needed</span></li>
          </ul>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="mock-card">
            <div className="mock-header">
              <div className="mock-score">
                <svg viewBox="0 0 80 80">
                  <circle className="mock-ring-bg" cx="40" cy="40" r="34" />
                  <circle className="mock-ring-fg" cx="40" cy="40" r="34" />
                </svg>
                <span>78</span>
              </div>
              <div className="mock-lines">
                <div className="mock-line mock-line-strong" />
                <div className="mock-line" />
                <div className="mock-line mock-line-short" />
              </div>
            </div>
            <div className="mock-chips">
              <span className="chip chip-yes">Python</span>
              <span className="chip chip-yes">SQL</span>
              <span className="chip chip-no">Docker</span>
              <span className="chip chip-no">AWS</span>
            </div>
          </div>
          <div className="mock-glow" />
        </div>
      </div>
    </section>
  )
}
