export declare module './impact' {
  class ImpactGame {
    clearColor: string
    font: ImpactFontClass
    init(): void
    draw(): void
    update(): void
  }

  interface Impact {
    Game: ImpactClass<ImpactGame>
    game: ImpactGame
  }
}

export declare module './game' {
  export default function (ig: Impact): void
}
