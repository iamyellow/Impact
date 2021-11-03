import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { makeImpactInstance } from '../impact'
import {
  Game as GameT,
  GameContext,
  GameProps,
  ImpactContext,
  Level
} from './types'

export const Game = (props: GameProps) => {
  const { children, className, style, ...impactDefaults } = props

  // state

  const [ready, setReady] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const levelRef = useRef<Level>()

  const ig = useMemo(() => {
    return makeImpactInstance()
  }, [])

  const loadLevel = useCallback(() => {
    console.log('*** loadLevel')
    // game.loadLevel(gameLevelRef.current!.data)

    console.log('*** startRunLoop')
    // ig.game.startRunLoop()
  }, [])

  const loadResources = useCallback(() => {
    console.log(`*** will load ${ig.resources.length} resources`)

    const total = ig.resources.length

    if (total === 0) {
      return loadLevel()
    }

    // TODO: progress start
    let loaded = 0
    ig.resources.forEach((resource) => {
      resource.load((path, success) => {
        if (!success) {
          throw 'Failed to load resource: ' + path
        }
        loaded += 1

        if (loaded === total) {
          // TODO: progress stop

          loadLevel()
        }
      })
    })
  }, [])

  const context = useMemo<GameT>(() => {
    return {
      setLevel(levelContext) {
        console.log(`*** setLevel ${levelContext.name}`)
        if (levelRef.current !== undefined) {
          throw 'One level at a time'
        }
        levelRef.current = levelContext

        loadResources()
      },
      clearLevel() {
        console.log('*** clearLevel')

        console.log('*** stopRunLoop')
        // ig.game.stopRunLoop()

        ig.resources.length = 0
        levelRef.current = undefined
      }
    }
  }, [])

  // effects

  useEffect(() => {
    if (canvasRef.current === null) {
      throw 'No canvas'
    }

    const { scale = 1 } = impactDefaults
    const { width, height } = canvasRef.current

    // TODO: remove 60 fps
    ig.system = new ig.System(canvasRef.current, 60, width, height, scale)
    ig.input = new ig.Input()
    ig.soundManager = new ig.SoundManager()
    ig.music = new ig.Music()
    ig.ready = true

    console.log('*** create game instance')
    // TODO: create impact game
    // const game = new (gameClass)()
    // ig.game = game
    // ig.system.delegate = game

    setReady(true)
  }, [])

  return (
    <ImpactContext.Provider value={ig}>
      <GameContext.Provider value={context}>
        <canvas style={style} className={className} ref={canvasRef} />
        {ready && children}
      </GameContext.Provider>
    </ImpactContext.Provider>
  )
}
