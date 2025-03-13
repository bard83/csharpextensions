import { LogOutputChannel, window } from 'vscode';

export class Logger {
    private static output: LogOutputChannel;

    public static init(): void {
        Logger.output = window.createOutputChannel('C# Extension', { log: true });
    }

    public static error(error: string | Error): void {
        Logger.output.error(error);
    }

    public static warn(msg: string): void {
        Logger.output.warn(msg);
    }

    public static info(msg: string): void {
        Logger.output.info(msg);
    }

    public static debug(msg: string): void {
        Logger.output.debug(msg);
    }

    public static trace(msg: string): void {
        Logger.output.trace(msg);
    }
}
