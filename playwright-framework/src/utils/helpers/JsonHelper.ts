import * as path from 'path';
import * as fs from 'fs';

export interface JsonRow {
  [columnHeader: string]: string | number | boolean;
}

export interface JsonSheetData {
  sheetName: string;
  rows: JsonRow[];
}

export class JsonHelper {
  /**
   * Write rows to a JSON file.
   * Creates the output directory if it doesn't exist.
   */
  static writeJson(
    filePath: string,
    rows: JsonRow[]
  ): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf-8');
  }

  /**
   * Write multiple "sheets" into a single JSON file.
   * Structure: { "Users": [...rows], "Products": [...rows] }
   */
  static writeMultiSheetJson(
    filePath: string,
    sheets: { sheetName: string; rows: JsonRow[] }[]
  ): void {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const data: Record<string, JsonRow[]> = {};
    for (const { sheetName, rows } of sheets) {
      data[sheetName] = rows;
    }
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  }

  /**
   * Read all data rows from a JSON file.
   * Supports both flat array format and multi-sheet object format.
   * For multi-sheet, provide sheetName to get a specific sheet's rows.
   */
  static readJson(filePath: string, sheetName?: string): JsonRow[] {
    if (!fs.existsSync(filePath)) {
      throw new Error(`JSON file not found: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(content);

    // Flat array format
    if (Array.isArray(parsed)) {
      return parsed as JsonRow[];
    }

    // Multi-sheet object format
    if (sheetName) {
      const rows = parsed[sheetName];
      if (!rows) {
        throw new Error(`Sheet "${sheetName}" not found in ${filePath}`);
      }
      return rows as JsonRow[];
    }

    // No sheetName → return first sheet's rows
    const keys = Object.keys(parsed);
    if (keys.length === 0) return [];
    return parsed[keys[0]] as JsonRow[];
  }

  /**
   * Read a specific column from the JSON file as an array.
   */
  static readColumn(
    filePath: string,
    columnHeader: string,
    sheetName?: string
  ): (string | number | boolean)[] {
    const allRows = JsonHelper.readJson(filePath, sheetName);
    return allRows.map((row) => row[columnHeader]).filter((v) => v !== undefined);
  }
}
