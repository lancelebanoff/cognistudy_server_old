// This is just for testing. You shouldn't actually call this function in the app
var common = require("./common.js")
Parse.Cloud.define("deleteAllObjectsFromClasses", function(request, response) {
	Parse.Cloud.useMasterKey();
	var classes = request.params.classes;
	var key = request.params.key;
	var value = request.params.value;
	common.deleteAllObjectsFromClasses(classes, key, value);
	response.success("Done!");
});