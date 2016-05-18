var common = require("./common.js");

Parse.Cloud.define("assignQuestion", function(request, response) {
	
	Parse.Cloud.useMasterKey();

	var baseUserId = request.params.baseUserId;
	var suggestedQuestionId = request.params.suggestedQuestionId;

	var suggestedQuestionQuery = new Parse.Query("SuggestedQuestion");
	suggestedQuestionQuery.get(suggestedQuestionId, {
		success: function(suggestedQuestion) {
			var privateStudentDataQuery = new Parse.Query("PrivateStudentData");
			privateStudentDataQuery.equalTo("baseUserId", baseUserId)
			.first({
				success: function(privateStudentData) {
					privateStudentData.relation("assignedQuestions").add(suggestedQuestion);
					privateStudentData.save({
						success: function(saved) {
							var data = createNotificationData();
							common.sendPushNotification(baseUserId, data).then(
								function(success) {
									response.success();
								}, function(error) {
									response.error(error);
							});
						}, error: function(error) {
							response.error(error);
						}
					});
				}, error: function(error) {
					response.error(error);
				}
			});
		}, error: function(error) {
			response.error(error);
		}
	});
});

function createNotificationData() {
	var data = {};
	data.title = "Assigned Question";
	data.alert = "New Assigned Question";
	data.ACTIVITY = "SUGGESTED_QUESTIONS_LIST_ACTIVITY";
	data.FRAGMENT = "SUGGESTED_QUESTIONS_LIST_FRAGMENT";
	return data;
}
