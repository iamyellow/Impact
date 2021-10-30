import React, { useEffect, useMemo } from 'react'
import { ImpactClass, ImpactEntity } from '../impact/impact'
import {
  ImpactValue,
  EntityContext,
  EntityContextT,
  useImpact
} from './context'

export type EntityProps = {
  children?: React.ReactNode
  name: string
  value?: ImpactValue<ImpactEntity>
  // TODO: onUpdate
} & Partial<ImpactEntity>

export const Entity = (props: EntityProps) => {
  const ig = useImpact()

  const context = useMemo<EntityContextT>(() => {
    return {
      animSheet: null,
      anims: [],
      wm: (props as any)['_wm'] === true
    }
  }, [])

  useEffect(() => {
    const { children, name, ...entityProps } = props
    const { animSheet, anims } = context

    const EntityK = ig.Entity as ImpactClass<typeof ImpactEntity>
    const EntitySubK = EntityK.extend({ ...entityProps, animSheet })
    ig.global[`Entity${name}`] = EntitySubK

    // TODO: create EntitySubK object with init method adding this:
    // take stuff from context
    // this.addAnim( 'idle', 1, [0] );
    // this.addAnim( 'jump', 0.07, [1,2] );

    if (props.value) {
      props.value.value = {} as ImpactEntity
    }
  }, [])

  return (
    <EntityContext.Provider value={context}>
      {props.children}
    </EntityContext.Provider>
  )
}
