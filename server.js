// server.js
var express = require("express");
var logfmt = require("logfmt");
var fs = require('fs');
// var device  = require('./routes/devices');
// var coordinate  = require('./routes/coordinates');
var app = express();


// Log requests using key value logging convention adopted by Heroku.
// => ip=127.0.0.1 time=2013-12-27T22:52:02.345Z method=GET path=/ status=200 content_length=12 content_type="text/html; charset=utf-8" elapsed=7ms
app.use(logfmt.requestLogger());

app.configure(function () {
    app.set('port', process.env.PORT || 3000);
    app.use(express.logger('dev'));     /* 'default', 'short', 'tiny', 'dev' */  // logging level
    app.use(express.bodyParser());
    //TODO: app.use(express.favicon(__dirname + '/public/images/favicon.ico'));
});


// create an error with .status. we
// can then use the property in our
// custom error handler (Connect repects this prop as well)
// TODO: place in seperate .js file then exports = error
function error(status, msg) {
  var err = new Error(msg);
  err.status = status;
  return err;
}

// Add headers to allow cross domain requests
app.use(function (req, res, next) {
    // Website you wish to allow to connect
    res.setHeader('Access-Control-Allow-Origin', '*');  // '*' all domains
    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST,  PUT, DELETE');
    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    //res.setHeader('Access-Control-Allow-Credentials', true);
    // Pass to next layer of middleware
    next();
});



// middleware with an arity of 4 are considered
// error handling middleware. When you next(err)
// it will be passed through the defined middleware
// in order, but ONLY those with an arity of 4, ignoring
// regular middleware.
app.use(function(err, req, res, next){
  // whatever you want here, feel free to populate
  // properties on `err` to treat it differently in here.
  res.send(err.status || 500, { error: err.message });
});


app.get('/', function(req, res) {
  //res.send('<h1>GPS API server</h1><p> View <a href="doc" >Document```  ation</a></p>');
  // var data = fs.readFile( __dirname + '/index.html', function(err, data) {
  //   res.send(data.toString());
  // });
  res.sendfile( __dirname + '/public/index.html');
});

// provide API documentation (link to static website)
//app.use('/doc', express.static('./doc'));

// provides access to files in public folder using real filenames
app.use(express.static(__dirname + '/public'));

//Demo page
app.get('/demo', function(req, res) {
  res.sendfile( __dirname + '/public/demo.html');
});


// routes
var routes = require('./router');
routes.setup(app);

// app.get('/api/test', device.test);
// app.get('/api/coordinates', coordinate.test);
// app.get('/api/coordinates/:id', coordinate.getCurPosition);
// app.get('/api/coordinates/:id/:latitude/:longitude', coordinate.updatePosition); //TODO:change to PUT or POST
// app.post('/api/coordinates', coordinate.updatePosition);

// app.post('/api/query', device.query);

// // TODO: API key verification
// // we now can assume the api key is valid,
// // and simply expose the data
// app.get('/api/devices', device.findAll);
// app.get('/api/devices/:id', device.findById);
// app.post('/api/devices', device.addDevice);
// app.put('/api/devices/:id', device.updateDevice);
// app.delete('/api/devices/:id', device.deleteDevice);


// our custom JSON 404 middleware. Since it's placed last
// it will be the last middleware called, if all others
// invoke next() and do not respond.
 app.use(function(req, res){
   res.send(404, { error: "Lame, can't find that" });
 });


// View possible requests
//console.log(app.routes);

//var port = process.env.PORT || 3000;
var server = app.listen(app.get('port'), function() {
  console.log("Listening on " + app.get('port'));
});
var io = require('socket.io').listen(server);

//io.set('destroy upgrade',false);

io.sockets.on('connection', function (socket) {
  console.log('New client connected');

  app.get('/test', function(req, res) {
    socket.emit('news', {hello: 'test'});
    console.log('test called');
  });

  socket.emit('news', { hello: 'world' });
  
  socket.on('my other event', function (data) {
    console.log(data);
  });
});




// Clean shutdown
cleanUp = function () {

   server.close(function () {
     console.log( "Closed out remaining connections.");
     // TODO: Close db connections, etc.
     process.exit();
   });

   setTimeout( function () {
     console.error("Could not close connections in time, forcefully shutting down");
     process.exit(1);
   }, 30*1000);

};
process.on('SIGTERM', cleanUp);
process.on( 'SIGINT', cleanUp);
