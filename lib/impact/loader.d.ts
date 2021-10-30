export declare module './impact' {
  class ImpactLoader {
    load(): void
  }

  interface Impact {
    Loader: typeof ImpactLoader
  }
}

export declare module './loader' {
  export default function (ig: Impact): void
}
