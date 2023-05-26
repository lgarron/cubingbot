"use strict";
// We define a simple example.
Object.defineProperty(exports, "__esModule", { value: true });
const Puzzle_1 = require("./structures/Puzzle");
function main() {
    const myPuzzle = new Puzzle_1.SimplePuzzle("3x3x3");
    const myScramble = myPuzzle.scramble(false, false, false);
    if (myScramble)
        return console.log(myScramble);
    console.log("Failed to generate a scramble.");
}
main();
/*

Expected: (A random 3x3x3 scramble)

Encoutered:

Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './scramble' is not defined by "exports" in C:\Users\zzyg\Programmation\cubingbot-tests\node_modules\cubing\package.json
←[90m    at new NodeError (node:internal/errors:399:5)←[39m
←[90m    at exportsNotFound (node:internal/modules/esm/resolve:261:10)←[39m
←[90m    at packageExportsResolve (node:internal/modules/esm/resolve:535:13)←[39m
←[90m    at resolveExports (node:internal/modules/cjs/loader:569:36)←[39m
←[90m    at Module._findPath (node:internal/modules/cjs/loader:643:31)←[39m
←[90m    at Module._resolveFilename (node:internal/modules/cjs/loader:1056:27)←[39m
←[90m    at Module._load (node:internal/modules/cjs/loader:923:27)←[39m
←[90m    at Module.require (node:internal/modules/cjs/loader:1137:19)←[39m
←[90m    at require (node:internal/modules/helpers:121:18)←[39m
    at Object.<anonymous> ←[90m(C:\Users\zzyg\Programmation\cubingbot-tests\←[39mdist\structures\Puzzle.js:4:20←[90m)←[39m {
  code: ←[32m'ERR_PACKAGE_PATH_NOT_EXPORTED'←[39m
}

Node.js v20.2.0

*/ 
