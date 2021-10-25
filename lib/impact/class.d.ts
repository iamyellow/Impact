export declare module './impact' {
  type ImpactClass<T extends typeof class, ctor = null> = {
    new (): T
    extend<E>(extension: E & Partial<T>): ImpactClass<T & E>
    inject<I extends Partial<T>>(inject: I): void
  } & (ctor extends null ? { new (): T } : ctor)

  interface Impact {
    Class: ImpactClass
  }
}

export declare module './class' {
  export default function (ig: Impact): void
}
