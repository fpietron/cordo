import * as vscode from 'vscode';
import { ParsedLog } from '../types';
import { Layout } from './Layout';

export function initResultsUi(parsedLogs: ParsedLog[]) {
  const resultsPanel = vscode.window.createWebviewPanel(
    'cordoResults',
    `API Recording results (${parsedLogs.length})`,
    vscode.ViewColumn.Beside,
    {}
  );

  resultsPanel.webview.html = Layout(parsedLogs);
}