import * as assert from 'assert';
import { beforeEach, afterEach } from 'mocha';
import * as fs from 'fs';
import * as path from 'path';
import * as sinon from 'sinon';

import CsprojReader from '../../../src/project/csprojReader';
import FileHandler from '../../../src/io/fileHandler';
import { Logger } from '../../../src/logging/log';

const fixture_path = path.resolve(__dirname, '../../suite/');
interface Fixture {
    filename: string,
    csproj: string,
    expected?: string,
}

interface ImportFixture {
    filename: string,
    csproj: string,
    targets: string,
    expected?: string,
}

interface FixtureUsings {
    filename: string,
    csproj: string,
    expected: number,
}

suite('CsprojReader', () => {
    let fakeFileHandler: {
        fileExists: () => Promise<boolean>,
        read: () => Promise<string>,
        write: () => Promise<void>,
    };

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

    const validTargetFramework: Array<string> = [
        'netcoreapp1.0',
        'netcoreapp1.1',
        'netcoreapp2.0',
        'netcoreapp2.1',
        'netcoreapp2.2',
        'netcoreapp3.0',
        'netcoreapp3.1',
        'net5.0',
        'net6.0',
    ];

    const rootNameSpaceFixtures: Array<Fixture> = [
        {
            filename: 'xamarin.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <PropertyGroup>
                    <RootNamespace>Xamarin.Forms</RootNamespace>
                </PropertyGroup>
            </Project>`,
            expected: 'Xamarin.Forms',
        },
        {
            filename: 'linq.csproj',
            csproj: `<Project Sdk="Microsoft.NET.Sdk">
                        <PropertyGroup></PropertyGroup>
                        <PropertyGroup></PropertyGroup>
                        <PropertyGroup>
                            <RootNamespace>System.Linq</RootNamespace>
                        </PropertyGroup>
                    </Project>`,
            expected: 'System.Linq',
        },
        {
            filename: 'empty-group.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <PropertyGroup>
                </PropertyGroup>
            </Project>`,
            expected: undefined,
        },
        {
            filename: 'only-project-node.csproj',
            csproj: '<Project Sdk="Microsoft.NET.Sdk"></Project>',
            expected: undefined,
        },
    ];

    const importFixtures: Array<ImportFixture> = [
        {
            filename: 'xamarin.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <Import Project="..\\Configuration.targets" />
            </Project>`,
            targets: `
            <Project>
                <PropertyGroup>
                    <RootNamespace>Xamarin.Forms</RootNamespace>
                </PropertyGroup>
            </Project>`,
            expected: 'Xamarin.Forms',
        },
        {
            filename: 'linq.csproj',
            csproj: `<Project Sdk="Microsoft.NET.Sdk">
                        <Import Project="..\\Configuration.targets" />
                    </Project>`,
            targets: `<Project>
                        <PropertyGroup></PropertyGroup>
                        <PropertyGroup></PropertyGroup>
                        <PropertyGroup>
                            <RootNamespace>System.Linq</RootNamespace>
                        </PropertyGroup>
                    </Project>
            `,
            expected: 'System.Linq',
        },
        {
            filename: 'empty-group.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <Import Project="..\\Configuration.targets" />
            </Project>`,
            targets: `
            <Project Sdk="Microsoft.NET.Sdk">
                <PropertyGroup>
                </PropertyGroup>
            </Project>`,
            expected: undefined,
        },
        {
            filename: 'only-project-node.csproj',
            csproj: '<Project Sdk="Microsoft.NET.Sdk"><Import Project="..\\Configuration.targets" /></Project>',
            targets: '<Project></Project>',
            expected: undefined,
        },
    ];

    const importTargetFrameworkFixtures: Array<ImportFixture> = [
        {
            filename: 'first-node.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <Import Project="..\\Configuration.targets" />
            </Project>`,
            targets: `
            <Project>
                <PropertyGroup>
                    <TargetFramework>%PLACE_HOLDER%</TargetFramework>
                </PropertyGroup>
            </Project>
            `,
            expected: '%PLACE_HOLDER%',
        },
        {
            filename: 'last-node.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <Import Project="..\\Configuration.targets" />
            </Project>`,
            targets: `<Project>
                        <PropertyGroup></PropertyGroup>
                        <PropertyGroup></PropertyGroup>
                        <PropertyGroup>
                            <TargetFramework>%PLACE_HOLDER%</TargetFramework>
                        </PropertyGroup>
                    </Project>`,
            expected: '%PLACE_HOLDER%',
        },
        {
            filename: 'empty-group.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <Import Project="..\\Configuration.targets" />
            </Project>`,
            targets: `
            <Project>
                <PropertyGroup></PropertyGroup>
            </Project>
            `,
            expected: undefined,
        },
        {
            filename: 'only-project-node.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <Import Project="..\\Configuration.targets" />
            </Project>`,
            targets: '<Project></Project>',
            expected: undefined,
        },
    ];

    const targetFrameworkFixtures: Array<Fixture> = [
        {
            filename: 'first-node.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <PropertyGroup>
                    <TargetFramework>%PLACE_HOLDER%</TargetFramework>
                </PropertyGroup>
            </Project>
            `,
            expected: '%PLACE_HOLDER%',
        },
        {
            filename: 'last-node.csproj',
            csproj: `<Project Sdk="Microsoft.NET.Sdk">
                        <PropertyGroup></PropertyGroup>
                        <PropertyGroup></PropertyGroup>
                        <PropertyGroup>
                            <TargetFramework>%PLACE_HOLDER%</TargetFramework>
                        </PropertyGroup>
                    </Project>`,
            expected: '%PLACE_HOLDER%',
        },
        {
            filename: 'empty-group.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <PropertyGroup></PropertyGroup>
            </Project>
            `,
            expected: undefined,
        },
        {
            filename: 'only-project-node.csproj',
            csproj: '<Project Sdk="Microsoft.NET.Sdk"></Project>',
            expected: undefined,
        },
    ];

    const invalidCsProjFixtures: Array<Fixture> = [
        {
            filename: 'empty.csproj',
            csproj: '',
            expected: undefined,
        },
        {
            filename: 'random-text.csproj',
            csproj: 'lorem ipsum',
            expected: undefined,
        },
        {
            filename: 'malformed-xml-1.csproj',
            csproj: '<',
            expected: undefined,
        },
        {
            filename: 'malformed-xml-2.csproj',
            csproj: '<>',
            expected: undefined,
        },
        {
            filename: 'malformed-xml-3.csproj',
            csproj: '/>',
            expected: undefined,
        },
        {
            filename: 'malformed-xml-missing-end-tag.csproj',
            csproj: '<lorem>',
            expected: undefined,
        },
        {
            filename: 'malformed-xml-missing-start-tag.csproj',
            csproj: '</lorem>',
            expected: undefined,
        },
    ];

    const usingsInclude: Array<FixtureUsings> = [
        {
            filename: 'first-node-using-include.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <ItemGroup>
                    <Using Include="" />
                </ItemGroup>
            </Project>
            `,
            expected: 1,
        },
        {
            filename: 'last-node-using-include.csproj',
            csproj: `<Project Sdk="Microsoft.NET.Sdk">
                        <ItemGroup></ItemGroup>
                        <ItemGroup></ItemGroup>
                        <ItemGroup>
                            <Using Include="" />
                        </ItemGroup>
                    </Project>`,
            expected: 1,
        },
        {
            filename: 'empty-item-using-include.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <ItemGroup></ItemGroup>
            </Project>
            `,
            expected: 0,
        },
        {
            filename: 'split-using-include.csproj',
            csproj: `<Project Sdk="Microsoft.NET.Sdk">
                        <ItemGroup>
                            <Using Include="" />
                        </ItemGroup>
                        <ItemGroup>
                            <Using Include="" />
                        </ItemGroup>
                        <ItemGroup>
                            <Using Include="" />
                        </ItemGroup>
                    </Project>`,
            expected: 3,
        },
    ];

    const usingsRemove: Array<FixtureUsings> = [
        {
            filename: 'first-node-using-remove.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <ItemGroup>
                    <Using Remove="" />
                </ItemGroup>
            </Project>
            `,
            expected: 1,
        },
        {
            filename: 'last-node-using-remove.csproj',
            csproj: `<Project Sdk="Microsoft.NET.Sdk">
                        <ItemGroup></ItemGroup>
                        <ItemGroup></ItemGroup>
                        <ItemGroup>
                            <Using Remove="" />
                        </ItemGroup>
                    </Project>`,
            expected: 1,
        },
        {
            filename: 'empty-item-using-remove.csproj',
            csproj: `
            <Project Sdk="Microsoft.NET.Sdk">
                <ItemGroup></ItemGroup>
            </Project>
            `,
            expected: 0,
        },
        {
            filename: 'split-using-remove.csproj',
            csproj: `<Project Sdk="Microsoft.NET.Sdk">
                        <ItemGroup>
                            <Using Remove="" />
                        </ItemGroup>
                        <ItemGroup>
                            <Using Remove="" />
                        </ItemGroup>
                        <ItemGroup>
                            <Using Remove="" />
                        </ItemGroup>
                    </Project>`,
            expected: 3,
        },
    ];
    invalidCsProjFixtures.forEach(({ filename, csproj, expected }) => {
        test(`getRootNamespace from ${filename} with invalid content ${csproj} should return expected result ${expected}`, async () => {
            const filePath = `${fixture_path}/${filename}`;
            fakeFileHandler.read = sinon.fake.resolves(csproj);
            sinon.replace(FileHandler, 'read', fakeFileHandler.read);
            sinon.replace(Logger, 'error', () => {});

            const detector = new CsprojReader(filePath);
            const actual = await detector.getRootNamespace();

            assert.strictEqual(actual, expected);
        });
        test(`getTargetFramework from ${filename} with invalid content ${csproj} should return expected result ${expected}`, async () => {
            const filePath = `${fixture_path}/${filename}`;
            fakeFileHandler.read = sinon.fake.resolves(csproj);
            sinon.replace(FileHandler, 'read', fakeFileHandler.read);
            sinon.replace(Logger, 'error', () => {});
            const detector = new CsprojReader(filePath);
            const actual = await detector.getTargetFramework();

            assert.strictEqual(actual, expected);
        });
    });

    rootNameSpaceFixtures.forEach(({ filename, csproj, expected }) => {
        test(`getNamespace from ${filename} with content ${csproj} should return expected result ${expected}`, async () => {
            const filePath = `${fixture_path}/${filename}`;
            fakeFileHandler.read = sinon.fake.resolves(csproj);
            sinon.replace(FileHandler, 'read', fakeFileHandler.read);
            sinon.replace(Logger, 'error', () => {});
            const detector = new CsprojReader(filePath);
            const actual = await detector.getRootNamespace();

            assert.strictEqual(actual, expected);
        });
    });

    importFixtures.forEach(({ filename, csproj, expected, targets }) => {
        test(`getNamespace from ${filename} with content ${csproj} and targets ${targets} should return expected result ${expected}`, async () => {
            const filePath = `${fixture_path}/${filename}`;
            const read = sinon.stub(FileHandler, 'read');
            read.onCall(0).resolves(csproj);
            read.onCall(1).resolves(targets);
            sinon.replace(Logger, 'error', () => {});
            const detector = new CsprojReader(filePath);
            const actual = await detector.getRootNamespace();

            assert.strictEqual(read.callCount, 2);
            read.restore();
            read.reset();
            assert.strictEqual(actual, expected);
        });
    });

    usingsInclude.forEach(({ filename, csproj, expected }) => {
        test(`getUsingsInclude from ${filename} with content ${csproj} should return expected #n ${expected} elements`, async () => {
            const filePath = `${fixture_path}/${filename}`;
            fakeFileHandler.read = sinon.fake.resolves(csproj);
            sinon.replace(FileHandler, 'read', fakeFileHandler.read);
            sinon.replace(Logger, 'error', () => {});
            const detector = new CsprojReader(filePath);
            const actual = await detector.getUsingsInclude();

            assert.strictEqual(actual.length, expected);
        });
    });

    usingsRemove.forEach(({ filename, csproj, expected }) => {
        test(`getUsingsRemove from ${filename} with content ${csproj} should return expected #n ${expected} elements`, async () => {
            const filePath = `${fixture_path}/${filename}`;
            fakeFileHandler.read = sinon.fake.resolves(csproj);
            sinon.replace(FileHandler, 'read', fakeFileHandler.read);
            sinon.replace(Logger, 'error', () => {});
            const detector = new CsprojReader(filePath);
            const actual = await detector.getUsingsRemove();

            assert.strictEqual(actual.length, expected);
        });
    });

    targetFrameworkFixtures.forEach(({ filename, csproj, expected }) => {
        validTargetFramework.forEach((targetFramework, index) => {
            test(`getTargetFramework from ${filename} with content ${csproj} should return expected result ${expected}`, async () => {
                const filePath = `${fixture_path}/${index}-${filename}`;
                fakeFileHandler.read = sinon.fake.resolves(csproj.replace('%PLACE_HOLDER%', targetFramework));
                sinon.replace(FileHandler, 'read', fakeFileHandler.read);
                sinon.replace(Logger, 'error', () => {});
                const detector = new CsprojReader(filePath);
                const actual = await detector.getTargetFramework();

                assert.strictEqual(actual, expected?.replace('%PLACE_HOLDER%', targetFramework));
            });
            test(`isTargetFrameworkHigherThanOrEqualToDotNet6 ${filename} with content ${csproj} should return expected result ${!expected ? 'undefined' : targetFramework}`, async () => {
                const filePath = `${fixture_path}/${index}-${filename}`;
                fakeFileHandler.read = sinon.fake.resolves(csproj.replace('%PLACE_HOLDER%', targetFramework));
                sinon.replace(FileHandler, 'read', fakeFileHandler.read);
                sinon.replace(Logger, 'error', () => {});
                const detector = new CsprojReader(filePath);
                let framework = undefined;
                if (expected) {
                    const versionMatch = targetFramework.match(/(?<=net)\d+(\.\d+)*/i);
                    framework = !versionMatch?.length || Number.isNaN(versionMatch[0]) ? false : (Number.parseFloat(versionMatch[0]) >= 6);
                }

                const actual = await detector.isTargetFrameworkHigherThanOrEqualToDotNet6();

                assert.strictEqual(actual, framework);
            });
        });
    });

    importTargetFrameworkFixtures.forEach(({ filename, csproj, expected, targets }) => {
        validTargetFramework.forEach((targetFramework, index) => {
            test(`getTargetFramework from ${filename} with content ${csproj} should return expected result ${expected}`, async () => {
                const filePath = `${fixture_path}/${index}-${filename}`;
                const read = sinon.stub(FileHandler, 'read');
                read.onCall(0).resolves(csproj);
                read.onCall(1).resolves(targets.replace('%PLACE_HOLDER%', targetFramework));
                sinon.replace(Logger, 'error', () => {});
                const detector = new CsprojReader(filePath);
                const actual = await detector.getTargetFramework();

                assert.strictEqual(read.callCount, 2);
                read.restore();
                read.reset();
                assert.strictEqual(actual, expected?.replace('%PLACE_HOLDER%', targetFramework));
            });
            test(`isTargetFrameworkHigherThanOrEqualToDotNet6 ${filename} with content ${csproj} should return expected result ${!expected ? 'undefined' : targetFramework}`, async () => {
                const filePath = `${fixture_path}/${index}-${filename}`;
                const read = sinon.stub(FileHandler, 'read');
                read.onCall(0).resolves(csproj);
                read.onCall(1).resolves(targets.replace('%PLACE_HOLDER%', targetFramework));
                sinon.replace(Logger, 'error', () => {});
                const detector = new CsprojReader(filePath);
                let framework = undefined;
                if (expected) {
                    const versionMatch = targetFramework.match(/(?<=net)\d+(\.\d+)*/i);
                    framework = !versionMatch?.length || Number.isNaN(versionMatch[0]) ? false : (Number.parseFloat(versionMatch[0]) >= 6);
                }

                const actual = await detector.isTargetFrameworkHigherThanOrEqualToDotNet6();

                assert.strictEqual(read.callCount, 2);
                read.restore();
                read.reset();
                assert.strictEqual(actual, framework);
            });
        });
    });

    test('getFilePath return expected result', () => {
        const filePath = `${fixture_path}/my-fancy-csproj-file`;
        const detector = new CsprojReader(filePath);
        const actual = detector.getFilePath();

        assert.strictEqual(actual, filePath);
    });

    targetFrameworkFixtures.forEach(({ filename, csproj, expected }) => {
        validTargetFramework.forEach((targetFramework, index) => {
            test('createFromPath returns valid CsprojReader instance', async () => {
                const filePath = path.resolve(fixture_path, `${index}-${filename}`);
                // actually not replaced by a mock because findProjectPaht uses findupglob.
                fs.writeFileSync(filePath, csproj.replace('%PLACE_HOLDER%', targetFramework));
                let framework = undefined;
                if (expected) {
                    const versionMatch = targetFramework.match(/(?<=net)\d+(\.\d+)*/i);
                    framework = !versionMatch?.length || Number.isNaN(versionMatch[0]) ? false : (Number.parseFloat(versionMatch[0]) >= 6);
                }

                const result = await CsprojReader.createFromPath(filePath);

                assert.notStrictEqual(undefined, result);
                assert.strictEqual(result?.getFilePath(), filePath);
                const actual = await result?.getTargetFramework();
                assert.strictEqual(actual, expected?.replace('%PLACE_HOLDER%', targetFramework));
                const actualTest = await result?.isTargetFrameworkHigherThanOrEqualToDotNet6();
                assert.strictEqual(actualTest, framework);
                fs.unlinkSync(filePath);
            });
        });
    });

    test('createFromPath when not existing csprj, returns undefined', async () => {
        const filePath = `${fixture_path}/not-existing-csproj`;
        const result = await CsprojReader.createFromPath(filePath);
        assert.strictEqual(undefined, result);
    });
});
