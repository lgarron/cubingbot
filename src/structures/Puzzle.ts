import path from "path";
import fs from "fs";
import puppeteer, { Browser, Page } from "puppeteer";

// https://github.com/cubing/cubing.js/issues/271
import { randomScrambleForEvent } from "cubing/scramble";
import { Alg } from "cubing/alg";

// Problems with the cubing package. _scramble and scramble function have been removed
// till I somehow find a way to make it work.

import { solve, initialize } from 'cube-solver';
import { convertMoveToValidMove } from "../helpers/convertMoveToValidMove";

// Initialize the Kociemba solver.
initialize('kociemba');

// Clock and square1 are missing because twisty don't implement these (yet?)
export type PuzzleType =
    "2x2x2" |
    "3x3x3" |
    "4x4x4" |
    "5x5x5" |
    "6x6x6" |
    "7x7x7" |
    "pyraminx" |
    "skewb" |
    "clock" |
    "square1" |
    "megaminx";

export class Puzzle {
    static readonly puzzleTypeEquivalences = {
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
    }

    static SMALL = 250;
    static MEDIUM = 650;
    static LARGE = 1250;

    static readonly allRotations: string[] = [
        "x", "x'", "x2",
        "y", "y'", "y2",
        "z", "z'", "z2",
    ];

    static readonly allPossibleSquare1Moves: string[] = [
        "/",

        "(-5,-5)", "(-4,-5)", "(-3,-5)", "(-2,-5)", "(-1,-5)",
        "(0,-5)", "(1,-5)", "(2,-5)", "(3,-5)", "(4,-5)", "(5,-5)", "(6,-5)",

        "(-5,-4)", "(-4,-4)", "(-3,-4)", "(-2,-4)", "(-1,-4)",
        "(0,-4)", "(1,-4)", "(2,-4)", "(3,-4)", "(4,-4)", "(5,-4)", "(6,-4)",

        "(-5,-3)", "(-4,-3)", "(-3,-3)", "(-2,-3)", "(-1,-3)",
        "(0,-3)", "(1,-3)", "(2,-3)", "(3,-3)", "(4,-3)", "(5,-3)", "(6,-3)",

        "(-5,-2)", "(-4,-2)", "(-3,-2)", "(-2,-2)", "(-1,-2)",
        "(0,-2)", "(1,-2)", "(2,-2)", "(3,-2)", "(4,-2)", "(5,-2)", "(6,-2)",

        "(-5,-1)", "(-4,-1)", "(-3,-1)", "(-2,-1)", "(-1,-1)",
        "(0,-1)", "(1,-1)", "(2,-1)", "(3,-1)", "(4,-1)", "(5,-1)", "(6,-1)",

        "(-5,0)", "(-4,0)", "(-3,0)", "(-2,0)", "(-1,0)",
        "(1,0)", "(2,0)", "(3,0)", "(4,0)", "(5,0)", "(6,0)",

        "(-5,1)", "(-4,1)", "(-3,1)", "(-2,1)", "(-1,1)",
        "(0,1)", "(1,1)", "(2,1)", "(3,1)", "(4,1)", "(5,1)", "(6,1)",

        "(-5,2)", "(-4,2)", "(-3,2)", "(-2,2)", "(-1,2)",
        "(0,2)", "(1,2)", "(2,2)", "(3,2)", "(4,2)", "(5,2)", "(6,2)",

        "(-5,3)", "(-4,3)", "(-3,3)", "(-2,3)", "(-1,3)",
        "(0,3)", "(1,3)", "(2,3)", "(3,3)", "(4,3)", "(5,3)", "(6,3)",

        "(-5,4)", "(-4,4)", "(-3,4)", "(-2,4)", "(-1,4)",
        "(0,4)", "(1,4)", "(2,4)", "(3,4)", "(4,4)", "(5,4)", "(6,4)",

        "(-5,5)", "(-4,5)", "(-3,5)", "(-2,5)", "(-1,5)",
        "(0,5)", "(1,5)", "(2,5)", "(3,5)", "(4,5)", "(5,5)", "(6,5)",

        "(-5,6)", "(-4,6)", "(-3,6)", "(-2,6)", "(-1,6)",
        "(0,6)", "(1,6)", "(2,6)", "(3,6)", "(4,6)", "(5,6)", "(6,6)",
    ];

    static readonly allPossiblePyraminxMoves: string[] = [
        "L", "L'", "L2",
        "R", "R'", "R2",
        "L", "L'", "L2",
        "U", "U'", "U2",
        "D", "D'", "D2",
        "F", "F'", "F2",
        "B", "B'", "B2",
    ];

    static readonly allPossibleSkewbMoves: string[] = [
        // All rotations...
        ...this.allRotations,
        // and..
        "R", "R'", "R2",
        "L", "L'", "L2",
        "U", "U'", "U2",
        "F", "F'", "F2"
    ]

    static readonly allPossible2x2Moves: string[] = [
        // All rotations...
        ...this.allRotations,
        // and..
        "R", "R'", "R2",
        "L", "L'", "L2",
        "U", "U'", "U2",
        "F", "F'", "F2",
        "D", "D'", "D2",
        "B", "B'", "B2"
    ];

    static readonly allPossibleMegaminxMoves: string[] = [
        // Lowercase letters -> wide moves
        "R", "R'", "R2",
        "r", "r'", "r2",
        "L", "L'", "L2",
        "l", "l'", "l2",
        "U", "U'", "U2",
        "u", "u'", "u2",
        "F", "F'", "F2",
        "f", "f'", "f2",
        "D", "D'", "D2",
        "d", "d'", "d2",
        "B", "B'", "B2",
        "b", "b'", "b2",
        "R--", "R++",
        "D--", "D++"
    ];

    static readonly allPossible3x3Moves: string[] = [
        // All possible 2x2 moves...
        ...this.allPossible2x2Moves,
        // and...

        // Inner slice moves
        // Possible on a 3x3x3 only
        "S", "S'", "S2",
        "E", "E'", "E2",
        "M", "M'", "M2",
        "Rw", "Rw'", "Rw2",
        "Lw", "Lw'", "Lw2",
        "Uw", "Uw'", "Uw2",
        "Dw", "Dw'", "Dw2",
        "Fw", "Fw'", "Fw2",
        "Bw", "Bw'", "Bw2",
    ]

    static readonly allPossible4x4Moves: string[] = [
        // All possible 2x2 moves...
        // Not all possible 3x3x3 moves because on a 4x4, M doesn't exist.
        ...this.allPossible2x2Moves,
        // and...

        // 2 slice wide moves
        "Rw", "Rw'", "Rw2",
        "Lw", "Lw'", "Lw2",
        "Uw", "Uw'", "Uw2",
        "Dw", "Dw'", "Dw2",
        "Fw", "Fw'", "Fw2",
        "Bw", "Bw'", "Bw2",

        // 3 slice wide moves
        "3Rw", "3Rw'", "3Rw2",
        "3Lw", "3Lw'", "3Lw2",
        "3Uw", "3Uw'", "3Uw2",
        "3Dw", "3Dw'", "3Dw2",
        "3Fw", "3Fw'", "3Fw2",
        "3Bw", "3Bw'", "3Bw2",


        // 4x4x4 slice moves

        // 1L (written L) would the most left slice, 2L the 2nd, 3L the third and 4L the fourth (technicall also the right side)
        // On the 4x4x4, since there are 4 edges: 3L is the same slice move as 2R'
        // Same logic applies for all bigger cubes.
        "2L", "2L'", "2L2",
        "2U", "2U'", "2U2",
        "2D", "2D'", "2D2",
        "2R", "2R'", "2R2",
        "2F", "2F'", "2F2",
        "2B", "2B'", "2B2",
        "3L", "3L'", "3L2",
        "3U", "3U'", "3U2",
        "3D", "3D'", "3D2",
        "3R", "3R'", "3R2",
        "3F", "3F'", "3F2",
        "3B", "3B'", "3B2",
        "4L", "4L'", "4L2",
        "4U", "4U'", "4U2",
        "4D", "4D'", "4D2",
        "4R", "4R'", "4R2",
        "4F", "4F'", "4F2",
        "4B", "4B'", "4B2"
    ];

    static readonly allPossible5x5Moves: string[] = [
        // All possible moves in smaller puzzle:
        ...this.allPossible4x4Moves,
        // along with...

        // Wide moves. See the number before is always the size of the cube (here: 5) minus one.
        // The other ones are already included in the smaller puzzles, no need to reinclude them here.
        "4Rw", "4Rw'", "4Rw2",
        "4Lw", "4Lw'", "4Lw2",
        "4Uw", "4Uw'", "4Uw2",
        "4Dw", "4Dw'", "4Dw2",
        "4Fw", "4Fw'", "4Fw2",
        "4Bw", "4Bw'", "4Bw2",

        // Slice moves. See the number before is always the size of the cube (5 again).
        // The other ones are already included in the smaller puzzles, no need to reincluded them here.
        "5L", "5L'", "5L2",
        "5U", "5U'", "5U2",
        "5D", "5D'", "5D2",
        "5R", "5R'", "5R2",
        "5F", "5F'", "5F2",
        "5B", "5B'", "5B2"
    ];

    static readonly allPossible6x6Moves: string[] = [
        // All possible moves in smaller puzzles:
        ...this.allPossible5x5Moves,
        // Wide moves. See the number before is always the size of the cube (here: 6) minus one.
        // The other ones are already included in the smaller puzzles, no need to reinclude them here.
        "5Rw", "5Rw'", "5Rw2",
        "5Lw", "5Lw'", "5Lw2",
        "5Uw", "5Uw'", "5Uw2",
        "5Dw", "5Dw'", "5Dw2",
        "5Fw", "5Fw'", "5Fw2",
        "5Bw", "5Bw'", "5Bw2",

        // Slice moves. See the number before is always the size of the cube (6 again).
        // The other ones are already included in the smaller puzzles, no need to reincluded them here.
        "6L", "6L'", "6L2",
        "6U", "6U'", "6U2",
        "6D", "6D'", "6D2",
        "6R", "6R'", "6R2",
        "6F", "6F'", "6F2",
        "6B", "6B'", "6B2"
    ];


    static readonly allPossible7x7Moves: string[] = [
        // All possible moves in smaller puzzles:
        ...this.allPossible6x6Moves,    // Wide moves. See the number before is always the size of the cube (here: 7) minus one.
        // The other ones are already included in the smaller puzzles, no need to reinclude them here.
        "6Rw", "6Rw'", "6Rw2",
        "6Lw", "6Lw'", "6Lw2",
        "6Uw", "6Uw'", "6Uw2",
        "6Dw", "6Dw'", "6Dw2",
        "6Fw", "6Fw'", "6Fw2",
        "6Bw", "6Bw'", "6Bw2",

        // Slice moves. See the number before is always the size of the cube (7 again).
        // The other ones are already included in the smaller puzzles, no need to reincluded them here.
        "7L", "7L'", "7L2",
        "7U", "7U'", "7U2",
        "7D", "7D'", "7D2",
        "7R", "7R'", "7R2",
        "7F", "7F'", "7F2",
        "7B", "7B'", "7B2"
    ];


    public readonly type: PuzzleType;
    private _algorithm: string;

    static isCubic(puzzleType: PuzzleType): boolean {
        if (
            puzzleType === "2x2x2" ||
            puzzleType === "3x3x3" ||
            puzzleType === "4x4x4" ||
            puzzleType === "5x5x5" ||
            puzzleType === "6x6x6" ||
            puzzleType === "7x7x7"
        ) return true;
        return false;
    }

    /**
     * Converts a string algorithm into a puzzle algorithm string.
     * 
     * It does the conversion of Lw or other moves with several notations into the one needed.
     * 
     * @param alg - The algorithm to converts
     * @returns - The converted algorithm or null if it cannot be converted.
     */
    static convertToAlgorithm(alg: string, puzzle: PuzzleType): string | null {
        // Get each move letter (separated by a space).
        const moveArray: string[] = alg.trim().split(' ');

        const wrapperFunction = (move: string) => convertMoveToValidMove(move, puzzle)

        const validMovesArray: (string | undefined)[] = moveArray.map(wrapperFunction);

        // Checks that all elements are string, so that all moves were converted.
        // If one them wasn't, just return null.
        if (!validMovesArray.every(el => typeof el === "string")) return null;
        return validMovesArray.join(" ");
    }

    static isPuzzleType(str: string): str is PuzzleType {
        return ["2x2x2", "3x3x3", "4x4x4", "5x5x5", "6x6x6", "7x7x7", "pyraminx", "clock", "skewb", "sq1", "megaminx"].includes(str);
    }

    constructor(type: PuzzleType = "3x3x3", initialAlgorithm: string = "") {
        this.type = type;
        this._algorithm = initialAlgorithm.trim();
    }

    get algorithm(): string {
        return this._algorithm;
    }

    solve(): string | null {
        // The Kociemba algorithm is for 3x3 but a 2x2 is basically a 2x2 without the edges.
        // Solution will include extra moves (intended for the 3x3 edges) but in the end, it will be solved.
        if (this.type === "3x3x3" || this.type === "2x2x2") {
            return solve(this.algorithm, 'kociemba')
        }
        return null;
    }

    addMoves(moves: string)  {
        const convertedMoves: string | null = Puzzle.convertToAlgorithm(moves, this.type);
        if (convertedMoves) this._algorithm = `${this._algorithm} ${convertedMoves}`.trim();
    }

    private async _scramble(blinfolded: boolean = false, multiblindfolded: boolean = false, onehanded: boolean = false): Promise<string | string[] | null> {
        // Clock scrambles aren't implemented (yet?)
        if(this.type === "clock") return null;

        // Blindfolded and OH scrambles don't exist.
        if(blinfolded && onehanded) return null;
        if(multiblindfolded && onehanded) return null;

        if(this.type in Puzzle.puzzleTypeEquivalences) {
            // OH scrambles
            if(onehanded) {
                // Only for 3x3
                if(this.type === "3x3x3") {
                    try {
                        // 3x3x3 -> 333oh
                        const alg: Alg = await randomScrambleForEvent(Puzzle.puzzleTypeEquivalences[this.type] + "oh");
                        return alg.toString();
                    } catch(err) {
                        console.error(err);
                        return null;
                    }
                }
            }

            // If multiblindfolded is true, but blindfolded is false, multiblindfolded scramble will be generated anyway
            // Multiblindfolded scrambles
            if(multiblindfolded) {
                // Only for 3x3
                if(this.type === "3x3x3"){
                    // Multiblindfolded means 5 different scrambles.
                    try{
                        const algs: Alg[] = await Promise.all([
                        // 3x3x3 -> 333mb
                        randomScrambleForEvent(Puzzle.puzzleTypeEquivalences[this.type] + "mb"),
                        randomScrambleForEvent(Puzzle.puzzleTypeEquivalences[this.type] + "mb"),
                        randomScrambleForEvent(Puzzle.puzzleTypeEquivalences[this.type] + "mb"),
                        randomScrambleForEvent(Puzzle.puzzleTypeEquivalences[this.type] + "mb"),
                        randomScrambleForEvent(Puzzle.puzzleTypeEquivalences[this.type] + "mb"),
                        ]);

                        // Array with string representation of each algorithm
                        return algs.map(alg => alg.toString())
                    } catch(err) {
                        console.error(err);
                        return null;
                    }
                }
                return null;
            }

            // Blindfolded scrambles
            if(blinfolded) {
                // Only for 3x3x3, 4x4x4 and 5x5x5
                if(
                    this.type === "3x3x3" || this.type === "4x4x4" || this.type === "5x5x5"
                ) {
                    // 3x3x3 -> 333bf, 4x4x4 -> 444bf, ect.
                    try{
                        const alg: Alg = await randomScrambleForEvent(Puzzle.puzzleTypeEquivalences[this.type] + "bf");
                        return alg.toString();
                    } catch(err) {
                        console.error(err);
                        return null;
                    }
                }
                return null;
            }

            // Normal scrambles
            const alg:Alg = await randomScrambleForEvent(Puzzle.puzzleTypeEquivalences[this.type]);
            return alg.toString();
        }

        // Type doesn't have a scramble method.
        return null;
    }

    scramble(blindfolded: boolean, multiblindolded: boolean, onehanded: boolean): string[] | string | null {
        let scramble: string[] | string | null = null;
        this._scramble(blindfolded, multiblindolded, onehanded)
            .then(s => scramble = s)
            .catch(err => console.error(err));
        return scramble;
    }

    // This is the sketchy bit, normally, it should import the { TwistyPlayer }  and do everything
    // from there. But hey, it works, so let's not worry about it (for now).
    async getImages(size: number): Promise<string[]> {
        // This scripts contains a function that takes screenshots of the puzzle using a TwistyPlayer from cubing.js
        const script: string = fs.readFileSync(
            path.join(__dirname, '..', '..', 'public', 'js', 'generatePuzzleScreenshots.js'),
            'utf-8'
        );

        // Create a browser instance & load the script.
        const browser: Browser = await puppeteer.launch({
            headless: 'new',
            timeout: 90_000
        });

        const page: Page = await browser.newPage();

        // Execute the actual function.
        const results: unknown = await page.evaluate(
            // This is run in a browser context, thus we have to pass a lot of informations.
            (puzzleType: PuzzleType, algorithm: string, size: number, script: string) => {
                // Load the module into a <script type="module">text</script> tag.
                const tag: HTMLScriptElement = document.createElement('script');
                tag.type = "module";
                tag.text = script;

                document.body.appendChild(tag);

                // The script will execute and define the following on the window object:
                // - twisty: TwistyPlayer
                // - generateScreenshots(puzzleType: puzzleType, alg:string, size: number): string[]

                // See the script code @ '../../public/js/generatePublicScreenshot.js'

                // A promise that resolves with the result.
                return new Promise(resolve => {
                    // Check every 50ms if script has finished loading.
                    const intervalID = setInterval(end, 50);

                    function hasScriptHasLoaded() {
                        // If generateScreenshots and twisty are defined the script has loaded.
                        if ('generateScreenshots' in window && 'twisty' in window) return true;
                        return false;
                    }

                    // Function that ends and resolves the promise with the value if the script is loaded.
                    async function end() {
                        if (hasScriptHasLoaded()) {
                            // generateScreenshots is only defined withing the context of the window.
                            // @ts-expect-error
                            const result = await window.generateScreenshots(puzzleType, algorithm, size);
                            clearInterval(intervalID);
                            resolve(result);
                        }
                    }
                });
            }, this.type, this.algorithm, size, script);

        // Close the browser.
        browser.close();

        // Validating the results
        // Results is an array
        if (Array.isArray(results)) {
            // Elements of the array are strings
            if (results.every(e => typeof e === "string")) {
                return results;
            }
        }

        // In case of an invalid result: the empty array.
        return [];
    }
}