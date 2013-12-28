// server.js
var express = require("express");
var logfmt = require("logfmt");
var device  = require('./routes/devices');
var app = express();

// Log requests using key value logging convention adopted by Heroku.
// => ip=127.0.0.1 time=2013-12-27T22:52:02.345Z method=GET path=/ status=200 content_length=12 content_type="text/html; charset=utf-8" elapsed=7ms
app.use(logfmt.requestLogger());

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});


// create an error with .status. we
// can then use the property in our
// custom error handler (Connect repects this prop as well)

function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
}



app.get('/', function(req, res) {
  res.send('Hello World!');
});

app.get('/api/test', device.test);
app.post('/api/query', device.query);

// TODO: API key verification
// we now can assume the api key is valid,
// and simply expose the data
app.get('/api/devices', device.findAll);
app.get('/api/devices/:id', device.findById);
app.post('/api/devices', device.addDevice);
app.put('/api/devices/:id', device.updateDevice);
app.delete('/api/devices/:id', device.deleteDevice);


//var port = process.env.PORT || 3000;
app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});