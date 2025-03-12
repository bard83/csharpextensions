import * as path from 'path';

import { runTests, TestOptions } from '@vscode/test-electron';

async function main() {
    try {
        // The folder containing the Extension Manifest package.json
        // Passed to `--extensionDevelopmentPath`
        const extensionDevelopmentPath = path.resolve(__dirname, '../../');

        // The path to the extension test runner script
        // Passed to --extensionTestsPath
        const extensionTestsPath = path.resolve(__dirname, './suite');

        const testOptions: TestOptions = { extensionDevelopmentPath, extensionTestsPath, launchArgs: ['--disable-extensions'] };
        if (process.platform === 'win32') {
            testOptions.platform = 'win32-x64-archive';
        }

        await runTests(testOptions);
    } catch (err) {
        console.error(err);
        console.error('Failed to run tests');
        process.exit(1);
    }
}

main();
