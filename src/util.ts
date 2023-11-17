import { EOL } from 'os';

export const EMPTY = '';
export const SPACE = ' ';

export function getEolSetting(eol: string): string {
    switch (eol) {
        case '\n':
        case '\r\n':
            return eol;
        case 'auto':
        default:
            return EOL;
    }
}

export function getIndentation(tabSize: number, indentation: number, fillString = SPACE): string {
    return EMPTY.padStart((tabSize * indentation), fillString);
}
