/**
 * Routes all API requests to particular functions.
 * This file would be referenced by the `server.js` file, as:
 *
 *      var app    = express.createServer();
 *      var routes = require('./router');
 *
 * And called:
 *
 *      routes.setup(app);
 */

var device  = require('./routes/devices');
var coordinate  = require('./routes/coordinates');

module.exports.setup = function( app ) {

    app.get('/api/test', device.test);
    app.get('/hello', function(req,res) {res.send('Hello World');});
    app.get('/api/coordinates', coordinate.test);
    app.get('/api/coordinates/:id', coordinate.getCurPosition);
    app.get('/api/coordinates/:id/:latitude/:longitude', coordinate.updatePosition); //TODO:change to PUT or POST
    app.post('/api/coordinates', coordinate.updatePosition);

    app.post('/api/query', device.query);

    // TODO: API key verification
    // we now can assume the api key is valid,
    // and simply expose the data
    app.get('/api/devices', device.findAll);
    app.get('/api/devices/:id', device.findById);
    app.post('/api/devices', device.addDevice);
    app.put('/api/devices/:id', device.updateDevice);
    app.delete('/api/devices/:id', device.deleteDevice);

};