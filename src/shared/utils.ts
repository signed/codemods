import { API, Stats } from 'jscodeshift'

export const apiForTypescript = (): API => {
  // Jest resets the module registry after each test, so we need to always get
  // a fresh copy of jscodeshift on every test run.
  let jscodeshift = require('jscodeshift/src/core').withParser('ts')
  const stats: Stats = () => {}
  const report = () => {}
  return {
    j: jscodeshift,
    jscodeshift,
    stats,
    report,
  }
}

export const isPresent = <T>(maybeValue: T | null | undefined): maybeValue is T => {
  return !(maybeValue === null || maybeValue === undefined)
}
