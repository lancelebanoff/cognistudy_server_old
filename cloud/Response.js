var common = require("./common.js");

Parse.Cloud.afterSave("Response", function(request) {
	Parse.Cloud.useMasterKey();
	var response = request.object;
	var isNew = common.isNewObject(response);
	if(!isNew)
		return;
	var correct = response.get("correct");
	var question = response.get("question");
	var baseUserId = response.get("baseUserId");
	question.fetch({
		success: function(question) {

			var promises = [];

			var category = question.get("category");
			var subject = question.get("subject");
			promises.push(incrementCatAndSubStats(category, subject, correct));
			promises.push(addResponseToQuestionData(response, question, correct));
			promises.push(common.setPrivateWriteTutorReadACL(response, baseUserId));

			Parse.Promise.when(promises)
				.then(function(success) {
					console.log("Response afterSave completed successfully!");
				},
				function(errors) {
					for(var e=0; e<errors.length; e++) {
						console.error(errors[e]);
					}
				});
		}, error: function(error) { console.error("Error fetching question"); }
	});
});

function addResponseToQuestionData(response, question, correct) {

	Parse.Cloud.useMasterKey();

	response.fetch({
		success: function(fetchedResponse) {
			var questionData = question.get("questionData");
			questionData.fetch({
				success: function(questionData) {
					increment(questionData, correct);
					questionData.relation("responses").add(fetchedResponse);
					return questionData.save();
				}, error: function(error) { return Parse.Promise.error("Error fetching questionData"); }
			});
		}, error: function(error) { return Parse.Promise.error("Error fetching response"); }
	});
}

function incrementCatAndSubStats(category, subject, correct) {

	Parse.Cloud.useMasterKey();

	var catQuery = new Parse.Query("CategoryStats").equalTo("category", category);
	catQuery.first({
		success: function(catStats) {

			increment(catStats, correct);
			catStats.save().then(
				function(success) {

					var subQuery = new Parse.Query("SubjectStats").equalTo("subject", subject);
					subQuery.first({
						success: function(subStats) {

							increment(subStats, correct);
							return subStats.save();

						}, error: function(error) { return Parse.Promise.error("Error retrieving SubjectStats"); }
					});
				}, function(error) { return Parse.Promise.error("Error saving CategoryStats"); 
			});
		}, error: function(error) { return Parse.Promise.error("Error retrieving CategoryStats"); }
	});
}

function increment(object, correct) {
	object.increment("totalResponses");
	if(correct) {
		object.increment("correctResponses");
	}
	return;
}