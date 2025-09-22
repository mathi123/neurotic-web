import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the Prisma adapters and client
vi.mock('@prisma/adapter-neon', () => ({
  PrismaNeon: vi.fn(),
}));

vi.mock('@prisma/adapter-pg', () => ({
  PrismaPg: vi.fn(),
}));

vi.mock('@/storage/client/client', () => ({
  PrismaClient: vi.fn(),
}));

import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@/storage/client/client';
import { getPrismaClient } from '@/storage/utils';

describe('getPrismaClient', () => {
  const originalEnv = process.env;

  afterEach(() => {
    vi.clearAllMocks();
    // Restore original env
    process.env = { ...originalEnv };
  });

  it('throws an error when DATABASE_URL is not set', () => {
    delete process.env.DATABASE_URL;

    expect(() => getPrismaClient()).toThrow('DATABASE_URL is not set');
  });

  it('uses PrismaNeon adapter when DATABASE_URL contains .neon.tech', () => {
    const neonUrl = 'postgresql://user:pass@ep-example.region.neon.tech/db?sslmode=require';
    process.env.DATABASE_URL = neonUrl;

    const mockPrismaNeon = { connectionString: neonUrl };
    const mockPrismaClient = {};

    vi.mocked(PrismaNeon).mockReturnValue(mockPrismaNeon as any);
    vi.mocked(PrismaClient).mockReturnValue(mockPrismaClient as any);

    const result = getPrismaClient();

    expect(PrismaNeon).toHaveBeenCalledTimes(1);
    expect(PrismaNeon).toHaveBeenCalledWith({ connectionString: neonUrl });
    expect(PrismaPg).not.toHaveBeenCalled();
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(PrismaClient).toHaveBeenCalledWith({ adapter: mockPrismaNeon });
    expect(result).toBe(mockPrismaClient);
  });

  it('uses PrismaPg adapter when DATABASE_URL does not contain .neon.tech', () => {
    const pgUrl = 'postgresql://user:pass@localhost:5432/db';
    process.env.DATABASE_URL = pgUrl;

    const mockPrismaPg = { connectionString: pgUrl };
    const mockPrismaClient = {};

    vi.mocked(PrismaPg).mockReturnValue(mockPrismaPg as any);
    vi.mocked(PrismaClient).mockReturnValue(mockPrismaClient as any);

    const result = getPrismaClient();

    expect(PrismaPg).toHaveBeenCalledTimes(1);
    expect(PrismaPg).toHaveBeenCalledWith({ connectionString: pgUrl });
    expect(PrismaNeon).not.toHaveBeenCalled();
    expect(PrismaClient).toHaveBeenCalledTimes(1);
    expect(PrismaClient).toHaveBeenCalledWith({ adapter: mockPrismaPg });
    expect(result).toBe(mockPrismaClient);
  });
});
