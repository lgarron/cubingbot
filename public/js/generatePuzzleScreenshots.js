import { TwistyPlayer } from "https://cdn.cubing.net/js/cubing/twisty";

async function generatePuzzleScreenshots(twistyPlayer, puzzleType, alg, size) {
    const width = size, height = size;

    if (
        puzzleType === "2x2x2" ||
        puzzleType === "3x3x3" ||
        puzzleType === "4x4x4" ||
        puzzleType === "5x5x5" ||
        puzzleType === "6x6x6" ||
        puzzleType === "7x7x7" ||
        puzzleType === "pyraminx" ||
        puzzleType === "skewb"
    ) {
        const playerOne = new twistyPlayer({
            puzzle: puzzleType,
            alg: alg,
            hintFacelets: "none",
            backView: "side-by-side",
            background: "none",
            hintFacelets: "floating",
            cameraDistance: 7,
            cameraLatitude: 90,
            cameraLongitude: -30,
        });

        document.body.appendChild(playerOne);

        const firstScreenshot = await playerOne.experimentalScreenshot({
            width: width,
            height: height,
        });

        // To see the entire puzzle, 2 screenshots are needed.
        // A second player from another angle:
        const playerTwo = new twistyPlayer({
            puzzle: puzzleType,
            alg: alg,
            hintFacelets: "none",
            backView: "side-by-side",
            background: "none",
            hintFacelets: "floating",
            cameraLatitude: -90,
            cameraLongitude: 120,
            cameraDistance: 7
        });

        document.body.appendChild(playerTwo);

        const secondScreenshot = await playerTwo.experimentalScreenshot({
            width: width,
            height: height
        });

        // Remove the players, they are useless now.
        document.body.removeChild(playerOne);
        document.body.removeChild(playerTwo);

        return [firstScreenshot, secondScreenshot];
    }

    if (
        puzzleType === "megaminx"
    ) {
        const playerOne = new twistyPlayer({
            puzzle: puzzleType,
            alg: alg,
            hintFacelets: "none",
            backView: "side-by-side",
            background: "none",
            cameraDistance: 7,
            cameraLatitude: -40,
            cameraLongitude: -140,
        });

        document.body.appendChild(playerOne);

        const firstScreenshot = await playerOne.experimentalScreenshot({
            width: width,
            height: height,
        });

        // To see the entire puzzle, 3 screenshots are needed.
        // A second player from another angle:
        const playerTwo = new twistyPlayer({
            puzzle: puzzleType,
            alg: alg,
            hintFacelets: "none",
            backView: "side-by-side",
            background: "none",
            cameraLatitude: 40,
            cameraLongitude: 140,
            cameraDistance: 7
        });

        document.body.appendChild(playerTwo);

        const secondScreenshot = await playerTwo.experimentalScreenshot({
            width: width,
            height: height
        });

        //

        const playerThree = new twistyPlayer({
            puzzle: puzzleType,
            alg: alg,
            hintFacelets: "none",
            backView: "side-by-side",
            background: "none",
            cameraLatitude: -40,
            cameraLongitude: 140,
            cameraDistance: 7
        });

        document.body.appendChild(playerThree);

        const thirdScreenshot = await playerThree.experimentalScreenshot({
            width: width,
            height: height
        });

        //

        const playerFour = new twistyPlayer({
            puzzle: puzzleType,
            alg: alg,
            hintFacelets: "none",
            backView: "side-by-side",
            background: "none",
            cameraLatitude: 40,
            cameraLongitude: -140,
            cameraDistance: 7
        });

        document.body.appendChild(playerFour);

        const fourthScreenshot = await playerFour.experimentalScreenshot({
            width: width,
            height: height
        });


        // Remove the players, they are useless now.
        document.body.removeChild(playerOne);
        document.body.removeChild(playerTwo);
        document.body.removeChild(playerThree);
        document.body.removeChild(playerFour);

        return [firstScreenshot, secondScreenshot, thirdScreenshot, fourthScreenshot];
    }
}

window.twisty = TwistyPlayer;
window.generateScreenshots = async function (puzzleType, alg, size) {
    return await generatePuzzleScreenshots(window.twisty, puzzleType, alg, size);
}