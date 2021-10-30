import React, { useEffect, useMemo, useRef } from 'react'
import { makeImpactInstance } from '../impact'
import addEditEntities from '../weltmeister/edit-entities'
import addEditMap from '../weltmeister/edit-map'
import addEventedInput from '../weltmeister/evented-input'
import '../weltmeister/jquery-1.7.1.min.js'
import '../weltmeister/jquery-ui-1.8.1.custom.min.js'
import addModalDialogs from '../weltmeister/modal-dialogs'
import addSelectFileDropdown from '../weltmeister/select-file-dropdown'
import addTileSelect from '../weltmeister/tile-select'
import addUndo from '../weltmeister/undo'
import makeWmInstance from '../weltmeister/weltmeister'
import '../weltmeister/weltmeister.css'
import { ImpactContext } from './context'
import { wmConfig } from './wm.config'
import { WeltmeiserEntities } from './wm.entities'

export const Weltmeister = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const ig = useMemo(() => {
    const ig = makeImpactInstance()
    ig._wm = true
    return ig
  }, [])

  useEffect(() => {
    if (canvasRef.current === null) {
      throw 'No canvas'
    }

    const wm = makeWmInstance(ig, wmConfig)
    addEditEntities(ig, wm)
    addEditMap(ig, wm)
    addEventedInput(ig, wm)
    addModalDialogs(ig, wm)
    addSelectFileDropdown(ig, wm)
    addTileSelect(ig, wm)
    addUndo(ig, wm)

    ig.system = new ig.System(
      canvasRef.current,
      1,
      Math.floor(wm.Weltmeister.getMaxWidth() / wmConfig.view.zoom),
      Math.floor(wm.Weltmeister.getMaxHeight() / wmConfig.view.zoom),
      wmConfig.view.zoom
    )

    ig.input = new wm.EventedInput()
    ig.soundManager = new ig.SoundManager()
    ig.ready = true

    const loader = new wm.Loader(wm.Weltmeister, ig.resources)
    // TODO: add the entity names here
    wm.entityModules = ['Player']
    loader.load()
  }, [])

  return (
    <ImpactContext.Provider value={ig}>
      <WeltmeiserEntities />
      <div id="headerMenu">
        <span className="headerTitle"></span>
        <span className="unsavedTitle"></span>
        <span className="headerFloat">
          <input type="button" id="levelSave" value="Save" className="button" />
          <input
            type="button"
            id="levelSaveAs"
            value="Save As"
            className="button"
          />
          <input type="button" id="levelNew" value="New" className="button" />
          <input type="button" id="levelLoad" value="Load" className="button" />
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
                <input type="text" className="number" id="layerWidth" /> &times;{' '}
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
    </ImpactContext.Provider>
  )
}
