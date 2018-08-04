/*
 *library for storing and editing data
 *
 */

 //Dependencies

 var fs = require('fs');
 var path = require('path');

 //container for module
var lib ={};

//Define the base directory of the lib folder
lib.baseDir = path.join(__dirname, '/.././.data/');

//Write data to a file
lib.create = function(dir, fileName, data, callback){
	//Try to open the file to write to
	fs.open(lib.baseDir+dir+'/'+fileName+'.json', 'wx', function(err, fileDescriptor){
		if(!err && fileDescriptor) {
			//Convert data to string to write to the file
			var stringData = JSON.stringify(data);

			//Write the data to file and close
			fs.writeFile(fileDescriptor, stringData, function(err){
				if(!err){
					fs.close(fileDescriptor, function(err){
						if(!err) {
							callback(false);
						} else {
							callback('error closing new file');
						}
					});
				} else {
					callback('error writing to new file');
				}
			});
		} else {
			callback('Could not create new file, it may already exist');
		}
	});
};

//Read data from a file
lib.read = function(dir, fileName, callback){
	fs.readFile(lib.baseDir+dir+'/'+fileName+'.json', 'utf-8', function(err, data){
		callback(err, data);
	});
};

//Update existing file with new data
lib.update = function(dir, fileName, data, callback){
	//Open the file for writing
	fs.open(lib.baseDir +dir+'/'+fileName+'.json', 'r+', function(err, fileDescriptor){
		if(!err && fileDescriptor) {
			var stringData = JSON.stringify(data);

			//Truncate the contents of the file before writing
			fs.truncate(fileDescriptor, function(err){
				if(!err){
					//Write to the file and close it
					fs.writeFile(fileDescriptor, stringData, function(err){
						if(!err){
							fs.close(fileDescriptor, function(err){
								if(!err){
									callback(false);
								} else{
									callback('error closing the file');
								}
							})
						} else{
							callback('error writing to existing file');
						}
					})
				} else{
					callback('error truncating file');
				}
			}) 
		} else {
			callback('could not open the file for updating, it may not exist yet');
		}
	});
}

//Delete file
lib.delete = function(dir, fileName, callback){
	//Unlink the file
	fs.unlink(lib.baseDir+dir+'/'+fileName+'.json', function(err){
		if(!err){
			callback(false);
		} else{
			callback('there was an error deleting the file');
		}
	})
}





module.exports = lib;