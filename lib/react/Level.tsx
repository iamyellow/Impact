import React, { useEffect, useMemo } from 'react'
import {
  LevelContext,
  LevelContextT,
  LevelProps,
  useGameContext
} from './types'

export const Level = (props: LevelProps) => {
  const game = useGameContext()

  const context = useMemo<LevelContextT>(() => {
    const { name, onUpdate } = props
    return {
      name,
      onUpdate,
      entityModules: []
    }
  }, [])

  useEffect(() => {
    game.setLevel(context)

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
