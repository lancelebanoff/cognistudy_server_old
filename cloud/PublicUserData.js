var common = require("./common.js");

Parse.Cloud.beforeSave("PublicUserData", function(request, response) {
    Parse.Cloud.useMasterKey();
    var pud = request.object;

    var baseUserId = pud.get("baseUserId");
    var roleName = common.getStudentTutorRoleName(baseUserId);

    common.getStudentTutorRole(baseUserId).then(
    	function(role) {
    		if(role == undefined) {
    			createNewTutorRole(baseUserId).then(
    				function(success) {
    					console.log("StudentTutorRole created for baseUserId " + baseUserId);
    					response.success();
    				}, function(error) { response.error(error);
  				});
    		}
    		else {
    			console.log("StudentTutorRole for baseUserId " + baseUserId + " already existed");
    			response.success();
    		}
    	}, function(error) { response.error(error);
    });
});

function createNewTutorRole(baseUserId) {

    var name = common.getStudentTutorRoleName(baseUserId);
    var role = new Parse.Role(name, new Parse.ACL());
    return role.save();
}