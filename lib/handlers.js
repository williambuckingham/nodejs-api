/*
 * Request Handlers
 */

//Dependencies
var _data = require('./data');
var helpers = require('./helpers');

//Define the handlers
var handlers = {}

//Users
handlers.users = function(data, callback){
	var acceptableMethods = ['post', 'get', 'put', 'delete'];
	if(acceptableMethods.indexOf(data.method) > -1) {
		handlers._users[data.method](data, callback);
	} else {

		//Method not allowed, call back http 405
		callback(405);
	}
};

//Container fopr the users submethods
handlers._users = {};

//Users - post
//Required data: firstName, lastName, phone, password, tosAgreement
//Optional data: none
handlers._users.post = function(data, callback) {
	//Check that all required fields are filled out
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;
	var tosAgreement = typeof(data.payload.tosAgreement) == 'boolean' && data.payload.tosAgreement == true ? true : false;

	if(firstName && lastName && phone && password && tosAgreement){
		//Make sure that the user does not already exist
		_data.read('users', phone, function(err,data){
			if(err){
				//Hash the password
				console.log(password);
				var hashedPassword = helpers.hash(password);

				//Create the user object
				if(hashedPassword){
					var userObject = {
					'firstName' : firstName,
					'lastName' : lastName,
					'phone' : phone,
					'hashedPassword' : hashedPassword,
					'tosAgreement' : true
					};

					//Store the user
					_data.create('users', phone, userObject, function(err){
						if(!err){
							callback(200);
						} else {
							console.log(err);
							callback(500,{'Error' : 'Could not create the new user'});
						}
					});
				} else {
					console.log(hashedPassword);
					callback(500, {'Error' : 'Could not hash the user\'s password'});
				}
				
			} else{
				callback(400, {'Error' : 'A user with that phone number already exists'});
			}
		});
	} else {
		callback(400, {'Error' : 'Missing required fields'});
	}
};

//Users - get
//Required data: phone
//Optional data: none
//@TODO only let authenticated users access their own object
handlers._users.get = function(data, callback) {
	//Check that the phone number provided is valid
	var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
	if(phone) {
		_data.read('users', phone, function(err, data){
			if(!err && data){
				// Remove the hashed password from the user object before returning it
				delete data.hashedPassword;
				callback(200, data);
			} else {
				//User not found, callback 404
				callback(404);
			}
		});

	} else {
		callback(400, {'Error' : 'Missing required data field'});
	}
};

//Users - put
//Required data : phone
//Optiona data : firstName, lastName, password (at least one must be specified)
//@TODO only let an authenticated user update their own object, don't let them update anyone else's
handlers._users.put = function(data, callback) {
	//Check for the required field
	var phone = typeof(data.payload.phone) == 'string' && data.payload.phone.trim().length == 10 ? data.payload.phone.trim() : false;

	//Check for the optional fields
	var firstName = typeof(data.payload.firstName) == 'string' && data.payload.firstName.trim().length > 0 ? data.payload.firstName.trim() : false;
	var lastName = typeof(data.payload.lastName) == 'string' && data.payload.lastName.trim().length > 0 ? data.payload.lastName.trim() : false;
	var password = typeof(data.payload.password) == 'string' && data.payload.password.trim().length > 0 ? data.payload.password.trim() : false;

	//Error if the phone is invalid
	if(phone){
		if(firstName || lastName || password){
			//Find the user
			_data.read('users', phone, function(err, userData){
				if(!err && data){
					//Update the fields necessary
					if(firstName){
						userData.firstName = firstName;
					}
					if(lastName){
						userData.lastName = lastName;
					}
					if(password){
						userData.hashedPassword = helpers.hash(password);
					}
					//Store the new updates
					_data.update('users', phone, userData, function(err){
						if(!err){
							callback(200);
						} else{
							console.log(err);
							callback(500, {'Error' : 'Could not update the user data'});
						}
					});
				} else{
					callback(400, {'Error' : 'The specified user does not exist'});
				}
			});
		} else {
			callback(400, {'Error' : 'Missing field to update'});
		}
	} else {
		console.log(phone);
		callback(400, {'Error' : 'Missing required field'});
	}

};

//Users - delete
//Required field : phone
//@TODO : Only let an authenticated user delete their own object, no one else's
//@TODO : Cleanup any other data files associated with them
handlers._users.delete = function(data, callback) {
	//Check that the phone number is valid
	var phone = typeof(data.queryStringObject.phone) == 'string' && data.queryStringObject.phone.trim().length == 10 ? data.queryStringObject.phone.trim() : false;
	
	if(phone) {
		_data.read('users', phone, function(err, data){
			if(!err && data){
				_data.delete('users', phone, function(err){
					if(!err){
						callback(200);
					} else{
						callback(500, {'Error' : 'Could not delete the specified user'});
					}
				})
			} else {
				//User not found, callback 404
				callback(400, {'Error' : 'Could not find the specified user'});
			}
		});

	} else {
		callback(400, {'Error' : 'Missing required data field'});
	}
};

//Write the sample handler
handlers.ping = function(data, callback) {
	callback(200);
};


//Define not found handler
handlers.notFound = function(data, callback) {
	callback(404);
};

//Export the handlers
module.exports = handlers;