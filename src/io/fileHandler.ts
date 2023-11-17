import { promises as fs } from 'fs';
import * as path from 'path';
import * as findupglob from 'find-up-glob';

import { ExtensionError } from '../errors/extensionError';

export default class FileHandler {
    public static async write(filePath: string, fileContent: string) {
        if (!filePath) {
            throw new ExtensionError('filePath cannot be null or empty');
        }

        try {
            await fs.writeFile(filePath, fileContent);
        } catch (errWritingFile) {
            throw new ExtensionError(`Error trying to write to '${filePath}'`, errWritingFile);
        }
    }

    public static async read(filePath: string): Promise<string> {
        if (!filePath) {
            throw new ExtensionError('filePath cannot be null or empty');
        }

        try {
            return await fs.readFile(filePath, 'utf-8');
        } catch (errReading) {
            throw new ExtensionError(`Could not read content file from '${filePath}'`, errReading);
        }
    }

    public static async fileExists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);

            return true;
        } catch { }

        return false;
    }

    public static async readDirectory(path: string): Promise<string[]> {
        return await fs.readdir(path);
    }

    public static async findFilePath(fromPath: string, glob: string): Promise<string[] | null> {

        return await findupglob( glob, { cwd: path.dirname(fromPath) });
    }
}
