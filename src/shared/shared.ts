import { Collection } from 'jscodeshift/src/Collection'
import { JSCodeshift } from 'jscodeshift/src/core'

export const preserveCommentAtStartOfFile = (root: Collection<any>, j: JSCodeshift, execute: () => void) => {
  const getFirstNode = () => root.find(j.Program).get('body', 0).node
  const originalFirstNode = getFirstNode()
  const comments = originalFirstNode.comments

  execute()

  const firstNodeAfterTransformation = getFirstNode()
  if (originalFirstNode !== firstNodeAfterTransformation) {
    firstNodeAfterTransformation.comments = comments
  }
}

export const isImportToSourceFileInProject = (importString: string) =>
  !isLibraryImport(importString) && isSourceFileImport(importString)

export const isLibraryImport = (importString: string): boolean => {
  return importString.includes('node_modules') || !importString.startsWith('.')
}
export const isSourceFileImport = (importString: string): boolean => {
  const noSourceFileExtensions = ['.png', '.json', '.mp3', '.css']
  return !noSourceFileExtensions.some((ext) => importString.endsWith(ext))
}
