var common = require("./common.js");

Parse.Cloud.define("deleteAnalytics", function(request, response) {

	Parse.Cloud.useMasterKey();

	var baseUserId = request.params.baseUserId;

	var classes = ["StudentCategoryDayStats",
		"StudentCategoryTridayStats", "StudentCategoryMonthStats", "StudentSubjectDayStats", "StudentSubjectTridayStats",
		"StudentSubjectMonthStats", "StudentCategoryRollingStats", "StudentSubjectRollingStats", "StudentTotalRollingStats", "AnsweredQuestionIds"];

	var promises = [];
	for(var i=0; i<classes.length; i++) {
		promises.push(common.deleteAllObjectsOn(classes[i], "baseUserId", baseUserId));
	}

	Parse.Promise.when(promises).then(function(results) {
		response.success("All analytics deleted");
	},
	function(errors) {
		for(var e=0; e<errors.length; e++) {
			console.log(errors[e]);
		}
		response.error("Error deleting objects");
	});
});

