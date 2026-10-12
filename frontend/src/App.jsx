import { useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import Dropzone from './components/Dropzone.jsx'
import Results from './components/Results.jsx'
import HowItWorks from './components/HowItWorks.jsx'
import Footer from './components/Footer.jsx'

export default function App() {
  const [analysis, setAnalysis] = useState(null)

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Dropzone onAnalyzed={setAnalysis} />
        {analysis && <Results result={analysis} />}
        <HowItWorks />
      </main>
      <Footer />
    </>
  )
}
