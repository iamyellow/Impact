import React from 'react'
import { Level } from '../../lib/react/Level'
import { Resource } from '../../lib/react/Resource'
import { EntityPlayer } from '../entity/EntityPlayer'
import tilespng from './tiles.png'
import data from './LevelTwo.data'

export const LevelTwo = () => {
  return (
    <Level name="Two" data={data}>
      <EntityPlayer />
      <Resource name="tiles" src={tilespng} width={8} height={8} />
    </Level>
  )
}
