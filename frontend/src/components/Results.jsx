import { useEffect, useRef, useState } from 'react'
import './Results.css'

const RING_LENGTH = 2 * Math.PI * 52

function headlineFor(score) {
  if (score >= 70) return 'Strong match'
  if (score >= 50) return 'Good fit'
  return 'Needs work'
}

function summaryFor(score) {
  if (score >= 70) return 'Your resume covers most of the skills recruiters look for in this role.'
  if (score >= 50) return 'Your resume is in the ballpark — a few key skills would push it higher.'
  return 'Several core skills are missing from your resume. Focus on the red list below.'
}

export default function Results({ result }) {
  const {
    score,
    requiredSkills = [],
    present,
    missing,
    presentSkills = [],
    missingSkills = [],
    summary,
    evaluationMethod,
    saved,
    storageWarning,
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
            <h2>{headlineFor(score)}</h2>
            <p>{summary || summaryFor(score)}</p>
          </div>
        </div>

        <div className="skills-grid">
          <div className="skill-card skill-card-required">
            <div className="skill-card-head">
              <h3>Skills needed for this role</h3>
              <span className="skill-count">{requiredSkills.length} required</span>
            </div>
            <ul className="skill-list">
              {requiredSkills.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
          <div className="skill-card skill-card-present">
            <div className="skill-card-head">
              <h3>Skills present</h3>
              <span className="skill-count">{presentList.length} found</span>
            </div>
            <ul className="skill-list">
              {presentList.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
          <div className="skill-card skill-card-missing">
            <div className="skill-card-head">
              <h3>Missing skills to develop</h3>
              <span className="skill-count">{missingList.length} gaps</span>
            </div>
            <ul className="skill-list">
              {missingList.map((skill) => <li key={skill}>{skill}</li>)}
            </ul>
          </div>
        </div>

        <p className="disclaimer">
          {evaluationMethod === 'ai'
            ? 'AI-assisted evaluation. Treat this score as guidance and review results for your role.'
            : 'AI evaluation is unavailable; this score uses rule-based skill matching and may be less complete.'}
        </p>
        {saved === false && (
          <p className="save-notice" role="status">
            {storageWarning || 'Your score is ready, but this result could not be saved because the database is unavailable.'}
          </p>
        )}
      </div>
    </section>
  )
}
