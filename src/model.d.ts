
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
