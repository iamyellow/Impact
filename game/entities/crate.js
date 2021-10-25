import { ig } from '../../lib/impact'
import cratepng from '../../media/crate.png'

export const EntityCrate = ig.Entity.extend({
	size: {x: 8, y: 8},
	
	type: ig.Entity.TYPE.B,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER,
	
	animSheet: new ig.AnimationSheet( cratepng, 8, 8 ),
	
	init: function( x, y, settings ) {
		this.addAnim( 'idle', 1, [0] );
		this.parent( x, y, settings );
	}
});
