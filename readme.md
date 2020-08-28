# codemods - what is it about
A small collection of AST transformations to refactor typescript code.
All transformations are driven by individual needs and are by no means a fully working and supported migration tool.
There is no plan to provide a command line runner or to publish the transformers as npm package.
To use it checkout the code, run it and make adjustments as you need them.
If they are useful too other, open a PR.

## Replace default exports with named exports
This [blog post](https://humanwhocodes.com/blog/2019/01/stop-using-default-exports-javascript-module/) gives a bunch of drawbacks when using default exports.
Replacing default exports is a two-step  process:
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
- https://github.com/elliottsj/jscodeshift-typescript-example
  Contains an example on how to test the code mode in an end-to-end fashion
- https://www.toptal.com/javascript/write-code-to-rewrite-your-code
  tutorial with exercises
- https://github.com/5to6/5to6-codemod/blob/master/transforms/named-export-generation.js
- https://augustinlf.com/writing-codemods-to-transform-your-codebase/
- https://github.com/cpojer/js-codemod
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
  
  
# scope
- https://youtu.be/zO07nFlibH0?t=1232 lookup import
- https://youtu.be/zO07nFlibH0?t=1410

# Questions
- what is the difference between path.node and path.value?
  - https://github.com/benjamn/ast-types#nodepath

# remove console.log calls


# https://xkcd.com/1205/