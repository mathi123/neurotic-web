import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the storage utils
vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

// Mock the user mappers
vi.mock('@/storage/user/user.mappers', () => ({
  dbUserToDomain: vi.fn(),
  userToDbUser: vi.fn(),
}));

import { dbUserCreate } from '@/storage/user/user.create';
import { getPrismaClient } from '@/storage/utils';
import { dbUserToDomain, userToDbUser } from '@/storage/user/user.mappers';
import { user } from '../../builders/user.builder';

describe('dbUserCreate', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('creates a user in the database and returns the domain user', async () => {
    const inputUser = user({
      email: 'john.doe@example.com',
      name: 'John Doe',
    });
    const hashedPassword = 'hashed_password_123';
    const dbUser = {
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: hashedPassword,
    };
    const createdDbUser = {
      id: '123',
      email: 'john.doe@example.com',
      name: 'John Doe',
      password: hashedPassword,
      emailVerified: null,
      image: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const expectedDomainUser = user({
      id: '123',
      email: 'john.doe@example.com',
      name: 'John Doe',
    });

    const mockPrisma = {
      user: {
        create: vi.fn().mockResolvedValue(createdDbUser),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);
    vi.mocked(userToDbUser).mockReturnValue(dbUser as any);
    vi.mocked(dbUserToDomain).mockReturnValue(expectedDomainUser);

    const result = await dbUserCreate(inputUser, hashedPassword);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(userToDbUser).toHaveBeenCalledTimes(1);
    expect(userToDbUser).toHaveBeenCalledWith(inputUser);
    expect(mockPrisma.user.create).toHaveBeenCalledTimes(1);
    expect(mockPrisma.user.create).toHaveBeenCalledWith({
      data: { ...dbUser, password: hashedPassword },
    });
    expect(dbUserToDomain).toHaveBeenCalledTimes(1);
    expect(dbUserToDomain).toHaveBeenCalledWith(createdDbUser);
    expect(result).toEqual(expectedDomainUser);
  });
});
