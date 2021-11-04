#!/usr/bin/env node

import HtmlWebpackPlugin from 'html-webpack-plugin'
import { resolve } from 'path'
import webpack, { Compiler } from 'webpack'
import WebpackDevServer from 'webpack-dev-server'
import { makeWeltmeisterServerApi } from './api'
import { weltmeisterBabelConfig } from './babel.wm.config'
import { executeLevelsCodegen } from './codegen'
import { IMAGE_REGEX } from './vars'

const BASE_PATH = resolve(__dirname, '../')

executeLevelsCodegen()

const compiler: Compiler = webpack({
  mode: 'development',
  devtool: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  entry: resolve(BASE_PATH, 'index.tsx'),
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
            options: weltmeisterBabelConfig
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
      template: resolve(BASE_PATH, 'index.html')
    })
  ]
})
// TODO: some research to check if we can run codegen after new level?
//compiler.hooks.afterDone.tap('done', (data) => {
//})

new WebpackDevServer(
  {
    open: false,
    hot: false,
    liveReload: false,
    onBeforeSetupMiddleware: (devServer) => {
      makeWeltmeisterServerApi(devServer.app)
    },
    static: [resolve(BASE_PATH, `public`)],
    port: 6120
  },
  compiler as any
).start()
