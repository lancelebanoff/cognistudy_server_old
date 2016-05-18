var common = require('./common.js');

Parse.Cloud.define("oldestReportedQuestion", function(request, response) {

	var author = request.params.author;
	var alreadyVisited = request.params.alreadyVisited;
	var isAdmin = request.params.isAdmin;

	var contentsQuery = new Parse.Query("QuestionContents").equalTo("authorId", author);
	var dataQuery1 = new Parse.Query("QuestionData").equalTo("reviewStatus", "REPORTED_APPROVED");
	var dataQuery2 = new Parse.Query("QuestionData").equalTo("reviewStatus", "REPORTED_PENDING");
	var dataQuery = Parse.Query.or(dataQuery1, dataQuery2);
	if(isAdmin) {
		var query = new Parse.Query("Question").notContainedIn("objectId", alreadyVisited)
			.ascending("createdAt").matchesKeyInQuery("questionData", "objectId", dataQuery)
	}
	else {
		var query = new Parse.Query("Question").notContainedIn("objectId", alreadyVisited)
			.ascending("createdAt").matchesKeyInQuery("questionData", "objectId", dataQuery)
			.doesNotMatchKeyInQuery("questionContents", "objectId", contentsQuery);
	}
	query.first({ useMasterKey: true,
		success: function(question) {
			response.success(question);
		}, error: function(error) { response.error(error); }
	});
});