# DDT (Data-Driven Testing) — Technical Implementation Guide

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [File Structure](#file-structure)
- [Configuration Layer — `ddt-config.json`](#configuration-layer--ddt-configjson)
- [Generator Engine — `DDTDataGenerator.ts`](#generator-engine--ddtdatageneratorts)
  - [Interfaces](#interfaces)
  - [Value Generation Strategy](#value-generation-strategy)
  - [Row Generation](#row-generation)
  - [Multi-Sheet Generation](#multi-sheet-generation)
  - [Single-Sheet Generation](#single-sheet-generation)
  - [Config Change Detection (SHA-256 Hash)](#config-change-detection-sha-256-hash)
  - [Cleanup Utilities](#cleanup-utilities)
  - [Read-Back Utility](#read-back-utility)
- [Excel I/O Layer — `ExcelHelper.ts`](#excel-io-layer--excelhelperTs)
- [Test Layer — `ddt-excel.spec.ts`](#test-layer--ddt-excelspects)
  - [Describe 1: Full Data Generation](#describe-1-full-data-generation)
  - [Describe 2: Single Sheet Override](#describe-2-single-sheet-override)
- [Parallel Worker Isolation](#parallel-worker-isolation)
- [Smart Regeneration Flow](#smart-regeneration-flow)
- [How to Add a New Sheet](#how-to-add-a-new-sheet)
- [How to Add a New Column Type](#how-to-add-a-new-column-type)

---

## Overview

The DDT (Data-Driven Testing) module generates test data in `.xlsx` format from a JSON configuration, then reads it back to drive parameterized Playwright tests. The system is designed for:

- **Config-driven generation** — all data shapes are defined in `ddt-config.json`
- **Parallel-safe execution** — each Playwright worker gets its own Excel file
- **Smart regeneration** — SHA-256 hashing detects config changes and skips unnecessary regeneration
- **Cleanup after tests** — worker files are deleted; original cached data is preserved for reuse

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ddt-config.json                              │
│  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌───────────────────┐  │
│  │ outputDir│  │ fileName │  │ rowCount  │  │ sheets[]          │  │
│  │ "src/    │  │ "ddt-    │  │   50      │  │ ┌───────────────┐ │  │
│  │  data/   │  │  data.   │  │           │  │ │ Users (8 col) │ │  │
│  │  ddt/    │  │  xlsx"   │  │           │  │ ├───────────────┤ │  │
│  │  genera  │  │          │  │           │  │ │Products(5 col)│ │  │
│  │  ted"    │  │          │  │           │  │ └───────────────┘ │  │
│  └──────────┘  └──────────┘  └───────────┘  └───────────────────┘  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   DDTDataGenerator.ts                                │
│                                                                     │
│  ┌──────────────┐   ┌────────────────┐   ┌───────────────────────┐  │
│  │generateValue │──▶│ generateRows   │──▶│ generateAllExcelData  │  │
│  │(per cell)    │   │ (per sheet)    │   │ (all sheets → .xlsx)  │  │
│  └──────────────┘   └────────────────┘   └───────────┬───────────┘  │
│                                                      │              │
│  ┌──────────────┐   ┌────────────────┐               │              │
│  │isConfigChanged│  │ saveConfigHash │  ◀────────────┘              │
│  │(SHA-256 check)│  │ (.config-hash) │                              │
│  └──────────────┘   └────────────────┘                              │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      ExcelHelper.ts                                 │
│                                                                     │
│  ┌─────────────────────┐  ┌──────────────────┐  ┌───────────────┐  │
│  │writeMultiSheetExcel  │  │   writeExcel     │  │  readExcel    │  │
│  │(multi-sheet .xlsx)   │  │ (single sheet)   │  │(sheet → rows) │  │
│  └─────────────────────┘  └──────────────────┘  └───────────────┘  │
└──────────────────────────┬──────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   ddt-excel.spec.ts                                  │
│                                                                     │
│  ┌────────────────────────────────────────────────────────────────┐  │
│  │ Describe 1: DDT - Excel Data-Driven Tests                     │  │
│  │   beforeAll → isConfigChanged? copy : generate                │  │
│  │   6 tests × 4 browsers = 24 test runs                        │  │
│  │   afterAll  → worker 0 saves cache, all delete worker file    │  │
│  ├────────────────────────────────────────────────────────────────┤  │
│  │ Describe 2: DDT - Single Sheet Override                       │  │
│  │   beforeAll → generate with rowCount: 10                      │  │
│  │   2 tests × 4 browsers = 8 test runs                         │  │
│  │   afterAll  → delete worker file                              │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  Total: 32 tests (8 per browser × 4 browsers)                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## File Structure

```
src/data/ddt/
├── ddt-config.json          # Configuration: sheets, columns, rowCount, output path
├── DDTDataGenerator.ts      # Generator engine: value generation, hashing, cleanup
├── DDT-Implementation.md    # This documentation file
└── generated/               # Output directory (auto-created)
    ├── ddt-data.xlsx        # Cached original file (persisted between runs)
    ├── .config-hash         # SHA-256 hash of ddt-config.json (change detection)
    ├── ddt-all-worker0.xlsx # Worker 0's copy (deleted after tests)
    ├── ddt-all-worker1.xlsx # Worker 1's copy (deleted after tests)
    └── ...                  # Additional worker files

src/utils/helpers/
└── ExcelHelper.ts           # Low-level ExcelJS wrapper (read/write/multi-sheet)

tests/ui/
└── ddt-excel.spec.ts        # Playwright test file with DDT test suites
```

---

## Configuration Layer — `ddt-config.json`

The configuration file defines **what** to generate without touching any code:

```json
{
  "outputDir": "src/data/ddt/generated",
  "fileName": "ddt-data.xlsx",
  "rowCount": 50,
  "sheets": [
    {
      "sheetName": "Users",
      "columns": [
        { "header": "FirstName", "startWord": "User", "type": "sequential" },
        { "header": "Email", "startWord": "testuser", "type": "email" },
        { "header": "Age", "startWord": "25", "type": "number", "min": 18, "max": 65 },
        { "header": "Country", "startWord": "Country", "type": "pick", "pickList": ["USA", "UK", "India"] }
      ]
    }
  ]
}
```

### Config Properties

| Property    | Type     | Description                                           |
|-------------|----------|-------------------------------------------------------|
| `outputDir` | `string` | Relative path from project root for generated files   |
| `fileName`  | `string` | Name of the generated Excel file                      |
| `rowCount`  | `number` | Default number of rows generated per sheet            |
| `sheets`    | `array`  | Array of sheet definitions (sheetName + columns)      |

### Column Definition Properties

| Property   | Type       | Required | Description                                        |
|------------|------------|----------|----------------------------------------------------|
| `header`   | `string`   | Yes      | Column header name in Excel                        |
| `startWord`| `string`   | Yes      | Prefix/seed for generating values                  |
| `type`     | `string`   | Yes      | Generation strategy (see table below)              |
| `min`      | `number`   | No       | Minimum for `number` type (default: 1)             |
| `max`      | `number`   | No       | Maximum for `number` type (default: 100)           |
| `pickList` | `string[]` | No       | Values to cycle through for `pick` type            |

---

## Generator Engine — `DDTDataGenerator.ts`

### Interfaces

```typescript
// Defines a single column's generation rules
interface ColumnDef {
  header: string;
  startWord: string;
  type: 'sequential' | 'email' | 'phone' | 'number' | 'boolean' | 'pick';
  min?: number;
  max?: number;
  pickList?: string[];
}

// Defines a sheet's name and its column definitions
interface SheetConfig {
  sheetName: string;
  columns: ColumnDef[];
}

// Full DDT configuration structure
interface DDTConfig {
  outputDir: string;
  fileName: string;
  rowCount: number;
  sheets: SheetConfig[];
}
```

### Value Generation Strategy

The `generateValue(col, rowIndex)` function produces a cell value based on the column `type`:

| Type         | Pattern                          | Example Output          |
|--------------|----------------------------------|-------------------------|
| `sequential` | `startWord + rowIndex`           | `"User1"`, `"User2"`   |
| `email`      | `startWord + rowIndex + @test.com`| `"testuser1@test.com"` |
| `phone`      | `startWord + random 8 digits`    | `"0512345678"`          |
| `number`     | Random int in `[min, max]`       | `42`                    |
| `boolean`    | `rowIndex % 2 === 0`             | `true`, `false`         |
| `pick`       | `pickList[rowIndex % length]`    | `"USA"`, `"UK"`, ...    |

**Code flow:**
```
generateValue(col, rowIndex)
    │
    ├── sequential → `${startWord}${rowIndex}`
    ├── email      → `${startWord}${rowIndex}@test.com`
    ├── phone      → `${startWord}${random8digits}`
    ├── number     → Math.floor(min + Math.random() * (max - min + 1))
    ├── boolean    → rowIndex % 2 === 0
    └── pick       → pickList[rowIndex % pickList.length]
```

### Row Generation

`generateRows(columns, rowCount)` loops from `1` to `rowCount`, building one `ExcelRow` object per iteration:

```
for i = 1 to rowCount:
    row = {}
    for each column:
        row[column.header] = generateValue(column, i)
    rows.push(row)
return rows
```

### Multi-Sheet Generation

`generateAllExcelData(configOverride?, outputPath?)`:

1. Merges base config with any overrides (`{ ...ddtConfig, ...configOverride }`)
2. Resolves output file path (custom or default)
3. Maps each sheet config → `{ sheetName, headers[], rows[] }`
4. Calls `ExcelHelper.writeMultiSheetExcel()` to write all sheets into one `.xlsx`
5. Returns the absolute file path

### Single-Sheet Generation

`generateExcelForSheet(sheetName, rowCountOverride?, outputPath?)`:

1. Finds the sheet definition by name from config
2. Generates rows with optional row count override
3. Calls `ExcelHelper.writeExcel()` for a single sheet
4. Returns the absolute file path

### Config Change Detection (SHA-256 Hash)

Three functions manage smart regeneration:

#### `getConfigHash(configOverride?)`
- Merges base config with overrides
- Serializes to JSON → computes SHA-256 hex digest
- Returns: `string` (64-char hex hash)

#### `isConfigChanged(configOverride?)`
```
Is original .xlsx missing?  ──yes──▶ return true  (needs generation)
         │ no
Is .config-hash missing?    ──yes──▶ return true  (first run)
         │ no
storedHash !== currentHash? ──yes──▶ return true  (config edited)
         │ no
         └──▶ return false  (nothing changed, reuse existing data)
```

#### `saveConfigHash(configOverride?)`
- Creates the output directory if missing
- Writes the current config SHA-256 hash to `.config-hash` file

### Cleanup Utilities

#### `cleanWorkerFiles()`
- Lists files in the generated directory
- Deletes everything **except** the original `.xlsx` file and `.config-hash`
- Safe: wraps `unlinkSync` in try-catch for locked files

#### `cleanGeneratedFiles()`
- Deletes **all** files in the generated directory
- Removes the directory itself via `rmdirSync`
- Safe: swallows errors for locked files or non-empty directory

### Read-Back Utility

`readGeneratedExcel(sheetName, customPath?)`:
- Finds the sheet definition from config
- Reads the Excel file using `ExcelHelper.readExcel()`
- Returns `ExcelRow[]` — array of `{ header: value }` objects

---

## Excel I/O Layer — `ExcelHelper.ts`

A static utility class wrapping the `exceljs` library:

| Method                | Purpose                                             |
|-----------------------|-----------------------------------------------------|
| `writeExcel`          | Write a single sheet to an `.xlsx` file             |
| `writeMultiSheetExcel`| Write multiple sheets into one `.xlsx` file         |
| `readExcel`           | Read all rows from a sheet, returning `ExcelRow[]`  |

**Key behaviors:**
- Auto-creates directories if they don't exist
- Styles header rows (bold, centered)
- Column width set to 20 for all columns
- Reads by mapping Row 1 as headers, remaining rows as data
- Skips empty rows during read-back

---

## Test Layer — `ddt-excel.spec.ts`

### Describe 1: Full Data Generation

**`beforeAll`** (runs once per worker):
1. Ensures `generated/` directory exists
2. Builds worker-unique path: `ddt-all-worker{workerIndex}.xlsx`
3. Checks `isConfigChanged()`:
   - **Unchanged** → copies cached `ddt-data.xlsx` to worker file (fast)
   - **Changed** → generates fresh data via `generateAllExcelData()`
4. Reads both Users and Products data into memory

**`afterAll`** (runs once per worker):
1. Worker 0 checks if config changed → saves worker file as original + writes hash
2. All workers delete their own worker file

**Tests (6):**
| # | Test Name | What It Validates |
|---|-----------|-------------------|
| 1 | `should generate the configured number of user rows` | `usersData.length === 50` |
| 2 | `should generate the configured number of product rows` | `productsData.length === 50` |
| 3 | `user rows should have all expected columns` | All 8 column headers present |
| 4 | `user email should follow the startWord pattern` | Regex: `/^testuser\d+@test\.com$/` |
| 5 | `product prices should be within configured range` | `10 ≤ Price ≤ 999` |
| 6 | `each user row should have a valid email and age` | `@` in email, `18 ≤ Age ≤ 65` |

### Describe 2: Single Sheet Override

**`beforeAll`**: Generates with `{ rowCount: 10 }` override to worker-unique path.

**`afterAll`**: Deletes worker file.

**Tests (2):**
| # | Test Name | What It Validates |
|---|-----------|-------------------|
| 1 | `should generate a custom number of rows for Users` | 10 rows, first/last `startWord` values |
| 2 | `should generate a custom number of rows for Products` | 10 rows, first/last names, price range |

**Total: 8 tests × 4 browsers (chromium, firefox, webkit, mobile-chrome) = 32 test runs**

---

## Parallel Worker Isolation

Playwright runs 4 workers in parallel. Without isolation, workers would corrupt the same Excel file.

**Solution:** Each worker generates its own file using `workerInfo.workerIndex`:

```
Worker 0 → ddt-all-worker0.xlsx
Worker 1 → ddt-all-worker1.xlsx
Worker 2 → ddt-all-worker2.xlsx
Worker 3 → ddt-all-worker3.xlsx
```

**Lifecycle per worker:**

```
beforeAll:
  ├── Generate/copy → ddt-all-worker{N}.xlsx
  └── Read data into memory

[run tests using in-memory data]

afterAll:
  ├── Worker 0: save cache (if config changed)
  └── All workers: delete ddt-all-worker{N}.xlsx
```

---

## Smart Regeneration Flow

```
            ┌──────────────────────┐
            │  Test Suite Starts   │
            └──────────┬───────────┘
                       ▼
            ┌──────────────────────┐
            │  isConfigChanged()?  │
            └──────┬────────┬──────┘
                   │        │
              no   │        │ yes
                   ▼        ▼
        ┌────────────┐  ┌─────────────────────┐
        │ Copy cached │  │ Generate fresh data │
        │ ddt-data.   │  │ via generateAll     │
        │ xlsx →      │  │ ExcelData() →       │
        │ worker file │  │ worker file         │
        └──────┬─────┘  └──────────┬──────────┘
               │                   │
               └─────────┬─────────┘
                         ▼
              ┌────────────────────┐
              │   Run All Tests    │
              └────────┬───────────┘
                       ▼
              ┌────────────────────┐
              │ afterAll (Worker 0)│
              │ if config changed: │
              │   copy → original  │
              │   saveConfigHash() │
              └────────┬───────────┘
                       ▼
              ┌────────────────────┐
              │ Delete worker file │
              └────────────────────┘
```

**Performance impact:**
- Config **unchanged**: Only `fs.copyFileSync` + `readExcel` — no generation overhead
- Config **changed**: Full generation + write + read (one-time cost, cached for next run)

---

## How to Add a New Sheet

1. **Edit `ddt-config.json`** — add a new entry to `sheets[]`:

```json
{
  "sheetName": "Orders",
  "columns": [
    { "header": "OrderID", "startWord": "ORD", "type": "sequential" },
    { "header": "Amount", "startWord": "10", "type": "number", "min": 5, "max": 500 },
    { "header": "Status", "startWord": "Pending", "type": "pick", "pickList": ["Pending", "Shipped", "Delivered"] }
  ]
}
```

2. **Add tests** in `ddt-excel.spec.ts`:

```typescript
const ordersData = await readGeneratedExcel('Orders', workerFilePath);
test('should generate orders', async () => {
  expect(ordersData.length).toBe(50);
});
```

3. **Run** — the hash detects the config change and regenerates automatically.

---

## How to Add a New Column Type

1. **Add the type** to `ColumnDef.type` union in `DDTDataGenerator.ts`:

```typescript
type: 'sequential' | 'email' | 'phone' | 'number' | 'boolean' | 'pick' | 'uuid';
```

2. **Add a case** in `generateValue()`:

```typescript
case 'uuid':
  return crypto.randomUUID();
```

3. **Use it** in `ddt-config.json`:

```json
{ "header": "TrackingID", "startWord": "", "type": "uuid" }
```

The hash detection will automatically trigger regeneration on the next run.
