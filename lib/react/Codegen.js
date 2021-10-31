// @codegen

import glob from "glob"
import path from "path"
import { access, constants, writeFile } from "fs"
import { Buffer } from 'buffer';

const DATA_EXT = '.data.js'

const results = glob.sync(`${process.cwd()}/**/Level?*.+(js|jsx|ts|tsx)`)
const results_js = results.reduce((ret, match) => {
	if (match.indexOf(DATA_EXT) > 0) {
		return ret
	}

	const dir = path.dirname(match)
	const name = path.parse(path.basename(match)).name

	// create data file if not exists
	const data_file = `${dir}/${name}${DATA_EXT}`
	access(data_file, constants.F_OK, (err) => {
		if (!err) {
			// file exists
			return
		}
		writeFile(data_file, new Uint8Array(Buffer.from('{}')), (err) => {
			if (err) {
				console.error(err)
			}
		})
	})

	return `${ret}modules["${name}"] = { path: "${dir}", name: "${name}", component: () => ( require("${match}").${name} )}\n`
}, '')

module.exports  = `import React from 'react'
const PREFIX = 'Level'
export const modules = {}
${results_js}

export const LevelCodegen = (props) => {
	if (!props.name || !modules[props.name]) {
		return null
	}

	const Component = modules[props.name].component()
	return <Component />
}
`