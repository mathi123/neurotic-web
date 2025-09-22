import { describe, expect, it } from 'vitest';
import { saltAndHashPassword, verifyPassword } from '@/actions/security/password';

describe('password actions', () => {
  it('should hash and verify passwords correctly', async () => {
    const password = 'testPassword123';

    // Hash the password
    const hashedPassword = await saltAndHashPassword(password);

    // Verify that the hash is different from the original password
    expect(hashedPassword).not.toBe(password);
    expect(typeof hashedPassword).toBe('string');
    expect(hashedPassword.length).toBeGreaterThan(0);

    // Verify that the correct password matches
    const isValid = await verifyPassword(password, hashedPassword);
    expect(isValid).toBe(true);

    // Verify that an incorrect password doesn't match
    const isInvalid = await verifyPassword('wrongPassword', hashedPassword);
    expect(isInvalid).toBe(false);
  });
});
