import React from 'react'
import { useGlobalContext } from '../provider/Context'

function Landing() {
  const { sample, setSample } = useGlobalContext()
  return (
    <>
      <h1>Landing Page</h1>
      <h2>{sample}</h2>
      <button onClick={() => setSample(sample + 1)}>Increment</button>
    </>
  )
}

export default Landing