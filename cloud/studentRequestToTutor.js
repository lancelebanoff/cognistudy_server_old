var common = require('./common.js');

Parse.Cloud.define("studentRequestToTutor", function(request, response) {

	Parse.Cloud.useMasterKey();
	var publicTutorDataId = request.params.publicTutorDataId;
	var publicStudentDataId = request.params.publicStudentDataId;
	var query = new Parse.Query("PublicUserData")
		.include("tutor.privateTutorData");
	query.get(publicTutorDataId, {
	  success: function(publicTutorData) {
  		var privateTutorData = publicTutorData.get("tutor").get("privateTutorData");

	  	// Main code
		var studentQuery = new Parse.Query("PublicUserData");
		studentQuery.get(publicStudentDataId, {
		  success: function(publicStudentData) {
			privateTutorData.addUnique("requestsFromStudents", publicStudentData);

		  	// Notification to tutor
		  	var NotificationTutor = Parse.Object.extend("NotificationTutor");
			var notificationTutor = new NotificationTutor();
			notificationTutor.set("tutorFor", publicTutorData);
			notificationTutor.set("userFrom", publicStudentData);
			notificationTutor.set("type", "REQUEST_FROM_STUDENT");
			notificationTutor.set("firstSeenAt", null);

			notificationTutor.save(null, {
			  success: function(notificationTutor) {

			  	// Add to tutor's notication relation
				var notificationsRelation = privateTutorData.relation("notifications");
				notificationsRelation.add(notificationTutor);

				privateTutorData.save(null, {
				  success: function(privateTutorData) {
			    	response.success('Student added to RequestsFromStudents in PrivateTutorData with objectId: ' + publicStudentData.id);
				  },
				  error: function(privateTutorData, error) {
				    response.error('Failed to save when adding student to RequestsFromStudents in PrivateTutorData, with error code: ' + error.message);
				  }
				});
			  },
			  error: function(notificationTutor, error) {
		    	response.error('Failed to save new NotificationTutor, with error code: ' + error.message);
			  }
			});

		  },
		  error: function(publicStudentData, error) {
		    response.error('Failed to get student, with error code: ' + error.message);
		  }
		});
	  },
	  error: function(publicTutorData, error) {
	    response.error('Failed to get publicTutorData, with error code: ' + error.message);
	  }
	});
});