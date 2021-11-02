import React, { useEffect } from 'react'
import { ImpactClass, ImpactEntity } from '../impact/impact'
import { EntityProps, useImpact, useLevelContext } from './types'
import { resolveResource as resolveResourceSource } from './Weltmeister/resources'

export const Entity = (props: EntityProps) => {
  const ig = useImpact()
  const levelContext = useLevelContext()

  useEffect(() => {
    const { name, animationSheet, children, ...rest } = props

    const EntityClass = ig.Entity as ImpactClass<typeof ImpactEntity>

    const EntitySubclass = EntityClass.extend({
      ...rest,
      animSheet: new ig.AnimationSheet(
        resolveResourceSource(animationSheet.src),
        animationSheet.width,
        animationSheet.height
      ),
      init(x: number, y: number, settings?: object) {
        this.parent(x, y, settings)
        animationSheet.animations.forEach(({ name, duration, frames }) => {
          this.addAnim(name, duration, frames)
        })
      }
    } as any)
    ig.global[`Entity${name}`] = EntitySubclass

    levelContext.entityModules.push(name)
  }, [])

  return <>{props.children ?? null}</>
}
