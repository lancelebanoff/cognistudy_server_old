var common = require("./common.js");

Parse.Cloud.define("sendYourTurnNotification", function(request, response) {
	response.success("deprecated function");
});

Parse.Cloud.define("sendChallengeNotification", function(request, response) {

	Parse.Cloud.useMasterKey();

	var notificationType = request.params.notificationType;
	var senderBaseUserId = request.params.senderBaseUserId;

	var query = new Parse.Query("PublicUserData")
											.equalTo("baseUserId", senderBaseUserId);

	query.first({
		success: function(publicUserData) {

			var senderName = publicUserData.get("displayName");
			var challengeId = request.params.challengeId;
			var receiverBaseUserId = request.params.receiverBaseUserId;
			var user1Or2 = request.params.user1Or2;

			var data = {};
			if(notificationType == "CHALLENGE_REQUEST") {
				data = addChallengeRequestNotificationData(data, challengeId, user1Or2, senderName);
			}
			else if(notificationType == "YOUR_TURN") {
				data = addYourTurnNotificationData(data, challengeId, user1Or2, senderName);
				data = addChallengeInfoData(data, challengeId, user1Or2);
			}
			else if(notificationType == "GAME_OVER") {
				data = addGameOverNotificationData(data, challengeId, user1Or2, senderName);
				data = addChallengeInfoData(data, challengeId, user1Or2);
			}

			common.sendPushNotification(receiverBaseUserId, data).then(
				function(success) {
					response.success();
				}, function(error) {
					response.error(error);
				});
		}, error: function(error) { response.reject(error); }
	});
});

function addChallengeInfoData(data, challengeId, user1Or2) {
		data.challengeId = challengeId;
		data.intentExtras = {};
		data.intentExtras.CHALLENGE_ID = challengeId;
		data.intentExtras.USER1OR2 = user1Or2;
		return data;
}

function addChallengeRequestNotificationData(data, challengeId, user1Or2, senderName) {
	data.title = "New Challenge Request!";
	data.alert = senderName.toString() + " started a challenge!";
	data.ACTIVITY = "MAIN_ACTIVITY";
	data.FRAGMENT = "MAIN_FRAGMENT";

	return data;
}

function addYourTurnNotificationData(data, challengeId, user1Or2, senderName) {
	data.title = "Your turn!";
	data.alert = senderName.toString() + " finished their turn";
	data.ACTIVITY = "CHALLENGE_ACTIVITY";
	data.FRAGMENT = "MAIN_FRAGMENT";

	return data;
}

function addGameOverNotificationData(data, challengeId, user1Or2, senderName) {
	data.title = "Game Over!";
	data.alert = senderName.toString() + " has won the challenge!";
	data.ACTIVITY = "CHALLENGE_ACTIVITY";
	data.FRAGMENT = "MAIN_FRAGMENT";

	return data;
}