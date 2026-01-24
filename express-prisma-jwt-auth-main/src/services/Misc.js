/**
 * Remove the given property keys from an object.
 * @param {Object} object - The target object whose properties will be removed.
 * @param {Iterable<string|number|symbol>} keys - An iterable of property keys to delete from the object.
 * @returns {Object} The same object after the specified properties have been removed.
 */
export default function exclude(object, keys) {
  for (const key of keys) {
    delete object[key];
  }
  return object;
}