/* this is a comment on the first line*/
import theOne from './default-export-string-literal';
import fruit from './default-export-object-literal';
import type JustAClass from './default-export-class'
import someFunction from './default-export-function';
import { default as anotherName } from './default-export-function';

const localVariable: JustAClass | undefined = undefined;
console.log(theOne);
console.log(fruit);
console.log(localVariable);
console.log(someFunction());
console.log(anotherName());