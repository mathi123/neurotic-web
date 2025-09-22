import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the storage utils
vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

// Mock the user mappers
vi.mock('@/storage/user/user.mappers', () => ({
  dbUserToDomain: vi.fn(),
}));

import { readUserAndHashedPassword } from '@/storage/user/user.read';
import { getPrismaClient } from '@/storage/utils';
import { dbUserToDomain } from '@/storage/user/user.mappers';
import { user } from '../../builders/user.builder';

describe('readUserAndHashedPassword', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns null when user is not found', async () => {
    const email = 'nonexistent@example.com';
    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(null),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    const result = await readUserAndHashedPassword(email);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });
    expect(result).toEqual({ user: null, hashedPassword: null });
  });

  it('returns user and hashed password when user is found', async () => {
    const email = 'john.doe@example.com';
    const hashedPassword = 'hashed_password_123';
    const dbUser = {
      id: '123',
      email,
      name: 'John Doe',
      password: hashedPassword,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const domainUser = user({
      id: '123',
      email,
      name: 'John Doe',
    });

    const mockPrisma = {
      user: {
        findUnique: vi.fn().mockResolvedValue(dbUser),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(dbUserToDomain).mockReturnValue(domainUser);

    const result = await readUserAndHashedPassword(email);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { email },
    });
    expect(dbUserToDomain).toHaveBeenCalledTimes(1);
    expect(dbUserToDomain).toHaveBeenCalledWith(dbUser);
    expect(result).toEqual({ user: domainUser, hashedPassword });
  });
});
