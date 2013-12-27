// /coordinate/{deviceID}

// startTimestampMs unsigned long The time from which you would like worker location history to be listed. It's specified as a timestamp in milliseconds since the Unix epoch.
// userId
// [maxResults] unsigned interger
// [pageToken]

var mysql      = require('mysql');

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : 'root',
 // socketPath: '/Applications/MAMP/tmp/mysql/mysql.sock',
  //port     : '3306',
  database : 'gpstracker'
});


// connection.connect(function(err) {
//   // connected! (unless `err` is set)
//   if(err)
//     console.log(err); return;
// });


exports.findAll = function(req, res) {
    // connection.query('SELECT * FROM `devices`', function(err, rows){
         res.send([{name:'gps1'}, {name:'gps2'}]);
    //     console.log(rows);
    // });

    // if (connection) {
    //     connection.query('select * FROM `devices`', function(err, rows, fields) {
    //         res.contentType('application/json');
    //         if (err) throw err;
    //         res.write(JSON.stringify(rows));
    //         res.end();
    //     });
    // }
};

exports.findById = function(req, res) {
    // res.send({id:req.params.id, name: "gps1", description: "gps 1 description"});
    var id = req.params.id;
    if (connection) {
        var queryString = 'SELECT * FROM `devices` WHERE `id` = ?';
        connection.query(queryString, [id], function(err, rows, fields) {
            if (err) throw err;
            res.contentType('application/json');
            res.write(JSON.stringify(rows));
            res.end();
        });
    }
};


exports.addDevice = function(req, res) {};
exports.updateDevice = function(req, res) {};
exports.deleteDevice = function(req, res) {};


