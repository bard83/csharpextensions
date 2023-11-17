import { EOL } from 'os';

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
