// https://augustinlf.com/writing-codemods-to-transform-your-codebase/
import { API, FileInfo } from 'jscodeshift/src/core';

// This function is called for each file you targeted with the CLI
export default function transformer(file: FileInfo, api: API) {
    const j = api.jscodeshift;
    const root = j(file.source);
    // Here you transform the root, which is a collection containing
    // the AST of your file
    return root.toSource();
}
export const parser = 'ts';
