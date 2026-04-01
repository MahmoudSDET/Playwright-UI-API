// EN: Import base fixture and interceptor/config dependencies
import { baseFixture } from './base.fixture';
import { ConfigManager } from '../core/config/ConfigManager';
import { RequestInterceptor } from '../api/interceptors/RequestInterceptor';
import { AuthAPI } from '../api/clients/AuthAPI';
import { UserAPI } from '../api/clients/UserAPI';
import { OrderAPI } from '../api/clients/OrderAPI';
import { LoginResponse } from '../api/models/AuthModels';

/**
 * EN: Type for the API auth fixture - provides worker-scoped authenticated API clients.
 */
export type ApiAuthFixtures = {
  // EN: Worker index from Playwright's parallel execution context
  workerIndex: number;
  // EN: Pre-authenticated AuthAPI client scoped to this worker
  workerAuthAPI: AuthAPI;
  // EN: Pre-authenticated UserAPI client scoped to this worker
  workerUserAPI: UserAPI;
  // EN: Pre-authenticated OrderAPI client scoped to this worker
  workerOrderAPI: OrderAPI;
  // EN: Login response with token and userId for convenience
  workerAuth: LoginResponse;
};

/**
 * EN: API Auth fixture that generates a unique token per parallel worker.
 *     Each worker logs in independently and stores its own token via TokenManager.
 *     This enables safe parallel API test execution without token conflicts.
 */
export const apiAuthFixture = baseFixture.extend<ApiAuthFixtures>({
  // EN: Expose the worker index from testInfo.parallelIndex
  workerIndex: async ({}, use, testInfo) => {
    await use(testInfo.parallelIndex);
  },

  // EN: Login once per test, store token scoped to this worker, and provide AuthAPI
  workerAuth: async ({ request }, use, testInfo) => {
    const workerIdx = testInfo.parallelIndex;
    const config = ConfigManager.getInstance().getConfig();

    // EN: Create a worker-scoped AuthAPI and login
    const authAPI = new AuthAPI(request, workerIdx);
    const loginResponse = await authAPI.login({
      userEmail: config.credentials.email,
      userPassword: config.credentials.password,
    });

    await use(loginResponse);

    // EN: Cleanup: clear this worker's token after the test
    RequestInterceptor.clearWorkerAuthToken(workerIdx);
  },

  // EN: Provide a worker-scoped AuthAPI client (already authenticated via workerAuth)
  workerAuthAPI: async ({ request, workerAuth }, use, testInfo) => {
    const authAPI = new AuthAPI(request, testInfo.parallelIndex);
    await use(authAPI);
  },

  // EN: Provide a worker-scoped UserAPI client
  workerUserAPI: async ({ request, workerAuth }, use, testInfo) => {
    const userAPI = new UserAPI(request, testInfo.parallelIndex);
    await use(userAPI);
  },

  // EN: Provide a worker-scoped OrderAPI client
  workerOrderAPI: async ({ request, workerAuth }, use, testInfo) => {
    const orderAPI = new OrderAPI(request, testInfo.parallelIndex);
    await use(orderAPI);
  },
});
