import React from 'react'
import { Level } from '../../lib/react/Level'
import { Resource } from '../../lib/react/Resource'
import { EntityPlayer } from '../entity/EntityPlayer'
import data from './LevelOne.data'
import tilespng from './tiles.png'

export const LevelOne = () => {
  return (
    <Level name="One" data={data}>
      <EntityPlayer />
      <Resource name="tiles" src={tilespng} width={8} height={8} />
    </Level>
  )
}
