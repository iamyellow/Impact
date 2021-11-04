import React from 'react'

type RecordData = {
  path: string
  name: string
  component: () => any
  data: () => object
}

export const modules: Record<string, RecordData> = {}
/*#levels*/
modules['/*name*/'] = {
  path: '/*&path*/',
  name: '/*name*/',
  component: () =>
    require('/*&requireComponentPath*/').Level/*name*/,
  data: () =>
    require('/*&requireDataPath*/').default
}
/*/levels*/

export const WeltmeisterCodegen = (props: { name: string }) => {
	if (!props.name || !modules[props.name]) {
		return null
	}

	const Component = modules[props.name].component()
	return <Component />
}