import path from 'path';
import fs, { Stats } from 'fs';
import { PathError } from '../structures/PathError';

/**
 * 
 * Read into a directory and all subdirectories and returns an array with
 * the valid JS/TS files' absolute paths.
 * 
 * @param folderPath - The absolute path of the directory.
 * @returns
 */

export function readFilePathsInDirectorySync(folderPath: string, fileExtension:string | string[]): string[] {
    if (!path.isAbsolute(folderPath)) throw new PathError(`Given path must be absolute`);

    let files: string[] = [];

    const list: string[] = fs.readdirSync(folderPath);

    for(const item of list) {
        const current:string = path.join(folderPath, item);
        const stat: Stats = fs.statSync(current);

        // If info regarding the current file/folder exists.
        if (stat) {

            if (stat.isDirectory()) {
                // The files paths are the exist ones and the ones in the directory
                // and subdirectories (read through recursive callings).
                files = files.concat(
                    readFilePathsInDirectorySync(current, fileExtension)
                );
            }

            if (!stat.isDirectory()) {
                // Depending on whether or not the file extension(s) is a single string or an array of strings.

                if(typeof fileExtension === "string") {
                    if (current.endsWith(fileExtension)) {
                        // Push the current file's absolute path
                        files.push(
                            path.resolve(current)
                        );
                    }
                }

                if(Array.isArray(fileExtension)) {
                    if(fileExtension.includes(path.extname(current))) {
                        // Push the current file's absolute path
                        files.push(
                            path.resolve(current)
                        )
                    }
                }
                
            }
        }
    }

    return files;
}


/**
 * 
 * Asynchronously reads into a directory and all subdirectories and returns an array with
 * the valid JS/TS files' absolute paths.
 * 
 * @param folderPath - The absolute path of the directory.
 * @returns
 */

export async function readFilePathsInDirectory(folderPath: string, fileExtension:string | string[]): Promise<string[]> {
    if (!path.isAbsolute(folderPath)) throw new PathError(`Given path must be absolute`);

    let files: string[] = [];

    fs.readdir(folderPath, (error, list) => {
        if(error) console.error(error);

        list.forEach(async current => {
            current = path.join(folderPath, current);
            const stat: Stats = fs.statSync(current);
    
            // If info regarding the current file/folder exists.
            if (stat) {
    
                if (stat.isDirectory()) {
                    // The files paths are the exist ones and the ones in the directory
                    // and subdirectories (read through recursive callings).

                    const filesInDirectory = await readFilePathsInDirectory(current, fileExtension);

                    files = files.concat(filesInDirectory);
                }
    
                if (!stat.isDirectory()) {
                    // Depending on whether or not the file extension(s) is a single string or an array of strings.
    
                    if(typeof fileExtension === "string") {
                        if (current.endsWith(fileExtension)) {
                            // Push the current file's absolute path
                            files.push(
                                path.resolve(current)
                            );
                        }
                    }
    
                    if(fileExtension instanceof Array) {
                        if(fileExtension.includes(path.extname(current))) {
                            // Push the current file's absolute path
                            files.push(
                                path.resolve(current)
                            )
                        }
                    }
                    
                }
            }
        })
    });
    return files;
}