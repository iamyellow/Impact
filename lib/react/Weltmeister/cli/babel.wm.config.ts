import {
  PluginPass,
  template,
  TransformOptions,
  types as t,
  Visitor
} from '@babel/core'
import { parse, resolve } from 'path/posix'
import { IMAGE_REGEX } from './vars'

const DATAJS_REGEX = /\.data\.js/i

const visitor: Visitor<PluginPass> = {
  // imports
  ImportDeclaration(p) {
    if (!IMAGE_REGEX.test(p.node.source.value)) {
      return
    }

    let lvalue: string | undefined
    for (let specifier of p.node.specifiers) {
      if (specifier.type === 'ImportDefaultSpecifier') {
        lvalue = specifier.local.name
      }
    }
    const rvalue = p.node.source.value

    if (!lvalue || !rvalue) {
      return
    }

    p.replaceWith(
      template.statement.ast`const ${t.identifier(
        lvalue
      )} = require(${t.stringLiteral(rvalue)});`
    )
  },
  // requires
  CallExpression(p, state) {
    if (
      p.node.callee.type !== 'Identifier' ||
      p.node.callee.name !== 'require'
    ) {
      return
    }

    let rvalue: string | undefined
    if (p.node.arguments[0].type === 'StringLiteral') {
      rvalue = p.node.arguments[0].value
    }

    if (
      !rvalue ||
      !IMAGE_REGEX.test(rvalue) ||
      !state.file.opts.filename ||
      DATAJS_REGEX.test(state.file.opts.filename)
    ) {
      return
    }

    p.replaceWith(
      template.statement.ast`[require(${t.stringLiteral(
        rvalue
      )}), ${t.stringLiteral(
        resolve(parse(state.file.opts.filename).dir, rvalue)
      )}]`
    )
    p.skip()
  }
}

export const weltmeisterBabelConfig: TransformOptions = {
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
    () => {
      return {
        visitor
      }
    }
  ]
}
