import React, { useCallback } from 'react'
import { Level } from '../../lib/react/Level'
import { EntityPlayer } from '../entity/EntityPlayer'
import data from './LevelOne.data'

export const LevelOne = () => {
  // TODO: ImpactGame argument
  const onUpdate = useCallback(() => {
    console.log('*** update game')
  }, [])

  return (
    <Level name="One" data={data} onUpdate={onUpdate}>
      <EntityPlayer />
    </Level>
  )
}
