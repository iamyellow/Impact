import React, { useCallback } from 'react'
import { Animation, AnimationSheet } from '../../lib/react/AnimationSheet'
import { useImpact } from '../../lib/react/context'
import { Entity } from '../../lib/react/Entity'
import { KeyInput } from '../../lib/react/Input'
import playerpng from './player.png'

export enum PlayerAnimation {
  IDLE = 'idle',
  JUMP = 'jump'
}

export enum PlayerKeyInput {
  LEFT = 'left',
  RIGHT = 'right'
}

export const EntityPlayer = () => {
  const ig = useImpact()

  // TODO: ImpactEntity arg
  const onUpdate = useCallback(() => {
    if (ig.input.state(PlayerKeyInput.LEFT)) {
      // TODO: move left
    }

    console.log('*** update game')
  }, [])

  return (
    <Entity name="Player" size={{ x: 16, y: 16 }}>
      <AnimationSheet image={playerpng} width={8} height={8}>
        <Animation name={PlayerAnimation.IDLE} duration={1} frames={[0]} />
        <Animation
          name={PlayerAnimation.JUMP}
          duration={0.07}
          frames={[1, 2]}
        />
      </AnimationSheet>
      <KeyInput keyCode={ig.KEY.LEFT_ARROW} name={PlayerKeyInput.LEFT} />
      <KeyInput keyCode={ig.KEY.RIGHT_ARROW} name={PlayerKeyInput.RIGHT} />
    </Entity>
  )
}
