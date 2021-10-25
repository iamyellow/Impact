export declare module './impact' {
  type ImpactSystem = {
    width: number
    height: number
    context: CanvasRenderingContext2D
  }

  interface Impact {
    System: ImpactClass<
      ImpactSystem,
      {
        new (
          canvasId: any, // TODO
          fps: number,
          width: number,
          height: number,
          scale?: number
        ): ImpactSystem
      }
    >
    system: ImpactSystem
  }
}

export declare module './system' {
  export default function (ig: Impact): void
}
