var common = require('./common.js');

function myContains(a, obj) {
    var i = a.length;
    while (i--) {
       if (a[i].equals(obj)) {
           return true;
       }
    }
    return false;
}

Parse.Cloud.define("tutorAlreadyRequestedStudent", function(request, response) {

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
		  	var requestsFromTutors = privateStudentData.get("requestsFromTutors");
		  	response.success(myContains(requestsFromTutors, publicTutorData));
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