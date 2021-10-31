import { createContext, CSSProperties, useContext, useMemo } from 'react'
import { Impact, ImpactAnimationSheet } from '../impact/impact'

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

export type GameContextT = {
  clearLevel: () => void
  setLevel: (level: LevelContextT) => void
}

export const GameContext = createContext<GameContextT>({} as GameContextT)

export const useGameContext = () => {
  return useContext(GameContext)
}

// level

export type LevelProps = {
  children?: React.ReactNode
  name: string
  onUpdate: () => void
}

export type LevelContextT = Omit<LevelProps, 'children'> & {
  entityModules: Array<string>
}

export const LevelContext = createContext<LevelContextT>({} as LevelContextT)

export const useLevelContext = () => {
  return useContext(LevelContext)
}

// entity

export type AnimationSheetAnim = {
  name: string
  duration: number
  frames: Array<number>
}

export type EntityContextT = {
  animSheet: ImpactAnimationSheet | null
  anims: Array<AnimationSheetAnim>
}

export const EntityContext = createContext<EntityContextT>({} as EntityContextT)

export const useEntityContext = () => {
  return useContext(EntityContext)
}
