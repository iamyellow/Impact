export declare module './impact' {
  type ImpactLoader = {
    load(): void
  }

  interface Impact {
    Loader: ImpactClass<ImpactLoader>
  }
}

export declare module './loader' {
  export default function (ig: Impact): void
}
