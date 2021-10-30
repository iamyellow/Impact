import addAnimation from './animation'
import addBackgroundMap from './background-map'
import addClass from './class'
import addCollisionMap from './collision-map'
import addEntity from './entity'
import addEntityPool from './entity-pool'
import addFont from './font'
import addGame from './game'
import addImage from './image'
import makeInstance from './impact'
import addInput from './input'
import addLoader from './loader'
import addMap from './map'
import addSound from './sound'
import addSystem from './system'
import addTimer from './timer'

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
  return ig
}
