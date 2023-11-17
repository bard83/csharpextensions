import { TemplateType } from '../template/templateType';
import Template from '../template/template';
import FileHandler from '../io/fileHandler';
import NamespaceDetector from '../namespaceDetector';
import TemplateConfiguration from '../template/templateConfiguration';
import Result from '../common/result';
import statuses from './fileCreatorStatus';
import { ExtensionError } from '../errors/extensionError';


export default class CSharpFileCreator {
    private _template: TemplateType;
    private _templateConfiguration: TemplateConfiguration;

    private constructor(templateConfiguration: TemplateConfiguration) {
        this._template = templateConfiguration.getTemplateType();
        this._templateConfiguration = templateConfiguration;
    }

    public async create(templatesPath: string, pathWithoutExtension: string, newFilename: string): Promise<Result<CreatedFile>> {
        const destinationFilePath = `${pathWithoutExtension}${Template.getExtension(this._template)}`;
        const exists = await FileHandler.fileExists(destinationFilePath);

        if (exists) {
            return Result.error<CreatedFile>(statuses.fileExistingError, `File already exists: ${destinationFilePath}`);
        }

        const templateContentResult = await this.handleTemplateContent(templatesPath);
        if (templateContentResult.isErr()) {
            return Result.error<CreatedFile>(templateContentResult.status(), templateContentResult.info());
        }

        const templateContent = templateContentResult.value();

        const template = new Template(this._template, templateContent, this._templateConfiguration);
        const namespaceDetector = new NamespaceDetector(pathWithoutExtension);
        const namespace = await namespaceDetector.getNamespace();

        const fileContent = template.build(newFilename, namespace);
        try {
            await FileHandler.write(destinationFilePath, fileContent);
        } catch (e) {
            const error = e as ExtensionError;

            return Result.error<CreatedFile>(statuses.writingFileError, error.toString());
        }

        const cursorPositionArray = template.findCursorInTemplate(newFilename, namespace);

        return Result.ok<CreatedFile>({ filePath: destinationFilePath, cursorPositionArray: cursorPositionArray });
    }

    private async handleTemplateContent(templatesPath: string): Promise<Result<string>> {
        if (this._templateConfiguration.getTemplateType() === TemplateType.CustomTemplate) {
            const templateContent = 
`\${namespaces}namespace \${namespace}
{
    \${attributes}\${visibility} \${construct} \${classname}\${genericsDefinition}\${declaration}\${genericsWhereClauses}
    {
        \${cursor}
\${body}
    }
}`;

            return Result.ok<string>(templateContent);

        }

        const templatePath = Template.getTemplatePath(templatesPath, this._template);
        try {
            const templateContent = await FileHandler.read(templatePath);

            return Result.ok<string>(templateContent);
        } catch (e) {
            const error = e as ExtensionError;

            return Result.error<string>(statuses.readingTemplateError, error.toString());
        }
    }

    public static create(templateConfiguration: TemplateConfiguration): Result<CSharpFileCreator> {
        return Result.ok<CSharpFileCreator>(new CSharpFileCreator(templateConfiguration));
    }
}
