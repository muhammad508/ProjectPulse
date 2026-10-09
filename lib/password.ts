import bcrypt from "bcryptjs";

/** bcrypt cost factor used for every password hash. */
export const BCRYPT_COST = 12;

/**
 * A valid bcrypt hash (at `BCRYPT_COST`) of a throwaway string. It is compared against
 * when an email is unknown, so the check takes as long as a real one and the response
 * time does not reveal whether an account exists. It protects nothing.
 */
export const DUMMY_PASSWORD_HASH = "$2b$12$A3LaFYrldA8McAJNEC9Gue2twcHzyJba6nw9UCC5aGFcWInYS2Y1K";

export function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, BCRYPT_COST);
}

/**
 * Check a password against a stored hash. Pass `undefined` when the account does not
 * exist: the work is still done (against the dummy hash) and the result is always false.
 */
export async function verifyPassword(password: string, storedHash: string | undefined): Promise<boolean> {
  const matches = await bcrypt.compare(password, storedHash ?? DUMMY_PASSWORD_HASH);
  return storedHash !== undefined && matches;
}
