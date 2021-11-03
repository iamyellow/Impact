import React, { useEffect, useMemo } from 'react'
import {
  Resource as ResourceT,
  ResourceProps,
  ResourceType,
  useEntity,
  useLevel
} from './types'

export const resolveResource = (resource: any) => {
  if (!Array.isArray(resource)) {
    return resource
  }
  return resource[0]
}

export const Resource = (props: ResourceProps) => {
  const level = useLevel()
  const entity = useEntity()

  const context = useMemo<ResourceT>(() => {
    return props
  }, [])

  useEffect(() => {
    const type = entity !== null ? ResourceType.ENTITY : ResourceType.MAP
    if (type === ResourceType.ENTITY) {
      entity!.resources.push(context)
    }
    level.resources.push({ ...context, type })
  }, [])

  return <>{null}</>
}
