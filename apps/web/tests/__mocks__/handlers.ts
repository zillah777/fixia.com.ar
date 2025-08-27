import { http, HttpResponse } from 'msw';

const API_BASE = process.env.VITE_API_URL || 'https://api.fixia.com.ar/api';

export const handlers = [
  // Auth endpoints
  http.post(`${API_BASE}/auth/register`, async ({ request }) => {
    const body = await request.json() as any;
    
    // Simulate different registration scenarios
    if (body.email === 'existing@test.com') {
      return HttpResponse.json(
        { message: 'Email already exists' },
        { status: 409 }
      );
    }
    
    if (body.email === 'invalid@test') {
      return HttpResponse.json(
        { message: 'Invalid email format' },
        { status: 400 }
      );
    }
    
    // Successful registration
    return HttpResponse.json({
      message: 'Registration successful. Please verify your email.',
      user: {
        id: '1',
        email: body.email,
        name: body.fullName,
        userType: body.userType,
        emailVerified: false,
        isVerified: false,
        created_at: new Date().toISOString(),
      }
    });
  }),

  http.post(`${API_BASE}/auth/login`, async ({ request }) => {
    const body = await request.json() as any;
    
    // Demo user
    if (body.email === 'demo@fixia.com') {
      return HttpResponse.json({
        user: {
          id: '1',
          email: 'demo@fixia.com',
          name: 'Usuario Demo',
          userType: 'client',
          emailVerified: true,
          isVerified: true,
          planType: 'free',
          created_at: new Date().toISOString(),
        },
        token: 'mock-jwt-token',
        refreshToken: 'mock-refresh-token'
      });
    }
    
    // Unverified email scenario
    if (body.email === 'unverified@test.com') {
      return HttpResponse.json(
        { message: 'Please verify your email before logging in' },
        { status: 401 }
      );
    }
    
    // Invalid credentials
    if (body.email === 'invalid@test.com' || body.password === 'wrongpassword') {
      return HttpResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }
    
    // Successful login
    return HttpResponse.json({
      user: {
        id: '1',
        email: body.email,
        name: 'Test User',
        userType: 'client',
        emailVerified: true,
        isVerified: true,
        planType: 'free',
        created_at: new Date().toISOString(),
      },
      token: 'mock-jwt-token',
      refreshToken: 'mock-refresh-token'
    });
  }),

  http.post(`${API_BASE}/auth/verify-email`, async ({ request }) => {
    const body = await request.json() as any;
    
    // Expired token
    if (body.token === 'expired-token') {
      return HttpResponse.json(
        { message: 'Verification token has expired' },
        { status: 400 }
      );
    }
    
    // Invalid token
    if (body.token === 'invalid-token') {
      return HttpResponse.json(
        { message: 'Invalid verification token' },
        { status: 400 }
      );
    }
    
    // Successful verification
    return HttpResponse.json({
      message: 'Email verified successfully',
      user: {
        id: '1',
        email: 'test@example.com',
        emailVerified: true,
        isVerified: true,
      }
    });
  }),

  http.post(`${API_BASE}/auth/resend-verification`, async () => {
    // Simulate rate limiting
    if (Math.random() < 0.1) {
      return HttpResponse.json(
        { message: 'Too many requests. Please wait before resending.' },
        { status: 429 }
      );
    }
    
    return HttpResponse.json({
      message: 'Verification email sent successfully'
    });
  }),

  http.post(`${API_BASE}/auth/logout`, async () => {
    return HttpResponse.json({ message: 'Logged out successfully' });
  }),

  // User profile endpoint
  http.get(`${API_BASE}/user/profile`, async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return HttpResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      id: '1',
      email: 'test@example.com',
      name: 'Test User',
      userType: 'client',
      emailVerified: true,
      isVerified: true,
      planType: 'free',
      created_at: new Date().toISOString(),
    });
  }),
];