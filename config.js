/*
 *
 *Create and export configuration variables
 *
 */

 //Container for all the environments 
 var environments = {};

 //Staging environment

 environments.staging = {
 	'port' : 3000,
 	'env_name' : 'staging'
 };

 // Production environment

 environments.production = {
 	'port' : 5000,
 	'env_name' : 'production'
 };

 //Determine which environment to export

 var current_environment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : '';


 //Check the environment set is one of our environments
 var environment_to_export = typeof(environments[current_environment]) == 'object' ? environments[current_environment] : environments.staging;

 //Export the module
 module.exports = environment_to_export;