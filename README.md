# Playwright POM Framework

Enterprise-grade test automation framework built with **Playwright** and the **Page Object Model (POM)** pattern. Supports UI, API, and hybrid (UI + API) testing with multi-browser and multi-environment execution.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Project Structure](#project-structure)
- [Layer-by-Layer Breakdown](#layer-by-layer-breakdown)
  - [Core Framework](#1-core-framework-srccore)
  - [Fixtures & Dependency Injection](#2-fixtures--dependency-injection-srcfixtures)
  - [Page Objects & UI](#3-page-objects--ui-srcpages)
  - [API Layer](#4-api-layer-srcapi)
  - [Test Data Generation](#5-test-data-generation-srcdata)
  - [Utilities](#6-utilities-srcutils)
  - [Test Suites](#7-test-suites-tests)
- [Configuration](#configuration)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Reports](#reports)
- [Design Patterns](#design-patterns)
- [Tech Stack](#tech-stack)

---

## Architecture Overview

```
+--------------------------------------------------------------+
|                       TEST SUITES                            |
|  UI / API / Hybrid / E2E API (parallel multi-user)           |
+--------------------------------------------------------------+
|                      FIXTURE LAYER                           |
|  test:    base -> auth -> data -> logging (auto)             |
|  apiTest: apiAuth -> data -> logging (auto) [parallel-safe]  |
+-----------------------------+--------------------------------+
|       PAGE OBJECTS          |         API CLIENTS            |
|  LoginPage                  |  AuthAPI (workerIndex?)        |
|  DashboardPage              |  UserAPI (workerIndex?)        |
|  CartPage                   |  OrderAPI (workerIndex?)       |
|  CheckoutPage               |                                |
|  UserProfilePage            +--------------------------------+
|                             |        INTERCEPTORS            |
|                             |  RequestInterceptor (headers)  |
|                             |  ResponseInterceptor (status)  |
|                             |  TokenManager (worker tokens)  |
+-----------------------------+--------------------------------+
|                    CORE FRAMEWORK                             |
|  BasePage | BaseAPI (+ Allure attachments)                   |
|  ConfigManager (Singleton) | Logger (Singleton)              |
+--------------------------------------------------------------+
|               UTILITIES & TEST DATA                          |
|  Builders | Factories | Helpers | Types                      |
+--------------------------------------------------------------+
```

---

## Project Structure

```
playwright-framework/
├── playwright.config.ts              # Playwright config (browsers, reporters, timeouts)
├── package.json                      # npm scripts and dependencies
├── tsconfig.json                     # TypeScript config with path aliases
├── .env.local                        # Environment variables – local
├── .env.staging                      # Environment variables – staging
├── .env.production                   # Environment variables – production
│
├── src/
│   ├── core/                         # LAYER 1: Framework foundation
│   │   ├── base/
│   │   │   ├── BasePage.ts           # Abstract base for all page objects
│   │   │   └── BaseAPI.ts            # Abstract base for API clients + interceptor integration
│   │   ├── config/
│   │   │   ├── ConfigManager.ts      # Singleton – loads environment-specific config
│   │   │   ├── EnvironmentConfig.ts  # Type definition for config shape
│   │   │   └── environments/
│   │   │       ├── local.config.ts   # Local: 30s timeout, 0 retries, headed
│   │   │       ├── staging.config.ts # Staging: 45s timeout, 1 retry, headless
│   │   │       └── production.config.ts # Production: 60s timeout, 2 retries, headless
│   │   └── logger/
│   │       └── Logger.ts            # Winston singleton – console + file transport
│   │
│   ├── fixtures/                     # LAYER 2: Dependency injection
│   │   ├── base.fixture.ts           # PageFactory + API clients
│   │   ├── auth.fixture.ts           # Pre-authenticated page state
│   │   ├── api-auth.fixture.ts       # Parallel-safe: workerIndex, workerAuth, worker API clients
│   │   ├── data.fixture.ts           # Auto-generated test data per test
│   │   ├── logging.fixture.ts        # Auto-logging & test annotations
│   │   └── index.ts                  # Merged exports: { test, expect } + { apiTest, expect }
│   │
│   ├── pages/                        # LAYER 3: Page Object Model
│   │   ├── LoginPage.ts              # Login form interactions
│   │   ├── DashboardPage.ts          # Product listing, cart, search
│   │   ├── CartPage.ts               # Cart items, checkout trigger
│   │   ├── CheckoutPage.ts          # Country selection, order placement
│   │   ├── UserProfilePage.ts        # Order history
│   │   └── locators/                 # Centralized CSS/XPath selectors
│   │       ├── login.locators.json
│   │       ├── dashboard.locators.json
│   │       ├── cart.locators.json
│   │       ├── checkout.locators.json
│   │       ├── orders.locators.json
│   │       └── index.ts              # Re-exports all locators as typed objects
│   │
│   ├── api/                          # LAYER 4: API testing layer
│   │   ├── clients/
│   │   │   ├── AuthAPI.ts            # Login (workerIndex?), loginShared(), register
│   │   │   ├── UserAPI.ts            # User registration, profile (workerIndex-aware)
│   │   │   └── OrderAPI.ts           # Products, order CRUD (workerIndex-aware)
│   │   ├── interceptors/
│   │   │   ├── RequestInterceptor.ts # Header mgmt + worker-aware token injection
│   │   │   ├── ResponseInterceptor.ts # Status classification, error extraction, logging
│   │   │   └── TokenManager.ts       # Worker-scoped token Map + shared token + resolveToken()
│   │   └── models/
│   │       ├── AuthModels.ts         # LoginRequest/Response, RegisterRequest/Response
│   │       ├── UserModels.ts         # User, CreateUserRequest, UserResponse
│   │       └── OrderModels.ts        # Product, Order, CreateOrderRequest/Response
│   │
│   ├── data/                         # LAYER 5: Test data management
│   │   ├── test-data.ts              # Static test data (credentials, products, messages)
│   │   ├── test-data.json            # JSON source data
│   │   ├── builders/                 # Builder pattern
│   │   │   ├── UserBuilder.ts        # Fluent user data builder
│   │   │   ├── OrderBuilder.ts       # Fluent order data builder
│   │   │   └── AddressBuilder.ts     # Fluent address data builder
│   │   └── factories/                # Factory pattern
│   │       ├── TestDataFactory.ts    # createUniqueUser(), createStandardOrder()
│   │       └── PageFactory.ts        # Page object factory (used by base.fixture)
│   │
│   └── utils/                        # LAYER 6: Shared utilities
│       ├── helpers/
│       │   ├── DateHelper.ts         # Date formatting, comparison
│       │   ├── StringHelper.ts       # Random strings, email generation
│       │   ├── WaitHelper.ts         # Network idle, URL change, retry logic
│       │   ├── TestAnnotation.ts     # Dynamic test annotation injection
│       │   └── SoftAssert.ts         # Collect assertion failures, attach summary to Allure
│       └── types/
│           └── global.d.ts           # ProcessEnv type extensions
│
├── tests/                            # LAYER 8: Test suites
│   ├── ui/                           # UI-only tests
│   │   ├── login.spec.ts             # Login form, valid/invalid credentials
│   │   ├── dashboard.spec.ts         # Products, cart, orders, sign out
│   │   └── user-profile.spec.ts      # Order history, back to shop
│   │
│   ├── api/                          # API-only tests
│   │   ├── auth-api.spec.ts          # Login/register API validation
│   │   ├── order-api.spec.ts         # Product listing, order retrieval
│   │   ├── user-api.spec.ts          # User registration, login flow
│   │   ├── parallel-api.spec.ts      # Worker-scoped parallel token tests
│   │   ├── shared-token-api.spec.ts  # Shared token parallel tests
│   │   └── e2e-api.spec.ts           # Multi-user E2E: Register→Login→Order→Verify→Delete
│   │
│   └── hybrid/                       # UI + API combined E2E tests
│       ├── order-workflow-e2e.spec.ts # Full order lifecycle (shared context)
│       └── user-creation-e2e.spec.ts  # API registration -> UI login verification
│
└── reports/                          # Generated output (gitignored)
    ├── allure-results/               # Raw Allure JSON results
    ├── allure-report/                # Single-file Allure HTML report
    ├── html/                         # Playwright HTML report
    └── screenshots/                  # Failure screenshots
```

---

## Layer-by-Layer Breakdown

### 1. Core Framework (`src/core/`)

The foundation layer that every other layer builds upon.

#### Base Classes (`src/core/base/`)

| Class | Pattern | Purpose |
|---|---|---|
| **BasePage** | Template Method | Abstract base for all page objects. Provides `navigate()`, `click()`, `fill()`, `getText()`, `isVisible()`, `selectOption()`, `uploadFile()`, `takeScreenshot()`. Every method auto-waits for element visibility before acting. Injects Winston logger. |
| **BaseAPI** | Template Method + Interceptors | Abstract base for API clients. Wraps Playwright's `request` context with typed `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`, `getRaw()` methods. Supports optional `workerIndex` for parallel-safe token resolution. Every HTTP method is wrapped in `test.step()` for Allure step nesting, and automatically attaches **Request** (method, URL, masked headers, body) and **Response** (status, URL, body) as JSON attachments to the Allure report via `test.info().attach()`. Uses `RequestInterceptor.getWorkerHeaders(workerIndex)` for unified header injection (worker → shared → legacy token). `handleResponse()` uses `ResponseInterceptor` for logging, status classification, and error extraction. Throws on non-2xx with parsed error message. |

#### Configuration (`src/core/config/`)

**ConfigManager** is a singleton that loads environment-specific settings based on the `ENV` variable:

```
ENV=local       -> local.config.ts      -> 30s timeout, 0 retries, headed mode
ENV=staging     -> staging.config.ts    -> 45s timeout, 1 retry, headless mode
ENV=production  -> production.config.ts -> 60s timeout, 2 retries, headless mode
```

Each config defines: `baseURL`, `apiURL`, `timeout`, `retries`, `headless`, and `credentials`.

#### Logger (`src/core/logger/`)

Winston-based singleton logger with two transports:

- **Console** – colorized output with timestamps
- **File** – writes to `reports/test-execution.log`

Format: `[2026-04-01 10:30:00] INFO: Logging in as user@example.com`

Log level controlled by `LOG_LEVEL` env variable (default: `info`).

### 2. Fixtures & Dependency Injection (`src/fixtures/`)

Playwright fixtures are layered and merged together. Tests import `{ test, expect }` from `src/fixtures/index.ts` which combines all four layers via `mergeTests()`.

| Fixture | Auto | What It Provides |
|---|---|---|
| **base.fixture** | No | `pageFactory`, `loginPage`, `dashboardPage`, `cartPage`, `checkoutPage`, `authAPI`, `orderAPI`, `softAssert` – page objects created via `PageFactory` (e.g. `pageFactory.createLoginPage()`), API clients lazily instantiated per test, `SoftAssert` instance per test |
| **auth.fixture** | No | `authenticatedPage` – navigates to login, performs login using ConfigManager credentials. Call explicitly when needed. |
| **api-auth.fixture** | No | `workerIndex`, `workerAuth` (LoginResponse), `workerAuthAPI`, `workerUserAPI`, `workerOrderAPI` – parallel-safe API clients with per-worker token isolation |
| **data.fixture** | No | `testUser` (unique user via factory), `testOrder` (standard order) – fresh data per test |
| **logging.fixture** | Yes | Automatically annotates every test with feature name, suite, file, and project. Logs test start/finish with duration and pass/fail status. Zero configuration. |

#### Fixture Composition

| Export | Fixtures Merged | Use Case |
|--------|----------------|----------|
| `test` | baseFixture + authFixture + dataFixture + loggingFixture | UI tests, hybrid tests, sequential API tests |
| `apiTest` | apiAuthFixture + dataFixture + loggingFixture | Parallel API tests with worker-scoped tokens |

**Usage in tests:**
```typescript
// UI / Hybrid / Sequential API tests
import { test, expect } from '../../src/fixtures/index';

test('my test', async ({ loginPage, dashboardPage, page }) => {
  // All fixtures automatically injected
});

// Parallel API tests (worker-scoped tokens)
import { apiTest as test, expect } from '../../src/fixtures/index';

test('parallel test', async ({ workerOrderAPI, workerAuth }) => {
  // Each worker gets its own auth token — no cross-contamination
  const response = await workerOrderAPI.getAllProducts();
  expect(response.data).toBeDefined();
});
```

---

### 3. Page Objects & UI (`src/pages/`)

Each page class extends `BasePage` and encapsulates a single page's locators and interactions.

#### Page Object Classes

| Page | Path | Key Methods |
|---|---|---|
| **LoginPage** | `#/auth/login` | `login(email, password)`, `getErrorMessage()`, `clickForgotPassword()`, `clickRegister()` |
| **DashboardPage** | `#/dashboard/dash` | `addProductToCart(name)`, `getProductCount()`, `getProductNames()`, `searchProduct()`, `goToCart()`, `goToOrders()`, `signOut()`. Auto-waits for spinner overlay. |
| **CartPage** | `#/dashboard/cart` | `isProductInCart(name)`, `removeProduct(name)`, `checkout()`, `getTotalPrice()`, `getCartItemCount()` |
| **CheckoutPage** | `#/dashboard/order` | `selectCountry(prefix)` (autocomplete), `placeOrder()`, `getConfirmationMessage()`, `getOrderId()`, `clickOrdersLink()` |
| **UserProfilePage** | `#/dashboard/myorders` | `getOrderCount()`, `getOrderIds()`, `viewOrderById(id)`, `hasNoOrders()`, `goBackToShop()` |

#### Locators (`src/pages/locators/`)

All selectors are centralized in JSON files, imported and re-exported as typed objects through `index.ts`. This ensures:
- Single source of truth for selectors
- Easy maintenance when UI changes
- Type-safe access: `LoginLocators.emailInput`

---

### 4. API Layer (`src/api/`)

The API layer uses a **centralized interceptor architecture**. API clients contain zero header or response-handling logic — everything flows through `BaseAPI` which delegates to the interceptors.

#### Interceptor Pipeline

```
Request Flow:
  API Client method -> BaseAPI.post/get/etc -> RequestInterceptor.getHeaders() -> Playwright request

Response Flow:
  Playwright response -> ResponseInterceptor.logResponse() -> isSuccess() check
    -> Success (2xx): JSON.parse -> return typed T
    -> Failure (4xx/5xx): extractErrorMessage() -> logger.error() -> throw Error
```

#### Token Management

**`AuthAPI.login()` is the single point where the auth token is set.** Three token strategies are supported:

| Strategy | Method | Use Case | Token Storage |
|----------|--------|----------|---------------|
| **Worker-scoped** | `authAPI.login(creds)` with `workerIndex` | Each worker authenticates independently | `TokenManager.workerTokens` Map |
| **Shared token** | `authAPI.loginShared(creds)` | Login once, all workers share | `TokenManager.sharedToken` |
| **Legacy** | `authAPI.login(creds)` without `workerIndex` | Backward compatible, single-threaded | `RequestInterceptor.token` |

Token resolution priority: **worker → shared → legacy → null** (via `TokenManager.resolveToken()`).

```typescript
// Legacy: login once, token is globally available
const authAPI = new AuthAPI(request);
await authAPI.login({ userEmail: email, userPassword: password });
const orderAPI = new OrderAPI(request);
const products = await orderAPI.getAllProducts();  // No token param needed

// Parallel: each worker gets its own token
const authAPI = new AuthAPI(request, workerIndex);
await authAPI.login(credentials); // → TokenManager.workerTokens.set(workerIndex, token)
const orderAPI = new OrderAPI(request, workerIndex);
const products = await orderAPI.getAllProducts();  // Uses worker's own token
```

#### Interceptors (`src/api/interceptors/`)

| Interceptor | Purpose | Key Methods |
|---|---|---|
| **RequestInterceptor** | Manages auth tokens and builds request headers. Supports legacy single token, worker-scoped tokens, and shared tokens. `getWorkerHeaders(workerIndex?)` resolves tokens via `TokenManager`. | `setAuthToken()`, `getHeaders()`, `setWorkerAuthToken(idx, token)`, `clearWorkerAuthToken(idx)`, `setSharedAuthToken(token)`, `clearSharedAuthToken()`, `getWorkerHeaders(idx?)` |
| **ResponseInterceptor** | Logs every response (status + URL), classifies status codes, and extracts error messages from response bodies. | `logResponse(response)`, `isSuccess(response)`, `isClientError(response)`, `isServerError(response)`, `extractErrorMessage(response)` |
| **TokenManager** | Static class managing per-worker token Map + shared token fallback. `resolveToken(workerIndex?)` returns the highest-priority token. | `setWorkerToken(idx, token)`, `getWorkerToken(idx)`, `clearWorkerToken(idx)`, `setSharedToken(token)`, `resolveToken(idx?)`, `clearAll()` |

#### API Clients (`src/api/clients/`)

Each client extends `BaseAPI` and maps to a domain area. **No client handles tokens or headers directly** — `BaseAPI` + interceptors do that automatically.

| Client | Endpoints | Key Methods |
|---|---|---|
| **AuthAPI** | `/auth/login`, `/auth/register` | `login(credentials)` -> `LoginResponse` (auto-sets token via `RequestInterceptor`), `register(data)` -> `RegisterResponse` |
| **UserAPI** | `/auth/register`, `/user/*` | `registerUser(data)` -> `RegisterResponse`, `getUserDetails(userId)` -> `UserResponse` |
| **OrderAPI** | `/product/*`, `/order/*` | `getAllProducts()` -> `ProductListResponse`, `createOrder(data)` -> `CreateOrderResponse`, `getOrdersForCustomer(userId)` -> `OrderListResponse`, `deleteOrder(orderId)` -> `{ message }` |

#### API Models (`src/api/models/`)

TypeScript interfaces for all request/response shapes:

- **AuthModels** – `LoginRequest`, `LoginResponse`, `RegisterRequest`, `RegisterResponse`
- **UserModels** – `User`, `CreateUserRequest`, `UpdateUserRequest`, `UserResponse`
- **OrderModels** – `Product`, `OrderItem`, `CreateOrderRequest`, `CreateOrderResponse`, `Order`, `OrderListResponse`, `ProductListResponse`

---

### 5. Test Data Generation (`src/data/`)

#### Static Data (`test-data.ts` / `test-data.json`)

Pre-defined test constants:

```typescript
credentials.valid    // { email: 'testpom2026@example.com', password: 'Test@12345' }
credentials.invalid  // { email: 'invalid@example.com', password: 'wrong_password' }
products.adidasOriginal  // 'ADIDAS ORIGINAL'
products.zaraCoat3       // 'ZARA COAT 3'
checkout.countryPrefix   // 'Ind'
messages.orderConfirmation  // 'thankyou for the order'
```

#### Builders (Builder Pattern)

Fluent API for constructing test data objects:

```typescript
const user = new UserBuilder()
  .withEmail('custom@test.com')
  .withFirstName('John')
  .withOccupation('Engineer')
  .build();

const order = new OrderBuilder()
  .addProduct('product123', 'India')
  .build();

const address = new AddressBuilder()
  .withCity('Mumbai')
  .withCountry('IN')
  .build();
```

#### Factories (Factory Pattern)

Static methods for common test data creation:

```typescript
TestDataFactory.createUniqueUser()      // User with timestamp-based unique email
TestDataFactory.createStandardOrder(id) // Order for product in India
TestDataFactory.createStandardAddress() // Default address object

PageFactory.createLoginPage(page)       // Page object instantiation via factory
PageFactory.createDashboardPage(page)   // Used by base.fixture for DI
```

---

### 6. Utilities (`src/utils/`)

#### Helpers (`src/utils/helpers/`)

| Helper | Key Methods |
|---|---|
| **DateHelper** | `today()`, `daysFromNow(n)`, `formatDate(date, 'iso'|'us'|'eu')`, `isWithinMinutes(date, n)` |
| **StringHelper** | `generateRandomString(len)`, `generateEmail(prefix)`, `generateUsername(prefix)`, `capitalize()`, `truncate()` |
| **WaitHelper** | `waitForNetworkIdle(page)`, `waitForUrlChange(page, currentUrl)`, `waitForResponse(page, pattern)`, `delay(ms)`, `retryAction(fn, retries, delay)` |
| **TestAnnotation** | `annotate(testInfo, { feature, owner, severity })` – dynamically adds Allure annotations |
| **SoftAssert** | `assertEqual(desc, actual, expected)`, `assertTrue(desc, actual)`, `assertFalse(desc, actual)`, `assertContains(desc, actual, expected)`, `assertGreaterThan(desc, actual, expected)`, `assertAll()` – collects failures without stopping, attaches JSON summary to Allure/HTML reports |

#### Types (`src/utils/types/`)

- **global.d.ts** – Extends `NodeJS.ProcessEnv` with `ENV`, `BASE_URL`, `API_URL`, `LOG_LEVEL`, etc.

---

### 7. Test Suites (`tests/`)

#### UI Tests (`tests/ui/`)

Pure browser-based tests that validate the user interface:

| Test File | Tests | Description |
|---|---|---|
| **login.spec.ts** | 3 | Display login form, valid login -> dashboard redirect, invalid login -> error toast |
| **dashboard.spec.ts** | 6 | Serial mode. Products display, product names, add to cart, navigate to cart/orders, sign out |
| **user-profile.spec.ts** | 3 | Navigate to orders, display orders or no-orders state, back to shop |

#### API Tests (`tests/api/`)

Pure API tests without browser interaction. Tests call `AuthAPI.login()` in `beforeAll` to set the token once, then all subsequent API calls use it automatically:

| Test File | Tests | Description |
|---|---|---|
| **auth-api.spec.ts** | 3 | Valid login returns token, invalid login fails, register new user |
| **user-api.spec.ts** | 2 | Register user, login with new user |
| **order-api.spec.ts** | 2 | Get all products (auth required), get customer orders (auth required) |
| **parallel-api.spec.ts** | 4 | Worker-scoped parallel tests using `apiTest` fixture with `workerAuth` |
| **shared-token-api.spec.ts** | 4 | Shared token tests — login once in `beforeAll`, all workers share |
| **e2e-api.spec.ts** | N×6 | Multi-user E2E scenario: Register → Login → Browse → Order → Verify → Delete. Login once in Step 2, token shared across Steps 3–6 via `RequestInterceptor.setAuthToken()`. `N` = `NUM_USERS` env var (default 3). Serial within each user, parallel across users. |

#### Hybrid/E2E Tests (`tests/hybrid/`)

Combined UI + API tests for end-to-end workflows:

| Test File | Tests | Description |
|---|---|---|
| **order-workflow-e2e.spec.ts** | 2 | Serial mode with **shared browser context**. Clears cookies/localStorage between tests, re-navigates on same context. Test 1: full order lifecycle. Test 2: multi-product checkout. |
| **user-creation-e2e.spec.ts** | 2 | Test 1: Register via API -> login via UI -> verify dashboard. Test 2: Login -> verify product catalog. |

---

## Configuration

### Environment Variables (`.env.*` files)

| Variable | Description | Example |
|---|---|---|
| `BASE_URL` | Application base URL | `https://rahulshettyacademy.com/client/` |
| `API_URL` | API base URL | `https://rahulshettyacademy.com/api/ecom` |
| `ENV` | Environment name | `local`, `staging`, `production` |
| `TEST_USERNAME` | Test account email | `testpom2026@example.com` |
| `TEST_PASSWORD` | Test account password | `Test@12345` |
| `LOG_LEVEL` | Winston log level | `info`, `debug`, `warn`, `error` |

### TypeScript Path Aliases

```
@core/*     -> src/core/*
@pages/*    -> src/pages/*
@api/*      -> src/api/*
@data/*     -> src/data/*
@fixtures/* -> src/fixtures/*
@utils/*    -> src/utils/*
```

### Playwright Projects

| Project | Device / Mode |
|---|---|
| `api` | API-only (no browser), `fullyParallel: true` |
| `chromium` | Desktop Chrome |
| `firefox` | Desktop Firefox |
| `webkit` | Desktop Safari |
| `mobile-chrome` | Pixel 5 |

---

## Installation

```bash
cd playwright-framework
npm install
npx playwright install
```

---

## Running Tests

Every test command automatically:
1. **Cleans** old reports (`rimraf` + `mkdirp`)
2. **Runs** the tests
3. **Generates** a single-file Allure HTML report (`allure-commandline --single-file`)
4. **Opens** the report in the browser

> Reports are always generated, even when tests fail.

### Run All Tests

```bash
npm test
```

### By Test Type

| Command | Description |
|---|---|
| `npm run test:ui` | All UI tests |
| `npm run test:api` | All API tests |
| `npm run test:hybrid` | All hybrid E2E tests |
| `npm run test:regression` | Full regression suite |

### Parallel API & E2E API Tests

| Command | Description |
|---|---|
| `npm run test:e2e:api` | E2E multi-user API scenario (default workers) |
| `npm run test:e2e:api:w1` | E2E API scenario with 1 worker (sequential) |
| `npm run test:e2e:api:w2` | E2E API scenario with 2 workers |
| `npm run test:e2e:api:w4` | E2E API scenario with 4 workers |
| `npm run test:api:parallel` | All API tests in parallel (4 workers) |

Control the number of simulated users via the `NUM_USERS` environment variable:

```bash
# 5 users across 4 workers
cross-env NUM_USERS=5 npm run test:e2e:api:w4

# 10 users across 2 workers
cross-env NUM_USERS=10 npm run test:e2e:api:w2
```

Each user runs 6 serial steps (Register → Login → Browse → Order → Verify → Delete). Users execute in parallel across workers.

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

After each test run, a **self-contained** `index.html` is generated at `reports/allure-report/index.html` and opens automatically. No server required — can be shared as a single file.

#### Allure Request/Response Attachments

Every API call is automatically logged in the Allure report with nested step trees:

```
POST /api/ecom/auth/login
  ├── [Request]  → { method, endpoint, headers (masked), body }
  └── [Response] → { status, url, body }
```

- **Request attachments** include method, endpoint, masked authorization headers (`eyJhbGciOiJIUzI1NiIs...***`), and request body (if any).
- **Response attachments** include HTTP status, URL, and full response body (JSON or text).
- Attachments use Playwright's native `test.info().attach()` which the `allure-playwright` reporter captures automatically.

To manually regenerate or open:

```bash
npm run allure:generate    # Generate report from results
npm run allure:open        # Open the report in browser
```

### Playwright HTML Report

```bash
npm run report
```

### Execution Log

Detailed test execution log at `reports/test-execution.log` with timestamps for every action.

---

## Design Patterns

| Pattern | Where Used | Purpose |
|---|---|---|
| **Page Object Model** | `src/pages/` | Encapsulates page interactions behind clean methods |
| **Template Method** | `BasePage`, `BaseAPI` | Common behavior in base class, specifics in subclasses |
| **Interceptor** | `RequestInterceptor`, `ResponseInterceptor` | Centralized request header injection and response processing in `BaseAPI` |
| **Singleton** | `ConfigManager`, `Logger` | Single instance of config and logger across framework |
| **Builder** | `UserBuilder`, `OrderBuilder`, `AddressBuilder` | Fluent API for constructing complex test data |
| **Factory** | `TestDataFactory`, `PageFactory` | Centralized object creation. `PageFactory` is used in `base.fixture` for page object instantiation. |
| **Dependency Injection** | `src/fixtures/` | Playwright fixtures inject page objects and clients into tests |

---

## Tech Stack

| Tool | Version | Purpose |
|---|---|---|
| [Playwright](https://playwright.dev/) | ^1.50.0 | Browser automation & API testing |
| [TypeScript](https://www.typescriptlang.org/) | ^5.7.0 | Type-safe test code |
| [Allure](https://allurereport.org/) | 3.x (reporter) + 2.x (CLI) | Test reporting with single-file HTML |
| [Winston](https://github.com/winstonjs/winston) | ^3.17.0 | Structured logging (console + file) |
| [dotenv](https://github.com/motdotla/dotenv) | ^16.4.7 | Environment variable management |
| [cross-env](https://github.com/kentcdodds/cross-env) | ^7.0.3 | Cross-platform env variable injection |
| [rimraf](https://github.com/isaacs/rimraf) | ^6.1.3 | Cross-platform directory cleanup |
| [mkdirp](https://github.com/isaacs/node-mkdirp) | ^3.0.1 | Cross-platform directory creation |
