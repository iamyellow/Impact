export declare module './impact' {
  type ImpactClass<T> = T & {
    extend<E>(extension: E & Partial<T>): ImpactClass<T & E>
    inject<I extends Partial<T>>(inject: I): void
  }

  interface Impact {
    Class: ImpactClass
  }
}

export declare module './class' {
  export default function (ig: Impact): void
}
