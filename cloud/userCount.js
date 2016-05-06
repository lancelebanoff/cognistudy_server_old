var common = require("./common.js");

Parse.Cloud.beforeSave("Student", function(request, response) {
    Parse.Cloud.useMasterKey();
    var student = request.object;
    if(student.dirty("randomEnabled"))
        student.set("randomEnabledChanged", true);
    else
        student.set("randomEnabledChanged", false);

    response.success();
});

Parse.Cloud.afterSave("Student", function(request) {
    Parse.Cloud.useMasterKey();
    var student = request.object;
    var isNew = common.isNewObject(student);
    var randomEnabledChanged = student.get("randomEnabledChanged");
    if(!isNew && !randomEnabledChanged) {
        console.log("Nothing to be done");
        return;
    }
    getUserCount()
        .then(function(userCount) {
            var promises = [];
            if(isNew) {
                userCount.increment("numStudents");
                userCount.increment("totalUsers");
            }
            if(randomEnabledChanged) {
                var amount;
                if(student.get("randomEnabled"))
                    amount = 1;
                else if(!isNew)
                    amount = -1;
                else
                    amount = 0;
                userCount.increment("numStudentsRandom", amount);
            }
            student.set("randomEnabledChanged", false);
            promises.push(student.save());
            promises.push(userCount.save());
            Parse.Promise.when(promises).then(
                function(success) {
                    return;
                }, function(error) { console.log(error); }
            );
        },
        function(error) {
            console.log("Error retrieving user count");
        });    
});

Parse.Cloud.afterDelete("Student", function(request) {
    Parse.Cloud.useMasterKey();
    var student = request.object;
    getUserCount()
        .then(function(userCount) {
            userCount.increment("numStudents", -1);
            userCount.increment("totalUsers", -1);
            if(student.get("randomEnabled"))
                userCount.increment("numStudentsRandom", -1);
            userCount.save();
        },
        function(error) {
            console.log("Error retrieving user count");
        });    
});

function getUserCount() {
    Parse.Cloud.useMasterKey();
    var promise = new Parse.Promise();
    var query = new Parse.Query("UserCount");
    query.get("gmh73YNe0F", {
        success: function(object) {
            promise.resolve(object);
        },
        error: function() {
            promise.reject(Error("Error retrieving user count"));
        }
    });
    return promise;
}

