import { LogTableRows } from './LogTableRows';
import { ParsedLog } from '../types';


export function Layout(parsedLogs: ParsedLog[]) {
	const logTableRows = LogTableRows(parsedLogs);
  return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>API Recording results: ${parsedLogs.length}</title>
</head>
<body>
		<table style="width: 100%;">
			<tr>
				<th>HTTP Method</th>
				<th>URL</th>
				<th>Status</th>
				<th>Body</th>
			</tr>
			<tbody>
				${logTableRows}
			</tbody>
		</table>
</body>
</html>`;
}