var common = require('./common.js');

Parse.Cloud.define("getSubStats", function(request, response) {

	var subjectName = request.params.subjectName;

	var query = new Parse.Query("SubjectStats").equalTo("subject", subjectName);
	query.first({ useMasterKey: true,
		success: function(stats) {
			response.success(stats);
		}, error: function(error) { response.error(error); }
	});
});