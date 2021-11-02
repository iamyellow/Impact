import React from 'react'
import { Game } from '../lib/react/Game'
import { LevelOne } from './level/LevelOne'

export const ExampleGame = () => {
  return (
    <Game scale={1} style={{ background: 'yellow', width: 612, height: 612 }}>
      <LevelOne />
    </Game>
  )
}
