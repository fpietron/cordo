import { ParsedLog } from '../types';

export function LogTableRows(parsedLogs: ParsedLog[]) {
	return parsedLogs.map(eachLoggedActivity => `
				<tr>
					<td>${eachLoggedActivity.method}</td>
					<td>${eachLoggedActivity.scope}${eachLoggedActivity.path}</td>
					<td style="color: ${eachLoggedActivity.status < 400 ? 'green' : 'red'}>
						<strong>
							${eachLoggedActivity.status}
						</strong>
					</td>
					<td>${eachLoggedActivity.body || '-'}</td>
				</tr>
					`).join('\n');
}