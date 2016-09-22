var cfenv = require('cfenv');
var express = require('express');
var app = express();
var server = require('http').Server(app);
var basicAuth = require('basic-auth-connect');
if(process.env.BASIC_AUTH_USER && process.env.BASIC_AUTH_PASSWORD){
  app.use(basicAuth(process.env.BASIC_AUTH_USER, process.env.BASIC_AUTH_PASSWORD));
}
app.use(express.static(__dirname + '/app'));




// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

// start server on the specified port and binding host
server.listen(appEnv.port, function() {
  console.log("server starting on " + appEnv.url);
});
