import { useEffect, useRef, useState } from 'react'
import './Results.css'

const RING_LENGTH = 2 * Math.PI * 52

export default function Results({ result }) {
  const {
    score,
    present,
    missing,
    presentSkills = [],
    missingSkills = [],
  } = result
  const presentList = present ?? presentSkills
  const missingList = missing ?? missingSkills
  const [displayScore, setDisplayScore] = useState(0)
  const frame = useRef(null)

  // Animate the number counting up from 0 to the score.
  useEffect(() => {
    const start = performance.now()
    const duration = 900
    function tick(now) {
      const t = Math.min((now - start) / duration, 1)
      setDisplayScore(Math.round(score * (1 - Math.pow(1 - t, 3))))
      if (t < 1) frame.current = requestAnimationFrame(tick)
    }
    frame.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame.current)
  }, [score])

  const ringColor = score >= 70 ? 'var(--yes)' : score >= 50 ? 'var(--warn)' : 'var(--no)'

  return (
    <section className="results-section">
      <div className="container">
        <div className="score-card">
          <div className="score-ring">
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle className="ring-bg" cx="60" cy="60" r="52" />
              <circle
                className="ring-fg"
                cx="60" cy="60" r="52"
                style={{ strokeDashoffset: RING_LENGTH * (1 - score / 100), stroke: ringColor }}
              />
            </svg>
            <div className="score-value">
              <span style={{ color: ringColor }}>{displayScore}</span>
              <span className="score-denominator">/100</span>
            </div>
          </div>
          <div className="score-copy">
            <h2>Resume match score</h2>
          </div>
        </div>

        <div className="skills-grid">
          <div className="skill-card skill-card-present">
            <div className="skill-card-head">
              <h3>Skills present</h3>
              <span className="skill-count">{presentList.length} found</span>
            </div>
            <ul className="skill-list">
              {presentList.length
                ? presentList.map((skill) => <li key={skill}>{skill}</li>)
                : <li className="skill-empty">No matching skills found in the resume.</li>}
            </ul>
          </div>
          <div className="skill-card skill-card-missing">
            <div className="skill-card-head">
              <h3>Missing skills to develop</h3>
              <span className="skill-count">{missingList.length} gaps</span>
            </div>
            <ul className="skill-list">
              {missingList.length
                ? missingList.map((skill) => <li key={skill}>{skill}</li>)
                : <li className="skill-empty">No missing skills identified for this role.</li>}
            </ul>
          </div>
        </div>

      </div>
    </section>
  )
}
