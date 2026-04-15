# DDT (Data-Driven Testing) — Technical Implementation Guide

## Table of Contents

- [Overview](#overview)
- [Architecture Diagram](#architecture-diagram)
- [File Structure](#file-structure)
- [Configuration Layer — `ddt-config.json`](#configuration-layer--ddt-configjson)
- [Generator Engine — `DDTDataGenerator.ts`](#generator-engine--ddtdatageneratorts)
  - [Interfaces](#interfaces)
  - [Function 1: `generateValue` — Cell Value Factory](#function-1-generatevaluecol-rowindex--cell-value-factory)
  - [Function 2: `generateRows` — Row Builder](#function-2-generaterowscolumns-rowcount--row-builder)
  - [Function 3: `generateAllExcelData` — Multi-Sheet Generator](#function-3-generateallexceldataconfigoverride-outputpath--multi-sheet-generator)
  - [Function 4: `generateExcelForSheet` — Single-Sheet Generator](#function-4-generateexcelforsheetsheetname-rowcountoverride-outputpath--single-sheet-generator)
  - [Function 5: `getConfigHash` — Config Fingerprint](#function-5-getconfighashconfigoverride--config-fingerprint)
  - [Function 6: `isConfigChanged` — Change Detector](#function-6-isconfigchangedconfigoverride--change-detector)
  - [Function 7: `saveConfigHash` — Cache Writer](#function-7-saveconfighashconfigoverride--cache-writer)
  - [Function 8: `cleanWorkerFiles` — Selective Cleanup](#function-8-cleanworkerfiles--selective-cleanup)
  - [Function 9: `cleanGeneratedFiles` — Full Cleanup](#function-9-cleangeneratedfiles--full-cleanup)
  - [Function 10: `readGeneratedExcel` — Data Reader](#function-10-readgeneratedexcelsheetname-custompath--data-reader)
- [Excel I/O Layer — `ExcelHelper.ts`](#excel-io-layer--excelhelperTs)
  - [`writeExcel`](#method-excelhelperwriteexcelfilepath-sheetname-headers-rows)
  - [`writeMultiSheetExcel`](#method-excelhelperwritemultisheetexcelfilepath-sheets)
  - [`readExcel`](#method-excelhelperreadexcelfilepath-sheetname)
- [Test Layer — `ddt-excel.spec.ts`](#test-layer--ddt-excelspects)
  - [Describe 1: Full Data Generation](#describe-1-full-data-generation--ddt---excel-data-driven-tests)
  - [Describe 2: Single Sheet Override](#describe-2-single-sheet-override--ddt---single-sheet-override)
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

### Function 1: `generateValue(col, rowIndex)` — Cell Value Factory

> **Scope:** Private (not exported) — internal helper only  
> **Purpose:** Produces a single cell value based on the column's `type` and the current row index  
> **Parameters:**
> - `col: ColumnDef` — the column definition object (header, startWord, type, min, max, pickList)
> - `rowIndex: number` — 1-based row number (1, 2, 3, ...)
>
> **Returns:** `string | number | boolean`

This is the **core factory function** — every cell in the generated Excel ultimately comes from this function. It uses a `switch` statement on `col.type` to select the generation strategy:

| Type         | Logic                                                                 | Example (startWord=`"User"`, rowIndex=`3`) |
|--------------|-----------------------------------------------------------------------|---------------------------------------------|
| `sequential` | Simple string concatenation: `startWord + rowIndex`                  | `"User3"`                                   |
| `email`      | Concatenation with domain: `startWord + rowIndex + "@test.com"`      | `"testuser3@test.com"`                      |
| `phone`      | `startWord` + random 8-digit number via `Math.floor(10000000 + Math.random() * 90000000)` — guarantees 8 digits because the base is 10,000,000 and the random range adds up to 99,999,999 | `"0587432156"` |
| `number`     | Random integer in `[min, max]` using `Math.floor(min + Math.random() * (max - min + 1))` — defaults to `min=1, max=100` if not configured | `42` |
| `boolean`    | Deterministic alternation: `rowIndex % 2 === 0` — even rows → `true`, odd rows → `false` | `false` (row 3 is odd) |
| `pick`       | Round-robin from `pickList` using modulo: `pickList[rowIndex % pickList.length]` — falls back to `[startWord]` if no pickList provided | `"UK"` (index 3 % 5) |
| `default`    | Fallback — behaves like `sequential` for any unknown/future type      | `"User3"` |

**Internal flow diagram:**
```
generateValue(col, rowIndex)
    │
    ├── switch(col.type)
    │     │
    │     ├── 'sequential' ──▶ return `${col.startWord}${rowIndex}`
    │     │                     // Direct concatenation, deterministic output
    │     │
    │     ├── 'email' ──▶ return `${col.startWord}${rowIndex}@test.com`
    │     │                // Appends domain suffix, deterministic
    │     │
    │     ├── 'phone' ──▶ suffix = Math.floor(10000000 + Math.random() * 90000000)
    │     │               return `${col.startWord}${suffix}`
    │     │               // Random suffix each call — NOT deterministic
    │     │
    │     ├── 'number' ──▶ min = col.min ?? 1
    │     │                max = col.max ?? 100
    │     │                return Math.floor(min + Math.random() * (max - min + 1))
    │     │                // Random within bounds — NOT deterministic
    │     │
    │     ├── 'boolean' ──▶ return rowIndex % 2 === 0
    │     │                  // Deterministic: even=true, odd=false
    │     │
    │     ├── 'pick' ──▶ list = col.pickList ?? [col.startWord]
    │     │              return list[rowIndex % list.length]
    │     │              // Deterministic round-robin cycle
    │     │
    │     └── default ──▶ return `${col.startWord}${rowIndex}`
    │                      // Safety fallback
```

**Determinism note:** `sequential`, `email`, `boolean`, and `pick` produce the same output for the same `rowIndex`. `phone` and `number` use `Math.random()` so they differ between runs — this is intentional for realistic test data.

---

### Function 2: `generateRows(columns, rowCount)` — Row Builder

> **Scope:** Private (not exported) — internal helper only  
> **Purpose:** Generates an array of `ExcelRow` objects for one sheet  
> **Parameters:**
> - `columns: ColumnDef[]` — array of column definitions for the sheet
> - `rowCount: number` — how many rows to generate
>
> **Returns:** `ExcelRow[]` — array of `{ [header]: value }` objects

This function is the **bridge between column definitions and full data rows**. It uses two nested loops:

```
Outer loop: i = 1, 2, 3, ..., rowCount     (creates each row)
  Inner loop: for each column in columns[]  (fills each cell in the row)
    row[column.header] = generateValue(column, i)
```

**Step-by-step execution example** (2 columns, 3 rows):

```
columns = [
  { header: "Name", startWord: "User", type: "sequential" },
  { header: "Age",  type: "number", min: 18, max: 65 }
]
rowCount = 3

Iteration 1 (i=1): row = { Name: "User1", Age: 42 }  → rows.push
Iteration 2 (i=2): row = { Name: "User2", Age: 29 }  → rows.push
Iteration 3 (i=3): row = { Name: "User3", Age: 55 }  → rows.push

return [ { Name:"User1", Age:42 }, { Name:"User2", Age:29 }, { Name:"User3", Age:55 } ]
```

**Key design decisions:**
- **1-based indexing** (`i = 1` not `0`) — so first row produces `"User1"` not `"User0"`
- **New object per iteration** — `const row: ExcelRow = {}` inside the loop prevents reference sharing
- **Header as key** — `row[col.header]` ensures the object keys match Excel column headers exactly

---

### Function 3: `generateAllExcelData(configOverride?, outputPath?)` — Multi-Sheet Generator

> **Scope:** Exported (public API)  
> **Purpose:** Generates a complete `.xlsx` file with ALL sheets defined in the config  
> **Parameters:**
> - `configOverride?: Partial<DDTConfig>` — optional overrides merged with base config (e.g., `{ rowCount: 10 }`)
> - `outputPath?: string` — optional custom file path (used for worker-unique files)
>
> **Returns:** `Promise<string>` — absolute path of the generated file

This is the **primary entry point** for data generation. It orchestrates the full pipeline:

```
Step 1: Config Merge
  const config = { ...ddtConfig, ...configOverride }
  // Spread operator: base config is overridden by any provided fields
  // Example: { rowCount: 50, ...{ rowCount: 10 } } → { rowCount: 10 }

Step 2: Path Resolution
  baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir)
  // Navigates from src/data/ddt/ up three levels to project root,
  // then into config.outputDir → absolute path to generated/
  filePath = outputPath ?? path.resolve(baseDir, config.fileName)
  // Uses custom path if provided, otherwise default: generated/ddt-data.xlsx

Step 3: Sheet Mapping
  sheets = config.sheets.map(sheet => ({
    sheetName: sheet.sheetName,
    headers: sheet.columns.map(c => c.header),    // ["FirstName", "LastName", ...]
    rows: generateRows(sheet.columns, config.rowCount)  // 50 row objects
  }))
  // Transforms config format → ExcelHelper format

Step 4: Write to Disk
  await ExcelHelper.writeMultiSheetExcel(filePath, sheets)
  // Creates the .xlsx file with all sheets in a single workbook

Step 5: Return Path
  return filePath  // Caller uses this to read data back or for cleanup
```

**Why `configOverride` uses `Partial<DDTConfig>`:**
- You can override just `rowCount` without specifying sheets/outputDir/fileName
- The spread merge `{ ...ddtConfig, ...configOverride }` keeps all unspecified fields from the base config
- This enables the "Single Sheet Override" tests to generate with `{ rowCount: 10 }` while keeping all other settings

**Why `outputPath` exists:**
- Parallel workers need unique file paths to avoid race conditions
- Without it, all 4 workers would write to the same `ddt-data.xlsx` simultaneously
- The test passes `ddt-all-worker0.xlsx`, `ddt-all-worker1.xlsx`, etc.

---

### Function 4: `generateExcelForSheet(sheetName, rowCountOverride?, outputPath?)` — Single-Sheet Generator

> **Scope:** Exported (public API)  
> **Purpose:** Generates a `.xlsx` file with a single specific sheet  
> **Parameters:**
> - `sheetName: string` — name of the sheet to generate (must exist in config)
> - `rowCountOverride?: number` — optional custom row count
> - `outputPath?: string` — optional custom file path
>
> **Returns:** `Promise<string>` — absolute path of the generated file  
> **Throws:** `Error` if `sheetName` is not found in `ddt-config.json`

This function generates **one sheet** instead of all. Useful when you only need a subset of the data:

```
Step 1: Config Lookup
  config = ddtConfig as DDTConfig
  sheetConfig = config.sheets.find(s => s.sheetName === sheetName)
  // Searches the sheets array for a matching sheetName
  // Throws Error if not found — fail-fast with descriptive message

Step 2: Row Count Resolution
  count = rowCountOverride ?? config.rowCount
  // Use parameter if provided, otherwise fall back to config's default (50)

Step 3: Header Extraction
  headers = sheetConfig.columns.map(c => c.header)
  // ["FirstName", "LastName", "Email", "Phone", ...]

Step 4: Row Generation
  rows = generateRows(sheetConfig.columns, count)
  // Generates `count` rows using the sheet's column definitions

Step 5: Write Single Sheet
  await ExcelHelper.writeExcel(filePath, sheetConfig.sheetName, headers, rows)
  // Uses writeExcel (single sheet) instead of writeMultiSheetExcel

Step 6: Return Path
  return filePath
```

**Difference from `generateAllExcelData`:**
| Aspect | `generateAllExcelData` | `generateExcelForSheet` |
|--------|----------------------|------------------------|
| Sheets written | All sheets in config | One specific sheet |
| ExcelHelper method | `writeMultiSheetExcel` | `writeExcel` |
| Config override | `Partial<DDTConfig>` (any field) | Only `rowCount` |
| Error handling | No validation needed | Throws if sheet not found |

---

### Function 5: `getConfigHash(configOverride?)` — Config Fingerprint

> **Scope:** Private (not exported) — internal helper only  
> **Purpose:** Computes a SHA-256 hash of the effective configuration  
> **Parameters:**
> - `configOverride?: Partial<DDTConfig>` — optional overrides (same as `generateAllExcelData`)
>
> **Returns:** `string` — 64-character hexadecimal hash

This is the **heart of change detection**. It creates a unique fingerprint of the current config state:

```
Step 1: Merge config
  config = { ...ddtConfig, ...configOverride }
  // Same merge strategy as generateAllExcelData

Step 2: Serialize to JSON
  jsonString = JSON.stringify(config)
  // Converts the entire config object to a string
  // Includes: outputDir, fileName, rowCount, all sheets, all columns,
  //           all startWords, types, min/max values, pickLists

Step 3: Compute SHA-256
  hash = crypto.createHash('sha256')
         .update(jsonString)
         .digest('hex')
  // SHA-256 produces a 256-bit hash → 64 hex characters
  // Example: "a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1"
```

**Why SHA-256?**
- Any change to the config (even a single character) produces a completely different hash
- Collision probability is astronomically low (2^-256)
- Fast to compute — negligible overhead
- Deterministic — same input always produces the same hash

**What triggers a hash change:**
- Changing `rowCount` (e.g., 50 → 100)
- Changing a `startWord` (e.g., `"User"` → `"RFQ_NM"`)
- Adding/removing/reordering columns
- Adding/removing sheets
- Changing `min`, `max`, `pickList` values
- Changing `outputDir` or `fileName`

---

### Function 6: `isConfigChanged(configOverride?)` — Change Detector

> **Scope:** Exported (public API)  
> **Purpose:** Determines if the config has changed since the last generation  
> **Parameters:**
> - `configOverride?: Partial<DDTConfig>` — optional config overrides
>
> **Returns:** `boolean` — `true` if regeneration is needed, `false` if cached data can be reused

This function implements a **three-guard check** before declaring "nothing changed":

```
Guard 1: Does the original Excel file exist?
  originalFilePath = baseDir + "/" + config.fileName  // e.g., generated/ddt-data.xlsx
  if (!fs.existsSync(originalFilePath)) return true
  // No file → must generate (first run or file was deleted)

Guard 2: Does the hash file exist?
  hashFilePath = baseDir + "/" + ".config-hash"
  if (!fs.existsSync(hashFilePath)) return true
  // No hash → can't compare, treat as changed (first run or hash deleted)

Guard 3: Does the stored hash match the current config?
  storedHash = fs.readFileSync(hashFilePath, 'utf-8').trim()
  currentHash = getConfigHash(configOverride)
  return storedHash !== currentHash
  // Different hash → config was edited → return true (needs regeneration)
  // Same hash → config unchanged → return false (reuse existing data)
```

**Decision flow diagram:**
```
isConfigChanged()
    │
    ├── original .xlsx missing?  ──YES──▶ return TRUE  ──▶ "Generate fresh"
    │        │ NO
    ├── .config-hash missing?    ──YES──▶ return TRUE  ──▶ "Generate fresh"
    │        │ NO
    ├── storedHash ≠ currentHash? ─YES──▶ return TRUE  ──▶ "Config edited, regenerate"
    │        │ NO
    └────────┴──▶ return FALSE ──▶ "Nothing changed, copy cached file"
```

**Why three guards instead of just hash comparison?**
1. `original .xlsx missing` — handles first run or manual deletion
2. `.config-hash missing` — handles corrupted state or first run
3. `hash mismatch` — handles actual config edits

---

### Function 7: `saveConfigHash(configOverride?)` — Cache Writer

> **Scope:** Exported (public API)  
> **Purpose:** Persists the current config hash to disk for future comparisons  
> **Parameters:**
> - `configOverride?: Partial<DDTConfig>` — optional config overrides
>
> **Returns:** `void`

Called by **Worker 0** in `afterAll` after successful generation to save the cache for next runs:

```
Step 1: Resolve paths
  config = { ...ddtConfig, ...configOverride }
  baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir)

Step 2: Ensure directory exists
  if (!fs.existsSync(baseDir)) fs.mkdirSync(baseDir, { recursive: true })
  // Creates the full directory tree if missing (e.g., src/data/ddt/generated/)

Step 3: Write hash file
  fs.writeFileSync(
    path.resolve(baseDir, '.config-hash'),  // File: generated/.config-hash
    getConfigHash(configOverride),            // Content: 64-char hex string
    'utf-8'                                   // Encoding: plain text
  )
```

**File content example:**
```
# generated/.config-hash
a3f2b8c9d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1
```

**When is this called?**
- Only by Worker 0 in the test's `afterAll` hook
- Only when `isConfigChanged()` returns `true` (i.e., data was regenerated)
- After the worker file is copied to the original path (`ddt-data.xlsx`)

---

### Function 8: `cleanWorkerFiles()` — Selective Cleanup

> **Scope:** Exported (public API)  
> **Purpose:** Removes worker-specific files while preserving the cached original and hash  
> **Parameters:** None  
> **Returns:** `void`

This function cleans up temporary worker files **without destroying the cache**:

```
Step 1: Resolve the generated directory path
  baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir)

Step 2: Check if directory exists
  if (!fs.existsSync(baseDir)) → exit (nothing to clean)

Step 3: List all files
  files = fs.readdirSync(baseDir)
  // Example: ["ddt-data.xlsx", ".config-hash", "ddt-all-worker0.xlsx",
  //           "ddt-all-worker1.xlsx", "ddt-data-worker2.xlsx"]

Step 4: Delete selectively
  for each file:
    if (file !== "ddt-data.xlsx" && file !== ".config-hash"):
      try { fs.unlinkSync(file) }    // Delete worker file
      catch { /* skip locked files */ }

  // After cleanup: ["ddt-data.xlsx", ".config-hash"]  ← preserved
```

**What gets preserved vs deleted:**
| File | Kept? | Reason |
|------|-------|--------|
| `ddt-data.xlsx` | ✅ Yes | Cached original for future `isConfigChanged()` comparisons |
| `.config-hash` | ✅ Yes | Hash file needed for change detection |
| `ddt-all-worker0.xlsx` | ❌ Deleted | Temporary worker file |
| `ddt-data-worker1.xlsx` | ❌ Deleted | Temporary worker file |

---

### Function 9: `cleanGeneratedFiles()` — Full Cleanup

> **Scope:** Exported (public API)  
> **Purpose:** Removes ALL files and the directory itself — complete reset  
> **Parameters:** None  
> **Returns:** `void`

This is the **nuclear option** — removes everything including the cache:

```
Step 1: Resolve directory
  baseDir = path.resolve(__dirname, '..', '..', '..', config.outputDir)

Step 2: Check existence
  if (!fs.existsSync(baseDir)) → exit

Step 3: Delete ALL files (no exceptions)
  for each file in fs.readdirSync(baseDir):
    try { fs.unlinkSync(path.join(baseDir, file)) }
    catch { /* skip locked files */ }

Step 4: Remove empty directory
  try { fs.rmdirSync(baseDir) }
  catch { /* fails if files were skipped due to locks */ }
```

**Difference from `cleanWorkerFiles()`:**
| Aspect | `cleanWorkerFiles()` | `cleanGeneratedFiles()` |
|--------|---------------------|------------------------|
| Deletes worker files | ✅ | ✅ |
| Deletes `ddt-data.xlsx` | ❌ | ✅ |
| Deletes `.config-hash` | ❌ | ✅ |
| Removes directory | ❌ | ✅ |
| Next run behavior | Fast (cache hit) | Slow (full regeneration) |

---

### Function 10: `readGeneratedExcel(sheetName, customPath?)` — Data Reader

> **Scope:** Exported (public API)  
> **Purpose:** Reads all data rows from a specific sheet in a generated Excel file  
> **Parameters:**
> - `sheetName: string` — name of the sheet to read (e.g., `"Users"`, `"Products"`)
> - `customPath?: string` — optional custom file path (for worker-unique files)
>
> **Returns:** `Promise<ExcelRow[]>` — array of row objects like `{ FirstName: "User1", Email: "testuser1@test.com", ... }`  
> **Throws:** `Error` if `sheetName` is not found in `ddt-config.json`

This function **reads back** the generated data for use in test assertions:

```
Step 1: Find sheet definition
  sheetConfig = config.sheets.find(s => s.sheetName === sheetName)
  // Validates that the requested sheet exists in config
  // Throws descriptive error if not found

Step 2: Resolve file path
  filePath = customPath ?? path.resolve(baseDir, config.fileName)
  // Uses worker-unique path if provided
  // Falls back to default: generated/ddt-data.xlsx

Step 3: Read Excel
  return ExcelHelper.readExcel(filePath, sheetConfig.sheetName)
  // Delegates to ExcelHelper which:
  //   1. Opens the .xlsx file via exceljs
  //   2. Finds the worksheet by name
  //   3. Reads Row 1 as headers
  //   4. Maps remaining rows to { header: value } objects
  //   5. Skips empty rows
  //   6. Returns ExcelRow[]
```

**Return value example** (Users sheet, 3 rows):
```typescript
[
  { FirstName: "User1", LastName: "Last1", Email: "testuser1@test.com", Phone: "0587432156", Age: 42, IsActive: false },
  { FirstName: "User2", LastName: "Last2", Email: "testuser2@test.com", Phone: "0534218976", Age: 29, IsActive: true  },
  { FirstName: "User3", LastName: "Last3", Email: "testuser3@test.com", Phone: "0591234567", Age: 55, IsActive: false },
]
```

---

## Excel I/O Layer — `ExcelHelper.ts`

A static utility class wrapping the `exceljs` library. All methods are `static` — no instantiation needed.

### Method: `ExcelHelper.writeExcel(filePath, sheetName, headers, rows)`

> **Purpose:** Write a single sheet to a new `.xlsx` file  
> **Parameters:**
> - `filePath: string` — absolute path for the output file
> - `sheetName: string` — name of the Excel sheet tab
> - `headers: string[]` — column header names
> - `rows: ExcelRow[]` — array of data row objects
>
> **Returns:** `Promise<void>`

```
Step 1: Create directory if missing
  dir = path.dirname(filePath)
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })

Step 2: Create workbook and worksheet
  workbook = new ExcelJS.Workbook()
  sheet = workbook.addWorksheet(sheetName)

Step 3: Set columns (header names + width)
  sheet.columns = headers.map(h => ({ header: h, key: h, width: 20 }))
  // `key` matches the ExcelRow object keys so addRow knows which column gets which value

Step 4: Style header row
  headerRow = sheet.getRow(1)
  headerRow.font = { bold: true }
  headerRow.alignment = { horizontal: 'center' }

Step 5: Add data rows
  for (const row of rows) sheet.addRow(row)
  // ExcelJS maps row[key] → column with matching key

Step 6: Write to disk
  await workbook.xlsx.writeFile(filePath)
```

### Method: `ExcelHelper.writeMultiSheetExcel(filePath, sheets)`

> **Purpose:** Write multiple sheets into a single `.xlsx` workbook  
> **Parameters:**
> - `filePath: string` — absolute path for the output file
> - `sheets: { sheetName, headers, rows }[]` — array of sheet definitions
>
> **Returns:** `Promise<void>`

Same logic as `writeExcel` but loops over the `sheets` array, calling `workbook.addWorksheet()` for each:

```
workbook = new ExcelJS.Workbook()

for each { sheetName, headers, rows } in sheets:
  sheet = workbook.addWorksheet(sheetName)   // Add new tab
  sheet.columns = headers.map(...)           // Set columns
  sheet.getRow(1).font = { bold: true }      // Style header
  for (row of rows) sheet.addRow(row)        // Add data

await workbook.xlsx.writeFile(filePath)      // One write for all sheets
```

**Why one file with multiple sheets?** — Mirrors real-world test data files where Users and Products coexist in the same workbook, as testers typically organize related data in sheet tabs.

### Method: `ExcelHelper.readExcel(filePath, sheetName?)`

> **Purpose:** Read all data rows from a sheet and return as key-value objects  
> **Parameters:**
> - `filePath: string` — path to the `.xlsx` file
> - `sheetName?: string` — sheet to read (defaults to first sheet)
>
> **Returns:** `Promise<ExcelRow[]>`  
> **Throws:** `Error` if file not found or sheet not found

```
Step 1: Validate file exists
  if (!fs.existsSync(filePath)) throw Error("Excel file not found: ...")

Step 2: Read workbook
  workbook = new ExcelJS.Workbook()
  await workbook.xlsx.readFile(filePath)

Step 3: Find worksheet
  sheet = sheetName ? workbook.getWorksheet(sheetName) : workbook.worksheets[0]
  if (!sheet) throw Error("Worksheet not found...")

Step 4: Extract headers from Row 1
  headers = []
  sheet.getRow(1).eachCell((cell, colNumber) => {
    headers[colNumber] = String(cell.value)   // Map column index → header name
  })

Step 5: Extract data rows (Row 2+)
  rows = []
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return               // Skip header row
    obj = {}
    row.eachCell((cell, colNumber) => {
      header = headers[colNumber]
      if (header) obj[header] = cell.value    // Map cell → header key
    })
    if (Object.keys(obj).length > 0)          // Skip empty rows
      rows.push(obj)
  })

Step 6: Return
  return rows
```

**Key detail:** `headers[colNumber]` uses 1-based column indexing (ExcelJS convention), so `headers[1] = "FirstName"`, `headers[2] = "LastName"`, etc.

---

## Test Layer — `ddt-excel.spec.ts`

### Describe 1: Full Data Generation — `DDT - Excel Data-Driven Tests`

#### `beforeAll` Hook — Data Setup (runs once per worker)

This hook runs **before any test** in the describe block, once per Playwright worker. It ensures each worker has its own Excel file ready with generated data:

```
Step 1: Ensure the generated/ directory exists
  baseDir = resolves to src/data/ddt/generated/
  fs.mkdirSync(baseDir, { recursive: true })
  // recursive:true means it won't throw if the directory already exists

Step 2: Build worker-unique file path
  workerFilePath = path.resolve(baseDir, `ddt-all-worker${workerInfo.workerIndex}.xlsx`)
  // workerInfo.workerIndex: 0, 1, 2, or 3 (Playwright assigns unique indices)
  // Result: generated/ddt-all-worker0.xlsx, ddt-all-worker1.xlsx, etc.

Step 3: Smart config detection — should we regenerate?
  configChanged = isConfigChanged()
  // Calls the three-guard check (file exists? hash exists? hash matches?)

Step 4a: Config UNCHANGED → fast path (copy cached file)
  originalPath = path.resolve(baseDir, ddtConfig.fileName)  // ddt-data.xlsx
  fs.copyFileSync(originalPath, workerFilePath)
  // Binary copy — instant, no generation overhead
  // Console: "Config unchanged — copying cached ddt-data.xlsx → ddt-all-worker0.xlsx"

Step 4b: Config CHANGED → slow path (generate fresh)
  await generateAllExcelData(undefined, workerFilePath)
  // Generates all sheets (Users + Products) into the worker-unique file
  // Console: "Config changed — generating fresh data → ddt-all-worker0.xlsx"

Step 5: Read generated data into memory
  usersData = await readGeneratedExcel('Users', workerFilePath)
  productsData = await readGeneratedExcel('Products', workerFilePath)
  // Data is held in memory for all tests — no more file I/O during tests
  // This is critical for parallel safety: tests read from memory, not disk
```

**Why read into memory?** — If tests read from disk during execution, a slow worker could still be reading while another worker's `afterAll` deletes files. Memory isolation eliminates this.

#### `afterAll` Hook — Cache + Cleanup (runs once per worker)

```
Step 1: Worker 0 saves cache (if config changed)
  if (workerInfo.workerIndex === 0 && configChanged):
    fs.copyFileSync(workerFilePath, originalPath)
    // Promotes worker0's file to the "original" cached copy
    saveConfigHash()
    // Writes the current config's SHA-256 hash for future comparisons
    // Console: "Worker 0: saved ddt-all-worker0.xlsx → ddt-data.xlsx + hash"

  // Why only Worker 0?
  // - All workers generate identical data (same config, same rowCount)
  // - Only one needs to save the cache — Worker 0 is the convention
  // - If multiple workers saved, they'd overwrite each other (harmless but wasteful)

Step 2: Every worker deletes its own file
  try { fs.unlinkSync(workerFilePath) }
  catch { /* file may already be gone */ }
  // Worker 0 deletes ddt-all-worker0.xlsx
  // Worker 1 deletes ddt-all-worker1.xlsx, etc.
  // Each worker only knows its own path — no cross-worker deletion
```

#### Tests (6 tests per browser — 24 total)

| # | Test Name | Assertion Logic | Why This Test Exists |
|---|-----------|-----------------|----------------------|
| 1 | `should generate the configured number of user rows` | `expect(usersData.length).toBe(ddtConfig.rowCount)` — validates row count matches config (50) | Ensures `generateRows` loop ran the correct number of times |
| 2 | `should generate the configured number of product rows` | `expect(productsData.length).toBe(ddtConfig.rowCount)` | Same validation for the second sheet |
| 3 | `user rows should have all expected columns` | Loops all 8 expected headers, checks `expect(usersData[0]).toHaveProperty(header)` | Validates that `generateValue` produced values for every column definition |
| 4 | `user email should follow the startWord pattern` | Regex test on every row: `/^${emailStartWord}\d+@test\.com$/` — `emailStartWord` reads from config dynamically | Validates the `email` type in `generateValue` and that `startWord` is applied correctly |
| 5 | `product prices should be within configured range` | For every row: `price >= min && price <= max` using config's `min`/`max` values | Validates the `number` type stays within bounds |
| 6 | `each user row should have a valid email and age` | `email.includes('@')` + `age >= 18 && age <= 65` for every row | Cross-column validation — ensures multiple column types work together in the same row |

**Dynamic assertions note:** Tests 4, 5, and 6 read their expected values (`startWord`, `min`, `max`) from `ddtConfig` at runtime — never hardcoded. This means changing the config automatically updates what the tests expect.

---

### Describe 2: Single Sheet Override — `DDT - Single Sheet Override`

#### `beforeAll` Hook — Override Generation

```
Step 1: Build worker-unique path
  overrideFilePath = path.resolve(baseDir, `ddt-data-worker${workerInfo.workerIndex}.xlsx`)
  // Different naming pattern from Describe 1 to avoid conflicts

Step 2: Generate with row count override
  await generateAllExcelData({ rowCount: 10 }, overrideFilePath)
  // { rowCount: 10 } overrides the config's default (50)
  // All sheets get 10 rows instead of 50
  // Config merge: { ...ddtConfig, ...{ rowCount: 10 } } → rowCount becomes 10

Step 3: Read data into memory
  overrideUsersData = await readGeneratedExcel('Users', overrideFilePath)
  overrideProductsData = await readGeneratedExcel('Products', overrideFilePath)
```

#### `afterAll` Hook — Worker Cleanup

```
try { fs.unlinkSync(overrideFilePath) }
catch { /* ignore */ }
// Simpler than Describe 1 — no caching (override data isn't worth caching)
```

#### Tests (2 tests per browser — 8 total)

| # | Test Name | Assertion Logic | Why This Test Exists |
|---|-----------|-----------------|----------------------|
| 1 | `should generate a custom number of rows for Users` | `overrideUsersData.length === 10` + first row's `FirstName` starts with config's `startWord` + last row's `FirstName` ends with `"10"` | Validates row count override works AND that sequential naming is correct with custom counts |
| 2 | `should generate a custom number of rows for Products` | `overrideProductsData.length === 10` + first row has `ProductName` starting with `"Product"` + price within range | Validates override applies to all sheets equally |

**Dynamic startWord assertions in detail:**
```typescript
// Reads the startWord from config at runtime — not hardcoded
const startWord = ddtConfig.sheets
  .find(s => s.sheetName === 'Users')!
  .columns.find(c => c.header === 'FirstName')!
  .startWord;

// First row: startWord + "1" → e.g., "RFQ_NM1"
expect(String(overrideUsersData[0].FirstName)).toBe(`${startWord}1`);
// Last row: startWord + "10" → e.g., "RFQ_NM10"
expect(String(overrideUsersData[9].FirstName)).toBe(`${startWord}10`);
```

If you change `FirstName.startWord` from `"RFQ_NM"` to `"Customer"`, the tests automatically expect `"Customer1"` and `"Customer10"` — no code changes needed.

**Total: 8 tests × 4 browser projects = 32 test runs**

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
