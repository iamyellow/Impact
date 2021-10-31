export declare module './impact' {
  class ImpactSystem {
    constructor(
      canvas: HTMLCanvasElement,
      fps: number,
      width: number,
      height: number,
      scale?: number
    )

    width: number
    height: number
    context: CanvasRenderingContext2D

    // TODO
    delegate: any
  }

  interface Impact {
    System: typeof ImpactSystem
    system: ImpactSystem
  }
}

export declare module './system' {
  export default function (ig: Impact): void
}
