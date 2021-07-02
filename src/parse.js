module.exports.parse_csv = (csv) => csv.replace(' ', '').split(',')

module.exports.parse_literal = (token) => (
    isNaN(token)
        ? /^['|"]/.test(token) 
            ? token.substring(1, token.length - 1)
            : String(token)
        : parseFloat(token)
)

module.exports.parse_query = (query) => (
    query
        .toLowerCase()
        .trim()
        .split(' ')
        .map(v => v.trim())
        .filter(v => v.length)
)