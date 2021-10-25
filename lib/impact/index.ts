import makeInstance from './impact'
import addClass from './class'
import addAnimation from './animation'
import addMap from './map'
import addBackgroundMap from './background-map'
import addCollisionMap from './collision-map'
import addSystem from './system'
import addInput from './input'
import addSound from './sound'
import addEntityPool from './entity-pool'
import addGame from './game'
import addEntity from './entity'
import addImage from './image'
import addFont from './font'
import addLoader from './loader'
import addTimer from './timer'

export interface Impact {}

export const makeImpactInstance = () => {
  const ig = makeInstance()
  addClass(ig)
  addAnimation(ig)
  addMap(ig)
  addBackgroundMap(ig)
  addCollisionMap(ig)
  addSystem(ig)
  addInput(ig)
  addSound(ig)
  addGame(ig)
  addEntityPool(ig)
  addEntity(ig)
  addImage(ig)
  addFont(ig)
  addLoader(ig)
  addTimer(ig)

  const canvasId = null
  const fps = 60
  const width = 0
  const height = 0
  const scale = 1

  ig.system = new ig.System(canvasId, fps, width, height, scale)
  ig.input = new ig.Input()
  ig.soundManager = new ig.SoundManager()
  ig.music = new ig.Music()
  ig.ready = true

  //var loader = new ig.Loader(gameClass, ig.resources)
  //loader.load()

  return ig
}
