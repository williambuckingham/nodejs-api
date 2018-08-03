/*
 *
 *Create and export configuration variables
 *
 */

 //Container for all the environments 
 var environments = {};

 //Staging environment

 environments.staging = {
 	'httpPort' : 3000,
 	'httpsPort' : 3001,
 	'envName' : 'staging'
 };

 // Production environment

 environments.production = {
 	'httpPort' : 5000,
 	'httpsPort' : 5001,
 	'envName' : 'production'
 };

 //Determine which environment to export

 var currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';


 //Check the environment set is one of our environments
 var environmentToExport = typeof(environments[currentEnvironment]) == 'object' ? environments[currentEnvironment] : environments.staging;

 //Export the module
 module.exports = environmentToExport;