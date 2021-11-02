import React from 'react'

export declare module './Codegen' {
  export const modules: {
    [name: string]: {
      path: string
      name: string
      component: () => React.FC
    }
  }
  export const WeltmeisterCodegen: React.FC<{ name?: string }>
}
