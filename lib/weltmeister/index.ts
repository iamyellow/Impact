import { Impact } from '../impact/impact'
import addEditEntities from './edit-entities'
import addEditMap from './edit-map'
import addEventedInput from './evented-input'
import addModalDialogs from './modal-dialogs'
import addSelectFileDropdown from './select-file-dropdown'
import addTileSelect from './tile-select'
import addUndo from './undo'
import makeInstance from './weltmeister'

const config = {
  // Default settings when creating new layers in Weltmeister. Change these
  // as you like
  layerDefaults: {
    width: 30,
    height: 20,
    tilesize: 8
  },

  // Whether to ask before closing Weltmeister when there are unsaved changes
  askBeforeClose: true,

  // Size of the "snap" grid when moving entities
  entityGrid: 4,

  // Number of undo levels. You may want to increase this if you use 'undo'
  // frequently.
  undoLevels: 50,

  // Mouse and Key bindings in Weltmeister. Some function are bound to
  // several keys. See the documentation of ig.Input for a list of available
  // key names.
  binds: {
    MOUSE1: 'draw',
    MOUSE2: 'drag',
    SHIFT: 'select',
    CTRL: 'drag',
    SPACE: 'menu',
    DELETE: 'delete',
    BACKSPACE: 'delete',
    G: 'grid',
    C: 'clone',
    Z: 'undo',
    Y: 'redo',
    MWHEEL_UP: 'zoomin',
    PLUS: 'zoomin',
    MWHEEL_DOWN: 'zoomout',
    MINUS: 'zoomout'
  },

  // Whether to enable unidirectional scrolling for touchpads; this
  // automatically unbinds the MWHEEL_UP and MWHEEL_DOWN actions.
  touchScroll: false,

  // View settings. You can change the default Zoom level and whether
  // to show the grid on startup here.
  view: {
    zoom: 1,
    zoomMax: 4,
    zoomMin: 0.125,
    grid: false
  },

  // Font face and size for entity labels and the grid coordinates
  labels: {
    draw: true,
    step: 32,
    font: '10px Bitstream Vera Sans Mono, Monaco, sans-serif'
  },

  // Colors to use for the background, selection boxes, text and the grid
  colors: {
    clear: '#000000', // Background Color
    highlight: '#ceff36', // Currently selected tile or entity
    primary: '#ffffff', // Labels and layer bounds
    secondary: '#555555', // Grid and tile selection bounds
    selection: '#ff9933' // Selection cursor box on tile maps
  },

  // Settings for the Collision tiles. You shouldn't need to change these.
  // The tilesize only specifies the size in the image - resizing to final
  // size for each layer happens in Weltmeister.
  collisionTiles: {
    path: '/collisiontiles-64.png',
    tilesize: 64
  }
}

export const makeWeltmeisterInstance = (ig: Impact) => {
  const wm = makeInstance(ig, config)
  addEditEntities(ig, wm)
  addEditMap(ig, wm)
  addEventedInput(ig, wm)
  addModalDialogs(ig, wm)
  addSelectFileDropdown(ig, wm)
  addTileSelect(ig, wm)
  addUndo(ig, wm)

  return wm
}
