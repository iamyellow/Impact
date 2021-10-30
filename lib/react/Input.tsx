import { useEffect } from 'react'
import { useImpact } from './context'

export type InputProps = {
  keyCode: number
  name: string
}

export const KeyInput = (props: InputProps) => {
  const ig = useImpact()

  useEffect(() => {
    if (ig._wm === true) {
      return
    }

    ig.input.bind(props.keyCode, props.name)

    return () => {
      ig.input.unbind(props.keyCode)
    }
  }, [])

  return null
}
