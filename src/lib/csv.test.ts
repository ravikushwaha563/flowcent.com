import { describe, expect, it } from 'vitest';
import { createCsv, escapeCsvCell } from './csv';

describe('CSV export', () => {
    it('quotes delimiters and double quotes', () => {
        expect(escapeCsvCell('Acme, "India"')).toBe('"Acme, ""India"""');
    });

    it('neutralizes spreadsheet formulas in user-controlled cells', () => {
        expect(escapeCsvCell('=HYPERLINK("https://example.com")')).toBe('"\'=HYPERLINK(""https://example.com"")"');
        expect(escapeCsvCell('+123')).toBe('"\'+123"');
    });

    it('uses CRLF rows for spreadsheet compatibility', () => {
        expect(createCsv(['A', 'B'], [['one', 'two']])).toBe('"A","B"\r\n"one","two"');
    });
});
