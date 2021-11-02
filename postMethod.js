const e = require('express');
var ibmdb = require('ibm_db');
var logger = require('./logger')(module);
var {address_put, dates_put,phone_put} = require('./putMethod');


var updateContact = (connection, values) => {
    var contact = values.contact_id;
    var fname = values.fname;
    var mname = values.mname;
    var lname = values.lname;
    var q = "update KBX02002.CONTACT SET fname='" + fname + "', mname='" + mname + "', lname='" + lname +"' where CONTACT_ID = " + String(contact);
    return connection.querySync(q);
}

var updateAddress = (connection, values) => {
    var contact = values.contact_id;
    var address = values.address;
    var temp = null;
    var tempValues = {address: []}
    for(var i =0; i < address.length; i++) {
        if(!(address_id in address[i])){

        } else{
            var q = "update KBX02002.ADDRESS SET ADDRESS='" + address.address + "', CITY='" + address.city + "', STATE='" + address.state +"', ZIP='"+address.zip+"' where ADDRESS_ID = " + String(address.address_id);
            temp = connection.querySync(q);
            if("error" in temp) {
                return temp;
            }  
        }
        
    }
    return {};
}

var updatePhone = (connection, values) => {
    var contact = values.contact_id;
    var phone = values.phone;
    var temp = null;
    var tempValues = {phone: []}
    for(var i =0; i < phone.length; i++) {
        if(!(phone_id in address[i])){
            tempVal.address.push(address[i]);
        } else{
            var q = "select * from new table(update KBX02002.ADDRESS SET ADDRESS='" + phone[i].address + "', CITY='" + address[i].city + "', STATE='" + address[i].state +"', ZIP='"+address[i].zip+"' where ADDRESS_ID = " + String(address[i].address_id)+")";
            temp = connection.querySync(q);
            if("error" in temp) {
                return temp;
            }  
            console.log(temp);
        }    
    }
    if(tempValues.phone.length != 0){
        var out = phone_put(connection, tempValues, parseInt(contact));
        if("error" in out){
            return out;
        }
        console.log(out);
    }
    return {};
}

var updatePhone = (connection, values) => {

}

function postContacts(req, res, connStr) {
    ibmdb.open(connStr, function (err, connection) {
        if (err)
        {
          logger.info('Error', err);
          return res.status(500).send({ message: 'Internal server error' });
        }

        connection.beginTransaction(function (err) {
            if(err){
                connection.close();
                return res.status(500).send({ message: 'Internal server error'});
            }
            var contact = updateContact(connection, values);
            if("error" in contact){
                connection.rollbackTransactionSync();
                connection.close();
                return res.status(401).send({ message: contact.error});
            }
            var address = updateAddress(connection,values);
            if("error" in address){
                connection.rollbackTransactionSync();
                connection.close();
                return res.status(401).send({ message: address.error});
            }
            var phone = updatePhone(connection,values);
            if("error" in phone){
                connection.rollbackTransactionSync();
                connection.close();
                return res.status(401).send({ message: phone.error});
            }
            var date = updateDate(connection,values);
            if("error" in date){
                connection.rollbackTransactionSync();
                connection.close();
                return res.status(401).send({ message: date.error});
            }

            connection.commitTransactionSync();
            connection.close();
            return res.status(200).send({ message: "Succesful"});

        });
    }

}

module.exports = { postContacts};