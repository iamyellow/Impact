import { useEffect } from 'react'
import { useImpact } from './types'

export type InputProps = {
  keyCode: number
  name: string
}

export const KeyInput = (props: InputProps) => {
  const ig = useImpact()

  useEffect(() => {
    // TODO: if wm ignore
    ig.input.bind(props.keyCode, props.name)

    return () => {
      ig.input.unbind(props.keyCode)
    }
  }, [])

  return null
}
