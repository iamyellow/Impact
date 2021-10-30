export declare module './impact' {
  class ImpactFontClass extends ImpactImageClass {}

  interface Impact {
    Font: typeof ImpactFontClass
  }
}

export declare module './font' {
  export default function (ig: Impact): void
}
