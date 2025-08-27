// Mock for sonner toast library to prevent issues during testing

export const toast = {
  success: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  warning: jest.fn(),
  loading: jest.fn(),
  dismiss: jest.fn(),
  custom: jest.fn(),
};

export const Toaster = ({ children, ...props }: any) => children;