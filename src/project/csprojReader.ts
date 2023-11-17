import * as path from 'path';
import { Parser } from 'xml2js';
import { log } from '../logging/log';

import { Csproj, PropertyGroup, Using } from './csproj';
import ProjectReader from './projectReader';
import FileHandler from '../io/fileHandler';


export default class CsprojReader extends ProjectReader {
    private readonly xmlParser: Parser;

    /**
     * Initializes a new instance for a .csproj-file
     *
     * @param filePath - The path to the .csproj-file
     */
    constructor(filePath: string) {
        super(filePath);
        //TODO: Check if csproj
        this.xmlParser = new Parser();
    }

    /**
     * @inheritdoc
     */
    public async getRootNamespace(): Promise<string | undefined> {
        try {
            const propertyGroups = await this.getPropertyGroups();
            const propertyGroupWithRootNamespace = propertyGroups?.find(p => p.RootNamespace);

            if (!propertyGroupWithRootNamespace?.RootNamespace) return;

            return propertyGroupWithRootNamespace.RootNamespace[0];
        } catch (errParsingXml) {
            log('Error parsing project xml', errParsingXml);
        }

        return;
    }

    /**
     * Finds and returns the first TargetFramework of this project file
     *
     * @returns The first found TargetFramework of this project file, or undefined
     */
    public async getTargetFramework(): Promise<string | undefined> {
        try {
            const propertyGroups = await this.getPropertyGroups();
            const propertyGroupWithTargetFramework = propertyGroups?.find(p => p.TargetFramework);

            if (!propertyGroupWithTargetFramework?.TargetFramework) return;

            return propertyGroupWithTargetFramework.TargetFramework[0];
        } catch (errParsingXml) {
            log('Error parsing project xml', errParsingXml);
        }

        return;
    }

    /**
     * If the target framework for this .csproj is >= .net6.0
     *
     * @returns If the target framework for this .csproj is >= .net6.0, undefined if no target framework is found
     */
    public async isTargetFrameworkHigherThanOrEqualToDotNet6(): Promise<boolean | undefined> {
        const targetFramework = await this.getTargetFramework();

        if (!targetFramework) return; // No target framework found

        const versionMatch = targetFramework.match(/(?<=net)\d+(\.\d+)*/i); // Match .NET version string like "net6.0"

        if (!versionMatch?.length || Number.isNaN(versionMatch[0])) return false;

        return Number(versionMatch[0]) >= 6;
    }

    /**
     * Whether the 'ImplicitUsings' option is set to `enable`
     *
     * @returns If the 'ImplicitUsings' option is set to `enable`
     */
    public async useImplicitUsings(): Promise<boolean> {
        let propertyGroups: PropertyGroup[] | undefined;
        let propertyGroupWithImplicitUsings: PropertyGroup | undefined;

        try {
            propertyGroups = await this.getPropertyGroups();
            propertyGroupWithImplicitUsings = propertyGroups?.find(p => p.ImplicitUsings);
        } catch (errParsingXml) {
            console.error('Error parsing project xml', errParsingXml);

            return false;
        }

        if (!propertyGroupWithImplicitUsings?.ImplicitUsings) return false;

        return propertyGroupWithImplicitUsings.ImplicitUsings[0] === 'enable';
    }

    /**
     * Retrieve the content of this project file
     *
     * @returns The content of this project file
     */
    protected async getContent(filePath?: string): Promise<string> {
        return await FileHandler.read(filePath ?? this.filePath);
    }

    /**
     * Retrieves and parses the content of this project file
     *
     * @returns The parsed xml content of this project file
     */
    protected async getXmlContent(filePath?: string): Promise<Csproj> {
        const content = await this.getContent(filePath);

        return await this.xmlParser.parseStringPromise(content);
    }

    /**
     * Retrieves the property groups of this project file
     *
     * @returns The property groups of this project file
     */
    protected async getPropertyGroups(): Promise<PropertyGroup[] | undefined> {
        const xmlContent = await this.getXmlContent();

        if (xmlContent?.Project?.PropertyGroup) {
            return xmlContent?.Project?.PropertyGroup;
        }

        const importProject = xmlContent?.Project?.Import;
        if (!importProject || importProject.length === 0) {
            return undefined;
        }

        const cleanPath = importProject[0].$.Project.replace('\\', path.sep).replace('/', path.sep);
        const projectPath = path.resolve(path.dirname(this.filePath), cleanPath);
        const importXmlContent = await this.getXmlContent(projectPath);

        return importXmlContent?.Project?.PropertyGroup;
    }

    /**
     * Retrieves the usings include of this project file
     *
     * @returns the list of namespace to be include
     */
    public async getUsingsInclude(): Promise<string[]> {
        const usings = await this.getUsings();

        return usings.filter(u => u.$ !== undefined && u.$.Include !== undefined).map(u => u.$?.Include as string);
    }

    /**
     * Retrieves the usings remove of this project file
     *
     * @returns the list of namespace to not be include
     */
    public async getUsingsRemove(): Promise<string[]> {
        const usings = await this.getUsings();

        return usings.filter(u => u.$ !== undefined && u.$.Remove !== undefined).map(u => u.$?.Remove as string);
    }

    /**
     * Tries to create a new csproj reader from the given path, searched upwards
     *
     * @param findFromPath The path from where to start looking for a .csproj-file
     * @returns A new .csproj-reader if a file is found, or undefined
     */
    public static async createFromPath(findFromPath: string): Promise<CsprojReader | undefined> {
        return await this.createProjectFromPath(findFromPath, '*.csproj');
    }

    private async getUsings(): Promise<Using[]> {
        const xmlContent = await this.getXmlContent();
        if (!xmlContent?.Project?.ItemGroup) {
            return [];
        }

        const itemGroups = xmlContent.Project.ItemGroup.filter(g => g.Using !== undefined);

        const usings: Using[] = [];
        itemGroups.forEach(g => {
            if (!g.Using) {
                return;
            }

            usings.push(...g.Using);
        });

        return usings;
    }
}
