/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src', '<rootDir>/tests/unit', '<rootDir>/tests/integration'],
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/main.tsx',
    '!src/vite-env.d.ts',
    '!src/components/ui/**', // Exclude UI components from coverage (they're third-party)
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  setupFiles: ['<rootDir>/tests/setup/polyfills.ts'],
  setupFilesAfterEnv: ['<rootDir>/tests/setup/jest.setup.ts'],
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        jsx: 'react-jsx',
      },
    }],
  },
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.{ts,tsx}',
    '<rootDir>/tests/integration/**/*.test.{ts,tsx}',
    '<rootDir>/src/**/__tests__/**/*.{ts,tsx}',
  ],
  testEnvironmentOptions: {
    jsdom: {
      url: 'http://localhost:3000',
    },
  },
  // Mock external dependencies that might cause issues in test environment
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^motion/react$': '<rootDir>/tests/__mocks__/motion.ts',
    '^sonner$': '<rootDir>/tests/__mocks__/sonner.ts',
    // Mock API to avoid import.meta issues
    '^../lib/api$': '<rootDir>/tests/__mocks__/api.ts',
    '^../../lib/api$': '<rootDir>/tests/__mocks__/api.ts',
  },
  // Handle import.meta.env in Jest
  globals: {
    'import.meta': {
      env: {
        VITE_API_URL: 'http://localhost:4000',
        NODE_ENV: 'test',
        DEV: false,
        PROD: false,
        MODE: 'test'
      }
    }
  },
};

export default config;