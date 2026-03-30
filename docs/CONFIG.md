# CsharpExtensions Configuration

C# Extensions can be configured to customize its behavior and features. The configuration options allow you to enable or disable specific features, set default values, and tailor the extension to your preferences.

## Private Members Prefix

Prefix for generated private member declarations.

- **Name**: csharpextensions.privateMemberPrefix
- **Default**: ""
- **Example**: "_" would generate private members like "_myField" instead of "myField".

## Reformat After Change

The document will be reformatted after code actions are used.

- **Name**: csharpextensions.reFormatAfterChange
- **Default**: true

## Templates

Defines custom templates, based on the custom sections `header`,`visibility`,`attributes`, `construct`, `declaration` and `body`.

More details about the custom templates can be found in the [Templates documentation](./TEMPLATES.md).

- **Name**: csharpextensions.templates
- **Default**: {}

## Use File Scoped Namespaces

Implements file scoped namespaces for generated code. This setting is only available for C# 10 and later.

**Note**: This setting will not available if your framework target is lower than .NET 6, as file scoped namespaces are not supported in earlier versions.

- **Name**: csharpextensions.useFileScopedNamespace
- **Default**: false
- **Example**:

  ```csharp
    //Earlier versions of C#
    namespace MyNamespace
    {
        public class MyClass
        {
            // Class members
        }
    }
  ```

  ```csharp
    //C# 10 and later with file scoped namespaces
    namespace MyNamespace;

    public class MyClass
    {
        // Class members
    }
  ```

## Use This For Constructor Assignments

Whether or not a constructor assignment of a property or variable should be prefixed with `this`.

- **Name**: csharpextensions.useThisForCtorAssignments
- **Default**: true

## Usings Implicit

If created classes should exclude implicit usings.

**Note**: Only applies when a project's `ImplicitUsings` has been set to enabled, and when `csharpextensions.usings.include` is set to true.

- **Name**: csharpextensions.usings.implicit
- **Default**: false

## Usings Include

When a class is created, include the default usings.

- **Name**: csharpextensions.usings.include
- **Default**: true
