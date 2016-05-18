var common = require("./common.js");

Parse.Cloud.beforeSave("Question", function(request, response) {

	Parse.Cloud.useMasterKey();

	var question = request.object;
	if(question.dirty("isActive"))
		question.set("isActiveChanged", true);
	else
		question.set("isActiveChanged", false);
	response.success();
});

Parse.Cloud.afterSave("Question", function(request) {
	Parse.Cloud.useMasterKey();
	var question = request.object;
	var isNew = common.isNewObject(question);
	var isActiveChanged = question.get("isActiveChanged");
	if(!isNew && !isActiveChanged) {
		console.log("Nothing to be done");
		return;
	}
	var catQuery = new Parse.Query("CategoryStats")
							.equalTo("category", question.get("category"));
	var subQuery = new Parse.Query("SubjectStats")
							.equalTo("subject", question.get("subject"));
	catQuery.first({
		success: function(catStats) {
			subQuery.first({
				success: function(subStats) {

					if(isNew) {
						catStats.increment("count", 1);
						subStats.increment("count", 1);
					}

					if( (!isNew && isActiveChanged) || (isNew && question.get("isActive")) ) {
						var amount = 0;
						if(question.get("isActive"))
							amount = 1;
						else
							amount = -1;
						catStats.increment("numActive", amount);
						subStats.increment("numActive", amount);
						if(!question.get("inBundle")) {
							catStats.increment("numActiveNotInBundle", amount);
						}
					}

					question.set("isActiveChanged", false);
					var promises = [];
					promises.push(catStats.save());
					promises.push(subStats.save());
					promises.push(question.save());
					Parse.Promise.when(promises).then(
						function(success) {
							return;
						}, function(error) { console.log(error); }
					);
				}, error: function(error) { console.log(error); }
			});
		}, error: function(error) { console.log(error); }
	});
});

Parse.Cloud.afterDelete("Question", function(request) {
	Parse.Cloud.useMasterKey();
	var question = request.object;
	var catQuery = new Parse.Query("CategoryStats")
							.equalTo("category", question.get("category"));
	var subQuery = new Parse.Query("SubjectStats")
							.equalTo("subject", question.get("subject"));
	catQuery.first({
		success: function(catStats) {
			subQuery.first({
				success: function(subStats) {

					catStats.increment("count", -1);
					subStats.increment("count", -1);
					if(question.get("isActive")) {
						catStats.increment("numActive", -1);
						subStats.increment("numActive", -1);
						if(!question.get("inBundle")) {
							catStats.increment("numActiveNotInBundle", -1);
						}
					}
					var promises = [];
					promises.push(catStats.save());
					promises.push(subStats.save());
					Parse.Promise.when(promises).then(
						function(success) {
							return;
						}, function(error) { console.log(error); }
					);
				}, error: function(error) { console.log(error); }
			});
		}, error: function(error) { console.log(error); }
	});
});