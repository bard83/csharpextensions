import { TemplateType } from './template/templateType';

export type CommandMapping = {
    command: string,
    templates: Array<TemplateType>,
}

function getCommandMapping(command: string, templates: Array<TemplateType>): CommandMapping {
    return { command, templates };
}

export function createExtensionMappings(): Map<string, CommandMapping> {
    const mapping = new Map<string, CommandMapping>();

    mapping.set('Class', getCommandMapping('createClass', [TemplateType.Class]));
    mapping.set('Interface', getCommandMapping('createInterface', [TemplateType.Inteface]));
    mapping.set('Enum', getCommandMapping('createEnum', [TemplateType.Enum]));
    mapping.set('Struct', getCommandMapping('createStruct', [TemplateType.Struct]));
    mapping.set('Record', getCommandMapping('createRecord', [TemplateType.Record]));
    mapping.set('Controller', getCommandMapping('createController', [TemplateType.Controller]));
    mapping.set('ApiController', getCommandMapping('createApiController', [TemplateType.ApiController]));
    mapping.set('Razor_Page', getCommandMapping('createRazorPage', [TemplateType.RazorPageClass, TemplateType.RazorPageTemplate]));
    mapping.set('XUnit', getCommandMapping('createXUnitTest', [TemplateType.XUnit]));
    mapping.set('NUnit', getCommandMapping('createNUnitTest', [TemplateType.NUnit]));
    mapping.set('MSTest', getCommandMapping('createMSTest', [TemplateType.MsTest]));
    mapping.set('UWP_Page', getCommandMapping('createUwpPage', [TemplateType.UWPPageClass, TemplateType.UWPPageXml]));
    mapping.set('UWP_Window', getCommandMapping('createUwpWindow', [TemplateType.UWPWindowClass, TemplateType.UWPWindowXml]));
    mapping.set('UWP_Usercontrol', getCommandMapping('createUwpUserControl', [TemplateType.UWPUserControllClass, TemplateType.UWPUserControllXml]));
    mapping.set('UWP_Resource', getCommandMapping('createUwpResourceFile', [TemplateType.UWPResource]));
    mapping.set('Template', getCommandMapping('createFromTemplate', [TemplateType.CustomTemplate]));

    return mapping;
}
