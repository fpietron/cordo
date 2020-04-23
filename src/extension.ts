// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { syncBuiltinESMExports } from 'module';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed

const LOG_BEGIN_MESSAGE = '==NOCK BEGIN==';
const LOG_END_MESSAGE = '==NOCK END==';
const OUTPUT_FILE_PATH = path.join(vscode.workspace.rootPath!, 'output.txt');

export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// find commands in docs or keybindings.json
	// https://github.com/microsoft/vscode-extension-samples
	const disposable = vscode.commands.registerCommand('cordo.record', async (e) => {
		vscode.window.showInformationMessage('Recording...');

		const editor = vscode.window.activeTextEditor!;
		const extensionTerminal = createExtensionTerminal();

		const initialContent = editor.document.getText();
		const selectionStart = editor.selection.start;
		const selectionEnd = editor.selection.end;

		await editor.edit(textEditor => {
			insertRecordingInterface(textEditor, selectionStart, selectionEnd);
		});
		await saveFile();

		storeExecutionLogsInFile(extensionTerminal, editor.document.fileName, OUTPUT_FILE_PATH);


		vscode.window.onDidCloseTerminal(async terminal => {

			if (terminal.name === extensionTerminal.name) {
				console.log('Extension terminal finished!');
				await clearFileContent();
				await editor.edit(textEditor => {
					textEditor.insert(getTextStartPosition(), initialContent);
				});
				await saveFile();
				
				const parsedLogs = parseLogsOutput(OUTPUT_FILE_PATH);
				console.log(parsedLogs);

				fs.unlinkSync(OUTPUT_FILE_PATH);
				vscode.window.showInformationMessage('Recording finished.');
			}
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}


function createExtensionTerminal() {
	const extensionTerminal = vscode.window.createTerminal({
		name: 'cordo output',
		hideFromUser: false
	});

	extensionTerminal.show(true);

	return extensionTerminal;
}

function parseLogsOutput(outputFilePath: string) {
	const outputFileContent = fs.readFileSync(outputFilePath).toString('utf8');

	const logBeginIndex = outputFileContent.indexOf(LOG_BEGIN_MESSAGE);
	const logEndIndex = outputFileContent.indexOf(LOG_END_MESSAGE);
	
	const logs = outputFileContent.slice(logBeginIndex + 14, logEndIndex);
	
	try {
		const parsedLogs = JSON.parse(logs);

		return parsedLogs.map(({ response, ...rest }: any) => rest);
	} catch (e) {
		console.log('parseLogsOutput: An error occurred when parsing logs output', e.message);
	}
}

export function insertRecordingInterface(
	textEditor: vscode.TextEditorEdit,
	selectionStart: vscode.Position,
	selectionEnd: vscode.Position
) {
	textEditor.insert(selectionStart, `
	nock.recorder.rec({
	dont_print: true,
	output_objects: true
	});
	`);

	textEditor.insert(selectionEnd, `
	const objects = nock.recorder.play();
	console.log('==NOCK BEGIN==');
	console.log(JSON.stringify(objects));
	console.log('==NOCK END==');
	`);
		
	textEditor.insert(getTextStartPosition(), "import * as nock from 'nock';\n");
}

async function saveFile() {
	await vscode.commands.executeCommand('workbench.action.files.save');
}

async function clearFileContent() {
	await vscode.commands.executeCommand('selectAll');
	await vscode.commands.executeCommand('deleteLeft');
}

function getTextStartPosition() {
	return new vscode.Position(0, 0);
}

function storeExecutionLogsInFile(terminal: vscode.Terminal, fileName: string, outputFilePath: string) {
	terminal.sendText(`ts-node "${fileName}" > "${outputFilePath}"`);
	terminal.sendText('exit');
}

async function sleep(ms = 500) {
	await new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}