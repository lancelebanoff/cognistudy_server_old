var common = require('./common.js');

Parse.Cloud.define("questionsByTutor", function(request, response) {

	var author = request.params.author;

	var contentsQuery = new Parse.Query("QuestionContents").equalTo("authorId", author);
	var query = new Parse.Query("Question")
		.descending("createdAt")
		.matchesKeyInQuery("questionContents", "objectId", contentsQuery)
		.include("questionContents").include("questionData.reviews").include("bundle");
	query.find({ useMasterKey: true,
		success: function(questions) {
			response.success(questions);
		}, error: function(error) { response.error(error); }
	});
});