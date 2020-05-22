import { readdirSync, statSync } from 'fs';
import jscodeshift from 'jscodeshift';
import { dirname, extname, join, resolve } from 'path';
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

const fileExtensionFrom = (sourceFile: string) => extname(sourceFile).slice(1);

let projectDirectory = resolve(__dirname, '../../sample/default-exports/');

const allFilesInProject = walk(projectDirectory).filter((file) => (file.endsWith('.ts') || file.endsWith('.tsx')) && !file.endsWith('.d.ts'));
const allImportedFiles = allFilesInProject.reduce((acc: string[], sourceFile) => {
  const source = filesystem.readFileAsString(sourceFile);
  const j = jscodeshift.withParser(fileExtensionFrom(sourceFile));
  let root = j(source);

  const importStrings: string[] = [];
  root.find(j.ExportAllDeclaration).forEach(exportAllDeclaration => {
    const importString = exportAllDeclaration.node.source.value;
    if (typeof importString !== 'string') {
      throw new Error('interesting, import literal is not a string');
    }
    importStrings.push(importString);
  });
  root.find(j.ImportDeclaration).forEach(importDeclaration => {
    const importString = importDeclaration.node.source.value;
    if (typeof importString !== 'string') {
      throw new Error('interesting, import literal is not a string');
    }
    importStrings.push(importString);
  });
  const pathToImportedFile = importStrings
    .filter(isImportToSourceFileInProject)
    .map(importString => {
      const importerDirectory = dirname(sourceFile);
      const absolutePath = resolve(importerDirectory, importString);
      const absoluteIndexPath = resolve(absolutePath, 'index');
      const candidates = [
        absolutePath + '.ts', absolutePath + '.tsx', absolutePath + '.js', absolutePath + '.jsx',
        absoluteIndexPath + '.ts', absoluteIndexPath + '.tsx', absoluteIndexPath + '.js', absoluteIndexPath + '.jsx'
      ];

      const foundFile = candidates.find(p => filesystem.exists(p));
      if (foundFile === undefined) {
        console.log(sourceFile);
        console.log(importString);
        candidates.forEach(can => console.log(can));
        throw new Error(`could not resolve import`);
      }
      return foundFile;
    });
  return acc.concat(pathToImportedFile);
}, []);


const neverImportedInTheProject = allFilesInProject.filter(fileInProject => !allImportedFiles.includes(fileInProject));

const tests = (file: string) => !file.includes('.spec.');
const storybook = (file: string) => !file.includes('.stories.');

neverImportedInTheProject
  .filter(tests)
  .filter(storybook)
  .forEach(ni => console.log(ni));

