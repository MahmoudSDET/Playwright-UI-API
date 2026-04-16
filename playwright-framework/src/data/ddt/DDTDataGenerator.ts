// EN: Import Node.js path module for resolving file paths
import * as path from 'path';
// EN: Import Node.js file system module for reading/writing files
import * as fs from 'fs';
// EN: Import Node.js crypto module for SHA-256 hashing
import * as crypto from 'crypto';
// EN: Import ExcelHelper utility for Excel read/write operations and the ExcelRow type
import { ExcelHelper, ExcelRow } from '../../utils/helpers/ExcelHelper';
// EN: Import CsvHelper utility for CSV read/write operations
import { CsvHelper, CsvRow } from '../../utils/helpers/CsvHelper';
// EN: Import JsonHelper utility for JSON read/write operations
import { JsonHelper, JsonRow } from '../../utils/helpers/JsonHelper';
// EN: Import the DDT configuration file (sheets, columns, rowCount, outputDir)
import ddtConfig from './ddt-config.json';

// EN: Supported output formats for DDT data generation
export type OutputFormat = 'excel' | 'csv' | 'json';

// EN: Union type for row data across all formats
export type DataRow = ExcelRow | CsvRow | JsonRow;

// EN: Name of the file used to store the config hash for change detection
const CONFIG_HASH_FILE = '.config-hash';

// EN: Interface defining a single column's generation rules
export interface ColumnDef {
  header: string;       // EN: Column header name in the Excel sheet
  startWord: string;    // EN: Prefix used when generating cell values
  type: 'sequential' | 'email' | 'phone' | 'number' | 'boolean' | 'pick'; // EN: Value generation strategy
  min?: number;         // EN: Minimum value for 'number' type columns
  max?: number;         // EN: Maximum value for 'number' type columns
  pickList?: string[];  // EN: List of values to round-robin for 'pick' type columns
}

// EN: Interface defining a sheet's name and its column definitions
export interface SheetConfig {
  sheetName: string;      // EN: Name of the Excel sheet tab
  columns: ColumnDef[];   // EN: Array of column definitions for this sheet
}

// EN: Interface defining the full DDT configuration structure
export interface DDTConfig {
  outputDir: string;      // EN: Relative directory path for generated data files
  fileName: string;       // EN: Name of the generated data file (Excel default)
  csvFileName?: string;   // EN: Name of the generated CSV base file (optional)
  jsonFileName?: string;  // EN: Name of the generated JSON file (optional)
  rowCount: number;       // EN: Number of rows to generate per sheet
  sheets: SheetConfig[];  // EN: Array of sheet configurations
}

/**
 * Generates a cell value based on the column definition and row index.
 *   - sequential : startWord + rowIndex  (e.g. "User1", "User2")
 *   - email      : startWord + rowIndex + @test.com
 *   - phone      : startWord + random 8-digit suffix
 *   - number     : random integer between min..max
 *   - boolean    : alternates true / false based on row index
 *   - pick       : round-robin from pickList
 */
function generateValue(col: ColumnDef, rowIndex: number): string | number | boolean {
  switch (col.type) {
    // EN: Concatenate startWord + rowIndex → e.g. "User1", "User2"
    case 'sequential':
      return `${col.startWord}${rowIndex}`;

    // EN: Concatenate startWord + rowIndex + "@test.com" → e.g. "testuser1@test.com"
    case 'email':
      return `${col.startWord}${rowIndex}@test.com`;

    // EN: Concatenate startWord + random 8-digit number → e.g. "0512345678"
    case 'phone': {
      const suffix = Math.floor(10000000 + Math.random() * 90000000).toString(); // EN: Generate random 8-digit suffix
      return `${col.startWord}${suffix}`;
    }

    // EN: Generate a random integer between min and max (inclusive)
    case 'number': {
      const min = col.min ?? 1;   // EN: Default minimum is 1 if not specified
      const max = col.max ?? 100; // EN: Default maximum is 100 if not specified
      return Math.floor(min + Math.random() * (max - min + 1)); // EN: Random int in [min, max]
    }

    // EN: Alternate true/false based on whether rowIndex is even or odd
    case 'boolean':
      return rowIndex % 2 === 0;

    // EN: Round-robin pick from the pickList array using modulo
    case 'pick': {
      const list = col.pickList ?? [col.startWord]; // EN: Fall back to startWord if no pickList
      return list[rowIndex % list.length];           // EN: Cycle through the list
    }

    // EN: Fallback — same as sequential for any unknown type
    default:
      return `${col.startWord}${rowIndex}`;
  }
}

/**
 * Generate rows for one sheet based on its column definitions.
 */
function generateRows(columns: ColumnDef[], rowCount: number): ExcelRow[] {
  const rows: ExcelRow[] = []; // EN: Initialize empty array to collect generated rows
  for (let i = 1; i <= rowCount; i++) { // EN: Loop from 1 to rowCount (1-based indexing)
    const row: ExcelRow = {}; // EN: Create an empty row object for this iteration
    for (const col of columns) { // EN: Iterate over each column definition
      row[col.header] = generateValue(col, i); // EN: Generate the cell value and assign it to the column header key
    }
    rows.push(row); // EN: Add the completed row to the rows array
  }
  return rows; // EN: Return all generated rows
}

/**
 * Generate Excel files for ALL sheets defined in ddt-config.json.
 * Returns the absolute paths of the generated files.
 */
export async function generateAllExcelData(
  configOverride?: Partial<DDTConfig>, // EN: Optional partial config to override base settings (e.g. rowCount)
  outputPath?: string                  // EN: Optional custom output file path (used for worker-unique files)
): Promise<string> {
  const config: DDTConfig = { ...ddtConfig, ...configOverride } as DDTConfig; // EN: Merge base config with any overrides
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir); // EN: Resolve the absolute path to the output directory
  const filePath = outputPath ?? path.resolve(baseDir, config.fileName); // EN: Use custom path or default to outputDir/fileName

  // EN: Map each sheet config into the format expected by writeMultiSheetExcel
  const sheets = config.sheets.map((sheet) => ({
    sheetName: sheet.sheetName,                    // EN: Sheet tab name
    headers: sheet.columns.map((c) => c.header),   // EN: Extract header names from column definitions
    rows: generateRows(sheet.columns, config.rowCount), // EN: Generate all rows for this sheet
  }));

  await ExcelHelper.writeMultiSheetExcel(filePath, sheets); // EN: Write all sheets into a single Excel file
  console.log(`✔ Generated ${config.sheets.length} sheets (${config.rowCount} rows each) → ${filePath}`); // EN: Log success message
  return filePath; // EN: Return the absolute path of the generated file
}

// ══════════════════════════════════════════════════════════
// CSV Generation & Reading
// ══════════════════════════════════════════════════════════

/**
 * Generate CSV files for ALL sheets defined in ddt-config.json.
 * Each sheet becomes a separate CSV file: <baseName>_<sheetName>.csv
 * Returns the absolute path of the generated CSV file.
 */
export function generateAllCsvData(
  configOverride?: Partial<DDTConfig>, // EN: Optional partial config to override base settings
  outputPath?: string                  // EN: Optional custom output file path
): string {
  const config: DDTConfig = { ...ddtConfig, ...configOverride } as DDTConfig; // EN: Merge base config with any overrides
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir); // EN: Resolve the absolute path to the output directory
  const csvFileName = config.csvFileName ?? config.fileName.replace(/\.xlsx?$/, '.csv'); // EN: Derive CSV filename from Excel filename if not specified
  const filePath = outputPath ?? path.resolve(baseDir, csvFileName); // EN: Use custom path or default

  // EN: Map each sheet config into the format expected by writeMultiSheetCsv
  const sheets = config.sheets.map((sheet) => ({
    sheetName: sheet.sheetName,                    // EN: Sheet tab name
    headers: sheet.columns.map((c) => c.header),   // EN: Extract header names
    rows: generateRows(sheet.columns, config.rowCount), // EN: Generate all rows for this sheet
  }));

  CsvHelper.writeMultiSheetCsv(filePath, sheets); // EN: Write all sheets into a single CSV file
  console.log(`✔ Generated ${config.sheets.length} sheets in CSV (${config.rowCount} rows each) → ${filePath}`);
  return filePath; // EN: Return the file path
}

/**
 * Generate CSV for a single sheet by name from the config.
 */
export function generateCsvForSheet(
  sheetName: string,          // EN: Name of the sheet to generate
  rowCountOverride?: number,  // EN: Optional custom row count
  outputPath?: string         // EN: Optional custom output file path
): string {
  const config = ddtConfig as DDTConfig;
  const sheetConfig = config.sheets.find((s) => s.sheetName === sheetName);
  if (!sheetConfig) {
    throw new Error(`Sheet "${sheetName}" not found in ddt-config.json`);
  }

  const count = rowCountOverride ?? config.rowCount;
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir);
  const csvFileName = config.csvFileName ?? config.fileName.replace(/\.xlsx?$/, '.csv');
  const filePath = outputPath ?? path.resolve(baseDir, csvFileName);
  const headers = sheetConfig.columns.map((c) => c.header);
  const rows = generateRows(sheetConfig.columns, count);

  CsvHelper.writeCsv(filePath, headers, rows); // EN: Write single sheet CSV
  console.log(`✔ Generated ${count} rows (CSV sheet: ${sheetName}) → ${filePath}`);
  return filePath;
}

/**
 * Read all rows back from a generated CSV file by sheet name.
 */
export function readGeneratedCsv(sheetName: string, customPath?: string): CsvRow[] {
  const config = ddtConfig as DDTConfig;
  const sheetConfig = config.sheets.find((s) => s.sheetName === sheetName);
  if (!sheetConfig) {
    throw new Error(`Sheet "${sheetName}" not found in ddt-config.json`);
  }

  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir);
  const csvFileName = config.csvFileName ?? config.fileName.replace(/\.xlsx?$/, '.csv');
  const filePath = customPath ?? path.resolve(baseDir, csvFileName);
  return CsvHelper.readMultiSheetCsv(filePath, sheetConfig.sheetName); // EN: Read specific sheet from single CSV file
}

// ══════════════════════════════════════════════════════════
// JSON Generation & Reading
// ══════════════════════════════════════════════════════════

/**
 * Generate a JSON file for ALL sheets defined in ddt-config.json.
 * Structure: { "Users": [...rows], "Products": [...rows] }
 * Returns the absolute path of the generated JSON file.
 */
export function generateAllJsonData(
  configOverride?: Partial<DDTConfig>, // EN: Optional partial config to override base settings
  outputPath?: string                  // EN: Optional custom output file path
): string {
  const config: DDTConfig = { ...ddtConfig, ...configOverride } as DDTConfig;
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir);
  const jsonFileName = config.jsonFileName ?? config.fileName.replace(/\.xlsx?$/, '.json'); // EN: Derive JSON filename
  const filePath = outputPath ?? path.resolve(baseDir, jsonFileName);

  // EN: Map each sheet config into the format expected by writeMultiSheetJson
  const sheets = config.sheets.map((sheet) => ({
    sheetName: sheet.sheetName,
    rows: generateRows(sheet.columns, config.rowCount),
  }));

  JsonHelper.writeMultiSheetJson(filePath, sheets); // EN: Write all sheets into one JSON file
  console.log(`✔ Generated ${config.sheets.length} sheets (${config.rowCount} rows each) → ${filePath}`);
  return filePath;
}

/**
 * Generate JSON for a single sheet by name from the config.
 * Writes a flat array of rows to the JSON file.
 */
export function generateJsonForSheet(
  sheetName: string,
  rowCountOverride?: number,
  outputPath?: string
): string {
  const config = ddtConfig as DDTConfig;
  const sheetConfig = config.sheets.find((s) => s.sheetName === sheetName);
  if (!sheetConfig) {
    throw new Error(`Sheet "${sheetName}" not found in ddt-config.json`);
  }

  const count = rowCountOverride ?? config.rowCount;
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir);
  const jsonFileName = config.jsonFileName ?? config.fileName.replace(/\.xlsx?$/, `.${sheetName}.json`);
  const filePath = outputPath ?? path.resolve(baseDir, jsonFileName);
  const rows = generateRows(sheetConfig.columns, count);

  JsonHelper.writeJson(filePath, rows); // EN: Write single-sheet JSON
  console.log(`✔ Generated ${count} rows (JSON sheet: ${sheetName}) → ${filePath}`);
  return filePath;
}

/**
 * Read all rows back from a generated JSON file by sheet name.
 */
export function readGeneratedJson(sheetName: string, customPath?: string): JsonRow[] {
  const config = ddtConfig as DDTConfig;
  const sheetConfig = config.sheets.find((s) => s.sheetName === sheetName);
  if (!sheetConfig) {
    throw new Error(`Sheet "${sheetName}" not found in ddt-config.json`);
  }

  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir);
  const jsonFileName = config.jsonFileName ?? config.fileName.replace(/\.xlsx?$/, '.json');
  const filePath = customPath ?? path.resolve(baseDir, jsonFileName);
  return JsonHelper.readJson(filePath, sheetConfig.sheetName);
}

// ══════════════════════════════════════════════════════════
// Unified Multi-Format Generation
// ══════════════════════════════════════════════════════════

/**
 * Generate data files in the specified format (excel, csv, or json).
 * Delegates to the format-specific generator.
 */
export async function generateAllData(
  format: OutputFormat,
  configOverride?: Partial<DDTConfig>,
  outputPath?: string
): Promise<string> {
  switch (format) {
    case 'excel':
      return generateAllExcelData(configOverride, outputPath);
    case 'csv':
      return generateAllCsvData(configOverride, outputPath);
    case 'json':
      return generateAllJsonData(configOverride, outputPath);
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}

/**
 * Read rows from a generated data file in the specified format.
 */
export async function readGeneratedData(
  format: OutputFormat,
  sheetName: string,
  customPath?: string
): Promise<DataRow[]> {
  switch (format) {
    case 'excel':
      return readGeneratedExcel(sheetName, customPath);
    case 'csv':
      return readGeneratedCsv(sheetName, customPath);
    case 'json':
      return readGeneratedJson(sheetName, customPath);
    default:
      throw new Error(`Unsupported output format: ${format}`);
  }
}

/**
 * Generate Excel for a single sheet by name from the config.
 */
export async function generateExcelForSheet(
  sheetName: string,          // EN: Name of the sheet to generate (must exist in config)
  rowCountOverride?: number,  // EN: Optional custom row count to override config default
  outputPath?: string         // EN: Optional custom output file path
): Promise<string> {
  const config = ddtConfig as DDTConfig; // EN: Load the base DDT config
  const sheetConfig = config.sheets.find((s) => s.sheetName === sheetName); // EN: Find the matching sheet definition
  if (!sheetConfig) {
    throw new Error(`Sheet "${sheetName}" not found in ddt-config.json`); // EN: Throw if sheet name doesn't exist in config
  }

  const count = rowCountOverride ?? config.rowCount; // EN: Use override row count or fall back to config default
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir); // EN: Resolve absolute output directory
  const filePath = outputPath ?? path.resolve(baseDir, config.fileName); // EN: Use custom path or default
  const headers = sheetConfig.columns.map((c) => c.header); // EN: Extract column headers from sheet config
  const rows = generateRows(sheetConfig.columns, count); // EN: Generate the specified number of rows

  await ExcelHelper.writeExcel(filePath, sheetConfig.sheetName, headers, rows); // EN: Write single sheet to Excel file
  console.log(`✔ Generated ${count} rows (sheet: ${sheetName}) → ${filePath}`); // EN: Log success message
  return filePath; // EN: Return the absolute path of the generated file
}

/**
 * Compute SHA-256 hash of the effective config (base + optional override).
 */
function getConfigHash(configOverride?: Partial<DDTConfig>): string {
  const config: DDTConfig = { ...ddtConfig, ...configOverride } as DDTConfig; // EN: Merge base config with overrides
  return crypto.createHash('sha256').update(JSON.stringify(config)).digest('hex'); // EN: Hash the serialized config and return hex string
}

/**
 * Check whether the config has changed since the last generation.
 * Returns true if the original file is missing, hash file is missing,
 * or the stored hash differs from the current config hash.
 */
export function isConfigChanged(configOverride?: Partial<DDTConfig>): boolean {
  const config: DDTConfig = { ...ddtConfig, ...configOverride } as DDTConfig; // EN: Merge base config with overrides
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir); // EN: Resolve absolute output directory
  const hashFilePath = path.resolve(baseDir, CONFIG_HASH_FILE); // EN: Path to the stored hash file
  const originalFilePath = path.resolve(baseDir, config.fileName); // EN: Path to the original generated Excel file

  // EN: If the original file doesn't exist, treat as changed (needs generation)
  if (!fs.existsSync(originalFilePath)) return true;
  // EN: If no hash file exists, treat as changed (first run or hash deleted)
  if (!fs.existsSync(hashFilePath)) return true;

  const storedHash = fs.readFileSync(hashFilePath, 'utf-8').trim(); // EN: Read the previously stored config hash
  return storedHash !== getConfigHash(configOverride); // EN: Compare stored hash with current config hash
}

/**
 * Save the current config hash to the generated directory.
 */
export function saveConfigHash(configOverride?: Partial<DDTConfig>): void {
  const config: DDTConfig = { ...ddtConfig, ...configOverride } as DDTConfig; // EN: Merge base config with overrides
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir); // EN: Resolve absolute output directory
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true }); // EN: Create directory if it doesn't exist
  fs.writeFileSync(path.resolve(baseDir, CONFIG_HASH_FILE), getConfigHash(configOverride), 'utf-8'); // EN: Write the current config hash to .config-hash file
}

/**
 * Remove only worker-specific generated files, keeping the original ddt-data.xlsx.
 */
export function cleanWorkerFiles(): void {
  const config = ddtConfig as DDTConfig; // EN: Load the base DDT config
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir); // EN: Resolve absolute output directory

  if (fs.existsSync(baseDir)) { // EN: Only proceed if the directory exists
    const files = fs.readdirSync(baseDir); // EN: List all files in the generated directory
    for (const file of files) { // EN: Iterate over each file
      if (file !== config.fileName && file !== CONFIG_HASH_FILE) { // EN: Skip the original data file and the config hash file
        try {
          fs.unlinkSync(path.join(baseDir, file)); // EN: Delete the worker-specific file
        } catch {
          // EN: File may be locked by another process; skip it
        }
      }
    }
    console.log(`✔ Cleaned worker-generated files from: ${baseDir}`); // EN: Log cleanup completion
  }
}

/**
 * Remove all generated Excel files and the output directory.
 */
export function cleanGeneratedFiles(): void {
  const config = ddtConfig as DDTConfig; // EN: Load the base DDT config
  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir); // EN: Resolve absolute output directory

  if (fs.existsSync(baseDir)) { // EN: Only proceed if the directory exists
    const files = fs.readdirSync(baseDir); // EN: List all files in the generated directory
    for (const file of files) { // EN: Iterate over each file
      try {
        fs.unlinkSync(path.join(baseDir, file)); // EN: Delete the file
      } catch {
        // EN: File may be locked by another process; skip it
      }
    }
    try {
      fs.rmdirSync(baseDir); // EN: Remove the now-empty directory
    } catch {
      // EN: Directory may not be empty if some files were skipped
    }
    console.log(`✔ Cleaned generated data directory: ${baseDir}`); // EN: Log cleanup completion
  }
}

/**
 * Read all rows back from a generated Excel file by sheet name.
 */
export async function readGeneratedExcel(sheetName: string, customPath?: string): Promise<ExcelRow[]> {
  const config = ddtConfig as DDTConfig; // EN: Load the base DDT config
  const sheetConfig = config.sheets.find((s) => s.sheetName === sheetName); // EN: Find the matching sheet definition by name
  if (!sheetConfig) {
    throw new Error(`Sheet "${sheetName}" not found in ddt-config.json`); // EN: Throw if sheet name doesn't exist in config
  }

  const baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir); // EN: Resolve absolute output directory
  const filePath = customPath ?? path.resolve(baseDir, config.fileName); // EN: Use custom path or default to outputDir/fileName
  return ExcelHelper.readExcel(filePath, sheetConfig.sheetName); // EN: Read and return all rows from the specified sheet
}
