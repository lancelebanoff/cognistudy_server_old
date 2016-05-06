Parse.Cloud.define("deleteStudent", function(request, response) {

	var id = request.params.userId;

	var query = new Parse.Query("PinnedObject");
	query.equalTo("baseUserId", id);
	query.find({ useMasterKey: true,
		success: function(results) {
			// var fetchedResults = results;
			console.log("Size of results = " + results.length);
			Parse.Object.fetchAll(results).then(function(fetchedResults) {
				Parse.Object.destroyAll(fetchedResults).then(function(success) {
					console.log("Pinned objects deleted");
					// response.success("Done!");
				}, function(error) {
					response.error("destroyAll for pinned objects failed");
				});
			}, function(error) {
				response.error("Error fetching pinnedObjects");
			});
		},
		error: function() {
			response.error("PinnedObject lookup failed");
		}
	});

	query = new Parse.Query(Parse.User);
	query.equalTo("objectId", id);
	query.find({ useMasterKey: true,
		success: function(results) {
			if(results.length == 0) {
				response.success("no user found for id" + id);
			}
			else {
				var objects = [];
				var user = results[0];
				objects.push(user);
				var publicUserData = user.get("publicUserData");
				publicUserData.fetch({ useMasterKey: true,
					success: function(publicUserData) {
						objects.push(publicUserData);
						var student = publicUserData.get("student");
						student.fetch({
							success: function(student) {
								objects.push(student);

								var ok = deleteRollingStats(objects, student);
								if(ok)
									console.log("Delete stats returned successfully");
								else
									console.log("Delete stats returned fail");
								console.log("After deleteRollingStats, size of objects is " + objects.length);

								var privateStudentData = student.get("privateStudentData");
								privateStudentData.fetch({ useMasterKey: true,
									success: function(privateStudentData) {
										objects.push(privateStudentData);
										Parse.Object.destroyAll(objects).then(function(success) {
											response.success("All objects deleted");
										}, function(error) {
											response.error("destroyAll failed");
										});
									},
									error: function() {
										response.error("privateStudentData lookup failed");
									}
								});
							},
							error: function() {
								response.error("student fetch failed");
							}
						});
					},
					error: function() {
						response.error("publicUserData fetch failed");
					}
				});
			}
		},
		error: function() {
			response.error("user lookup failed");
		}
	});
});

function deleteRollingStats(objects, student) {
	var catStats = student.get("studentCategoryRollingStats");
	for(var i=0; i<catStats.length; i++) {
		catStats[i].fetch({
			success: function(stats) {
				objects.push(stats);
				var answeredQuestionIds = stats.get("answeredQuestionIds");
				answeredQuestionIds.fetch({
					success: function(result) {
						objects.push(result);
					},
					error: function() {
						console.log("Error fetching answeredQuestionIds");
						return false;
					}
				});
			},
			error: function() {
				console.log("Error fetching studentCategoryRollingStats");
				return false;
			}
		});
	}

	var subStats = student.get("studentSubjectRollingStats");
	console.log("adding studentSubjectRollingStats");
	if(!addFromArray(objects, subStats))
		return false;

	var totStats = student.get("studentTotalRollingStats");
	totStats.fetch({
		success: function(tot) {
			objects.push(tot);
		},
		error: function() {
			console.log("Error fetching studentTotalRollingStats");
		}
	});
	console.log("Size of objects is " + objects.length);

	return true;
}

function addFromArray(objects, array) {
	for(var i=0; i<array.length; i++) {
		array[i].fetch({
			success: function(row) {
				objects.push(row);
			},
			error: function() {
				console.log("Error fetching row");
				return false;
			}
		});
	}
	console.log("Size of objects is " + objects.length);
	return true;
}