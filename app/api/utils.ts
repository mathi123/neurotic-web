import z, { ZodError, ZodSafeParseResult } from 'zod';
import { statusCodes } from './status-codes';
import { NextRequest } from 'next/server';

export class NotFoundError extends Error {
  constructor(message: string = 'Resource not found') {
    super(message);
    this.name = 'NotFoundError';
  }
}

export const isPrismaNotFoundError = (error: unknown): boolean => {
  return error !== null && typeof error === 'object' && 'code' in error && error.code === 'P2025';
};

export const tryCreateResource = async <T>(createResource: (resource: T) => Promise<T>, resource: T): Promise<Response> => {
  try {
    const createdResource = await createResource(resource);
    return Response.json(createdResource, { status: statusCodes.CREATED });
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    } else {
      return Response.json(
        { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
        { status: statusCodes.INTERNAL_SERVER_ERROR },
      );
    }
  }
};

export const fromZodParseResult = <T>(parseResult: ZodSafeParseResult<T>): Response => {
  return Response.json(
    {
      code: 'invalid query parameters',
      errors: parseResult.error?.issues,
    },
    { status: statusCodes.BAD_REQUEST },
  );
};

export interface IdRouteParams {
  params: Promise<{ id: string }>;
}

export const noContentResponse = (): Response => {
  return new Response(null, { status: statusCodes.NO_CONTENT });
};

export const notFoundResponse = (message: string = 'Resource not found'): Response => {
  return Response.json({ code: 'not_found', errors: [{ message }] }, { status: statusCodes.NOT_FOUND });
};

export const unauthorizedResponse = (message: string = 'Authentication required'): Response => {
  return Response.json({ code: 'unauthorized', errors: [{ message }] }, { status: statusCodes.UNAUTHORIZED });
};

export const forbiddenResponse = (message: string = 'Access denied'): Response => {
  return Response.json({ code: 'forbidden', errors: [{ message }] }, { status: statusCodes.FORBIDDEN });
};

const uuidSchema = z.uuid();

export const getIdFromRoute = async (route: IdRouteParams): Promise<string> => {
  const { id } = await route.params;
  return uuidSchema.parse(id);
};

export const tryReadResource = async <T>(readResource: (id: string) => Promise<T>, id: string): Promise<Response> => {
  try {
    const resource = await readResource(id);
    return Response.json(resource);
  } catch (error) {
    if (isPrismaNotFoundError(error) || error instanceof NotFoundError) {
      return notFoundResponse();
    }
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
};

export const tryDeleteResource = async (deleteResource: (id: string) => Promise<void>, id: string): Promise<Response> => {
  try {
    await deleteResource(id);
    return noContentResponse();
  } catch (error) {
    if (isPrismaNotFoundError(error) || error instanceof NotFoundError) {
      return notFoundResponse();
    }
    return Response.json(
      { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
      { status: statusCodes.INTERNAL_SERVER_ERROR },
    );
  }
};

export const tryUpdateResource = async <T>(
  request: NextRequest,
  route: IdRouteParams,
  updateResource: (resource: T) => Promise<T>,
): Promise<Response> => {
  const id = await getIdFromRoute(route);

  const data = await request.json();
  if (data.id !== id) {
    return Response.json(
      {
        code: 'id_mismatch',
        errors: [{ message: 'id in body does not match id in path' }],
      },
      { status: statusCodes.BAD_REQUEST },
    );
  }
  try {
    await updateResource(data);
    return noContentResponse();
  } catch (error) {
    if (error instanceof ZodError) {
      return Response.json({ code: 'validation_error', errors: error.issues }, { status: statusCodes.BAD_REQUEST });
    } else if (isPrismaNotFoundError(error) || error instanceof NotFoundError) {
      return notFoundResponse();
    } else {
      return Response.json(
        { code: 'internal_error', errors: [{ message: 'An unexpected error occurred' }] },
        { status: statusCodes.INTERNAL_SERVER_ERROR },
      );
    }
  }
};
