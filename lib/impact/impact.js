// -----------------------------------------------------------------------------
// Impact Game Engine 1.24
// http://impactjs.com/
// -----------------------------------------------------------------------------


// -----------------------------------------------------------------------------
// Native Object extensions

Number.prototype.map = function(istart, istop, ostart, ostop) {
	return ostart + (ostop - ostart) * ((this - istart) / (istop - istart));
};

Number.prototype.limit = function(min, max) {
	return Math.min(max, Math.max(min, this));
};

Number.prototype.round = function(precision) {
	precision = Math.pow(10, precision || 0);
	return Math.round(this * precision) / precision;
};

Number.prototype.floor = function() {
	return Math.floor(this);
};

Number.prototype.ceil = function() {
	return Math.ceil(this);
};

Number.prototype.toInt = function() {
	return (this | 0);
};

Number.prototype.toRad = function() {
	return (this / 180) * Math.PI;
};

Number.prototype.toDeg = function() {
	return (this * 180) / Math.PI;
};

Object.defineProperty(Array.prototype, 'erase', {value: function(item) {
	for( var i = this.length; i--; ) {
		if( this[i] === item ) {
			this.splice(i, 1);
		}
	}
	return this;
}});

Object.defineProperty(Array.prototype, 'random', {value: function(item) {
	return this[ Math.floor(Math.random() * this.length) ];
}});

export default function() {
// -----------------------------------------------------------------------------
// ig Namespace

const ig = {
	game: null,
	debug: null,
	version: '1.25',
	global: {}, // TODO: find a better way, avoid globals
	resources: [],
	ready: false,
	nocache: '',
	ua: {},

	
	$: function( selector ) {
		return selector.charAt(0) == '#'
			? document.getElementById( selector.substr(1) )
			: document.getElementsByTagName( selector );
	},
	
	
	$new: function( name ) {
		return document.createElement( name );
	},
	
	
	copy: function( object ) {
		if(
		   !object || typeof(object) != 'object' ||
		   object instanceof HTMLElement ||
		   object instanceof ig.Class
		) {
			return object;
		}
		else if( object instanceof Array ) {
			var c = [];
			for( var i = 0, l = object.length; i < l; i++) {
				c[i] = ig.copy(object[i]);
			}
			return c;
		}
		else {
			var c = {};
			for( var i in object ) {
				c[i] = ig.copy(object[i]);
			}
			return c;
		}
	},
	
	
	merge: function( original, extended ) {
		// TODO: custom deep merge?
		for( var key in extended ) {
			var ext = extended[key];
			if(
				typeof(ext) != 'object' ||
				ext instanceof HTMLElement ||
				ext instanceof ig.Class ||
				ext === null
			) {
				original[key] = ext;
			}
			else {
				if( !original[key] || typeof(original[key]) != 'object' ) {
					original[key] = (ext instanceof Array) ? [] : {};
				}
				ig.merge( original[key], ext );
			}
		}
		return original;
	},
	
	
	ksort: function( obj ) {
		if( !obj || typeof(obj) != 'object' ) {
			return [];
		}
		
		var keys = [], values = [];
		for( var i in obj ) {
			keys.push(i);
		}
		
		keys.sort();
		for( var i = 0; i < keys.length; i++ ) {
			values.push( obj[keys[i]] );
		}
		
		return values;
	},

	// Ah, yes. I love vendor prefixes. So much fun!
	setVendorAttribute: function( el, attr, val ) {
		var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		el[attr] = el['ms'+uc] = el['moz'+uc] = el['webkit'+uc] = el['o'+uc] = val;
	},


	getVendorAttribute: function( el, attr ) {
		var uc = attr.charAt(0).toUpperCase() + attr.substr(1);
		return el[attr] || el['ms'+uc] || el['moz'+uc] || el['webkit'+uc] || el['o'+uc];
	},


	normalizeVendorAttribute: function( el, attr ) {
		var prefixedVal = ig.getVendorAttribute( el, attr );
		if( !el[attr] && prefixedVal ) {
			el[attr] = prefixedVal;
		}
	},


	// This function normalizes getImageData to extract the real, actual
	// pixels from an image. The naive method recently failed on retina
	// devices with a backgingStoreRatio != 1
	getImagePixels: function( image, x, y, width, height ) {
		var canvas = ig.$new('canvas');
		canvas.width = image.width;
		canvas.height = image.height;
		var ctx = canvas.getContext('2d');
		
		// Try to draw pixels as accurately as possible
		ig.System.SCALE.CRISP(canvas, ctx);

		var ratio = ig.getVendorAttribute( ctx, 'backingStorePixelRatio' ) || 1;
		ig.normalizeVendorAttribute( ctx, 'getImageDataHD' );

		var realWidth = image.width / ratio,
			realHeight = image.height / ratio;

		canvas.width = Math.ceil( realWidth );
		canvas.height = Math.ceil( realHeight );

		ctx.drawImage( image, 0, 0, realWidth, realHeight );
		
		return (ratio === 1)
			? ctx.getImageData( x, y, width, height )
			: ctx.getImageDataHD( x, y, width, height );
	},

	
	addResource: function( resource ) {
		ig.resources.push( resource );
	},
	
	
	setNocache: function( set ) {
		ig.nocache = set
			? '?' + Date.now()
			: '';
	},
	
	
	// Stubs for ig.Debug
	log: function() {},
	assert: function( condition, msg ) {},
	show: function( name, number ) {},
	mark: function( msg, color ) {},
	
	
	_boot: function() {
		if( document.location.href.match(/\?nocache/) ) {
			ig.setNocache( true );
		}
		
		// Probe user agent string
		ig.ua.pixelRatio = window.devicePixelRatio || 1;
		ig.ua.viewport = {
			width: window.innerWidth,
			height: window.innerHeight
		};
		ig.ua.screen = {
			width: window.screen.availWidth * ig.ua.pixelRatio,
			height: window.screen.availHeight * ig.ua.pixelRatio
		};
		
		ig.ua.iPhone = /iPhone|iPod/i.test(navigator.userAgent);
		ig.ua.iPhone4 = (ig.ua.iPhone && ig.ua.pixelRatio == 2);
		ig.ua.iPad = /iPad/i.test(navigator.userAgent);
		ig.ua.android = /android/i.test(navigator.userAgent);
		ig.ua.winPhone = /Windows Phone/i.test(navigator.userAgent);
		ig.ua.iOS = ig.ua.iPhone || ig.ua.iPad;
		ig.ua.mobile = ig.ua.iOS || ig.ua.android || ig.ua.winPhone || /mobile/i.test(navigator.userAgent);
		ig.ua.touchDevice = (('ontouchstart' in window) || (window.navigator.msMaxTouchPoints));
	}
};


var next = 1,
	anims = {};

ig.setAnimation = function( callback ) {
	var current = next++;
	anims[current] = true;

	var animate = function() {
		if( !anims[current] ) { return; } // deleted?
		window.requestAnimationFrame( animate );
		callback();
	};
	window.requestAnimationFrame( animate );
	return current;
};

ig.clearAnimation = function( id ) {
	delete anims[id];
};



// Merge the ImpactMixin - if present - into the 'ig' namespace. This gives other
// code the chance to modify 'ig' before it's doing any work.
// TODO:
// if( global.ImpactMixin ) {
// ig.merge(ig, global.ImpactMixin);
// }

ig._boot();

return ig;

}