var common = require('./common.js');

Parse.Cloud.define("addStudent", function(request, response) {

	Parse.Cloud.useMasterKey();
	var tutorPublicDataId = request.params.tutorPublicDataId;
	var studentPublicDataId = request.params.studentPublicDataId;
	var query = new Parse.Query("PublicUserData");
	query.get(tutorPublicDataId, {
	  success: function(publicTutorData) {
	    // The object was retrieved successfully.
	  	var tutor = publicTutorData.get("tutor");
	  	tutor.fetch({ useMasterKey: true,
	  		success: function(tutor) {
	  			var privateTutorData = tutor.get("privateTutorData");
	  			privateTutorData.fetch({ useMasterKey: true,
	  				success: function(privateTutorData) {
					    // The object was retrieved successfully.
						var studentQuery = new Parse.Query("PublicUserData");
						studentQuery.get(studentPublicDataId, {
						  success: function(studentPublicData) {
						    // The object was retrieved successfully.
							privateTutorData.addUnique("students", studentPublicData);

						  	// Notification to tutor
						  	var NotificationTutor = Parse.Object.extend("NotificationTutor");
							var notificationTutor = new NotificationTutor();
							notificationTutor.set("tutorFor", publicTutorData);
							notificationTutor.set("userFrom", studentPublicData);
							notificationTutor.set("type", "ACCEPT_FROM_STUDENT");
							notificationTutor.set("firstSeenAt", null);

							notificationTutor.save(null, {
							  success: function(notificationTutor) {

							  	// Add to tutor's notication relation
								var notificationsRelation = privateTutorData.relation("notifications");
								notificationsRelation.add(notificationTutor);

								privateTutorData.save(null, {
								  success: function(privateTutorData) {
								    // Execute any logic that should take place after the object is saved.
								    console.log('Student added to students in PrivateTutorData with objectId: ' + privateTutorData.id);
								    var tutorBaseUserId = privateTutorData.get("baseUserId");
			    					var studentBaseUserId = studentPublicData.get("baseUserId");
								    common.addOrRemoveTutorFromRole(tutorBaseUserId, studentBaseUserId, true).then(
								    	function(success) {
								    		response.success('Tutor added to tutor role for student with baseUserId ' + studentBaseUserId);
								    	}, function(error) { response.error(error);
							    	});
								  },
								  error: function(privateTutorData, error) {
								    // Execute any logic that should take place if the save fails.
								    // error is a Parse.Error with an error code and message.
								    response.error('Failed to save when adding student to students in PrivateTutorData, with error code: ' + error.message);
								  }
								});
							  },
							  error: function(notificationTutor, error) {
						    	response.error('Failed to save new NotificationTutor, with error code: ' + error.message);
							  }
							});
						  },
						  error: function(studentPublicData, error) {
						    // The object was not retrieved successfully.
						    // error is a Parse.Error with an error code and message.
						    response.error('Failed to get studentPublicData, with error code: ' + error.message);
						  }
						});
	  				},
	  				error: function() {
					    response.error('Failed to fetch privateTutorData, with error code: ' + error.message);
	  				}
	  			});
	  		},
	  		error: function() {
			    response.error('Failed to fetch tutor, with error code: ' + error.message);
	  		}
	  	});
	  },
	  error: function(privateTutorData, error) {
	    // The object was not retrieved successfully.
	    // error is a Parse.Error with an error code and message.
	    response.error('Failed to get PrivateTutorData, with error code: ' + error.message);
	  }
	});
});