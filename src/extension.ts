
import * as vscode from 'vscode';
import { setClipboardText } from './clipboard';

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

      if (result !== undefined) {
        // Copy to clipboard using helper
        await setClipboardText(result.description ?? '');

        // Try to insert into editor if possible
        const editor = vscode.window.activeTextEditor;
        if (editor) {
          const position = editor.selection.active;
          editor.edit((editBuilder) => {
            editBuilder.insert(position, result.description ?? '');
          });
        } else {
          vscode.window.showInformationMessage('Character copied to clipboard. Paste it anywhere, including the terminal or search tab.');
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
