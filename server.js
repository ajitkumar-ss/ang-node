const app = require('./node_app/app');
var http = require('http');
const httpHost = 'localhost';
const httpPort = 9800;
const server = http.createServer({}, app);


server.listen(httpPort, function () {
  console.log("Express server listening on port");
});

console.log('Server listening on -->' + httpHost + ':' + httpPort)                                                                  

