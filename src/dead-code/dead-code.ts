import { readdirSync, statSync } from 'fs';
import b from 'jscodeshift';
import { dirname, join, resolve } from 'path';
import { DefaultFilesystem } from '../shared/filesystem';
import { isImportToSourceFileInProject } from '../shared/shared';

const filesystem = new DefaultFilesystem();

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

const allFilesInProject = walk(resolve(__dirname, '../../sample/default-exports/'));
const allImportedFiles = allFilesInProject.reduce((acc:string[], sourceFile) => {
  const j = b.withParser('ts');
  const source = filesystem.readFileAsString(sourceFile);
  const root = j(source);

  const importedFiles: string[] = [];
  root.find(j.ImportDeclaration).forEach(importDeclaration => {
    const importString = importDeclaration.node.source.value;
    if (typeof importString !== 'string') {
      throw new Error('interesting, import literal is not a string');
    }
    if (!isImportToSourceFileInProject(importString)) {
      return;
    }
    const importerDirectory = dirname(sourceFile);
    const absolutePath = resolve(importerDirectory, importString);
    const absoluteIndexPath = resolve(absolutePath, 'index');
    const candidates = [
      absolutePath + '.ts', absolutePath + '.tsx',
      absoluteIndexPath + '.ts', absoluteIndexPath + '.tsx'
    ];

    const foundFile = candidates.find(p => filesystem.exists(p));
    if (foundFile === undefined) {
      console.log(sourceFile);
      console.log(importString);
      candidates.forEach(can => console.log(can));
      throw new Error(`could not resolve import`);
    }
    importedFiles.push(foundFile);
  });
  return acc.concat(importedFiles);
}, []);


const neverImportedInTheProject = allFilesInProject.filter(fileInProject => !allImportedFiles.includes(fileInProject));
neverImportedInTheProject.forEach(ni => console.log(ni))

