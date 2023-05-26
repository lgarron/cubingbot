"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimplePuzzle = void 0;
const scramble_1 = require("cubing/scramble");
/**
 * Simplification of the Puzzle class in the original CubingBot project.
 * @class
 */
class SimplePuzzle {
    // Puzzles are not defined the same in cubing/twisty and in cubing/scramble.
    // This object helps converting.
    static puzzleEquivalences = {
        "2x2x2": "222",
        "3x3x3": "333",
        "4x4x4": "444",
        "5x5x5": "555",
        "6x6x6": "666",
        "7x7x7": "777",
        "square1": "sq1",
        "skewb": "skewb",
        "megaminx": "minx",
        "pyraminx": "pyram"
    };
    type;
    constructor(type) {
        this.type = type;
    }
    async _scramble(isBlindfolded, isMultiBlindfolded, isOneHanded) {
        // OH + BF and OH + MBF are not valid events.
        if (isBlindfolded && isOneHanded)
            return null;
        if (isMultiBlindfolded && isOneHanded)
            return null;
        // Not all events have equivalents, like clock.
        // Because clock isn't implemented in the Discord bot.
        if (this.type in SimplePuzzle.puzzleEquivalences) {
            if (isMultiBlindfolded) {
                // MBF is only for 3x3x3
                if (this.type === "3x3x3") {
                    // For "3x3x3", the eventID will be "333mbf"
                    const scrambleList = [];
                    const eventID = SimplePuzzle.puzzleEquivalences[this.type] + "mbf";
                    try {
                        // Multiblindfolded is an event with 5 scrambles.
                        Promise.all([
                            (0, scramble_1.randomScrambleForEvent)(eventID),
                            (0, scramble_1.randomScrambleForEvent)(eventID),
                            (0, scramble_1.randomScrambleForEvent)(eventID),
                            (0, scramble_1.randomScrambleForEvent)(eventID),
                            (0, scramble_1.randomScrambleForEvent)(eventID)
                        ])
                            .then(scrambles => scrambles.forEach(scramble => scrambleList.push(scramble.toString())));
                        return scrambleList;
                    }
                    catch (err) {
                        console.error(err);
                        return null;
                    }
                }
                return null;
            }
            if (isBlindfolded) {
                // BF is only for 3x3x3, 4x4x4 and 5x5x5
                if (this.type === "3x3x3" || this.type === "4x4x4" || this.type === "5x5x5") {
                    const eventID = SimplePuzzle.puzzleEquivalences[this.type] + "bf";
                    try {
                        const scramble = await (0, scramble_1.randomScrambleForEvent)(eventID);
                        return scramble.toString();
                    }
                    catch (err) {
                        console.error(err);
                        return null;
                    }
                }
            }
            if (isOneHanded) {
                // OH is only for 3x3x3, 4x4x4 and 5x5x5
                if (this.type === "3x3x3") {
                    const eventID = SimplePuzzle.puzzleEquivalences[this.type] + "oh";
                    try {
                        const scramble = await (0, scramble_1.randomScrambleForEvent)(eventID);
                        return scramble.toString();
                    }
                    catch (err) {
                        console.error(err);
                        return null;
                    }
                }
            }
            // I don't get why TypeScript complains here because if this code is running, then
            // SimplePuzzle.puzzleEquivalences[this.type] is a string.
            // @ts-expect-error
            const eventID = SimplePuzzle.puzzleEquivalences[this.type];
            try {
                const scramble = await (0, scramble_1.randomScrambleForEvent)(eventID);
                return scramble.toString();
            }
            catch (err) {
                console.error(err);
                return null;
            }
        }
        return null;
    }
    scramble(isBlindfolded = false, isMultiBlindfolded = false, isOneHanded = false) {
        let scramble = null;
        this._scramble(isBlindfolded, isMultiBlindfolded, isOneHanded)
            .then(generatedScramble => {
            if (Array.isArray(generatedScramble))
                scramble = generatedScramble.join("\n");
            if (typeof generatedScramble === "string")
                scramble = generatedScramble;
        })
            .catch(err => console.error(err));
        return scramble;
    }
}
exports.SimplePuzzle = SimplePuzzle;
