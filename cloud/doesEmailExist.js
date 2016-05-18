Parse.Cloud.define("doesEmailExist", function(request, response) {
	var query = new Parse.Query("User");
	query.equalTo("email", request.params.email);
	query.find({ useMasterKey: true,
		success: function(results) {
			if(results.length == 0)
				response.success(false);
			else
				response.success(true);
		},
		error: function() {
			response.error("email lookup failed");
		}
	});
});