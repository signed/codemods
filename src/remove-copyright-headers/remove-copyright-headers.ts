import { API, FileInfo, Node, Options } from 'jscodeshift/src/core'
export const parser: string = 'ts'

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API, _options: Options) => transform(file, api, _options)

export const transform = (file: FileInfo, api: API, _options: Options) => {
  const j = api.jscodeshift
  const root = j(file.source)

  const firstNode = root.find(j.Program).get('body', 0).node as Node
  firstNode.comments = null

  api.report(file.path)
  return root.toSource()
}
