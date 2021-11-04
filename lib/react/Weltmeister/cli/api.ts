import { json } from 'body-parser'
import { Application } from 'express'
import { writeFile } from 'fs'
import { dirname, relative } from 'path/posix'

type Body = {
  path: string
  resourceMap: Record<string, { src: string; path: string }>
  data: object
}

export const makeWeltmeisterServerApi = (app: Application) => {
  app.use(json())
  app.post('/api/save', (req, res) => {
    const { path: filePath, resourceMap, data } = req.body as Body
    const fileDirname = dirname(filePath)

    const parsedData = Object.values(resourceMap).reduce<string>(
      (ret, value) => {
        return ret.replaceAll(
          `"${value.src}"`,
          `require("./${relative(fileDirname, value.path)}")`
        )
      },
      JSON.stringify(data)
    )

    writeFile(filePath, `export default ${parsedData}`, (err) => {
      if (err) {
        console.error(err)
        return res.status(500).end()
      }
    })

    res.status(200).end()
  })
}
