// https://augustinlf.com/writing-codemods-to-transform-your-codebase/
import { API, FileInfo } from 'jscodeshift/src/core';

export const parser: string = 'ts';

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(file.source);
    api.report(file.path);
    return root.toSource();
}
