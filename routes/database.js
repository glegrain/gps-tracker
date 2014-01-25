var pg = require('pg');
var conString = process.env.HEROKU_POSTGRESQL_COPPER_URL || 'postgres://localhost:5432/gpstracker'; // heroku defines DATABASE_URL
// TODO: remove from source: var conString = process.env.HEROKU_POSTGRESQL_COPPER_URL || 'postgres://prszbsgoyrzzak:vow4DCek_eqiUfFMiQpa9Pj4y-@ec2-54-228-227-194.eu-west-1.compute.amazonaws.com:5432/d8hg0ujmn2vs6e';
var client = new pg.Client(conString);
client.connect(function(err) {
  if(err) return console.error('could not connect to postgres', err);
  //throw err; ??
});


// pass the client object 
exports.getClient = function() {
    return client;
};