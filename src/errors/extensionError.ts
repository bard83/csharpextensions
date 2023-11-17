export class ExtensionError extends Error {
    protected _internalError: Error | unknown | undefined;

    constructor(message: string, internalError: Error | unknown | undefined = undefined) {
        super(message);

        this._internalError = internalError;
    }

    public getInternalError(): Error | unknown | undefined {
        return this._internalError;
    }
}
