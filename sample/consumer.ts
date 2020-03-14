/* this is a comment on the first line*/
import theOne from './default-export-string-literal';
import fruit from './default-export-object-literal';
import sneaky from './default-export-using-as-rename';
import type JustAClass from './default-export-class'

const localVariable: JustAClass | undefined = undefined;
console.log(theOne);
console.log(fruit);
console.log(sneaky);
console.log(localVariable);