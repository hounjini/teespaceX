
function replaceSlang() {
    var currentChat = $("#talk-footer__input").text()
    var newStr = currentChat.replace("1234", "뀨뀨")
    $("#talk-footer__input").text(newStr)
}

let visibility = []

chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.action == "toggle") {
        var each_room = $(".lnbSpaceList")
        for(i = 0; i < each_room.length; i++) {
            if($(each_room[i]).attr('id') == request.target) {
                $(each_room[i]).toggle()
                if($(each_room[i]).is(":visible")) {
                    visibility[$(each_room[i]).attr('id')] = "show"
                } else {
                    visibility[$(each_room[i]).attr('id')] = "hide"
                }
                sendResponse({res : "finished", visible : visibility[$(each_room[i]).attr('id')] });
            }
        }
    } else if(request.action == "restoreVisibility") {
        $(".lnbSpaceList").each(function() {
            if(visibility[$(this).attr('id')] == "hide") {
                $(this).hide()
            } else {
                $(this).show()
            }
        })
    } else if(request.action == "getRooms") {
        var ret = []
        var each_room = $(".lnbSpaceList").children(".body").children(".wsBody").children(".wsName")
        for(i = 0; i < each_room.length; i++) {
            var _name = $(each_room[i]).text()
            var _visible = "show"
            var _id = $(each_room[i]).parent().parent().parent().attr('id')
            if(visibility[_id]) {
                _visible = visibility[_id]
            }
            ret[i] = {name : _name, visible : _visible, id : _id}
        }
        sendResponse({res : "finished", rooms : ret });
    } else if(request.action == "enterRoom") {
        $("#talk-footer__send-button").focus(function() {
            replaceSlang()
        })
        
        $("#talk-footer__input").on("propertychange change keyup keydown paste input", function (key) {
            console.log(key)
            console.log(key.originalEvent.keyCode)
            if (key.originalEvent.keyCode == 13) {
                replaceSlang()
                return false
            }
        })
        sendResponse({res : "finished"})
    }
});

