var common = require('./common.js');

Parse.Cloud.define("getAllSubStats", function(request, response) {
	var query = new Parse.Query("SubjectStats");
	query.find({ useMasterKey: true,
		success: function(stats) {
			response.success(stats);
		}, error: function(error) { response.error(error); }
	});
});