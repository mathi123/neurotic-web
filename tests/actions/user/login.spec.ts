import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the security layer
vi.mock('@/actions/security/password', () => ({
  verifyPassword: vi.fn(),
}));

// Mock the storage layer
vi.mock('@/storage/user/user.read', () => ({
  readUserAndHashedPassword: vi.fn(),
}));

// Mock the domain layer
vi.mock('@/domain/credentials.model', () => ({
  credentialsSchema: {
    safeParse: vi.fn(),
  },
}));

import { loginWithCredentials } from '@/actions/user/login';
import { verifyPassword } from '@/actions/security/password';
import { readUserAndHashedPassword } from '@/storage/user/user.read';
import { credentialsSchema } from '@/domain/credentials.model';
import { user } from '../../builders/user.builder';

describe('loginWithCredentials', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful login', () => {
    it('returns user when credentials are valid and password matches', async () => {
      const credentials = { email: 'john.doe@example.com', password: 'password123' };
      const hashedPassword = 'hashed_password';
      const storedUser = user({
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'john.doe@example.com',
        name: 'John Doe',
      });

      // Mock schema validation success
      vi.mocked(credentialsSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: credentials,
      });

      // Mock user found in storage
      vi.mocked(readUserAndHashedPassword).mockResolvedValueOnce({
        user: storedUser,
        hashedPassword,
      });

      // Mock password verification success
      vi.mocked(verifyPassword).mockResolvedValueOnce(true);

      const result = await loginWithCredentials(credentials);

      expect(credentialsSchema.safeParse).toHaveBeenCalledTimes(1);
      expect(credentialsSchema.safeParse).toHaveBeenCalledWith(credentials);
      expect(readUserAndHashedPassword).toHaveBeenCalledTimes(1);
      expect(readUserAndHashedPassword).toHaveBeenCalledWith(credentials.email);
      expect(verifyPassword).toHaveBeenCalledTimes(1);
      expect(verifyPassword).toHaveBeenCalledWith(credentials.password, hashedPassword);
      expect(result).toEqual(storedUser);
    });
  });

  describe('invalid credentials', () => {
    it('throws error when schema validation fails', async () => {
      const credentials = { email: 'invalid-email', password: '' };

      // Mock schema validation failure
      vi.mocked(credentialsSchema.safeParse).mockReturnValueOnce({
        success: false,
        error: { issues: [] } as any,
      });

      await expect(loginWithCredentials(credentials)).rejects.toThrow('Invalid credentials.');

      expect(credentialsSchema.safeParse).toHaveBeenCalledTimes(1);
      expect(credentialsSchema.safeParse).toHaveBeenCalledWith(credentials);
      expect(readUserAndHashedPassword).not.toHaveBeenCalled();
      expect(verifyPassword).not.toHaveBeenCalled();
    });
  });

  describe('user not found', () => {
    it('returns null when user does not exist', async () => {
      const credentials = { email: 'nonexistent@example.com', password: 'password123' };

      // Mock schema validation success
      vi.mocked(credentialsSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: credentials,
      });

      // Mock user not found in storage
      vi.mocked(readUserAndHashedPassword).mockResolvedValueOnce({
        user: null,
        hashedPassword: null,
      });

      const result = await loginWithCredentials(credentials);

      expect(credentialsSchema.safeParse).toHaveBeenCalledTimes(1);
      expect(readUserAndHashedPassword).toHaveBeenCalledTimes(1);
      expect(readUserAndHashedPassword).toHaveBeenCalledWith(credentials.email);
      expect(verifyPassword).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });
  });

  describe('invalid password', () => {
    it('throws error when password verification fails', async () => {
      const credentials = { email: 'john.doe@example.com', password: 'wrongpassword' };
      const hashedPassword = 'hashed_password';
      const storedUser = user({
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'john.doe@example.com',
        name: 'John Doe',
      });

      // Mock schema validation success
      vi.mocked(credentialsSchema.safeParse).mockReturnValueOnce({
        success: true,
        data: credentials,
      });

      // Mock user found in storage
      vi.mocked(readUserAndHashedPassword).mockResolvedValueOnce({
        user: storedUser,
        hashedPassword,
      });

      // Mock password verification failure
      vi.mocked(verifyPassword).mockResolvedValueOnce(false);

      await expect(loginWithCredentials(credentials)).rejects.toThrow('Invalid credentials.');

      expect(credentialsSchema.safeParse).toHaveBeenCalledTimes(1);
      expect(readUserAndHashedPassword).toHaveBeenCalledTimes(1);
      expect(readUserAndHashedPassword).toHaveBeenCalledWith(credentials.email);
      expect(verifyPassword).toHaveBeenCalledTimes(1);
      expect(verifyPassword).toHaveBeenCalledWith(credentials.password, hashedPassword);
    });
  });
});
