// get db connection
var client = require('../routes/database.js').getClient();

// var Pusher = require('pusher');

// var pusher = new Pusher({
//   appId: '62619',
//   key: 'd4218c27c7a574e6a49d',
//   secret: '0bc7736bb207a2bcb8eb'
// });
// if (!pusher) {throw new Error("Could not connect to Pusher");}



// Demo device
var device1Poistion = {
  "id": 2,
  "device_id": 1,
  "latitude": 48.85856,
  "longitude": 2.34963,
  "timestamp": "2014-01-16T23:44:18.969Z"
};
var fs = require('fs');
var fileJSON = fs.readFileSync(__dirname + '/parisESIEE.json');
var device1Coords = JSON.parse(fileJSON).features[0].geometry.coordinates;
var i = 0;
var parseCoords  = function(coordinates) {
    //console.log("Updating dummy device position")
    device1Poistion.longitude = coordinates[0];
    device1Poistion.latitude = coordinates[1];
    //console.log(device1Poistion);
};
var getNextCoord = function() {
    if (i >= device1Coords.length) {
        i = 0;
    }
    parseCoords(device1Coords[i]);
    i++;
};
setInterval(getNextCoord,1000);


client.query("LISTEN watchers");
client.query("LISTEN position_watcher");
client.on('notification', function(msg) {
    console.log('New notification:');
    console.log(msg.payload);
    //  pusher.trigger('test_channel', 'my_event', {
    //     "message": "position updated"
    // });
});

exports.test = function(req, res) {
    // pusher.trigger('test_channel', 'my_event', {
    //     "message": Date()
    // });
    res.send("Test function executed");
    console.log("Test function executed");
};

//TODO:CHANGE TO PUT or POST
exports.updatePosition = function(req, res) {
    console.log('updatingPosition');
    console.log(req.params);
    console.log(req.body);
    if ( !req.body.coords || (req.body.device_id && req.body.device_name)) {
        res.send(400, {error: 'please specify coords'} );
        return;
    }

    // TODO: verify lat long format
    var device_id = req.params.id || req.body.device_id ;
    var latitude = req.params.latitude || req.body.coords.latitude;
    var longitude = req.params.longitude || req.body.coords.longitude;
    //console.log(device_id + ',' + latitude + ',' +longitude);
    
    var queryString = 'INSERT INTO coordinates (device_id, latitude, longitude) VALUES ($1, $2, $3 );';
    client.query(queryString, [device_id, latitude, longitude], function(err, result) {
        if (err) {
            console.log(err);
            res.send(500, { error: 'something blew up' });
            return;
        }
        console.log(result);
        //NOTE: show devices ??
        res.send(201);
    });
};


/**
 * Retrieves device position.
 *
 * Notes:
 * 
 *   device 1 can be used for testing, it goes from Paris to ESIEE.
 *
 * Examples:
 *
 *    GET /api/coordinates/1
 *
 * Response:
 * 
 *  Returns the coordinates associated with a device as an object, as in:
 * 
 *     {
 *       "id": 2,
 *       "device_id": 1,
 *       "latitude": 10,
 *       "longitude": 10,
 *       "timestamp": "2014-01-16T23:44:18.969Z"
 *     }
 * 
 * Errors:
 *
 *  - `500` with a database error
 *
 * Error Response:
 *
 * - TODO
 *
 * @param request The standard http request
 * @param response The standard http response
 */
exports.getCurPosition = function(req, res) {
    console.log("gettting current position");
    var id = parseInt(req.params.id, 10);

    // Check if id is an integer
    if (id !== parseInt(id, 10)) {
        //throw "not an integer !"
        res.send(500, { error: 'Make sure id is an integer.' });
        return;
    }

    // if device 1, send demo data
    if ( id === 1 ) {
        res.json(device1Poistion);
    }

    var queryString = 'SELECT * FROM coordinates WHERE coordinates.device_id = $1 ORDER BY timestamp DESC LIMIT 1;';
    client.query(queryString, [id], function(err, result) {
                if (err) {
                    console.log(err);
                    res.send(500, { error: 'something blew up' });
                    return;
                }
                res.json(result.rows[0]);
         });
};
