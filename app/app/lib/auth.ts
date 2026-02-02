/***
 * The client side auth client. This is used mostly by the auth-provider, wrapping the entire app in authentication.
 */
import { createAuthClient } from 'better-auth/react';
import { adminClient } from 'better-auth/client/plugins';

export const authClient = createAuthClient({
  plugins: [adminClient()],
});
