Parse.Cloud.define("deletePinnedObjects", function(request, response) {
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query("PinnedObject");
	var baseUserId = request.params.baseUserId;
	query.equalTo("baseUserId", baseUserId);
	query.find({ useMasterKey: true,
		success: function(results) {
			if(results.length == 0) {
				response.success("no PinnedObjects found for baseUserId " + baseUserId);
			}
			else {
				Parse.Object.destroyAll(results).then(function(success) {
					response.success("All PinnedObjects deleted for baseUserId " + baseUserId);
				}, function(error) {
					response.error("destroyAll PinnedObjects failed");
				});
			}
		},
		error: function() {
			response.error("PinnedObject lookup failed for baseUserId " + baseUserId);
		}
	});
});