/*
 * Primary file for the API
 *
 */

 // Dependencies
 var http = require('http');
 var https = require('https');
 var url = require('url');
 var StringDecoder	= require('string_decoder').StringDecoder;
 var config = require('./config.js');
 var fs = require('fs');

 //Instantiate http server
var httpServer = http.createServer(function(req, res){
	unifiedServer(req, res);	
});

 //Start the server
 httpServer.listen(config.httpPort, function(){
 	console.log("server is listening on ", config.httpPort);
 });

 //Instantiate https server
 var httpsServerOptions = {
 	'key' : fs.readFileSync('./https/key.pem'),
 	'cert' : fs.readFileSync('./https/cert.pem')
 };
var httpsServer = https.createServer(httpsServerOptions, function(req, res){
	unifiedServer(req, res);
});

 //Start the https server
 httpsServer.listen(config.httpsPort, function(){
 	console.log("server is listening on ", config.httpsPort);
 });

// All serve logic for both the http and the https servers
var unifiedServer = function(req, res) {
	//Get the url and parse it
	var parsedUrl = url.parse(req.url, true);

	//Get the path from the url
	var path = parsedUrl.pathname;
	var trimmedPath = path.replace(/^\/+|\/+$/g, '');

	//Get the query string as an object
	var queryStringObject = parsedUrl.query;

	//Get the http method
	var method = req.method.toLowerCase();

	//Get the headers as an object
	var headers = req.headers;

	//Get the payload, if there is any, decode it to utf-8
	var decoder = new StringDecoder('utf-8');
	var buffer = '';
	req.on('data', function(data){
		buffer += decoder.write(data);
	});

	//When payload at end, send response
	req.on('end', function(){
		buffer += decoder.end();

		//Chooosee the handler this request should go to, if not found then use not found handler
		var chosenHandler = typeof(router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound;

		//Construct the data object to send to the handler
		var data = {
			'trimmedPath' : trimmedPath,
			'queryStringObject' : queryStringObject,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		//Route the request to the handler specified in the router
		chosenHandler(data, function(statusCode, payload){
			
			//Use the status code called back or defaut to 200
			statusCode = typeof(statusCode) == 'number' ? statusCode : 200;
			
			//Use payload called back or default to empty object 
			payload = typeof(payload) == 'object' ? payload : {};

			//Convert the payload to a string
			var payloadString = JSON.stringify(payload);

			//Return response
			res.setHeader('Content-Type', 'application/json')
			res.writeHead(statusCode);
			res.end(payloadString);

			// Log the path the person was asking for
			console.log('returning with this response payload: ',statusCode,payloadString);
		});
	});
};




//Define the handlers

var handlers = {}

//Write the sample handler
handlers.ping = function(data, callback) {
	callback(200);
}


//Define not found handler
handlers.notFound = function(data, callback) {
	callback(404);
};

// Define a request router
var router = {
	'ping' : handlers.ping,

};





