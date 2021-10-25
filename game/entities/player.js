import { ig } from '../../lib/impact'
import playerpng from '../../media/player.png'
import projectilepng from '../../media/projectile.png'

export const EntityPlayer = ig.Entity.extend({
	size: {x: 8, y:14},
	offset: {x: 4, y: 2},

	gravity: 10,
	
	type: ig.Entity.TYPE.A,
	checkAgainst: ig.Entity.TYPE.NONE,
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
	
	animSheet: new ig.AnimationSheet( playerpng, 16, 24 ),	
	
	flip: false,
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		// Add the animations
		this.addAnim( 'idle', 1, [0] );
		this.addAnim( 'jump', 0.07, [1,2] );

		if(!ig.global.wm) {
			//this.body.SetFixedRotation(true);
		}
	},
	
	
	update: function() {
		// move left or right
		if( ig.input.state('left') ) {
			this.flip = true;
		}
		else if( ig.input.state('right') ) {
			this.flip = false;
		}
		
		// jetpack
		if( ig.input.state('jump') ) {
			this.currentAnim = this.anims.jump;
		}
		else {
			this.currentAnim = this.anims.idle;
		}
		
		// shoot
		if( ig.input.pressed('shoot') ) {
			var x = this.pos.x + (this.flip ? -6 : 6 );
			var y = this.pos.y + 6;
			ig.game.spawnEntity( EntityProjectile, x, y, {flip:this.flip} );
		}
		
		this.currentAnim.flip.x = this.flip;
		
		// move!
		this.parent();
	}
});


const EntityProjectile = ig.Entity.extend({
	size: {x: 8, y: 4},
	
	type: ig.Entity.TYPE.NONE,
	checkAgainst: ig.Entity.TYPE.B, 
	collides: ig.Entity.COLLIDES.NEVER, // Collision is already handled by Box2D!
		
	animSheet: new ig.AnimationSheet( projectilepng, 8, 4 ),	
	
	init: function( x, y, settings ) {
		this.parent( x, y, settings );
		
		this.addAnim( 'idle', 1, [0] );
		this.currentAnim.flip.x = settings.flip;
	}	
});
