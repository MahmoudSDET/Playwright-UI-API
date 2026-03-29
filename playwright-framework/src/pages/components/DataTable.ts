import { Page, Locator } from '@playwright/test';
import { BaseComponent } from '../../core/base/BaseComponent';

export class DataTable extends BaseComponent {
  private readonly rows: Locator;
  private readonly headers: Locator;

  constructor(page: Page, rootSelector = 'table') {
    const root = page.locator(rootSelector);
    super(page, root);
    this.rows = root.locator('tbody tr');
    this.headers = root.locator('thead th');
  }

  async getRowCount(): Promise<number> {
    return this.rows.count();
  }

  async getHeaderTexts(): Promise<string[]> {
    return this.headers.allTextContents();
  }

  async getCellText(row: number, col: number): Promise<string> {
    return (await this.rows.nth(row).locator('td').nth(col).textContent()) ?? '';
  }

  async clickRow(index: number): Promise<void> {
    await this.rows.nth(index).click();
  }

  async getRowTexts(): Promise<string[]> {
    return this.rows.allTextContents();
  }
}
