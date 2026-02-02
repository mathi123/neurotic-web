import { describe, expect, it } from 'vitest';
import {
  NotFoundError,
  fromZodParseResult,
  getIdFromRoute,
  isPrismaNotFoundError,
  noContentResponse,
  notFoundResponse,
  tryCreateResource,
  tryDeleteResource,
  tryReadResource,
  tryUpdateResource,
} from '@/api/utils';
import { ZodError } from 'zod';

describe('API Utils', () => {
  describe('isPrismaNotFoundError', () => {
    it('returns true for P2025 error code', () => {
      const error = { code: 'P2025' };
      expect(isPrismaNotFoundError(error)).toBe(true);
    });

    it('returns false for P2016 error code (query interpretation error, not record not found)', () => {
      const error = { code: 'P2016' };
      expect(isPrismaNotFoundError(error)).toBe(false);
    });

    it('returns false for other error codes', () => {
      const error = { code: 'P2002' };
      expect(isPrismaNotFoundError(error)).toBe(false);
    });

    it('returns false for non-object errors', () => {
      expect(isPrismaNotFoundError(null)).toBe(false);
      expect(isPrismaNotFoundError('error')).toBe(false);
    });
  });

  describe('tryCreateResource', () => {
    it('should return a 201 response with created resource for valid data', async () => {
      const mockCreateResource = async (resource: any) => {
        return { ...resource, id: 1 };
      };

      const resource = { name: 'Valid Resource' };

      const response = await tryCreateResource(mockCreateResource, resource);
      const responseData = await response.json();

      expect(response.status).toBe(201);
      expect(responseData).toHaveProperty('id');
      expect(responseData.name).toBe('Valid Resource');
    });

    it('should return a 400 response with structured error for Zod validation error', async () => {
      const mockCreateResource = async () => {
        throw new ZodError([]);
      };

      const resource = { name: '' }; // Invalid resource

      const response = await tryCreateResource(mockCreateResource, resource);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.code).toBe('validation_error');
      expect(responseData.errors).toBeDefined();
    });

    it('should return a 500 response with structured error for non-validation errors', async () => {
      const mockCreateResource = async () => {
        throw new Error('Non-validation error');
      };

      const resource = { name: 'Valid Resource' };

      const response = await tryCreateResource(mockCreateResource, resource);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.code).toBe('internal_error');
      expect(responseData.errors).toBeDefined();
    });
  });

  describe('fromZodParseResult', () => {
    it('should return a 400 response with error details for invalid parse result', async () => {
      const mockParseResult = {
        success: false,
        error: {
          issues: [
            {
              message: 'Invalid input',
              path: ['name'],
            },
          ],
        },
      } as any;

      const response = fromZodParseResult(mockParseResult);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        code: 'invalid query parameters',
        errors: mockParseResult.error.issues,
      });
    });

    it('should return a 400 response with undefined errors when parse result has no error', async () => {
      const mockParseResult = {
        success: false,
        error: null,
      } as any;

      const response = fromZodParseResult(mockParseResult);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        code: 'invalid query parameters',
        errors: undefined,
      });
    });
  });

  describe('noContentResponse', () => {
    it('should return a 204 No Content response', () => {
      const response = noContentResponse();

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });
  });

  describe('notFoundResponse', () => {
    it('should return a 404 Not Found response with default message', () => {
      const response = notFoundResponse();
      expect(response.status).toBe(404);
    });

    it('should return a 404 Not Found response with custom message', async () => {
      const response = notFoundResponse('Car not found');
      const responseData = await response.json();

      expect(response.status).toBe(404);
      expect(responseData.code).toBe('not_found');
      expect(responseData.errors[0].message).toBe('Car not found');
    });
  });

  describe('getIdFromRoute', () => {
    it('should return the id from route params for valid UUID', async () => {
      const validUUID = '123e4567-e89b-12d3-a456-426614174000';
      const mockRoute = {
        params: Promise.resolve({ id: validUUID }),
      };

      const result = await getIdFromRoute(mockRoute);

      expect(result).toBe(validUUID);
    });

    it('should throw error for invalid UUID', async () => {
      const invalidUUID = 'not-a-uuid';
      const mockRoute = {
        params: Promise.resolve({ id: invalidUUID }),
      };

      await expect(getIdFromRoute(mockRoute)).rejects.toThrow();
    });
  });

  describe('tryReadResource', () => {
    it('should return 200 response with resource for successful read', async () => {
      const mockResource = { id: '123', name: 'Test' };
      const mockReadResource = async () => mockResource;

      const response = await tryReadResource(mockReadResource, '123');
      const responseData = await response.json();

      expect(response.status).toBe(200);
      expect(responseData).toEqual(mockResource);
    });

    it('should return 404 response for Prisma not found error', async () => {
      const mockReadResource = async () => {
        throw { code: 'P2025' };
      };

      const response = await tryReadResource(mockReadResource, '123');

      expect(response.status).toBe(404);
    });

    it('should return 404 response for NotFoundError', async () => {
      const mockReadResource = async () => {
        throw new NotFoundError('Resource not found');
      };

      const response = await tryReadResource(mockReadResource, '123');

      expect(response.status).toBe(404);
    });

    it('should rethrow unexpected errors', async () => {
      const mockReadResource = async () => {
        throw new Error('Unexpected error');
      };

      await expect(tryReadResource(mockReadResource, '123')).rejects.toThrow('Unexpected error');
    });
  });

  describe('tryDeleteResource', () => {
    it('should return 204 response for successful delete', async () => {
      const mockDeleteResource = async () => {};

      const response = await tryDeleteResource(mockDeleteResource, '123');

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });

    it('should return 404 response for Prisma not found error', async () => {
      const mockDeleteResource = async () => {
        throw { code: 'P2025' };
      };

      const response = await tryDeleteResource(mockDeleteResource, '123');

      expect(response.status).toBe(404);
    });

    it('should return 404 response for NotFoundError', async () => {
      const mockDeleteResource = async () => {
        throw new NotFoundError('Resource not found');
      };

      const response = await tryDeleteResource(mockDeleteResource, '123');

      expect(response.status).toBe(404);
    });

    it('should rethrow unexpected errors', async () => {
      const mockDeleteResource = async () => {
        throw new Error('Unexpected error');
      };

      await expect(tryDeleteResource(mockDeleteResource, '123')).rejects.toThrow('Unexpected error');
    });
  });

  describe('tryUpdateResource', () => {
    it('should return no content response for successful update', async () => {
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async (resource: any) => resource;

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);

      expect(response.status).toBe(204);
      expect(response.body).toBeNull();
    });

    it('should return 400 response for id mismatch', async () => {
      const mockRequest = {
        json: async () => ({ id: 'different-id', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async (resource: any) => resource;

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData).toEqual({
        code: 'id_mismatch',
        errors: [{ message: 'id in body does not match id in path' }],
      });
    });

    it('should return 400 response with structured error for Zod validation error', async () => {
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async () => {
        throw new ZodError([]);
      };

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);
      const responseData = await response.json();

      expect(response.status).toBe(400);
      expect(responseData.code).toBe('validation_error');
    });

    it('should return 404 response for Prisma not found error', async () => {
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async () => {
        throw { code: 'P2025' };
      };

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);

      expect(response.status).toBe(404);
    });

    it('should return 500 response with structured error for non-validation errors', async () => {
      const mockRequest = {
        json: async () => ({ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: '123e4567-e89b-12d3-a456-426614174000' }),
      };
      const mockUpdateResource = async () => {
        throw new Error('Non-validation error');
      };

      const response = await tryUpdateResource(mockRequest, mockRoute, mockUpdateResource);
      const responseData = await response.json();

      expect(response.status).toBe(500);
      expect(responseData.code).toBe('internal_error');
    });

    it('should throw error for invalid UUID in route params', async () => {
      const mockRequest = {
        json: async () => ({ id: 'invalid-uuid', name: 'Updated Name' }),
      } as any;
      const mockRoute = {
        params: Promise.resolve({ id: 'invalid-uuid' }),
      };
      const mockUpdateResource = async (resource: any) => resource;

      await expect(tryUpdateResource(mockRequest, mockRoute, mockUpdateResource)).rejects.toThrow();
    });
  });
});
