var ibmdb = require('ibm_db');
var logger = require('./logger')(module);
var {address_put, dates_put,phone_put} = require('./putMethod');
var { getContacts} = require('./getMethod');


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
        if(!("address_id" in address[i])){
            tempValues.address.push(address[i]);
        } else{
            var q = "update KBX02002.ADDRESS SET ADDRESS='" + address[i].address + "', CITY='" + address[i].city + "', STATE='" + address[i].state +"', ZIP='"+address[i].zip+"' where ADDRESS_ID = " + String(address[i].address_id);
            temp = connection.querySync(q);
            if("error" in temp) {
                console.log("POST ADDRESS Error:", temp);
                return temp;
            }  
        }     
    }
    if(tempValues.address.length != 0){
        var out = address_put(connection, tempValues, parseInt(contact));
        if("error" in out) {
            console.log("PUT ADDRESS Error:", out);
            return out;
        }
        console.log(out);
    }
    return {};
}

var updatePhone = (connection, values) => {
    var contact = values.contact_id;
    var phone = values.phone;
    var temp = null;
    var tempValues = {phone: []}
    for(var i =0; i < phone.length; i++) {
        if(!("phone_id" in phone[i])){
            tempValues.phone.push(phone[i]);
        } else{
            var q = "update KBX02002.PHONE SET AREA_CODE='" + phone[i].area_code + "', mobile_number='" + phone[i].mobile_number +"' where PHONE_ID = " + String(phone[i].phone_id);
            temp = connection.querySync(q);
            if("error" in temp) {
                console.log("POST PHONE Error:", temp);
                return temp;
            }  
            console.log(temp);
        }    
    }
    if(tempValues.phone.length != 0){
        var out = phone_put(connection, tempValues, parseInt(contact));
        if("error" in out){
            console.log("PUT PHONE Error:", out);
            return out;
        }
        console.log(out);
    }
    return {};
}

var updateDate = (connection, values) => {
    var contact = values.contact_id;
    var date = values.date;
    var temp = null;
    var tempValues = {date: []}
    for(var i =0; i < date.length; i++) {
        if(!("date_id" in date[i])){
            tempValues.date.push(date[i]);
        } else{
            var q = "update KBX02002.DATES SET DATE_DATE='" + date[i].date_date + "' where DATE_ID = " + String(date[i].date_id);
            temp = connection.querySync(q);
            if("error" in temp) {
                console.log("POST DATE Error:", temp);
                return temp;
            }  
            console.log(temp);
        }    
    }
    if(tempValues.date.length != 0){
        var out = dates_put(connection, tempValues, parseInt(contact));
        if("error" in out){
            console.log("PUT DATE Error:", out.error);
            return out;
        }
        console.log(out);
    }
    return {};
}

function postContacts(req, res, connStr) {
    var values = req.body;
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
            

            getContacts(connection, req, res);
            connection.close();
            // return res.status(200).send({ message: "Succesful"});

        });
    });
}

module.exports = { postContacts };