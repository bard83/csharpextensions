# CsharpExtensions Templates

C# Extensions provides a set of default templates for creating common C# constructs such as classes, interfaces, structs, records, and enums. Additionally, it allows users to define custom templates to suit their specific needs.

## Default Templates

This extension includes the following default templates:

- **Add C# Class**: Creates a new C# class file with the specified name and the current namespace based on the folder structure. The class will be created with a default using section.

![Add C# Class](../featureimages/create_class_template.gif)

- **Add C# Interface**: Creates a new C# interface file with the specified name and the current namespace based on the folder structure.

![Add C# Interface](../featureimages/create_interface_template.gif)

- **Add C# Struct**: Creates a new C# struct file with the specified name and the current namespace based on the folder structure.

![Add C# Struct](../featureimages/create_struct_template.gif)

- **Add C# Record**: Creates a new C# record file with the specified name and the current namespace based on the folder structure. This template is available **only for Frameworks that support C# 9.0 or higher**.

![Add C# Record](../featureimages/create_record_template.gif)

- **Add C# Enum**: Creates a new C# enum file with the specified name and the current namespace based on the folder structure.

![Add C# Enum](../featureimages/create_enum_template.gif)

## Custom Templates

The C# extension allows users to define custom templates that suit their specific needs. These templates must be defined in the VSCode `settings.json` file. To access this file, go to `File > Preferences > Settings`. Then, explore the Extensions section and select C# Extension. Finally, click on Edit in `settings.json`. In the new section, `csharpextensions.templates` define a list of `items` containing the custom templates. An item template is defined as follows:

```json
{
    "name": "MyCustomTemplate",
    "visibility": "public",
    "construct": "class",
    "description": "My awesome c# template",
    "header": "using System;\nusing System.Runtime.Serialization;\nusing System.Text.Json;",
    "attributes": [
        "DbContext(typeof(AppDbContext))",
        "Migration(\"${classname}\")"
    ],
    "genericsDefinition": "I,J,K",
    "declaration": "ISerializable, IEquatable",
    "genericsWhereClauses": [
        "where I : class",
        "where J : struct",
        "where K : IMyInterface",
    ],
    "body": "public void MyFancyMethod(string variable)\n{\n    System.Console.WriteLine(\"Hello World\");\n}"
}
```

- `visibility` C# component visibility (public, private and etc...);

- `construct` actually supported `class`, `interface` and `struct`;

- `header` is used to group all the necessary usings module. Each using must be separated by a `;`. The keyword `using` or the new line `\n` can be omitted. "using System;\nusing System.Runtime.Serialization;\nusing System.Text.Json;" and "System;System.Runtime.Serialization;System.Text.Json" produce the same output. Implicit usings rules will be applied.

- `genericsDefinition` used to specify the generics for the construct automatically enclosed between `<>`;

- `declaration` used to append all the necessary extended or implemented class or interface. The colon before the declaration will be automatically added. It could be used to add also generic clauses.

- `attributes` used to specify the attributes for the construct. The attributes must be specified in a list of string. Using the placeholder `${classname}` the construct name will be replaced instead.

- `genericsWhereClauses` used to define the generics where clauses inside the custom template.

- `body` body of template. It might be whatever C# code. The placeholder `${classname}` gets replaced with the file name if it's defined.

**IMPORTANT** Please note that the code defined inside **the custom template should be valid C# code**. This extension does not perform any validation on it.

- **Modify settings.json to add new custom template**

![Modify settings.json to add new custom template](../featureimages/search_custom_template.gif)

- **Add new custom template**

![Add new custom template](../featureimages/create_custom_template.gif)

- **Add a file using custom template**

![Add sample custom template](../featureimages/create_sample_custom_template.gif)
