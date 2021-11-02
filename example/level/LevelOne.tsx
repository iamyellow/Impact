import React from 'react'
import { Level } from '../../lib/react/Level'
import { Resource } from '../../lib/react/types'
import { EntityPlayer } from '../entity/EntityPlayer'
import data from './LevelOne.data'
import tilespng from './tiles.png'

const resources: Array<Resource> = [
  { name: 'tiles', src: tilespng, width: 8, height: 8 }
]

export const LevelOne = () => {
  return (
    <Level name="One" data={data} resources={resources}>
      <EntityPlayer />
    </Level>
  )
}
