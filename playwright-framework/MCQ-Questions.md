# Playwright POM Framework — MCQ Questions

---

## Section 1: Design Patterns (20 Questions)

### Q1. Which design pattern does `ConfigManager` implement?
- A) Factory
- B) Builder
- C) Singleton
- D) Observer

<details><summary>Answer</summary>C) Singleton — It uses `private static instance` and `static getInstance()` with lazy initialization.</details>

---

### Q2. Which classes in this framework use the Singleton pattern?
- A) `Logger` and `BasePage`
- B) `ConfigManager` and `Logger`
- C) `AuthAPI` and `UserAPI`
- D) `PageFactory` and `TestDataFactory`

<details><summary>Answer</summary>B) ConfigManager and Logger — Both have `private constructor()`, `private static instance`, and `static getInstance()`.</details>

---

### Q3. What pattern does `UserBuilder` implement?
- A) Factory
- B) Prototype
- C) Builder
- D) Adapter

<details><summary>Answer</summary>C) Builder — It uses fluent chaining methods (e.g., `withEmail().withPassword()`) and a `build()` method to construct the final object.</details>

---

### Q4. What makes the Builder pattern in `UserBuilder` "fluent"?
- A) It throws errors on invalid input
- B) Each setter method returns `this`
- C) It uses generics
- D) It caches built objects

<details><summary>Answer</summary>B) Each setter method returns `this` — allowing method chaining like `new UserBuilder().withEmail('a@b.com').withPassword('123').build()`.</details>

---

### Q5. Which design pattern does `AuthService` implement?
- A) Strategy
- B) Facade
- C) Adapter
- D) Proxy

<details><summary>Answer</summary>B) Facade — It provides a simplified interface (`loginViaUI`, `loginViaAPI`) that hides the complexity of UI and API authentication behind a single class.</details>

---

### Q6. What pattern is represented by `IExecutionStrategy`, `LocalStrategy`, and `CIStrategy`?
- A) Template Method
- B) Factory
- C) Strategy
- D) Command

<details><summary>Answer</summary>C) Strategy — `IExecutionStrategy` defines an interface, and `LocalStrategy`/`CIStrategy` provide different implementations for different execution environments.</details>

---

### Q7. What does `LocalStrategy.getRetryCount()` return?
- A) 1
- B) 2
- C) 3
- D) 0

<details><summary>Answer</summary>D) 0 — Local development doesn't retry failed tests.</details>

---

### Q8. What does `CIStrategy.shouldRecordVideo()` return?
- A) `false`
- B) `true`
- C) Depends on config
- D) `undefined`

<details><summary>Answer</summary>B) true — In CI, video is always recorded for debugging failed tests.</details>

---

### Q9. Which pattern do `PageFactory` and `APIClientFactory` implement?
- A) Abstract Factory
- B) Factory Method
- C) Simple Factory
- D) Prototype

<details><summary>Answer</summary>C) Simple Factory — They have `create*()` methods that instantiate and return specific objects (e.g., `createLoginPage()`, `createAuthAPI()`).</details>

---

### Q10. What pattern does `BaseComponent` represent?
- A) Composite
- B) Component Pattern
- C) Decorator
- D) Bridge

<details><summary>Answer</summary>B) Component Pattern — It provides a reusable base for UI components (like `DataTable`) with a `root` locator and shared methods like `isVisible()` and `waitForVisible()`.</details>

---

### Q11. What does `OrderBuilder.build()` return?
- A) A reference to the internal data
- B) A shallow copy with `{ ...this.data }`
- C) A deep copy with spread on both the object and the orders array
- D) A JSON string

<details><summary>Answer</summary>C) A deep copy — It returns `{ ...this.data, orders: [...this.data.orders] }` to prevent mutation of the builder's internal state.</details>

---

### Q12. What does `UserBuilder.build()` return?
- A) A deep copy of the data
- B) A shallow copy using `{ ...this.data }`
- C) The original data reference
- D) A frozen object

<details><summary>Answer</summary>B) A shallow copy using `{ ...this.data }` — Unlike OrderBuilder, it doesn't need deep copy since all fields are primitives.</details>

---

### Q13. `BasePage` is:
- A) A concrete class
- B) An interface
- C) An abstract class
- D) A mixin

<details><summary>Answer</summary>C) An abstract class — It cannot be instantiated directly and provides shared functionality for page objects.</details>

---

### Q14. Which of the following is NOT a method defined in `IExecutionStrategy`?
- A) `setup()`
- B) `teardown()`
- C) `getBaseURL()`
- D) `getConfig()`

<details><summary>Answer</summary>D) getConfig() — The interface defines `setup()`, `teardown()`, `getBaseURL()`, `shouldRecordVideo()`, and `getRetryCount()`.</details>

---

### Q15. The `@step` decorator wraps a method with:
- A) `try/catch`
- B) `test.step()` for Allure reporting
- C) `setTimeout()`
- D) `Promise.all()`

<details><summary>Answer</summary>B) test.step() — It wraps the original method in a `test.step(stepName, ...)` call for Allure report step grouping.</details>

---

### Q16. What are the default parameters for `@retry()`?
- A) maxAttempts = 5, delayMs = 2000
- B) maxAttempts = 3, delayMs = 1000
- C) maxAttempts = 3, delayMs = 500
- D) maxAttempts = 2, delayMs = 1000

<details><summary>Answer</summary>B) maxAttempts = 3, delayMs = 1000</details>

---

### Q17. What does `RequestInterceptor` use to manage the auth token?
- A) Instance property
- B) Static property (`private static token`)
- C) Local storage
- D) Environment variable

<details><summary>Answer</summary>B) Static property — `private static token: string | null = null` shared across all usages.</details>

---

### Q18. How does `RequestInterceptor.getHeaders()` handle the Authorization header?
- A) Always includes it
- B) Includes it only if `token` is not null
- C) Reads it from environment variables
- D) Throws an error if token is missing

<details><summary>Answer</summary>B) It conditionally adds `Authorization: Bearer {token}` only when a token has been set.</details>

---

### Q19. Page Object classes store their selectors as:
- A) Public static constants
- B) Private readonly Locator fields
- C) External JSON files
- D) Global variables

<details><summary>Answer</summary>B) Private readonly Locator fields — e.g., `private readonly emailInput: Locator`.</details>

---

### Q20. What is `BasePage.path`?
- A) A concrete property with default value
- B) An abstract readonly property that subclasses must implement
- C) A static constant
- D) A method returning a URL

<details><summary>Answer</summary>B) An abstract readonly property — Each page class must define its own route path.</details>

---

## Section 2: TypeScript Features (15 Questions)

### Q21. What TypeScript feature does `ConfigManager.get()` use for type-safe access?
- A) Function overloading
- B) Conditional types
- C) Generic constraint with `keyof` (`K extends keyof EnvironmentConfig`)
- D) Type assertion

<details><summary>Answer</summary>C) Generic constraint with `keyof` — The signature `get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K]` ensures type-safe property access.</details>

---

### Q22. What is the return type of `BaseAPI.get<T>()`?
- A) `T`
- B) `Promise<T>`
- C) `APIResponse`
- D) `Promise<APIResponse>`

<details><summary>Answer</summary>B) Promise&lt;T&gt; — The generic type parameter T is resolved from the API response JSON.</details>

---

### Q23. What TypeScript assertion does `const Routes = { ... } as const` provide?
- A) Makes all values `string`
- B) Makes the object deeply immutable (readonly) with literal types
- C) Converts to JSON
- D) Creates a new copy

<details><summary>Answer</summary>B) `as const` makes the object deeply readonly and narrows all values to their literal types instead of `string`.</details>

---

### Q24. The `Environment` type is defined as:
- A) `enum Environment { Local, Staging, Production }`
- B) `type Environment = 'local' | 'staging' | 'production'`
- C) `interface Environment { name: string }`
- D) `class Environment`

<details><summary>Answer</summary>B) `type Environment = 'local' | 'staging' | 'production'` — a union of string literals.</details>

---

### Q25. What TypeScript type does `ApiResponse<T>` represent?
- A) `{ data: T; status: number; message?: string }`
- B) `{ body: T; code: number }`
- C) `Promise<T>`
- D) `T | Error`

<details><summary>Answer</summary>A) `{ data: T; status: number; message?: string }` — A generic wrapper for API responses with optional message.</details>

---

### Q26. How does `@step` decorator access the original method?
- A) `target.method`
- B) `descriptor.value`
- C) `propertyKey()`
- D) `Reflect.getMetadata()`

<details><summary>Answer</summary>B) `descriptor.value` — The `PropertyDescriptor.value` holds the original method reference.</details>

---

### Q27. What is the type of `TestMeta.severity`?
- A) `string`
- B) `number`
- C) `'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'`
- D) `enum Severity`

<details><summary>Answer</summary>C) A union of five string literals: `'blocker' | 'critical' | 'normal' | 'minor' | 'trivial'`.</details>

---

### Q28. What does `protected readonly page: Page` in `BasePage` constructor mean?
- A) `page` is public and mutable
- B) `page` is accessible in subclasses, assignable once
- C) `page` is private and immutable
- D) `page` is accessible everywhere

<details><summary>Answer</summary>B) `protected readonly` means subclasses can read `this.page` but cannot reassign it. It's not accessible outside the class hierarchy.</details>

---

### Q29. The `configs` object in `ConfigManager` uses which TypeScript utility type?
- A) `Partial<Environment>`
- B) `Map<Environment, EnvironmentConfig>`
- C) `Record<Environment, EnvironmentConfig>`
- D) `Array<EnvironmentConfig>`

<details><summary>Answer</summary>C) `Record<Environment, EnvironmentConfig>` — Maps each environment key to its config object.</details>

---

### Q30. What TypeScript feature does the `@retry` decorator use to re-throw the last error?
- A) Type narrowing
- B) `lastError` typed as `Error | undefined`, thrown after loop
- C) Custom error class
- D) `never` return type

<details><summary>Answer</summary>B) It tracks `let lastError: Error | undefined` and throws it after all attempts are exhausted.</details>

---

### Q31. What does `data?: unknown` in `BaseAPI.post<T>(endpoint, data?)` indicate?
- A) `data` accepts any type and is optional
- B) `data` must be a string
- C) `data` is required
- D) `data` accepts only objects

<details><summary>Answer</summary>A) `unknown` accepts any type safely, and `?` makes the parameter optional.</details>

---

### Q32. What TypeScript syntax makes `PaginationParams.sortOrder` accept only `'asc'` or `'desc'`?
- A) `sortOrder: string`
- B) `sortOrder?: 'asc' | 'desc'`
- C) `sortOrder: enum`
- D) `sortOrder: boolean`

<details><summary>Answer</summary>B) `sortOrder?: 'asc' | 'desc'` — Optional property restricted to two literal values.</details>

---

### Q33. What does `??` (nullish coalescing) do in `getCellText()`?
```typescript
(await this.rows.nth(row).locator('td').nth(col).textContent()) ?? ''
```
- A) Returns the left side if it is truthy
- B) Returns `''` if the left side is `null` or `undefined`
- C) Returns `''` if the left side is falsy (including `0` and `''`)
- D) Throws an error if left side is null

<details><summary>Answer</summary>B) `??` returns the right operand only when the left is `null` or `undefined`, unlike `||` which also triggers for `0`, `''`, and `false`.</details>

---

### Q34. Why is `EnvironmentConfig.credentials` a nested object?
- A) For serialization
- B) To group related email/password fields into a cohesive structure
- C) TypeScript requires it
- D) To enable lazy loading

<details><summary>Answer</summary>B) Grouping related `email` and `password` into `credentials: { email: string; password: string }` improves code organization and readability.</details>

---

### Q35. What TypeScript feature allows `WaitHelper.retryAction<T>()` to work with any return type?
- A) `any` type
- B) Generic type parameter `<T>`
- C) Type assertion
- D) Interface inheritance

<details><summary>Answer</summary>B) Generic type parameter `<T>` — The caller determines the return type, making the helper reusable for any async action.</details>

---

## Section 3: Playwright-Specific (15 Questions)

### Q36. What Playwright function composes the four fixture layers in `index.ts`?
- A) `test.extend()`
- B) `mergeTests()`
- C) `test.use()`
- D) `combineFixtures()`

<details><summary>Answer</summary>B) `mergeTests()` — Combines `baseFixture`, `authFixture`, `dataFixture`, and `loggingFixture` into one `test` object.</details>

---

### Q37. What does `{ auto: true }` mean in a Playwright fixture?
- A) The fixture runs manually when called
- B) The fixture runs automatically for every test without being requested
- C) The fixture runs once per suite
- D) The fixture is optional

<details><summary>Answer</summary>B) The fixture is automatically activated for every test, even if the test doesn't explicitly request it in its parameters.</details>

---

### Q38. What does `{ auto: false }` on `authenticatedPage` fixture mean?
- A) It runs before every test
- B) It must be explicitly requested in the test function parameters
- C) It runs only in CI
- D) It is deprecated

<details><summary>Answer</summary>B) The test must explicitly include `authenticatedPage` in its destructured fixture parameters for the login flow to execute.</details>

---

### Q39. What does `test.describe.configure({ mode: 'serial' })` do?
- A) Runs tests in random order
- B) Runs tests in parallel
- C) Runs tests sequentially, and skips remaining tests if one fails
- D) Runs tests independently

<details><summary>Answer</summary>C) Serial mode runs tests in order; if a test fails, all subsequent tests in the describe block are skipped.</details>

---

### Q40. In `playwright.config.ts`, what does `trace: 'on-first-retry'` mean?
- A) Trace is always recorded
- B) Trace is recorded only on the first retry of a failed test
- C) Trace is never recorded
- D) Trace is recorded on every retry

<details><summary>Answer</summary>B) The trace (including DOM snapshots, network, console logs) is captured only during the first retry of a failed test.</details>

---

### Q41. What does `screenshot: { mode: 'only-on-failure', fullPage: true }` configure?
- A) Screenshots on every test
- B) Screenshots only when a test fails, capturing the full scrollable page
- C) No screenshots
- D) Partial viewport screenshots on failure

<details><summary>Answer</summary>B) Screenshots are captured only when a test fails, and `fullPage: true` captures the entire scrollable page, not just the viewport.</details>

---

### Q42. What does `video: 'retain-on-failure'` mean?
- A) Video is always saved
- B) Video is recorded for all tests but only kept for failed ones
- C) Video is never recorded
- D) Video is recorded only for retries

<details><summary>Answer</summary>B) Video is recorded for every test, but the recording is only saved/retained when the test fails. Passed test videos are discarded.</details>

---

### Q43. How many browser projects are configured in `playwright.config.ts`?
- A) 2
- B) 3
- C) 4
- D) 5

<details><summary>Answer</summary>C) 4 — chromium, firefox, webkit, and mobile-chrome (Pixel 5).</details>

---

### Q44. What is `fullyParallel: false` in the config?
- A) Tests within a file run in parallel
- B) Tests within a file run serially (one at a time)
- C) All files run serially
- D) Parallelism is disabled entirely

<details><summary>Answer</summary>B) Tests within a single file run serially. Files themselves may still run in parallel across workers.</details>

---

### Q45. What reporter configurations are defined?
- A) HTML only
- B) HTML, list, and allure-playwright
- C) JSON and JUnit
- D) Allure only

<details><summary>Answer</summary>B) Three reporters: `html` (output to reports/html), `list` (console output), and `allure-playwright` (output to reports/allure-results).</details>

---

### Q46. What is the global test timeout set to?
- A) 10 seconds
- B) 15 seconds
- C) 30 seconds
- D) 60 seconds

<details><summary>Answer</summary>C) 30 seconds — `timeout: 30_000`.</details>

---

### Q47. What are `actionTimeout` and `navigationTimeout` set to?
- A) 5 seconds each
- B) 10 seconds each
- C) 15 seconds each
- D) 30 seconds each

<details><summary>Answer</summary>C) 15 seconds each — `actionTimeout: 15_000` and `navigationTimeout: 15_000`.</details>

---

### Q48. What does `forbidOnly: !!process.env.CI` do?
- A) Allows `test.only` in CI
- B) Fails the test run in CI if `test.only` is found in the code
- C) Disables all tests in CI
- D) Enables debug mode

<details><summary>Answer</summary>B) In CI environments (where `process.env.CI` is set), the test run will fail if any `test.only()` is left in the code, preventing accidental exclusive tests.</details>

---

### Q49. What does `expect: { timeout: 10_000 }` configure?
- A) Global test timeout
- B) Maximum time for each `expect()` assertion to pass
- C) Network request timeout
- D) Page load timeout

<details><summary>Answer</summary>B) It sets the maximum time Playwright will wait for an `expect()` assertion (e.g., `toBeVisible()`) to pass before failing — 10 seconds.</details>

---

### Q50. What does `retries: process.env.CI ? 2 : 0` mean?
- A) Always retry 2 times
- B) Retry 2 times in CI, 0 times locally
- C) Retry 0 times in CI, 2 locally
- D) Never retry

<details><summary>Answer</summary>B) In CI, failed tests are retried up to 2 times. Locally, there are no retries (0).</details>

---

## Section 4: Framework Architecture (15 Questions)

### Q51. What is the base URL of the application under test?
- A) `https://rahulshettyacademy.com/`
- B) `https://rahulshettyacademy.com/client/`
- C) `https://rahulshettyacademy.com/api/`
- D) `https://example.com`

<details><summary>Answer</summary>B) `https://rahulshettyacademy.com/client/`</details>

---

### Q52. Which class do all page objects inherit from?
- A) `Page`
- B) `BaseComponent`
- C) `BasePage`
- D) `BaseTest`

<details><summary>Answer</summary>C) `BasePage` — All page objects (LoginPage, DashboardPage, etc.) extend the abstract `BasePage` class.</details>

---

### Q53. What protected methods does `BasePage` provide to subclasses?
- A) `get()`, `post()`, `put()`, `delete()`
- B) `click()`, `fill()`, `getText()`, `isVisible()`, `selectOption()`, `uploadFile()`, `takeScreenshot()`
- C) `login()`, `logout()`, `navigate()`
- D) `setup()`, `teardown()`

<details><summary>Answer</summary>B) BasePage provides common browser interaction methods that subclasses use to build page-specific actions.</details>

---

### Q54. Which class do all API client classes inherit from?
- A) `BasePage`
- B) `BaseComponent`
- C) `BaseAPI`
- D) `BaseTest`

<details><summary>Answer</summary>C) `BaseAPI` — AuthAPI, UserAPI, and OrderAPI all extend the abstract `BaseAPI` class.</details>

---

### Q55. What does `BaseAPI.handleResponse<T>()` do when `response.ok()` is false?
- A) Returns `null`
- B) Returns an empty object
- C) Logs the error and throws an `Error` with status code and body
- D) Retries the request

<details><summary>Answer</summary>C) It logs `API Error [{status}]: {body}` via the logger and throws `new Error(`API request failed with status ${status}: ${body}`).</details>

---

### Q56. The logging fixture adds which annotations to each test?
- A) Only `feature`
- B) `feature`, `suite`, `file`, and `project`
- C) `severity` and `owner`
- D) `tag` and `priority`

<details><summary>Answer</summary>B) Four annotations: `feature` (describe block name), `suite` (ui/api/hybrid), `file` (test filename), and `project` (browser name).</details>

---

### Q57. How does the logging fixture extract the `suite` value?
- A) From the test title
- B) From the file path (extracting 'ui', 'api', or 'hybrid')
- C) From an environment variable
- D) From the test annotations

<details><summary>Answer</summary>B) `extractSuite(filePath)` parses the test file path to determine which folder (ui/api/hybrid) the test belongs to.</details>

---

### Q58. What logging library does the framework use?
- A) console.log
- B) Pino
- C) Winston
- D) Bunyan

<details><summary>Answer</summary>C) Winston — configured with console and file transports, with timestamp formatting `[YYYY-MM-DD HH:mm:ss] LEVEL: message`.</details>

---

### Q59. Where does the Logger write log files?
- A) `logs/app.log`
- B) `reports/test-execution.log`
- C) `output/debug.log`
- D) Console only

<details><summary>Answer</summary>B) `reports/test-execution.log` — Winston file transport writes to this path, while console transport outputs to stdout.</details>

---

### Q60. What format does the Logger use for timestamps?
- A) ISO 8601
- B) Unix timestamp
- C) `YYYY-MM-DD HH:mm:ss`
- D) `DD/MM/YYYY`

<details><summary>Answer</summary>C) `YYYY-MM-DD HH:mm:ss` — e.g., `[2026-03-31 14:30:00] INFO: message`.</details>

---

### Q61. How does `ConfigManager` determine which environment config to load?
- A) Command line argument
- B) `process.env.ENV || 'local'`
- C) A JSON file
- D) User prompt

<details><summary>Answer</summary>B) It reads the `ENV` environment variable, defaulting to `'local'` if not set.</details>

---

### Q62. What happens if `ConfigManager.loadConfig()` receives an unknown environment?
- A) Returns default config
- B) Returns `null`
- C) Throws `Error('Unknown environment: ...')`
- D) Falls back to local

<details><summary>Answer</summary>C) It throws an error: `throw new Error(`Unknown environment: ${env}`)` if the key is not found in the configs Record.</details>

---

### Q63. How does `TestDataFactory.createUniqueUser()` guarantee unique emails?
- A) UUID
- B) Random number
- C) Timestamp-based suffix (or custom suffix)
- D) Database sequence

<details><summary>Answer</summary>C) It generates emails like `testuser_{timestamp}@example.com` or uses a custom suffix parameter.</details>

---

### Q64. What are the four fixture layers (in merge order)?
- A) auth → base → data → logging
- B) base → auth → data → logging
- C) logging → base → auth → data
- D) data → auth → base → logging

<details><summary>Answer</summary>B) `baseFixture`, `authFixture`, `dataFixture`, `loggingFixture` — merged in this order via `mergeTests()`.</details>

---

### Q65. In the hybrid E2E test, what does `beforeEach` do?
- A) Creates a new browser
- B) Clears cookies, localStorage, sessionStorage, and reloads the page
- C) Runs login
- D) Creates test data

<details><summary>Answer</summary>B) It clears cookies via `context.clearCookies()`, clears storage via `page.evaluate()`, and reloads the page to ensure a clean state.</details>

---

## Section 5: Test Organization & Best Practices (10 Questions)

### Q66. What are the three test categories in this framework?
- A) unit, integration, system
- B) ui, api, hybrid
- C) smoke, regression, sanity
- D) fast, slow, e2e

<details><summary>Answer</summary>B) `ui` (pure browser tests), `api` (REST API tests), and `hybrid` (end-to-end combining UI + API).</details>

---

### Q67. Where do test files import `test` and `expect` from?
- A) `@playwright/test`
- B) `../../src/fixtures/index`
- C) `jest`
- D) `mocha`

<details><summary>Answer</summary>B) `../../src/fixtures/index` — The custom merged `test` object with all fixtures and custom `expect`.</details>

---

### Q68. Why do hybrid E2E tests use `test.describe.configure({ mode: 'serial' })`?
- A) For performance
- B) Because tests depend on shared state (e.g., login → add to cart → checkout)
- C) Playwright requires it
- D) To avoid race conditions in API calls

<details><summary>Answer</summary>B) The tests form a workflow where each step depends on the previous one (login → browse → add to cart → checkout → verify), so they must run in order.</details>

---

### Q69. What does `test.step()` provide in test reports?
- A) Code coverage
- B) Named sub-steps visible in Allure and HTML reports
- C) Performance metrics
- D) Screenshot attachments

<details><summary>Answer</summary>B) It groups actions into named sub-steps that appear as collapsible sections in Allure and HTML reports for better readability.</details>

---

### Q70. What error message constant verifies a successful registration?
- A) `ErrorMessages.LOGIN.INVALID_CREDENTIALS`
- B) `ErrorMessages.REGISTER.SUCCESS` → `'Registered Successfully'`
- C) `ErrorMessages.ORDER.ORDER_PLACED`
- D) `ErrorMessages.REGISTER.USER_EXISTS`

<details><summary>Answer</summary>B) `ErrorMessages.REGISTER.SUCCESS` which equals `'Registered Successfully'`.</details>

---

### Q71. What CSS selector targets the login button?
- A) `.login-btn`
- B) `#login`
- C) `button[type="submit"]`
- D) `.btn-primary`

<details><summary>Answer</summary>B) `#login` — as defined in `Selectors.LOGIN_BUTTON`.</details>

---

### Q72. What does `WaitHelper.waitForNetworkIdle()` do?
- A) Waits for page to load
- B) Waits until no network requests are in-flight for a duration
- C) Waits for a specific URL
- D) Waits for DOM ready

<details><summary>Answer</summary>B) It waits until the page's network activity becomes idle (no pending requests), with a configurable timeout (default 5000ms).</details>

---

### Q73. In the `@retry` decorator, what happens between retry attempts?
- A) Nothing
- B) A warning is logged and execution is delayed by `delayMs`
- C) The test is restarted
- D) The browser is refreshed

<details><summary>Answer</summary>B) It logs `[Retry] {methodName} attempt {n}/{max} failed, retrying in {delay}ms...` and waits for `delayMs` milliseconds.</details>

---

### Q74. What method does `DataTable` use to get the text of a specific cell?
- A) `getCellText(row, col)` using `this.rows.nth(row).locator('td').nth(col).textContent()`
- B) `getCell(row, col)`
- C) `readCell(row, col)`
- D) `cellValue(row, col)`

<details><summary>Answer</summary>A) `getCellText(row: number, col: number)` navigates to the nth row, then the nth cell locator, and returns its text content.</details>

---

### Q75. What is the `dotenv` configuration loading in `playwright.config.ts`?
- A) A single `.env` file
- B) Environment-specific file: `.env.{env}` (e.g., `.env.local`)
- C) A JSON config
- D) Command line args

<details><summary>Answer</summary>B) `dotenv.config({ path: path.resolve(__dirname, `.env.${env}`) })` loads environment-specific `.env` files based on the `ENV` variable.</details>

---

## Section 6: Advanced Patterns & Edge Cases (25 Questions)

### Q76. What does `BaseComponent` constructor accept?
- A) Only a `Page` object
- B) A `Page` and a root `Locator`
- C) A `string` selector
- D) An `ElementHandle`

<details><summary>Answer</summary>B) `constructor(protected readonly page: Page, protected readonly root: Locator)` — The root locator scopes all component interactions.</details>

---

### Q77. In `OrderAPI`, why is `token` stored as a private instance field instead of using `RequestInterceptor`?
- A) RequestInterceptor doesn't exist
- B) To allow each OrderAPI instance to have its own token, independent of the global interceptor
- C) TypeScript doesn't allow static access
- D) For performance reasons

<details><summary>Answer</summary>B) Instance-level token storage allows different OrderAPI instances to authenticate as different users without affecting the global state.</details>

---

### Q78. What does `BaseAPI.getRaw()` return compared to `BaseAPI.get<T>()`?
- A) Both return `Promise<T>`
- B) `getRaw()` returns `Promise<APIResponse>` (unparsed), `get<T>()` returns `Promise<T>` (parsed JSON)
- C) `getRaw()` returns a string
- D) They are identical

<details><summary>Answer</summary>B) `getRaw()` returns the raw Playwright `APIResponse` object without JSON parsing, while `get<T>()` parses the response body into type `T`.</details>

---

### Q79. What happens when `UserBuilder.withPassword()` is called?
- A) Only `userPassword` is set
- B) Both `userPassword` and `confirmPassword` are set to the same value
- C) Only `confirmPassword` is set
- D) A validation check runs

<details><summary>Answer</summary>B) It sets both fields to ensure the password and confirmation always match: `this.data.userPassword = password; this.data.confirmPassword = password`.</details>

---

### Q80. What is the default `occupation` in `UserBuilder`?
- A) `'Engineer'`
- B) `'Developer'`
- C) `'Student'`
- D) `'Teacher'`

<details><summary>Answer</summary>C) `'Student'` — The default test user data sets `occupation: 'Student'`.</details>

---

### Q81. What is the difference between `workers: 1` locally vs in CI?
- A) CI uses more workers
- B) Both are set to `1` — no difference
- C) Local uses 0
- D) CI uses all available CPUs

<details><summary>Answer</summary>B) Both are set to 1: `workers: process.env.CI ? 1 : 1` — tests run with a single worker in all environments.</details>

---

### Q82. What selector constant targets the loading spinner?
- A) `Selectors.LOADER`
- B) `Selectors.LOADING_SPINNER` → `'ngx-spinner'`
- C) `Selectors.SPINNER`
- D) `Selectors.PROGRESS_BAR`

<details><summary>Answer</summary>B) `Selectors.LOADING_SPINNER` which maps to the Angular component `'ngx-spinner'`.</details>

---

### Q83. How does `ResponseInterceptor` differ from `RequestInterceptor`?
- A) They are the same class
- B) `RequestInterceptor` manages outgoing headers/tokens; `ResponseInterceptor` handles incoming response processing
- C) `ResponseInterceptor` manages tokens
- D) They are not related

<details><summary>Answer</summary>B) `RequestInterceptor` adds auth tokens and headers to outgoing requests, while `ResponseInterceptor` processes and validates incoming API responses.</details>

---

### Q84. What is `Selectors.TOAST_SUCCESS`?
- A) `'.toast-success'`
- B) `'.toast-success .toast-message'`
- C) `'#toast'`
- D) `'.success-msg'`

<details><summary>Answer</summary>B) `'.toast-success .toast-message'` — Targets the message text inside a success toast notification.</details>

---

### Q85. In the fixture system, which fixture creates `testUser` and `testOrder` instances?
- A) base.fixture.ts
- B) auth.fixture.ts
- C) data.fixture.ts
- D) logging.fixture.ts

<details><summary>Answer</summary>C) data.fixture.ts — It provides `testUser: CreateUserRequest` and `testOrder: CreateOrderRequest` via `TestDataFactory`.</details>

---

### Q86. What does `BaseComponent.waitForVisible()` do?
- A) Clicks the component
- B) Waits until the root locator becomes visible on the page
- C) Scrolls to the component
- D) Takes a screenshot

<details><summary>Answer</summary>B) It waits until the component's root element becomes visible in the DOM, typically using Playwright's built-in auto-waiting.</details>

---

### Q87. What HTTP methods does `BaseAPI` expose as protected?
- A) Only `get` and `post`
- B) `get`, `post`, `put`, `delete`
- C) `get`, `post`, `put`, `patch`, `delete`, and `getRaw`
- D) All HTTP methods including `head` and `options`

<details><summary>Answer</summary>C) Six protected methods: `get<T>()`, `post<T>()`, `put<T>()`, `patch<T>()`, `delete<T>()`, and `getRaw()` for unparsed responses.</details>

---

### Q88. What does `AddressBuilder` produce?
- A) A `CreateUserRequest`
- B) A `CreateOrderRequest`
- C) An address object used in orders or user profiles
- D) A URL string

<details><summary>Answer</summary>C) It builds an address data object (with fields like country, street, etc.) using the same fluent builder pattern as `UserBuilder`.</details>

---

### Q89. What is `Routes.API.AUTH_LOGIN`?
- A) `'/login'`
- B) `'/api/ecom/auth/login'`
- C) `'/auth/login'`
- D) `'/api/auth'`

<details><summary>Answer</summary>B) `'/api/ecom/auth/login'` — The API endpoint for user authentication.</details>

---

### Q90. What does `Routes.HOME` resolve to?
- A) `'/'`
- B) `'#/dashboard/dash'`
- C) `'/home'`
- D) `'#/home'`

<details><summary>Answer</summary>B) `'#/dashboard/dash'` — The hash-based route for the dashboard/home page.</details>

---

### Q91. What is the `expect` timeout vs the global `timeout`?
- A) Both are 30 seconds
- B) `expect` is 10s for assertions; global is 30s for the entire test
- C) `expect` is 30s; global is 10s
- D) Both are 10 seconds

<details><summary>Answer</summary>B) `expect: { timeout: 10_000 }` gives assertions 10 seconds to pass, while `timeout: 30_000` is the max duration for an entire test.</details>

---

### Q92. What does `WaitHelper.retryAction<T>()` accept as its first parameter?
- A) A string
- B) A callback function `() => Promise<T>`
- C) A Locator
- D) A Page object

<details><summary>Answer</summary>B) An async callback `action: () => Promise<T>` — it retries this function up to `maxRetries` times with `delayMs` between attempts.</details>

---

### Q93. What does `WaitHelper.delay(ms)` do?
- A) Blocks the thread
- B) Returns `new Promise(resolve => setTimeout(resolve, ms))` — a non-blocking pause
- C) Refreshes the page
- D) Waits for network idle

<details><summary>Answer</summary>B) It creates a simple async delay using `Promise` and `setTimeout`, pausing execution without blocking the event loop.</details>

---

### Q94. What is the `outputDir` in `playwright.config.ts` used for?
- A) Test source files
- B) Test artifacts like screenshots: `'reports/screenshots'`
- C) Node modules
- D) Log files

<details><summary>Answer</summary>B) `'reports/screenshots'` — Playwright stores test artifacts (screenshots, videos, traces) in this directory.</details>

---

### Q95. In hybrid E2E tests, why does `beforeEach` clear both cookies AND localStorage/sessionStorage?
- A) It's redundant
- B) Cookies handle server-side state; localStorage/sessionStorage handle client-side state — both must be cleared for a clean test
- C) Only cookies matter
- D) Only localStorage matters

<details><summary>Answer</summary>B) Cookies manage server-side session data, while localStorage/sessionStorage hold client-side auth tokens and cached data. Both must be cleared to prevent state leakage between tests.</details>

---

### Q96. Which mobile device is configured in the projects array?
- A) iPhone 12
- B) Samsung Galaxy S21
- C) Pixel 5
- D) iPad Pro

<details><summary>Answer</summary>C) Pixel 5 — `{ name: 'mobile-chrome', use: { ...devices['Pixel 5'] } }`.</details>

---

### Q97. What does `Logger` use for its log format?
- A) JSON format
- B) `[timestamp] LEVEL: message` via `winston.format.printf()`
- C) XML format
- D) Plain unformatted text

<details><summary>Answer</summary>B) Custom format: `[${timestamp}] ${level.toUpperCase()}: ${message}` — e.g., `[2026-03-31 14:30:00] INFO: Login successful`.</details>

---

### Q98. What determines the `LOG_LEVEL` for the Logger?
- A) Hard-coded to `'debug'`
- B) `process.env.LOG_LEVEL || 'info'`
- C) Configured in playwright.config.ts
- D) Always `'error'`

<details><summary>Answer</summary>B) It reads the `LOG_LEVEL` environment variable, defaulting to `'info'` if not set.</details>

---

### Q99. Why does `BasePage` auto-initialize a logger in its constructor?
- A) For debugging only
- B) So every page object automatically has logging capability via `this.logger` without manual setup
- C) Playwright requires it
- D) For performance tracking

<details><summary>Answer</summary>B) By initializing `this.logger = Logger.getInstance()` in the constructor, all subclasses automatically inherit logging without repeating the setup.</details>

---

### Q100. What is the full inheritance chain when `LoginPage.login()` calls `this.fill()`?
- A) `LoginPage.fill()` → direct implementation
- B) `LoginPage` inherits `fill()` from `BasePage`, which wraps `this.page.locator().fill()`
- C) `fill()` comes from Playwright's `Page` class
- D) `fill()` is a global function

<details><summary>Answer</summary>B) `LoginPage` extends `BasePage`. When `this.fill()` is called, it invokes the protected method defined in `BasePage`, which internally uses Playwright's page/locator API to fill input fields.</details>

---

## Answer Key (Quick Reference)

| # | Answer | # | Answer | # | Answer | # | Answer |
|---|--------|---|--------|---|--------|---|--------|
| 1 | C | 26 | B | 51 | B | 76 | B |
| 2 | B | 27 | C | 52 | C | 77 | B |
| 3 | C | 28 | B | 53 | B | 78 | B |
| 4 | B | 29 | C | 54 | C | 79 | B |
| 5 | B | 30 | B | 55 | C | 80 | C |
| 6 | C | 31 | A | 56 | B | 81 | B |
| 7 | D | 32 | B | 57 | B | 82 | B |
| 8 | B | 33 | B | 58 | C | 83 | B |
| 9 | C | 34 | B | 59 | B | 84 | B |
| 10 | B | 35 | B | 60 | C | 85 | C |
| 11 | C | 36 | B | 61 | B | 86 | B |
| 12 | B | 37 | B | 62 | C | 87 | C |
| 13 | C | 38 | B | 63 | C | 88 | C |
| 14 | D | 39 | C | 64 | B | 89 | B |
| 15 | B | 40 | B | 65 | B | 90 | B |
| 16 | B | 41 | B | 66 | B | 91 | B |
| 17 | B | 42 | B | 67 | B | 92 | B |
| 18 | B | 43 | C | 68 | B | 93 | B |
| 19 | B | 44 | B | 69 | B | 94 | B |
| 20 | B | 45 | B | 70 | B | 95 | B |
| 21 | C | 46 | C | 71 | B | 96 | C |
| 22 | B | 47 | C | 72 | B | 97 | B |
| 23 | B | 48 | B | 73 | B | 98 | B |
| 24 | B | 49 | B | 74 | A | 99 | B |
| 25 | A | 50 | B | 75 | B | 100 | B |
