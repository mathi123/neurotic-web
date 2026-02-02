import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/auth', () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

vi.mock('@/actions/user/search', () => ({
  searchUsers: vi.fn(),
}));

vi.mock('next/headers', () => ({
  headers: vi.fn().mockResolvedValue(new Headers()),
}));

import { GET } from '@/api/users/route';
import { auth } from '@/auth';
import { searchUsers } from '@/actions/user/search';
import { user } from '../../builders/user.builder';

describe('API Route - GET /api/users', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  const mockAdminUser = {
    id: 'admin-id',
    name: 'Admin',
    email: 'admin@example.com',
    role: 'admin',
    banned: false,
  };

  const mockRegularUser = {
    id: 'user-id',
    name: 'User',
    email: 'user@example.com',
    role: 'user',
    banned: false,
  };

  const mockBannedAdmin = {
    id: 'banned-admin-id',
    name: 'Banned Admin',
    email: 'banned-admin@example.com',
    role: 'admin',
    banned: true,
  };

  describe('authentication', () => {
    it('returns 401 when no session exists', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce(null);

      const request = {
        nextUrl: new URL('http://localhost/api/users'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
    });

    it('returns 401 when session has no user', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: null } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/users'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.code).toBe('unauthorized');
    });
  });

  describe('authorization', () => {
    it('returns 403 when user is not an admin', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockRegularUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/users'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json.code).toBe('forbidden');
      expect(json.errors[0].message).toBe('Admin access required');
    });

    it('returns 403 when user has no role', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({
        user: { ...mockRegularUser, role: null },
      } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/users'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(403);
    });

    it('returns 403 when admin user is banned', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockBannedAdmin } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/users'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(403);
    });
  });

  describe('successful requests', () => {
    it('returns 200 with users when admin requests without params', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);
      vi.mocked(searchUsers).mockResolvedValueOnce({
        records: [user({ id: '1', name: 'Test User' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/users'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(json.total).toBe(1);
      expect(searchUsers).toHaveBeenCalledTimes(1);
    });

    it('returns 200 when admin requests with valid query parameter', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);
      vi.mocked(searchUsers).mockResolvedValueOnce({
        records: [user({ id: '1', name: 'John Doe', email: 'john@example.com' })],
        total: 1,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/users?query=john'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.records).toHaveLength(1);
      expect(searchUsers).toHaveBeenCalledWith(expect.objectContaining({ query: 'john' }));
    });

    it('returns 200 when admin requests with pagination params', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);
      vi.mocked(searchUsers).mockResolvedValueOnce({
        records: [],
        total: 50,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/users?skip=10&take=5'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchUsers).toHaveBeenCalledWith(expect.objectContaining({ skip: 10, take: 5 }));
    });

    it('returns 200 when admin requests with sorting params', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);
      vi.mocked(searchUsers).mockResolvedValueOnce({
        records: [],
        total: 0,
      });

      const request = {
        nextUrl: new URL('http://localhost/api/users?sortBy=name&sortOrder=asc'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(200);
      expect(searchUsers).toHaveBeenCalledWith(expect.objectContaining({ sortBy: 'name', sortOrder: 'asc' }));
    });
  });

  describe('validation errors', () => {
    it('returns 400 when unexpected params are provided', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/users?unknownParam=value'),
      } as any;

      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json.code).toBe('invalid query parameters');
      expect(Array.isArray(json.errors)).toBe(true);
    });

    it('returns 400 when skip is negative', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/users?skip=-1'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('returns 400 when take exceeds maximum', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/users?take=1000'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('returns 400 when sortBy is invalid', async () => {
      vi.mocked(auth.api.getSession).mockResolvedValueOnce({ user: mockAdminUser } as any);

      const request = {
        nextUrl: new URL('http://localhost/api/users?sortBy=invalid'),
      } as any;

      const response = await GET(request);

      expect(response.status).toBe(400);
    });
  });
});
