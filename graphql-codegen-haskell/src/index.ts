import {
  PluginFunction,
  PluginValidateFn,
} from '@graphql-codegen/plugin-helpers'
import { concatAST } from 'graphql'

import { RawPluginConfig, resolveConfig, validateConfig } from './config'
import { parseFragments } from './parse/fragments'
import { parseOperations } from './parse/operation'
import { renderAPIModule } from './render/api'
import { renderEnumModule } from './render/enum'

export const plugin: PluginFunction<RawPluginConfig> = (
  schema,
  documents,
  rawConfig,
  info = {}
) => {
  const { outputFile = '' } = info

  const config = resolveConfig(rawConfig, outputFile)

  const ast = concatAST(documents.map(({ content }) => content))

  const parsedFragments = parseFragments(ast)
  const { enums, operations } = parseOperations(ast, schema, parsedFragments)

  const renderedEnums = enums.map((parsedEnum) =>
    renderEnumModule(config, parsedEnum)
  )

  const enumModules = renderedEnums.map(({ enumModuleName }) => enumModuleName)
  return renderAPIModule(config, enumModules, operations)
}

export const validate: PluginValidateFn = (_schema, _documents, config) => {
  validateConfig(config)
}
