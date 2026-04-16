import * as path from 'path';
import * as fs from 'fs';

export interface CsvRow {
  [columnHeader: string]: string | number | boolean;
}

export class CsvHelper {
  /**
   * Write rows to a CSV file with the given headers.
   * Creates the output directory if it doesn't exist.
   */
  static writeCsv(
    filePath: string,
    headers: string[],
    rows: CsvRow[]
  ): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const lines: string[] = [];
    // Header line
    lines.push(headers.map((h) => CsvHelper.escapeField(String(h))).join(','));

    // Data rows
    for (const row of rows) {
      const values = headers.map((h) => CsvHelper.escapeField(String(row[h] ?? '')));
      lines.push(values.join(','));
    }

    fs.writeFileSync(filePath, lines.join('\n'), 'utf-8');
  }

  /**
   * Write multiple "sheets" into a single CSV file.
   * Each sheet is separated by a marker line: --- SheetName ---
   */
  static writeMultiSheetCsv(
    filePath: string,
    sheets: { sheetName: string; headers: string[]; rows: CsvRow[] }[]
  ): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const sections: string[] = [];
    for (const { sheetName, headers, rows } of sheets) {
      const lines: string[] = [];
      lines.push(`--- ${sheetName} ---`); // EN: Sheet separator marker
      lines.push(headers.map((h) => CsvHelper.escapeField(String(h))).join(','));
      for (const row of rows) {
        const values = headers.map((h) => CsvHelper.escapeField(String(row[h] ?? '')));
        lines.push(values.join(','));
      }
      sections.push(lines.join('\n'));
    }

    fs.writeFileSync(filePath, sections.join('\n'), 'utf-8');
  }

  /**
   * Read rows for a specific sheet from a multi-sheet CSV file.
   * Looks for the section marker "--- sheetName ---" and reads rows until next marker or EOF.
   */
  static readMultiSheetCsv(filePath: string, sheetName: string): CsvRow[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8').trim();
    const lines = content.split(/\r?\n/);
    const marker = `--- ${sheetName} ---`;

    // EN: Find the marker line for the requested sheet
    let startIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      if (lines[i].trim() === marker) {
        startIdx = i;
        break;
      }
    }
    if (startIdx === -1) {
      throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);
    }

    // EN: Header line is right after the marker
    const headers = CsvHelper.parseLine(lines[startIdx + 1]);
    const rows: CsvRow[] = [];

    // EN: Read data rows until next marker or EOF
    for (let i = startIdx + 2; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      if (/^--- .+ ---$/.test(line)) break; // EN: Next sheet marker → stop
      const values = CsvHelper.parseLine(line);
      const obj: CsvRow = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = CsvHelper.parseValue(values[j] ?? '');
      }
      rows.push(obj);
    }

    return rows;
  }

  /**
   * Read all data rows from a CSV file, returning an array of
   * key-value objects where keys are the column headers.
   */
  static readCsv(filePath: string): CsvRow[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`CSV file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8').trim();
    const lines = content.split(/\r?\n/);
    if (lines.length === 0) return [];

    const headers = CsvHelper.parseLine(lines[0]);
    const rows: CsvRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      const values = CsvHelper.parseLine(line);
      const obj: CsvRow = {};
      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = CsvHelper.parseValue(values[j] ?? '');
      }
      rows.push(obj);
    }

    return rows;
  }

  /**
   * Read a specific column from the CSV file as an array.
   */
  static readColumn(
    filePath: string,
    columnHeader: string
  ): (string | number | boolean)[] {
    const allRows = CsvHelper.readCsv(filePath);
    return allRows.map((row) => row[columnHeader]).filter((v) => v !== undefined);
  }

  // ── Private helpers ──────────────────────────────────

  /**
   * Escape a single CSV field: wrap in quotes if it contains comma, quote, or newline.
   */
  private static escapeField(value: string): string {
    if (/[,"\r\n]/.test(value)) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    return value;
  }

  /**
   * Parse a single CSV line respecting quoted fields.
   */
  private static parseLine(line: string): string[] {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"') {
          if (i + 1 < line.length && line[i + 1] === '"') {
            current += '"';
            i++; // skip escaped quote
          } else {
            inQuotes = false;
          }
        } else {
          current += ch;
        }
      } else {
        if (ch === '"') {
          inQuotes = true;
        } else if (ch === ',') {
          fields.push(current);
          current = '';
        } else {
          current += ch;
        }
      }
    }
    fields.push(current);
    return fields;
  }

  /**
   * Auto-detect and parse a string value into number or boolean if applicable.
   */
  private static parseValue(value: string): string | number | boolean {
    if (value === 'true') return true;
    if (value === 'false') return false;
    const num = Number(value);
    if (value !== '' && !isNaN(num)) return num;
    return value;
  }
}
