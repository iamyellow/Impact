import React from 'react'

export declare module './Codegen' {
  export const modules: {
    [name: string]: {
      path: string
      name: string
      component: () => React.FC
    }
  }
  export const LevelCodegen: React.FC<{ name?: string }>
}
