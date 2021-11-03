import React, { useEffect, useMemo, useRef, useState } from 'react'
import ReactDOM from 'react-dom'
import { makeImpactInstance } from '../../impact'
import { makeWeltmeisterInstance } from '../../weltmeister'
import { WeltmeisterGame } from '../../weltmeister/weltmeister'
import {
  Game as GameT,
  GameContext,
  ImpactContext,
  LevelResource
} from '../types'
import { modules, WeltmeisterCodegen } from './Codegen'

const LAST_LEVEL_STORAGE_KEY = 'wm.bak'

const Weltmeister = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  const [levelName, setLevelName] = useState<string | null>(() => {
    const keys = Object.keys(modules)
    if (keys.length === 0) {
      return null
    }

    const lastLevelKey = localStorage.getItem(LAST_LEVEL_STORAGE_KEY)
    if (lastLevelKey !== null && modules[lastLevelKey]) {
      return modules[lastLevelKey].name
    }

    const firstKey = keys[0]
    return modules[firstKey].name
  })

  const ig = useMemo(() => {
    const ig = makeImpactInstance()
    // TODO: disable ig sound, ig input, or somehow tell ig that we're in wm
    return ig
  }, [])

  const wm = useMemo(() => {
    const wm = makeWeltmeisterInstance(ig)
    wm.levels = modules
    return wm
  }, [])

  const context = useMemo<GameT>(() => {
    return {
      setLevel(level) {
        const game = ig.game as WeltmeisterGame
        const resourceMap = level.resources.reduce((ret, curr) => {
          const { name, src: resourceSrc, type } = curr
          const [src, path] = resourceSrc as any as [string, string]
          return { ...ret, [name]: { name, src, path, type } }
        }, {} as Record<string, Pick<LevelResource, 'name' | 'src' | 'type'>>)

        game.loadLevel(level, resourceMap)
        // TODO: remove ready or have something like loading
        ig.ready = true

        const finalize = () => {
          game.draw()
        }

        const total = ig.resources.length
        console.log(`*** will load ${total} resources`)
        if (total === 0) {
          finalize()
          return
        }

        let loaded = 0
        ig.resources.forEach((resource) => {
          if (resource instanceof ig.Sound) {
            // TODO: ignore
          }
          resource.load((path, success) => {
            if (!success) {
              throw 'Failed to load resource: ' + path
            }
            loaded += 1

            console.log(`*** ${path} loaded`)

            if (loaded === total) {
              finalize()
            }
          })
        })
      },
      clearLevel() {
        // reset state
        ig.ready = false
        ig.resources.length = 0
      }
    }
  }, [])

  useEffect(() => {
    if (canvasRef.current === null) {
      throw 'No canvas'
    }

    // every descendant has been mounted
    // so, level has been seet

    ig.system = new ig.System(
      canvasRef.current,
      1,
      wm.Weltmeister.getMaxWidth(),
      wm.Weltmeister.getMaxHeight(),
      1
    )
    ig.input = new wm.EventedInput()

    const wmGame = new wm.Weltmeister()
    wmGame.onLoadLevel = (name) => {
      localStorage.setItem(LAST_LEVEL_STORAGE_KEY, name)
      setLevelName(name)
    }
    ig.game = wmGame

    setReady(true)
  }, [])

  return (
    <ImpactContext.Provider value={ig}>
      <GameContext.Provider value={context}>
        {ready && levelName !== null && <WeltmeisterCodegen name={levelName} />}
        <div id="headerMenu">
          <span className="headerTitle"></span>
          <span className="unsavedTitle"></span>
          <span className="headerFloat">
            <button id="levelSave">Save</button>
            <button id="levelLoad">Load</button>
            <button id="toggleSidebar">Toggle Sidebar</button>
          </span>
        </div>

        <div id="editor">
          <div id="entityMenu"></div>

          <canvas id="canvas" ref={canvasRef}></canvas>

          <div id="menu">
            <div id="layerContainer">
              <h2>Layers</h2>
              <div id="layerButtons">
                <div className="button" id="buttonAddLayer" title="Add Layer">
                  +
                </div>
              </div>
              <div id="layers">
                <div id="layerEntities" className="layer">
                  <span
                    className="visible specialVis checkedVis"
                    title="Toggle Visibility (Shift+0)"
                  ></span>
                  <span className="name">entities</span>
                </div>
              </div>
            </div>

            <div id="layerSettings">
              <h2>Layer Settings</h2>
              <dl>
                <dt>Name:</dt>
                <dd>
                  <input type="text" className="text" id="layerName" />
                </dd>
                <dt>Tileset:</dt>
                <dd>
                  <input
                    autoComplete="off"
                    type="text"
                    className="text"
                    id="layerTilesetName"
                  />
                </dd>
                <dt>Tilesize:</dt>
                <dd>
                  <input type="text" className="number" id="layerTilesize" />
                </dd>
                <dt>Dimensions:</dt>
                <dd>
                  <input type="text" className="number" id="layerWidth" />{' '}
                  &times;{' '}
                  <input type="text" className="number" id="layerHeight" />
                </dd>
                <dt>Distance:</dt>
                <dd>
                  <input type="text" className="number" id="layerDistance" />
                </dd>
                <dd>
                  <input type="checkbox" id="layerIsCollision" />
                  <label htmlFor="layerIsCollision">Is Collision Layer</label>
                </dd>
                <dd>
                  <input type="checkbox" id="layerPreRender" />
                  <label htmlFor="layerPreRender">Pre-Render in Game</label>
                </dd>
                <dd>
                  <input type="checkbox" id="layerRepeat" />
                  <label htmlFor="layerRepeat">Repeat</label>
                </dd>
                <dd>
                  <input type="checkbox" id="layerLinkWithCollision" />
                  <label htmlFor="layerLinkWithCollision">
                    Link with Collision
                  </label>
                </dd>
                <dd>
                  <button id="buttonSaveLayerSettings" value="">
                    Apply Changes
                  </button>
                  <button id="buttonRemoveLayer">Delete</button>
                </dd>
              </dl>
            </div>

            <div id="entitySettings">
              <h2>Entity Settings</h2>
              <h3 id="entityClass">EntityClassName</h3>
              <div id="entityDefinitions">
                <div className="entityDefinition">
                  <span className="key">x</span>:
                  <span className="value">188</span>
                </div>
                <div className="entityDefinition">
                  <span className="key">y</span>:
                  <span className="value">269</span>
                </div>
              </div>
              <dl id="entityDefinitionInput">
                <dt>Key:</dt>
                <dd>
                  <input type="text" className="text" id="entityKey" />
                </dd>
                <dt>Value:</dt>
                <dd>
                  <input type="text" className="text" id="entityValue" />
                </dd>
              </dl>
            </div>
          </div>

          <div id="zoomIndicator">1x</div>
        </div>
      </GameContext.Provider>
    </ImpactContext.Provider>
  )
}

ReactDOM.render(<Weltmeister />, document.getElementById('root'))
