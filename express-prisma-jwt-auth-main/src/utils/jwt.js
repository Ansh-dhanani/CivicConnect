import jwt from 'jsonwebtoken';

/**
 * Create a JWT access token for a user.
 * @param {Object} user - User object whose `id` will be embedded as the `userId` claim.
 * @returns {string} The signed access token.
 */
export function generateAccessToken(user) {
  return jwt.sign({ userId: user.id }, process.env.JWT_ACCESS_SECRET, {
    expiresIn: process.env.JWT_ACCESS_EXPIRATION_TIME,
  });
}

/**
 * Create a JWT refresh token containing the user's identifier.
 * @param {{id: string|number}} user - User object; the `id` property is encoded as `userId` in the token payload.
 * @returns {string} The signed refresh token.
 */
export function generateRefreshToken(user) {
  return jwt.sign(
    {
      userId: user.id,
    },
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn: process.env.JWT_REFRESH_EXPIRATION_TIME,
    }
  );
}

/**
 * Create a pair of JWTs (access and refresh) for the given user.
 * @param {Object} user - User object containing an `id` property used as the token subject.
 * @returns {{accessToken: string, refreshToken: string}} An object with `accessToken` and `refreshToken` strings.
 */
export function generateTokens(user) {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);

  return {
    accessToken,
    refreshToken,
  };
}