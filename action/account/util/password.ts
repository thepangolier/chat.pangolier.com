import argon2 from 'argon2'

/*
 * Hashes a plaintext password using Argon2id with recommended settings.
 *
 * @param password - The plaintext password to hash.
 * @returns A Promise that resolves to the Argon2 hash string (including salt).
 */
export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 2 ** 16,
    timeCost: 3,
    parallelism: 1
  })
}

/*
 * Verifies a plaintext password against an Argon2 hash.
 *
 * @param hash - The Argon2 hash (with salt) to verify against.
 * @param password - The plaintext password to check.
 * @returns A Promise that resolves to true if the password matches.
 */
export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  return await argon2.verify(hash, password)
}
