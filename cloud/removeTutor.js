var common = require('./common.js');

Parse.Cloud.define("removeTutor", function(request, response) {

	Parse.Cloud.useMasterKey();
	var privateStudentDataId = request.params.privateStudentDataId;
	var tutorPublicDataId = request.params.tutorPublicDataId;
	var query = new Parse.Query("PrivateStudentData");
	query.get(privateStudentDataId, {
	  success: function(privateStudentData) {
	    // The object was retrieved successfully.
		var tutorQuery = new Parse.Query("PublicUserData");
		tutorQuery.get(tutorPublicDataId, {
		  success: function(tutorPublicData) {
		    // The object was retrieved successfully.
			privateStudentData.remove("tutors", tutorPublicData);

			privateStudentData.save(null, {
			  success: function(privateStudentData) {
			    // Execute any logic that should take place after the object is saved.

			    console.log('Tutor removed from tutors in PrivateStudentData with objectId: ' + tutorPublicData.id);
			    var tutorBaseUserId = tutorPublicData.get("baseUserId");
			    var studentBaseUserId = privateStudentData.get("baseUserId");
			    common.addOrRemoveTutorFromRole(tutorBaseUserId, studentBaseUserId, false).then(
			    	function(success) {
			    		response.success('Tutor removed from role for student with baseUserId ' + studentBaseUserId);
			    	}, function(error) { response.error(error);
		    	});
			  },
			  error: function(privateStudentData, error) {
			    // Execute any logic that should take place if the save fails.
			    // error is a Parse.Error with an error code and message.
			    response.error('Failed to save when removing tutor from tutors in PrivateStudentData, with error code: ' + error.message);
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