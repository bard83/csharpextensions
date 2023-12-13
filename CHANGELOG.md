# Changelog

All notable changes to this project will be documented in this file.

## [1.10.0] - 2023-12-13

### Added

- Custom templates support for Attributes and generics.
- File name replaced in custom template body.

### Improved

- Bumped dependecies and dev dependencies.
- Code refactor.

## [1.9.0] - 2023-11-03

### Added

- Custom templates can be defined now.

### Fixed

- Fixed minor issues and missing tests.

## [1.8.1] - 2023-10-25

### Fixed

- Fixed extension name.

## [1.8.0] - 2023-10-25

### Added

- Import in csproj file is now supported.
- Implicit usings in now supported.
- New action provider available: Initialize body expression ctor from properties
- Record template is now available.
- Fast endpoints are avaialble on the welcome page.
- Increased unit tests coverage.

### Fixed

- Setting description for default usings.
- Solved erro message when action provider commands where invocked.

### Removed

- initializeMemberFromCtor command no longer available.

## [1.7.3] - 2022-09-09

### Fixed

- Version update because of wrong version publish

## [1.7.2] - 2022-09-09

### Fixed

- XUnit using namespace corrected

## [1.7.1] - 2022-08-09

### Fixed

- ApiController now generates api controller again - Fixed by [vovche](https://github.com/vovche)

## [1.7.0] - 2022-05-02

### Added

- Unit test templates (XUnit, NUnit, MSTest)
- Struct template

## [1.6.3] - 2022-04-24

### Fixed

- Razor template name mismatch
- Template file casing
- Detecting namespace from path

## [1.6.2] - 2022-04-19

### Fixed

- If vscode EOL setting is set to 'auto', revert to default OS setting

## [1.6.1] - 2022-04-18

### Fixed

- License file capitalized, so it is included in publishing
- EOL settings from vscode applied
- Template formatting
- Prefilled names PascalCased now - Fixed by [doggy8088](https://github.com/doggy8088)

## [1.6.0] - 2022-01-24

### Added

- Option to enable file-scoped namespace with .NET 6.0+ projects - Added by [JasonWei512](https://github.com/JasonWei512)

## [1.5.3] - 2021-12-03

### Fixed

- Razor page generating to .cshtml

## [1.5.2] - 2021-10-19

### Fixed

- Loading speed increased by using webpack & excluding unneeded files from package
- Code actions throwing errors

## [1.5.1] - 2021-10-18

### Added

- Razor page template

## [1.5.0] - 2021-10-17

### Added

- UWP templates (Window, Page, UserControl, Resource)
- Removed '.cs' from filename dialog placeholder

## [1.4.3] - 2021-09-20

### Added

- New setting for adding default usings - Added by [YoussefWaelMohamedLotfy](https://github.com/YoussefWaelMohamedLotfy)

### Fixed

- Running the extension in vscodium is fixed

## [1.4.2] - 2021-08-02

### Fixed

- Fixes for the controller template

## [1.4.1] - 2021-07-29

### Added

- Controller template
- Api controller template (based on the one from [Tdallau](https://github.com/Tdallau))
- Moved actions to a submenu

### Fixed

- Only show submenu when context is folder

## [1.4.0] - 2021-05-26

### Fixed

- Using async / await
- Prevent extension search for .tmpl file popup - Added by [PoLaKoSz](https://github.com/PoLaKoSz)
- Fixed namespace if solution is in a subfolder
- Updated vscode api to 1.56.0

## [1.3.6] - 2020-07-15

### Fixed

- crash when creating new file in CodeSpaces - Added by [danyhoron](https://github.com/danyhoron)

## [1.3.5] - 2020-07-03

### Added

- RootNamespace detection - Added by [PoLaKoSz](https://github.com/PoLaKoSz)

## [1.3.4] - 2020-04-20

### Added

- Creating new enum command - Added by [fakenmc](https://github.com/fakenmc)

## [1.3.3] - 2020-04-09

### Fixed

- Namespace becomes a dot - Fixed by [brunohenriquepj](https://github.com/brunohenriquepj)

## [1.3.2] - 2020-03-10

### Changed

- Updated package for current vscode

## [1.3.0] - 2017-03-01

### Added

- Ability to create property and read-only property from constructor

### Changed

- Fix for placing field outside class in some circumstances

## [1.2.1] - 2017-03-01

### Added

- Ability to turn "this" prefix on and off

### Changed

- Detect base classes for initializing members

## [1.2.0] - 2017-02-02

### Added

- Ability to create new class/interface if using csproj files on .Net Core

## [1.1.0] - 2016-11-25

### Added

- Initialize fields from constructor
- Initialize constructor from properties

## [1.0.9] - 2016-11-03

### Changed

- Bug fix for paths with spaces in them, creates namespace with underscore insteadnot sure

## [1.0.8] - 2016-10-28

### Changed

- Bug fix for paths with multiple hyphens

## [1.0.7] - 2016-10-18

### Changed

- Bug fix for extension of new file

## [1.0.6] - 2016-10-17

### Changed

- If no extension exists then it will add .cs on the end

## [1.0.5] - 2016-10-17

### Changed

- Ask only for filename instead of full path

## [1.0.4] - 2016-10-17

### Changed

- If path containes hyphen in path, make sure this becomes an underscore like VS

## [1.0.3] - 2016-10-16

### Changed

- Removed change log from release notes.md

## [1.0.2] - 2016-10-16

### Added

- Works on Windows

## [1.0.1] - 2016-10-14

### Added

- Can create class from root folder
- Templates can specifiy where cursor exists

## [1.0.0] - 2016-10-14

### Added

- Intial Release
