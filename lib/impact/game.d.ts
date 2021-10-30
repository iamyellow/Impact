export declare module './impact' {
  class ImpactGame {
    clearColor: string
    font: ImpactFontClass
    init(): void
    draw(): void
    update(): void
    startRunLoop(): void
    stopRunLoop(): void
  }

  interface Impact {
    Game: typeof ImpactGame
    game: ImpactGame
  }
}

export declare module './game' {
  export default function (ig: Impact): void
}
