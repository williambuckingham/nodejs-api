/*
 * Primary file for the API
 *
 */

 // Dependencies
 var http = require('http');
 var url = require('url');
 var StringDecoder	= require('string_decoder').StringDecoder;
 var config = require('./config.js');

 //The server should respond to all requests with a string
var server = http.createServer(function(req, res){
	
	//Get the url and parse it
	var parsed_url = url.parse(req.url, true);

	//Get the path from the url
	var path = parsed_url.pathname;
	var trimmed_path = path.replace(/^\/+|\/+$/g, '');

	//Get the query string as an object
	var query_string_object = parsed_url.query;

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
		var chosen_handler = typeof(router[trimmed_path]) !== 'undefined' ? router[trimmed_path] : handlers.not_found;

		//Construct the data object to send to the handler
		var data = {
			'trimmed_path' : trimmed_path,
			'query_string_object' : query_string_object,
			'method' : method,
			'headers' : headers,
			'payload' : buffer
		};

		//Route the request to the handler specified in the router
		chosen_handler(data, function(status_code, payload){
			
			//Use the status code called back or defaut to 200
			status_code = typeof(status_code) == 'number' ? status_code : 200;
			
			//Use payload called back or default to empty object 
			payload = typeof(payload) == 'object' ? payload : {};

			//Convert the payload to a string
			var payload_string = JSON.stringify(payload);

			//Return response
			res.setHeader('Content-Type', 'application/json')
			res.writeHead(status_code);
			res.end(payload_string);

			// Log the path the person was asking for
			console.log('returning with this response payload: ',status_code,payload_string);

		});
	});	
});

 //Start the server
 server.listen(config.port, function(){
 	console.log("server is listening on ", config.port, "and env is ", config.env_name);
 });

//Define the handlers

var handlers = {}

//Write the sample handler
handlers.sample = function(data, callback) {
	//Callback a http status code, and a payload object 
	callback(406, {'name' : 'sample handler'});
};

//Define not found handler
handlers.not_found = function(data, callback) {
	callback(404);
};

// Define a request router

var router = {
	'sample' : handlers.sample
};





