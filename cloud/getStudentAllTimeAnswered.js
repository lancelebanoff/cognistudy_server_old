var common = require('./common.js');

Parse.Cloud.define("getStudentAllTimeAnswered", function(request, response) {

	var studentBaseId = request.params.studentBaseId;

	var query = new Parse.Query("StudentTotalRollingStats").equalTo("baseUserId", studentBaseId);
	query.first({ useMasterKey: true,
		success: function(stats) {
			var totalAllTime = stats.get("totalAllTime");
			response.success(totalAllTime);
		}, error: function(error) { response.error(error); }
	});
});