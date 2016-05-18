//changed
var common = require('./cloud/common.js');

Parse.Cloud.define("addTutor", function(request, response) {

	var privateStudentDataId = request.params.privateStudentDataId;
	var tutorPublicDataId = request.params.tutorPublicDataId;
	var query = new Parse.Query("PrivateStudentData");
	query.get(privateStudentDataId, {
		useMasterKey: true,
	  success: function(privateStudentData) {
	    // The object was retrieved successfully.
		var tutorQuery = new Parse.Query("PublicUserData");
		tutorQuery.get(tutorPublicDataId, {
		  success: function(tutorPublicData) {
		    // The object was retrieved successfully.
			privateStudentData.addUnique("tutors", tutorPublicData);
			privateStudentData.remove("requestsToTutors", tutorPublicData);

			privateStudentData.save(null, {
				useMasterKey: true,
			  success: function(privateStudentData) {
			    // Execute any logic that should take place after the object is saved.
			  	var successStr = 'Tutor added to tutors in PrivateStudentData with objectId: ' + tutorPublicData.id;

			  	var tutorBaseUserId = tutorPublicData.get("baseUserId");
			  	var studentBaseUserId = privateStudentData.get("baseUserId");

			  	var promises = [];
			  	promises.push(common.addOrRemoveTutorFromRole(tutorBaseUserId, studentBaseUserId, true));
			  	promises.push(sendTutorAcceptNotification(tutorBaseUserId, studentBaseUserId));

			  	Parse.Promise.when(promises).then(
			  		function(success) {
			    		response.success(successStr);
			  		}, function(error) { 
			    		response.error(error);
			  	});
			  },
			  error: function(privateStudentData, error) {
			    // Execute any logic that should take place if the save fails.
			    // error is a Parse.Error with an error code and message.
			    response.error('Failed to save when adding tutor to tutors in PrivateStudentData, with error code: ' + error.message);
			  }
			});
		  },
		  error: function(tutorPublicData, error) {
		    // The object was not retrieved successfully.
		    // error is a Parse.Error with an error code and message.
		    response.error('Failed to get tutorPublicData, with error code: ' + error.message);
		  }
		});
	  },
	  error: function(privateStudentData, error) {
	    // The object was not retrieved successfully.
	    // error is a Parse.Error with an error code and message.
	    response.error('Failed to get PrivateStudentData, with error code: ' + error.message);
	  }
	});
});

function sendTutorAcceptNotification(senderBaseUserId, receiverBaseUserId) {

	var promise = new Parse.Promise();
	var query = new Parse.Query("PublicUserData")
											.equalTo("baseUserId", senderBaseUserId);

	query.first({
		success: function(publicUserData) {

			var senderName = publicUserData.get("displayName");

			var data = {};
			data.title = "Tutor Request Accepted!";
			data.alert = senderName.toString() + " accepted your tutor request";
			data.ACTIVITY = "MAIN_ACTIVITY";
			//Don't include fragment because we don't want MainFragment to refresh

			common.sendPushNotification(receiverBaseUserId, data).then(
				function(success) {
			  	console.log("tutor accept notification sent successfully");
					promise.resolve();
				}, function(error) {
			  	console.error("error sending tutor accept notification");
					promise.reject(error);
				});
		}, error: function(error) { promise.reject(error); }
	});
	return promise;
}