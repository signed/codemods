import { readdirSync, statSync } from 'fs';
import jscodeshift, { JSCodeshift } from 'jscodeshift';
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
  imported: string[] | 'all-exports';
}

export type ResolvedImport = Import & {
  pathToSourceFile: PathToSourceFile
}

export type Export = {
  exportString: ExportName;
}

export const extractExportsFrom = (source: string, j: JSCodeshift): Export[] => {
  const root = j(source);
  const exports: Export[] = [];
  const defaultExport = root.find(j.ExportDefaultDeclaration);
  if (defaultExport.length > 0) {
    exports.push({ exportString: 'default' });
  }

  root.find(j.ExportNamedDeclaration).forEach(exp => {
    j(exp).find(j.Identifier).nodes().forEach(identifier => {
      exports.push({ exportString: identifier.name });
    });
  });

  return exports;
};

export const extractImportsFrom = (source: string, j: JSCodeshift): Import[] => {
  const root = j(source);

  const imports: Import[] = [];
  root.find(j.ExportAllDeclaration).forEach(exportAllDeclaration => {
    const importString = exportAllDeclaration.node.source.value;
    if (typeof importString !== 'string') {
      throw new Error(`interesting, import literal is not a string: ${typeof importString}`);
    }
    imports.push({ importString, imported: 'all-exports' });
  });
  root.find(j.ExportNamedDeclaration).forEach(exportNamedDeclaration => {
    const source = exportNamedDeclaration.node.source;
    if (source == null) {
      return;
    }
    const importString = source.value;
    if (typeof importString !== 'string') {
      throw new Error(`interesting: ${typeof importString}`);
    }
    const imported = j(exportNamedDeclaration).find(j.ExportSpecifier).nodes().map(spec => {
      const imported = spec.local?.name;
      if (typeof imported !== 'string') {
        throw new Error('interesting, look at this');
      }
      return imported;
    });
    imports.push({ importString, imported: imported });
  });
  root.find(j.ImportDeclaration).forEach(importDeclaration => {
    const collection = j(importDeclaration);
    const imported = collection.find(j.ImportSpecifier).nodes().map(spec => spec.imported.name);
    if (collection.find(j.ImportDefaultSpecifier).length > 0) {
      imported.push('default');
    }

    const importString = importDeclaration.node.source.value;
    if (typeof importString !== 'string') {
      throw new Error('interesting, import literal is not a string');
    }
    imports.push({ importString, imported: imported });
  });

  return imports;
};

type ExportName = string;
type PathToSourceFile = string;
type UsageLedgerEntry = {
  sourceFile: PathToSourceFile;
  usages: PathToSourceFile[];
  exports: {
    declared: ExportName[] | 'not-recorded',
    usages: Map<ExportName | 'all-exports', PathToSourceFile[]>
  }
}

function initialLedgerEntryFor(sourceFile: string): UsageLedgerEntry {
  return {
    sourceFile: sourceFile,
    usages: [],
    exports: {
      declared: 'not-recorded',
      usages: new Map()
    }
  };
}

export const probeForDeadCodeIn = (projectDirectory: string): UnusedModule[] => {
  const allFilesInProject = walk(projectDirectory).filter((file) => (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts'));

  const filesystem = new DefaultFilesystem();
  const usageLedger = new Map<PathToSourceFile, UsageLedgerEntry>();
  allFilesInProject.forEach(sourceFile => usageLedger.set(sourceFile, initialLedgerEntryFor(sourceFile)));

  allFilesInProject.forEach(sourceFile => {
    const source = filesystem.readFileAsString(sourceFile);
    const j = jscodeshift.withParser(fileExtensionFrom(sourceFile));

    const imports: ResolvedImport[] = extractImportsFrom(source, j)
      .filter(it => isImportToSourceFileInProject(it.importString))
      .map(it => {
        const importerDirectory = dirname(sourceFile);
        const absolutePath = resolve(importerDirectory, it.importString);
        const absoluteIndexPath = resolve(absolutePath, 'index');
        const candidates = [
          absolutePath + '.ts', absolutePath + '.tsx', absolutePath + '.js', absolutePath + '.jsx',
          absoluteIndexPath + '.ts', absoluteIndexPath + '.tsx', absoluteIndexPath + '.js', absoluteIndexPath + '.jsx'
        ];

        const foundSourceFile = candidates.find(p => filesystem.exists(p));
        if (foundSourceFile === undefined) {
          console.log(sourceFile);
          console.log(it);
          candidates.forEach(can => console.log(can));
          throw new Error(`could not resolve import`);
        }
        return {
          pathToSourceFile: foundSourceFile,
          importString: it.importString,
          imported: it.imported
        };
      });

    imports.forEach(resolvedImport => {
      let entry = usageLedger.get(resolvedImport.pathToSourceFile);
      if (entry === undefined) {
        entry = initialLedgerEntryFor(resolvedImport.pathToSourceFile);
        usageLedger.set(resolvedImport.pathToSourceFile, entry);
        throw Error('should not happen');
      }
      entry.usages.push(sourceFile);
      if (resolvedImport.imported === 'all-exports') {
        let usageEntry = entry.exports.usages.get('all-exports');
        if (usageEntry === undefined) {
          usageEntry = [];
          entry.exports.usages.set('all-exports', usageEntry);
        }
        usageEntry.push(sourceFile);
      } else {
        resolvedImport.imported.forEach(it => {
          let usageEntry = entry!.exports.usages.get(it);
          if (usageEntry === undefined) {
            usageEntry = [];
            entry!.exports.usages.set(it, usageEntry);
          }
          usageEntry.push(sourceFile);
        });
      }
    });
    usageLedger.get(sourceFile)!.exports.declared = extractExportsFrom(source, j).map(exp => exp.exportString);
  });

  Array.from(usageLedger.entries())
    .forEach(([sourceFile, entry]) => {
      //sanity check to make sure all exports have been extracted
      //looking at the recorded imports there should also be a declared export
      const exports = entry.exports;
      if (exports.declared === 'not-recorded') {
        throw new Error(`investigate why no exports have been recorded for ${sourceFile}`);
      }
      Array.from(exports.usages.keys()).forEach(usage => {
        if (usage === 'all-exports') {
          return;
        }
        if (!exports.declared.includes(usage)) {
          throw new Error(`a file is importing ${usage} from ${sourceFile} but no export was extracted`);
        }
      });
    });

  const tests = (file: string) => !file.includes('.spec.');
  const storybook = (file: string) => !file.includes('.stories.');

  return Array.from(usageLedger.entries())
    .filter(([sourceFile, _entry]) => tests(sourceFile))
    .filter(([sourceFile, _entry]) => storybook(sourceFile))
    .filter(([_sourceFile, entry]) => entry.usages.filter(tests).filter(storybook).length === 0)
    .map(([sourceFile, entry]) => {
      return {
        path: sourceFile,
        dependents: entry.usages
      };
    });
};

