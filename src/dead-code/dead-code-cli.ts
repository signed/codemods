import { probeForDeadCodeIn } from './dead-code';
import { resolve } from 'path';

const args = process.argv.slice(2);

if (args.length !== 1) {
  console.log('have to pass a path', process.argv);
  process.exit(1);
}

const projectPath = resolve(args[0]);
console.log('project path: ' + projectPath);
const unusedModules = probeForDeadCodeIn(projectPath);

const report = unusedModules.map(unused => {
  const lines: string[] = [];
  lines.push(unused.path)
  unused.dependents.forEach(dependent => {
    lines.push('  ' + dependent)
  })
  return lines.join('\n');
}).join('\n');

console.log(report);