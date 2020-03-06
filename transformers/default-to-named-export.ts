// https://augustinlf.com/writing-codemods-to-transform-your-codebase/
import { API, FileInfo, StringLiteral } from 'jscodeshift/src/core';

export const parser: string = 'ts';

// This function is called for each file you targeted with the CLI
export default (file: FileInfo, api: API) => {
    const j = api.jscodeshift;
    const root = j(file.source);

    const getFirstNode = () => root.find(j.Program).get('body', 0).node;
    const originalFirstNode = getFirstNode();
    const comments = originalFirstNode.comments;

    root.find(j.ExportDefaultDeclaration).forEach(defaultExport => {
        const declarationType = defaultExport.value.declaration.type;
        if (declarationType !== 'StringLiteral') {
            console.log('[skip] ' + declarationType);
            return;
        }
        const exportName = 'One';
        const replacementDeclaration = j.variableDeclaration('const', [
            j.variableDeclarator(j.identifier(exportName), defaultExport.value.declaration as StringLiteral)
        ]);

        j(defaultExport).replaceWith(j.exportDeclaration(false, replacementDeclaration));
    });

    const firstNodeAfterTransformation = getFirstNode();
    if (originalFirstNode !== firstNodeAfterTransformation) {
        firstNodeAfterTransformation.comments = comments;
    }

    return root.toSource();
}
