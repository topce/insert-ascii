
import * as vscode from 'vscode';
import { setClipboardText } from './clipboard';

export function activate(context: vscode.ExtensionContext) {
  const characters: vscode.QuickPickItem[] = [];
  let lastFocusedElement: 'terminal' | 'editor' | null = null;

  // Track focus changes
  vscode.window.onDidChangeActiveTerminal(() => {
    lastFocusedElement = 'terminal';
  });

  vscode.window.onDidChangeActiveTextEditor(() => {
    lastFocusedElement = 'editor';
  });

  // Initialize last focused element
  if (vscode.window.activeTerminal) {
    lastFocusedElement = 'terminal';
  } else if (vscode.window.activeTextEditor) {
    lastFocusedElement = 'editor';
  }

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
        const char = result.description ?? '';

        // Always copy to clipboard
        await setClipboardText(char);
        vscode.window.showInformationMessage(`Character "${char}" inserted into ${lastFocusedElement}.`);

        // Insert into last focused element
        if (lastFocusedElement === 'terminal' && vscode.window.activeTerminal) {
          vscode.window.activeTerminal.sendText(char, false);
        } else if (lastFocusedElement === 'editor' && vscode.window.activeTextEditor) {
          const editor = vscode.window.activeTextEditor;
          const position = editor.selection.active;
          editor.edit((editBuilder) => {
            editBuilder.insert(position, char);
          });
        } else {
          // Fallback: try current active elements
          const terminal = vscode.window.activeTerminal;
          const editor = vscode.window.activeTextEditor;

          if (terminal) {
            terminal.sendText(char, false);
          } else if (editor) {
            const position = editor.selection.active;
            editor.edit((editBuilder) => {
              editBuilder.insert(position, char);
            });
          } else {
            vscode.window.showInformationMessage('Character copied to clipboard. Paste it anywhere, including the terminal or editor.');
          }
        }
      }
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
