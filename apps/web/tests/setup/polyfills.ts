/**
 * Test Environment Polyfills
 * 
 * This file sets up necessary polyfills for the Node.js test environment
 * to provide browser-like APIs that MSW and other libraries expect.
 * 
 * IMPORTANT: This must be imported before any MSW imports.
 */

import { TextEncoder, TextDecoder } from 'util';
import fetch, { Response, Request, Headers } from 'node-fetch';

// Set up text encoding polyfills
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder as any;

// Set up fetch API polyfills for MSW compatibility
global.fetch = fetch as any;
global.Response = Response as any;
global.Request = Request as any;
global.Headers = Headers as any;

// Set up crypto polyfill for secure operations in tests
if (!global.crypto) {
  try {
    // Use Node.js built-in webcrypto (Node 16+)
    const { webcrypto } = require('crypto');
    global.crypto = webcrypto;
  } catch (error) {
    // Fallback for older Node versions
    console.warn('WebCrypto not available, some crypto operations may fail in tests');
  }
}

// Mock import.meta for Vite environment variables in Jest
if (typeof global.importMeta === 'undefined') {
  (global as any).importMeta = {
    env: {
      VITE_API_URL: process.env.VITE_API_URL || 'http://localhost:4000',
      NODE_ENV: process.env.NODE_ENV || 'test',
      DEV: process.env.NODE_ENV !== 'production',
      PROD: process.env.NODE_ENV === 'production',
      MODE: process.env.NODE_ENV || 'test'
    }
  };
}

// Set up basic DOM APIs that might be needed
global.ReadableStream = global.ReadableStream || class ReadableStream {};
global.WritableStream = global.WritableStream || class WritableStream {};
global.TransformStream = global.TransformStream || class TransformStream {};

// Mock BroadcastChannel for MSW
global.BroadcastChannel = global.BroadcastChannel || class BroadcastChannel {
  constructor(public name: string) {}
  postMessage(_message: any) {}
  close() {}
  addEventListener(_type: string, _listener: any) {}
  removeEventListener(_type: string, _listener: any) {}
  dispatchEvent(_event: Event): boolean { return true; }
  onmessage = null;
  onmessageerror = null;
};

// Export to ensure TypeScript treats this as a module
export {};