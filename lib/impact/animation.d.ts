export declare module './impact' {
  class ImpactAnimationSheet {
    constructor(image: string | number, width: number, height: number)
  }
  class ImpactAnimation {}

  interface Impact {
    AnimationSheet: typeof ImpactAnimationSheet
    Animation: typeof ImpactAnimation
  }
}

export declare module './animation' {
  export default function (ig: Impact): void
}
