import { promises as fs } from 'fs';
import { join } from 'path';
import MultiStepInput from './multiStepInput';


/**
 * A multi-step input using window.createQuickPick() and window.createInputBox().
 * 
 * This first part uses the helper class `MultiStepInput` that wraps the API for the multi-step case.
 */
export async function showMultiStepInputFilename(params: MultiStepInputFilenameParameters): Promise<Partial<State>> {

    const { title, inputValue, filePath, rootPath } = params;

    async function collectInputs(totalSteps: number) {
        const state = {} as Partial<State>;
        state.totalSteps = totalSteps;
        await MultiStepInput.run(input => inputFilePath(input, state));
        const currentPath = join(rootPath, state.path ?? '');
        state.path = currentPath;

        return state as State;
    }

    async function inputFilePath(input: MultiStepInput, state: Partial<State>) {
        if (filePath) {
            state.path = filePath;

            return (input: MultiStepInput) => inputFileName(input, state);
        }

        const inputFilePath = await input.showInputBox({
            title,
            ignoreFocusOut: true,
            step: 1,
            totalSteps: state.totalSteps as number,
            value: '',
            prompt: 'Insert the file path',
            validate: validateFilePath,
        });

        state.path = inputFilePath;

        return (input: MultiStepInput) => inputFileName(input, state);
    }

    async function inputFileName(input: MultiStepInput, state: Partial<State>) {
        state.name = await input.showInputBox({
            title,
            ignoreFocusOut: true,
            step: !filePath ? 2 : 1,
            totalSteps: state.totalSteps as number,
            value: inputValue,
            prompt: 'Please enter a name for the new file(s)',
            validate: validateFileName,
        });
    }

    async function validateFilePath(inputPath: string): Promise<string | undefined> {
        const currentPath = join(rootPath, inputPath);
        try {
            await fs.access(currentPath);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {

            return `${inputPath} does not exist in ${rootPath}`;
        }

        try {
            if (!(await fs.lstat(currentPath)).isDirectory()) {
                return `${inputPath} is not a folder`;
            }

        } catch (error) {
            return (error as Error).message;
        }

        return undefined;
    }

    function validateFileName(inputValue: string): Promise<string | undefined> {
        if (typeof inputValue === 'undefined' || inputValue.trim() === '') {
            return Promise.resolve('Filename request: User did not provide any input');
        }

        return Promise.resolve(undefined);
    }

    return await collectInputs(!filePath ? 2 : 1);
}
