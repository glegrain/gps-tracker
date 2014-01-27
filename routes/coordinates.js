// get db connection
var client = require('../routes/database.js').getClient();

// get redis connection
if (process.env.REDISTOGO_URL) {
    var rtg   = require("url").parse(process.env.REDISTOGO_URL);
    var redis = require("redis").createClient(rtg.port, rtg.hostname);
    redis.auth(rtg.auth.split(":")[1]);
} else {
    var redis = require("redis").createClient();
}

var historyLimit = 500; // Adjust history limit with available memory 

// Log redis errors
// TODO: show error in response (user friendly and developer mode)
 redis.on("error", function (err) {
        console.log("Error " + err);
    });

// var Pusher = require('pusher');

// var pusher = new Pusher({
//   appId: '62619',
//   key: 'd4218c27c7a574e6a49d',
//   secret: '0bc7736bb207a2bcb8eb'
// });
// if (!pusher) {throw new Error("Could not connect to Pusher");}



// Demo device
// reads a geoJson set of coordinates at a specified time interval and set current position
// device1History will hold all the past positions.
var device1Poistion = {
  "id": 2,
  "device_id": 1,
  "latitude": 48.85856,
  "longitude": 2.34963,
  "timestamp": "2014-01-16T23:44:18.969Z"
};
//var device1History = [];

var fs = require('fs');
var fileJSON = fs.readFileSync(__dirname + '/parisESIEE.json');
var device1Coords = JSON.parse(fileJSON).features[0].geometry.coordinates;
var i = 0;
var parseCoords  = function(coordinates) {
    //console.log("Updating dummy device position")
    var position = Object.create(device1Poistion);
    position.longitude = coordinates[0];
    position.latitude = coordinates[1];
    position.timestamp = new Date().toISOString();
    // append to history
    //device1History.push(position);
    var key = position.device_id;
    var value = JSON.stringify(position);
    redis.lpush(key, value,function(err, response) {
        if (err) throw err;
        redis.ltrim(key, 0, historyLimit); // limit storage of only the latest location
    });

    // update current position
    //device1Poistion = position;
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
        //device1History = [];
        // clear db
        redis.del(1);
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

exports.coordinates = function(req, res) {
    // pusher.trigger('test_channel', 'my_event', {
    //     "message": Date()
    // });
    //res.json(device1History);
    //res.send("Test function executed");
    //console.log("Test function executed, sending history");
    res.send(400, {error: 'please specify a device id'} );
};


// FIXME
exports.updatePosition = function(req, res) {
    console.log('updatingPosition');
    console.log(req.params);
    console.log(req.body);
    if ( !req.body.deviceId && req.body.deviceId !== '' ) {
        res.send(400, {error: 'Please specify a deviceId.'} );
        return;
    }
    if ( !req.body.latitude ) {
        res.send(400, {error: 'Invalid latitude.'} );
        return;
    }
    if ( !req.body.longitude ) {
        res.send(400, {error: 'Invalid longitude.'} );
        return;
    }

    // TODO: verify lat long format
    var deviceId = req.params.id || req.body.deviceId ;
    var latitude = req.params.latitude || req.body.latitude;
    var longitude = req.params.longitude || req.body.longitude;


    var position = Object.create(device1Poistion);
    position.device_id = deviceId;
    position.longitude = coordinates[0];
    position.latitude = coordinates[1];
    position.timestamp = new Date().toISOString();
    // append to history
    //device1History.push(position);
    var key = position.deviceId;
    var value = JSON.stringify(position);
    redis.lpush(key, value,function(err, response) {
        if (err) {
            console.log(err);
            res.send(500, { error: 'something blew up' , message: err.message, raw: err});
            return;
        }
        redis.ltrim(key, 0, historyLimit); // limit storage of only the latest location

        res.send(201);
    });
};


/**
 * Retrieves lastest device position.
 *
 * Notes:
 * 
 *   device 1 can be used for testing, it goes from Paris to ESIEE.
 *   Same as GET /api/coordinates/:id?limit=1
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
    //console.log("gettting current position");
    getLastPositions(req,res,0,1);
    
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

/**
 * Retrieves recent known locations.
 *
 * Notes:
 * 
 *   device 1 can be used for testing, it goes from Paris to ESIEE.
 *
 * Examples:
 *
 *    GET /api/coordinates/1
 *    GET /api/coordinates/1?offset=0limit=1
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
exports.getLocationsForDevice = function(req, res) {
    var start = req.query.offset || 0;
    var stop = req.query.limit || -1; // -1 for all
    getLastPositions(req ,res, start, stop);
};


// private
getLastPositions = function(req, res, offset, n) {
    var id = parseInt(req.params.id, 10);
    var start = offset;
    var stop = n===-1? -1: n - 1; // With redis, -1 is the last element of the list.

    // Check if id is an integer
    if (id !== parseInt(id, 10)) {
        //throw "not an integer !"
        res.send(500, { error: 'Make sure id is an integer.' });
        return;
    }

    redis.lrange(id, start, stop, function(err, reply) { // TODO: make sure the list is in the right order
        if (err) {
            console.log(err);
            res.send(500, { error: 'something blew up' , message: err.message, raw: err});
            return;
        }

        // parse each array element to JSON 
        for (var i = 0; i < reply.length ; i++) {
            reply[i] = JSON.parse(reply[i]);
        }
        if (reply.length === 1) {
            return res.json(reply[0]);
        }
        reply.reverse();
        res.json(reply);

    });
};
