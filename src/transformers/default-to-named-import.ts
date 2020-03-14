import { API, FileInfo, Identifier, Options } from 'jscodeshift/src/core';
import { defaultExportNameResolver, ExportNameResolver } from './default-to-named';
import { DoNotTransform } from './jscodeshift-constants';

export const parser: string = 'ts';
export default (file: FileInfo, api: API, _options: Options) => transform(file, api, _options, defaultExportNameResolver);

export const transform = (file: FileInfo, api: API, _options: Options, exportNameResolver: ExportNameResolver) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform;
  }
  const j = api.jscodeshift;
  const root = j(file.source);
  root.find(j.ImportDefaultSpecifier).forEach((defaultImport) => {
    let exportName = exportNameResolver({}, {});
    let localName: Identifier | null = null;
    if (defaultImport.value.local?.name !== exportName) {
      localName = j.identifier('LocalName');
    }
    defaultImport.replace(j.importSpecifier(j.identifier(exportName), localName));
  });
  return root.toSource({ quote: 'single' });
};

