import * as b from './module-with-many-exports'
import some, { two } from './module-with-many-exports'
import { one, three } from './module-with-many-exports'

console.log(some, one, two, three, b.default)