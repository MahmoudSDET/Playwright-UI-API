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
  - [Business Logic Services](#5-business-logic-services-srcservices)
  - [Test Data Generation](#6-test-data-generation-srcdata)
  - [Utilities](#7-utilities-srcutils)
  - [Test Suites](#8-test-suites-tests)
- [Configuration](#configuration)
- [Installation](#installation)
- [Running Tests](#running-tests)
- [Reports](#reports)
- [Design Patterns](#design-patterns)
- [Tech Stack](#tech-stack)

---

## Architecture Overview

```
+-------------------------------------------------------------+
|                       TEST SUITES                            |
|          (UI / API / Hybrid spec files)                      |
+-------------------------------------------------------------+
|                      FIXTURE LAYER                           |
|    base  ->  auth  ->  data  ->  logging (auto)              |
+-----------------------------+-------------------------------+
|       PAGE OBJECTS          |         API CLIENTS            |
|  LoginPage                  |  AuthAPI (sets token once)     |
|  DashboardPage              |  UserAPI                       |
|  CartPage                   |  OrderAPI                      |
|  CheckoutPage               |                                |
|  OrdersPage                 +-------------------------------+
|                             |        INTERCEPTORS            |
|                             |  RequestInterceptor (headers)  |
|                             |  ResponseInterceptor (status)  |
+-----------------------------+-------------------------------+
|       SERVICES (Facades)                                     |
|  AuthService (UI vs API login)                               |
|  UserService (register + view orders)                        |
+-------------------------------------------------------------+
|                    CORE FRAMEWORK                             |
|  BasePage | BaseAPI | BaseComponent | BaseTest               |
|  ConfigManager (Singleton) | Logger (Singleton)              |
|  Execution Strategies (Local | Staging | CI)                 |
+-------------------------------------------------------------+
|               UTILITIES & TEST DATA                          |
|  Builders | Factories | Helpers | Decorators | Types         |
+-------------------------------------------------------------+
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
│   │   │   ├── BaseComponent.ts      # Abstract base for reusable UI components
│   │   │   ├── BaseAPI.ts            # Abstract base for API clients + interceptor integration
│   │   │   └── BaseTest.ts           # Extended Playwright test with logger
│   │   ├── config/
│   │   │   ├── ConfigManager.ts      # Singleton – loads environment-specific config
│   │   │   ├── EnvironmentConfig.ts  # Type definition for config shape
│   │   │   └── environments/
│   │   │       ├── local.config.ts   # Local: 30s timeout, 0 retries, headed
│   │   │       ├── staging.config.ts # Staging: 45s timeout, 1 retry, headless
│   │   │       └── production.config.ts # Production: 60s timeout, 2 retries, headless
│   │   ├── logger/
│   │   │   └── Logger.ts            # Winston singleton – console + file transport
│   │   └── strategies/
│   │       ├── IExecutionStrategy.ts # Strategy interface
│   │       ├── LocalStrategy.ts      # No video, 0 retries
│   │       ├── StagingStrategy.ts    # Video on failure, 1 retry
│   │       └── CIStrategy.ts         # Video on failure, 2 retries
│   │
│   ├── fixtures/                     # LAYER 2: Dependency injection
│   │   ├── base.fixture.ts           # Page objects + API clients
│   │   ├── auth.fixture.ts           # Pre-authenticated page state
│   │   ├── data.fixture.ts           # Auto-generated test data per test
│   │   ├── logging.fixture.ts        # Auto-logging & test annotations
│   │   └── index.ts                  # Merged export: { test, expect }
│   │
│   ├── pages/                        # LAYER 3: Page Object Model
│   │   ├── LoginPage.ts              # Login form interactions
│   │   ├── DashboardPage.ts          # Product listing, cart, search
│   │   ├── CartPage.ts               # Cart items, checkout trigger
│   │   ├── CheckoutPage.ts          # Country selection, order placement
│   │   ├── UserProfilePage.ts        # Order history (OrdersPage)
│   │   ├── components/               # Reusable UI components
│   │   │   ├── NavigationBar.ts      # Top navbar (home, orders, cart, sign out)
│   │   │   ├── DataTable.ts          # Generic table component
│   │   │   └── Modal.ts              # Toast/notification component
│   │   └── locators/                 # Centralized CSS/XPath selectors
│   │       ├── login.locators.json
│   │       ├── dashboard.locators.json
│   │       ├── cart.locators.json
│   │       ├── checkout.locators.json
│   │       ├── orders.locators.json
│   │       ├── navigationbar.locators.json
│   │       ├── datatable.locators.json
│   │       ├── toast.locators.json
│   │       └── index.ts              # Re-exports all locators as typed objects
│   │
│   ├── api/                          # LAYER 4: API testing layer
│   │   ├── clients/
│   │   │   ├── AuthAPI.ts            # Login (auto-sets token), register
│   │   │   ├── UserAPI.ts            # User registration, profile lookup
│   │   │   └── OrderAPI.ts           # Products, order CRUD (no token params)
│   │   ├── interceptors/
│   │   │   ├── RequestInterceptor.ts # Static token + header management
│   │   │   └── ResponseInterceptor.ts # Status classification, error extraction, logging
│   │   └── models/
│   │       ├── AuthModels.ts         # LoginRequest/Response, RegisterRequest/Response
│   │       ├── UserModels.ts         # User, CreateUserRequest, UserResponse
│   │       └── OrderModels.ts        # Product, Order, CreateOrderRequest/Response
│   │
│   ├── services/                     # LAYER 5: Business logic facades
│   │   ├── AuthService.ts            # loginViaUI() vs loginViaAPI()
│   │   └── UserService.ts            # registerUserViaAPI(), viewOrders()
│   │
│   ├── data/                         # LAYER 6: Test data management
│   │   ├── test-data.ts              # Static test data (credentials, products, messages)
│   │   ├── test-data.json            # JSON source data
│   │   ├── builders/                 # Builder pattern
│   │   │   ├── UserBuilder.ts        # Fluent user data builder
│   │   │   ├── OrderBuilder.ts       # Fluent order data builder
│   │   │   └── AddressBuilder.ts     # Fluent address data builder
│   │   ├── factories/                # Factory pattern
│   │   │   ├── TestDataFactory.ts    # createUniqueUser(), createStandardOrder()
│   │   │   ├── PageFactory.ts        # Page object factory
│   │   │   └── APIClientFactory.ts   # API client factory
│   │   └── fixtures/                 # Static JSON fixtures
│   │       ├── users.json
│   │       ├── products.json
│   │       └── orders.json
│   │
│   └── utils/                        # LAYER 7: Shared utilities
│       ├── constants/
│       │   ├── Routes.ts             # UI routes + API endpoints
│       │   ├── Selectors.ts          # Global CSS selectors
│       │   └── ErrorMessages.ts      # Expected error message strings
│       ├── decorators/
│       │   ├── step.decorator.ts     # @step() – wraps method in Allure test step
│       │   └── retry.decorator.ts    # @retry(n, delay) – auto-retry on failure
│       ├── helpers/
│       │   ├── DateHelper.ts         # Date formatting, comparison
│       │   ├── StringHelper.ts       # Random strings, email generation
│       │   ├── WaitHelper.ts         # Network idle, URL change, retry logic
│       │   └── TestAnnotation.ts     # Dynamic test annotation injection
│       └── types/
│           ├── custom-types.ts       # ApiResponse<T>, PaginationParams, TestMeta
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
│   │   └── user-api.spec.ts          # User registration, login flow
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
| **BaseComponent** | Composite | Abstract base for reusable UI components (navbar, table, modal). Scoped to a root locator so interactions are isolated to the component DOM subtree. Provides `isVisible()`, `waitForVisible()`, `waitForHidden()`. |
| **BaseAPI** | Template Method + Interceptors | Abstract base for API clients. Wraps Playwright's `request` context with typed `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`, `getRaw()` methods. Every HTTP method calls `RequestInterceptor.getHeaders()` for automatic header injection. `handleResponse()` uses `ResponseInterceptor` for logging, status classification, and error extraction. Throws on non-2xx with parsed error message. |
| **BaseTest** | Fixture Extension | Extends Playwright's `test` with an auto-injected `logger` fixture that logs test start/finish markers. |

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

#### Execution Strategies (`src/core/strategies/`)

Implements the **Strategy pattern** for environment-specific test execution behavior:

| Strategy | Video Recording | Retries | Use Case |
|---|---|---|---|
| **LocalStrategy** | No | 0 | Fast local development |
| **StagingStrategy** | On failure | 1 | Pre-production validation |
| **CIStrategy** | On failure | 2 | CI/CD pipeline execution |

Each strategy implements `IExecutionStrategy`: `setup()`, `teardown()`, `getBaseURL()`, `shouldRecordVideo()`, `getRetryCount()`.

---

### 2. Fixtures & Dependency Injection (`src/fixtures/`)

Playwright fixtures are layered and merged together. Tests import `{ test, expect }` from `src/fixtures/index.ts` which combines all four layers via `mergeTests()`.

| Fixture | Auto | What It Provides |
|---|---|---|
| **base.fixture** | No | `loginPage`, `dashboardPage`, `ordersPage`, `cartPage`, `checkoutPage`, `authAPI`, `userAPI`, `orderAPI` – lazily instantiated per test |
| **auth.fixture** | No | `authenticatedPage` – navigates to login, performs login using ConfigManager credentials. Call explicitly when needed. |
| **data.fixture** | No | `testUser` (unique user via factory), `testOrder` (standard order) – fresh data per test |
| **logging.fixture** | Yes | Automatically annotates every test with feature name, suite, file, and project. Logs test start/finish with duration and pass/fail status. Zero configuration. |

**Usage in tests:**
```typescript
import { test, expect } from '../../src/fixtures/index';

test('my test', async ({ loginPage, dashboardPage, page }) => {
  // All fixtures automatically injected
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

#### Reusable Components (`src/pages/components/`)

Components are scoped to a root locator and can be composed into any page:

| Component | Root Selector | Purpose |
|---|---|---|
| **NavigationBar** | `.navbar` | `goHome()`, `goToOrders()`, `goToCart()`, `signOut()`, `getCartCount()` |
| **DataTable** | configurable | `getRowCount()`, `getHeaderTexts()`, `getCellText(row, col)`, `clickRow(index)` |
| **Modal** | `.toast-container` | `getMessage()`, `isSuccessVisible()`, `isErrorVisible()`, `waitForToast()` |

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

**`AuthAPI.login()` is the single point where the auth token is set.** After a successful login, it automatically calls `RequestInterceptor.setAuthToken(response.token)`. All subsequent API calls through any client (`OrderAPI`, `UserAPI`) automatically include the Authorization header — no token parameters needed.

```typescript
// In test setup - login once, token is globally available
const authAPI = new AuthAPI(request);
await authAPI.login({ userEmail: email, userPassword: password });

// All subsequent calls automatically have auth headers
const orderAPI = new OrderAPI(request);
const products = await orderAPI.getAllProducts();  // No token param needed
```

#### Interceptors (`src/api/interceptors/`)

| Interceptor | Purpose | Key Methods |
|---|---|---|
| **RequestInterceptor** | Manages a static auth token and builds request headers. `getHeaders()` returns `{ Content-Type: application/json }` and appends `{ Authorization: <token> }` when a token is set. | `setAuthToken(token)`, `clearAuthToken()`, `getHeaders()` |
| **ResponseInterceptor** | Logs every response (status + URL), classifies status codes, and extracts error messages from response bodies. | `logResponse(response)`, `isSuccess(response)`, `isClientError(response)`, `isServerError(response)`, `extractErrorMessage(response)` |

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

### 5. Business Logic Services (`src/services/`)

Services implement the **Facade pattern**, abstracting whether an action is performed via UI or API:

| Service | Methods | Purpose |
|---|---|---|
| **AuthService** | `loginViaUI(email, password)` -> navigates & fills login form, `loginViaAPI(email, password)` -> calls `AuthAPI.login()` (fast setup) | Choose UI login (for E2E flow) or API login (fast setup for other tests) |
| **UserService** | `registerUserViaAPI(data)` -> calls `UserAPI.registerUser()`, `viewOrders()` -> navigates to orders page | Combines registration + order viewing workflows |

**AuthService** accepts both a `Page` and an `APIRequestContext` in its constructor, so it can switch between UI and API login strategies.

---

### 6. Test Data Generation (`src/data/`)

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

PageFactory.createLoginPage()           // Page object instantiation
APIClientFactory.createAuthAPI()        // API client instantiation
```

#### JSON Fixtures (`src/data/fixtures/`)

Static sample data sets: `users.json` (2 users), `products.json` (3 products), `orders.json` (2 orders).

---

### 7. Utilities (`src/utils/`)

#### Constants (`src/utils/constants/`)

| File | Contents |
|---|---|
| **Routes.ts** | UI routes (`LOGIN`, `DASHBOARD`, `CART`, `ORDERS`) and API endpoints (`AUTH_LOGIN`, `GET_PRODUCTS`, `CREATE_ORDER`, etc.) |
| **Selectors.ts** | Global CSS selectors organized by page: `LOADING_SPINNER`, `TOAST_SUCCESS`, `PRODUCT_CARD`, `CART_ITEM`, etc. |
| **ErrorMessages.ts** | Expected error strings: `INVALID_CREDENTIALS`, `EMAIL_REQUIRED`, `USER_EXISTS`, etc. |

#### Decorators (`src/utils/decorators/`)

TypeScript method decorators for cross-cutting concerns:

```typescript
// Wraps method execution in an Allure test step
@step('Login with credentials')
async login(email: string) { ... }

// Retries method up to 3 times with 1s delay between attempts
@retry(3, 1000)
async flakyNetworkCall() { ... }
```

#### Helpers (`src/utils/helpers/`)

| Helper | Key Methods |
|---|---|
| **DateHelper** | `today()`, `daysFromNow(n)`, `formatDate(date, 'iso'|'us'|'eu')`, `isWithinMinutes(date, n)` |
| **StringHelper** | `generateRandomString(len)`, `generateEmail(prefix)`, `generateUsername(prefix)`, `capitalize()`, `truncate()` |
| **WaitHelper** | `waitForNetworkIdle(page)`, `waitForUrlChange(page, currentUrl)`, `waitForResponse(page, pattern)`, `delay(ms)`, `retryAction(fn, retries, delay)` |
| **TestAnnotation** | `annotate(testInfo, { feature, owner, severity })` – dynamically adds Allure annotations |

#### Types (`src/utils/types/`)

- **custom-types.ts** – `ApiResponse<T>`, `PaginationParams`, `TestMeta`
- **global.d.ts** – Extends `NodeJS.ProcessEnv` with `ENV`, `BASE_URL`, `API_URL`, `LOG_LEVEL`, etc.

---

### 8. Test Suites (`tests/`)

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
@services/* -> src/services/*
@data/*     -> src/data/*
@fixtures/* -> src/fixtures/*
@utils/*    -> src/utils/*
```

### Playwright Projects

| Project | Device |
|---|---|
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
| **Composite** | `BaseComponent`, `NavigationBar`, `DataTable`, `Modal` | Reusable UI components scoped to root locators |
| **Singleton** | `ConfigManager`, `Logger` | Single instance of config and logger across framework |
| **Strategy** | `src/core/strategies/` | Environment-specific execution behavior (local/staging/CI) |
| **Builder** | `UserBuilder`, `OrderBuilder`, `AddressBuilder` | Fluent API for constructing complex test data |
| **Factory** | `TestDataFactory`, `PageFactory`, `APIClientFactory` | Centralized object creation |
| **Facade** | `AuthService`, `UserService` | Abstracts UI vs API implementation from tests |
| **Dependency Injection** | `src/fixtures/` | Playwright fixtures inject page objects and clients into tests |
| **Decorator** | `@step()`, `@retry()` | Cross-cutting concerns (reporting, retry logic) |

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
