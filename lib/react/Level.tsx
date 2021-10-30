import React, { useEffect, useMemo } from 'react'
import { LevelContext, LevelContextT, useGameContext } from './context'

export type LevelProps = {
  children?: React.ReactNode
  name: string
  data: object
  onUpdate: () => void
}

export const Level = (props: LevelProps) => {
  const game = useGameContext()

  const context = useMemo<LevelContextT>(() => {
    return {} as LevelContextT
  }, [])

  useEffect(() => {
    const { name, data, onUpdate } = props
    game.setLevel({ name, data, onUpdate })

    return () => {
      game.clearLevel()
    }
  }, [])

  return (
    <LevelContext.Provider value={context}>
      {props.children}
    </LevelContext.Provider>
  )
}
