var common = require('./common.js');

Parse.Cloud.define("removeStudent", function(request, response) {

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
						var studentQuery = new Parse.Query("PublicUserData");
						studentQuery.get(studentPublicDataId, {
						  success: function(studentPublicData) {
						    // The object was retrieved successfully.
							privateTutorData.remove("students", studentPublicData);
							privateTutorData.remove("requestsFromStudents", studentPublicData);

							privateTutorData.save(null, {
							  success: function(privateTutorData) {
							    // Execute any logic that should take place after the object is saved.
							    
							    console.log('student removed from students in PrivateTutorData with objectId: ' + studentPublicData.id);
							    var tutorBaseUserId = privateTutorData.get("baseUserId");
							    var studentBaseUserId = studentPublicData.get("baseUserId");
							    common.addOrRemoveTutorFromRole(tutorBaseUserId, studentBaseUserId, false).then(
							    	function(success) {
							    		response.success('Tutor removed from role for student with baseUserId ' + studentBaseUserId);
							    	}, function(error) { response.error(error);
							    });
							  },
							  error: function(privateTutorData, error) {
							    // Execute any logic that should take place if the save fails.
							    // error is a Parse.Error with an error code and message.
							    response.error('Failed to save when removing student from students in PrivateTutorData, with error code: ' + error.message);
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
	  					response.error("Failed to fetch privateTutorData, with error code: " + error.message);
	  				}
	  			})
	  		},
	  		error: function() {
	  			response.error("Failed to fetch tutor, with error code: " + error.message);
	  		}
	  	});
	  },
	  error: function(publicTutorData, error) {
	    // The object was not retrieved successfully.
	    // error is a Parse.Error with an error code and message.
	    response.error('Failed to get PublicTutorData, with error code: ' + error.message);
	  }
	});
});