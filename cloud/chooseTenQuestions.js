var common = require('./common.js');

Parse.Cloud.define("chooseTenQuestions", function(request, response) {
	
	Parse.Cloud.useMasterKey();

	var query = new Parse.Query("Question").equalTo("isActive", true).equalTo("inBundle", false).limit(10)
		.include("questionContents").include("questionData");
	query.find({ useMasterKey: true,
		success: function(questions) {
			response.success(questions);
		}, error: function(error) { response.error(error); }
	});
});