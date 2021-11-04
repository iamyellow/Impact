import { accessSync, constants, readFileSync, writeFileSync } from 'fs'
import glob from 'glob'
import { render } from 'mustache'
import { basename, dirname, parse, resolve } from 'path'
import { LEVELS_GLOB } from '../vars'

const DATA_EXT = '.data.js'
const LEVEL_PREFIX = 'Level'

const INPUT_PATH = resolve(__dirname, '_levels_template.tsx')
const OUTPUT_PATH = resolve(__dirname, '../../Codegen.tsx')

const findLevels = () => {
  return glob.sync(LEVELS_GLOB).map<Record<string, any>>((match) => {
    const fileDir = dirname(match)
    const { name: fileName } = parse(basename(match))
    const path = `${fileDir}/${fileName}`
    const dataFilePath = `${fileDir}/${fileName}${DATA_EXT}`
    const name = fileName.substring(LEVEL_PREFIX.length, fileName.length)

    // ensure data file exists
    try {
      accessSync(dataFilePath, constants.F_OK)
    } catch {
      writeFileSync(dataFilePath, `export default {}`)
    }

    return {
      path,
      name,
      requireComponentPath: match,
      requireDataPath: dataFilePath
    }
  })
}

export const executeLevelsCodegen = () => {
  const output = render(
    readFileSync(INPUT_PATH).toString('utf-8'),
    {
      levels: findLevels()
    },
    {},
    ['/*', '*/']
  )
  writeFileSync(OUTPUT_PATH, output)
}
