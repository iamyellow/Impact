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

export type GameContextT = {
  clearLevel: () => void
  setLevel: (level: LevelContextT) => void
}

export const GameContext = createContext<GameContextT>({} as GameContextT)

export const useGameContext = () => {
  return useContext(GameContext)
}

// resource

export type Resource = {
  name: string
  src: string | number
  width: number
  height: number
}

// level

export type LevelProps = {
  children?: React.ReactNode
  name: string
  data?: object
  resources?: Array<Resource>
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

export type AnimationSheet = Resource & {
  animations: Array<AnimationSheetAnim>
}

export type EntityProps = {
  children?: React.ReactNode
  name: string
  animationSheet: AnimationSheet
} & Partial<Omit<ImpactEntity, 'animSheet'>>
