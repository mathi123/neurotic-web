import { beforeEach, describe, expect, it, vi } from 'vitest';
import { DELETE, GET, PUT } from '@/api/cars/[id]/route';
import { readCar } from '@/actions/car/read';
import { updateCar } from '@/actions/car/update';
import { deleteCar } from '@/actions/car/delete';
import { car } from '../../../builders/car.builder';
import { Car } from '@/domain/car.model';
import { ZodError } from 'zod';

vi.mock('@/actions/car/read', () => ({
  readCar: vi.fn(),
}));

vi.mock('@/actions/car/update', () => ({
  updateCar: vi.fn(),
}));

vi.mock('@/actions/car/delete', () => ({
  deleteCar: vi.fn(),
}));

describe('API Route - GET /api/cars/[id]', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const mockCar = car({ id: validId, name: 'Test Car' });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 and car data when valid ID is provided', async () => {
    vi.mocked(readCar).mockResolvedValueOnce(mockCar);

    const request = {} as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    const response = await GET(request, route);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({
      id: validId,
      name: 'Test Car',
      createdAt: mockCar.createdAt.toISOString(),
      updatedAt: mockCar.updatedAt.toISOString(),
    });
    expect(readCar).toHaveBeenCalledWith(validId);
  });

  it('returns 400 when invalid UUID is provided', async () => {
    const invalidId = 'invalid-uuid';

    const request = {} as any;
    const route = {
      params: Promise.resolve({ id: invalidId }),
    };

    await expect(GET(request, route)).rejects.toThrow();
  });

  it('returns 404 when car is not found (Prisma error)', async () => {
    vi.mocked(readCar).mockRejectedValueOnce({ code: 'P2025' });

    const request = {} as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    const response = await GET(request, route);

    expect(response.status).toBe(404);
    expect(readCar).toHaveBeenCalledWith(validId);
  });
});

describe('API Route - PUT /api/cars/[id]', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';
  const mockCarUpdate: Car = {
    id: validId,
    name: 'Updated Car',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 when car is successfully updated', async () => {
    vi.mocked(updateCar).mockResolvedValueOnce(mockCarUpdate);

    const request = {
      json: vi.fn().mockResolvedValue(mockCarUpdate),
    } as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    const response = await PUT(request, route);

    expect(response.status).toBe(204);
    expect(updateCar).toHaveBeenCalledWith(mockCarUpdate);
    expect(request.json).toHaveBeenCalledTimes(1);
  });

  it('returns 400 when ID in body does not match ID in path', async () => {
    const mismatchedCar = { ...mockCarUpdate, id: 'different-id-123456789012345678901234' };

    const request = {
      json: vi.fn().mockResolvedValue(mismatchedCar),
    } as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    const response = await PUT(request, route);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBe('id_mismatch');
    expect(json.errors).toEqual([{ message: 'id in body does not match id in path' }]);
    expect(updateCar).not.toHaveBeenCalled();
  });

  it('returns 400 when validation fails due to ZodError', async () => {
    const zodError = new ZodError([
      {
        code: 'too_small',
        minimum: 1,
        inclusive: true,
        message: 'String must contain at least 1 character(s)',
        path: ['name'],
        origin: 'value',
      } as any,
    ]);

    vi.mocked(updateCar).mockRejectedValueOnce(zodError);

    const request = {
      json: vi.fn().mockResolvedValue(mockCarUpdate),
    } as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    const response = await PUT(request, route);

    expect(response.status).toBe(400);
    expect(updateCar).toHaveBeenCalledWith(mockCarUpdate);
  });

  it('returns 500 when an unexpected error occurs', async () => {
    vi.mocked(updateCar).mockRejectedValueOnce(new Error('Database connection failed'));

    const request = {
      json: vi.fn().mockResolvedValue(mockCarUpdate),
    } as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    const response = await PUT(request, route);

    expect(response.status).toBe(500);
    expect(updateCar).toHaveBeenCalledWith(mockCarUpdate);
  });

  it('returns 400 when invalid UUID is provided in path', async () => {
    const invalidId = 'invalid-uuid';

    const request = {
      json: vi.fn().mockResolvedValue(mockCarUpdate),
    } as any;
    const route = {
      params: Promise.resolve({ id: invalidId }),
    };

    await expect(PUT(request, route)).rejects.toThrow();
  });
});

describe('API Route - DELETE /api/cars/[id]', () => {
  const validId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 204 when car is successfully deleted', async () => {
    vi.mocked(deleteCar).mockResolvedValueOnce(undefined);

    const request = {} as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    const response = await DELETE(request, route);

    expect(response.status).toBe(204);
    expect(deleteCar).toHaveBeenCalledWith(validId);
  });

  it('returns 400 when invalid UUID is provided', async () => {
    const invalidId = 'invalid-uuid';

    const request = {} as any;
    const route = {
      params: Promise.resolve({ id: invalidId }),
    };

    await expect(DELETE(request, route)).rejects.toThrow();
  });

  it('returns 404 when car is not found (Prisma error)', async () => {
    vi.mocked(deleteCar).mockRejectedValueOnce({ code: 'P2025' });

    const request = {} as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    const response = await DELETE(request, route);

    expect(response.status).toBe(404);
    expect(deleteCar).toHaveBeenCalledWith(validId);
  });

  it('rethrows unexpected errors from deleteCar', async () => {
    vi.mocked(deleteCar).mockRejectedValueOnce(new Error('Database connection failed'));

    const request = {} as any;
    const route = {
      params: Promise.resolve({ id: validId }),
    };

    await expect(DELETE(request, route)).rejects.toThrow('Database connection failed');
    expect(deleteCar).toHaveBeenCalledWith(validId);
  });
});
