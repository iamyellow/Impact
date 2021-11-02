import React, { useCallback } from 'react'
import { Entity } from '../../lib/react/Entity'
import { KeyInput } from '../../lib/react/Input'
import { AnimationSheet, useImpact } from '../../lib/react/types'
import playerpng from './player.png'

export enum PlayerAnimation {
  IDLE = 'idle',
  JUMP = 'jump'
}

export enum PlayerKeyInput {
  LEFT = 'left',
  RIGHT = 'right'
}

const animationSheet: AnimationSheet = {
  name: 'player',
  src: playerpng,
  width: 16,
  height: 24,
  animations: [
    { name: PlayerAnimation.IDLE, duration: 1, frames: [0] },
    { name: PlayerAnimation.JUMP, duration: 0.07, frames: [1, 2] }
  ]
}

export const EntityPlayer = () => {
  const ig = useImpact()

  const onUpdate = useCallback(() => {
    if (ig.input.state(PlayerKeyInput.LEFT)) {
      // TODO: move left
    }

    console.log('*** update entity')
  }, [])

  return (
    <Entity
      name="Player"
      size={{ x: 16, y: 16 }}
      animationSheet={animationSheet}
    >
      <KeyInput keyCode={ig.KEY.LEFT_ARROW} name={PlayerKeyInput.LEFT} />
      <KeyInput keyCode={ig.KEY.RIGHT_ARROW} name={PlayerKeyInput.RIGHT} />
    </Entity>
  )
}
