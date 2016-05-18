Parse.Cloud.define("changeUserId", function(request, response) {
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query(Parse.User);
	var oldObjectId = request.params.oldObjectId;
	query.equalTo("objectId", oldObjectId);
	query.find({ useMasterKey: true,
		success: function(results) {
			if(results.length == 0) {
				response.error("no user found for id" + oldObjectId);
			}
			else {
				var user = results[0];
				user.fetch();
				user.set({ "objectId": request.params.newObjectId })
				.then(function(changedUser) {
					// The save was successful.
					changedUser.save();
					response.success("User ObjectId changed");
				}, function(e) {
					// The save failed.  Error is an instance of Parse.Error.
					response.error(e.message);
				});
			}
		},
		error: function() {
			response.error("user lookup failed");
		}
	});
});