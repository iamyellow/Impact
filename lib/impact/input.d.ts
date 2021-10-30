export declare module './impact' {
  class ImpactInput {
    bind(key: number, action: string): void
    unbind(key: number)
    state(action: string): boolean
  }

  interface Impact {
    Input: typeof ImpactInput
    input: ImpactInput

    KEY: {
      LEFT_ARROW: number
      RIGHT_ARROW: number
    }
  }
}

export declare module './input' {
  export default function (ig: Impact): void
}
