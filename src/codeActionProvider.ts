import {
    commands,
    window,
    workspace,
    CodeAction,
    CodeActionKind,
    Position,
    Range,
    TextDocument,
    TextEdit,
    Uri,
    WorkspaceEdit,
    CodeActionProvider as VSCodeCodeActionProvider,
    TextEditor,
    CodeActionTriggerKind,
    CodeActionContext,
    Selection,
} from 'vscode';
import * as os from 'os';
import { getEolSetting, log } from './util';
import Result from './common/result';
import { formatDocument } from './document/documentAction';

const EMPTY = '';
const SPACE = ' ';

export default class CodeActionProvider implements VSCodeCodeActionProvider {
    private _commandIds = {
        ctorFromProperties: 'csharpextensions.ctorFromProperties',
        bodyExpressionCtorFromProperties: 'csharpextensions.bodyExpressionCtorFromProperties',
    };

    private static readonly ReadonlyRegex = new RegExp(/(public|private|protected)\s(\w+)\s(\w+)\s?{\s?(get;)\s?(private\s)?(set;)?\s?}/g);
    private static readonly ClassRegex = new RegExp(/(private|internal|public|protected)\s?(static)?\sclass\s(\w*)/g);

    constructor() {
        commands.registerCommand(this._commandIds.ctorFromProperties, this.executeCtorFromProperties, this);
        commands.registerCommand(this._commandIds.bodyExpressionCtorFromProperties, this.executeBodyExpressionCtorFromProperties, this);
    }

    public provideCodeActions(document: TextDocument, range: Range | Selection, context: CodeActionContext): CodeAction[] {
        if (context.triggerKind !== CodeActionTriggerKind.Invoke) {
            return new Array<CodeAction>();
        }

        const codeActions = new Array<CodeAction>();
        const resultEditor = this._getActiveTextEditor();

        if (resultEditor.isErr()) {
            console.error(resultEditor.info());

            return codeActions;
        }

        const editor = resultEditor.value();
        const ctorActionResult = this._buildCtorActions(document, editor, 'Initialize ctor from properties...', this._commandIds.ctorFromProperties);
        if (ctorActionResult.isOk()) {
            codeActions.push(ctorActionResult.value());
        }

        const bodyExpressionCtorAction = this._buildCtorActions(document, editor, 'Initialize body expression ctor from properties...', this._commandIds.bodyExpressionCtorFromProperties);
        if (bodyExpressionCtorAction.isOk()) {
            codeActions.push(bodyExpressionCtorAction.value());
        }

        return codeActions;
    }

    private _getActiveTextEditor(): Result<TextEditor> {
        const editor = window.activeTextEditor;

        if (!editor) {
            return Result.error<TextEditor>('NotFoundError', 'There\'s no active editor');
        }

        return Result.ok<TextEditor>(editor);
    }

    private camelize(str: string) {
        return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
            if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces

            return index === 0 ? match.toLowerCase() : match.toUpperCase();
        });
    }

    private async executeCtorFromProperties(args: ConstructorFromPropertiesArgument) {
        const configuration = workspace.getConfiguration();
        const eol = getEolSetting(configuration.get('file.eol', os.EOL));
        const tabSize = configuration.get('editor.tabSize', 4);
        const ctorParams = new Array<string>();
        const indentationLevel = args.isFileScopedNamespace ? 1 : 2;

        if (!args.properties)
            return;

        args.properties.forEach((p) => {
            ctorParams.push(`${p.type} ${this.camelize(p.name)}`);
        });

        const assignments = args.properties
            .map(prop => `${this._getIndentation(tabSize, (indentationLevel + 1))}this.${prop.name} = ${this.camelize(prop.name)};${eol}`);

        const { modifier, className } = args.classDefinition;

        const firstPropertyLine = args.properties.sort((a, b) => a.lineNumber - b.lineNumber)[0].lineNumber;
        const constructorIndentation = this._getIndentation(tabSize, (indentationLevel));
        const ctorStatement = `${constructorIndentation}${modifier} ${className}(${ctorParams.join(', ')})${eol}${constructorIndentation}{${eol}${assignments.join('')}${constructorIndentation}}${eol}${eol}`;

        const edit = new WorkspaceEdit();
        const edits = new Array<TextEdit>();

        const pos = new Position(firstPropertyLine, 0);
        const range = new Range(pos, pos);
        const ctorEdit = new TextEdit(range, ctorStatement);

        edits.push(ctorEdit);
        edit.set(args.document.uri, edits);

        await workspace.applyEdit(edit);

        const reFormatAfterChange = configuration.get('csharpextensions.reFormatAfterChange', true);
        if (reFormatAfterChange) {
            await this.formatDocument(args.document.uri);
        }
    }

    private async executeBodyExpressionCtorFromProperties(args: ConstructorFromPropertiesArgument) {
        const configuration = workspace.getConfiguration();
        const eol = getEolSetting(configuration.get('file.eol', os.EOL));
        const tabSize = configuration.get('editor.tabSize', 4);
        const ctorParams = new Array<string>();
        const indentationLevel = args.isFileScopedNamespace ? 1 : 2;

        if (!args.properties)
            return;

        args.properties.forEach((p) => {
            ctorParams.push(`${p.type} ${this.camelize(p.name)}`);
        });

        const tupleLeft = args.properties
            .map(prop => `this.${prop.name}`).join(' , ');
        const tupleRight = args.properties
            .map(prop => `${this.camelize(prop.name)}`).join(' , ');
        const assignment = args.properties.length === 1 ? `${tupleLeft} = ${tupleRight}` : `(${tupleLeft}) = (${tupleRight})`;

        const { modifier, className } = args.classDefinition;

        const firstPropertyLine = args.properties.sort((a, b) => a.lineNumber - b.lineNumber)[0].lineNumber;
        const constructorIndentation = this._getIndentation(tabSize, (indentationLevel));
        const ctorStatement = `${constructorIndentation}${modifier} ${className}(${ctorParams.join(', ')})${eol}${this._getIndentation(tabSize, (indentationLevel + 1))}=> ${assignment};${eol}${eol}`;

        const edit = new WorkspaceEdit();
        const edits = new Array<TextEdit>();

        const pos = new Position(firstPropertyLine, 0);
        const range = new Range(pos, pos);
        const ctorEdit = new TextEdit(range, ctorStatement);

        edits.push(ctorEdit);
        edit.set(args.document.uri, edits);

        await workspace.applyEdit(edit);

        const reFormatAfterChange = configuration.get('csharpextensions.reFormatAfterChange', true);
        if (reFormatAfterChange) {
            await this.formatDocument(args.document.uri);
        }
    }

    private _getIndentation(tabSize: number, indentation: number): string {
        return EMPTY.padStart((tabSize * indentation), SPACE);
    }

    private async formatDocument(documentUri: Uri) {
        try {
            await formatDocument(documentUri);
        } catch (err) {
            log('Error trying to format document - ', err);
        }
    }

    private _buildCtorActions(document: TextDocument, editor: TextEditor, actionTitle: string, command: string): Result<CodeAction> {
        return this._findCtorDefinitionAndProperties(document, editor)
            .AndThenSync(classDefinition => {
                const parameter: ConstructorFromPropertiesArgument = {
                    properties: classDefinition.properties,
                    classDefinition: classDefinition.classDefinition,
                    document: document,
                    isFileScopedNamespace: classDefinition.isFileScoped,
                };

                const codeAction = new CodeAction(actionTitle, CodeActionKind.RefactorExtract);

                codeAction.command = {
                    title: codeAction.title,
                    command,
                    arguments: [parameter]
                };

                return Result.ok<CodeAction>(codeAction);
            });
    }

    private _findCtorDefinitionAndProperties(document: TextDocument, editor: TextEditor): Result<CSharpClass> {
        const position = editor.selection.active;

        return this._findFileScopedNamespace(document)
            .AndThenSync((isFileScoped) => this._findClassFromLine(document, position.line)
                .AndThenSync((withinClass) => {
                    const properties = new Array<CSharpPropertyDefinition>();
                    let lineNo = 0;

                    while (lineNo < document.lineCount) {
                        const textLine = document.lineAt(lineNo);

                        const match = Array.from(textLine.text.trim().matchAll(CodeActionProvider.ReadonlyRegex));
                        if (match.length > 0) {
                            const resultFoundClass = this._findClassFromLine(document, lineNo);

                            if (resultFoundClass.isOk() && resultFoundClass.value().className === withinClass.className) {
                                const prop: CSharpPropertyDefinition = {
                                    lineNumber: lineNo,
                                    class: resultFoundClass.value(),
                                    modifier: match[0][1],
                                    type: match[0][2],
                                    name: match[0][3],
                                    statement: match[0][0]
                                };

                                properties.push(prop);
                            }
                        }

                        lineNo++;
                    }

                    if (!properties.length) {
                        return Result.error<CSharpClass>('NotFoundError', 'Properties not found');
                    }

                    return Result.ok<CSharpClass>({ properties, classDefinition: withinClass, isFileScoped });
                }));
    }

    private _findFileScopedNamespace(document: TextDocument): Result<boolean> {
        let lineNo = 0;
        let isFileScopedNamespace = false;
        while (lineNo < document.lineCount) {
            const line = document.lineAt(lineNo);
            if (line.text.trim().startsWith('namespace')) {
                if (line.text.trim().endsWith(';')) {
                    isFileScopedNamespace = true;
                }

                return Result.ok<boolean>(isFileScopedNamespace);
            }

            lineNo++;
        }

        return Result.error<boolean>('NameSpaceNotFoundError', 'Class does not have a namespace');
    }

    private _findClassFromLine(document: TextDocument, lineNo: number): Result<CSharpClassDefinition> {
        if (!lineNo) lineNo = document.lineCount - 1;
        if (lineNo >= document.lineCount) lineNo = document.lineCount - 1;

        while (lineNo >= 0) {
            const line = document.lineAt(lineNo);
            const match = Array.from(line.text.trim().matchAll(CodeActionProvider.ClassRegex));

            if (match.length > 0) {

                return Result.ok<CSharpClassDefinition>({
                    startLine: lineNo,
                    endLine: -1,
                    className: match[0][3],
                    modifier: match[0][1],
                    statement: match[0][0]
                });
            }

            lineNo--;
        }

        return Result.error<CSharpClassDefinition>('ClassNotFoundError', 'Class definition not found');
    }
}

interface CSharpClassDefinition {
    startLine: number,
    endLine: number,
    className: string,
    modifier: string,
    statement: string
}

interface CSharpPropertyDefinition {
    class: CSharpClassDefinition,
    modifier: string,
    type: string,
    name: string,
    statement: string,
    lineNumber: number
}

interface CSharpClass {
    properties: CSharpPropertyDefinition[],
    classDefinition: CSharpClassDefinition,
    isFileScoped: boolean,
}

interface ConstructorFromPropertiesArgument {
    document: TextDocument,
    classDefinition: CSharpClassDefinition,
    properties: CSharpPropertyDefinition[],
    isFileScopedNamespace: boolean,
}
