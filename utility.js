module.exports = {
	generateID: length => Math.random().toString(16).replace('0.', '').substring(0, length || 16).toUpperCase(),
}
