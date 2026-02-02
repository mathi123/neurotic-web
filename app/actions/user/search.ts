import { UserFilter, userFilterSchema } from '@/domain/user.filter';
import { Page } from '@/domain/page.model';
import { User } from '@/domain/user.model';
import { dbUserSearch } from '@/storage/user/user.search';

export const searchUsers = async (filter: UserFilter): Promise<Page<User>> => {
  const validatedFilter = userFilterSchema.parse(filter);
  return dbUserSearch(validatedFilter);
};
