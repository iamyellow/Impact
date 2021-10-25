export declare global {
  interface Number {
    map(istart: number, istop: number, ostart: number, ostop: number): number
    limit(min: number, max: number): number
    round(precision: number): number
    floor(): number
    ceil(): number
    toInt(): number
    toRad(): number
    toDeg(): number
  }

  interface Array<T> {
    erase(item: T): Array<T>
    random(): T
  }
}

export declare module './impact' {
  export interface Impact {
    version: string

    setAnimation: (callback: () => void) => void
    clearAnimation: () => void

    ready: boolean

    // TODO:
    ua: any
    resources: Array<any>
  }

  export default function (): Impact
}
