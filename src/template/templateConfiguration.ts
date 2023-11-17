import { getEolSetting } from '../util';
import { TemplateType } from './templateType';
import Template from './template';
import Result from '../common/result';
import templateConfigurationStatuses from './templateConfigurationStatuses';
import { ExtensionError } from '../errors/extensionError';

export default class TemplateConfiguration {
    private _templateType: TemplateType;
    private _includeNamespaces: boolean;
    private _useFileScopedNamespace: boolean;
    private _eolSettings: string;
    private _tabSize: number;
    private _useSpaces: boolean;
    private _requiredUsings: Array<string>;
    private _optionalUsings: Array<string>;
    private _useImplicitUsings: boolean;
    private _implicitUsings: Array<string>;
    private _customTemplate?: CustomTemplate;

    private constructor(
        templateType: TemplateType,
        includeNamespaces: boolean,
        useFileScopedNamespace: boolean,
        eolSettings: string,
        requiredUsings: Array<string>,
        optionalUsings: Array<string>,
        useImplicitUsings: boolean,
        implicitUsings: Array<string>,
        tabSize: number,
        useSpaces: boolean,
        customTemplate?: CustomTemplate,
    ) {
        this._templateType = templateType;
        this._includeNamespaces = includeNamespaces;
        this._useFileScopedNamespace = useFileScopedNamespace;
        this._eolSettings = eolSettings;
        this._requiredUsings = requiredUsings;
        this._optionalUsings = optionalUsings;
        this._useImplicitUsings = useImplicitUsings;
        this._implicitUsings = implicitUsings;
        this._customTemplate = customTemplate;
        this._tabSize = tabSize;
        this._useSpaces = useSpaces;
    }

    public getTemplateType(): TemplateType { return this._templateType; }
    public getIncludeNamespaces(): boolean { return this._includeNamespaces; }
    public getUseFileScopedNamespace(): boolean { return this._useFileScopedNamespace; }
    public getEolSettings(): string { return this._eolSettings; }
    public getRequiredUsings(): Array<string> { return this._requiredUsings; }
    public getOptionalUsings(): Array<string> { return this._optionalUsings; }
    public getUseImplicitUsings(): boolean { return this._useImplicitUsings; }
    public getImplicitUsings(): Array<string> { return this._implicitUsings; }
    public getCustomTemplate(): CustomTemplate | undefined { return this._customTemplate; }
    public getTabSize(): number { return this._tabSize; }
    public getUseSapces(): boolean{ return this._useSpaces; }

    public static create(
        type: TemplateType,
        eol: string,
        includeNamespaces: boolean,
        useFileScopedNamespace = false,
        isTargetFrameworkAboveNet6: boolean,
        useImplicitUsings: boolean,
        implictUsings: Array<string>,
        customTemplate?: CustomTemplate,
        tabSize = 4,
        useSpaces = true,
    ): Result<TemplateConfiguration> {
        if (tabSize < 1) {
            return Result.error<TemplateConfiguration>(
                templateConfigurationStatuses.templateConfigurationCreationError,
                'Tab Size must be a positive number',
            );
        }

        if (type === TemplateType.Record && !isTargetFrameworkAboveNet6) {
            return Result.error<TemplateConfiguration>(
                templateConfigurationStatuses.templateConfigurationCreationError,
                'The target .NET framework does not support Record',
            );
        }

        if (type !== TemplateType.CustomTemplate && customTemplate || type === TemplateType.CustomTemplate && !customTemplate) {
            return Result.error<TemplateConfiguration>(
                templateConfigurationStatuses.templateConfigurationCreationError,
                `Inconsistent situation for the template ${TemplateType[type]}. Passed the following custom template ${!customTemplate ? 'undefined' : JSON.stringify(customTemplate)}`,
            );
        }


        const eolSettings = getEolSetting(eol);
        let canUseFileScopedNamespace = false;
        if (Template.getExtension(type).endsWith('.cs') && useFileScopedNamespace && isTargetFrameworkAboveNet6) {
            canUseFileScopedNamespace = true;
        }

        const requiredUsings = TemplateConfiguration.retrieveRequiredUsings(type);
        const optionalUsings = TemplateConfiguration.retrieveOptionalUsings(type);

        return Result.ok<TemplateConfiguration>(
            new TemplateConfiguration(
                type,
                includeNamespaces,
                canUseFileScopedNamespace,
                eolSettings,
                requiredUsings,
                optionalUsings,
                useImplicitUsings,
                implictUsings,
                tabSize,
                useSpaces,
                customTemplate,
            )
        );
    }

    public static retrieveRequiredUsings(type: TemplateType): Array<string> {
        switch (type) {
            case TemplateType.Class:
            case TemplateType.Inteface:
            case TemplateType.Enum:
            case TemplateType.Struct:
            case TemplateType.Record:
            case TemplateType.CustomTemplate:
                return [];
            case TemplateType.Controller:
                return [
                    'System.Diagnostics',
                    'Microsoft.AspNetCore.Mvc',
                    'Microsoft.Extensions.Logging',
                ];
            case TemplateType.ApiController:
                return ['Microsoft.AspNetCore.Mvc'];
            case TemplateType.MsTest:
                return ['Microsoft.VisualStudio.TestTools.UnitTesting'];
            case TemplateType.NUnit:
                return ['NUnit.Framework'];
            case TemplateType.XUnit:
                return ['Xunit'];
            case TemplateType.RazorPageClass:
                return [
                    'Microsoft.AspNetCore.Mvc',
                    'Microsoft.AspNetCore.Mvc.RazorPages',
                    'Microsoft.Extensions.Logging',
                ];
            case TemplateType.UWPPageClass:
            case TemplateType.UWPUserControllClass:
            case TemplateType.UWPWindowClass:
            case TemplateType.UWPUserControllXml:
            case TemplateType.UWPWindowXml:
            case TemplateType.UWPPageXml:
            case TemplateType.RazorPageTemplate:
            case TemplateType.UWPResource:
                return [];
            default:
                throw new ExtensionError(`TemplateType ${TemplateType[type]} not supported for retrieving required usings`);
        }
    }

    public static retrieveOptionalUsings(type: TemplateType): Array<string> {
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
                return [
                    'System',
                    'System.Collections.Generic',
                    'System.Linq',
                    'System.Threading.Tasks',
                ];
            case TemplateType.UWPPageClass:
            case TemplateType.UWPUserControllClass:
            case TemplateType.UWPWindowClass:
                return [
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

            case TemplateType.UWPUserControllXml:
            case TemplateType.UWPWindowXml:
            case TemplateType.UWPPageXml:
            case TemplateType.RazorPageTemplate:
            case TemplateType.UWPResource:
            case TemplateType.CustomTemplate:
                return [];
            default:
                throw new ExtensionError(`TemplateType ${TemplateType[type]} not supported for retrieving optional usings`);
        }
    }
}
