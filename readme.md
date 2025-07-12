# codemods - what is it about

A small collection of AST transformations to refactor typescript code.
All transformations are driven by individual needs and are by no means a fully working and supported migration tool.
There is no plan to provide a command line runner or to publish the transformers as npm package.
To use it checkout the code, run it and make adjustments as you need them.
If they are useful too other, open a PR.

## Replace default exports with named exports

This [blog post](https://humanwhocodes.com/blog/2019/01/stop-using-default-exports-javascript-module/) gives a bunch of drawbacks when using default exports.
Replacing default exports is a two-step process:

1. Replace the default export in the declaring module with a named export
1. Update all depending on modules that do a default export to use the new named export

### Opportunities

- support for `.tsx` files

## Remove copyright headers

To me copyright headers at the top of a file are noise and distraction.
If you are allowed to remove them, this should help.

### Opportunities

- Implement it

## Identify unused modules and unused exports

### Opportunities

- Implement it

# tools available for the task

- https://astexplorer.net/
  - https://youtu.be/zO07nFlibH0?t=1084
- https://ts-ast-viewer.com/#

## [jscodeshift](https://github.com/facebook/jscodeshift)

[Announcement: Maintenance and Future Plans](https://github.com/facebook/jscodeshift/issues/587)

- https://github.com/elliottsj/jscodeshift-typescript-example
  Contains an example on how to test the code mode in an end-to-end fashion
- https://www.toptal.com/javascript/write-code-to-rewrite-your-code
  tutorial with exercises
- https://github.com/5to6/5to6-codemod/blob/master/transforms/named-export-generation.js
- https://augustinlf.com/writing-codemods-to-transform-your-codebase/
- https://github.com/cpojer/js-codemod
- https://github.com/awslabs/aws-sdk-js-codemod/tree/main/src/transforms/v2-to-v3
- https://github.com/prescottprue/jscodeshift-esm

- https://www.hypermod.io/docs build on top of jscodeshift, docs look interesting

## [ts-morph](https://ts-morph.com/)

- https://github.com/WolkSoftware/tsmod (abstraction on top of ts.morph)

# Examples on how to use jscodeshift

- https://stackoverflow.com/a/58429246

# Replace default imports / exports with named imports / exports

- only replace default imports if the source is in the project

# notes

- https://developer.mozilla.org/en-US/docs/Mozilla/Projects/SpiderMonkey/Parser_API
- https://github.com/facebook/jscodeshift
- https://github.com/benjamn/recast
- https://github.com/benjamn/ast-types
  - ast-types wraps every AST node into a path object
  - paths contain meta-information and helper methods to process AST nodes
  - defines a couple of builder methods, to make creating AST nodes a bit simpler and "safer"

## [astexplorer](https://astexplorer.net/)

To get a typescript AST like you get with jscodeshift

1. change from `acorn` to `@babel/parser`
1. click ⚙️ to open the `@babel/parser` settings
1. uncheck `flow`
1. check `typescript`

# scope

- https://youtu.be/zO07nFlibH0?t=1232 lookup import
- https://youtu.be/zO07nFlibH0?t=1410

# Questions

- what is the difference between path.node and path.value?
  - https://github.com/benjamn/ast-types#nodepath

# remove console.log calls

# https://xkcd.com/1205/

# Other jscodeshift codemods on the web

- [gist to remove unused imports](https://gist.github.com/nemtsov/8f5a6a78268839abaca78ad1fbe8368c)

# Other tools to write and run codemodes

- https://github.com/coderaiser/putout
