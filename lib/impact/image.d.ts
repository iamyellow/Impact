export declare module './impact' {
  class ImpactImage {}

  type ImpactImageConstructors = {
    new (path: string): ImpactImage
  }

  interface Impact {
    Image: ImpactClass<ImpactImage> & ImpactImageConstructors
  }
}

export declare module './image' {
  export default function (ig: Impact): void
}
