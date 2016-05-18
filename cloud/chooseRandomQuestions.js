var common = require('./common.js');

Parse.Cloud.define("chooseThreeQuestions", function(request, response) {

	var challengeUserDataId = request.params.challengeUserDataId;
	var challengeId = request.params.challengeId;
	var categories = request.params.categories;

	var query = new Parse.Query("ChallengeUserData")
	.include("publicUserData.student.studentCategoryRollingStats.answeredQuestionIds")

	query.get(challengeUserDataId, {
		success: function(challengeUserData) {
			var student = challengeUserData.get("publicUserData").get("student");

			console.log("Before validity check");
			getAnsweredQuestionIdsIfValid(student, challengeId, categories).then(
				function(answeredQuestionIds) {

					console.log("Got to answeredQuestionIds");
					printAnsweredQuestionIds(answeredQuestionIds);
					getRandomQuestion(categories, answeredQuestionIds, false).then(
						function(firstQuestion) {
							questionToString(firstQuestion, 1);
							// response.success("Intermediate finish");
							if(firstQuestion.get("inBundle")) {
								var bundle = firstQuestion.get("bundle");
								console.log("Bundle id = " + bundle.id);
								bundle.fetch({
									success: function(bundle) {
										var unfetchedQuestions = bundle.get("questions");
										console.log("Size of bundle questions = " + unfetchedQuestions.length);
										Parse.Object.fetchAllIfNeeded(unfetchedQuestions, {
											success: function(questions) {
												for(var i=0; i<questions.length; i++) {
													questionToString(questions[i], i);
												}
												if(questions.length < 3) {
													response.error("Error: bundle did not contain 3 questions"); //TODO: Just grab another question here
												}
												challengeUserData.set("curTurnQuestions", questions);
												response.success(questions);
											}, error: function(error) { response.error(error); }
										});
									}, error: function(error) { response.error(error); }
								});
							}
							else {
								answeredQuestionIds.push(firstQuestion.id);
								printAnsweredQuestionIds(answeredQuestionIds);
								getRandomQuestion(categories, answeredQuestionIds, true).then(
									function(secondQuestion) {
										questionToString(secondQuestion, 2);
										answeredQuestionIds.push(secondQuestion.id);
										printAnsweredQuestionIds(answeredQuestionIds);
										getRandomQuestion(categories, answeredQuestionIds, true).then(
											function(thirdQuestion) {
												questionToString(thirdQuestion, 3);
												var questions = [];
												questions.push(firstQuestion);
												questions.push(secondQuestion);
												questions.push(thirdQuestion);
												challengeUserData.set("curTurnQuestions", questions);
												response.success(questions);
											}, function(error) { response.error(error);
											});
									}, function(error) { response.error(error);
									});
							}
						}, function(error) { response.error(error);
						});
				// }, function(error) { response.error(error);
				}, function(error) { console.log("Error in validity check"); response.error(error);
			});
}, error: function(error) { }
});
});

function questionToString(question, num) {
	question.fetch({
		success: function(question) {
			console.log("Question " + num + " objectId = " + question.id);
			console.log("Question " + num + " inBundle = " + question.get("inBundle"));
		}, error: function(error) { }
	});
}

function printAnsweredQuestionIds(answeredQuestionIds) {
	var s = "answeredQuestionIds: ";
	for(var i=0; i<answeredQuestionIds.length; i++) {
		s = s.concat(answeredQuestionIds[i] + ", ");
	}
	console.log(s);
}

function getRandomQuestion(categories, answeredQuestionIds, skipBundles) {

	var promise = new Parse.Promise();

	var countQuery = new Parse.Query("CategoryStats")
	.containedIn("category", categories);

	countQuery.find({ useMasterKey: true,
		success: function(counts) {

			var numRemaining;

			Parse.Object.fetchAll(counts).then(

				function(counts) {
					var numAnswered = answeredQuestionIds.length;
					var total = 0;
					for(var i=0; i<counts.length; i++) {
						countObject = counts[i];
						console.log(countObject.get("category") + " numActive " + countObject.get("numActive"));
						if(!skipBundles)
							total += countObject.get("numActive");
						else
							total += countObject.get("numActiveNotInBundle");
					}
					console.log("Total = " + total);
					numRemaining = total - numAnswered;
					console.log("numRemaining = " + numRemaining);

					var skipNum = Math.max(0, Math.floor(Math.random()*numRemaining));

					console.log("skipNum = " + skipNum);

					var query = new Parse.Query("Question")
							.equalTo("isActive", true)
							.equalTo("test", true) ////////////////////////////////////TODO: Remove later
							.containedIn("category", categories)
							.notContainedIn("objectId", answeredQuestionIds)
							.skip(skipNum)
							.limit(1)
							.include("bundle")
							.include("questionContents");

							if(skipBundles) {
								query = query.equalTo("inBundle", false);
							}

							query.first({
								success: function(result) {
									// console.log("In getRandomQuestion: questionId = " + result.id);
									promise.resolve(result);
								}, error: function(error) { promise.reject("Error getting random question"); }
							});
				}, function(error) { promise.reject(error); }
			);
		}, error: function(error) { promise.reject("Error getting QuestionCount"); }
	});
	return promise;
}

function getAnsweredQuestionIdsIfValid(student, challengeId, categories) {

	Parse.Cloud.useMasterKey();

	console.log("Inside getAQIIV");
	var baseUserId = student.get("baseUserId");
	var promise = new Parse.Promise();
	isRequestValid(challengeId, baseUserId).then(
		function(isValid) {
			if(!isValid) {
				console.log("getAQIIV: Invalid request");
				promise.reject("Not a valid request");
				return;
			}
			var rollingStatsList = student.get("studentCategoryRollingStats");
			var rollingStatsToFetch = [];
			for(var i=0; i<rollingStatsList.length; i++) {
				var rollingStats = rollingStatsList[i];
				var cat = rollingStats.get("category");
				for(var j=0; j<categories.length; j++) {
					if(categories[j] == cat) {
						rollingStatsToFetch.push(rollingStats);
						break;
					}
				}
			}
			Parse.Object.fetchAll(rollingStatsToFetch, {
				success: function(fetchedRollingStats) {
					var ansQuestionsToFetch = [];
					for(var i=0; i<fetchedRollingStats.length; i++) {
						var rollingStats = fetchedRollingStats[i];
						var ansQuestionIdsObject = rollingStats.get("answeredQuestionIds");
						ansQuestionsToFetch.push(ansQuestionIdsObject);
					}
					Parse.Object.fetchAll(ansQuestionsToFetch, {
						success: function(fetchedAnsQuesIds) {
							var list = [];
							for(var i=0; i<fetchedAnsQuesIds.length; i++) {
								var ansQuestionIdsObject = fetchedAnsQuesIds[i];
								var questionIds = ansQuestionIdsObject.get("questionIds");
								console.log("Size of questionIds = " + questionIds.length);
								list.push.apply(list, questionIds);
							}
							console.log("list size = " + list.length);
							promise.resolve(list);
						}, error: function(error) { promise.reject(error); }
					});
				}, error: function(error) { promise.reject(error); }
			});
		}, function(error) { promise.reject(error);
		});
return promise;
}

function isRequestValid(challengeId, baseUserId) {
	//TODO: Also check if the questions have already been chosen for this user
	console.log("Inside isRequestValid");
	var promise = new Parse.Promise();
	var query = new Parse.Query("Challenge");
	query.get(challengeId, {
		success: function(challenge) {
			if(challenge.get("curTurnUserId") == baseUserId) {
				console.log("Valid request");
				promise.resolve(true);
			}
			else {
				console.log("Invalid request");
				promise.resolve(false);
			}

		}, error: function(error) { promise.reject("Error getting challenge with challengeId = " + challengeId); }
	});
	return promise;
}