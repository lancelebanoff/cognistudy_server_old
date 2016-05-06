var common = require('./common.js');

Parse.Cloud.define("getRandomOpponent", function(request, response) {

	Parse.Cloud.useMasterKey();

	var baseUserId = request.params.baseUserId;

	var userCountQuery = new Parse.Query("UserCount");
	userCountQuery.first({ useMasterKey: true,
		success: function(userCount) {
			var currStudentQuery = new Parse.Query("Student")
					.equalTo("baseUserId", baseUserId);
			currStudentQuery.first({
				success: function(currStudent) {
					var numStudentsRandom = userCount.get("numStudentsRandom");
					if(currStudent.get("randomEnabled")) {
						numStudentsRandom -= 1;
					}
					console.log("numStudentsRandom = " + numStudentsRandom);
					var skipCount = Math.floor(Math.random() * 1.0 * numStudentsRandom);
					console.log("skipCount = " + skipCount);
					var studentQuery = new Parse.Query("Student")
							.equalTo("randomEnabled", true)
							.notEqualTo("baseUserId", baseUserId)
							.skip(skipCount)
							.limit(1);
					studentQuery.first({
						success: function(student) {
							var otherStudentBaseUserId = student.get("baseUserId");
							var pudQuery = new Parse.Query("PublicUserData")
									.equalTo("baseUserId", otherStudentBaseUserId)
									.limit(1);
							pudQuery.first({
								success: function(publicUserData) {
									response.success(publicUserData);
								},
								error: function(error) {
									response.error("Failed to get publicUserData: " + error);
								}
							})
						},
						error: function(error) {
							response.error("Failed to get student: " + error)
						}
					})
				},
				error: function(error) {
					response.error("Failed to get current student: " + error);
				}
			})
		},
		error: function(error) {
			response.error("Failed to get user count: " + error)
		}
	});
});
