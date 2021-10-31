import React, { useEffect, useMemo } from 'react'
import { ImpactAnimationSheet } from '../impact/impact'
import {
  AnimationSheetAnim,
  ImpactValue,
  useEntityContext,
  useImpact
} from './types'

export const Animation = (props: AnimationSheetAnim) => {
  const entity = useEntityContext()

  useEffect(() => {
    entity.anims.push(props)
  }, [])

  return null
}

export type AnimationSheetProps = {
  children?: React.ReactNode
  image: string
  width: number
  height: number
  value?: ImpactValue<ImpactAnimationSheet>
}

export const AnimationSheet = (props: AnimationSheetProps) => {
  const ig = useImpact()
  const entity = useEntityContext()

  const animSheet = useMemo<ImpactAnimationSheet>(() => {
    const { image, width, height } = props
    return new ig.AnimationSheet(image, width, height)
  }, [])

  useEffect(() => {
    entity.animSheet = animSheet
    if (props.value) {
      props.value.value = animSheet
    }
  }, [])

  return <>{props.children}</>
}
