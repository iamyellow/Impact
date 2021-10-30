export declare module './impact' {
  class ImpactImage {
    constructor(path: string)

    path: string
    load: (callback: (path: string, success: true) => void) => void
  }

  interface Impact {
    Image: typeof ImpactImage
  }
}

export declare module './image' {
  export default function (ig: Impact): void
}
