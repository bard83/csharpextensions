import * as vscode from 'vscode';

export async function openFile(filePath: string, cursorPosition: vscode.Position | undefined): Promise<vscode.Uri> {
    const openedDoc = await vscode.workspace.openTextDocument(filePath);
    const editor = await vscode.window.showTextDocument(openedDoc, { preview: false });

    if (cursorPosition) {
        const newSelection = new vscode.Selection(cursorPosition, cursorPosition);

        editor.selection = newSelection;
    }

    return editor.document.uri;
}

export async function formatDocument(documentUri: vscode.Uri) {
    const configuration = vscode.workspace.getConfiguration();
    const tabSize = configuration.get('editor.tabSize', 4);
    const insertSpaces = configuration.get('editor.insertSpaces', true);
    // refs https://microsoft.github.io/language-server-protocol/specifications/lsp/3.17/specification/#formattingOptions
    const formattingOptions = {
        tabSize,
        insertSpaces,
    };
    const formattingEdits = await vscode.commands.executeCommand<vscode.TextEdit[]>('vscode.executeFormatDocumentProvider', documentUri, formattingOptions);

    if (formattingEdits !== undefined) {
        const formatEdit = new vscode.WorkspaceEdit();

        formatEdit.set(documentUri, formattingEdits);

        vscode.workspace.applyEdit(formatEdit);
    }
}
