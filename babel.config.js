module.exports = {
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
    '@babel/plugin-proposal-optional-chaining'
  ]
}
