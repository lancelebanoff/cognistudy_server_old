var common = require('./common.js');

Parse.Cloud.define("getSomeCatStats", function(request, response) {

	var catNames = request.params.catNames;
	console.log(catNames);

	var query = new Parse.Query("CategoryStats").containedIn("category", catNames);
	query.find({ useMasterKey: true,
		success: function(stats) {
			response.success(stats);
		}, error: function(error) { response.error(error); }
	});
});