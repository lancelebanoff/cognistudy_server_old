var common = require("./common.js");

Parse.Cloud.afterSave("StudentCategoryDayStats", function(request) {
	setACLIfNew(request.object, "StudentCategoryDayStats");
});

Parse.Cloud.afterSave("StudentCategoryMonthStats", function(request) {
	setACLIfNew(request.object, "StudentCategoryMonthStats");
});

Parse.Cloud.afterSave("StudentSubjectDayStats", function(request) {
	setACLIfNew(request.object, "StudentSubjectDayStats");
});

Parse.Cloud.afterSave("StudentSubjectMonthStats", function(request) {
	setACLIfNew(request.object, "StudentSubjectMonthStats");
});

Parse.Cloud.afterSave("StudentTotalDayStats", function(request) {
	setACLIfNew(request.object, "StudentTotalDayStats");
});

Parse.Cloud.afterSave("StudentTotalMonthStats", function(request) {
	setACLIfNew(request.object, "StudentTotalMonthStats");
});

Parse.Cloud.afterSave("StudentCategoryRollingStats", function(request) {
	setACLIfNew(request.object, "StudentCategoryRollingStats");
});

Parse.Cloud.afterSave("StudentSubjectRollingStats", function(request) {
	setACLIfNew(request.object, "StudentSubjectRollingStats");
});

Parse.Cloud.afterSave("StudentTotalRollingStats", function(request) {
	setACLIfNew(request.object, "StudentTotalRollingStats");
});

function setACLIfNew(obj, className) {
	Parse.Cloud.useMasterKey();
	var isNew = common.isNewObject(obj);
	if(!isNew)
		return;
	var baseUserId = obj.get("baseUserId");
	common.setPrivateWriteTutorReadACL(obj, baseUserId).then(
		function(success) {
			console.log(className + " with objectId " + obj.id + " saved with private write / tutor read ACL");
		}, function(error) { console.error(error);
	});
}
