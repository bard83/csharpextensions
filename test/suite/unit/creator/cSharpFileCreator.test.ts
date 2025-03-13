import * as assert from 'assert';
import { beforeEach, afterEach } from 'mocha';
import { EOL } from 'os';
import  { sep, resolve } from 'path';
import * as sinon from 'sinon';

import CSharpFileCreator from '../../../../src/creator/cShaprFileCreator';
import TemplateConfiguration from '../../../../src/template/templateConfiguration';
import { TemplateType } from '../../../../src/template/templateType';
import statuses from '../../../../src/creator/fileCreatorStatus';
import FileHandler from '../../../../src/io/fileHandler';
import { Logger } from '../../../../src/logging/log';

suite('CSharpFileCreator', () => {
    let fakeFileHandler: {
        fileExists: () => Promise<boolean>,
        read: () => Promise<string>,
        write: () => Promise<void>,
    };

    const templatesPath = 'templates';
    const newFilename = 'File';
    const fixture_path= resolve(__dirname, '../../../suite/');
    const pathWithoutExtension = `${fixture_path}${sep}unit${sep}creator${sep}${newFilename}`;
    const destinationFilePath = `${pathWithoutExtension}.cs`;

    beforeEach(() => {
        fakeFileHandler = {
            fileExists: sinon.fake.resolves(false),
            read: sinon.fake.resolves('template content'),
            write: sinon.fake.resolves(undefined),
        };
    });

    afterEach(() => {
        sinon.restore();
        sinon.reset();
    });

    test('Create when a file exists, returns FileExistingError', async () => {
        fakeFileHandler.fileExists = sinon.fake.resolves(true);
        sinon.replace(FileHandler, 'fileExists', fakeFileHandler.fileExists);
        sinon.replace(FileHandler, 'read', fakeFileHandler.read);
        sinon.replace(FileHandler, 'write', fakeFileHandler.write);
        sinon.replace(Logger, 'debug', () => {});
        const useFileScopedNamespace = false;
        const error = `File already exists: ${destinationFilePath}`;


        const configuration = TemplateConfiguration.create(TemplateType.Class, EOL, useFileScopedNamespace, true, true, true, []).value();
        const fileCreator = CSharpFileCreator.create(configuration).value();

        const result = await fileCreator.create(templatesPath, pathWithoutExtension, newFilename);

        assert.strictEqual(result.isErr(), true);
        assert.strictEqual(result.isOk(), false);
        assert.strictEqual(result.status(), statuses.fileExistingError);
        assert.strictEqual(result.info(), error);
    });

    test('Create when template cannot be read, returns ReadingTemplateError', async () => {
        fakeFileHandler.read= sinon.fake.rejects('Error reading template');
        sinon.replace(FileHandler, 'fileExists', fakeFileHandler.fileExists);
        sinon.replace(FileHandler, 'read', fakeFileHandler.read);
        sinon.replace(FileHandler, 'write', fakeFileHandler.write);
        sinon.replace(Logger, 'debug', () => {});
        const configuration = TemplateConfiguration.create(TemplateType.Class, EOL, false, true, true, true, []).value();
        const fileCreator = CSharpFileCreator.create(configuration).value();

        const result = await fileCreator.create(templatesPath, pathWithoutExtension, newFilename);

        assert.strictEqual(result.isErr(), true);
        assert.strictEqual(result.isOk(), false);
        assert.strictEqual(result.status(),statuses.readingTemplateError);
        assert.strictEqual(result.info(), 'Error: Error reading template');
    });

    test('Create when file cannot be written, returns WritingFileError', async () => {
        fakeFileHandler.write= sinon.fake.rejects('write error');
        sinon.replace(FileHandler, 'fileExists', fakeFileHandler.fileExists);
        sinon.replace(FileHandler, 'read', fakeFileHandler.read);
        sinon.replace(FileHandler, 'write', fakeFileHandler.write);
        sinon.replace(Logger, 'debug', () => {});
        const configuration = TemplateConfiguration.create(TemplateType.Class, EOL, false, true, true, true, []).value();
        const fileCreator = CSharpFileCreator.create(configuration).value();

        const result = await fileCreator.create(templatesPath, pathWithoutExtension, newFilename);

        assert.strictEqual(result.isOk(), false);
        assert.strictEqual(result.isErr(), true);
        assert.strictEqual(result.status(),statuses.writingFileError);
        assert.strictEqual(result.info(), 'Error: write error');
    });

    test('Create file successfully', async () => {
        sinon.replace(FileHandler, 'fileExists', fakeFileHandler.fileExists);
        sinon.replace(FileHandler, 'read', fakeFileHandler.read);
        sinon.replace(FileHandler, 'write', fakeFileHandler.write);
        sinon.replace(Logger, 'debug', () => {});
        const configuration = TemplateConfiguration.create(TemplateType.Class, EOL, false, true, true, true, []).value();
        const fileCreator = CSharpFileCreator.create(configuration).value();

        const result = await fileCreator.create(templatesPath, pathWithoutExtension, newFilename);

        assert(result.isOk());
        assert.strictEqual(result.value().filePath, destinationFilePath);
        assert.strictEqual(result.value().cursorPositionArray, null);
    });
});
