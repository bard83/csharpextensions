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

interface RegisterCommandCallbackArgument {
    _fsPath: string,
    fsPath: string,
    path: string,
}

interface CustomTemplate {
    name: string;
    visibility?: string;
    construct: string;
    description: string;
    header?: string;
    genericsDefinition?: string;
    attributes?: Array<string>;
    genericsWhereClauses?: Array<string>;
    declaration?: string;
    body?: string;
}

interface CustomTemplateConfig {
    items: [CustomTemplate];
}

type CreatedFile = {
    filePath: string,
    cursorPositionArray: number[] | null,
}
