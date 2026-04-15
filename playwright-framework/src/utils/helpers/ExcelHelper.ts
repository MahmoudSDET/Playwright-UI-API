import ExcelJS from 'exceljs';
import * as path from 'path';
import * as fs from 'fs';

export interface ExcelRow {
  [columnHeader: string]: string | number | boolean;
}

export class ExcelHelper {
  /**
   * Write rows to an Excel file with the given headers.
   * Creates the output directory if it doesn't exist.
   */
  static async writeExcel(
    filePath: string,
    sheetName: string,
    headers: string[],
    rows: ExcelRow[]
  ): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet(sheetName);

    // Set columns
    sheet.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

    // Style the header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true };
    headerRow.alignment = { horizontal: 'center' };

    // Add data rows
    for (const row of rows) {
      sheet.addRow(row);
    }

    await workbook.xlsx.writeFile(filePath);
  }

  /**
   * Write multiple sheets into a single Excel file.
   * Each entry defines a sheet name, headers, and rows.
   */
  static async writeMultiSheetExcel(
    filePath: string,
    sheets: { sheetName: string; headers: string[]; rows: ExcelRow[] }[]
  ): Promise<void> {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    const workbook = new ExcelJS.Workbook();

    for (const { sheetName, headers, rows } of sheets) {
      const sheet = workbook.addWorksheet(sheetName);
      sheet.columns = headers.map((h) => ({ header: h, key: h, width: 20 }));

      const headerRow = sheet.getRow(1);
      headerRow.font = { bold: true };
      headerRow.alignment = { horizontal: 'center' };

      for (const row of rows) {
        sheet.addRow(row);
      }
    }

    await workbook.xlsx.writeFile(filePath);
  }

  /**
   * Read all data rows from an Excel file, returning an array of
   * key-value objects where keys are the column headers.
   */
  static async readExcel(
    filePath: string,
    sheetName?: string
  ): Promise<ExcelRow[]> {
    if (!fs.existsSync(filePath)) {
      throw new Error(`Excel file not found: ${filePath}`);
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const sheet = sheetName
      ? workbook.getWorksheet(sheetName)
      : workbook.worksheets[0];

    if (!sheet) {
      throw new Error(
        `Worksheet "${sheetName ?? 'default'}" not found in ${filePath}`
      );
    }

    const headers: string[] = [];
    sheet.getRow(1).eachCell((cell, colNumber) => {
      headers[colNumber] = String(cell.value);
    });

    const rows: ExcelRow[] = [];
    sheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // skip header
      const obj: ExcelRow = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (header) {
          obj[header] = cell.value as string | number | boolean;
        }
      });
      // Only add if the row has data
      if (Object.keys(obj).length > 0) {
        rows.push(obj);
      }
    });

    return rows;
  }

  /**
   * Read a specific column from the Excel file as an array.
   */
  static async readColumn(
    filePath: string,
    columnHeader: string,
    sheetName?: string
  ): Promise<(string | number | boolean)[]> {
    const allRows = await ExcelHelper.readExcel(filePath, sheetName);
    return allRows.map((row) => row[columnHeader]).filter((v) => v !== undefined);
  }
}
