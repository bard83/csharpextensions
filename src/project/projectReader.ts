import { promises as fs } from 'fs';
import * as path from 'path';

export default abstract class ProjectReader {
    protected readonly filePath: string;

    /**
     * Create a new project reader
     *
     * @param filePath The path to the project file
     */
    constructor(filePath: string) {
        this.filePath = filePath; //TODO: Check if exists
    }

    /**
     * Retrieve the set file path for this project reader
     *
     * @returns The set file path for this project reader
     */
    public getFilePath(): string {
        return this.filePath;
    }

    /**
     * Finds and returns the first RootNamespace of this project file
     *
     * @returns The first found RootNamespace of this project file, or undefined
     */
    public abstract getRootNamespace(): Promise<string | undefined>;

    /**
     * Tries to create a new project reader from the given path, searched upwards, with the given file patterns to match
     *
     * @param this The class on which this function is executed, from which a new instance should be created
     * @param findFromPath The path from where to start looking for a project file
     * @param filePatterns The file patterns to match with
     * @returns A new project reader if a file is found, or undefined
     */
    protected static async createProjectFromPath<T extends ProjectReader>(
        this: new (filePath: string) => T,
        findFromPath: string,
        ...filePatterns: Array<string>
    ): Promise<T | undefined> {
        const projectPath = await ProjectReader.findProjectPath(findFromPath, ...filePatterns);

        return projectPath ? new this(projectPath) : undefined;
    }

    /**
     * Finds the nearest path for a project file upwards from the given 'fromPath'
     *
     * @param fromPath The path from where to start looking for a project file
     * @param filePatterns The file patterns to search with
     * @returns The found path, or undefined
     */
    public static async findProjectPath(fromPath: string, ...filePatterns: Array<string>): Promise<string | undefined> {
        if (!filePatterns?.length) return;

        const filePattern = filePatterns[0];
        const projectPath = await ProjectReader.findUp(path.dirname(fromPath), filePattern);

        if (projectPath) return projectPath;

        return await this.findProjectPath(fromPath, ...filePatterns.splice(1));
    }

    /**
     * Walks up from 'dir' to the filesystem root, returning the first entry matching 'filePattern'
     *
     * @param dir The directory from where to start looking
     * @param filePattern An exact file name, or '*' followed by a suffix (e.g. '*.csproj')
     * @returns The found path, or undefined
     */
    private static async findUp(dir: string, filePattern: string): Promise<string | undefined> {
        // ponytail: only literal names and '*suffix' patterns, the only ones callers use; add minimatch if real globs are needed
        const matches = filePattern.startsWith('*')
            ? (name: string) => !name.startsWith('.') && name.endsWith(filePattern.slice(1))
            : (name: string) => name === filePattern;

        for (let current = path.resolve(dir); ; current = path.dirname(current)) {
            const found = (await fs.readdir(current)).find(matches);

            if (found) return path.join(current, found);
            if (path.dirname(current) === current) return;
        }
    }
}
