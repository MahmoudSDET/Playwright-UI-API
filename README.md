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
