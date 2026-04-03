# Project Guidelines — Playwright Enterprise Framework

## Architecture

Layered test automation framework: **Tests → Fixtures → Pages/API Clients → Core → Utilities**

- **Core** (`src/core/`): Abstract base classes (`BasePage`, `BaseAPI`), singleton `ConfigManager`, Winston `Logger`
- **Fixtures** (`src/fixtures/`): Playwright fixture-based DI — merged into `test` (UI) and `apiTest` (API) exports from `@fixtures/index`
- **Pages** (`src/pages/`): Page Object Model extending `BasePage`; locators live in `src/pages/locators/*.locators.json`
- **API Clients** (`src/api/clients/`): Extend `BaseAPI`; worker-aware parallel token support via `TokenManager`
- **Data** (`src/data/`): Builder + Factory patterns (e.g., `UserBuilder`, `TestDataFactory`); static data in `test-data.json`
- **Utilities** (`src/utils/`): `SoftAssert`, `DateHelper`, `StringHelper`, `WaitHelper`

See [Framework-Architecture.md](../Framework-Architecture.md) for execution flows and class diagrams.

## Build and Test

```bash
npm install                    # Install dependencies
npm test                       # Run ALL tests + generate Allure report
npm run test:ui                # UI tests only
npm run test:api               # API tests only
npm run test:hybrid            # Hybrid (UI+API) tests only
npm run test:ui:chromium       # Single browser
npm run test:api:staging       # Environment-specific (cross-env ENV=staging)
npm run allure:generate        # Generate Allure report
npm run allure:open            # Open Allure report
npm run clean:reports          # Clean all report artifacts
```

## Code Style

### Naming

| Artifact | Convention | Example |
|----------|-----------|---------|
| Page objects | `PascalCase.ts` | `LoginPage.ts` |
| Test files | `kebab-case.spec.ts` | `auth-api.spec.ts` |
| Locator files | `kebab-case.locators.json` | `login.locators.json` |
| Fixtures | `kebab-case.fixture.ts` | `api-auth.fixture.ts` |
| Builders/Factories | `PascalCase.ts` | `UserBuilder.ts` |
| API clients | `PascalCaseAPI.ts` | `AuthAPI.ts`, `OrderAPI.ts` |

### Path Aliases (tsconfig)

Always use path aliases, never relative paths:

```typescript
import { LoginPage } from '@pages/LoginPage';
import { AuthAPI } from '@api/clients/AuthAPI';
import { test, expect } from '@fixtures/index';
import { TestDataFactory } from '@data/factories/TestDataFactory';
import { ConfigManager } from '@core/config/ConfigManager';
import { SoftAssert } from '@utils/helpers/SoftAssert';
```

## Conventions

### Test Types

- **UI tests** (`tests/ui/`): Import `test` from `@fixtures/index`. Use page object fixtures (`loginPage`, `dashboardPage`, etc.). Manual navigation required.
- **API tests** (`tests/api/`): Import `apiTest as test` from `@fixtures/index`. Use `workerAuth` fixture for parallel-safe token management. Configure `{ mode: 'parallel' }`.
- **Hybrid tests** (`tests/hybrid/`): Use `serial` mode with manual browser context lifecycle. Mix UI interactions + API verification.

### Page Objects

- Extend `BasePage` — use its `click()`, `fill()`, `getText()`, `navigate()` rather than raw Playwright calls
- Initialize locators in constructor from JSON locator files (`src/pages/locators/`)
- Methods should represent user-visible actions (e.g., `login()`, `addProductToCart()`)

### API Clients

- Extend `BaseAPI` — its methods auto-wrap in `test.step()` and attach request/response to Allure
- Three token modes: legacy (global), worker-scoped (`TokenManager.workerTokens[workerIndex]`), shared (`TokenManager.sharedToken`)
- For parallel tests, always pass `workerIndex` to API client constructors

### Test Data

- Use `TestDataFactory` for unique per-test data (timestamps in emails/names)
- Use `UserBuilder`/`OrderBuilder` for custom data with fluent API
- Static credentials and product data live in `src/data/test-data.json`

### Fixtures

- `base.fixture.ts` — page objects, API clients, soft assert
- `api-auth.fixture.ts` — worker-scoped auth for parallel API tests
- `data.fixture.ts` — fresh `testUser`/`testOrder` per test
- `logging.fixture.ts` — auto test annotation logging
- All merged and re-exported from `src/fixtures/index.ts`

## Environment

- Config via `ENV` env var → loads `src/core/config/environments/{env}.config.ts`
- Defaults to `local`; also supports `staging` and `production`
- `.env.local`, `.env.staging`, `.env.production` in project root
- Base URL: `https://rahulshettyacademy.com/client/` | API: `https://rahulshettyacademy.com/api/ecom`

## Pitfalls

- **`forbidOnly`** is enabled in CI — never commit `.only()` on tests
- **Hybrid tests must be serial** — they share browser context across test steps
- **API parallel tests** require worker-scoped tokens — always use `apiTest` fixture, not plain `test`
- **Allure steps** are automatic in `BaseAPI` — don't wrap API client calls in extra `test.step()` blocks
- **Locator JSONs** are the source of truth for selectors — don't hardcode selectors in page objects
