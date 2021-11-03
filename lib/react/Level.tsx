import React, { useEffect, useMemo } from 'react'
import { Level as LevelT, LevelContext, LevelProps, useGame } from './types'

export const Level = (props: LevelProps) => {
  const game = useGame()

  const context = useMemo<LevelT>(() => {
    const { name, data } = props
    return {
      name,
      data,
      entities: [],
      resources: []
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
