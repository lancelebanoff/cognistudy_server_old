var common = require('./common.js');

Parse.Cloud.define("assignedQuestionsToStudent", function(request, response) {

	Parse.Cloud.useMasterKey();
	var studentPublicDataId = request.params.studentPublicDataId;
	var tutorPublicDataId = request.params.tutorPublicDataId;

	var PublicUserData = Parse.Object.extend("PublicUserData");
	var tutorPublicDataObject = new PublicUserData();
	tutorPublicDataObject.id = tutorPublicDataId;

	var query = new Parse.Query("PublicUserData")
		.include("student.privateStudentData");
	query.get(studentPublicDataId, {
	  success: function(studentPublicData) {
  		var privateStudentData = studentPublicData.get("student").get("privateStudentData");
  		var allAssignedQuestionsRelation = privateStudentData.get("assignedQuestions");

	  	// Main code
		var query = allAssignedQuestionsRelation.query();
		query.equalTo("tutor", tutorPublicDataObject).descending("createdAt").include("question")
		.include("question.questionContents").include("question.questionData").include("response");
		query.find({
		  success: function(assignedQuestions) {
		  	response.success(assignedQuestions);
		  },
		  error: function(publicTutorData, error) {
		    response.error('Failed to find assignedQuestions, with error code: ' + error.message);
		  }
		});
	  },
	  error: function(studentPublicData, error) {
	    response.error('Failed to get studentPublicData, with error code: ' + error.message);
	  }
	});
});