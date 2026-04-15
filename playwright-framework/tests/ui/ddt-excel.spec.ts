import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import {
  generateAllExcelData,
  readGeneratedExcel,
  isConfigChanged,
  saveConfigHash,
} from '../../src/data/ddt/DDTDataGenerator';
import { ExcelHelper } from '../../src/utils/helpers/ExcelHelper';
import ddtConfig from '../../src/data/ddt/ddt-config.json';

/**
 * DDT (Data-Driven Testing) Template
 *
 * Flow:
 *   1. Generate Excel data based on ddt-config.json (columns + rowCount)
 *   2. Read the generated data back from Excel
 *   3. Use each row to drive parameterized tests
 */

// ──────────────────────────────────────────────────────────
// 1. Generate all Excel files before the test suite runs
// ──────────────────────────────────────────────────────────
test.describe('DDT - Excel Data-Driven Tests', () => {
  let usersData: Record<string, string | number | boolean>[];
  let productsData: Record<string, string | number | boolean>[];
  let workerFilePath: string; // Worker-unique Excel file path for parallel isolation

  test.beforeAll(async ({}, workerInfo) => {
    const generatedDir = path.resolve(__dirname, '../../src/data/ddt/generated');
    if (!fs.existsSync(generatedDir)) fs.mkdirSync(generatedDir, { recursive: true });

    const originalFile = path.resolve(generatedDir, 'ddt-data.xlsx');

    // EN: Worker-unique file path to avoid cross-worker race conditions
    workerFilePath = path.resolve(
      generatedDir,
      `ddt-all-worker${workerInfo.workerIndex}.xlsx`
    );

    if (!isConfigChanged()) {
      // EN: Config unchanged and original exists → copy to worker file (skip regeneration)
      fs.copyFileSync(originalFile, workerFilePath);
      console.log(`Worker ${workerInfo.workerIndex}: Config unchanged, copied existing data`);
    } else {
      // EN: Config changed or original missing → generate fresh data for this worker
      await generateAllExcelData(undefined, workerFilePath);
      console.log(`Worker ${workerInfo.workerIndex}: Config changed, generated fresh data`);
    }

    // Read the generated data back
    usersData = await readGeneratedExcel('Users', workerFilePath);
    productsData = await readGeneratedExcel('Products', workerFilePath);
  });

  test.afterAll(async ({}, workerInfo) => {
    const generatedDir = path.resolve(__dirname, '../../src/data/ddt/generated');
    const originalFile = path.resolve(generatedDir, 'ddt-data.xlsx');

    // EN: Worker 0 saves the original cache + hash for future runs (if config was changed)
    if (workerInfo.workerIndex === 0 && isConfigChanged()) {
      if (fs.existsSync(workerFilePath)) {
        fs.copyFileSync(workerFilePath, originalFile);
        saveConfigHash();
        console.log('Worker 0: Saved original cache + config hash');
      }
    }

    // EN: Clean up this worker's generated file
    if (fs.existsSync(workerFilePath)) fs.unlinkSync(workerFilePath);
  });

  // ──────────────────────────────────────────────────────
  // 2. Validate generation worked correctly
  // ──────────────────────────────────────────────────────
  // EN: Verify the Users sheet has the expected number of rows (50) as defined in ddt-config.json
  test('should generate the configured number of user rows', async () => {
    expect(usersData.length).toBe(50); // matches rowCount in config
  });

  // EN: Verify the Products sheet has the expected number of rows (50) as defined in ddt-config.json
  test('should generate the configured number of product rows', async () => {
    expect(productsData.length).toBe(50);
  });

  // EN: Verify first user row contains all expected column headers from the config
  test('user rows should have all expected columns', async () => {
    const expectedColumns = [
      'FirstName', 'LastName', 'Email', 'Phone', 'City', 'Country', 'Age', 'IsActive',
    ];
    for (const col of expectedColumns) {
      expect(usersData[0]).toHaveProperty(col);
    }
  });

  // EN: Verify every user email matches the sequential pattern: startWord + index + @test.com
  test('user email should follow the startWord pattern', async () => {
    for (const row of usersData) {
      expect(String(row.Email)).toMatch(/^testuser\d+@test\.com$/);
    }
  });

  // EN: Verify every product price falls within the configured min/max range (10–999)
  test('product prices should be within configured range', async () => {
    for (const row of productsData) {
      expect(Number(row.Price)).toBeGreaterThanOrEqual(10);
      expect(Number(row.Price)).toBeLessThanOrEqual(999);
    }
  });

  // ──────────────────────────────────────────────────────
  // 3. Parameterized test: iterate over each user row
  // ──────────────────────────────────────────────────────
  // EN: Parameterized validation — iterate each user row to check email format and age boundaries
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
test.describe('DDT - Single Sheet Override', () => {
  let uniquePath: string; // Worker-unique Excel file path for parallel isolation

  test.beforeAll(async ({}, workerInfo) => {
    // Use a worker-unique file path to avoid cross-worker race conditions
    uniquePath = path.resolve(
      __dirname,
      `../../src/data/ddt/generated/ddt-data-worker${workerInfo.workerIndex}.xlsx`
    );
    // Generate a single file with both sheets using custom row counts
    await generateAllExcelData({ rowCount: 10 }, uniquePath);
  });

  test.afterAll(async () => {
    // Clean up this worker's generated file
    if (fs.existsSync(uniquePath)) fs.unlinkSync(uniquePath);
  });

  // EN: Verify Users sheet with custom row count — checks row count, first and last row values
  test('should generate a custom number of rows for Users', async () => {
    const rows = await ExcelHelper.readExcel(uniquePath, 'Users');
    const firstNameStart = ddtConfig.sheets.find(s => s.sheetName === 'Users')!.columns.find(c => c.header === 'FirstName')!.startWord;
    expect(rows.length).toBe(10);
    expect(String(rows[0].FirstName)).toBe(`${firstNameStart}1`);
    expect(String(rows[9].FirstName)).toBe(`${firstNameStart}10`);
  });

  // EN: Verify Products sheet with custom row count — checks row count, sequential names, and price range
  test('should generate a custom number of rows for Products', async () => {
    const rows = await ExcelHelper.readExcel(uniquePath, 'Products');
    const prodNameStart = ddtConfig.sheets.find(s => s.sheetName === 'Products')!.columns.find(c => c.header === 'ProductName')!.startWord;
    expect(rows.length).toBe(10);
    expect(String(rows[0].ProductName)).toBe(`${prodNameStart}1`);
    expect(String(rows[9].ProductName)).toBe(`${prodNameStart}10`);
    expect(Number(rows[0].Price)).toBeGreaterThanOrEqual(10);
    expect(Number(rows[0].Price)).toBeLessThanOrEqual(999);
  });
});
