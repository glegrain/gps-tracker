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
// reads a geoJson set of coordinates at a specified interval and set current position
// device1History will hold all the past positions.
var device1Poistion = {
  "id": 2,
  "device_id": 1,
  "latitude": 48.85856,
  "longitude": 2.34963,
  "timestamp": "2014-01-16T23:44:18.969Z"
};
var device1History = [];

var fs = require('fs');
var fileJSON = fs.readFileSync(__dirname + '/parisESIEE.json');
var device1Coords = JSON.parse(fileJSON).features[0].geometry.coordinates;
var i = 0;
var parseCoords  = function(coordinates) {
    //console.log("Updating dummy device position")
    var position = Object.create(device1Poistion);
    position.longitude = coordinates[0];
    position.latitude = coordinates[1];
    position.timestamp = new Date();
    // append to history
    device1History.push(position);
    // update current position
    device1Poistion = position;
    // console.log("\n========");
    // console.log(device1Poistion);
    // console.log("\n========");
};

// // get last few n points for history
// var getLastFewCoords = function(n) {
//     n = n % i; //keep index inside array
//     for (var j = n; j >= 0; j--) {
//         console.log();
//         device1History.push({
//             "id": 2,
//             "device_id": 1,
//             "latitude": device1Coords[j][1],
//             "longitude": device1Coords[j][0],
//             "timestamp": "2014-01-16T23:44:18.969Z"
//         });
//     }
// };

// get position at index i and increment i
var getNextCoord = function() {
    if (i >= device1Coords.length) { // loop completed, starting over
        i = 0;
        //clear history
        device1History = [];
    }
    parseCoords(device1Coords[i]);
    i++;
    // console.log(device1History);
    // console.log("\n\n\n\n\n");
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
    res.json(device1History);
    //res.send("Test function executed");
    console.log("Test function executed, sending history");
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
 * Retrieves lastest device position.
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
 *  - `500` with a query error
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
    getLastPositions(req,res,1);
    
};

/**
 * Retrieves n last positions for a device.
 *
 * Notes:
 * 
 *   Device 1 can be used for testing, it goes from Paris to ESIEE.
 *   If n is greater than the number of points available, it will return all available points.
 *
 * Examples:
 *
 *    GET /api/coordinates/1/2
 *    GET /api/coordinates/1/all
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
 *     },
 *     {
 *       "id": 2,
 *       "device_id": 1,
 *       "latitude": 10,
 *       "longitude": 11,
 *       "timestamp": "2014-01-16T23:44:19.969Z"
 *     }
 *
 * 
 * Errors:
 *
 *  - `500` with a database error
 *  - `500` with a query error
 *
 * Error Response:
 *
 * - TODO
 *
 * @param request The standard http request
 * @param response The standard http response
 */
exports.getHistory = function(req, res) {
    //console.log("gettting position history " + req.params.n);
    var n = parseInt(req.params.n, 10);
    if (req.params.n === "all") n = req.params.n;

    // Check if id is an integer
    if (n !== parseInt(n, 10) && n !== "all") {
        //throw "not an integer !"
        res.send(500, { error: 'Make sure n is an integer or "all".' });
        return;
    }
    getLastPositions(req,res,n);
    
};



getLastPositions = function(req, res, n) {
    var id = parseInt(req.params.id, 10);

    // Check if id is an integer
    if (id !== parseInt(id, 10)) {
        //throw "not an integer !"
        res.send(500, { error: 'Make sure id is an integer.' });
        return;
    }

    // if device 1, send demo data
    if ( id === 1 ) {
        if (n === 1) {
            res.json(device1Poistion);
            return;
        } else if (n === "all") {
            res.json(device1History);
            return;
        } else {
            res.json(device1History.slice(-n));
            return;
        }
    }

    var queryString = 'SELECT * FROM coordinates WHERE coordinates.device_id = $1 ORDER BY timestamp DESC LIMIT $2;';
    client.query(queryString, [id, n], function(err, result) {
                if (err) {
                    console.log(err);
                    res.send(500, { error: 'something blew up' });
                    return;
                }
                res.json(result.rows[0]);
         });
};
