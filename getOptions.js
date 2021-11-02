

var getOptions = (connection) => {
    var rows = connection.querySync("select * from KBX02002.TYPES");
    return rows;
}

module.exports = { getOptions }