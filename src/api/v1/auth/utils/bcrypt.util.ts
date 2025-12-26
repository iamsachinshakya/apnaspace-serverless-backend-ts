import bcrypt from "bcryptjs";

/**
 * Hash a plain text password
 * @param password - Plain text password
 * @returns Promise resolving to the hashed password string
 */
export const hashPassword = async (password: string): Promise<string | null> => {
  if (!password) return null;

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);
  return hashedPassword;
};

/**
 * Compare plain text password with hashed password
 * @param password - Plain text password from user input
 * @param hashedPassword - Hashed password from database
 * @returns Promise resolving to true if passwords match, otherwise false
 */
export const comparePassword = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  if (!password || !hashedPassword) return false;

  const isMatch = await bcrypt.compare(password, hashedPassword);
  return isMatch;
};
