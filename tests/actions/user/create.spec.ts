import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the security layer
vi.mock('@/actions/security/password', () => ({
  saltAndHashPassword: vi.fn(),
}));

// Mock the storage layer
vi.mock('@/storage/user/user.create', () => ({
  dbUserCreate: vi.fn(),
}));

import { createUser } from '@/actions/user/create';
import { saltAndHashPassword } from '@/actions/security/password';
import { dbUserCreate } from '@/storage/user/user.create';
import { user } from '../../builders/user.builder';

describe('createUser', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful creation', () => {
    it('creates a user successfully with valid data and calls storage layer', async () => {
      const inputUser = user({
        email: 'john.doe@example.com',
        name: 'John Doe',
      });
      const password = 'password123';
      const hashedPassword = 'hashed_password';
      const expectedResult = user({
        id: '550e8400-e29b-41d4-a716-446655440001',
        email: 'john.doe@example.com',
        name: 'John Doe',
      });

      // Mock the password hashing
      vi.mocked(saltAndHashPassword).mockResolvedValueOnce(hashedPassword);

      // Mock the storage layer to return a successful result
      vi.mocked(dbUserCreate).mockResolvedValueOnce(expectedResult);

      const result = await createUser(inputUser, password);

      expect(saltAndHashPassword).toHaveBeenCalledTimes(1);
      expect(saltAndHashPassword).toHaveBeenCalledWith(password);
      expect(dbUserCreate).toHaveBeenCalledTimes(1);
      expect(dbUserCreate).toHaveBeenCalledWith(inputUser, hashedPassword);
      expect(result).toEqual(expectedResult);
    });

    it('passes through the hashed password to storage layer', async () => {
      const inputUser = user({
        email: 'jane.smith@example.com',
      });
      const password = 'securepass';
      const hashedPassword = 'different_hashed_password';
      const expectedResult = user({
        id: '550e8400-e29b-41d4-a716-446655440002',
        email: 'jane.smith@example.com',
      });

      vi.mocked(saltAndHashPassword).mockResolvedValueOnce(hashedPassword);
      vi.mocked(dbUserCreate).mockResolvedValueOnce(expectedResult);

      await createUser(inputUser, password);

      expect(dbUserCreate).toHaveBeenCalledWith(inputUser, hashedPassword);
    });
  });
});
