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

var pg = require('pg');
var conString = process.env.HEROKU_POSTGRESQL_COPPER_URL || 'postgres://localhost:5432/gpstracker'; // heroku defines DATABASE_URL
//var conString = process.env.HEROKU_POSTGRESQL_COPPER_URL || 'postgres://prszbsgoyrzzak:vow4DCek_eqiUfFMiQpa9Pj4y-@ec2-54-228-227-194.eu-west-1.compute.amazonaws.com:5432/d8hg0ujmn2vs6e';
var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) {
    return console.error('could not connect to postgres', err);
  }

  //client.query('CREATE TABLE "devices" ( "deviceId" integer not null, "name" varchar(128) not null);');


  // client.query('SELECT NOW() AS "theTime"', function(err, result) {
  //   if(err) {
  //     return console.error('error running query', err);
  //   }
  //   console.log(result.rows[0].theTime);
  //   //output: Tue Jan 15 2013 19:12:47 GMT-600 (CST)
  //   client.end();
  // });
});


// TESTING ONLY !!
exports.test = function(req, res) {
     client.query('SELECT * FROM devices', function(err, result) {
    //NOTE: error handling not present
    // var json = JSON.stringify(result.rows);
    // res.writeHead(200, {'content-type':'application/json', 'content-length':json.length}); 
    // res.end(json);
    res.json(result.rows);
  });
}


// TESTING ONLY: VERY INSECURE !!!! 
exports.query = function(req, res) {
    if (!req.body.query) {
        res.send(400, {error: 'please specify query'} );
        return;
    }
    client.query(req.body.query, function(err, result) {
        //NOTE: error handling not present
        //var json = JSON.stringify(result.rows);
        //res.writeHead(200, {'content-type':'application/json', 'content-length':json.length}); 
        //res.end(json);
        // console.log(req.body);
        // res.end("QUERY:" + req.body.query);
        res.json(result.rows);
    });
}



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
    var id = parseInt(req.params.id);

    // Check if id is an integer
    if (id !== parseInt(id)) {
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


exports.addDevice = function(req, res) {res.send("TODO");};
exports.updateDevice = function(req, res) {res.send("TODO");};
exports.deleteDevice = function(req, res) {res.send("TODO");};


