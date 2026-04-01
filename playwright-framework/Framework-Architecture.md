# Playwright POM Framework - Architecture & Execution Flow

---

## Table of Contents

1. [High-Level Architecture](#1-high-level-architecture)
2. [Class Hierarchy Diagram](#2-class-hierarchy-diagram)
3. [Interceptor Pipeline](#3-interceptor-pipeline)
4. [UI Test Execution Flow](#4-ui-test-execution-flow)
5. [API Test Execution Flow](#5-api-test-execution-flow)
6. [Parallel API Execution](#6-parallel-api-execution)
7. [Fixture Dependency Graph](#7-fixture-dependency-graph)
8. [Sequence Diagrams](#8-sequence-diagrams)
9. [UI vs API Comparison](#9-ui-vs-api-comparison)
10. [Detailed Phase Breakdown](#10-detailed-phase-breakdown)

---

## 1. High-Level Architecture

```
+--------------------------------------------------------------+
|                      TEST LAYER                              |
|  login.spec.ts | auth-api.spec.ts | parallel-api.spec.ts     |
|  shared-token-api.spec.ts | e2e.spec.ts                     |
+--------------------------------------------------------------+
|                    FIXTURE LAYER                             |
|  test:    base -> auth -> data -> logging (auto)             |
|  apiTest: apiAuth -> data -> logging (auto)  [parallel-safe] |
+-----------------------------+--------------------------------+
|     PAGE OBJECTS            |      API CLIENTS               |
|  LoginPage                  |  AuthAPI (workerIndex?)        |
|  DashboardPage              |  UserAPI (workerIndex?)        |
|  CartPage                   |  OrderAPI (workerIndex?)       |
|  CheckoutPage               |                                |
|  OrdersPage                 |                                |
+-----------------------------+--------------------------------+
|     BasePage                |      BaseAPI                   |
|  (abstract)                 |  (abstract, workerIndex?)      |
|                             |  + RequestInterceptor          |
|                             |  + ResponseInterceptor         |
|                             |  + TokenManager                |
+-----------------------------+--------------------------------+
|                SHARED SERVICES                               |
|  Logger (Singleton)  |  ConfigManager (Singleton)            |
|  WaitHelper          |  TestAnnotation                      |
|  TokenManager        |  (worker + shared token management)   |
+--------------------------------------------------------------+
|                PLAYWRIGHT ENGINE                             |
|  Page | APIRequestContext | Browser | BrowserContext         |
+--------------------------------------------------------------+
```

Each layer depends only on the layer below it. Tests never call Playwright APIs directly - they go through Page Objects or API Clients.

---

## 2. Class Hierarchy Diagram

```mermaid
classDiagram
    direction TB

    class BasePage {
        <<abstract>>
        #page: Page
        #logger: Logger
        +abstract path: string
        +navigate() Promise~void~
        +waitForPageLoad() Promise~void~
        +getTitle() Promise~string~
        +getCurrentUrl() Promise~string~
        +takeScreenshot(name) Promise~Buffer~
        #click(locator) Promise~void~
        #fill(locator, value) Promise~void~
        #getText(locator) Promise~string~
        #isVisible(locator) Promise~boolean~
        #selectOption(locator, value) Promise~void~
        #uploadFile(locator, path) Promise~void~
    }

    class LoginPage {
        +path: string
        -emailInput: Locator
        -passwordInput: Locator
        -loginButton: Locator
        -errorToast: Locator
        +login(email, password) Promise~void~
        +getErrorMessage() Promise~string~
        +isLoginButtonVisible() Promise~boolean~
        +clickRegister() Promise~void~
    }

    class DashboardPage {
        +path: string
        -productCards: Locator
        -cartButton: Locator
        -searchInput: Locator
        +addProductToCart(name) Promise~void~
        +goToCart() Promise~void~
        +getProductNames() Promise~string[]~
        +getCartCount() Promise~number~
        +signOut() Promise~void~
    }

    class CartPage {
        +path: string
        -cartItems: Locator
        -checkoutBtn: Locator
        +isProductInCart(name) Promise~boolean~
        +checkout() Promise~void~
    }

    class CheckoutPage {
        +path: string
        -countryInput: Locator
        -placeOrderBtn: Locator
        +selectCountry(prefix) Promise~void~
        +placeOrder() Promise~void~
        +getConfirmationMessage() Promise~string~
    }

    class OrdersPage {
        +path: string
        +navigate() Promise~void~
    }

    class BaseAPI {
        <<abstract>>
        #request: APIRequestContext
        #logger: Logger
        #workerIndex?: number
        +constructor(request, workerIndex?)
        +setWorkerIndex(workerIndex) void
        -getRequestHeaders() Record~string, string~
        #get~T~(endpoint, params?) Promise~T~
        #post~T~(endpoint, data?) Promise~T~
        #put~T~(endpoint, data?) Promise~T~
        #patch~T~(endpoint, data?) Promise~T~
        #delete~T~(endpoint) Promise~T~
        #getRaw(endpoint, params?) Promise~APIResponse~
        -handleResponse~T~(response) Promise~T~
    }

    class AuthAPI {
        +constructor(request, workerIndex?)
        +login(credentials) Promise~LoginResponse~
        +loginShared(credentials) Promise~LoginResponse~
        +register(data) Promise~RegisterResponse~
    }

    class UserAPI {
        +constructor(request, workerIndex?)
        +registerUser(data) Promise~RegisterResponse~
        +getUserDetails(userId) Promise~UserResponse~
    }

    class OrderAPI {
        +constructor(request, workerIndex?)
        +getAllProducts() Promise~ProductListResponse~
        +createOrder(data) Promise~CreateOrderResponse~
        +getOrdersForCustomer(userId) Promise~OrderListResponse~
        +deleteOrder(orderId) Promise~object~
    }

    class RequestInterceptor {
        <<static>>
        -static token: string | null
        -static logger: Logger
        +static setAuthToken(token) void
        +static clearAuthToken() void
        +static getHeaders() Record~string, string~
        +static setWorkerAuthToken(workerIndex, token) void
        +static clearWorkerAuthToken(workerIndex) void
        +static setSharedAuthToken(token) void
        +static clearSharedAuthToken() void
        +static getWorkerHeaders(workerIndex?) Record~string, string~
    }

    class TokenManager {
        <<static>>
        -static workerTokens: Map~number, string~
        -static sharedToken: string | null
        -static logger: Logger
        +static setWorkerToken(workerIndex, token) void
        +static getWorkerToken(workerIndex) string | null
        +static clearWorkerToken(workerIndex) void
        +static setSharedToken(token) void
        +static getSharedToken() string | null
        +static clearSharedToken() void
        +static resolveToken(workerIndex?) string | null
        +static clearAll() void
    }

    class ResponseInterceptor {
        <<static>>
        -static logger: Logger
        +static logResponse(response) Promise~void~
        +static isSuccess(response) boolean
        +static isClientError(response) boolean
        +static isServerError(response) boolean
        +static extractErrorMessage(response) Promise~string~
    }

    class BaseComponent {
        <<abstract>>
        #page: Page
        #root: Locator
        +isVisible() Promise~boolean~
        +waitForVisible() Promise~void~
        +waitForHidden() Promise~void~
    }

    class DataTable {
        -rows: Locator
        -headers: Locator
        +getRowCount() Promise~number~
        +getHeaderTexts() Promise~string[]~
        +getCellText(row, col) Promise~string~
        +clickRow(index) Promise~void~
    }

    class Logger {
        <<singleton>>
        -static instance: Logger
        -winstonLogger: winston.Logger
        +static getInstance() Logger
        +info(message) void
        +warn(message) void
        +error(message) void
        +debug(message) void
    }

    class ConfigManager {
        <<singleton>>
        -static instance: ConfigManager
        -config: EnvironmentConfig
        +static getInstance() ConfigManager
        +getConfig() EnvironmentConfig
        +get~K~(key) EnvironmentConfig[K]
    }

    BasePage <|-- LoginPage
    BasePage <|-- DashboardPage
    BasePage <|-- CartPage
    BasePage <|-- CheckoutPage
    BasePage <|-- OrdersPage
    BaseAPI <|-- AuthAPI
    BaseAPI <|-- UserAPI
    BaseAPI <|-- OrderAPI
    BaseComponent <|-- DataTable

    BaseAPI ..> RequestInterceptor : getHeaders() / getWorkerHeaders()
    BaseAPI ..> ResponseInterceptor : handleResponse()
    AuthAPI ..> RequestInterceptor : setAuthToken() / setWorkerAuthToken() / setSharedAuthToken()
    RequestInterceptor ..> TokenManager : resolveToken() / setWorkerToken() / setSharedToken()
    BasePage ..> Logger : uses
    BaseAPI ..> Logger : uses
```

### Inheritance Summary

| Base Class | Pattern | Subclasses | Purpose |
|------------|---------|------------|---------|
| `BasePage` (abstract) | Page Object Model | `LoginPage`, `DashboardPage`, `CartPage`, `CheckoutPage`, `OrdersPage` | Browser UI interactions |
| `BaseAPI` (abstract) | API Client + Interceptors | `AuthAPI`, `UserAPI`, `OrderAPI` | REST API calls with auto headers + worker-aware tokens |
| `BaseComponent` (abstract) | Component | `DataTable` | Reusable UI components |

### Singletons

| Singleton | Purpose | Access |
|-----------|---------|--------|
| `Logger` | Winston logging to console + file | `Logger.getInstance()` |
| `ConfigManager` | Environment-specific configuration | `ConfigManager.getInstance()` |

### Static Managers

| Class | Purpose | Access |
|-------|---------|--------|
| `TokenManager` | Per-worker + shared token storage for parallel execution | `TokenManager.resolveToken(workerIndex)` |
| `RequestInterceptor` | Header management with worker-aware token injection | `RequestInterceptor.getWorkerHeaders(workerIndex)` |

---

## 3. Interceptor Pipeline

The interceptor pattern centralizes request headers and response processing. `BaseAPI` uses both interceptors automatically - API clients never handle headers or response parsing directly. In parallel mode, `TokenManager` resolves worker-scoped tokens.

```mermaid
flowchart LR
    subgraph Request Pipeline
        A["API Client Method\n(e.g. orderAPI.getAllProducts)"] --> B["BaseAPI.post()"]
        B --> B0{"workerIndex\nset?"}
        B0 -- Yes --> C2["RequestInterceptor\n.getWorkerHeaders(workerIndex)"]
        B0 -- No --> C["RequestInterceptor\n.getHeaders()"]
        C2 --> C3["TokenManager\n.resolveToken(workerIndex)"]
        C3 --> C4{"worker token\nexists?"}
        C4 -- Yes --> D["Headers:\nContent-Type: application/json\nAuthorization: worker-token"]
        C4 -- No --> C5{"shared token\nexists?"}
        C5 -- Yes --> D3["Headers:\nContent-Type: application/json\nAuthorization: shared-token"]
        C5 -- No --> D2["Headers:\nContent-Type: application/json"]
        C --> C1{"Token set?"}
        C1 -- Yes --> D
        C1 -- No --> D2
        D --> E["Playwright\nrequest.post(endpoint,\n{ headers, data })"]
        D2 --> E
        D3 --> E
    end

    subgraph Response Pipeline
        E --> F["APIResponse"]
        F --> G["ResponseInterceptor\n.logResponse()"]
        G --> H{"isSuccess?\n(2xx)"}
        H -- Yes --> I["response.text()\nJSON.parse(body)\nreturn typed T"]
        H -- No --> J{"isClientError?\n(4xx)"}
        J -- Yes --> K["extractErrorMessage()\nlogger.error(Client Error)\nthrow Error"]
        J -- No --> L{"isServerError?\n(5xx)"}
        L -- Yes --> M["extractErrorMessage()\nlogger.error(Server Error)\nthrow Error"]
    end
```

### Token Resolution Priority

```
TokenManager.resolveToken(workerIndex?)
  1. Worker-scoped token (workerTokens.get(workerIndex))  ← highest priority
  2. Shared token (sharedToken)                           ← fallback
  3. Legacy static token (RequestInterceptor.token)       ← backward compatible
  4. null (no Authorization header)                       ← no auth
```

### Token Lifecycle (Legacy - Single Token)

```mermaid
sequenceDiagram
    participant Test as Test / beforeAll
    participant Auth as AuthAPI
    participant RI as RequestInterceptor
    participant Base as BaseAPI
    participant Order as OrderAPI

    Test->>Auth: authAPI.login(credentials)
    Auth->>Base: this.post('/auth/login', credentials)
    Base->>RI: getHeaders() [no token yet]
    RI-->>Base: { Content-Type: application/json }
    Base-->>Auth: LoginResponse { token, userId }
    Auth->>RI: setAuthToken(response.token)
    Note over RI: static token = 'eyJhbG...'
    Auth-->>Test: LoginResponse

    Test->>Order: orderAPI.getAllProducts()
    Order->>Base: this.post('/product/get-all-products', {})
    Base->>RI: getHeaders() [token exists]
    RI-->>Base: { Content-Type, Authorization: token }
    Base-->>Order: ProductListResponse
    Order-->>Test: ProductListResponse
```

### Token Lifecycle (Parallel - Worker-Scoped Tokens)

```mermaid
sequenceDiagram
    participant W1 as Worker 0 Test
    participant W2 as Worker 1 Test
    participant Auth as AuthAPI
    participant RI as RequestInterceptor
    participant TM as TokenManager
    participant Order as OrderAPI

    par Worker 0 authenticates
        W1->>Auth: new AuthAPI(request, 0).login(credentials)
        Auth->>RI: setWorkerAuthToken(0, tokenA)
        RI->>TM: setWorkerToken(0, tokenA)
        Note over TM: workerTokens: {0: tokenA}
    and Worker 1 authenticates
        W2->>Auth: new AuthAPI(request, 1).login(credentials)
        Auth->>RI: setWorkerAuthToken(1, tokenB)
        RI->>TM: setWorkerToken(1, tokenB)
        Note over TM: workerTokens: {0: tokenA, 1: tokenB}
    end

    W1->>Order: workerOrderAPI.getAllProducts()
    Order->>RI: getWorkerHeaders(0)
    RI->>TM: resolveToken(0) → tokenA
    RI-->>Order: { Authorization: tokenA }

    W2->>Order: workerOrderAPI.getAllProducts()
    Order->>RI: getWorkerHeaders(1)
    RI->>TM: resolveToken(1) → tokenB
    RI-->>Order: { Authorization: tokenB }
```

**Key**: Each worker gets its own token stored by `workerIndex`. No cross-contamination between parallel workers.

---

## 4. UI Test Execution Flow

Traces the full method call chain from `npx playwright test` through test completion for a UI test.

```mermaid
flowchart TB
    subgraph P1["Phase 1: Playwright Startup"]
        A["npx playwright test"] --> B["playwright.config.ts"]
        B --> B1["dotenv.config(.env.local)"]
        B --> B2["defineConfig()"]
        B2 --> B3["testDir: ./tests\ntimeout: 30s\nworkers: 1\nreporters: html, list, allure"]
    end

    subgraph P2["Phase 2: Fixture Chain Resolution"]
        C["test file imports\ntest from fixtures/index.ts"] --> D["mergeTests()"]
        D --> D1["1. baseFixture"]
        D --> D2["2. authFixture"]
        D --> D3["3. dataFixture"]
        D --> D4["4. loggingFixture (auto: true)"]
    end

    subgraph P3["Phase 3: Base Fixture Setup"]
        D1 --> E["Playwright creates\nBrowser -> Context -> Page"]
        E --> F["loginPage:\nnew LoginPage(page)"]
        F --> F1["super(page) -> BasePage()"]
        F1 --> F2["this.page = page"]
        F1 --> F3["this.logger = Logger.getInstance()"]
        F --> F4["Initialize Locators:\nemailInput, passwordInput\nloginButton, errorToast"]
        E --> G["dashboardPage, cartPage\ncheckoutPage, ordersPage\n(same pattern)"]
    end

    subgraph P4["Phase 4: Logging Fixture (auto)"]
        D4 --> I["autoLogAnnotations"]
        I --> I1["Extract: feature, suite\nfile, project"]
        I1 --> I2["testInfo.annotations.push()"]
        I2 --> I3["Logger.info: Starting test..."]
    end

    subgraph P5["Phase 5: UI Test Execution"]
        I3 --> J["test body runs"]
        J --> K["loginPage.navigate()"]
        K --> K1["BasePage.navigate()\nlogger.info -> page.goto(path)\nwaitForPageLoad()"]
        J --> L["loginPage.login(email, pwd)"]
        L --> L1["BasePage.fill(emailInput, email)\nBasePage.fill(passwordInput, pwd)\nloginButton.click()"]
        J --> M["Verify dashboard"]
        M --> M1["page.waitForURL\nexpect(url).toContain('/dash')"]
    end

    subgraph P6["Phase 6: Teardown"]
        M1 --> N["Logger: Test passed/failed"]
        N --> O["Artifacts: screenshot, video, trace"]
        O --> P["Page -> Context -> Browser closed"]
        P --> Q["Reporters: HTML + Allure"]
    end

    P1 --> P2 --> P3 --> P4 --> P5 --> P6
```

---

## 5. API Test Execution Flow

Traces the full method call chain for an API test with the interceptor pipeline.

```mermaid
flowchart TB
    subgraph P1["Phase 1: Playwright Startup"]
        A["npx playwright test"] --> B["playwright.config.ts"]
        B --> B1["dotenv + defineConfig\nbaseURL: rahulshettyacademy.com\nworkers: 2"]
    end

    subgraph P2["Phase 2: Fixture Chain"]
        C["import test from fixtures"] --> D["mergeTests()"]
        D --> D1["baseFixture\nauthFixture\ndataFixture\nloggingFixture"]
    end

    subgraph P3["Phase 3: API Fixture Setup"]
        D1 --> E["Playwright creates\nAPIRequestContext"]
        E --> F["authAPI: new AuthAPI(request)"]
        F --> F1["super(request) -> BaseAPI()\nthis.request = request\nthis.logger = Logger.getInstance()"]
        E --> G["orderAPI: new OrderAPI(request)"]
        E --> H["userAPI: new UserAPI(request)"]
    end

    subgraph P4["Phase 4: Logging (auto)"]
        I["autoLogAnnotations"] --> I1["Annotations + Logger.info"]
    end

    subgraph P5["Phase 5: API Test Execution"]
        I1 --> J["test.beforeAll"]
        J --> J1["authAPI.login(credentials)"]
        J1 --> J2["BaseAPI.post('/auth/login')"]
        J2 --> J3["RequestInterceptor.getHeaders()\n-> Content-Type only"]
        J3 --> J4["request.post(endpoint, { headers, data })"]
        J4 --> J5["ResponseInterceptor.logResponse()"]
        J5 --> J6["isSuccess? -> JSON.parse -> LoginResponse"]
        J6 --> J7["RequestInterceptor\n.setAuthToken(response.token)"]

        J7 --> K["test: orderAPI.getAllProducts()"]
        K --> K1["BaseAPI.post('/product/get-all-products')"]
        K1 --> K2["RequestInterceptor.getHeaders()\n-> Content-Type + Authorization"]
        K2 --> K3["request.post(endpoint, { headers, data })"]
        K3 --> K4["ResponseInterceptor pipeline\n-> ProductListResponse"]
        K4 --> K5["expect(response.data)\n.toBeDefined()"]
    end

    subgraph P6["Phase 6: Teardown"]
        K5 --> N["Logger: Test passed/failed"]
        N --> O["APIRequestContext disposed"]
        O --> Q["Reporters: HTML + Allure"]
    end

    P1 --> P2 --> P3 --> P4 --> P5 --> P6
```

---

## 6. Parallel API Execution

### Architecture Overview

Parallel API tests generate **one token per worker** so that parallel workers never overwrite each other's auth state. Two strategies are supported:

| Strategy | Method | Use Case | Token Storage |
|----------|--------|----------|---------------|
| **Worker-scoped** | `authAPI.login()` with `workerIndex` | Each test authenticates independently | `TokenManager.workerTokens` Map |
| **Shared token** | `authAPI.loginShared()` in `beforeAll` | Login once, all workers share | `TokenManager.sharedToken` |
| **Legacy** | `authAPI.login()` without `workerIndex` | Backward compatible, single-threaded | `RequestInterceptor.token` |

### Parallel Execution Flow

```mermaid
flowchart TB
    subgraph P1["Phase 1: Config"]
        A["playwright.config.ts"] --> A1["api project:\nfullyParallel: true\nworkers: 2"]
    end

    subgraph P2["Phase 2: apiTest Fixture"]
        B["import apiTest from fixtures"] --> C["mergeTests()"]
        C --> C1["apiAuthFixture\ndataFixture\nloggingFixture"]
    end

    subgraph P3["Phase 3: Worker-Scoped Auth"]
        C1 --> D["workerAuth fixture"]
        D --> D1["testInfo.parallelIndex\n→ workerIndex"]
        D1 --> D2["new AuthAPI(request, workerIndex)"]
        D2 --> D3["authAPI.login(credentials)"]
        D3 --> D4["RequestInterceptor\n.setWorkerAuthToken(workerIndex, token)"]
        D4 --> D5["TokenManager.workerTokens\n.set(workerIndex, token)"]
    end

    subgraph P4["Phase 4: Worker-Scoped Clients"]
        D5 --> E["workerOrderAPI:\nnew OrderAPI(request, workerIndex)"]
        D5 --> F["workerUserAPI:\nnew UserAPI(request, workerIndex)"]
        D5 --> G["workerAuthAPI:\nnew AuthAPI(request, workerIndex)"]
    end

    subgraph P5["Phase 5: Parallel Test Execution"]
        E --> H["BaseAPI.getRequestHeaders()"]
        H --> H1["workerIndex set?\n→ getWorkerHeaders(workerIndex)"]
        H1 --> H2["TokenManager.resolveToken(workerIndex)\n→ worker's own token"]
        H2 --> H3["Each worker uses\nits own auth header"]
    end

    subgraph P6["Phase 6: Cleanup"]
        H3 --> I["clearWorkerAuthToken(workerIndex)"]
    end

    P1 --> P2 --> P3 --> P4 --> P5 --> P6
```

### Worker Token Isolation Diagram

```
┌─────────────────────────────────────────────────┐
│                 TokenManager                     │
│                                                  │
│  workerTokens (Map):                             │
│  ┌──────────┬──────────────────────────┐        │
│  │ Worker 0 │ token: eyJhbGciOi...AAA  │        │
│  ├──────────┼──────────────────────────┤        │
│  │ Worker 1 │ token: eyJhbGciOi...BBB  │        │
│  ├──────────┼──────────────────────────┤        │
│  │ Worker 2 │ token: eyJhbGciOi...CCC  │        │
│  └──────────┴──────────────────────────┘        │
│                                                  │
│  sharedToken: eyJhbGciOi...SHARED (fallback)    │
│                                                  │
│  resolveToken(workerIndex):                      │
│    1. workerTokens.get(workerIndex) → found? ✓  │
│    2. sharedToken → found? ✓                     │
│    3. null → no auth header                      │
└─────────────────────────────────────────────────┘
```

### Usage Patterns

**Pattern 1: Worker-Scoped Tokens (per-test authentication)**
```typescript
import { apiTest as test, expect } from '../../src/fixtures/index';

test.describe('Parallel Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('test A', async ({ workerOrderAPI, workerAuth }) => {
    // workerAuth auto-authenticates this worker
    const response = await workerOrderAPI.getAllProducts();
    expect(response.data).toBeDefined();
  });

  test('test B', async ({ workerOrderAPI, workerAuth }) => {
    // Different worker, different token - no conflict
    const response = await workerOrderAPI.getOrdersForCustomer(workerAuth.userId);
    expect(response.data).toBeDefined();
  });
});
```

**Pattern 2: Shared Token (login once in beforeAll)**
```typescript
import { apiTest as test, expect } from '../../src/fixtures/index';
import { AuthAPI } from '../../src/api/clients/AuthAPI';

test.describe('Shared Token Tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test.beforeAll(async ({ request }) => {
    const authAPI = new AuthAPI(request);
    await authAPI.loginShared({ userEmail, userPassword });
    // All workers fall back to this shared token
  });

  test.afterAll(async () => {
    RequestInterceptor.clearSharedAuthToken();
  });
});
```

---

## 7. Fixture Dependency Graph

```mermaid
flowchart LR
    subgraph Playwright["Playwright Built-in"]
        page["page\n(Browser Page)"]
        request["request\n(APIRequestContext)"]
        browser["browser"]
        testInfo["testInfo"]
    end

    subgraph Base["baseFixture"]
        loginPage["loginPage\nLoginPage"]
        dashboardPage["dashboardPage\nDashboardPage"]
        cartPage["cartPage\nCartPage"]
        checkoutPage["checkoutPage\nCheckoutPage"]
        ordersPage["ordersPage\nOrdersPage"]
        authAPI["authAPI\nAuthAPI"]
        userAPI["userAPI\nUserAPI"]
        orderAPI["orderAPI\nOrderAPI"]
    end

    subgraph Auth["authFixture"]
        authenticatedPage["authenticatedPage\n(auto: false)"]
    end

    subgraph ApiAuth["apiAuthFixture (Parallel)"]
        workerIndex["workerIndex\ntestInfo.parallelIndex"]
        workerAuth["workerAuth\nLoginResponse"]
        workerAuthAPI["workerAuthAPI\nAuthAPI(request, idx)"]
        workerUserAPI["workerUserAPI\nUserAPI(request, idx)"]
        workerOrderAPI["workerOrderAPI\nOrderAPI(request, idx)"]
    end

    subgraph Data["dataFixture"]
        testUser["testUser\nCreateUserRequest"]
        testOrder["testOrder\nCreateOrderRequest"]
    end

    subgraph Logging["loggingFixture"]
        autoLog["autoLogAnnotations\n(auto: true)"]
    end

    subgraph Singletons["Shared Services"]
        logger["Logger"]
        config["ConfigManager"]
        reqInterceptor["RequestInterceptor"]
        resInterceptor["ResponseInterceptor"]
        tokenMgr["TokenManager"]
    end

    page --> loginPage
    page --> dashboardPage
    page --> cartPage
    page --> checkoutPage
    page --> ordersPage
    request --> authAPI
    request --> userAPI
    request --> orderAPI

    loginPage --> authenticatedPage
    config --> authenticatedPage

    testInfo --> workerIndex
    request --> workerAuthAPI
    workerIndex --> workerAuth
    workerAuthAPI --> workerAuth
    workerAuth --> workerUserAPI
    workerAuth --> workerOrderAPI
    request --> workerUserAPI
    request --> workerOrderAPI

    testInfo --> autoLog
    logger --> autoLog

    authAPI --> reqInterceptor
    reqInterceptor --> orderAPI
    reqInterceptor --> userAPI
    resInterceptor --> authAPI
    resInterceptor --> orderAPI
    resInterceptor --> userAPI
    reqInterceptor --> tokenMgr
    workerAuthAPI --> tokenMgr
```

### Fixture Layers

| Order | Fixture | Auto | Provides |
|-------|---------|------|----------|
| 1 | `baseFixture` | No | `loginPage`, `dashboardPage`, `cartPage`, `checkoutPage`, `ordersPage`, `authAPI`, `userAPI`, `orderAPI` |
| 2 | `authFixture` | No | `authenticatedPage` (pre-logged-in page via UI) |
| 3 | `apiAuthFixture` | No | `workerIndex`, `workerAuth`, `workerAuthAPI`, `workerUserAPI`, `workerOrderAPI` (parallel-safe API clients) |
| 4 | `dataFixture` | No | `testUser`, `testOrder` (generated test data) |
| 5 | `loggingFixture` | **Yes** | Auto-annotations + start/end logging for every test |

### Fixture Composition

| Export | Fixtures Merged | Use Case |
|--------|----------------|----------|
| `test` | baseFixture + authFixture + dataFixture + loggingFixture | UI tests, hybrid tests, sequential API tests |
| `apiTest` | apiAuthFixture + dataFixture + loggingFixture | Parallel API tests with worker-scoped tokens |

---

## 8. Sequence Diagrams

### UI: `loginPage.login()` Call Chain

```mermaid
sequenceDiagram
    participant Test as Test Body
    participant LP as LoginPage
    participant BP as BasePage
    participant Log as Logger
    participant PW as Playwright Page

    Test->>LP: loginPage.login(email, password)
    LP->>Log: logger.info('Logging in as user@test.com')

    LP->>BP: this.fill(this.emailInput, email)
    BP->>PW: emailInput.waitFor({ state: 'visible' })
    PW-->>BP: element visible
    BP->>PW: emailInput.clear()
    BP->>PW: emailInput.fill('user@test.com')

    LP->>BP: this.fill(this.passwordInput, password)
    BP->>PW: passwordInput.waitFor({ state: 'visible' })
    PW-->>BP: element visible
    BP->>PW: passwordInput.clear()
    BP->>PW: passwordInput.fill('Test@12345')

    LP->>PW: this.loginButton.click()
    PW-->>Test: Login action completed
```

### API: `authAPI.login()` Call Chain (with Interceptors)

```mermaid
sequenceDiagram
    participant Test as Test Body
    participant Auth as AuthAPI
    participant Base as BaseAPI
    participant ReqI as RequestInterceptor
    participant ResI as ResponseInterceptor
    participant Log as Logger
    participant PW as Playwright Request
    participant Server as Server

    Test->>Auth: authAPI.login({ userEmail, userPassword })
    Auth->>Base: this.post('/api/ecom/auth/login', credentials)
    Base->>Log: logger.info('POST /api/ecom/auth/login')
    Base->>ReqI: getHeaders()
    ReqI-->>Base: { Content-Type: application/json }

    Base->>PW: request.post(endpoint, { headers, data })
    PW->>Server: HTTP POST /api/ecom/auth/login
    Server-->>PW: 200 OK { token, userId, message }
    PW-->>Base: APIResponse

    Base->>ResI: logResponse(response)
    ResI->>Log: logger.info('Response: 200 /api/ecom/auth/login')
    Base->>ResI: isSuccess(response)
    ResI-->>Base: true (status 200)
    Base->>Base: JSON.parse(body) as LoginResponse

    Base-->>Auth: LoginResponse { token, userId }
    Auth->>ReqI: setAuthToken(response.token)
    Note over ReqI: static token = 'eyJhbG...'
    Auth-->>Test: LoginResponse
```

### API: `orderAPI.getAllProducts()` (After Login)

```mermaid
sequenceDiagram
    participant Test as Test Body
    participant Order as OrderAPI
    participant Base as BaseAPI
    participant ReqI as RequestInterceptor
    participant ResI as ResponseInterceptor
    participant PW as Playwright Request
    participant Server as Server

    Test->>Order: orderAPI.getAllProducts()
    Order->>Base: this.post('/api/ecom/product/get-all-products', {})
    Base->>ReqI: getHeaders()
    Note over ReqI: Token already set by login
    ReqI-->>Base: { Content-Type, Authorization: token }

    Base->>PW: request.post(endpoint, { headers, data })
    PW->>Server: HTTP POST (with auth header)
    Server-->>PW: 200 OK { data: [...products] }
    PW-->>Base: APIResponse

    Base->>ResI: logResponse(response)
    Base->>ResI: isSuccess(response) -> true
    Base->>Base: JSON.parse -> ProductListResponse

    Base-->>Order: ProductListResponse
    Order-->>Test: { data: [product1, product2, ...] }
```

### API: Error Response Flow (4xx/5xx)

```mermaid
sequenceDiagram
    participant Client as API Client
    participant Base as BaseAPI
    participant ReqI as RequestInterceptor
    participant ResI as ResponseInterceptor
    participant Log as Logger
    participant PW as Playwright Request

    Client->>Base: this.get(endpoint)
    Base->>ReqI: getHeaders()
    Base->>PW: request.get(endpoint, { headers })
    PW-->>Base: APIResponse (401)

    Base->>ResI: logResponse(response)
    ResI->>Log: 'Response: 401 /api/...'
    Base->>ResI: isSuccess(response)
    ResI-->>Base: false

    Base->>ResI: extractErrorMessage(response)
    ResI-->>Base: 'Session Timeout'
    Base->>ResI: isClientError(response)
    ResI-->>Base: true (401 is 4xx)
    Base->>Log: 'Client Error [401]: Session Timeout'
    Base--xClient: throw Error('API request failed with status 401: Session Timeout')
```

### Parallel API: Worker-Scoped Auth Flow

```mermaid
sequenceDiagram
    participant T0 as Worker 0 Test
    participant T1 as Worker 1 Test
    participant AF as apiAuthFixture
    participant Auth as AuthAPI
    participant TM as TokenManager
    participant RI as RequestInterceptor
    participant Base as BaseAPI
    participant Server as Server

    par Worker 0 Setup
        T0->>AF: workerAuth fixture
        AF->>AF: workerIndex = testInfo.parallelIndex (0)
        AF->>Auth: new AuthAPI(request, 0)
        AF->>Auth: login(credentials)
        Auth->>Server: POST /auth/login
        Server-->>Auth: { token: "AAA", userId }
        Auth->>RI: setWorkerAuthToken(0, "AAA")
        RI->>TM: workerTokens.set(0, "AAA")
    and Worker 1 Setup
        T1->>AF: workerAuth fixture
        AF->>AF: workerIndex = testInfo.parallelIndex (1)
        AF->>Auth: new AuthAPI(request, 1)
        AF->>Auth: login(credentials)
        Auth->>Server: POST /auth/login
        Server-->>Auth: { token: "BBB", userId }
        Auth->>RI: setWorkerAuthToken(1, "BBB")
        RI->>TM: workerTokens.set(1, "BBB")
    end

    par Worker 0 Test
        T0->>Base: workerOrderAPI.getAllProducts()
        Base->>RI: getWorkerHeaders(0)
        RI->>TM: resolveToken(0) → "AAA"
        RI-->>Base: { Authorization: "AAA" }
        Base->>Server: POST /product/get-all-products
        Server-->>T0: { data: [...products] }
    and Worker 1 Test
        T1->>Base: workerOrderAPI.getOrdersForCustomer()
        Base->>RI: getWorkerHeaders(1)
        RI->>TM: resolveToken(1) → "BBB"
        RI-->>Base: { Authorization: "BBB" }
        Base->>Server: GET /order/get-orders-for-customer/userId
        Server-->>T1: { data: [...orders] }
    end

    par Worker 0 Cleanup
        T0->>RI: clearWorkerAuthToken(0)
        RI->>TM: workerTokens.delete(0)
    and Worker 1 Cleanup
        T1->>RI: clearWorkerAuthToken(1)
        RI->>TM: workerTokens.delete(1)
    end
```

---

## 9. UI vs API Comparison

| Aspect | UI Test | API Test (Legacy) | API Test (Parallel) |
|--------|---------|----------|---------------------|
| **Playwright provides** | `page` (Browser Page) | `request` (APIRequestContext) | `request` (APIRequestContext) |
| **Base class** | `BasePage` (abstract) | `BaseAPI` (abstract) | `BaseAPI` (abstract, workerIndex) |
| **Fixture export** | `test` | `test` | `apiTest` |
| **Constructor stores** | `this.page = page` | `this.request = request` | `this.request + this.workerIndex` |
| **Interaction methods** | `click()`, `fill()`, `getText()` | `get<T>()`, `post<T>()`, `delete<T>()` | Same + worker-aware headers |
| **Auth mechanism** | Browser cookies/session | `RequestInterceptor` (static token) | `TokenManager` (per-worker Map) |
| **Request headers** | Managed by browser | `getHeaders()` | `getWorkerHeaders(workerIndex)` |
| **Token storage** | Browser session | `RequestInterceptor.token` | `TokenManager.workerTokens` |
| **Parallel safe?** | Yes (isolated contexts) | No (shared static token) | Yes (worker-scoped tokens) |
| **Response handling** | DOM assertions | `ResponseInterceptor` pipeline | Same |
| **Waits for** | DOM elements | HTTP responses | Same |
| **Returns** | Strings, booleans | Typed JSON objects | Same |
| **Artifacts on failure** | Screenshots, video, trace | Logs only | Logs only |
| **Browser needed?** | Yes | No | No |
| **Speed** | Slower (rendering) | Faster (HTTP only) | Fastest (parallel HTTP) |

---

## 10. Detailed Phase Breakdown

### Phase 1: Playwright Startup

When `npx playwright test` runs, Playwright reads `playwright.config.ts`:

```
playwright.config.ts
  |-- dotenv.config('.env.local')  // Load environment variables
  |-- defineConfig({
  |     testDir: './tests',
  |     timeout: 30000,
  |     workers: 2,                  // 2 parallel workers
  |     retries: CI ? 2 : 0,
  |     reporters: ['html', 'list', 'allure-playwright'],
  |     projects: [
  |       { name: 'api',             // API-only project
  |         testDir: './tests/api',
  |         fullyParallel: true,     // All API tests run in parallel
  |         use: { baseURL: 'https://rahulshettyacademy.com' }
  |       },
  |       { name: 'chromium', ... }, // UI projects
  |     ],
  |     use: {
  |       baseURL: 'https://rahulshettyacademy.com/client/',
  |       screenshot: 'only-on-failure',
  |       video: 'retain-on-failure',
  |       trace: 'on-first-retry'
  |     }
  |   })
```

### Phase 2: Fixture Resolution

Test files import either `test` or `apiTest` from `src/fixtures/index.ts`:

```typescript
// Legacy (UI + sequential API)
export const test = mergeTests(baseFixture, authFixture, dataFixture, loggingFixture);

// Parallel API
export const apiTest = mergeTests(apiAuthFixture, dataFixture, loggingFixture);
```

Playwright resolves which fixtures the test needs based on destructured parameters.

### Phase 3: Fixture Setup

**UI fixtures** create page objects:
```
new LoginPage(page)
  -> super(page) -> BasePage()
      -> this.page = page
      -> this.logger = Logger.getInstance()
  -> Initialize locators (lazy - no DOM queries yet)
```

**API fixtures (legacy)** create API clients:
```
new AuthAPI(request)
  -> super(request) -> BaseAPI(request)
      -> this.request = request
      -> this.logger = Logger.getInstance()
```

**API fixtures (parallel)** create worker-scoped API clients:
```
workerIndex = testInfo.parallelIndex  // e.g. 0, 1, 2...
new AuthAPI(request, workerIndex)
  -> super(request, workerIndex) -> BaseAPI(request, 0)
      -> this.request = request
      -> this.workerIndex = 0
      -> this.logger = Logger.getInstance()
authAPI.login(credentials)
  -> RequestInterceptor.setWorkerAuthToken(0, token)
  -> TokenManager.workerTokens.set(0, token)
```

### Phase 4: Logging (Auto)

Runs for every test automatically:
```
1. Extract feature name from test.describe() title
2. Determine suite type (ui/api/hybrid) from file path
3. Push annotations to testInfo
4. Log: "Starting test: 'should get all products' [order-api.spec.ts]"
```

### Phase 5: Test Execution

**UI path**: Test -> Page Object -> BasePage protected methods -> Playwright Page API
**API path**: Test -> API Client -> BaseAPI protected methods -> Interceptors -> Playwright Request API

### Phase 6: Teardown

```
1. Logging fixture: "Test passed (1234ms)" or "Test failed (5678ms)"
2. Playwright captures artifacts (screenshot, video, trace) based on config
3. Resources cleaned up: Page -> Context -> Browser (UI) or APIRequestContext (API)
4. Reporters generate output: HTML + Allure + console
```

### Singleton Initialization

```mermaid
sequenceDiagram
    participant Fixture as Fixture System
    participant Logger as Logger
    participant Winston as Winston
    participant Config as ConfigManager

    Fixture->>Logger: Logger.getInstance() [first call]
    Logger->>Logger: instance exists? NO
    Logger->>Winston: winston.createLogger()
    Winston-->>Logger: Console + File transport
    Logger-->>Fixture: Logger singleton

    Fixture->>Logger: Logger.getInstance() [subsequent]
    Logger-->>Fixture: same instance (cached)

    Fixture->>Config: ConfigManager.getInstance()
    Config->>Config: env = process.env.ENV || 'local'
    Config->>Config: loadConfig('local')
    Config-->>Fixture: ConfigManager singleton
```

---

## Folder Structure Reference

```
playwright-framework/
  playwright.config.ts           # Global config + environment loading + parallel API project
  src/
    fixtures/
      index.ts                   # test = mergeTests(base,auth,data,log) + apiTest = mergeTests(apiAuth,data,log)
      base.fixture.ts            # Page objects + API clients
      auth.fixture.ts            # Pre-authenticated page
      api-auth.fixture.ts        # Parallel-safe: workerIndex, workerAuth, workerAuthAPI, workerUserAPI, workerOrderAPI
      data.fixture.ts            # Test data (testUser, testOrder)
      logging.fixture.ts         # Auto-annotations + logging
    pages/
      BasePage.ts                # Abstract: navigate, click, fill, getText
      LoginPage.ts               # Login form interactions
      DashboardPage.ts           # Product listing + cart
      CartPage.ts                # Cart review + checkout
      CheckoutPage.ts            # Country selection + place order
      UserProfilePage.ts         # Orders page
    api/
      clients/
        AuthAPI.ts               # login(workerIndex?), loginShared(), register()
        UserAPI.ts               # registerUser(), getUserDetails() [workerIndex-aware]
        OrderAPI.ts              # getAllProducts(), createOrder(), etc. [workerIndex-aware]
      interceptors/
        RequestInterceptor.ts    # getHeaders(), getWorkerHeaders(), setWorkerAuthToken(), setSharedAuthToken()
        ResponseInterceptor.ts   # Response logging + error classification
        TokenManager.ts          # Worker-scoped token Map + shared token + resolveToken()
      models/
        AuthModels.ts            # LoginRequest/Response, RegisterRequest/Response
        UserModels.ts            # CreateUserRequest, UserResponse
        OrderModels.ts           # Product, Order, CreateOrderRequest/Response
    core/
      base/
        BaseAPI.ts               # Abstract: HTTP methods + workerIndex + getRequestHeaders()
        BasePage.ts              # Abstract: page interactions
        BaseComponent.ts         # Abstract: reusable UI components
      logger/
        Logger.ts                # Winston singleton (console + file)
      config/
        ConfigManager.ts         # Environment-specific config singleton
    services/
      UserService.ts             # Facade combining UI + API user flows
    utils/
      constants/                 # ErrorMessages, Routes, Selectors
      decorators/                # retry, step decorators
      helpers/                   # DateHelper, StringHelper, WaitHelper
      types/                     # custom-types, global.d.ts
    data/
      factories/                 # TestDataFactory
      test-data.ts               # Static test data (credentials, products)
  tests/
    ui/                          # UI-only tests (login, dashboard)
    api/                         # API-only tests (auth, user, order)
      parallel-api.spec.ts       # Worker-scoped parallel token tests
      shared-token-api.spec.ts   # Shared token parallel tests
    hybrid/                      # E2E combining UI + API
```
