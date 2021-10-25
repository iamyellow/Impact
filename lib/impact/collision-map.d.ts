export declare module './impact' {
  interface Impact {
    CollisionMap: object
  }
}

export declare module './collision-map' {
  export default function (ig: Impact): void
}
