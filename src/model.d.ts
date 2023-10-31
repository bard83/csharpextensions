
interface RegisterCommandCallbackArgument {
    _fsPath: string,
    fsPath: string,
    path: string,
}

interface CustomTemplate {
    name: string;
    construct: string;
    description?: string;
    header?: string;
    declaration?: string;
    body?: string;
}

interface CustomTemplateConfig {
    items: [CustomTemplate];
}
