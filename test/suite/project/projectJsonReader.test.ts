import * as assert from 'assert';
import * as path from 'path';
import * as fs from 'fs';
import { afterEach } from 'mocha';
import * as sinon from 'sinon';
import ProjectJsonReader from '../../../src/project/projectJsonReader';
import { Logger } from '../../../src/logging/log';

const fixture_path= path.resolve(__dirname, '../../suite/');
interface Fixture {
    filename: string,
    json : string,
    expected : string | undefined,
}

suite('ProjectJsonReader', () => {
    const fixtures : Array<Fixture> = [
        {
            filename: 'xamarin.json',
            json: '{"tooling": {"defaultNamespace":"Xamarin.Forms"}}',
            expected: 'Xamarin.Forms',
        },
        {
            filename: 'empty-configuration.json',
            json: '{"tooling": {}}',
            expected: undefined,
        },
        {
            filename: 'empty-json.json',
            json: '{}',
            expected: undefined,
        },
        {
            filename: 'wrong-json.json',
            json: 'lorem ipsum',
            expected: undefined,
        },
    ];

    afterEach(() => {
        sinon.restore();
        sinon.reset();
    });

    fixtures.forEach(({ filename, json, expected }) => {
        test(`getNamespace from ${filename} with content ${json} should return expected result ${expected}`, async () => {
            const filePath = `${fixture_path}/${filename}`;
            fs.writeFileSync(filePath, json);
            sinon.replace(Logger, 'error', () => {});
            const detector = new ProjectJsonReader(filePath);
            const actual = await detector.getRootNamespace();

            fs.unlinkSync(filePath);
            assert.strictEqual(actual, expected);
        });
    });

    test('getFilePath return expected result',() => {
        const filePath = `${fixture_path}/my-fancy-csproj-file`;
        const detector = new ProjectJsonReader(filePath);
        const actual = detector.getFilePath();

        assert.strictEqual(actual, filePath);
    });
});
