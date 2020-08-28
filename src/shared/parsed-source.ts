import { Collection } from 'jscodeshift';
import { JSCodeshift } from 'jscodeshift/src/core';

export interface ParsedSource {
  readonly ast: Collection
  readonly j: JSCodeshift
}

export class DefaultParsedSource implements ParsedSource {
  private readonly _ast: Collection;

  constructor(private readonly source: string, private readonly _j: JSCodeshift) {
    this._ast = _j(source);
  }

  get ast(): Collection {
    return this._ast;
  }

  get j(): JSCodeshift {
    return this._j;
  }
}