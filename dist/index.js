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
