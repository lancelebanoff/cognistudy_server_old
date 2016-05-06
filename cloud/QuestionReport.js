Parse.Cloud.beforeSave("QuestionReport", function(request, response) {

	Parse.Cloud.useMasterKey();

	var report = request.object;

	var date = new Date();
	date.setDate(date.getDate() - 1);

	var query = new Parse.Query("QuestionReport");
	query.equalTo("baseUserId", report.get("baseUserId"));
	query.equalTo("questionId", report.get("questionId"));
	query.count({
		success: function(count) {

			if(count > 0) {
				response.error("User already reported this question");
			}

			query = new Parse.Query("QuestionReport");
			query.equalTo("baseUserId", report.get("baseUserId"));
			query.greaterThan("createdAt", date);
			query.count({

				success: function(overallCount) {
					if(overallCount >= 5) {
						response.error("Too many reports in one day");
						return;
					}
					response.success();
				}, error: function(error) {
					response.error(error);
				}
			});
		}, error: function(error) { response.error(error); }
	});
});

Parse.Cloud.afterSave("QuestionReport", function(request) {

	Parse.Cloud.useMasterKey();

	var report = request.object;
	var questionId = report.get("questionId");

	var query = new Parse.Query("QuestionReport");
	query.equalTo("questionId", report.get("questionId"));
	query.count({

		success: function(count) {
			var newStatus;
			if(count >= 2) {
				newStatus = "REPORTED_PENDING";
			}
			else {
				newStatus = "REPORTED_APPROVED";
			}
			var questionQuery = new Parse.Query("Question");
			questionQuery.include("questionData");
			questionQuery.get(questionId, {

				success: function(question) {
					var data = question.get("questionData");
					data.set("reviewStatus", newStatus);
					data.save({
						success: function(success) {
							console.log("QuestionReport afterSave completed successfully");
						}, error: function(error) { console.error("QuestionReport afterSave: error saving questionData"); }
					});
				}, error: function(error) { console.error("QuestionReport afterSave: error getting question"); }
			});
		}, error: function(error) { console.error("QuestionReport afterSave: error getting QuestionReport count"); } 
	});
});