import { randomScrambleForEvent } from "cubing/scramble";
import { Alg } from "cubing/alg";

// Puzzle types as they are defined in cubing/twisty.
export type PuzzleType = "2x2x2" | "3x3x3" | "4x4x4" | "5x5x5" | "6x6x6" | "7x7x7" | "pyraminx" | "skewb" | "clock" | "square1" | "megaminx";

export interface PuzzleEquivalenceTable {
    "2x2x2": string,
    "3x3x3": string,
    "4x4x4": string,
    "5x5x5": string,
    "6x6x6": string,
    "7x7x7": string,
    "square1": string,
    "skewb": string,
    "megaminx": string,
    "pyraminx": string
}

/**
 * Simplification of the Puzzle class in the original CubingBot project.
 * @class
 */
export class SimplePuzzle {
    // Puzzles are not defined the same in cubing/twisty and in cubing/scramble.
    // This object helps converting.
    public static readonly puzzleEquivalences: PuzzleEquivalenceTable = {
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

    public readonly type: PuzzleType;

    constructor(type: PuzzleType) {
        this.type = type;
    }

    private async _scramble(isBlindfolded: boolean, isMultiBlindfolded: boolean, isOneHanded: boolean): Promise<string | string[] | null> {
        // OH + BF and OH + MBF are not valid events.
        if (isBlindfolded && isOneHanded) return null;
        if (isMultiBlindfolded && isOneHanded) return null;

        // Not all events have equivalents, like clock.
        // Because clock isn't implemented in the Discord bot.
        if (this.type in SimplePuzzle.puzzleEquivalences) {
            if (isMultiBlindfolded) {
                // MBF is only for 3x3x3
                if (this.type === "3x3x3") {
                    // For "3x3x3", the eventID will be "333mbf"
                    const scrambleList: string[] = [];
                    const eventID: string = SimplePuzzle.puzzleEquivalences[this.type] + "mbf";

                    try {
                        // Multiblindfolded is an event with 5 scrambles.
                        Promise.all([
                            randomScrambleForEvent(eventID),
                            randomScrambleForEvent(eventID),
                            randomScrambleForEvent(eventID),
                            randomScrambleForEvent(eventID),
                            randomScrambleForEvent(eventID)
                        ])
                        .then(scrambles => scrambles.forEach(
                            scramble => scrambleList.push(scramble.toString())
                        ));

                        return scrambleList;
                    } catch (err) {
                        console.error(err);
                        return null;
                    }
                    
                }

                return null;
            }

            if (isBlindfolded) {
                // BF is only for 3x3x3, 4x4x4 and 5x5x5
                if (this.type === "3x3x3" || this.type === "4x4x4" || this.type === "5x5x5") {
                    const eventID: string = SimplePuzzle.puzzleEquivalences[this.type] + "bf";
                    try {
                        const scramble: Alg = await randomScrambleForEvent(eventID);
                        return scramble.toString();
                    } catch (err) {
                        console.error(err);
                        return null;
                    }
                }
            }

            if (isOneHanded) {
                // OH is only for 3x3x3, 4x4x4 and 5x5x5
                if (this.type === "3x3x3") {
                    const eventID: string = SimplePuzzle.puzzleEquivalences[this.type] + "oh";
                    try {
                        const scramble: Alg = await randomScrambleForEvent(eventID);
                        return scramble.toString();
                    } catch (err) {
                        console.error(err);
                        return null;
                    }
                }
            }

            // I don't get why TypeScript complains here because if this code is running, then
            // SimplePuzzle.puzzleEquivalences[this.type] is a string.

            // @ts-expect-error
            const eventID: string = SimplePuzzle.puzzleEquivalences[this.type];

            try {
                const scramble: Alg = await randomScrambleForEvent(eventID);
                return scramble.toString();
            } catch (err) {
                console.error(err);
                return null;
            }
        }

        return null;
    }

    public scramble(isBlindfolded: boolean = false, isMultiBlindfolded: boolean = false, isOneHanded: boolean = false): string | null {
        let scramble: string | null = null;
        this._scramble(isBlindfolded, isMultiBlindfolded, isOneHanded)
            .then(generatedScramble => {
                if(Array.isArray(generatedScramble)) scramble = generatedScramble.join("\n");
                if(typeof generatedScramble === "string") scramble = generatedScramble;
            })
            .catch(err => console.error(err));
        return scramble;
    }    
}