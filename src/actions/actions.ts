import * as vscode from 'vscode'; 
import * as fs from 'fs'; 
import { ParsedLog } from '../types';
import { LOG_BEGIN_MESSAGE, LOG_END_MESSAGE } from '../globals';

export function createExtensionTerminal() {
	const extensionTerminal = vscode.window.createTerminal({
		name: 'cordo output',
		hideFromUser: false
	});

	extensionTerminal.show(true);

	return extensionTerminal;
}

export function parseLogsOutput(outputFilePath: string): ParsedLog[] {
	const outputFileContent = fs.readFileSync(outputFilePath).toString('utf8');

	const logBeginIndex = outputFileContent.indexOf(LOG_BEGIN_MESSAGE);
	const logEndIndex = outputFileContent.indexOf(LOG_END_MESSAGE);
	
	const logs = outputFileContent.slice(logBeginIndex + 14, logEndIndex);
	
	try {
		const parsedLogs = JSON.parse(logs);

		return parsedLogs.map(({ response, ...rest }: any) => rest);
	} catch (e) {
		vscode.window.showInformationMessage(
			'parseLogsOutput: An error occurred when parsing logs output',
			e.message
		);
		return [];
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

export async function saveFile() {
	await vscode.commands.executeCommand('workbench.action.files.save');
}

export async function clearFileContent() {
	await vscode.commands.executeCommand('selectAll');
	await vscode.commands.executeCommand('deleteLeft');
}

export function getTextStartPosition() {
	return new vscode.Position(0, 0);
}

export function storeExecutionLogsInFile(terminal: vscode.Terminal, fileName: string, outputFilePath: string) {
	terminal.sendText(`ts-node "${fileName}" > "${outputFilePath}"`);
	terminal.sendText('exit');
}