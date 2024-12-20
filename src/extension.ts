import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
  const characters: vscode.QuickPickItem[] = [];

  for (let i = 33; i <= 255; i++) {
    const char = String.fromCharCode(i);
	if ( (i>=127 && i<=160) || (i===173)) {
		continue;
	}
      characters.push({
        label: i.toString(),
        description: char,
      });
    }
  


  let disposable = vscode.commands.registerCommand(
    'insert-ascii.printable',
    async () => {
      let result = await vscode.window.showQuickPick(characters, {
        canPickMany: false,
      });

      const editor = vscode.window.activeTextEditor;

      if (editor && result !== undefined) {
        const position = editor.selection.active;
        editor.edit((editBuilder) => {
          editBuilder.insert(position, result?.description ?? '');
        });
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
