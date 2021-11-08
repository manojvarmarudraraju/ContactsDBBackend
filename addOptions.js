var {getOptions} = require('./getOptions');


var addOptions = function(connection, req, res){
    console.log(req.body);
    var value = req.body.data.option_value;
    var type = req.body.data.option_type;

    var rows = connection.querySync("select max(TYPE_IDENTIFIER) from KBX02002.TYPES where TYPE_CONNECTION="+type)

    if("error" in rows){
        return res.status(401).send({message: rows});
    }
    var q = "insert into KBX02002.TYPES(TYPE_IDENTIFIER,TYPE_CONNECTION,TYPE_VALUE) values ("+String(rows[0]["1"]+1)+","+String(type)+",'"+value+"')"
    console.log(q);
    console.log(rows);
    var insert =  connection.querySync(q)
    if("error" in insert){
        return res.status(401).send({message: insert});
    }
    var options = getOptions(connection,req,res);
    if("error" in options){
        return res.status(401).send({message: options});
    }
    return res.status(200).send({options:options})
}

module.exports = { addOptions}