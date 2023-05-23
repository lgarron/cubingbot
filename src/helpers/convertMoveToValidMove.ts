import { Puzzle, PuzzleType } from "../structures/Puzzle";

/**
 * 
 * Converts a move to a valid move notation. Exemple: M on a 4x4 -> 2L 2R'
 * Will return undefined if the move is invalid.
 * 
 * @param move 
 * @param puzzle 
 * @returns 
 */
export function convertMoveToValidMove(move: string, puzzle: PuzzleType): string | undefined {
    // For cubes & megaminx, a move with 2' is the same as a move with just 2.
    if (
        (Puzzle.isCubic(puzzle) || puzzle === "megaminx") 
        && move.includes("2'")
    ) move = move.replace("2'", "2");

    if(puzzle === "square1") {
        if(Puzzle.allPossibleSquare1Moves.includes(move)) return move;
        return undefined;
    }

    if(puzzle === "clock") return undefined;

    if(puzzle === "megaminx") {
        if(Puzzle.allPossibleMegaminxMoves.includes(move)) return move;
        return undefined;
    }

    if (puzzle === "skewb") {
        if (Puzzle.allPossibleSkewbMoves.includes(move)) return move;
        return undefined;
    }

    if (puzzle === "pyraminx") {
        if (Puzzle.allPossiblePyraminxMoves.includes(move)) return move;
        return undefined;
    }

    if (puzzle === "2x2x2") {
        if (Puzzle.allPossible2x2Moves.includes(move)) return move;
        return undefined;
    }

    if (puzzle === "3x3x3") {
        if (Puzzle.allPossible3x3Moves.includes(move)) return move;
        // These slice moves moves the 2 slices on the sides.
        if (
            move === "m" || move === "m'" || move === "m2"
        ) {
            if (move === "m") return "L R'";
            if (move === "m'") return "L' R";
            if (move === "m2") return "L2 R2";
        }

        if (
            move === "e" || move === "e'" || move === "e2"
        ) {
            if (move === "e") return "U' D";
            if (move === "e'") return "U D'";
            if (move === "e2") return "U2 D2";
        }

        if (
            move === "s" || move === "s'" || move === "s2"
        ) {
            if (move === "s") return "F B'";
            if (move === "s'") return "F' B";
            if (move === "s2") return "F2 B2";
        }

        return undefined;
    }

    if (puzzle === "4x4x4") {
        if (Puzzle.allPossible4x4Moves.includes(move)) return move;
        // These moves involves several inner slices on bigger cubes.
        if (
            move === "M" || move === "M'" || move === "M2"
        ) {
            if (move === "M") return "2L 3L";
            if (move === "M'") return "2L' 2L'";
            if (move === "M2") return "2L2 3L2";
        }

        if (
            move === "S" || move === "S'" || move === "S2"
        ) {
            if (move === "S") return "2F 3F";
            if (move === "S'") return "2F' 3F'";
            if (move === "S2") return "2F2 3F2";
        }

        if (
            move === "E" || move === "E'" || move === "E2"
        ) {
            if (move === "E") return "2D 3D";
            if (move === "E'") return "2D' 3D'";
            if (move === "E2") return "2D2 3D2";
        }
        return undefined;
    }

    // Same logic is followed for bigger cubes.
    if (puzzle === "5x5x5") {
        if (Puzzle.allPossible5x5Moves.includes(move)) return move;
        // Odd cube logic.
        if (
            move === "m" || move === "m'" || move === "m2"
        ) {
            // 3rd layer is middle one on 5x5x5. It's the 2nd one on 3x3x3 and 4th one on 7x7x7 and so on.
            if (move === "m") return "3L";
            if (move === "m'") return "3L'";
            if (move === "m2") return "3L2";
        }

        if (
            move === "s" || move === "s'" || move === "s"
        ) {
            if (move === "s") return "3F";
            if (move === "s'") return "3F'";
            if (move === "s2") return "3F2";
        }

        if (
            move === "e" || move === "e'" || move === "e"
        ) {
            if (move === "e") return "3D";
            if (move === "e'") return "3D'";
            if (move === "e2") return "3D2";
        }

        // Logic for all cubes (odd and even).
        if (
            move === "M" || move === "M'" || move === "M2"
        ) {
            if (move === "M") return "2L 3L 4L";
            if (move === "M'") return "2L' 2L' 4L'";
            if (move === "M2") return "2L2 3L2 4L2";
        }

        if (
            move === "S" || move === "S'" || move === "S2"
        ) {
            if (move === "S") return "2F 3F 4F";
            if (move === "S'") return "2F' 3F' 4F'";
            if (move === "S2") return "2F2 3F2 4F2";
        }

        if (
            move === "E" || move === "E'" || move === "E2"
        ) {
            if (move === "E") return "2D 3D 4D";
            if (move === "E'") return "2D' 3D' 4D'";
            if (move === "E2") return "2D2 3D2 4D2";
        }
        return undefined;
    }

    if (puzzle === "6x6x6") {
        if (Puzzle.allPossible6x6Moves.includes(move)) return move;
        if (move === "M" || move === "M'" || move === "M2") {
            if (move === "M") return "2L 3L 4L 5L";
            if (move === "M'") return "2L' 2L' 4L' 5L'";
            if (move === "M2") return "2L2 3L2 4L2 5L2";
        }

        if (move === "S" || move === "S'" || move === "S2") {
            if (move === "S") return "2F 3F 4F 5F";
            if (move === "S'") return "2F' 3F' 4F' 5F'";
            if (move === "S2") return "2F2 3F2 4F2 5F2";
        }

        if (move === "E" || move === "E'" || move === "E2") {
            if (move === "E") return "2D 3D 4D 5D";
            if (move === "E'") return "2D' 3D' 4D' 5D'";
            if (move === "E2") return "2D2 3D2 4D2 5D2";
        }
        return undefined;
    }

    if (puzzle === "7x7x7") {
        if (Puzzle.allPossible7x7Moves.includes(move)) return move;
        // Odd cube logic
        if (move === "m" || move === "m'" || move === "m2") {
            if (move === "m") return "4L";
            if (move === "m'") return "4L'";
            if (move === "m2") return "4L2";
        }

        if (move === "s" || move === "s'" || move === "s2") {
            if (move === "s") return "4F";
            if (move === "s'") return "4F'";
            if (move === "s2") return "4F2";
        }

        if (move === "e" || move === "e'" || move === "e2") {
            if (move === "e") return "4D";
            if (move === "e'") return "4D'";
            if (move === "e2") return "4D2";
        }

        // Logic for all cubes (odd and even)
        if (move === "M" || move === "M'" || move === "M2") {
            if (move === "M") return "2L 3L 4L 5L 6L";
            if (move === "M'") return "2L' 2L' 4L' 5L' 6L'";
            if (move === "M2") return "2L2 3L2 4L2 5L2 6L2";
        }

        if (move === "S" || move === "S'" || move === "S2") {
            if (move === "S") return "2F 3F 4F 5F 6F";
            if (move === "S'") return "2F' 3F' 4F' 5F' 6F'";
            if (move === "S2") return "2F2 3F2 4F2 5F2 6F2";
        }

        if (move === "E" || move === "E'" || move === "E2") {
            if (move === "E") return "2D 3D 4D 5D 6D";
            if (move === "E'") return "2D' 3D' 4D' 5D' 6D'";
            if (move === "E2") return "2D2 3D2 4D2 5D2 6D2";
        }
        return undefined;
    }

    return undefined;
}