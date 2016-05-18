var common = require('./common.js');

Parse.Cloud.define("queryAllQuestions", function(request, response) {

	var subject = request.params.subject;
	var category = request.params.category;

	var query = new Parse.Query("Question").equalTo("isActive", true).include("questionContents").include("questionData").include("bundle");
	if(subject != "") {
		query = query.equalTo("subject", subject);
	}
	if(category != "") {
		query = query.equalTo("category", category);
	}
	query.find({ useMasterKey: true,
		success: function(questions) {
			response.success(questions);
		}, error: function(error) { response.error(error); }
	});
});