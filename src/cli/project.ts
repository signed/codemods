//https://github.com/dojo/cli-upgrade-app/blob/master/src/main.ts
import execa from 'execa'
import fs from 'fs'
import path from 'path'
import { run as runTransformer } from 'jscodeshift/src/Runner'

type LernaListPackageDescriptor = {
  name: string
  version: string
  private: boolean
  location: string
}

export interface Options {
  [key: string]: string
}

export interface Transformation {
  transformerPath: string
  options?: Options
  dry?: boolean
}

export class Project {
  constructor(private readonly projectRoot: string) {
  }

  run(transformation: Transformation) {
    const paths = this.packagePaths()
    const options = {
      parser: 'tsx',
      babel: true,
      extensions: 'ts,tsx',
      dry: transformation.dry ?? false,
      verbose: 0,
      silent: true,
      runInBand: false,
      ...transformation.options
    }
    return runTransformer(transformation.transformerPath, paths, options)
  }

  private packagePaths(): string [] {
    if (fs.existsSync(path.resolve(this.projectRoot, 'lerna.json'))) {
      const process = execa.sync('yarn', ['--silent', 'lerna', 'list', '--json', '--loglevel=silent'], {
        cwd: this.projectRoot,
      })
      const packages: LernaListPackageDescriptor[] = JSON.parse(process.stdout)
      return packages.map(project => project.location)
    }
    return [this.projectRoot]
  }
}
