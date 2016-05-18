var common = require("./common.js");

Parse.Cloud.define("sendMessageNotification", function(request, response) {
	
	Parse.Cloud.useMasterKey();

	var senderBaseUserId = request.params.senderBaseUserId;
	var receiverBaseUserId = request.params.receiverBaseUserId;
	var senderName = request.params.senderName;
	var messageText = request.params.messageText;

	var receiverQuery = new Parse.Query("PublicUserData").equalTo("baseUserId", receiverBaseUserId).include("tutor.privateTutorData");
	receiverQuery.first({ useMasterKey: true,
		success: function(receiverPublicData) {
			var userType = receiverPublicData.get("userType");

			// If sent to student
			if(userType == "STUDENT") {
				var data = createStudentNotificationData(senderName, messageText, senderBaseUserId);
				common.sendPushNotification(receiverBaseUserId, data).then(
					function(success) {
						response.success();
					}, function(error) {
						response.error(error);
				});
			}
			// If sent to tutor
			else {
				var privateTutorData = receiverPublicData.get("tutor").get("privateTutorData");
				var senderQuery = new Parse.Query("PublicUserData").equalTo("baseUserId", senderBaseUserId);
				senderQuery.first({ useMasterKey: true,
					success: function(senderPublicData) {
						var notificationTutor = createTutorNotificationData(receiverPublicData, senderPublicData);

						notificationTutor.save(null, {
						  success: function(notificationTutor) {
						  	// Add to tutor's notication relation
							var notificationsRelation = privateTutorData.relation("notifications");
							notificationsRelation.add(notificationTutor);

							privateTutorData.save(null, {
							  success: function(privateTutorData) {
						    	response.success('Message notification added in PrivateTutorData with objectId: ' + privateTutorData.id);
							  },
							  error: function(privateTutorData, error) {
							    response.error('Failed to save when adding notification for message in PrivateTutorData, with error code: ' + error.message);
							  }
							});
						  },
						  error: function(notificationTutor, error) {
					    	response.error('Failed to save new NotificationTutor, with error code: ' + error.message);
						  }
						});
					}, error: function(error) { response.error("Failed to get sender PublicUserData, with error code: " + error.message); }
				});
			}
		}, error: function(error) { response.error("Failed to get receiver PublicUserData, with error code: " + error.message); }
	});

});

function createStudentNotificationData(senderName, messageText, senderBaseUserId) {
	var data = {};
	data.title = "Message from " + senderName;
	data.alert = messageText;
	data.ACTIVITY = "CHAT_ACTIVITY";
	data.FRAGMENT = "CONVERSATIONS_FRAGMENT";

	data.conversantBaseUserId = senderBaseUserId;

	data.intentExtras = {};
	data.intentExtras.BASEUSERID = senderBaseUserId;
	data.intentExtras.CONVERSANT_DISPLAY_NAME = senderName;
	data.intentExtras.PARENT_ACTIVITY = "MAIN_ACTIVITY";
	return data;
}

function createTutorNotificationData(receiverPublicData, senderPublicData) {
  	// Notification to tutor
  	var NotificationTutor = Parse.Object.extend("NotificationTutor");
	var notificationTutor = new NotificationTutor();
	notificationTutor.set("tutorFor", receiverPublicData);
	notificationTutor.set("userFrom", senderPublicData);
	notificationTutor.set("type", "MESSAGE");
	notificationTutor.set("firstSeenAt", null);
	return notificationTutor;
}
