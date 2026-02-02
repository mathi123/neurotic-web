import { describe, expect, it } from 'vitest';
import { carToDbCar, carToDbCarUpdate, dbCarToDomain } from '@/storage/car/car.mappers';

describe('dbCarToDomain', () => {
  it('maps all database car fields to domain Car', () => {
    const createdAt = new Date('2023-01-01T00:00:00Z');
    const updatedAt = new Date('2023-01-02T00:00:00Z');

    const dbCar = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Tesla Model S',
      createdAt,
      updatedAt,
    };

    const result = dbCarToDomain(dbCar);

    expect(result).toEqual({
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Tesla Model S',
      createdAt,
      updatedAt,
    });
  });

  it('maps database car with different values correctly', () => {
    const createdAt = new Date('2024-05-15T10:30:00Z');
    const updatedAt = new Date('2024-05-16T14:45:00Z');

    const dbCar = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Honda Civic',
      createdAt,
      updatedAt,
    };

    const result = dbCarToDomain(dbCar);

    expect(result).toEqual({
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Honda Civic',
      createdAt,
      updatedAt,
    });
  });

  it('maps database car with minimal required fields', () => {
    const createdAt = new Date('2023-01-01T00:00:00Z');
    const updatedAt = new Date('2023-01-02T00:00:00Z');

    const dbCar = {
      id: '789e0123-e45b-67d8-a901-234567890123',
      name: 'Test Car',
      createdAt,
      updatedAt,
    };

    const result = dbCarToDomain(dbCar);

    expect(result).toEqual({
      id: '789e0123-e45b-67d8-a901-234567890123',
      name: 'Test Car',
      createdAt,
      updatedAt,
    });
  });
});

describe('carToDbCar', () => {
  it('maps domain Car to Prisma.CarCreateInput', () => {
    const testCar = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Tesla Model S',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = carToDbCar(testCar);

    expect(result).toEqual({
      name: 'Tesla Model S',
    });
  });

  it('maps car with different name correctly', () => {
    const testCar = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Honda Civic',
      createdAt: new Date('2024-05-15T10:30:00Z'),
      updatedAt: new Date('2024-05-16T14:45:00Z'),
    };

    const result = carToDbCar(testCar);

    expect(result).toEqual({
      name: 'Honda Civic',
    });
  });

  it('maps car with minimal required fields', () => {
    const testCar = {
      id: '789e0123-e45b-67d8-a901-234567890123',
      name: 'Test Car',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = carToDbCar(testCar);

    expect(result).toEqual({
      name: 'Test Car',
    });
  });
});

describe('carToDbCarUpdate', () => {
  it('maps domain Car to Prisma.CarUpdateInput', () => {
    const testCar = {
      id: '550e8400-e29b-41d4-a716-446655440000',
      name: 'Updated Tesla Model S',
      createdAt: new Date('2023-01-01T00:00:00Z'),
      updatedAt: new Date('2023-01-02T00:00:00Z'),
    };

    const result = carToDbCarUpdate(testCar);

    expect(result).toEqual({
      name: 'Updated Tesla Model S',
    });
  });

  it('maps car with different name correctly', () => {
    const testCar = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      name: 'Updated Honda Civic',
      createdAt: new Date('2024-05-15T10:30:00Z'),
      updatedAt: new Date('2024-05-16T14:45:00Z'),
    };

    const result = carToDbCarUpdate(testCar);

    expect(result).toEqual({
      name: 'Updated Honda Civic',
    });
  });
});
