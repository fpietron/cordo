import * as path from 'path';
import * as vscode from 'vscode';

export const LOG_BEGIN_MESSAGE = '==NOCK BEGIN==';
export const LOG_END_MESSAGE = '==NOCK END==';
export const OUTPUT_FILE_PATH = path.join(vscode.workspace.rootPath!, 'output.txt');