#!/usr/bin/env node

/**
 * Test script for authentication endpoints
 * Tests the corrected authentication system
 */

const https = require('https');
const http = require('http');

// Configuration
const API_BASE = process.env.API_URL || 'http://localhost:3001';
const TEST_EMAIL = 'test-auth-fix@example.com';
const TEST_PASSWORD = 'TestPassword123';

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = API_BASE.startsWith('https');
    const client = isHttps ? https : http;
    const url = new URL(API_BASE + path);
    
    const options = {
      hostname: url.hostname,
      port: url.port || (isHttps ? 443 : 80),
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AuthTestScript/1.0',
        ...headers
      }
    };

    const req = client.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const response = {
            status: res.statusCode,
            headers: res.headers,
            body: body ? JSON.parse(body) : null
          };
          resolve(response);
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

// Test functions
async function testSimpleRegistration() {
  console.log('\n🔍 Testing Simple Registration...');
  
  const registerData = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
    fullName: 'Test User',
    userType: 'client',
    location: 'Test City',
    phone: '+1234567890'
  };

  try {
    const response = await makeRequest('POST', '/auth/simple/register', registerData);
    
    console.log(`Status: ${response.status}`);
    if (response.status === 201 || response.status === 200) {
      console.log('✅ Registration successful!');
      console.log('Response:', response.body);
      return true;
    } else if (response.status === 409) {
      console.log('⚠️ User already exists, continuing tests...');
      return true;
    } else {
      console.log('❌ Registration failed:');
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Registration error:', error.message);
    return false;
  }
}

async function testLogin() {
  console.log('\n🔍 Testing Login...');
  
  const loginData = {
    email: TEST_EMAIL,
    password: TEST_PASSWORD
  };

  try {
    const response = await makeRequest('POST', '/auth/login', loginData);
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ Login successful!');
      console.log('Response:', {
        user: response.body.user?.email,
        hasAccessToken: !!response.body.access_token,
        hasRefreshToken: !!response.body.refresh_token
      });
      return {
        success: true,
        accessToken: response.body.access_token,
        refreshToken: response.body.refresh_token
      };
    } else {
      console.log('❌ Login failed:');
      console.log('Response:', response.body);
      return { success: false };
    }
  } catch (error) {
    console.log('❌ Login error:', error.message);
    return { success: false };
  }
}

async function testVerifyEndpoint(accessToken) {
  console.log('\n🔍 Testing Verify Endpoint...');
  
  try {
    const response = await makeRequest('GET', '/auth/verify', null, {
      'Authorization': `Bearer ${accessToken}`
    });
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ Verify endpoint working!');
      console.log('Response:', response.body);
      return true;
    } else {
      console.log('❌ Verify endpoint failed:');
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Verify error:', error.message);
    return false;
  }
}

async function testRefreshEndpoint(refreshToken) {
  console.log('\n🔍 Testing Refresh Endpoint...');
  
  try {
    const response = await makeRequest('POST', '/auth/refresh', {
      refresh_token: refreshToken
    });
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ Refresh endpoint working!');
      console.log('Response has new access_token:', !!response.body.access_token);
      return true;
    } else {
      console.log('❌ Refresh endpoint failed:');
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Refresh error:', error.message);
    return false;
  }
}

async function testDevVerifyUser() {
  console.log('\n🔍 Testing Dev Verify User...');
  
  try {
    const response = await makeRequest('POST', '/auth/dev/verify-user', {
      email: TEST_EMAIL
    });
    
    console.log(`Status: ${response.status}`);
    if (response.status === 200) {
      console.log('✅ Dev verify user working!');
      console.log('Response:', response.body);
      return true;
    } else {
      console.log('❌ Dev verify user failed:');
      console.log('Response:', response.body);
      return false;
    }
  } catch (error) {
    console.log('❌ Dev verify error:', error.message);
    return false;
  }
}

// Main test execution
async function runTests() {
  console.log('🚀 Starting Authentication System Tests');
  console.log(`API Base URL: ${API_BASE}`);
  console.log(`Test Email: ${TEST_EMAIL}`);
  console.log('=' .repeat(50));

  const results = {
    registration: false,
    login: false,
    verify: false,
    refresh: false,
    devVerify: false
  };

  // Test registration
  results.registration = await testSimpleRegistration();
  
  // Test dev verify (to enable login without email verification)
  results.devVerify = await testDevVerifyUser();
  
  // Test login
  const loginResult = await testLogin();
  results.login = loginResult.success;
  
  if (results.login) {
    // Test verify endpoint
    results.verify = await testVerifyEndpoint(loginResult.accessToken);
    
    // Test refresh endpoint
    results.refresh = await testRefreshEndpoint(loginResult.refreshToken);
  }

  // Summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 TEST RESULTS SUMMARY');
  console.log('='.repeat(50));
  
  const testNames = {
    registration: 'Simple Registration',
    login: 'Login',
    verify: 'Verify Endpoint',
    refresh: 'Refresh Endpoint',
    devVerify: 'Dev Verify User'
  };
  
  let passedCount = 0;
  for (const [key, passed] of Object.entries(results)) {
    const status = passed ? '✅ PASS' : '❌ FAIL';
    console.log(`${status} - ${testNames[key]}`);
    if (passed) passedCount++;
  }
  
  console.log('-'.repeat(30));
  console.log(`Total: ${passedCount}/${Object.keys(results).length} tests passed`);
  
  if (passedCount === Object.keys(results).length) {
    console.log('\n🎉 ALL TESTS PASSED! Authentication system is working correctly.');
  } else {
    console.log('\n⚠️ Some tests failed. Please check the failing endpoints.');
  }
}

// Handle command line execution
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

module.exports = { runTests };