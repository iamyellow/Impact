import { createContext, CSSProperties, useContext, useMemo } from 'react'
import { Impact, ImpactEntity } from '../impact/impact'

export type ImpactValue<T> = { value: T }

export const useImpactValue = <T extends object>(): ImpactValue<T> => {
  return useMemo(() => {
    return { value: {} as T }
  }, [])
}

// ig

export const ImpactContext = createContext<Impact>({} as Impact)

export const useImpact = () => {
  return useContext(ImpactContext)
}

// game

export type GameProps = {
  className?: string
  style?: CSSProperties
  children?: React.ReactNode
  scale?: number
}

export type Game = {
  clearLevel: () => void
  setLevel: (level: Level) => void
}

export const GameContext = createContext<Game>({} as Game)

export const useGame = () => {
  return useContext(GameContext)
}

// level

export type LevelProps = {
  name: string
  data?: object
  children?: React.ReactNode
}

export type Level = Pick<LevelProps, 'name' | 'data'> & {
  entities: Array<Entity>
  resources: Array<LevelResource>
}

export const LevelContext = createContext<Level>({} as Level)

export const useLevel = () => {
  return useContext(LevelContext)
}

// entity

export type EntityProps = {
  name: string
  children?: React.ReactNode
} & Partial<Omit<ImpactEntity, 'animSheet'>>

export type Entity = Pick<EntityProps, 'name'> & {
  resources: Array<Resource>
}

export const EntityContext = createContext<Entity | null>(null)

export const useEntity = () => {
  return useContext(EntityContext)
}

// resource

export enum ResourceType {
  ENTITY = 'entity',
  MAP = 'map'
}

export type ResourceAnimation = {
  name: string
  duration: number
  frames: Array<number>
}

export type ResourceProps = {
  name: string
  src: string | number
  width: number
  height: number
  animations?: Array<ResourceAnimation>
}

export type Resource = ResourceProps
export type LevelResource = Resource & { type: ResourceType }
