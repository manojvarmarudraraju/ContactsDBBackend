var express =  require('express');
var app = express();
var logger = require('./logger')(module);

var {putContacts} = require('./putMethod');
var {postContacts} = require('./postMethod');
var {getContacts} = require('./getMethod');
var {deleteContacts} = require('./deleteMethod');
var {getOptions} = require('./getOptions');

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

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'DELETE, PUT, GET, POST'); 
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Headers","*")
  next();
});
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
    return getContacts(connection, req, res)
});
});

app.get('/options', function(req,res){
  ibmdb.open(connStr, function (err, connection) {
    if (err)
    {
      logger.info('Error', err);
      return res.status(500).send({ message: 'Internal server error' });
    }
    var rows = getOptions(connection);
    if("error" in rows){
      res.status(401).send({message: rows});
    }
    return res.status(200).json(rows);
  });
});



app.put('/contacts', function (req, res) {
  putContacts(req, res,connStr);
})

app.post('/contacts', function (req, res) {
  postContacts(req, res,connStr);
})

app.delete('/contacts', function (req, res) {
  deleteContacts(connStr,req,res);
})

app.post('/contactSearch', function (req, res) {
  ibmdb.open(connStr, function (err, connection) {
    if (err)
    {
      logger.info('Error', err);
      return res.status(500).send({ message: 'Internal server error' });
    }
    return getContacts(connection,req,res);
  });
})




app.listen(8000,function(){
  console.log('Server is Up')
})
