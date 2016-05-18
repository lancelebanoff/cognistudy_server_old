var common = require("./common.js");

Parse.Cloud.define("deleteTestQuestions", function(request, response) {

	Parse.Cloud.useMasterKey();

	var baseUserId = request.params.baseUserId;

	var classes = ["Question", "QuestionBundle", "QuestionContents"];
	var promises = [];
	for(var i=0; i<classes.length; i++) {
		promises.push(common.deleteAllObjectsOn(classes[i], "test", true));
	}

	Parse.Promise.when(promises).then(function(results) {
		response.success("All test questions deleted");
	},
	function(errors) {
		for(var e=0; e<errors.length; e++) {
			console.log(errors[e]);
		}
		response.error("Error deleting test questions");
	});
});

