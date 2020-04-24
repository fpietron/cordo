// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { initResultsUi } from './ui/initResultsUi';
import {
	createExtensionTerminal,
	insertRecordingInterface,
	saveFile,
	storeExecutionLogsInFile,
	clearFileContent,
	getTextStartPosition,
	parseLogsOutput
} from './actions/actions';
import { OUTPUT_FILE_PATH } from './globals';
// this method is called when your extension is activated
// your extension is activated the very first time the command is executed



export function activate(context: vscode.ExtensionContext) {
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	// find commands in docs or keybindings.json
	// https://github.com/microsoft/vscode-extension-samples
	const disposable = vscode.commands.registerCommand('cordo.record', async (e) => {
		console.log('Initializing extension run.');
		vscode.window.showInformationMessage('Recording...');

		console.log('Instantiating active text editor...');
		const editor = vscode.window.activeTextEditor!;
		
		console.log('Instantiating extension terminal...');
		const extensionTerminal = createExtensionTerminal();

		console.log('Backing up initial content and selection position...');
		const initialContent = editor.document.getText();
		const selectionStart = editor.selection.start;
		const selectionEnd = editor.selection.end;

		console.log('Inserting recording interface...');
		await editor.edit(textEditor => {
			insertRecordingInterface(textEditor, selectionStart, selectionEnd);
		});
		await saveFile();

		console.log('Saving execution logs to file...');
		storeExecutionLogsInFile(extensionTerminal, editor.document.fileName, OUTPUT_FILE_PATH);

		vscode.window.onDidCloseTerminal(async terminal => {
			if (terminal.name === extensionTerminal.name) {
				console.log('Execution log save finished. Restoring original file content...');
				await clearFileContent();
				await editor.edit(textEditor => {
					textEditor.insert(getTextStartPosition(), initialContent);
				});
				await saveFile();
				
				console.log('Parsing execution log output...');
				const parsedLogs = parseLogsOutput(OUTPUT_FILE_PATH);
				console.log('Execution logs parsed!', parsedLogs);

				console.log('Initializing results UI...');
				initResultsUi(parsedLogs);

				console.log('Removing execution log file...');
				fs.unlinkSync(OUTPUT_FILE_PATH);
				vscode.window.showInformationMessage('Recording finished.');
			}
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

