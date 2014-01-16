// /coordinate/{deviceID}

// startTimestampMs unsigned long The time from which you would like worker location history to be listed. It's specified as a timestamp in milliseconds since the Unix epoch.
// userId
// [maxResults] unsigned interger
// [pageToken]

// var mysql      = require('mysql');

// var connection = mysql.createConnection({
//   host     : 'localhost',
//   user     : 'root',
//   password : 'root',
//  // socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
//   //port     : '3306',
//   database : 'gpstracker'
// });


// connection.connect(function(err) {
//   // connected! (unless `err` is set)
//   if(err)
//     console.log(err); return;
// });

// get db connection
var db = require('../routes/database.js');
var client = db.getClient();


// // listen to db
// client.query("LISTEN watchers");
// client.on('notification', function(msg) {
//     console.log('New notification:');
//     console.log(msg);
// });

// client.query('LISTEN "notifications_channel"');

// // traitement à la réception de nouvelles notifications
// client.on('notification', function(notification) {
//     // le payload récupéré ici est la chaîne de données passée en argument à pg_notify dans notre procédure SQL
//     console.log('New notification:');
//     console.log(notification.payload);
//     /* push vers le client avec socket.io */
// });




// TESTING ONLY !!
exports.test = function(req, res, next) {
    console.log('TEST REQUEST');
    client.query('SELECT * FROM devices', function(err, result) {
    //NOTE: error handling not present
    // var json = JSON.stringify(result.rows);
    // res.writeHead(200, {'content-type':'application/json', 'content-length':json.length}); 
    // res.end(json);
    res.json(result.rows);
  });
};


// TESTING ONLY: VERY INSECURE !!!! 
exports.query = function(req, res) {
    if (!req.body.query) {
        res.send(400, {error: 'please specify query'} );
        return;
    }
    client.query(req.body.query, function(err, result) {
        res.json(result.rows);
    });
};



exports.findAll = function(req, res) {
    client.query('SELECT * FROM devices', function(err, result){
        if (err) {
            //var json = JSON.stringify(err);
            //console.log(json);
            // res.writeHead(500, {'content-type':'application/json', 'content-length':json.length}); 
            // res.end(json);
            console.log(err);
            res.send(500, { error: 'something blew up' });
            return;
        }
        //res.json([{name:'gps1'}, {name:'gps2'}]);
        res.json(result.rows);
    });
};

exports.findById = function(req, res) {
    //res.json({id:req.params.id, name: "gps1", description: "gps 1 description"});
    var id = parseInt(req.params.id, 10);

    // Check if id is an integer
    if (id !== parseInt(id, 10)) {
        //throw "not an integer !"
        res.send(500, { error: 'Make sure id is an integer.' });
        return;
    }

    if (client) {
       var queryString = 'SELECT * FROM devices WHERE device_id = $1';
       client.query(queryString, [id], function(err, result) {
    //         if (err) throw err;
                if (err) {
                    console.log(err);
                    res.send(500, { error: 'something blew up' });
                    return;
                }
                //TODO: send message when there is no match found !
                // res.contentType('application/json');
                // res.write(JSON.stringify(rows));
                // res.end();
                res.json(result.rows);
         });
    }
};


exports.addDevice = function(req, res) {
        if (!req.body.device_name || !req.body.device_id) {
        res.send(400, {error: 'please specify device_name and device_id'} );
        return;
    }

    var device_id =  req.body.device_id;
    var device_name = req.body.device_name;

    var queryString = 'INSERT INTO devices VALUES ($1, $2);';
    // TODO: fix duplicate entry bug.
    client.query(queryString, [device_id, [device_name]], function(err, result) {
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

exports.updateDevice = function(req, res) {
    res.send("TODO");
};

exports.deleteDevice = function(req, res) {
    res.send("TODO");
};
