/**
 * Escapes regex special characters so user-supplied search text can be
 * safely embedded in a MongoDB regex query without being interpreted as
 * regex syntax.
 * @param {string} value raw user input
 * @returns {string} escaped string safe for use inside a RegExp
 */
function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = escapeRegExp;
