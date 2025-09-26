/**
 * Checks if a string contains a URL.
 *
 * @param {string} str - The string to check.
 * @returns {boolean} - True if the string contains a URL, otherwise false.
 */
function containsURL(str) {
	const urlRegex = new RegExp(
		'\\b' + // Word boundary
		'((https?:\\/\\/|www\\.)\\S+|' + // Match http, https, www
		'([a-zA-Z0-9-]+\\.)+(com|org|net|edu|gov|mil|biz|info|mobi|name|aero|jobs|museums))' + // Match common TLDs
		'\\b', 'i'
	);
	return urlRegex.test(str);
}

module.exports = { containsURL };