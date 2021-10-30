export declare module './impact' {
  class ImpactEntity {
    size: { x: number; y: number }
    animSheet: ImpactAnimationSheet
  }

  interface Impact {
    Entity: typeof ImpactEntity
  }
}

export declare module './entity' {
  export default function (ig: Impact): void
}
