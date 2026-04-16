import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import {
  generateAllCsvData,
  readGeneratedCsv,
  isConfigChanged,
  saveConfigHash,
} from '../../src/data/ddt/DDTDataGenerator';
import { CsvHelper } from '../../src/utils/helpers/CsvHelper';
import ddtConfig from '../../src/data/ddt/ddt-config.json';


/**
 * DDT (Data-Driven Testing) — CSV Format
 *
 * Flow:
 *   1. Generate CSV data based on ddt-config.json (columns + rowCount)
 *   2. Read the generated data back from CSV files
 *   3. Use each row to drive parameterized tests
 */

// ──────────────────────────────────────────────────────────
// 1. Generate all CSV files before the test suite runs
// ──────────────────────────────────────────────────────────
test.describe('DDT - CSV Data-Driven Tests', () => {
  let usersData: Record<string, string | number | boolean>[];
  let productsData: Record<string, string | number | boolean>[];
  let workerFilePath: string;

  test.beforeAll(async ({}, workerInfo) => {
    const generatedDir = path.resolve(__dirname, '../../src/data/ddt/generated');
    if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

    // EN: Worker-unique file path to avoid cross-worker race conditions
    workerFilePath = path.resolve(
      generatedDir,
      `ddt-csv-worker${workerInfo.workerIndex}.csv`
    );

    // EN: Generate fresh CSV data for this worker (single file with all sheets)
    generateAllCsvData(undefined, workerFilePath);
    console.log(`Worker ${workerInfo.workerIndex}: Generated CSV data`);

    // Read the generated data back from the single CSV file
    usersData = readGeneratedCsv('Users', workerFilePath);
    productsData = readGeneratedCsv('Products', workerFilePath);
  });

  test.afterAll(async () => {
    // EN: Clean up this worker's generated CSV file
    try {
      if (fs.existsSync(workerFilePath)) fs.unlinkSync(workerFilePath);
    } catch {
      // EN: File may be locked by another process; skip it
    }
  });

  // ──────────────────────────────────────────────────────
  // 2. Validate generation worked correctly
  // ──────────────────────────────────────────────────────
  test('should generate the configured number of user rows', async () => {
    expect(usersData.length).toBe(50);
  });

  test('should generate the configured number of product rows', async () => {
    expect(productsData.length).toBe(50);
  });

  test('user rows should have all expected columns', async () => {
    const expectedColumns = [
      'FirstName', 'LastName', 'Email', 'Phone', 'City', 'Country', 'Age', 'IsActive',
    ];
    for (const col of expectedColumns) {
      expect(usersData[0]).toHaveProperty(col);
    }
  });

  test('user email should follow the startWord pattern', async () => {
    for (const row of usersData) {
      expect(String(row.Email)).toMatch(/^testuser\d+@test\.com$/);
    }
  });

  test('product prices should be within configured range', async () => {
    for (const row of productsData) {
      expect(Number(row.Price)).toBeGreaterThanOrEqual(10);
      expect(Number(row.Price)).toBeLessThanOrEqual(999);
    }
  });

  // ──────────────────────────────────────────────────────
  // 3. Parameterized test: iterate over each user row
  // ──────────────────────────────────────────────────────
  test('each user row should have a valid email and age', async () => {
    for (const row of usersData) {
      expect(String(row.Email)).toContain('@');
      expect(Number(row.Age)).toBeGreaterThanOrEqual(18);
      expect(Number(row.Age)).toBeLessThanOrEqual(65);
    }
  });
});

// ──────────────────────────────────────────────────────────
// 4. Generate for a single sheet with a custom row count
// ──────────────────────────────────────────────────────────
test.describe('DDT - CSV Single Sheet Override', () => {
  let uniquePath: string;

  test.beforeAll(async ({}, workerInfo) => {
    uniquePath = path.resolve(
      __dirname,
      `../../src/data/ddt/generated/ddt-csv-single-worker${workerInfo.workerIndex}.csv`
    );
    generateAllCsvData({ rowCount: 10 }, uniquePath);
  });

  test.afterAll(async () => {
    try {
      if (fs.existsSync(uniquePath)) fs.unlinkSync(uniquePath);
    } catch {
      // EN: File may be locked by another process; skip it
    }
  });

  test('should generate a custom number of rows for Users', async () => {
    const rows = CsvHelper.readMultiSheetCsv(uniquePath, 'Users');
    const firstNameStart = ddtConfig.sheets.find(s => s.sheetName === 'Users')!.columns.find(c => c.header === 'FirstName')!.startWord;
    expect(rows.length).toBe(10);
    expect(String(rows[0].FirstName)).toBe(`${firstNameStart}1`);
    expect(String(rows[9].FirstName)).toBe(`${firstNameStart}10`);
  });

  test('should generate a custom number of rows for Products', async () => {
    const rows = CsvHelper.readMultiSheetCsv(uniquePath, 'Products');
    expect(rows.length).toBe(10);
  });
});
