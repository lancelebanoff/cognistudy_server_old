Parse.Cloud.define("deleteChallenge", function(request, response) {
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query("Challenge");
	var id = request.params.objectId;
	query.equalTo("objectId", id);
	query.find({ useMasterKey: true,
		success: function(results) {
			if(results.length == 0) {
				response.success("no challenge found for id" + id);
			}
			else {
				var objects = [];
				var challenge = results[0];
				objects.push(challenge);
				var user1Data = challenge.get("user1Data");
				user1Data.fetch({ useMasterKey: true,
					success: function(user1Data) {
						objects.push(user1Data);
						var user2Data = challenge.get("user2Data");
						if(user2Data !== undefined) {
							user2Data.fetch({ useMasterKey: true,
								success: function(user2Data) {
									objects.push(user2Data);
									Parse.Object.destroyAll(objects).then(function(success) {
										response.success("All objects deleted");
									}, function(error) {
										response.error("destroyAll failed");
									});
								},
								error: function() {
									response.error("user2Data lookup failed");
								}
							});
						}
						else {
							Parse.Object.destroyAll(objects).then(function(success) {
								response.success("All objects deleted");
							}, function(error) {
								response.error("destroyAll failed");
							});
						}
					},
					error: function() {
						response.error("user1Data lookup failed");
					}
				});
			}
		},
		error: function() {
			response.error("challenge lookup failed");
		}
	});
});
