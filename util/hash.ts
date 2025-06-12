import { randomBytes } from 'node:crypto'

/**
 * Generates a random alphanumeric string of specified length.
 *
 * @param length - The length of the random string to generate.
 * @returns A random alphanumeric string.
 */
export function generateRandomString(length = 5): string {
  return randomBytes(Math.ceil(length / 2))
    .toString('hex')
    .slice(0, length)
}
