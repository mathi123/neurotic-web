import { NextRequest } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/auth';
import { isAdmin } from '@/domain/role.utils';
import { userFilterSchema } from '@/domain/user.filter';
import { searchUsers } from '@/actions/user/search';
import { forbiddenResponse, fromZodParseResult, unauthorizedResponse } from '@/api/utils';

export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    return unauthorizedResponse();
  }

  if (!isAdmin(session.user)) {
    return forbiddenResponse('Admin access required');
  }

  const userFilter = userFilterSchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!userFilter.success) {
    return fromZodParseResult(userFilter);
  }

  const result = await searchUsers(userFilter.data);
  return Response.json(result);
}
