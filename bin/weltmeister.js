#!/usr/bin/env node

// webpack
const path = require('path')
const webpack = require('webpack')
const WebpackDevServer = require('webpack-dev-server')
const HtmlWebpackPlugin = require('html-webpack-plugin')

// babel plugin
const template = require('@babel/template').default

// server
const json = require('body-parser').json
const writeFile = require('fs').writeFile

const BASE_LIB = `${__dirname}/../lib/react`
const BASE_LIB_WM = `${BASE_LIB}/Weltmeister`
const IMAGE_REGEX = /\.(png|jpg|jpeg|gif)$/i
const DATAJS_REGEX = /\.data\.js/i

const rw_import_tmpl = template(`const LVALUE = require(RVALUE);`)
const rw_require_tmpl = template(`[require(REQUIRED), PATH];`)

const compiler = webpack({
  mode: 'development',
  devtool: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  entry: path.resolve(BASE_LIB_WM, 'index.tsx'),
  output: {
    publicPath: '/'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-typescript',
                '@babel/preset-react',
                '@babel/preset-env'
              ],
              plugins: [
                [
                  '@babel/plugin-transform-runtime',
                  {
                    regenerator: true
                  }
                ],
                '@babel/plugin-syntax-dynamic-import',
                '@babel/plugin-proposal-nullish-coalescing-operator',
                '@babel/plugin-proposal-optional-chaining',
                'codegen',
                ({ types: t }) => {
                  return {
                    visitor: {
                      ImportDeclaration(p) {
                        if (!IMAGE_REGEX.test(p.node.source.value)) {
                          return
                        }

                        let lvalue
                        for (let specifier of p.node.specifiers) {
                          if (specifier.type === 'ImportDefaultSpecifier') {
                            lvalue = specifier.local.name
                          }
                        }

                        let rvalue = p.node.source.value
                        if (!rvalue) {
                          return
                        }

                        const ast = rw_import_tmpl({
                          LVALUE: t.identifier(lvalue),
                          RVALUE: t.stringLiteral(rvalue)
                        })
                        p.replaceWith(ast)
                      },
                      CallExpression(p, state) {
                        if (
                          p.node.callee.type !== 'Identifier' ||
                          p.node.callee.name !== 'require'
                        ) {
                          return
                        }

                        const rvalue = p.node.arguments[0].value

                        if (
                          !rvalue ||
                          !IMAGE_REGEX.test(rvalue) ||
                          DATAJS_REGEX.test(state.file.opts.filename)
                        ) {
                          return
                        }

                        const ast = rw_require_tmpl({
                          REQUIRED: t.stringLiteral(rvalue),
                          PATH: t.stringLiteral(
                            path.posix.resolve(
                              path.posix.parse(state.file.opts.filename).dir,
                              rvalue
                            )
                          )
                        })
                        p.replaceWith(ast)
                        p.skip()
                      }
                    }
                  }
                }
              ]
            }
          }
        ]
      },
      {
        test: IMAGE_REGEX,
        type: 'asset/resource'
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(BASE_LIB_WM, 'index.html')
    })
  ]
})

// dev server + api

const server = new WebpackDevServer(
  {
    open: true,
    hot: false,
    liveReload: false,
    onBeforeSetupMiddleware: (devServer) => {
      if (!devServer) {
        throw new Error('webpack-dev-server is not defined')
      }

      devServer.app.use(json())
      devServer.app.post('/api/save', (req, res) => {
        const { path: filePath, resourceMap, data } = req.body
        const fileDirname = path.posix.dirname(filePath)

        const parsedData = Object.values(resourceMap).reduce((ret, value) => {
          return ret.replaceAll(
            `"${value.src}"`,
            `require("./${path.posix.relative(fileDirname, value.path)}")`
          )
        }, JSON.stringify(data))

        writeFile(filePath, `export default ${parsedData}`, (err) => {
          if (err) {
            console.error(err)
            return res.status(500).end()
          }
        })
        res.status(200).end()
      })
    },
    static: [path.resolve(BASE_LIB_WM, `public`)],
    port: 6120
  },
  compiler
)

server.startCallback(() => {})
