import type { API, ASTPath, FileInfo, ImportDeclaration, Options } from 'jscodeshift'
import { extractImportString } from '../shared/imports'
import { DoNotTransform } from '../shared/jscodeshift-constants'
import { fileExtensionFrom } from '../shared/paths'

export const parser: string = 'ts'

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API, _options: Options) => transform(file, api, _options)

class Imports {
  readonly valueImports = new Map<string, ASTPath<ImportDeclaration>[]>()
  readonly typeImports = new Map<string, ASTPath<ImportDeclaration>[]>()

  add(importDeclaration: ASTPath<ImportDeclaration>) {
    const storage = this.pickStorageFor(importDeclaration.value.importKind)
    const importString = extractImportString(importDeclaration.value)
    const map = storage
    let declarations = map.get(importString)
    if (declarations === undefined) {
      declarations = []
      map.set(importString, declarations)
    }
    declarations.push(importDeclaration)
  }

  importTypes() {
    return [this.valueImports, this.typeImports]
  }

  pickStorageFor(importKind: 'value' | 'type' | 'typeof' | undefined) {
    switch (importKind) {
      case 'value':
        return this.valueImports
      case 'type':
        return this.typeImports
      default:
        throw new Error(`unhandled import tzype ${importKind}`)
    }
  }
}

export const transform = (file: FileInfo, api: API, _options: Options) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform
  }
  const j = api.jscodeshift.withParser(fileExtensionFrom(file.path))
  const root = j(file.source)
  const imports = new Imports()
  root.find(api.j.ImportDeclaration).forEach((importDeclaration) => {
    imports.add(importDeclaration)
  })
  imports.importTypes().forEach((allValueImports) =>
    allValueImports.forEach((value) => {
      if (value.length < 2) {
        return
      }
      const [first, ...rest] = value
      const specifiers = first.value.specifiers ?? []
      rest.forEach((duplicatedImport) => {
        specifiers.push(...(duplicatedImport.value.specifiers ?? []))
        duplicatedImport.replace()
      })
    }),
  )
  return root.toSource()
}
