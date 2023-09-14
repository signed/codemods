import { type One, type Two } from './module-with-many-exports'
import type { Three } from './module-with-many-exports'

const one: One = 1
const two: Two = 2
const three: Three = 3

console.log(one, two, three)
