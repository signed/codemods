declare module 'jscodeshift/src/Runner' {
  export interface Options {
    runInBand: boolean
    cpus?: number
    verbode?: 0 | 1 | 2
    stdin?: boolean
    dry?: boolean
    print?: boolean
    babel?: boolean
    extensions?: string
    ignorePattern?: string []
    ignoreConfig?: string []
    silent?: boolean

    [key: string]: boolean | string | number | string []| void
  }

  export interface StatsCounter {
    [key: string]: number | void;
  }

  export interface RunResult {
    error: number
    ok: number
    nochange: number
    skip: number
    stats: any
    timeElapsed: string
  }

  /**
   *
   * @param transformFile absolut path to transformer
   * @param paths
   * @param options
   */
  export function run(transformFile: string, paths: string[], options?: Options): void | RunResult;
}