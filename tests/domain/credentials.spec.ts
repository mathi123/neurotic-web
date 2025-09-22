import { describe, expect, it } from 'vitest';
import { credentialsSchema } from '@/domain/credentials.model';

describe('credentialsSchema', () => {
  it('validates valid email and password', () => {
    const result = credentialsSchema.safeParse({
      email: 'user@example.com',
      password: 'validpassword123',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual({
        email: 'user@example.com',
        password: 'validpassword123',
      });
    }
  });

  it('validates email with subdomain', () => {
    const result = credentialsSchema.safeParse({
      email: 'user@sub.example.com',
      password: 'password',
    });
    expect(result.success).toBe(true);
  });

  it('validates minimum password length', () => {
    const result = credentialsSchema.safeParse({
      email: 'user@example.com',
      password: 'a',
    });
    expect(result.success).toBe(true);
  });

  it('validates maximum password length', () => {
    const result = credentialsSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(32),
    });
    expect(result.success).toBe(true);
  });

  it('fails when email is invalid', () => {
    const result = credentialsSchema.safeParse({
      email: 'invalid-email',
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'email')).toBe(true);
    }
  });

  it('fails when email is missing', () => {
    const result = credentialsSchema.safeParse({
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'email')).toBe(true);
    }
  });

  it('fails when password is empty', () => {
    const result = credentialsSchema.safeParse({
      email: 'user@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'password')).toBe(true);
    }
  });

  it('fails when password exceeds maximum length', () => {
    const result = credentialsSchema.safeParse({
      email: 'user@example.com',
      password: 'a'.repeat(33),
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'password')).toBe(true);
    }
  });

  it('fails when password is missing', () => {
    const result = credentialsSchema.safeParse({
      email: 'user@example.com',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'password')).toBe(true);
    }
  });

  it('fails when email is null', () => {
    const result = credentialsSchema.safeParse({
      email: null,
      password: 'password123',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'email')).toBe(true);
    }
  });

  it('fails when password is null', () => {
    const result = credentialsSchema.safeParse({
      email: 'user@example.com',
      password: null,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join('.') === 'password')).toBe(true);
    }
  });
});
