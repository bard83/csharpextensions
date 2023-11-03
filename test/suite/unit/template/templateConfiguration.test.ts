import * as assert from 'assert';

import TemplateConfiguration from '../../../../src/template/templateConfiguration';
import { TemplateType } from '../../../../src/template/templateType';
import { EOL } from 'os';
import Template from '../../../../src/template/template';

suite('TemplateConfiguration', () => {
    const handleCustomTemplate = (type: TemplateType) => {
        let customTemplate = undefined;
        if (type === TemplateType.CustomTemplate) {
            customTemplate = {
                construct: 'class',
                description: 'test',
                name: 'TestCustomTemplate',
            };
        }

        return customTemplate as CustomTemplate;
    };
    const allTypes: Array<TemplateType> = [
        TemplateType.Class,
        TemplateType.Inteface,
        TemplateType.Enum,
        TemplateType.Struct,
        TemplateType.Controller,
        TemplateType.ApiController,
        TemplateType.MsTest,
        TemplateType.NUnit,
        TemplateType.XUnit,
        TemplateType.RazorPageClass,
        TemplateType.RazorPageTemplate,
        TemplateType.UWPPageClass,
        TemplateType.UWPPageXml,
        TemplateType.UWPResource,
        TemplateType.UWPUserControllClass,
        TemplateType.UWPUserControllXml,
        TemplateType.UWPWindowClass,
        TemplateType.UWPWindowXml,
        TemplateType.CustomTemplate,
    ];
    test(`create for type ${TemplateType[TemplateType.Record]} with wrong configuration`, () => {
        // returns the wrong custom template instance
        const configurationResult = TemplateConfiguration.create(TemplateType.Record, EOL, true, true, false, true, []);

        assert.strictEqual(configurationResult.isErr(), true);
    });

    allTypes.forEach((type) => {
        test(`create for type ${TemplateType[type]} with wrong configuration`, () => {
            // returns the wrong custom template instance
            const wrongTemplate = handleCustomTemplate(type === TemplateType.CustomTemplate ? TemplateType.Class : TemplateType.CustomTemplate);
            const configurationResult = TemplateConfiguration.create(type, EOL, true, true, true, true, [], wrongTemplate);

            assert.strictEqual(configurationResult.isErr(), true);
        });
    });
    allTypes.forEach((type) => {
        test(`create for type ${TemplateType[type]} with include namaspaces true, default eol, File scoped namespace for cs template true and use implicit using true`, () => {
            const customTemplate = handleCustomTemplate(type);
            const configurationResult = TemplateConfiguration.create(type, EOL, true, true, true, true, [], customTemplate);

            assert.strictEqual(configurationResult.isOk(), true);
            const configuration = configurationResult.value();
            assert.strictEqual(configuration.getIncludeNamespaces(), true);
            assert.strictEqual(configuration.getEolSettings(), EOL);
            assert.strictEqual(configuration.getUseFileScopedNamespace(), Template.getExtension(type).endsWith('.cs') ? true : false);
            assert.deepStrictEqual(configuration.getRequiredUsings(), getRequiredImports(type));
            assert.deepStrictEqual(configuration.getOptionalUsings(), getOptionalImports(type));
            assert.strictEqual(configuration.getUseImplicitUsings(), true);
            assert.deepStrictEqual(configuration.getImplicitUsings(), []);
        });
    });
    allTypes.forEach((type) => {
        test(`create for type ${TemplateType[type]} with include namaspaces true, default eol, File scoped namespace for cs template true and use implicit using false`, () => {
            const customTemplate = handleCustomTemplate(type);
            const configurationResult = TemplateConfiguration.create(type, EOL, true, true, true, false, [], customTemplate);

            assert.strictEqual(configurationResult.isOk(), true);
            const configuration = configurationResult.value();
            assert.strictEqual(configuration.getIncludeNamespaces(), true);
            assert.strictEqual(configuration.getEolSettings(), EOL);
            assert.strictEqual(configuration.getUseFileScopedNamespace(), Template.getExtension(type).endsWith('.cs') ? true : false);
            assert.deepStrictEqual(configuration.getRequiredUsings(), getRequiredImports(type));
            assert.deepStrictEqual(configuration.getOptionalUsings(), getOptionalImports(type));
            assert.strictEqual(configuration.getUseImplicitUsings(), false);
            assert.deepStrictEqual(configuration.getImplicitUsings(), []);
        });
    });
    allTypes.forEach((type) => {
        test(`create for type ${TemplateType[type]} with include namaspaces true, default eol and File scoped namespace  false`, () => {
            const customTemplate = handleCustomTemplate(type);
            const configurationResult = TemplateConfiguration.create(type, EOL, true, false, true, true, [], customTemplate);

            assert.strictEqual(configurationResult.isOk(), true);
            const configuration = configurationResult.value();
            assert.strictEqual(configuration.getIncludeNamespaces(), true);
            assert.strictEqual(configuration.getEolSettings(), EOL);
            assert.strictEqual(configuration.getUseFileScopedNamespace(), false);
            assert.deepStrictEqual(configuration.getRequiredUsings(), getRequiredImports(type));
            assert.deepStrictEqual(configuration.getOptionalUsings(), getOptionalImports(type));
            assert.strictEqual(configuration.getUseImplicitUsings(), true);
            assert.deepStrictEqual(configuration.getImplicitUsings(), []);
        });
    });
    allTypes.forEach((type) => {
        test(`create for type ${TemplateType[type]} with include namaspaces true, default eol and File scoped namespace  false and older target framework`, () => {
            const customTemplate = handleCustomTemplate(type);
            const configurationResult = TemplateConfiguration.create(type, EOL, true, false, false, true, [], customTemplate);

            if (type !== TemplateType.Record) {
                assert.strictEqual(configurationResult.isOk(), true);
                const configuration = configurationResult.value();
                assert.strictEqual(configuration.getIncludeNamespaces(), true);
                assert.strictEqual(configuration.getEolSettings(), EOL);
                assert.strictEqual(configuration.getUseFileScopedNamespace(), false);
                assert.deepStrictEqual(configuration.getRequiredUsings(), getRequiredImports(type));
                assert.deepStrictEqual(configuration.getOptionalUsings(), getOptionalImports(type));
                assert.strictEqual(configuration.getUseImplicitUsings(), true);
                assert.deepStrictEqual(configuration.getImplicitUsings(), []);
            } else {
                assert.strictEqual(configurationResult.isErr(), true);
                assert.strictEqual(configurationResult.status(), 'error');
                assert.strictEqual(configurationResult.info(), 'The target .NET framework does not support Record');
            }
        });
    });
    allTypes.forEach((type) => {
        test(`create for type ${TemplateType[type]} with include namaspaces false and default eol and File scoped namespace for cs template true`, () => {
            const customTemplate = handleCustomTemplate(type);
            const configurationResult = TemplateConfiguration.create(type, EOL, false, true, true, true, [], customTemplate);

            assert.strictEqual(configurationResult.isOk(), true);
            const configuration = configurationResult.value();
            assert.strictEqual(configuration.getIncludeNamespaces(), false);
            assert.strictEqual(configuration.getEolSettings(), EOL);
            assert.strictEqual(configuration.getUseFileScopedNamespace(), Template.getExtension(type).endsWith('.cs') ? true : false);
            assert.deepStrictEqual(configuration.getRequiredUsings(), getRequiredImports(type));
            assert.deepStrictEqual(configuration.getOptionalUsings(), getOptionalImports(type));
            assert.strictEqual(configuration.getUseImplicitUsings(), true);
            assert.deepStrictEqual(configuration.getImplicitUsings(), []);
        });
    });
    allTypes.forEach((type) => {
        test(`create for type ${TemplateType[type]} with include namaspaces false and default eol and File scoped namespace for cs template false`, () => {
            const customTemplate = handleCustomTemplate(type);
            const configurationResult = TemplateConfiguration.create(type, EOL, false, true, false, true, [], customTemplate);

            assert.strictEqual(configurationResult.isOk(), true);
            const configuration = configurationResult.value();
            assert.strictEqual(configuration.getIncludeNamespaces(), false);
            assert.strictEqual(configuration.getEolSettings(), EOL);
            assert.strictEqual(configuration.getUseFileScopedNamespace(), false);
            assert.deepStrictEqual(configuration.getRequiredUsings(), getRequiredImports(type));
            assert.deepStrictEqual(configuration.getOptionalUsings(), getOptionalImports(type));
            assert.strictEqual(configuration.getUseImplicitUsings(), true);
            assert.deepStrictEqual(configuration.getImplicitUsings(), []);
        });
    });
    ['\n', '\r\n', 'someString'].forEach((eolSetting) => {
        test(`create  with eol ${eolSetting}`, async () => {
            const configurationResult = TemplateConfiguration.create(TemplateType.Class, eolSetting, true, true, true, true, []);

            const configuration = configurationResult.value();
            assert.strictEqual(configuration.getEolSettings(), eolSetting === 'someString' ? EOL : eolSetting);
            assert.strictEqual(configuration.getIncludeNamespaces(), true);
            assert.strictEqual(configuration.getUseFileScopedNamespace(), true);
            assert.deepStrictEqual(configuration.getRequiredUsings(), getRequiredImports(TemplateType.Class));
            assert.deepStrictEqual(configuration.getOptionalUsings(), getOptionalImports(TemplateType.Class));
            assert.strictEqual(configuration.getUseImplicitUsings(), true);
            assert.deepStrictEqual(configuration.getImplicitUsings(), []);
        });
    });
});

function getRequiredImports(type: TemplateType): Array<string> {
    let expectedRequired: Array<string>;
    switch (type) {
        case TemplateType.Class:
        case TemplateType.Inteface:
        case TemplateType.Enum:
        case TemplateType.Record:
        case TemplateType.Struct:
        case TemplateType.UWPPageClass:
        case TemplateType.UWPUserControllClass:
        case TemplateType.UWPWindowClass:
        case TemplateType.CustomTemplate:
            expectedRequired = [];
            break;
        case TemplateType.Controller:
            expectedRequired = [
                'System.Diagnostics',
                'Microsoft.AspNetCore.Mvc',
                'Microsoft.Extensions.Logging',
            ];
            break;
        case TemplateType.ApiController:
            expectedRequired = ['Microsoft.AspNetCore.Mvc'];
            break;
        case TemplateType.MsTest:
            expectedRequired = ['Microsoft.VisualStudio.TestTools.UnitTesting'];
            break;
        case TemplateType.NUnit:
            expectedRequired = ['NUnit.Framework'];
            break;
        case TemplateType.XUnit:
            expectedRequired = ['Xunit'];
            break;
        case TemplateType.RazorPageClass:
            expectedRequired = [
                'Microsoft.AspNetCore.Mvc',
                'Microsoft.AspNetCore.Mvc.RazorPages',
                'Microsoft.Extensions.Logging',
            ];
            break;
        case TemplateType.UWPUserControllXml:
        case TemplateType.UWPWindowXml:
        case TemplateType.UWPPageXml:
        case TemplateType.RazorPageTemplate:
        case TemplateType.UWPResource:
            expectedRequired = [];
            break;
        default:
            throw new Error(`Not expected type: ${TemplateType[type]}`);
    }

    return expectedRequired;
}

function getOptionalImports(type: TemplateType): Array<string> {
    let optionalImports: Array<string>;
    switch (type) {
        case TemplateType.Class:
        case TemplateType.Inteface:
        case TemplateType.Enum:
        case TemplateType.Struct:
        case TemplateType.Record:
        case TemplateType.Controller:
        case TemplateType.ApiController:
        case TemplateType.MsTest:
        case TemplateType.NUnit:
        case TemplateType.XUnit:
        case TemplateType.RazorPageClass:
            optionalImports = [
                'System',
                'System.Collections.Generic',
                'System.Linq',
                'System.Threading.Tasks',
            ];
            break;
        case TemplateType.UWPPageClass:
        case TemplateType.UWPUserControllClass:
        case TemplateType.UWPWindowClass:
            optionalImports = [
                'System',
                'System.Collections.Generic',
                'System.Linq',
                'System.Text',
                'System.Threading.Tasks',
                'System.Windows',
                'System.Windows.Controls',
                'System.Windows.Data',
                'System.Windows.Documents',
                'System.Windows.Input',
                'System.Windows.Media',
                'System.Windows.Media.Imaging',
                'System.Windows.Navigation',
                'System.Windows.Shapes',
            ];
            break;
        case TemplateType.UWPUserControllXml:
        case TemplateType.UWPWindowXml:
        case TemplateType.UWPPageXml:
        case TemplateType.RazorPageTemplate:
        case TemplateType.UWPResource:
        case TemplateType.CustomTemplate:
            optionalImports = [];
            break;
        default:
            throw new Error(`Not expected type: ${TemplateType[type]}`);
    }

    return optionalImports;
}
