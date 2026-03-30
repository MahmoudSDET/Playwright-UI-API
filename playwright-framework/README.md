# Playwright POM Framework

Enterprise-grade test automation framework built with **Playwright** and the **Page Object Model (POM)** pattern. Supports UI, API, and hybrid (UI + API) testing with multi-browser and multi-environment execution.

---

## Project Structure

```
playwright-framework/
├── playwright.config.ts          # Playwright configuration (browsers, reporters, timeouts)
├── package.json                  # Scripts, dependencies
├── tsconfig.json                 # TypeScript configuration with path aliases
├── .env.local                    # Environment variables – local
├── .env.staging                  # Environment variables – staging
├── .env.production               # Environment variables – production
│
├── src/
│   ├── core/
│   │   ├── base/                 # BasePage – shared page helpers (click, fill, wait, etc.)
│   │   ├── config/               # ConfigManager – loads env-based configuration
│   │   ├── logger/               # Winston logger setup
│   │   └── strategies/           # Strategy pattern implementations
│   │
│   ├── pages/                    # Page Object classes
│   │   ├── LoginPage.ts
│   │   ├── DashboardPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutPage.ts
│   │   ├── UserProfilePage.ts
│   │   ├── components/           # Reusable page components
│   │   └── locators/             # Centralized locator definitions
│   │
│   ├── api/
│   │   ├── clients/              # API client classes (AuthAPI, UserAPI, OrderAPI)
│   │   ├── interceptors/         # Request/response interceptors
│   │   └── models/               # API request/response models
│   │
│   ├── services/                 # Business logic services (AuthService, UserService)
│   │
│   ├── fixtures/                 # Playwright test fixtures
│   │   ├── base.fixture.ts       # Core fixtures – page objects & API clients
│   │   ├── auth.fixture.ts       # Authentication fixture
│   │   ├── data.fixture.ts       # Test data fixture
│   │   ├── logging.fixture.ts    # Logging fixture (auto-logs test lifecycle)
│   │   └── index.ts              # Merged fixture export (import { test, expect })
│   │
│   ├── data/
│   │   ├── test-data.ts          # Static test data (credentials, products, etc.)
│   │   ├── test-data.json        # JSON test data
│   │   ├── builders/             # Builder pattern for test data
│   │   ├── factories/            # Factory pattern for test data
│   │   └── fixtures/             # Data fixtures
│   │
│   └── utils/
│       ├── constants/            # App-wide constants
│       ├── decorators/           # TypeScript decorators
│       ├── helpers/              # Utility helper functions
│       └── types/                # TypeScript type definitions
│
├── tests/
│   ├── ui/                       # UI-only tests
│   │   ├── login.spec.ts
│   │   ├── dashboard.spec.ts
│   │   └── user-profile.spec.ts
│   │
│   ├── api/                      # API-only tests
│   │   ├── auth-api.spec.ts
│   │   ├── order-api.spec.ts
│   │   └── user-api.spec.ts
│   │
│   └── hybrid/                   # UI + API combined tests
│       ├── order-workflow-e2e.spec.ts
│       └── user-creation-e2e.spec.ts
│
└── reports/
    ├── allure-results/           # Raw Allure test results
    ├── allure-report/            # Generated single-file Allure HTML report
    ├── html/                     # Playwright HTML report
    └── screenshots/              # Failure screenshots
```

---

## Prerequisites

- **Node.js** >= 18
- **npm** >= 9

## Installation

```bash
cd playwright-framework
npm install
npx playwright install
```

---

## Running Tests

Every test command automatically:
1. **Cleans** old reports
2. **Runs** the tests
3. **Generates** a single-file Allure HTML report
4. **Opens** the report in the browser

> Reports are generated even when tests fail.

### Run All Tests

```bash
npm test
```

### By Test Type

| Command | Description |
|---|---|
| `npm run test:ui` | All UI tests |
| `npm run test:api` | All API tests |
| `npm run test:hybrid` | All hybrid (E2E) tests |
| `npm run test:regression` | Full regression suite |

### By Browser + Environment

Commands follow the pattern: `test:<type>:<browser>:<env>`

**Browsers:** `chromium`, `firefox`, `webkit`
**Environments:** *(default: local)*, `staging`, `production`

#### UI Tests

| Local | Staging | Production |
|---|---|---|
| `npm run test:ui:chromium` | `npm run test:ui:chromium:staging` | `npm run test:ui:chromium:production` |
| `npm run test:ui:firefox` | `npm run test:ui:firefox:staging` | `npm run test:ui:firefox:production` |
| `npm run test:ui:webkit` | `npm run test:ui:webkit:staging` | `npm run test:ui:webkit:production` |

#### API Tests

| Local | Staging | Production |
|---|---|---|
| `npm run test:api:chromium` | `npm run test:api:chromium:staging` | `npm run test:api:chromium:production` |
| `npm run test:api:firefox` | `npm run test:api:firefox:staging` | `npm run test:api:firefox:production` |
| `npm run test:api:webkit` | `npm run test:api:webkit:staging` | `npm run test:api:webkit:production` |

#### Hybrid Tests

| Local | Staging | Production |
|---|---|---|
| `npm run test:hybrid:chromium` | `npm run test:hybrid:chromium:staging` | `npm run test:hybrid:chromium:production` |
| `npm run test:hybrid:firefox` | `npm run test:hybrid:firefox:staging` | `npm run test:hybrid:firefox:production` |
| `npm run test:hybrid:webkit` | `npm run test:hybrid:webkit:staging` | `npm run test:hybrid:webkit:production` |

### By Environment (All Browsers)

```bash
npm run test:staging
npm run test:production
```

### Debug Mode

```bash
npm run test:debug
```

---

## Reports

### Allure Report (Single-File HTML)

After each test run, a **self-contained** `index.html` is generated at `reports/allure-report/index.html`. It opens automatically.

To manually regenerate or open:

```bash
npm run allure:generate    # Generate report from results
npm run allure:open        # Open the report
```

### Playwright HTML Report

```bash
npm run report
```

---

## Environment Configuration

Environment variables are loaded from `.env.<env>` files via `dotenv`:

| File | Used When |
|---|---|
| `.env.local` | `ENV=local` (default) |
| `.env.staging` | `ENV=staging` |
| `.env.production` | `ENV=production` |

Key variables:
- `BASE_URL` – Application base URL
- Credentials and other env-specific config

---

## Key Design Patterns

| Pattern | Usage |
|---|---|
| **Page Object Model** | Each page has a class with locators and actions |
| **Fixtures** | Layered Playwright fixtures for DI (base → auth → data → logging) |
| **Builder / Factory** | Test data creation |
| **Strategy** | Interchangeable behavior implementations |
| **Service Layer** | Business logic abstraction over API clients |

---

## Tech Stack

| Tool | Purpose |
|---|---|
| [Playwright](https://playwright.dev/) | Browser automation & API testing |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe test code |
| [Allure](https://allurereport.org/) | Test reporting (single-file HTML) |
| [Winston](https://github.com/winstonjs/winston) | Structured logging |
| [dotenv](https://github.com/motdotla/dotenv) | Environment variable management |
| [cross-env](https://github.com/kentcdodds/cross-env) | Cross-platform env variable injection |
