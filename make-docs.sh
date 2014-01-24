/**
 * A simple approach to calling the Express API Document Generator.
 */

//FIXME

var api = require('express-api-docs');

api.generate('server.js', 'public/doc/index.html');
