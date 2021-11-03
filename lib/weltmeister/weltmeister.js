export default function (ig, config) {

const wm = {}
wm.zoomLevel = 1;
wm.config = {
  // Default settings when creating new layers in Weltmeister. Change these
  // as you like
  layerDefaults: {
    width: 64,
    height: 24,
    tilesize: 8
  },

  // Whether to ask before closing Weltmeister when there are unsaved changes
  askBeforeClose: true,

  // Size of the "snap" grid when moving entities
  entityGrid: 4,

  // Number of undo levels. You may want to increase this if you use 'undo'
  // frequently.
  undoLevels: 64,

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
    zoomMax: 8,
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
    clear: '#000', // Background Color
    highlight: '#fff612', // Currently selected tile or entity
    primary: 'white', // Labels and layer bounds
    secondary: '#555555', // Grid and tile selection bounds
    selection: 'cyan' // Selection cursor box on tile maps
  },

  // Settings for the Collision tiles. You shouldn't need to change these.
  // The tilesize only specifies the size in the image - resizing to final
  // size for each layer happens in Weltmeister.
  collisionTiles: {
    path: '/collisiontiles-64.png',
    tilesize: 64
  }
}

wm.Weltmeister = ig.Class.extend({
	config,
	mode: null,
	MODE: {
		DRAW: 1,
		TILESELECT: 2,
		ENTITYSELECT: 4
	},

	levelData: {},
	layers: [],
	entities: null,
	activeLayer: null,
	collisionLayer: null,
	selectedEntity: null,

	screen: {x: 0, y: 0},
	_rscreen: {x: 0, y: 0},
  zoomLevel: wm.zoomLevel,
	mouseLast: {x: -1, y: -1},
	waitForModeChange: false,

	tilesetSelectDialog: null,
	levelSavePathDialog: null,
	labelsStep: 32,

	collisionSolid: 1,

	loadDialog: null,
	loseChangesDialog: null,
	deleteLayerDialog: null,
	fileName: '',
	filePath: '',
	modified: false,
	needsDraw: true,
  resourceMap: {},

	undo: null,

	init: function() {
		ig.game = ig.editor = this;

		ig.system.context.textBaseline = 'top';
		ig.system.context.font = wm.config.labels.font;
		this.labelsStep = wm.config.labels.step;



		// Dialogs
		this.loadDialog = new wm.ModalDialogPathSelect( 'Load Level', 'Load', 'scripts' );
		this.loadDialog.onOk = this.load.bind(this);
		$('#levelLoad').bind( 'click', this.showLoadDialog.bind(this) );

		$('#levelSave').bind( 'click', this.save.bind(this) );

		this.loseChangesDialog = new wm.ModalDialog( 'Lose all changes?' );

		this.deleteLayerDialog = new wm.ModalDialog( 'Delete Layer? NO UNDO!' );
		this.deleteLayerDialog.onOk = this.removeLayer.bind(this);

		this.mode = this.MODE.DEFAULT;


		this.tilesetSelectDialog = new wm.SelectFileDropdown( '#layerTilesetName', 'images' );
		this.entities = new wm.EditEntities( $('#layerEntities') );

		$('#layers').sortable({
			update: this.reorderLayers.bind(this)
		});
		$('#layers').disableSelection();
		this.resetModified();


		// Events/Input
		if( wm.config.touchScroll ) {
			// Setup wheel event
			ig.system.canvas.addEventListener('wheel', this.touchScroll.bind(this), false );

			// Unset MWHEEL_* binds
			delete wm.config.binds['MWHEEL_UP'];
			delete wm.config.binds['MWHEEL_DOWN'];
		}

		for( var key in wm.config.binds ) {
			ig.input.bind( ig.KEY[key], wm.config.binds[key] );
		}
		ig.input.keydownCallback = this.keydown.bind(this);
		ig.input.keyupCallback = this.keyup.bind(this);
		ig.input.mousemoveCallback = this.mousemove.bind(this);

		$(window).resize( this.resize.bind(this) );
		$(window).bind( 'keydown', this.uikeydown.bind(this) );
		$(window).bind( 'beforeunload', this.confirmClose.bind(this) );

		$('#buttonAddLayer').bind( 'click', this.addLayer.bind(this) );
		$('#buttonRemoveLayer').bind( 'click', this.deleteLayerDialog.open.bind(this.deleteLayerDialog) );
		$('#buttonSaveLayerSettings').bind( 'click', this.saveLayerSettings.bind(this) );
		$('#layerIsCollision').bind( 'change', this.toggleCollisionLayer.bind(this) );

		$('button#toggleSidebar').click(function() {
			$('div#menu').slideToggle('fast');
			$('button#toggleSidebar').toggleClass('active');
		});

		// Always unfocus current input field when clicking the canvas
		$('#canvas').mousedown(function(){
			$('input:focus').blur();
		});


		this.undo = new wm.Undo( wm.config.undoLevels );


		ig.setAnimation( this.drawIfNeeded.bind(this) );
	},

	uikeydown: function( event ) {
		if( event.target.type == 'text' ) {
			return;
		}

		var key = String.fromCharCode(event.which);
		if( key.match(/^\d$/) ) {
			var index = parseInt(key);
			var name = $('#layers div.layer:nth-child('+index+') span.name').text();

			var layer = name == 'entities'
				? this.entities
				: this.getLayerWithName(name);

			if( layer ) {
				if( event.shiftKey ) {
					layer.toggleVisibility();
				} else {
					this.setActiveLayer( layer.name );
				}
			}
		}
	},


	showLoadDialog: function() {
		if( this.modified ) {
			this.loseChangesDialog.onOk = this.loadDialog.open.bind(this.loadDialog);
			this.loseChangesDialog.open();
		} else {
			this.loadDialog.open();
		}
	},

	setModified: function() {
		if( !this.modified ) {
			this.modified = true;
			this.setWindowTitle();
		}
	},

	resetModified: function() {
		this.modified = false;
		this.setWindowTitle();
	},

	setWindowTitle: function() {
		document.title = this.fileName + (this.modified ? ' * ' : ' - ') + 'Weltmeister';
		$('span.headerTitle').text(this.fileName);
		$('span.unsavedTitle').text(this.modified ? '*' : '');
	},


	confirmClose: function( event ) {
		var rv = undefined;
		if( this.modified && wm.config.askBeforeClose ) {
			rv = 'There are some unsaved changes. Leave anyway?';
		}
		event.returnValue = rv;
		return rv;
	},


	resize: function() {
		ig.system.resize(
			Math.floor(wm.Weltmeister.getMaxWidth() / this.zoomLevel),
			Math.floor(wm.Weltmeister.getMaxHeight() / this.zoomLevel),
			this.zoomLevel
		);
		ig.system.context.textBaseline = 'top';
		ig.system.context.font = wm.config.labels.font;
		this.draw();
	},

	scroll: function(x, y) {
		this.screen.x -= x;
		this.screen.y -= y;

		this._rscreen.x = Math.round(this.screen.x * ig.system.scale)/ig.system.scale;
		this._rscreen.y = Math.round(this.screen.y * ig.system.scale)/ig.system.scale;
		for( var i = 0; i < this.layers.length; i++ ) {
			this.layers[i].setScreenPos( this.screen.x, this.screen.y );
		}
	},

	drag: function() {
		var dx = ig.input.mouse.x - this.mouseLast.x,
			dy = ig.input.mouse.y - this.mouseLast.y;
		this.scroll(dx, dy);
	},

	touchScroll: function( event ) {
		event.preventDefault();

		this.scroll( -event.deltaX/ig.system.scale, -event.deltaY/ig.system.scale );
		this.draw();
		return false;
	},

	zoom: function( delta ) {
		var z = this.zoomLevel;
		var mx = ig.input.mouse.x * z,
			my = ig.input.mouse.y * z;

		if( z <= 1 ) {
			if( delta < 0 ) {
				z /= 2;
			}
			else {
				z *= 2;
			}
		}
		else {
			z += delta;
		}

		this.zoomLevel = wm.zoomLevel = z.limit( wm.config.view.zoomMin, wm.config.view.zoomMax );
		wm.config.labels.step = Math.round( this.labelsStep / this.zoomLevel );
		$('#zoomIndicator').text( this.zoomLevel + 'x' ).stop(true,true).show().delay(300).fadeOut();

		// Adjust mouse pos and screen coordinates
		ig.input.mouse.x = mx / this.zoomLevel;
		ig.input.mouse.y = my / this.zoomLevel;
		this.drag();

		for( var i in ig.Image.cache ) {
			ig.Image.cache[i].resize( this.zoomLevel );
		}

		this.resize();
	},


	// -------------------------------------------------------------------------
	// Loading

	load: function( dialog, path ) {
		// from wm

		// TODO:
		console.log('>>> wm.load')
		// this.loadResponse.bind(this
		/*var req = $.ajax({
			url:( path + '?nocache=' + Math.random() ),
			dataType: 'text',
			async:true,
			success: this.loadResponse.bind(this),
			error: function() { }
		});*/
	},


	loadLevel: function( context, resourceMap ) {
		// from react
		const { data, name: levelName, entities } = context
    const { _wmui, ...levelData } = data

    this.resourceMap = resourceMap;
		this.filePath = `${wm.levels[levelName].path}.data.js`;
		this.fileName = levelName;
		this.levelData = levelData;
		this.entities.setEntities( entities.map(({ name }) => (name)) );
		this.tilesetSelectDialog.setData( Object.values(resourceMap).filter(r => r.type === 'map') );

		// fill with level data

		while( this.layers.length ) {
			this.layers[0].destroy();
			this.layers.splice( 0, 1 );
		}
		this.screen = {x: 0, y: 0};
		this.entities.clear();

		const dataEntities = data.entities ? data.entities : [];
		for( var i=0; i < dataEntities.length; i++ ) {
			var ent = dataEntities[i];
			this.entities.spawnEntity( ent.type, ent.x, ent.y, ent.settings );
		}

		const dataLayer = data.layer ? data.layer : [];
		for( var i=0; i < dataLayer.length; i++ ) {
			var ld = dataLayer[i];
			var newLayer = new wm.EditMap( ld.name, ld.tilesize, ld.tilesetSrc, ld.tilesetName, !!ld.foreground );
			newLayer.resize( ld.width, ld.height );
			newLayer.linkWithCollision = ld.linkWithCollision;
			newLayer.repeat = ld.repeat;
			newLayer.preRender = !!ld.preRender;
			newLayer.distance = ld.distance;
			newLayer.visible = !ld.visible;
			newLayer.data = ld.data;
			newLayer.toggleVisibility();
			this.layers.push( newLayer );

			if( ld.name == 'collision' ) {
				this.collisionLayer = newLayer;
			}
		}

		this.setActiveLayer( 'entities' );

		this.reorderLayers();
		$('#layers').sortable('refresh');

		this.resetModified();
		this.undo.clear();

    if (_wmui !== undefined) {
      this.zoomLevel = _wmui.zoomLevel;
      this.resize();

      this.screen.x = _wmui.x;
      this.screen.y = _wmui.y;
      this.scroll(0, 0)
    }
    else {
      this.draw();
    }
	},



	// -------------------------------------------------------------------------
	// Saving

	save: function() {
		const data = this.levelData;
    data._wmui = {
      zoomLevel: this.zoomLevel,
      x: this.screen.x,
      y: this.screen.y,
    };
		data.entities = this.entities.getSaveData();
		data.layer = [];

		const resources = [];
		for( var i = 0, layer; i < this.layers.length; i++ ) {
			layer = this.layers[i];
			data.layer.push( layer.getSaveData() );
			if( layer.name != 'collision' ) {
				resources.push( layer.tiles.path );
			}
		}

		fetch('/api/save', {
			method: 'POST',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				path: this.filePath,
        resourceMap: this.resourceMap,
        data,
			})
		}).then(() => {
			this.saveResponse({ error: false })
		}).catch(() => {
			this.saveResponse({ error: true })
		});
	},

	saveResponse: function( data ) {
		if( data.error ) {
			alert( 'Error' );
		} else {
      this.onSaveLevel(this.fileName);
			this.resetModified();
		}
	},



	// -------------------------------------------------------------------------
	// Layers

	addLayer: function() {
		var name = 'new_layer_' + this.layers.length;
		var newLayer = new wm.EditMap( name, wm.config.layerDefaults.tilesize );
		newLayer.resize( wm.config.layerDefaults.width, wm.config.layerDefaults.height );
		newLayer.setScreenPos( this.screen.x, this.screen.y );
		this.layers.push( newLayer );
		this.setActiveLayer( name );
		this.updateLayerSettings();

		this.reorderLayers();

		$('#layers').sortable('refresh');
	},


	removeLayer: function() {
		var name = this.activeLayer.name;
		if( name == 'entities' ) {
			return false;
		}
		this.activeLayer.destroy();
		for( var i = 0; i < this.layers.length; i++ ) {
			if( this.layers[i].name == name ) {
				this.layers.splice( i, 1 );
				this.reorderLayers();
				$('#layers').sortable('refresh');
				this.setActiveLayer( 'entities' );
				return true;
			}
		}
		return false;
	},


	getLayerWithName: function( name ) {
		for( var i = 0; i < this.layers.length; i++ ) {
			if( this.layers[i].name == name ) {
				return this.layers[i];
			}
		}
		return null;
	},


	reorderLayers: function() {
		var newLayers = [];
		var isForegroundLayer = true;
		$('#layers div.layer span.name').each((function( newIndex, span ){
			var name = $(span).text();

			var layer = name == 'entities'
				? this.entities
				: this.getLayerWithName(name);

			if( layer ) {
				layer.setHotkey( newIndex+1 );
				if( layer.name == 'entities' ) {
					// All layers after the entity layer are not foreground
					// layers
					isForegroundLayer = false;
				}
				else {
					layer.foreground = isForegroundLayer;
					newLayers.unshift( layer );
				}
			}
		}).bind(this));
		this.layers = newLayers;
		this.setModified();
		this.draw();
	},


	updateLayerSettings: function( ) {
		$('#layerName').val( this.activeLayer.name );
		$('#layerTilesetName').val( this.activeLayer.tilesetName );
		$('#layerTilesize').val( this.activeLayer.tilesize );
		$('#layerWidth').val( this.activeLayer.width );
		$('#layerHeight').val( this.activeLayer.height );
		$('#layerPreRender').prop( 'checked', this.activeLayer.preRender );
		$('#layerRepeat').prop( 'checked', this.activeLayer.repeat );
		$('#layerLinkWithCollision').prop( 'checked', this.activeLayer.linkWithCollision );
		$('#layerDistance').val( this.activeLayer.distance );
	},


	saveLayerSettings: function() {
		var isCollision = $('#layerIsCollision').prop('checked');

		var newName = $('#layerName').val();
		var newWidth = Math.floor($('#layerWidth').val());
		var newHeight = Math.floor($('#layerHeight').val());

		if( newWidth != this.activeLayer.width || newHeight != this.activeLayer.height ) {
			this.activeLayer.resize( newWidth, newHeight );
		}
		this.activeLayer.tilesize = Math.floor($('#layerTilesize').val());

		if( isCollision ) {
			newName = 'collision';
			this.activeLayer.linkWithCollision = false;
			this.activeLayer.distance = 1;
			this.activeLayer.repeat = false;
			this.activeLayer.setCollisionTileset();
		}
		else {
			var newTilesetName = $('#layerTilesetName').val();
			if( newTilesetName != this.activeLayer.tilesetName ) {
        this.activeLayer.setTilesetName( newTilesetName );
				this.activeLayer.setTileset( this.resourceMap[newTilesetName].src );
			}
			this.activeLayer.linkWithCollision = $('#layerLinkWithCollision').prop('checked');
			this.activeLayer.distance = parseFloat($('#layerDistance').val());
			this.activeLayer.repeat = $('#layerRepeat').prop('checked');
			this.activeLayer.preRender = $('#layerPreRender').prop('checked');
		}


		if( newName == 'collision' ) {
			// is collision layer
			this.collisionLayer = this.activeLayer;
		}
		else if( this.activeLayer.name == 'collision' ) {
			// was collision layer, but is no more
			this.collisionLayer = null;
		}


		this.activeLayer.setName( newName );
		this.setModified();
		this.draw();
	},


	setActiveLayer: function( name ) {
		var previousLayer = this.activeLayer;
		this.activeLayer = ( name == 'entities' ? this.entities : this.getLayerWithName(name) );
		if( previousLayer == this.activeLayer ) {
			return; // nothing to do here
		}

		if( previousLayer ) {
			previousLayer.setActive( false );
		}
		this.activeLayer.setActive( true );
		this.mode = this.MODE.DEFAULT;

		$('#layerIsCollision').prop('checked', (name == 'collision') );

		if( name == 'entities' ) {
			$('#layerSettings').fadeOut(100);
		}
		else {
			this.entities.selectEntity( null );
			this.toggleCollisionLayer();
			$('#layerSettings')
				.fadeOut(100,this.updateLayerSettings.bind(this))
				.fadeIn(100);
		}
		this.draw();
	},


	toggleCollisionLayer: function( ev ) {
		var isCollision = $('#layerIsCollision').prop('checked');
		$('#layerLinkWithCollision,#layerDistance,#layerPreRender,#layerRepeat,#layerName,#layerTilesetName')
			.attr('disabled', isCollision );
	},



	// -------------------------------------------------------------------------
	// Update

	mousemove: function() {
		if( !this.activeLayer ) {
			return;
		}

		if( this.mode == this.MODE.DEFAULT ) {

			// scroll map
			if( ig.input.state('drag') ) {
				this.drag();
			}

			else if( ig.input.state('draw') ) {

				// move/scale entity
				if( this.activeLayer == this.entities ) {
					var x = ig.input.mouse.x + this.screen.x;
					var y = ig.input.mouse.y + this.screen.y;
					this.entities.dragOnSelectedEntity( x, y );
					this.setModified();
				}

				// draw on map
				else if( !this.activeLayer.isSelecting ) {
					this.setTileOnCurrentLayer();
				}
			}
			else if( this.activeLayer == this.entities ) {
				var x = ig.input.mouse.x + this.screen.x;
				var y = ig.input.mouse.y + this.screen.y;
				this.entities.mousemove( x, y );
			}
		}

		this.mouseLast = {x: ig.input.mouse.x, y: ig.input.mouse.y};
		this.draw();
	},


	keydown: function( action ) {
		if( !this.activeLayer ) {
			return;
		}

		if( action == 'draw' ) {
			if( this.mode == this.MODE.DEFAULT ) {
				// select entity
				if( this.activeLayer == this.entities ) {
					var x = ig.input.mouse.x + this.screen.x;
					var y = ig.input.mouse.y + this.screen.y;
					var entity = this.entities.selectEntityAt( x, y );
					if( entity ) {
						this.undo.beginEntityEdit( entity );
					}
				}
				else {
					if( ig.input.state('select') ) {
						this.activeLayer.beginSelecting( ig.input.mouse.x, ig.input.mouse.y );
					}
					else {
						this.undo.beginMapDraw();
						this.activeLayer.beginEditing();
						if(
							this.activeLayer.linkWithCollision &&
							this.collisionLayer &&
							this.collisionLayer != this.activeLayer
						) {
							this.collisionLayer.beginEditing();
						}
						this.setTileOnCurrentLayer();
					}
				}
			}
			else if( this.mode == this.MODE.TILESELECT && ig.input.state('select') ) {
				this.activeLayer.tileSelect.beginSelecting( ig.input.mouse.x, ig.input.mouse.y );
			}
		}

		this.draw();
	},


	keyup: function( action ) {
		if( !this.activeLayer ) {
			return;
		}

		if( action == 'delete' ) {
			this.entities.deleteSelectedEntity();
			this.setModified();
		}

		else if( action == 'clone' ) {
			this.entities.cloneSelectedEntity();
			this.setModified();
		}

		else if( action == 'grid' ) {
			wm.config.view.grid = !wm.config.view.grid;
		}

		else if( action == 'menu' ) {
			if( this.mode != this.MODE.TILESELECT && this.mode != this.MODE.ENTITYSELECT ) {
				if( this.activeLayer == this.entities ) {
					this.mode = this.MODE.ENTITYSELECT;
					this.entities.showMenu( ig.input.mouse.x, ig.input.mouse.y );
				}
				else {
					this.mode = this.MODE.TILESELECT;
					this.activeLayer.tileSelect.setPosition( ig.input.mouse.x, ig.input.mouse.y	);
				}
			} else {
				this.mode = this.MODE.DEFAULT;
				this.entities.hideMenu();
			}
		}

		else if( action == 'zoomin' ) {
			this.zoom( 1 );
		}
		else if( action == 'zoomout' ) {
			this.zoom( -1 );
		}


		if( action == 'draw' ) {
			// select tile
			if( this.mode == this.MODE.TILESELECT ) {
				this.activeLayer.brush = this.activeLayer.tileSelect.endSelecting( ig.input.mouse.x, ig.input.mouse.y );
				this.mode = this.MODE.DEFAULT;
			}
			else if( this.activeLayer == this.entities ) {
				this.undo.endEntityEdit();
			}
			else {
				if( this.activeLayer.isSelecting ) {
					this.activeLayer.brush = this.activeLayer.endSelecting( ig.input.mouse.x, ig.input.mouse.y );
				}
				else {
					this.undo.endMapDraw();
				}
			}
		}

		if( action == 'undo' ) {
			this.undo.undo();
		}

		if( action == 'redo' ) {
			this.undo.redo();
		}

		this.draw();
		this.mouseLast = {x: ig.input.mouse.x, y: ig.input.mouse.y};
	},


	setTileOnCurrentLayer: function() {
		if( !this.activeLayer || !this.activeLayer.scroll ) {
			return;
		}

		var co = this.activeLayer.getCursorOffset();
		var x = ig.input.mouse.x + this.activeLayer.scroll.x - co.x;
		var y = ig.input.mouse.y + this.activeLayer.scroll.y - co.y;

		var brush = this.activeLayer.brush;
		for( var by = 0; by < brush.length; by++ ) {
			var brushRow = brush[by];
			for( var bx = 0; bx < brushRow.length; bx++ ) {

				var mapx = x + bx * this.activeLayer.tilesize;
				var mapy = y + by * this.activeLayer.tilesize;

				var newTile = brushRow[bx];
				var oldTile = this.activeLayer.getOldTile( mapx, mapy );

				this.activeLayer.setTile( mapx, mapy, newTile );
				this.undo.pushMapDraw( this.activeLayer, mapx, mapy, oldTile, newTile );


				if(
					this.activeLayer.linkWithCollision &&
					this.collisionLayer &&
					this.collisionLayer != this.activeLayer
				) {
					var collisionLayerTile = newTile > 0 ? this.collisionSolid : 0;

					var oldCollisionTile = this.collisionLayer.getOldTile(mapx, mapy);
					this.collisionLayer.setTile( mapx, mapy, collisionLayerTile );
					this.undo.pushMapDraw( this.collisionLayer, mapx, mapy, oldCollisionTile, collisionLayerTile );
				}
			}
		}

		this.setModified();
	},


	// -------------------------------------------------------------------------
	// Drawing

	draw: function() {
		// The actual drawing loop is scheduled via ig.setAnimation() already.
		// We just set a flag to indicate that a redraw is needed.
		this.needsDraw = true;
	},


	drawIfNeeded: function() {
		// Only draw if flag is set
		if( !this.needsDraw ) { return; }
		this.needsDraw = false;


		ig.system.clear( wm.config.colors.clear );

		var entitiesDrawn = false;
		for( var i = 0; i < this.layers.length; i++ ) {
			var layer = this.layers[i];

			// This layer is a foreground layer? -> Draw entities first!
			if( !entitiesDrawn && layer.foreground ) {
				entitiesDrawn = true;
				this.entities.draw();
			}
			layer.draw();
		}

		if( !entitiesDrawn ) {
			this.entities.draw();
		}


		if( this.activeLayer ) {
			if( this.mode == this.MODE.TILESELECT ) {
				this.activeLayer.tileSelect.draw();
				this.activeLayer.tileSelect.drawCursor( ig.input.mouse.x, ig.input.mouse.y );
			}

			if( this.mode == this.MODE.DEFAULT ) {
				this.activeLayer.drawCursor( ig.input.mouse.x, ig.input.mouse.y );
			}
		}

		if( wm.config.labels.draw ) {
			this.drawLabels( wm.config.labels.step );
		}
	},


	drawLabels: function( step ) {
		ig.system.context.fillStyle = wm.config.colors.primary;
		var xlabel = this.screen.x - this.screen.x % step - step;
		for( var tx = Math.floor(-this.screen.x % step); tx < ig.system.width; tx += step ) {
			xlabel += step;
			ig.system.context.fillText( xlabel, tx * ig.system.scale, 0 );
		}

		var ylabel = this.screen.y - this.screen.y % step - step;
		for( var ty = Math.floor(-this.screen.y % step); ty < ig.system.height; ty += step ) {
			ylabel += step;
			ig.system.context.fillText( ylabel, 0, ty * ig.system.scale );
		}
	},


	getEntityByName: function( name ) {
		return this.entities.getEntityByName( name );
	},
});


wm.Weltmeister.getMaxWidth = function() {
	return $(window).width();
};

wm.Weltmeister.getMaxHeight = function() {
	return $(window).height() - $('#headerMenu').height();
};


// Custom ig.Image class for use in Weltmeister. To make the zoom function
// work, we need some additional scaling behavior:
// Keep the original image, maintain a cache of scaled versions and use the
// default Canvas scaling (~bicubic) instead of nearest neighbor when
// zooming out.
ig.Image.inject({
	resize: function( scale ) {
		if( !this.loaded ) { return; }
		if( !this.scaleCache ) { this.scaleCache = {}; }
		if( this.scaleCache['x'+scale] ) {
			this.data = this.scaleCache['x'+scale];
			return;
		}

		// Retain the original image when scaling
		this.origData = this.data = this.origData || this.data;

		if( scale > 1 ) {
			// Nearest neighbor when zooming in
			this.parent( scale );
		}
		else {
			// Otherwise blur
			var scaled = ig.$new('canvas');
			scaled.width = Math.ceil(this.width * scale);
			scaled.height = Math.ceil(this.height * scale);
			var scaledCtx = scaled.getContext('2d');
			scaledCtx.drawImage( this.data, 0, 0, this.width, this.height, 0, 0, scaled.width, scaled.height );
			this.data = scaled;
		}

		this.scaleCache['x'+scale] = this.data;
	}
});

return wm

}
