const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

// shortcuts

const isProduction = process.env.NODE_ENV === 'production'

// configuration

const styleLoader = isProduction ? MiniCssExtractPlugin.loader : 'style-loader'
const optimization = {}
const plugins = [
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, 'index.html')
  })
]

if (isProduction) {
  plugins.push(new MiniCssExtractPlugin({}))
  optimization.minimize = true
  optimization.minimizer = [new CssMinimizerPlugin(), new TerserPlugin()]
}

// config

module.exports = {
  mode: isProduction ? 'production' : 'development',
  devtool: false,
  resolve: {
    extensions: ['.ts', '.tsx', '.js']
  },
  entry: path.resolve(__dirname, 'index.tsx'),
  output: {
    path: path.resolve(__dirname, `dist`),
    publicPath: '/',
    filename: 'game.js'
  },
  module: {
    rules: [
      {
        test: /\.(ts|tsx|js|jsx)$/,
        exclude: /node_modules/,
        use: [
          {
            loader: 'babel-loader'
          }
        ]
      },
      {
        test: /\.css$/,
        exclude: /node_modules/,
        use: [styleLoader, 'css-loader']
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        type: 'asset/resource'
      }
    ]
  },
  plugins,
  optimization,
  devServer: {
    historyApiFallback: true,
		proxy: {
      '/api': {
        target: 'http://localhost:6120',
        pathRewrite: { '^/api': '' },
      },
    },
    static: [path.resolve(__dirname, `public`)],
    port: 3000
  }
}
