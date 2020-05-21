import 'jest-extended';
import { apiForTypescript } from '../shared/utils';
import { transform } from './remove-copyright-headers';

describe('replace default export with named export', () => {
  const removeCopyrightHeader = (input: string) => {
    const noOptions = {};
    const fileInfo = { source: input, path: 'source-file.ts' };
    return transform(fileInfo, apiForTypescript(), noOptions);
  };

  test('remove multi line comment in a single line', () => {
    const input = `/* Copyright 2018*/    
export class SomeCode{};`;
    const expected = `export class SomeCode {};`;
    expect(removeCopyrightHeader(input)).toEqual(expected);
  });
  test('remove multi line comment over multiple lines', () => {
    const input = `/*
Copyright 2018
    */    
export class SomeCode {};`;
    const expected = `export class SomeCode {};`;
    expect(removeCopyrightHeader(input)).toEqual(expected);
  });
});
