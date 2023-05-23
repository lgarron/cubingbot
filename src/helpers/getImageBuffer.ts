import { Puzzle } from "../structures/Puzzle";
import { loadImage, createCanvas, Image, CanvasRenderingContext2D, Canvas } from 'canvas';

export async function getImageBuffer(puzzle: Puzzle, size: number): Promise<Buffer | null> {
    try {
        const base64Images: string[] = await puzzle.getImages(size);
        const imageBuffers: Buffer[] = [];

        if(base64Images.length === 0) return null;

        // Only 1 file can be sent per HTTP request, thus we have to put the 2 images in the same.
        for (const image of base64Images) {
            // Removes the data type suffix and creates a buffer.
            const base64: string = image.replace("data:image/png;base64,", "");
            const buffer: Buffer = Buffer.from(base64, 'base64');
            imageBuffers.push(buffer);
        }


        const images: Image[] = [];

        for(const buffer of imageBuffers) {
            const i: Image = await loadImage(buffer);
            images.push(i);
        }

        // Know that all images are squares of the same size.
        // Canvas width: amount of images times image width
        // Canvas height: image height
        // Now all images can be put next to each other.
        const canvas:Canvas = createCanvas(images[0].width * images.length, images[0].height);
        const ctx: CanvasRenderingContext2D = canvas.getContext('2d');

        let resultBuffer: Buffer | null = null;
    
        for(let i = 0; i < images.length; i++) {
            const currentImage:Image = images[i];

            // The x at which to put this image is its index times the first image width,
            // which is also the first image height and also the height/width of every single
            // image because they are all squres of the same size.

            // Say the width is 500
            // i=0 -> x:0
            // i=1 -> x:500
            // i=2 -> x:1000
            // That way, images are next to each others.
            const currentX:number = i*images[0].width;

            try{
                ctx.drawImage(currentImage, currentX, 0);
            } catch(err) {
                console.error(err);
                return null;
            }
        }

        resultBuffer = canvas.toBuffer('image/png');

        return resultBuffer;
    } catch (err) {
        console.log(err);
        return null;
    }
}