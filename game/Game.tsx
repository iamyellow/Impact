import React, { useEffect } from 'react'
//import { ig } from '../lib/impact'
import pxfont from '../media/crate.png'
import { EntityPlayer } from './entities/player'

/*
export const MyGame = ig.Game.extend<any>({
  font: new ig.Font(pxfont),
  clearColor: '#1b2026',

  init: function (this: any) {
    // Bind keys
    ig.input.bind(ig.KEY.LEFT_ARROW, 'left')
    ig.input.bind(ig.KEY.RIGHT_ARROW, 'right')
    ig.input.bind(ig.KEY.X, 'jump')
    ig.input.bind(ig.KEY.C, 'shoot')

    if (ig.ua.mobile) {
      ig.input.bindTouch('#buttonLeft', 'left')
      ig.input.bindTouch('#buttonRight', 'right')
      ig.input.bindTouch('#buttonShoot', 'shoot')
      ig.input.bindTouch('#buttonJump', 'jump')
    }

    // Load the LevelTest as required above ('game.level.test')
    this.loadLevel(LevelTest)
  },

  loadLevel: function (this: any, data: any) {
    this.parent(data)
    for (var i = 0; i < this.backgroundMaps.length; i++) {
      //this.backgroundMaps[i].preRender = true
    }
  },

  update: function (this: any) {
    // Update all entities and BackgroundMaps
    this.parent()

    // screen follows the player
    var player = this.getEntitiesByType(EntityPlayer)[0]
    if (player) {
      this.screen.x = player.pos.x - ig.system.width / 2
      this.screen.y = player.pos.y - ig.system.height / 2
    }
  },

  draw: function (this: any) {
    // Draw all entities and BackgroundMaps
    this.parent()

    this.font.draw('Arrow Keys, X, C', 2, 2)
  }
})
*/

export const Game = () => {
  useEffect(() => {
    /*
    const img = new Image() as HTMLImageElement
    img.onload = () => {
      const canvas = document.getElementById('canvas') as HTMLCanvasElement

      const drawing = document.createElement('canvas')
      drawing.width = canvas.width
      drawing.height = canvas.height
      const ctx = drawing.getContext('2d')

      const renderer = makeRenderer(canvas)
      if (!renderer || ctx === null) {
        return
      }

      const { makeTexture, clear, draw, flush } = renderer

      const texture = makeTexture(img)

      if (texture === null) {
        return
      }

      let angle = 0
      let angle2 = 0
      let pos = 0
      const loop = () => {
        clear()

        const texture2 = makeTexture(drawing)
        // clear
        ctx.clearRect(0, 0, drawing.width, drawing.height)
        // fill
        ctx.fillStyle = '#fff612'
        ctx.fillRect(pos, pos, 10, 10)

        draw(
          texture,
          img.width,
          img.height,
          // srcX, srcY
          0,
          0,
          // srcWidth, srcHeight
          8,
          8,
          // dstX, dstY
          90,
          90,
          // dstWidth, dstHeight (negative for flip)
          32,
          32,
          // rotation
          angle2.toRad(),
          // pivotX, pivotY
          0.5,
          0.5,
          // alpha
          1.0
        )

        draw(
          texture2!,
          drawing.width,
          drawing.height,
          // srcX, srcY
          0,
          0,
          // srcWidth, srcHeight
          drawing.width,
          drawing.height,
          // dstX, dstY
          0,
          0,
          // dstWidth, dstHeight (negative for flip)
          drawing.width,
          drawing.height,
          // rotation
          0,
          //pivotX, pivotY
          0,
          0,
          // alpha
          1.0
        )

        draw(
          texture,
          img.width,
          img.height,
          // srcX, srcY
          8,
          0,
          // srcWidth, srcHeight
          8,
          8,
          // dstX, dstY
          100,
          100,
          // dstWidth, dstHeight (negative for flip)
          32,
          32,
          // rotation
          angle.toRad(),
          //pivotX, pivotY
          0.5,
          0.5,
          // alpha
          1.0
        )

        pos += 1
        angle += 2
        if (angle >= 360) {
          angle = 0
        }
        angle2 += 1
        if (angle2 >= 360) {
          angle2 = 0
        }

        flush()
        requestAnimationFrame(loop)
      }
      requestAnimationFrame(loop)
    }
    img.src = pxfont*/
    //ig.main('#canvas', MyGame, 60, 320, 240, 2)
  }, [])

  return <canvas id="canvas"></canvas>
}
