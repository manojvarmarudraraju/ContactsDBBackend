var ibmdb = require('ibm_db');
var logger = require('./logger')(module);


function address_put(connection, values, contact){
    console.log("Contact", contact);
    var address = values.address;
    console.log("address",address);
    if(address.length != 0){
        var address_type = []
        var address_add = []
        var city = []
        var state = []
        var zip = []
        var contact_id = []
        var add_do = false
        for(var i = 0; i< address.length; i++){
            if(address[i].add_do == true){
                add_do = true;
                address_type.push(parseInt(address[i].address_type))
                address_add.push(address[i].address)
                city.push(address[i].city)
                state.push(address[i].state)
                zip.push(address[i].zip)
                contact_id.push(contact)
              }
        }
        console.log("Important", address_type);
        console.log("Important", zip);
        if(add_do == true){
            var add_query = {
                    sql : "select * from new table(insert into KBX02002.ADDRESS (contact_id,address_type, address, city, state, zip) values(?,?,?,?,?,?))",
                    params: [
                                {
                                    ParamType: "ARRAY",
                                    DataType: "INTEGER",
                                    Data: contact_id
                                },
                                {
                                    ParamType : "ARRAY",
                                    DataType : "INTEGER",
                                    Data: address_type,
                                },
                                {
                                    ParamType : "ARRAY",
                                    DataType : 1,
                                    Data: address_add,
                                },
                                {
                                    ParamType : "ARRAY",
                                    DataType : 1,
                                    Data: city,
                                },
                                {
                                    ParamType : "ARRAY",
                                    DataType : 1,
                                    Data: state,
                                },
                                {
                                    ParamType : "ARRAY",
                                    DataType : 1,
                                    Data: zip,
                                }
                            ],
                    ArraySize: state.length
                };
        }

        var q = "select * from new table(insert into KBX02002.ADDRESS (contact_id,address_type, address, city, state, zip) values";
        for(var i = 0; i < address_type.length; i++){
            q += "(";
            q += String(contact)+",";
            q += String(address_type[i])+",";
            q += "'"+String(address_add[i])+"'"+",";
            q += "'"+String(city[i])+"'"+",";
            q += "'"+String(state[i])+"'"+",";
            q += "'"+String(zip[i])+"'"+")";
            if(i != address_type.length-1){
                q+=",";
            }
        }
        q += ")";

        output = connection.querySync(q);
        console.table(output);
        return output
    }

    return [];
    
}

function phone_put(connection, values, contact){
    console.log("phone contact", contact);
    var phone_do =  false;
    var phone_type = []
    var area_code = []
    var contact_id = []
    var mobile = []
    var phone = values.phone;
    console.log("Phone", phone);
    for(var i = 0; i < phone.length; i++){
        if(phone[i].phone_do){
            phone_do = true;
            phone_type.push(parseInt(phone[i].phone_type));
            area_code.push(phone[i].area_code);
            contact_id.push(contact);
            mobile.push(phone[i].mobile_number);
        }
    }
    if(phone_do){
        var phone_query = {
            sql : "select * from new table(insert into KBX02002.PHONE (contact_id,phone_type, area_code, mobile_number) values(?,?,?,?))",
            params: [
                {
                    ParamType: "ARRAY",
                    DataType: "INTEGER",
                    Data: contact_id
                },
                {
                    ParamType : "ARRAY",
                    DataType : "INTEGER",
                    Data: phone_type,
                },
                {
                    ParamType : "ARRAY",
                    DataType : 1,
                    Data: area_code,
                },
                {
                    ParamType : "ARRAY",
                    DataType : 1,
                    Data: mobile,
                }
            ],
            ArraySize: mobile.length
        };
        var q = "select * from new table(insert into KBX02002.PHONE (contact_id,phone_type, area_code, mobile_number) values";
        for(var i = 0; i < mobile.length; i++){
            q += "(";
            q += String(contact)+",";
            q += String(phone_type[i])+",";
            q += "'"+String(area_code[i])+"'"+",";
            q += "'"+String(mobile[i])+"'"+")";
            if(i != mobile.length-1){
                q+=",";
            }
        }
        q += ")";
        console.log(q);
        console.log("came here");
        output = connection.querySync(q);
        console.log("Phone",typeof output);
        return output;
    }
    console.log("came here");
    return [];

}

var dates_put = function(connection, values, contact){
    var date = values.date;
    var type = []
    var dates = []
    var date_do = false;
    for(var i=0; i<date.length; i++){
        if(date[i].date_do){
            date_do = true;
            type.push(date[i].date_type);
            dates.push(date[i].date_date);
        }
    }

    if(date_do){
        var q = "select * from new table(insert into KBX02002.DATES(CONTACT_ID, DATE_TYPE, DATE_DATE) values";
        for(var i=0; i<dates.length; i++){
            q += "(";
            q += String(contact)+",";
            q += String(type[i])+",";
            q += "'"+String(dates[i])+"'"+")";
            if(i != dates.length-1){
                q+=",";
            }

        }
        q += ")";
        return connection.querySync(q);
    }
    return [];

}


var putContacts = function (req, res, connStr) {
    // console.log(req);
    var values = req.body;
    ibmdb.open(connStr, function (err,connection) {
        if(err != null){
            return res.status(500).send({ message: 'Internal server error'});
        }
        connection.beginTransaction(function (err){
            if(err){
                connection.close();
                return res.status(500).send({ message: 'Internal server error'});
            }
            var query = {
                sql: 'select * from new table(insert into CONTACT(FNAME,MNAME,LNAME) values(?,?,?))',
                params: [values.fname,values.mname,values.lname]
            };
    
            var rows = connection.querySync(query);
            if("error" in rows){
                connection.closeSync();
                return res.status(401).send({message: rows.Error});
            }
            contact = rows[0].CONTACT_ID;
            var address_vals = address_put(connection, values, parseInt(contact));
            console.log("Address inserted",address_vals);
            if("error" in address_vals){
                connection.rollbackTransactionSync();
                connection.closeSync();
                return res.status(401).send({message: address_vals.error});
            }
            var phone_vals = phone_put(connection, values, parseInt(contact));
            if("error" in phone_vals){
                connection.rollbackTransactionSync();
                connection.closeSync();
                return res.status(401).send({message: phone_vals.error});
            }
            
            console.log(phone_vals);
            var date_vals = dates_put(connection, values, parseInt(contact));
            if("error" in date_vals){
                connection.rollbackTransactionSync();
                connection.closeSync();
                return res.status(401).send({message: date_vals.error});
            }
            console.log(date_vals);
            var transactionOut = connection.commitTransactionSync();

            if("error" in transactionOut){
                connection.rollbackTransactionSync();
                connection.closeSync();
                return res.status(401).send({ message: transactionOut.error});
            }
            logger.info("Transaction succesfull");
            return res.status(200).send({message: "Success"});
        });
    });
};

module.exports = {putContacts, address_put, dates_put, phone_put};