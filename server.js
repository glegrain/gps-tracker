var express = require('express');
var restify = require('restify');
var device  = require('./routes/devices');

var app = express();

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */
    app.use(express.bodyParser());
});

//http.createServer(function (request, response) {
//    response.writeHead(200, {'Content-Type': 'text/plain'});
//    response.end('Hello World\n');
//}).listen(3000);


    app.get('/devices', device.findAll);
    app.get('/devices/:id', device.findById);
    app.post('/devices', device.addDevice);
    app.put('/devices/:id', device.updateDevice);
    app.delete('/devices/:id', device.deleteDevice);
 
app.listen(3000);
console.log('Listening on port 3000...');
