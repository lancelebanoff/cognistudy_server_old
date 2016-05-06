var common = require('./common.js');

Parse.Cloud.define("tutorRequestToStudent", function(request, response) {

	Parse.Cloud.useMasterKey();
	var publicStudentDataId = request.params.publicStudentDataId;
	var publicTutorDataId = request.params.publicTutorDataId;
	var query = new Parse.Query("PublicUserData")
		.include("student.privateStudentData");
	query.get(publicStudentDataId, {
	  success: function(publicStudentData) {
  		var privateStudentData = publicStudentData.get("student").get("privateStudentData");

	  	// Main code
		var tutorQuery = new Parse.Query("PublicUserData");
		tutorQuery.get(publicTutorDataId, {
		  success: function(publicTutorData) {
			privateStudentData.addUnique("requestsFromTutors", publicTutorData);

			privateStudentData.save(null, {
			  success: function(privateStudentData) {
			  	var successStr = 'Tutor added to RequestsFromTutors in PrivateStudentData with objectId: ' + publicTutorData.id;
			  	sendTutorRequestNotification(publicTutorData.get("baseUserId"), publicStudentData.get("baseUserId")).then(
			  		function(success) {
			  			console.log("tutor request notification sent successfully");
			    		response.success(successStr);
			  		}, function(error) { 
			  			console.error("error sending tutor request notification");
			    		response.success(successStr);
			  	});
			  },
			  error: function(privateStudentData, error) {
			    response.error('Failed to save when adding tutor to RequestsFromTutors in PrivateStudentData, with error code: ' + error.message);
			  }
			});
		  },
		  error: function(publicTutorData, error) {
		    response.error('Failed to get publicTutorData, with error code: ' + error.message);
		  }
		});
	  },
	  error: function(publicStudentData, error) {
	    response.error('Failed to get publicStudentData, with error code: ' + error.message);
	  }
	});
});

function sendTutorRequestNotification(senderBaseUserId, receiverBaseUserId) {

	Parse.Cloud.useMasterKey();

	var promise = new Parse.Promise();
	var query = new Parse.Query("PublicUserData")
											.equalTo("baseUserId", senderBaseUserId);

	query.first({
		success: function(publicUserData) {

			var senderName = publicUserData.get("displayName");

			var data = {};
			data.title = "New Tutor Request!";
			data.alert = senderName.toString() + " sent you a tutor request";
			data.ACTIVITY = "MAIN_ACTIVITY";
			data.FRAGMENT = "MAIN_FRAGMENT";

			common.sendPushNotification(receiverBaseUserId, data).then(
				function(success) {
					promise.resolve();
				}, function(error) {
					promise.reject(error);
				});
		}, error: function(error) { promise.reject(error); }
	});
	return promise;
}