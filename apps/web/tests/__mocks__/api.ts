/**
 * Mock API module for Jest tests
 * 
 * This mock avoids import.meta usage and provides a clean API interface for testing
 */

// Mock implementation of API client for testing
const mockApiClient = {
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
  request: jest.fn(),
};

// Mock token manager
const mockTokenManager = {
  getToken: jest.fn().mockReturnValue(null),
  setToken: jest.fn(),
  removeToken: jest.fn(),
  refreshToken: jest.fn(),
};

// Export mocked API
export const api = mockApiClient;
export const tokenManager = mockTokenManager;

// Mock environment variables for tests
export const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:4000';

export default mockApiClient;