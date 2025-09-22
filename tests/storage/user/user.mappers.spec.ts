import { describe, expect, it } from 'vitest';
import { dbUserToDomain, userToDbUser } from '@/storage/user/user.mappers';
import { user } from '../../builders/user.builder';

describe('userToDbUser', () => {
  it('maps all user fields to Prisma.UserCreateInput', () => {
    const testUser = user({
      id: '123',
      email: 'john@example.com',
      name: 'John Doe',
      emailVerified: new Date('2023-01-01T00:00:00Z'),
      image: 'https://example.com/avatar.jpg',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });

    const result = userToDbUser(testUser);

    expect(result).toEqual({
      email: 'john@example.com',
      name: 'John Doe',
      emailVerified: new Date('2023-01-01T00:00:00Z'),
      image: 'https://example.com/avatar.jpg',
    });
  });

  it('maps user with null values correctly', () => {
    const testUser = {
      id: '123',
      email: 'jane@example.com',
      name: null,
      emailVerified: null,
      image: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = userToDbUser(testUser);

    expect(result).toEqual({
      email: 'jane@example.com',
      name: null,
      emailVerified: null,
      image: null,
    });
  });

  it('maps user with minimal required fields', () => {
    const testUser = {
      id: '123',
      email: 'minimal@example.com',
      name: null,
      emailVerified: null,
      image: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = userToDbUser(testUser);

    expect(result).toEqual({
      email: 'minimal@example.com',
      name: null,
      emailVerified: null,
      image: null,
    });
  });
});

describe('dbUserToDomain', () => {
  it('maps all database user fields to domain User', () => {
    const dbUser = {
      id: '123',
      email: 'john@example.com',
      name: 'John Doe',
      emailVerified: new Date('2023-01-01T00:00:00Z'),
      image: 'https://example.com/avatar.jpg',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = dbUserToDomain(dbUser as any);

    expect(result).toEqual({
      id: '123',
      email: 'john@example.com',
      name: 'John Doe',
      emailVerified: new Date('2023-01-01T00:00:00Z'),
      image: 'https://example.com/avatar.jpg',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });
  });

  it('maps database user with null values correctly', () => {
    const dbUser = {
      id: '456',
      email: 'jane@example.com',
      name: null,
      emailVerified: null,
      image: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = dbUserToDomain(dbUser);

    expect(result).toEqual({
      id: '456',
      email: 'jane@example.com',
      name: null,
      emailVerified: null,
      image: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });
  });

  it('maps database user with minimal fields correctly', () => {
    const dbUser = {
      id: '789',
      email: 'minimal@example.com',
      name: null,
      emailVerified: null,
      image: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = dbUserToDomain(dbUser);

    expect(result).toEqual({
      id: '789',
      email: 'minimal@example.com',
      name: null,
      emailVerified: null,
      image: null,
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    });
  });
});
