// var express = require('express');
// var restify = require('restify');
var device  = require('./routes/devices');

// var app = express();



// //http.createServer(function (request, response) {
// //    response.writeHead(200, {'Content-Type': 'text/plain'});
// //    response.end('Hello World\n');
// //}).listen(3000);


//     app.get('/devices', device.findAll);
//     app.get('/devices/:id', device.findById);
//     app.post('/devices', device.addDevice);
//     app.put('/devices/:id', device.updateDevice);
//     app.delete('/devices/:id', device.deleteDevice);
 
// app.listen(app.port, function() {
//     console.log('Listening on port 3000...');
// });


// web.js
var express = require("express");
var logfmt = require("logfmt");
var app = express();

// Log requests using key value logging convention adopted by Heroku.
// => ip=127.0.0.1 time=2013-12-27T22:52:02.345Z method=GET path=/ status=200 content_length=12 content_type="text/html; charset=utf-8" elapsed=7ms
app.use(logfmt.requestLogger());

app.configure(function () {
    //app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

app.get('/', function(req, res) {
  res.send('Hello World!');
});
app.get('/devices', device.findAll);

var port = process.env.PORT || 3000;
app.listen(port, function() {
  console.log("Listening on " + port);
});