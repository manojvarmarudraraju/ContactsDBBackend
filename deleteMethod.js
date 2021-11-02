
var ibmdb = require('ibm_db');

var deleteContacts = (connStr, req, res) => {
    ibmdb.open(connStr, function (err, connection) {

        if (err) {
            res.status(500).send({message: "Internal Server Error"});
        }
        var contact = req.body.contact;
        var address = req.body.address;
        var phone = req.body.phone;
        var date = req.body.date;

        var x = connection.beginTransactionSync();
        if("error" in x){
            return res.status(401).send({message: x})
        }
        if(address.length > 0) {
            var q = "delete from KBX02002.ADDRESS where ADDRESS_ID in ("

            for(var i = 0; i < address.length; i++) {
                q += String(address[i])
                if(i !== address.length - 1){
                    q += ","
                }
            }
            q += ")";
            console.log(q);
            var out = connection.querySync(q);
            if("error" in out){
                connection.rollbackTransactionSync();
                return res.status(401).send({message: out})
            }
        }
        if(phone.length > 0) {
            var q = "delete from KBX02002.PHONE where PHONE_ID in ("

            for(var i = 0; i < phone.length; i++) {
                q += String(phone[i])
                if(i !== phone.length - 1){
                    q += ","
                }
            }
            q += ")";

            var out = connection.querySync(q);
            if("error" in out){
                connection.rollbackTransactionSync();
                return res.status(401).send({message: out})
            }
        }
        if(date.length > 0) {
            var q = "delete from KBX02002.DATES where DATE_ID in ("

            for(var i = 0; i < date.length; i++) {
                q += String(date[i])
                if(i !== date.length - 1){
                    q += ","
                }
            }
            q += ")";

            var out = connection.querySync(q);
            if("error" in out){
                connection.rollbackTransactionSync();
                return res.status(401).send({message: out})
            }
        }
        if(contact.length > 0) {
            var q = "delete from KBX02002.CONTACT where CONTACT_ID in ("

            for(var i = 0; i < contact.length; i++) {
                q += String(contact[i])
                if(i !== contact.length - 1){
                    q += ","
                }
            }
            q += ")";

            var out = connection.querySync(q);
            if("error" in out){
                connection.rollbackTransactionSync();
                return res.status(401).send({message: out})
            }
        }
        var final = connection.commitTransactionSync()
        if("error" in final){
            connection.rollbackTransactionSync()
            return res.status(401).send({message: final});
        }
        return res.status(200).send({message: "Succesful"});
    });
}

module.exports = { deleteContacts};