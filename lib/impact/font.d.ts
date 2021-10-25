export declare module './impact' {
  class ImpactFontClass extends ImpactImageClass {}

  interface Impact {
    Font: ImpactClass<ImpactFontClass> &
      ImpactImageClassConstructor & {
        ALIGN: {
          CENTER: number
        }
      }
  }
}

export declare module './font' {
  export default function (ig: Impact): void
}
