/*
 * Primary file for the API
 *
 */

 // Dependencies
 var http = require('http');
 var url = require('url');
 var StringDecoder	= require('string_decoder').StringDecoder;

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

		//Send the response
		res.end('Hello World\n');

		// Log the path the person was asking for
		console.log('request received with payload: ', buffer);
	});	
});

 //Start the server, and have it listen on port 3000
 server.listen(3000, function(){
 	console.log("server is listening on port 3000")
 });