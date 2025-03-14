import * as vscode from 'vscode';

import * as path from 'path';
import { EOL } from 'os';

import CodeActionProvider from './codeActionProvider';
import { Logger } from './logging/log';
import CSharpFileCreator from './creator/cShaprFileCreator';
import Maybe from './common/maybe';
import { CommandMapping, createExtensionMappings } from './commandMapping';
import TemplateConfiguration from './template/templateConfiguration';
import CsprojReader from './project/csprojReader';
import GlobalUsingFinder from './project/globalUsings';
import { uniq } from 'lodash';
import { formatDocument, openFile } from './document/documentAction';
import { showMultiStepInputFilename } from './ui/createMultiStepInputFileName';

const EXTENSION_NAME = 'csharpextensions';

export function activate(context: vscode.ExtensionContext): void {
    Logger.init();
    Logger.debug('Activating extension');
    const extension = Extension.GetInstance();

    Extension.GetKnonwCommands().forEach((mapping, key) => {
        context.subscriptions.push(
            vscode.commands.registerCommand(
                `${EXTENSION_NAME}.${mapping.command}`,
                async (options: RegisterCommandCallbackArgument) => await extension.startExecutor(options, key, mapping)
            )
        );
    });

    const documentSelector: vscode.DocumentSelector = {
        language: 'csharp',
        scheme: 'file'
    };
    const codeActionProvider = new CodeActionProvider();
    const disposable = vscode.languages.registerCodeActionsProvider(documentSelector, codeActionProvider);

    context.subscriptions.push(disposable);
}

export function deactivate(): void {
    Logger.debug('Deactivating extension');
}

export class Extension {
    private constructor() { /**/ }

    private _getIncomingPath(options: RegisterCommandCallbackArgument): Maybe<string> {
        if (options) {
            return Maybe.some<string>(options._fsPath || options.fsPath || options.path);
        }

        if (vscode.window.activeTextEditor && !vscode.window.activeTextEditor?.document.isUntitled) {
            return Maybe.some<string>(path.dirname(vscode.window.activeTextEditor?.document.fileName));
        }

        return Maybe.none<string>();
    }

    public async startExecutor(options: RegisterCommandCallbackArgument, hintName: string, mapping: CommandMapping): Promise<void> {
        Logger.debug('Extension starting executor');
        const extension = Extension.GetCurrentVscodeExtension();

        if (!extension) {
            vscode.window.showErrorMessage('Weird, but the extension you are currently using could not be found');

            return;
        }

        if (!vscode.workspace.workspaceFolders || vscode.workspace.workspaceFolders.length === 0) {
            vscode.window.showErrorMessage('Weird, no workspace folders avalaible');

            return;
        }

        const rootProjectPath = vscode.workspace.workspaceFolders[0].uri.fsPath;

        const maybeIncomingPath = this._getIncomingPath(options);

        const destinationPath: string | undefined = maybeIncomingPath.isNone() ? undefined : maybeIncomingPath.value().replace(rootProjectPath, '');

        const inputResult = await showMultiStepInputFilename({
            title: `New ${hintName}`,
            inputValue: `New${hintName}`,
            filePath: destinationPath,
            rootPath: rootProjectPath
        } as MultiStepInputFilenameParameters);

        // filename hasn't been typed due to escape action
        if (!inputResult.name) {
            return;
        }

        const incomingPath = inputResult.path ?? rootProjectPath;
        // filepath hasn't been typed due to escape action
        if (!inputResult.path || inputResult.path === rootProjectPath) {
            Logger.warn(`The file path hasn't been typed, the file will be created in ${rootProjectPath}`);
        }

        let newFilename = inputResult.name;

        if (newFilename.endsWith('.cs')) newFilename = newFilename.substring(0, newFilename.length - 3);
        const configuration = vscode.workspace.getConfiguration();

        let customTemplate: CustomTemplate | undefined = undefined;

        if (mapping.command === 'createFromTemplate') {
            const customTemplates = configuration.get<CustomTemplateConfig | undefined>(`${EXTENSION_NAME}.templates`, undefined);
            if (customTemplates === undefined || !customTemplates.items.length) {
                vscode.window.showInformationMessage('You haven\'t define any custom templates yet.');

                return;
            }

            const { items } = customTemplates;
            const selectedTemplate = await vscode.window.showQuickPick(items.map((i, index) => `${index}-${i.name}-${i.description}`), {
                canPickMany: false,
            });
            if (!selectedTemplate) {
                return;
            }

            customTemplate = customTemplates.items[parseInt(selectedTemplate.split('-')[0])];
        }

        if (!customTemplate && mapping.command === 'createFromTemplate') {
            vscode.window.showErrorMessage('An error might be occurred during the custom template selection');

            return;
        }

        const templatesPath = path.join(extension.extensionPath, Extension.TemplatesPath);
        const pathWithoutExtension = `${incomingPath}${path.sep}${newFilename}`;

        const { templates } = mapping;
        const eol = configuration.get('file.eol', EOL);
        const usingsInclude = configuration.get(`${EXTENSION_NAME}.usings.include`, true);
        const usingsImplicit = configuration.get(`${EXTENSION_NAME}.usings.implicit`, true);
        const tabSize = configuration.get('editor.tabSize', 4);
        const useSpaces = configuration.get('editor.useSpaces', true);
        const useFileScopedNamespace = configuration.get<boolean>(`${EXTENSION_NAME}.useFileScopedNamespace`, false);
        const csprojReader = await CsprojReader.createFromPath(`${pathWithoutExtension}.cs`);
        const isTargetFrameworkAboveEqualNet6 = await csprojReader?.isTargetFrameworkHigherThanOrEqualToDotNet6() === true;
        let globalUsings: string[] = [];
        let useImplicitUsings = false;
        if (csprojReader && isTargetFrameworkAboveEqualNet6) {
            const frameworkVersion = (await csprojReader.getTargetFramework()) as string;
            const globalUsingsResult = await GlobalUsingFinder.find(csprojReader.getFilePath(), frameworkVersion);
            if (globalUsingsResult.isOk()) {
                globalUsings = globalUsingsResult.value();
            }

            useImplicitUsings = usingsImplicit && await csprojReader.useImplicitUsings() === true;

            const namespaceInclude = await csprojReader.getUsingsInclude();
            const namespaceRemove = await csprojReader.getUsingsRemove();
            globalUsings.push(...namespaceInclude);
            globalUsings = uniq(globalUsings).filter(gu => !namespaceRemove.includes(gu));
        }

        const createdFilesResult = await Promise.all(templates.map(async template => {
            return TemplateConfiguration.create(
                template,
                eol,
                usingsInclude,
                useFileScopedNamespace,
                isTargetFrameworkAboveEqualNet6,
                useImplicitUsings,
                globalUsings,
                customTemplate,
                tabSize,
                useSpaces,
            )
                .AndThen(config => CSharpFileCreator.create(config)
                    .AndThen(async creator => await creator.create(templatesPath, pathWithoutExtension, newFilename)));
        }));

        if (createdFilesResult.some(result => result.isErr())) {
            const error = createdFilesResult.filter(result => result.isErr())
                .map(result => result.info()).filter(info => !!info)
                .join(EOL);

            Logger.error(error);
            vscode.window.showErrorMessage(error);

            return;
        }

        const files = createdFilesResult.map(result => result.value()).sort((cf1, cf2) => {
            const weight1 = cf1.filePath.endsWith('.cs') ? 0 : 1;
            const weight2 = cf2.filePath.endsWith('.cs') ? 0 : 1;

            return weight2 - weight1;
        });
        await Promise.all(files.map(async createdFile => {
            let cursorPosition = undefined;
            if (createdFile.cursorPositionArray) {
                cursorPosition = new vscode.Position(createdFile.cursorPositionArray[0], createdFile.cursorPositionArray[1]);
            }

            try {
                const uri = await openFile(createdFile.filePath, cursorPosition);
                await formatDocument(uri);
            } catch (err) {
                Logger.error(`Error trying to open the file path ${createdFile.filePath}: ${err}`);
            }
        }));
    }

    private static TemplatesPath = 'templates';
    private static KnownCommands: Map<string, CommandMapping>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static CurrentVscodeExtension: vscode.Extension<any> | undefined = undefined;
    private static Instance: Extension;
    private static KnownExtensionNames = [
        'bard83.csharpextension',
        'kreativ-software.csharpextensions',
        'jsw.csharpextensions'
    ];

    public static GetInstance(): Extension {
        if (!this.Instance) {
            this.Instance = new Extension();
        }

        return this.Instance;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private static GetCurrentVscodeExtension(): vscode.Extension<any> | undefined {
        if (!this.CurrentVscodeExtension) {
            for (let i = 0; i < this.KnownExtensionNames.length; i++) {
                const extension = vscode.extensions.getExtension(this.KnownExtensionNames[i]);

                if (extension) {
                    this.CurrentVscodeExtension = extension;

                    break;
                }
            }
        }

        return this.CurrentVscodeExtension;
    }

    static GetKnonwCommands(): Map<string, CommandMapping> {
        if (this.KnownCommands) {
            return this.KnownCommands;
        }

        this.KnownCommands = createExtensionMappings();

        return this.KnownCommands;
    }
}
