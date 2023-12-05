import '@testing-library/jest-dom/vitest';
import { beforeAll, afterAll, afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

import { server } from './src/mocks/server.js';

beforeAll(() => server.listen());

afterEach(() => {
  cleanup();
});

afterAll(() => server.close());
