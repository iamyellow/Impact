export declare module './impact' {
  interface Impact {
    Entity: object
  }
}

export declare module './entity' {
  export default function (ig: Impact): void
}
