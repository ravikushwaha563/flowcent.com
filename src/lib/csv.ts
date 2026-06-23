export function escapeCsvCell(value: unknown): string {
    let text = value === null || value === undefined ? '' : String(value);
    if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
    return `"${text.replace(/"/g, '""')}"`;
}

export function createCsv(headers: string[], rows: unknown[][]): string {
    return [headers, ...rows]
        .map(row => row.map(escapeCsvCell).join(','))
        .join('\r\n');
}
