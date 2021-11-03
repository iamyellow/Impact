import { Impact, ImpactGame, ImpactInput } from '../impact/impact'

export declare module './weltmeister' {
  class WeltmeisterGame extends ImpactGame {
    static getMaxWidth(): number
    static getMaxHeight(): number

    loadLevel(context: object, resourceMap: object): void

    onSaveLevel(name: string): void
    onLoadLevel(name: string): void
  }

  class WeltmeisterEventedInput extends ImpactInput {}

  type Weltmeister = {
    Weltmeister: typeof WeltmeisterGame
    EventedInput: typeof WeltmeisterEventedInput

    levels: object
    config: WeltmeisterConfig
    input: WeltmeisterEventedInput
  }

  export default function (
    impact: Impact
  ): Weltmeister
}
