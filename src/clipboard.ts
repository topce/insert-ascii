import * as vscode from 'vscode';

export async function setClipboardText(text: string): Promise<void> {
  await vscode.env.clipboard.writeText(text);
}
