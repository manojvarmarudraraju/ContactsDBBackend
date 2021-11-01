var express =  require('express');
var app = express();
var logger = require('./logger')(module);

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
      connection.query(query, function(err,rows){
        if(err){
          connection.rollbackTransaction();
          connection.close();
          return res.status(401).send({ message: err });
        }
        var contact = rows[0].CONTACT_ID;
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
              address_type.push(address[i].address_type)
              address_add.push(address[i].address)
              city.push(address[i].city)
              state.push(address[i].state)
              zip.push(address[i].zip)
              contact_id.push(contact)
            }
          }
          console.log(address_type);
          if(add_do == true){
            var add_query = {
              sql : "select * from new table(insert into ADDRESS (contact_id,address_type, address, city, state, zip) values(?,?,?,?,?,?))",
              params: [
                {
                  ParamType: "ARRAY",
                  DataType: 1,
                  Data: contact_id
                },
                {
                  ParamType : "ARRAY",
                  DataType : 1,
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

            console.log(add_query);
            connection.query(add_query, function(err, add_results){
              if(err){
                connection.rollbackTransaction();
                connection.close();
                return res.status(401).send({message: err});
              }
              console.log(add_results);

              var phone_do =  false;

              var phone_type = []
              var area_code = []
              var contact_id = []
              var mobile = []
              var phone = values.phone;
              for(var i = 0; i < phone.length; i){
                if(phone[i].phone_do){
                  phone_do = true;
                  phone_type.push(phone[i].phone_type);
                  area_code.push(phone[i].area_code);
                  contact_id.push(phone[i].contact);
                  mobile.push(phone[i].mobile_number);
                }
              }

              console.log("rows",rows);
              connection.commitTransaction(function(err) {
                if(err){
                  connection.rollbackTransaction();
                  connection.close();
                  return res.status(401).send({ message: err});
                }

                return res.status(200).send({message: "Success"});
              });
            });
          }
        }
        

        
        
      })
    })
  })

  //return res.json(values);
})


app.listen(8000,function(){
  console.log('Server is Up')
})
