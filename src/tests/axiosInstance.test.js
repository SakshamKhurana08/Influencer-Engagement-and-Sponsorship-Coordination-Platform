/**
 * Tests for src/api/axiosInstance.js
 * Mocks axios to verify interceptor behaviour.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest';
import axios from 'axios';

// We import the module after setting up mocks so interceptors register
vi.mock('axios', async () => {
  const requestInterceptors = [];
  const responseInterceptors = [];

  const mockAxios = {
    create: vi.fn(() => ({
      interceptors: {
        request: {
          use: vi.fn((onFulfilled, onRejected) => {
            requestInterceptors.push({ onFulfilled, onRejected });
          }),
        },
        response: {
          use: vi.fn((onFulfilled, onRejected) => {
            responseInterceptors.push({ onFulfilled, onRejected });
          }),
        },
      },
      get: vi.fn(),
      post: vi.fn(),
      _requestInterceptors: requestInterceptors,
      _responseInterceptors: responseInterceptors,
    })),
    defaults: { headers: { common: {} } },
  };
  return { default: mockAxios };
});

describe('axiosInstance interceptors', () => {

  beforeEach(() => {
    localStorage.clear();
    window.location.href = '';
  });

  it('request interceptor attaches token when present', async () => {
    localStorage.setItem('token', 'my-jwt');
    // Re-import to trigger interceptor registration
    const { default: api } = await import('../api/axiosInstance');
    const [interceptor] = api.interceptors.request.use.mock.calls;
    const config = { headers: {} };
    const result = interceptor[0](config);
    expect(result.headers['Authorization']).toBe('Bearer my-jwt');
  });

  it('request interceptor does NOT attach token when absent', async () => {
    localStorage.removeItem('token');
    const { default: api } = await import('../api/axiosInstance');
    const [interceptor] = api.interceptors.request.use.mock.calls;
    const config = { headers: {} };
    const result = interceptor[0](config);
    expect(result.headers['Authorization']).toBeUndefined();
  });

  it('response interceptor passes through successful responses', async () => {
    const { default: api } = await import('../api/axiosInstance');
    const [interceptor] = api.interceptors.response.use.mock.calls;
    const mockResponse = { data: 'ok', status: 200 };
    const result = interceptor[0](mockResponse);
    expect(result).toEqual(mockResponse);
  });

  it('response interceptor on 401 clears localStorage', async () => {
    localStorage.setItem('token', 'expired');
    localStorage.setItem('userRole', 'sponsor');
    const { default: api } = await import('../api/axiosInstance');
    const [interceptor] = api.interceptors.response.use.mock.calls;
    const error = { response: { status: 401 } };
    try { await interceptor[1](error); } catch {}
    expect(localStorage.getItem('token')).toBeNull();
    expect(localStorage.getItem('userRole')).toBeNull();
  });

  it('response interceptor on 401 redirects to /login', async () => {
    const { default: api } = await import('../api/axiosInstance');
    const [interceptor] = api.interceptors.response.use.mock.calls;
    const error = { response: { status: 401 } };
    try { await interceptor[1](error); } catch {}
    expect(window.location.href).toBe('/login');
  });

  it('response interceptor on non-401 does NOT clear storage', async () => {
    localStorage.setItem('token', 'valid');
    const { default: api } = await import('../api/axiosInstance');
    const [interceptor] = api.interceptors.response.use.mock.calls;
    const error = { response: { status: 500 } };
    try { await interceptor[1](error); } catch {}
    expect(localStorage.getItem('token')).toBe('valid');
  });

  it('response interceptor rejects non-401 errors', async () => {
    const { default: api } = await import('../api/axiosInstance');
    const [interceptor] = api.interceptors.response.use.mock.calls;
    const error = { response: { status: 403 } };
    await expect(interceptor[1](error)).rejects.toEqual(error);
  });
});
