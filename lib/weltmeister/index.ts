import { Impact } from '../impact/impact'
import addEditEntities from './edit-entities'
import addEditMap from './edit-map'
import addEventedInput from './evented-input'
import addModalDialogs from './modal-dialogs'
import addSelectFileDropdown from './select-file-dropdown'
import addTileSelect from './tile-select'
import addUndo from './undo'
import makeInstance from './weltmeister'

export const makeWeltmeisterInstance = (ig: Impact) => {
  const wm = makeInstance(ig)
  addEditEntities(ig, wm)
  addEditMap(ig, wm)
  addEventedInput(ig, wm)
  addModalDialogs(ig, wm)
  addSelectFileDropdown(ig, wm)
  addTileSelect(ig, wm)
  addUndo(ig, wm)

  return wm
}
