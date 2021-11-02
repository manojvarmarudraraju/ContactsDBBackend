var express =  require('express');
var app = express();
var logger = require('./logger')(module);

var { putContacts} = require('./putMethod');
var {postContacts} = require('./postMethod');

var config = {
    dbname : 'bludb',
    username: "kbx02002",
    password: "AQC84iwbXQVaJ3F3",
    host: "fbd88901-ebdb-4a4f-a32e-9822b9fb237b.c1ogj3sd0tgtu0lqde00.databases.appdomain.cloud",
    port: 32731,
    Security: "SSL"
}

var ibmdb = require('ibm_db');
const { add } = require('winston');
var connStr = "DATABASE="+config.dbname+ ";" + 
                "HOSTNAME="+config.host+";" + 
                "PORT="+config.port+";"+
                // "PROTOCOL=" + TCPIP+";"+
                "UID="+ config.username + ";" + 
                "PWD="+ config.password+";" +
                "Security="+ config.Security;

app.use(function(req, res, next) {
  logger.info(req.url)
  next()
})

app.use(express.json());
app.use(express.urlencoded());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    res.type("application/json");
    next();
});

app.get('/contacts', function(req, res){
  logger.info('GET /contacts');
  ibmdb.open(connStr, function (err, connection) {
    if (err)
    {
      logger.info('Error', err);
      return res.status(500).send({ message: 'Internal server error' });
    }
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
});
});

app.get('/options', function(req,res){
  ibmdb.open(connStr, function (err, connection) {
    if (err)
    {
      logger.info('Error', err);
      return res.status(500).send({ message: 'Internal server error' });
    }
    connection.query("select * from KBX02002.TYPES", function (err1, rows) {
      if (err1) console.log(err1);
      else {
        return res.json({data: rows});
      }
    connection.close(function (err) {
      if(err != null){
        return res.status(500).send({ message: 'Internal server error' });
      }
    })
  });
});
});



app.put('/contacts', function (req, res) {
  putContacts(req, res,connStr);
})

app.post('/contacts', function (req, res) {
  postContacts(req, res,connStr);
})




app.listen(8000,function(){
  console.log('Server is Up')
})
