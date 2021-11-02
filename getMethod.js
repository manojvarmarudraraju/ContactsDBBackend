var logger = require('./logger')(module);


var getContacts = function(connection, req, res){
    connection.query("select * from KBX02002.CONTACTS_VIEW order by FNAME", function (err1, rows) {
        if (err1) {
          connection.close();
          return res.status(500).send({ message: 'Internal server error' });
        }
        else {
            var output = {}
            for(var i = 0; i< rows.length; i++){
                row = rows[i];
                if(!(row.CONTACT_ID in output)){
                    output[row.CONTACT_ID] = {
                    fname: row.FNAME,
                    mname: row.MNAME,
                    lname: row.LNAME,
                    contact_id: row.CONTACT_ID,
                    address: {},
                    phone: {},
                    date: {}
                }
  
                if(row.ADDRESS_TYPE != null){
                    output[row.CONTACT_ID].address[row.ADDRESS_TYPE] = {
                        address_id: row.ADDRESS_ID,
                        address_type: row.ADDRESS_TYPE,
                        address: row.ADDRESS,
                        city: row.CITY,
                        state: row.STATE,
                        zip: row.ZIP
                    }
                }
                if(row.PHONE_TYPE != null){
                    output[row.CONTACT_ID].phone[row.PHONE_TYPE] = {
                        phone_id: row.PHONE_ID,
                        phone_type: row.PHONE_TYPE,
                        area_code: row.AREA_CODE,
                        mobile_number: row.MOBILE_NUMBER
                    }
                }
                if(row.DATE_TYPE != null){
                    output[row.CONTACT_ID].date[row.DATE_TYPE] = {
                        date_id: row.DATE_ID,
                        date_type: row.DATE_TYPE,
                        date_date: row.DATE_DATE
                    }
                }
            } else{
              if(row.ADDRESS_TYPE != null && !(row.ADDRESS_TYPE in output[row.CONTACT_ID].address)){
                output[row.CONTACT_ID].address[row.ADDRESS_TYPE] = {
                address_id: row.ADDRESS_ID,
                address_type: row.ADDRESS_TYPE,
                address: row.ADDRESS,
                city: row.CITY,
                state: row.STATE,
                zip: row.ZIP
              }
            }
            if(row.PHONE_TYPE != null && !(row.PHONE_TYPE in output[row.CONTACT_ID].phone)){
              output[row.CONTACT_ID].phone[row.PHONE_TYPE] = {
                phone_id: row.PHONE_ID,
                phone_type: row.PHONE_TYPE,
                area_code: row.AREA_CODE,
                mobile_number: row.MOBILE_NUMBER
              }
            }
            if(row.DATE_TYPE != null && !(row.DATE_TYPE in output[row.CONTACT_ID].date)){
              output[row.CONTACT_ID].date[row.DATE_TYPE] = {
                date_id: row.DATE_ID,
                date_type: row.DATE_TYPE,
                date_date: row.DATE_DATE
              }
            }
            }
          }
  
          result = []
  
          for( contact in output){
            var address = output[contact].address
            var date = output[contact].date
            var phone = output[contact].phone
            var add_arr = []
            for(ad in address){
              add_arr.push(address[ad])
            }
            var ph_arr = []
            for(ph in phone){
              ph_arr.push(phone[ph])
            }
            var dt_arr = []
            for(dt in date){
              dt_arr.push(date[dt])
            }
            output[contact].address = add_arr
            output[contact].phone = ph_arr
            output[contact].date = dt_arr
            result.push(output[contact])
          }
          
          
          logger.info('Succesful');
          connection.close();
          return res.json({ data: result });
        }
        connection.close(function(err2) {
          if(err2) {
            logger.info('Error in closing connection');
            res.status(402).send({ message: err2 });
          }
        });
      });
}

module.exports = { getContacts };