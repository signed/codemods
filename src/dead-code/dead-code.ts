import { readdirSync, statSync } from 'fs';
import jscodeshift from 'jscodeshift';
import { JSCodeshift } from 'jscodeshift/src/core';
import { dirname, extname, join, resolve } from 'path';
import { DefaultFilesystem } from '../shared/filesystem';
import { isImportToSourceFileInProject } from '../shared/shared';

export interface UnusedModule {
  path: string;
  dependents: string [];
}

const walk = (directory: string, acc: string [] = []): string[] => {
  const files = readdirSync(directory);
  files.forEach(file => {
    const fullPath = join(directory, file);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      walk(fullPath, acc);
    } else {
      acc.push(fullPath);
    }
  });
  return acc;
};

const fileExtensionFrom = (path: string) => extname(path).slice(1);

export type Import = {
  importString: string;
  imported: string[] | 'all';
}

export const extractImportsFrom = (source: string, j: JSCodeshift): Import[] => {
  const root = j(source);

  const imports: Import[] = [];
  root.find(j.ExportAllDeclaration).forEach(exportAllDeclaration => {
    const importString = exportAllDeclaration.node.source.value;
    if (typeof importString !== 'string') {
      throw new Error('interesting, import literal is not a string');
    }
    imports.push({ importString, imported: 'all' });
  });
  root.find(j.ImportDeclaration).forEach(importDeclaration => {
    const imported = j(importDeclaration).find(j.ImportSpecifier).nodes().map(spec => spec.imported.name);
    const importString = importDeclaration.node.source.value;
    if (typeof importString !== 'string') {
      throw new Error('interesting, import literal is not a string');
    }
    imports.push({ importString, imported: ['default'] });
  });

  return imports;
};

export const probeForDeadCodeIn = (projectDirectory: string): UnusedModule[] => {
  const allFilesInProject = walk(projectDirectory).filter((file) => (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts'));

  const filesystem = new DefaultFilesystem();
  const dependentsBySourceFile = new Map<string, string[]>();
  allFilesInProject.forEach(sourceFile => dependentsBySourceFile.set(sourceFile, []));

  allFilesInProject.forEach(sourceFile => {
    const source = filesystem.readFileAsString(sourceFile);
    const j = jscodeshift.withParser(fileExtensionFrom(sourceFile));

    const pathToImportedFiles = extractImportsFrom(source, j)
      .filter(it => isImportToSourceFileInProject(it.importString))
      .map(it => {
        const importerDirectory = dirname(sourceFile);
        const absolutePath = resolve(importerDirectory, it.importString);
        const absoluteIndexPath = resolve(absolutePath, 'index');
        const candidates = [
          absolutePath + '.ts', absolutePath + '.tsx', absolutePath + '.js', absolutePath + '.jsx',
          absoluteIndexPath + '.ts', absoluteIndexPath + '.tsx', absoluteIndexPath + '.js', absoluteIndexPath + '.jsx'
        ];

        const foundFile = candidates.find(p => filesystem.exists(p));
        if (foundFile === undefined) {
          console.log(sourceFile);
          console.log(it);
          candidates.forEach(can => console.log(can));
          throw new Error(`could not resolve import`);
        }
        return foundFile;
      });
    pathToImportedFiles.forEach(importedFile => {
      let dependents = dependentsBySourceFile.get(importedFile);
      if (dependents === undefined) {
        dependents = [];
        dependentsBySourceFile.set(importedFile, dependents);
      }
      dependents.push(sourceFile);
    });
  });

  const tests = (file: string) => !file.includes('.spec.');
  const storybook = (file: string) => !file.includes('.stories.');

  return Array.from(dependentsBySourceFile.entries())
    .filter(([sourceFile, _dependents]) => tests(sourceFile))
    .filter(([sourceFile, _dependents]) => storybook(sourceFile))
    .filter(([_sourceFile, dependents]) => dependents.filter(tests).filter(storybook).length === 0)
    .map(([sourceFile, dependents]) => {
      return {
        path: sourceFile,
        dependents
      };
    });
};

