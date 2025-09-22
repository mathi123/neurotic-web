import { afterEach, describe, expect, it, vi } from 'vitest';

// Mock the storage utils
vi.mock('@/storage/utils', () => ({
  getPrismaClient: vi.fn(),
}));

import { dbCarDelete } from '@/storage/car/car.delete';
import { getPrismaClient } from '@/storage/utils';

describe('dbCarDelete', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it('deletes a car from the database by id', async () => {
    const carId = '123';
    const mockPrisma = {
      car: {
        delete: vi.fn().mockResolvedValue(undefined),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    await dbCarDelete(carId);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.delete).toHaveBeenCalledWith({
      where: { id: carId },
    });
  });

  it('deletes a car with different id correctly', async () => {
    const carId = '456';
    const mockPrisma = {
      car: {
        delete: vi.fn().mockResolvedValue(undefined),
      },
    };

    vi.mocked(getPrismaClient).mockReturnValue(mockPrisma as any);

    await dbCarDelete(carId);

    expect(getPrismaClient).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.delete).toHaveBeenCalledTimes(1);
    expect(mockPrisma.car.delete).toHaveBeenCalledWith({
      where: { id: carId },
    });
  });
});
