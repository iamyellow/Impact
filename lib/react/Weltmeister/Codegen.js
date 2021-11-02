// @codegen

import glob from 'glob'
import path from 'path'

const DATA_EXT = '.data.js'
const LEVEL_PREFIX = 'Level'

const results = glob.sync(`${process.cwd()}/**/Level?*.+(js|jsx|ts|tsx)`)
const results_js = results.reduce((ret, match) => {
  if (match.indexOf(DATA_EXT) > 0) {
    return ret
  }

  const file_dir = path.dirname(match)
  const { name: file_name } = path.parse(path.basename(match))
  const file_path = `${file_dir}/${file_name}`
  const name = file_name.substring(LEVEL_PREFIX.length, file_name.length)

  return `${ret}modules["${name}"] = { path: "${file_path}", name: "${name}", component: () => ( require("${match}").${file_name} )}\n`
}, '')

module.exports = `import React from 'react'
export const modules = {}
${results_js}

export const WeltmeisterCodegen = (props) => {
	if (!props.name || !modules[props.name]) {
		return null
	}

	const Component = modules[props.name].component()
	return <Component />
}
`
