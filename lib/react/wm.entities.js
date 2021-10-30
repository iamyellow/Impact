// @codegen

const glob = require("glob")

const results = glob.sync(`${process.cwd()}/**/Entity?*.*(js|jsx|ts|tsx)`)
const results_js = results.reduce((ret, match) => {
	return `${ret}modules.push(require('${match}'))\n`
}, '')

module.exports  = `import React from 'react'
const ENTITY_PREFIX = 'Entity'
const modules = []
${results_js}

const components = modules.reduce((ret, module) => {	
	return [...ret, ...Object.entries(module).reduce((ret, [key, value]) => {
		if (key.indexOf(ENTITY_PREFIX) !== 0) {
			return ret
		}
		return [...ret, value]
	}, [])]
}, [])

export const WeltmeiserEntities = () => {
	return <>{components.map((C, idx) => {
		return <C key={'wmEntity' + idx} />
	})}</>
}
`