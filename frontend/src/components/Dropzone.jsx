import { useRef, useState } from 'react'
import { mockAnalyze, validateFile } from '../utils/mockParser'
import './Dropzone.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

export default function Dropzone({ onAnalyzed }) {
  const fileInput = useRef(null)
  const [state, setState] = useState('idle')
  const [fileName, setFileName] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [jdText, setJdText] = useState('')
  const [error, setError] = useState(null)
  const [dragOver, setDragOver] = useState(false)

  function handleFile(file) {
    const problem = validateFile(file)
    if (problem) {
      setError(problem)
      return
    }

    setSelectedFile(file)
    setFileName(file.name)
    setError(null)
  }

  async function analyzeResume(file, jobDescription) {
    if (!file) {
      setError('Upload a PDF resume first.')
      return
    }

    if (!jobDescription.trim() || jobDescription.trim().length < 30) {
      setError('Paste a job description with at least 30 characters.')
      return
    }

    setError(null)
    setState('analyzing')

    try {
      const formData = new FormData()
      formData.append('resume', file)
      formData.append('jd', jobDescription)

      const response = await fetch(`${API_URL}/api/analyze`, {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Failed to analyze resume')

      setState('done')
      onAnalyzed(data)
      return
    } catch (_err) {
      const fallback = await mockAnalyze(file.name, jobDescription)
      setState('done')
      onAnalyzed(fallback)
    }
  }

  function reset(e) {
    e.stopPropagation()
    if (fileInput.current) fileInput.current.value = ''
    setSelectedFile(null)
    setFileName('')
    setJdText('')
    setState('idle')
    setError(null)
    onAnalyzed(null)
  }

  const classes = ['dropzone', dragOver && 'dragover'].filter(Boolean).join(' ')

  return (
    <section id="upload" className="upload-section">
      <div className="container analysis-panel">
        <label className="field-label" htmlFor="jd-text">Job description</label>
        <textarea
          id="jd-text"
          className="jd-input"
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the job description here so the resume can be compared against the required skills..."
        />

        <div
          className={classes}
          role="button"
          tabIndex={0}
          aria-label="Upload resume PDF"
          onClick={() => state === 'idle' && fileInput.current?.click()}
          onKeyDown={(e) => {
            if ((e.key === 'Enter' || e.key === ' ') && state === 'idle') {
              e.preventDefault()
              fileInput.current?.click()
            }
          }}
          onDragOver={(e) => {
            e.preventDefault()
            setDragOver(true)
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragOver(false)
            handleFile(e.dataTransfer.files[0])
          }}
        >
          <input
            ref={fileInput}
            type="file"
            accept="application/pdf"
            hidden
            onChange={(e) => handleFile(e.target.files[0])}
          />

          {state === 'idle' && (
            <div className="dropzone-idle">
              <div className="dropzone-icon">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 16V4m0 0L7 9m5-5 5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </div>
              <p className="dropzone-title">Drop your resume here</p>
              <p className="dropzone-hint">or <span className="link">browse files</span> · PDF only · max 5&nbsp;MB</p>
            </div>
          )}

          {state === 'analyzing' && (
            <div className="dropzone-analyzing">
              <div className="spinner" />
              <p className="dropzone-title">Analyzing {fileName}…</p>
            </div>
          )}

          {state === 'done' && (
            <div className="dropzone-file">
              <div className="dropzone-icon dropzone-icon-done">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <p className="dropzone-title">{fileName}</p>
              <button className="btn btn-ghost btn-small" type="button" onClick={reset}>Upload another</button>
            </div>
          )}
        </div>

        <div className="action-row">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => analyzeResume(selectedFile, jdText)}
            disabled={state === 'analyzing'}
          >
            {state === 'analyzing' ? 'Analyzing…' : 'Analyze resume'}
          </button>
          <button type="button" className="btn btn-ghost" onClick={reset}>Reset</button>
        </div>

        {error && <p className="error">{error}</p>}
      </div>
    </section>
  )
}
