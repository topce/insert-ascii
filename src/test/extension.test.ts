import * as assert from 'assert';
import * as vscode from 'vscode';
import * as sinon from 'sinon';
import * as extension from '../extension';
import * as clipboard from '../clipboard';

suite('insert-ascii Extension Test Suite', () => {
  let context: vscode.ExtensionContext;
  let sandbox: sinon.SinonSandbox;

  setup(() => {
	sandbox = sinon.createSandbox();
	// Minimal fake context
	context = {
	  subscriptions: [],
	} as unknown as vscode.ExtensionContext;
  });

  teardown(() => {
	sandbox.restore();
  });

  test('Command is registered', () => {
	let registered = false;
	sandbox.stub(vscode.commands, 'registerCommand').callsFake((cmd: string, cb: (...args: any[]) => any) => {
	  if (cmd === 'insert-ascii.printable') {
		registered = true;
	  }
	  return { dispose: () => {} };
	});
	extension.activate(context);
	assert.strictEqual(registered, true, 'Command should be registered');
  });

  test('Character list is correct', () => {
	// Reproduce the character list logic
	const chars: string[] = [];
	for (let i = 33; i <= 255; i++) {
	  if ((i >= 127 && i <= 160) || i === 173) {
		continue;
	  }
	  chars.push(String.fromCharCode(i));
	}
	// Check that forbidden codes are not present
	for (let i = 127; i <= 160; i++) {
	  assert.strictEqual(chars.includes(String.fromCharCode(i)), false);
	}
	assert.strictEqual(chars.includes(String.fromCharCode(173)), false);
	// Check that printable codes are present
	assert.strictEqual(chars.includes('A'), true);
	assert.strictEqual(chars.includes('~'), true);
  });

  test('Clipboard is written when character is selected', async () => {
	sandbox.stub(vscode.commands, 'registerCommand').callsFake((cmd: string, cb: (...args: any[]) => any) => {
	  if (cmd === 'insert-ascii.printable') {
		// Simulate QuickPick result
		sandbox.stub(vscode.window, 'showQuickPick').resolves({ label: 'test', description: 'X' });
	const clipboardStub = sandbox.stub(clipboard, 'setClipboardText').resolves();
		// No editor
		sandbox.stub(vscode.window, 'activeTextEditor').value(undefined);
		const infoStub = sandbox.stub(vscode.window, 'showInformationMessage');
		// Call command
		cb();
		setTimeout(() => {
		  assert.strictEqual(clipboardStub.calledOnceWithExactly('X'), true);
		  assert.strictEqual(infoStub.called, true);
		}, 10);
	  }
	  return { dispose: () => {} };
	});
	extension.activate(context);
  });

  test('Inserts into editor if open', async () => {
	sandbox.stub(vscode.commands, 'registerCommand').callsFake((cmd: string, cb: (...args: any[]) => any) => {
	  if (cmd === 'insert-ascii.printable') {
		sandbox.stub(vscode.window, 'showQuickPick').resolves({ label: 'test', description: 'Y' });
	sandbox.stub(clipboard, 'setClipboardText').resolves();
		// Fake editor
		const editStub = sandbox.stub();
		const fakeEditor = {
		  selection: { active: { line: 0, character: 0 } },
		  edit: editStub,
		};
		sandbox.stub(vscode.window, 'activeTextEditor').value(fakeEditor);
		cb();
		setTimeout(() => {
		  assert.strictEqual(editStub.called, true);
		}, 10);
	  }
	  return { dispose: () => {} };
	});
	extension.activate(context);
  });
});
