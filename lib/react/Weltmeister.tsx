import React, { useEffect, useMemo, useRef, useState } from 'react'
import { makeImpactInstance } from '../impact'
import { makeWeltmeisterInstance } from '../weltmeister'
import '../weltmeister/jquery-1.7.1.min.js'
import '../weltmeister/jquery-ui-1.8.1.custom.min.js'
import '../weltmeister/weltmeister.css'
import { LevelCodegen, modules } from './Codegen'
import { GameContext, GameContextT, ImpactContext } from './types'

export const Weltmeister = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  const [levelName, setLevelName] = useState<string | null>(() => {
    const keys = Object.keys(modules)
    if (keys.length === 0) {
      return null
    }
    const firstKey = keys[0]
    return modules[firstKey].name
  })

  const ig = useMemo(() => {
    const ig = makeImpactInstance()
    // TODO: give ig._wm back
    return ig
  }, [])

  const wm = useMemo(() => {
    const wm = makeWeltmeisterInstance(ig)
    return wm
  }, [])

  const context = useMemo<GameContextT>(() => {
    return {
      setLevel(level) {
        ig.ready = true

        console.log('*** setLevel', level)

        const finalize = () => {
          wm.entityModules = level.entityModules
          ig.game = new wm.Weltmeister()
        }

        const total = ig.resources.length
        if (total === 0) {
          finalize()
          return
        }

        console.log(`*** will load ${total} resources`)
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

            if (loaded === total) {
              finalize()
            }
          })
        })
      },
      clearLevel() {
        ig.ready = false
        ig.resources.length = 0
      }
    }
  }, [])

  useEffect(() => {
    if (canvasRef.current === null) {
      throw 'No canvas'
    }

    ig.system = new ig.System(
      canvasRef.current,
      1,
      Math.floor(wm.Weltmeister.getMaxWidth() / wm.config.view.zoom),
      Math.floor(wm.Weltmeister.getMaxHeight() / wm.config.view.zoom),
      wm.config.view.zoom
    )
    ig.input = new wm.EventedInput()
    //ig.soundManager = new ig.SoundManager()

    setReady(true)
  }, [])

  return (
    <ImpactContext.Provider value={ig}>
      <GameContext.Provider value={context}>
        {ready && levelName !== null && <LevelCodegen name={levelName} />}
        <div id="headerMenu">
          <span className="headerTitle"></span>
          <span className="unsavedTitle"></span>
          <span className="headerFloat">
            <input
              type="button"
              id="levelSave"
              value="Save"
              className="button"
            />
            <input
              type="button"
              id="levelSaveAs"
              value="Save As"
              className="button"
            />
            <input type="button" id="levelNew" value="New" className="button" />
            <input
              type="button"
              id="levelLoad"
              value="Load"
              className="button"
            />
            <input
              type="button"
              id="reloadImages"
              value="Reload Images"
              title="Reload Images"
              className="button"
            />
            <input
              type="button"
              id="toggleSidebar"
              value="Toggle Sidebar"
              title="Toggle Sidebar"
              className="button"
            />
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
                  <input type="text" className="text" id="layerTileset" />
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
                  <input
                    type="button"
                    id="buttonSaveLayerSettings"
                    value="Apply Changes"
                    className="button"
                  />
                  <input
                    type="button"
                    id="buttonRemoveLayer"
                    value="Delete"
                    className="button"
                  />
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
