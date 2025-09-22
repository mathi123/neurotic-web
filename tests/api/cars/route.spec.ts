import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET, POST } from '@/api/cars/route';

vi.mock('@/actions/car/search', () => ({
  searchCar: vi.fn().mockResolvedValue([]),
}));

vi.mock('@/actions/car/create', () => ({
  createCar: vi.fn(),
}));

import { createCar } from '@/actions/car/create';
import { Car } from '@/domain/car.model';
import { ZodError } from 'zod';

describe('API Route - GET /api/cars', () => {
  it('returns 200 when params are valid (no params)', async () => {
    const request = {
      nextUrl: new URL('http://localhost/api/cars'),
    } as any;

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('returns 200 when valid query parameters are provided', async () => {
    const request = {
      nextUrl: new URL('http://localhost/api/cars?query=Tesla'),
    } as any;

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('returns 200 when valid skip & take parameters are provided', async () => {
    const request = {
      nextUrl: new URL('http://localhost/api/cars?skip=0&take=10'),
    } as any;

    const response = await GET(request);

    expect(response.status).toBe(200);
  });

  it('returns 400 with validation errors when unexpected params are provided', async () => {
    const request = {
      nextUrl: new URL('http://localhost/api/cars?foo=bar'),
    } as any;

    const response = await GET(request);
    const json = await response.json();

    expect(response.status).toBe(400);
    expect(json.code).toBe('invalid query parameters');
    expect(Array.isArray(json.errors)).toBe(true);
  });
});

describe('API Route - POST /api/cars', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCarInput: Car = {
    id: null,
    name: 'Test Car',
    createdAt: null,
    updatedAt: null,
  };

  const mockCarOutput: Car = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Car',
    createdAt: new Date('2025-01-01T00:00:00Z'),
    updatedAt: new Date('2025-01-01T00:00:00Z'),
  };

  const expectedJsonResponse = {
    id: '550e8400-e29b-41d4-a716-446655440000',
    name: 'Test Car',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  };

  it('returns 201 and created car when valid data is provided', async () => {
    vi.mocked(createCar).mockResolvedValueOnce(mockCarOutput);

    const request = {
      json: vi.fn().mockResolvedValue(mockCarInput),
    } as any;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(201);
    expect(json).toEqual(expectedJsonResponse);
    expect(createCar).toHaveBeenCalledWith(mockCarInput);
    expect(request.json).toHaveBeenCalledTimes(1);
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

    vi.mocked(createCar).mockRejectedValueOnce(zodError);

    const request = {
      json: vi.fn().mockResolvedValue(mockCarInput),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(createCar).toHaveBeenCalledWith(mockCarInput);
  });

  it('returns 500 when an unexpected error occurs', async () => {
    vi.mocked(createCar).mockRejectedValueOnce(new Error('Database connection failed'));

    const request = {
      json: vi.fn().mockResolvedValue(mockCarInput),
    } as any;

    const response = await POST(request);

    expect(response.status).toBe(500);
    expect(createCar).toHaveBeenCalledWith(mockCarInput);
  });

  it('returns 500 when request body is invalid JSON', async () => {
    const request = {
      json: vi.fn().mockRejectedValueOnce(new Error('Invalid JSON')),
    } as any;

    const response = await POST(request);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({});
    expect(createCar).not.toHaveBeenCalled();
  });
});
