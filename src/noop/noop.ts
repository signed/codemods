import { API, FileInfo, Options } from 'jscodeshift/src/core'
export const parser: string = 'ts'

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API, _options: Options) => transform(file, api, _options)

export const transform = (file: FileInfo, api: API, _options: Options) => {
  const j = api.jscodeshift
  const root = j(file.source)
  api.report(file.path)
  return root.toSource()
}
