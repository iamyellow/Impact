export declare module './impact' {
  type ImpactInput = {}

  interface Impact {
    KEY: any
    Input: ImpactClass<ImpactInput>
    input: ImpactInput
  }
}

export declare module './input' {
  export default function (ig: Impact): void
}
