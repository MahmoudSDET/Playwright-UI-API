// EN: Import Playwright types and base component class
import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../core/base/BaseComponent';
// EN: Import data table selectors
import { DataTableLocators } from '../locators';

/**
 * EN: Reusable DataTable component for interacting with HTML tables.
 *     Provides methods to get row/header data and click rows.
 *     ÙŠÙˆÙØ± Ø¯ÙˆØ§Ù„ Ù„Ù„Ø­ØµÙˆÙ„ Ø¹Ù„Ù‰ Ø¨ÙŠØ§Ù†Ø§Øª Ø§Ù„ØµÙÙˆÙ/Ø§Ù„Ø¹Ù†Ø§ÙˆÙŠÙ† ÙˆØ§Ù„Ø¶ØºØ· Ø¹Ù„Ù‰ Ø§Ù„ØµÙÙˆÙ.
 */
export class DataTable extends BaseComponent {
  // EN: Locators for table rows and headers | AR: Ù…Ø­Ø¯Ø¯Ø§Øª ØµÙÙˆÙ ÙˆØ¹Ù†Ø§ÙˆÙŠÙ† Ø§Ù„Ø¬Ø¯ÙˆÙ„
  private readonly rows: Locator;
  private readonly headers: Locator;

  // EN: Initialize with page and optional custom root selector
  constructor(page: Page, rootSelector = DataTableLocators.defaultRoot) {
    const root = page.locator(rootSelector);
    super(page, root);
    this.rows = root.locator(DataTableLocators.rows);
    this.headers = root.locator(DataTableLocators.headers);
  }

  // EN: Get the number of rows in the table
  async getRowCount(): Promise<number> {
    return this.rows.count();
  }

  // EN: Get all header texts as an array
  async getHeaderTexts(): Promise<string[]> {
    return this.headers.allTextContents();
  }

  // EN: Get text content of a specific cell by row and column index
  async getCellText(row: number, col: number): Promise<string> {
    return (await this.rows.nth(row).locator(DataTableLocators.cell).nth(col).textContent()) ?? '';
  }

  // EN: Click on a specific row by index
  async clickRow(index: number): Promise<void> {
    await this.rows.nth(index).click();
  }

  // EN: Get all row texts as an array
  async getRowTexts(): Promise<string[]> {
    return this.rows.allTextContents();
  }
}
