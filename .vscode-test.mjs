import { defineConfig } from '@vscode/test-cli';
import { globSync } from 'glob';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const createTestEntry = label => ({
	label: `${label} Tests`,
	files: globSync('**/*.test.js', {
		cwd: path.join(__dirname, 'out/test/suite', label.toLowerCase()),
		absolute: true
	}),
	version: process.env['VSCODE_VERSION'] ?? 'stable',
	launchArgs: ['--disable-updates', '--disable-crash-reporter', '--disable-workspace-trust', '--disable-telemetry'],
	mocha: {
		ui: 'tdd',
		color: true,
		timeout: 20000,
		require: 'ts-node/register',
		loader: 'ts-node/esm',
		reporter: path.join(__dirname, '.mocha-multi-reporter.cjs'),
		reporterOptions: {
			jsonReporterOptions: {
				output: path.join(__dirname, 'test-results', `mocha-${label.toLowerCase()}-tests.json`)
			}
		}
	}
});

export default defineConfig({
	srcDir: path.join(__dirname, 'out/src'),
	tests: ['E2E', 'Exploratory', 'Integration', 'UI', 'Unit'].map(createTestEntry),
	coverage: {
		includeAll: true,
		exclude: [
			'**/test/**',
			'**/dist/**',
			`${path.join(__dirname, 'src')}${path.sep}**`,
			'**/node_modules/**',
			'**/.mocha-multi-reporter.cjs'
		],
		reporter: ['text', 'lcov'] // "lcov" also generates a HTML report.
	}
});
