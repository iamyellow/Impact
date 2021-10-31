import React, { useEffect, useMemo } from 'react'
import { ImpactClass, ImpactEntity } from '../impact/impact'
import {
  EntityContext,
  EntityContextT,
  useImpact,
  useLevelContext
} from './types'

export type EntityProps = {
  children?: React.ReactNode
  name: string
  // TODO: onUpdate
} & Partial<ImpactEntity>

export const Entity = (props: EntityProps) => {
  const ig = useImpact()
  const levelContext = useLevelContext()

  const context = useMemo<EntityContextT>(() => {
    return {
      animSheet: null,
      anims: []
    }
  }, [])

  useEffect(() => {
    const { children, name, ...entityProps } = props
    const { animSheet, anims } = context

    const EntityClass = ig.Entity as ImpactClass<typeof ImpactEntity>

    const EntitySubclass = EntityClass.extend({
      ...entityProps,
      animSheet,
      init(x: number, y: number, settings?: object) {
        this.parent(x, y, settings)
        anims.forEach(({ name, duration, frames }) => {
          this.addAnim(name, duration, frames)
        })
      }
    } as any)
    ig.global[`Entity${name}`] = EntitySubclass

    levelContext.entityModules.push(name)
  }, [])

  return (
    <EntityContext.Provider value={context}>
      {props.children}
    </EntityContext.Provider>
  )
}
