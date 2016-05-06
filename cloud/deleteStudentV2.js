var common = require("./common.js");

Parse.Cloud.define("deleteStudentV2", function(request, response) {

	Parse.Cloud.useMasterKey();

	var baseUserId = request.params.baseUserId;

	var classes = ["PinnedObject", "PrivateStudentData", "PublicUserData", "Student", "StudentCategoryDayStats",
		"StudentCategoryTridayStats", "StudentCategoryMonthStats", "StudentSubjectDayStats", "StudentSubjectTridayStats",
		"StudentSubjectMonthStats", "StudentCategoryRollingStats", "StudentSubjectRollingStats", "StudentTotalRollingStats", "AnsweredQuestionIds"];

	var promises = [];
	promises.push(common.deleteAllObjectsOn("User", "objectId", baseUserId));
	for(var i=0; i<classes.length; i++) {
		promises.push(common.deleteAllObjectsOn(classes[i], "baseUserId", baseUserId));
	}

	Parse.Promise.when(promises).then(function(results) {
		response.success("All objects deleted");
	},
	function(errors) {
		for(var e=0; e<errors.length; e++) {
			console.log(errors[e]);
		}
		response.error("Error deleting objects");
	});
});

