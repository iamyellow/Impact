import React, { useContext, useEffect, useMemo, useRef } from 'react'
import { Impact, makeImpactInstance } from '../impact'

export type GameProps = { children?: React.ReactNode }

const context = React.createContext<Impact>({} as Impact)

export const useImpactContext = () => {
  return useContext(context)
}

export const Game = (props: GameProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {}, [])

  const ig = useMemo(() => {
    return makeImpactInstance()
  }, [])

  return (
    <context.Provider value={ig}>
      <canvas ref={canvasRef} />
      {props.children}
    </context.Provider>
  )
}
