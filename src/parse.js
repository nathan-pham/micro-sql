module.exports.literal = (token) => (
    isNaN(token)
        ? /^['|"]/.test(token) 
            ? token.substring(1, token.length - 1)
            : String(token)
        : parseFloat(token)
)

module.exports.query = (query, delimiter=' ') => (
    query
        .trim()
        .split(delimiter)
        .map(v => v.trim())
        .filter(v => v.length)
)