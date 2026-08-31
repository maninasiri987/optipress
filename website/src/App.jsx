import { useState, useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import Problem from './components/Problem'
import Solution from './components/Solution'
import Features from './components/Features'
import Statistics from './components/Statistics'
import AutomaticOptimization from './components/AutomaticOptimization'
import NightScheduler from './components/NightScheduler'
import WooCommerce from './components/WooCommerce'
import LocalProcessing from './components/LocalProcessing'
import BackupRestore from './components/BackupRestore'
import HowItWorks from './components/HowItWorks'
import WhyOptiPress from './components/WhyOptiPress'
import FAQ from './components/FAQ'
import FinalCTA from './components/FinalCTA'
import Footer from './components/Footer'
import Help from './components/Help'
import { useScrollReveal } from './hooks/useScrollReveal'

function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const onHashChange = () => setHash(window.location.hash)
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])
  return hash
}

export default function App() {
  useScrollReveal()
  const hash = useHash()
  const isHelp = hash === '#help'

  return (
    <div className="bg-ink-950 text-ink-100 font-sans leading-relaxed antialiased">
      <Navbar />
      {isHelp ? (
        <Help />
      ) : (
        <>
          <Hero />
          <Problem />
          <Solution />
          <Features />
          <Statistics />
          <AutomaticOptimization />
          <NightScheduler />
          <WooCommerce />
          <LocalProcessing />
          <BackupRestore />
          <HowItWorks />
          <WhyOptiPress />
          <FAQ />
          <FinalCTA />
        </>
      )}
      <Footer />
    </div>
  )
}
