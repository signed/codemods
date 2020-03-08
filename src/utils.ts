import { API, FileInfo, Options, Stats, Transform } from 'jscodeshift';

export type TestOptions = {
  parser?: string
}

export function applyTransform(transform: Transform, options: Options, input:FileInfo, testOptions: TestOptions = {}) {
  // Jest resets the module registry after each test, so we need to always get
  // a fresh copy of jscodeshift on every test run.
  let jscodeshift = require('jscodeshift/src/core');
  if (testOptions.parser) {
    jscodeshift = jscodeshift.withParser(testOptions.parser);
  }
  const stats: Stats = () => {
  };
  const report = () => {
  };
  const api: API = {
    j:jscodeshift,
    jscodeshift,
    stats,
    report
  };
  return transform(input, api, options);
}



