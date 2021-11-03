import React, { useEffect, useMemo } from 'react'
import { ImpactClass, ImpactEntity } from '../impact/impact'
import { resolveResource } from './Resource'
import {
  EntityProps,
  Entity as EntityT,
  useImpact,
  EntityContext,
  useLevel
} from './types'

export const Entity = (props: EntityProps) => {
  const ig = useImpact()
  const levelContext = useLevel()

  const context = useMemo<EntityT>(() => {
    const { name } = props
    return {
      name,
      resources: []
    }
  }, [])

  useEffect(() => {
    const { resources } = context
    const { name, children, ...instanceProps } = props

    if (!resources.length) {
      return console.warn(`Entity ${name} without resources`)
    } else if (resources.length > 1) {
      return console.warn(
        `Entity ${name} with more than 1 resource, picking the first`
      )
    }

    const { src, width, height, animations = [] } = resources[0]

    const EntityClass = ig.Entity as ImpactClass<typeof ImpactEntity>

    const EntitySubclass = EntityClass.extend({
      ...instanceProps,
      animSheet: new ig.AnimationSheet(resolveResource(src), width, height),
      init(x: number, y: number, settings?: object) {
        this.parent(x, y, settings)
        animations.forEach(({ name, duration, frames }) => {
          this.addAnim(name, duration, frames)
        })
      }
    } as any)
    ig.global[`Entity${name}`] = EntitySubclass

    levelContext.entities.push(context)
  }, [])

  return (
    <EntityContext.Provider value={context}>
      {props.children}
    </EntityContext.Provider>
  )
}
