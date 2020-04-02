let danger_room = ["TmaxGroup", "티맥스A&C", "OS연구소", "기술부문", "SK본부"]
let visibility = []

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "setVisible") {
        var each_room = $(".lnbSpaceList").children(".body").children(".wsBody").children(".wsName")
        for(i = 0; i < each_room.length; i++) {
            if($(each_room[i]).text() == request.target) {
                if(request.visibility = "hide") {
                    $(each_room[i]).parent().parent().parent().hide()
                } else if(request.target_status = "show") {
                    $(each_room[i]).parent().parent().parent().show()
                }
                visibility[$(each_room[i]).text()] = request.visibility
            }
        }
    } else if (request.action == "toggle") {
        var each_room = $(".lnbSpaceList").children(".body").children(".wsBody").children(".wsName")
        for(i = 0; i < each_room.length; i++) {
            if($(each_room[i]).text() == request.target) {
                $(each_room[i]).parent().parent().parent().toggle()
                if($(each_room[i]).parent().parent().parent().is(":visible")) {
                    visibility[$(each_room[i]).text()] = "show"
                } else {
                    visibility[$(each_room[i]).text()] = "hide"
                }
                sendResponse({res : "finished", visible : visibility[$(each_room[i]).text()] });
            }
        }
    } else if(request.action == "toggleAll") {
        $(".lnbSpaceList").children(".body").children(".wsBody").children(".wsName").each(function() {
            if(danger_room.includes($(this).text())) {
                $(this).parent().parent().parent().toggle()
                if($(this).parent().parent().parent().is(":visible")) {
                    visibility[$(this).text()] = "show"
                } else {
                    visibility[$(this).text()] = "hide"
                }
            } else {
                visibility[$(this).text()] = "show"
            }
        })
        sendResponse({res : "finished" });
    } else if(request.action == "restoreVisibility") {
        $(".lnbSpaceList").children(".body").children(".wsBody").children(".wsName").each(function() {
            if(visibility[$(this).text()] == "hide") {
                $(this).parent().parent().parent().hide()
            } else {
                $(this).parent().parent().parent().show()
            }
        })
    } else if(request.action == "getRooms") {
        var ret = []
        var each_room = $(".lnbSpaceList").children(".body").children(".wsBody").children(".wsName")
        for(i = 0; i < each_room.length; i++) {
            var _name = $(each_room[i]).text()
            var _visible = "show"
            if(visibility[_name]) {
                _visible = visibility[_name]
            }
            ret[i] = {name : _name, visible : _visible}
        }
        sendResponse({res : "finished", rooms : ret });
    }
/*
    } else if(request.action == "getVisibility") {
        $(".lnbSpaceList").children(".body").children(".wsBody").children(".wsName").each(function() {
            if($(this).text() == danger_room[0]) {
                if($(this).parent().parent().parent().is(":visible")) {
                    current_visibility = "show"
                } else {
                    current_visibility = "hide"
                }
            }
        })
        sendResponse({res : "finished", visibility : current_visibility });
*/    
});

