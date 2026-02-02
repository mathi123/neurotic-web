import { afterEach, describe, expect, it, vi } from 'vitest';
import { ZodError } from 'zod';

// Mock the storage layer
vi.mock('@/storage/car/car.update', () => ({
  dbCarUpdate: vi.fn(),
}));

import { updateCar } from '@/actions/car/update';
import { dbCarUpdate } from '@/storage/car/car.update';
import { car } from '../../builders/car.builder';

describe('updateCar', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('successful update', () => {
    it('updates a car successfully with valid data and calls storage layer', async () => {
      const inputCar = car({
        name: 'Updated Car Name',
      });

      const expectedResult = car({
        id: '550e8400-e29b-41d4-a716-446655440000',
        name: 'Updated Car Name',
      });

      // Mock the storage layer to return a successful result
      vi.mocked(dbCarUpdate).mockResolvedValueOnce(expectedResult);

      const result = await updateCar(inputCar);

      expect(dbCarUpdate).toHaveBeenCalledTimes(1);
      expect(dbCarUpdate).toHaveBeenCalledWith(inputCar);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('validation errors', () => {
    it('throws validation error for invalid car data', async () => {
      const invalidCar = car({});
      // Make the car invalid by setting name to empty string
      invalidCar.name = '';

      await expect(updateCar(invalidCar)).rejects.toBeInstanceOf(ZodError);
      expect(dbCarUpdate).not.toHaveBeenCalled();
    });

    it('throws validation error when id is null', async () => {
      // Don't use builder since it replaces null with default value
      const carWithNullId = {
        id: null,
        name: 'Valid Name',
        createdAt: null,
        updatedAt: null,
      };

      await expect(updateCar(carWithNullId)).rejects.toBeInstanceOf(ZodError);
      expect(dbCarUpdate).not.toHaveBeenCalled();
    });
  });
});
