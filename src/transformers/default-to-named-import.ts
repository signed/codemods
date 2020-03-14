import { API, FileInfo, Options } from 'jscodeshift/src/core';
import { defaultExportNameResolver, ExportNameResolver } from './default-to-named';
import { DoNotTransform } from './jscodeshift-constants';

export const parser: string = 'ts';
export default (file: FileInfo, api: API, _options: Options) => transform(file, api, _options, defaultExportNameResolver);

export const transform = (file: FileInfo, api: API, _options: Options, resolver: ExportNameResolver) => {
  if (file.path.endsWith('.d.ts')) {
    return DoNotTransform;
  }
  const j = api.jscodeshift;
  const root = j(file.source);
  root.find(j.ImportDefaultSpecifier).forEach((defaultImport) => {
    let newName = j.importSpecifier(j.identifier(resolver({},{})));
    defaultImport.replace(newName);
  });
  return root.toSource({ quote: 'single' });
};

