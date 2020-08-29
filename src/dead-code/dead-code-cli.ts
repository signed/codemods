import { resolve } from 'path'
import { probeForDeadCodeIn } from './dead-code'

const args = process.argv.slice(2)

if (args.length !== 1) {
  console.log('have to pass a path', process.argv)
  process.exit(1)
}

const projectPath = resolve(args[0])
console.log('project path: ' + projectPath)
const unused = probeForDeadCodeIn(projectPath)
const unusedModulesReport = unused.modules
  .map((unused) => {
    const lines: string[] = []
    lines.push(unused.path)
    unused.dependents.forEach((dependent) => {
      lines.push('  ' + dependent)
    })
    return lines.join('\n')
  })
  .join('\n')

console.log(unusedModulesReport)

const filesToIgnore = unused.modules.map((unusedModules) => unusedModules.path)
const unusedExportsReport = unused.exports
  .filter((unusedExport) => !filesToIgnore.includes(unusedExport.path))
  .map((unusedExport) => {
    const lines: string[] = []
    lines.push(unusedExport.path + ':' + unusedExport.name)
    unusedExport.dependents.forEach((dependent) => {
      lines.push('  ' + dependent)
    })
    return lines.join('\n')
  })
  .join('\n')
console.log('\nunused exports')
console.log(unusedExportsReport)
