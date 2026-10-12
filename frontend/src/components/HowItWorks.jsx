import './HowItWorks.css'

export default function HowItWorks() {
  const steps = [
    { n: 1, title: 'Upload', text: 'Upload a PDF and paste a job description. The PDF is processed in memory, not retained as a file.' },
    { n: 2, title: 'Parse', text: 'The job description, filename, and results are saved in the app database. If AI is enabled, extracted resume text is sent to the configured AI provider.' },
    { n: 3, title: 'Score', text: 'You get a 0–100 score plus the exact skills present and missing.' },
  ]

  return (
    <section id="how" className="how-section">
      <div className="container">
        <h2 className="section-title">How it <span className="highlight">works</span></h2>
        <div className="steps">
          {steps.map((s) => (
            <div className="step" key={s.n}>
              <span className="step-number">{s.n}</span>
              <h3>{s.title}</h3>
              <p>{s.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
