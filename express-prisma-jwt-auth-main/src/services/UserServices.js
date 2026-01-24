// User Services

import { db } from '../utils/db.js';

/**
 * Retrieve a user record that matches the given email address.
 * @param {string} email - The user's email address to look up.
 * @returns {Object|null} The user record matching the email, or `null` if no match is found.
 */
export function findUserByEmail(email) {
  return db.user.findUnique({
    where: {
      email,
    },
  });
}

/**
 * Retrieve a user record by its unique identifier.
 * @param {string|number} id - The user's unique identifier.
 * @returns {Object|null} The matching user record, or `null` if no user is found.
 */
export function findUserById(id) {
  return db.user.findUnique({
    where: {
      id,
    },
  });
}